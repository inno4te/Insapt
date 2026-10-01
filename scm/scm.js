/* ============================================================
   INSAPT SCM Portal — client logic
   Auth · barcode sequence · stock register · reports · Google sync
   Data persists in localStorage; optional live sync to Google
   Apps Script Web App (see /google-apps-script).
   ============================================================ */
(function () {
  "use strict";

  // ---- Comptes : voir accounts.js (11 comptes, mots de passe hachés). Contrôle côté client. ----
  const SESSION_KEY = "insapt.scm.session";   // contient l'identifiant connecté
  const USER_KEY = "insapt.scm.user";          // fiche du compte (lue aussi par l'ERP Achats)
  function currentAccount() {
    const v = sessionStorage.getItem(SESSION_KEY);
    if (!v) return null;
    const id = v === "1" ? "insaptscm" : v;   // compatibilité anciennes sessions
    return (window.SCM_ACCOUNTS || []).find(a => a.u === id) || null;
  }
  const DB_KEY = "insapt.scm.db";
  const SEQ_KEY = "insapt.scm.seq";
  const GS_KEY = "insapt.scm.gs";

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const money = n => (Number(n) || 0).toLocaleString("fr-FR");

  // ---------- State ----------
  let DB = load(DB_KEY, []);           // array of asset records
  let SEQ = load(SEQ_KEY, 0);          // last used sequence number
  // Default INSAPT Web App (can be overridden in Documents & liens tab).
  const GS_DEFAULT = {
    url: "https://script.google.com/macros/s/AKfycbyZr2pxJS1mBqLRQv9Oli5jbbenmD-HHj6AvL_GH49Qp1XAHimIBitIdOUUqxDFyZaKFw/exec",
    key: "INSAPT-SCM-KEY"
  };
  let GS = load(GS_KEY, GS_DEFAULT);
  if (!GS.url) GS = Object.assign({}, GS_DEFAULT, GS);
  let previewBatch = [];               // barcodes generated but not yet in table separately (they are added immediately)
  let catChart = null;

  function load(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function saveDB() { save(DB_KEY, DB); }

  function toast(msg, kind) {
    const t = $("#toast"); t.textContent = msg; t.className = "toast show " + (kind || "");
    clearTimeout(t._t); t._t = setTimeout(() => t.className = "toast", 2600);
  }

  // ---------- Auth ----------
  function showApp() {
    const acc = currentAccount();
    if (!acc) { sessionStorage.removeItem(SESSION_KEY); return; }
    sessionStorage.setItem(USER_KEY, JSON.stringify({ u: acc.u, name: acc.name, fn: acc.fn, profiles: acc.profiles, final: acc.final, admin: acc.admin }));
    if ($("#whoUser")) $("#whoUser").textContent = acc.name + " (" + acc.u + ")";
    $("#loginWrap").style.display = "none";
    $("#app").classList.add("on");
    renderAll();
    // re-apply language now that app DOM is visible
    if (window.INSAPT_LANG && window.setLang) window.setLang(window.INSAPT_LANG);
    // deep-link e.g. ?goto=code
    const goto = new URLSearchParams(location.search).get("goto");
    if (goto && document.getElementById("v-" + goto)) switchView(goto);
  }
  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem("insapt.erp.profile");
    location.reload();
  }
  if (sessionStorage.getItem(SESSION_KEY)) { document.addEventListener("DOMContentLoaded", showApp); }

  document.addEventListener("DOMContentLoaded", () => {
    // login form
    $("#loginForm").addEventListener("submit", e => {
      e.preventDefault();
      const acc = window.scmFindAccount && window.scmFindAccount($("#u").value, $("#p").value);
      if (acc) {
        sessionStorage.setItem(SESSION_KEY, acc.u);
        $("#loginErr").classList.remove("show");
        showApp();
      } else {
        $("#loginErr").classList.add("show");
        $("#p").value = ""; $("#p").focus();
      }
    });
    $("#logoutBtn").addEventListener("click", logout);

    // sidebar nav
    $$("#sideNav button").forEach(b => b.addEventListener("click", () => switchView(b.dataset.view)));

    // GS config from storage / default — prefill and verify live
    if (GS.url) {
      $("#gsUrl").value = GS.url; $("#gsKey").value = GS.key || "";
      ping().then(ok => markConn(ok));
    }

    wireBarcodes();
    wireStock();
    wireReports();
    wireDocs();

    // default acquisition date = today
    const d = $("#fDate"); if (d) d.value = new Date().toISOString().slice(0, 10);
  });

  const VIEW_TITLE = {
    dash: "scm.tab.dash", proc: "scm.tab.proc", manual: "scm.tab.manual", code: "scm.tab.code",
    barcode: "scm.tab.barcode", stock: "scm.tab.stock", reports: "scm.tab.reports", docs: "scm.tab.docs"
  };
  function switchView(v) {
    $$("#sideNav button").forEach(b => b.classList.toggle("active", b.dataset.view === v));
    $$(".view").forEach(s => s.classList.toggle("on", s.id === "v-" + v));
    const t = $("#viewTitle"); const dict = (window.INSAPT_T || {})[window.INSAPT_LANG || "fr"] || {};
    t.setAttribute("data-i18n", VIEW_TITLE[v]); t.textContent = dict[VIEW_TITLE[v]] || t.textContent;
    if (v === "dash") renderDash();
    if (v === "stock") renderStock();
    if (v === "manual") loadManual();
    if (v === "code") initCode();
    if (v === "proc") renderProcFlow();
  }

  // ---------- Barcodes ----------
  function nextCode() {
    SEQ += 1; save(SEQ_KEY, SEQ);
    const yr = new Date().getFullYear();
    return `INSAPT-${yr}-${String(SEQ).padStart(6, "0")}`;
  }
  function peekNext() {
    const yr = new Date().getFullYear();
    return `INSAPT-${yr}-${String(SEQ + 1).padStart(6, "0")}`;
  }
  function wireBarcodes() {
    $("#bcNext").textContent = peekNext();
    $("#bcGen").addEventListener("click", () => {
      const qty = Math.max(1, Math.min(200, parseInt($("#bcQty").value) || 1));
      const cat = $("#bcCat").value, donor = $("#bcDonor").value;
      const grid = $("#bcGrid");
      const batch = [];
      for (let i = 0; i < qty; i++) {
        const code = nextCode();
        const rec = {
          code, name: "", cat, donor, qty: 1, value: 0,
          loc: "Magasin central", date: new Date().toISOString().slice(0, 10),
          state: "Neuf", note: "", created: Date.now()
        };
        DB.push(rec); batch.push(rec);
      }
      saveDB();
      renderBarcodePreview(batch);
      $("#bcNext").textContent = peekNext();
      toast(`${qty} code(s) généré(s) et ajouté(s) au registre`, "ok");
      if (GS.url) batch.forEach(pushToGoogle);
    });
    $("#bcClear").addEventListener("click", () => { $("#bcGrid").innerHTML = ""; });
    $("#bcPrint").addEventListener("click", () => window.print());
  }
  function renderBarcodePreview(batch) {
    const grid = $("#bcGrid");
    batch.forEach(r => {
      const card = document.createElement("div");
      card.className = "bc-label";
      card.innerHTML = `<div class="org">INSAPT · Tchad</div><svg></svg>
        <div class="code">${r.code}</div><div class="cat">${r.cat}</div>`;
      grid.appendChild(card);
      try { JsBarcode(card.querySelector("svg"), r.code, { format: "CODE128", displayValue: false, margin: 0, height: 60 }); } catch (e) {}
    });
  }

  // ---------- Stock ----------
  function wireStock() {
    $("#stSave").addEventListener("click", saveAsset);
    $("#stReset").addEventListener("click", clearForm);
    $("#stExport").addEventListener("click", () => exportCSV(DB, "insapt-stocks"));
    $("#stSearch").addEventListener("input", renderStock);
    $("#stSync").addEventListener("click", syncAll);
  }
  function readForm() {
    return {
      code: $("#fCode").value.trim(), name: $("#fName").value.trim(),
      cat: $("#fCat").value, donor: $("#fDonor").value,
      qty: parseInt($("#fQty").value) || 0, value: parseFloat($("#fValue").value) || 0,
      loc: $("#fLoc").value, date: $("#fDate").value, state: $("#fState").value,
      note: $("#fNote").value.trim()
    };
  }
  function clearForm() {
    ["fCode", "fName", "fNote"].forEach(id => $("#" + id).value = "");
    $("#fQty").value = 1; $("#fValue").value = 0;
    $("#fDate").value = new Date().toISOString().slice(0, 10);
  }
  function saveAsset() {
    const f = readForm();
    if (!f.code) { toast("Le code-barres est requis. Générez-en un ou saisissez-le.", "err"); return; }
    if (!f.name) { toast("La désignation est requise.", "err"); return; }
    const idx = DB.findIndex(r => r.code === f.code);
    if (idx >= 0) { DB[idx] = Object.assign(DB[idx], f); toast("Article mis à jour", "ok"); }
    else { DB.push(Object.assign({ created: Date.now() }, f)); toast("Article enregistré", "ok"); }
    saveDB(); renderStock(); clearForm();
    if (GS.url) pushToGoogle(DB.find(r => r.code === f.code));
  }
  function renderStock() {
    const q = ($("#stSearch").value || "").toLowerCase();
    const rows = DB.filter(r => !q || JSON.stringify(r).toLowerCase().includes(q))
                   .sort((a, b) => (b.created || 0) - (a.created || 0));
    const head = $("#stockTbl thead"), body = $("#stockTbl tbody");
    head.innerHTML = `<tr><th>Code</th><th>Désignation</th><th>Catégorie</th><th>Bailleur</th><th>Qté</th><th>Valeur</th><th>Emplacement</th><th>Acquis</th><th>État</th><th></th></tr>`;
    if (!rows.length) { body.innerHTML = `<tr><td colspan="10"><div class="empty"><div class="big">▣</div>Aucun article. Générez des codes-barres ou saisissez un article.</div></td></tr>`; return; }
    body.innerHTML = rows.map(r => {
      const st = r.state === "À réformer" ? "low" : (r.state === "Passable" ? "warn" : "ok");
      return `<tr>
        <td class="code">${r.code}</td><td>${esc(r.name) || "<span class='muted'>—</span>"}</td>
        <td>${esc(r.cat)}</td><td>${esc(r.donor)}</td><td>${r.qty}</td>
        <td>${money(r.value)}</td><td>${esc(r.loc)}</td><td>${r.date || "—"}</td>
        <td><span class="badge ${st}">${esc(r.state)}</span></td>
        <td><button class="btn btn-ghost btn-sm" data-edit="${r.code}">Éditer</button></td>
      </tr>`;
    }).join("");
    $$("#stockTbl [data-edit]").forEach(b => b.addEventListener("click", () => loadIntoForm(b.dataset.edit)));
  }
  function loadIntoForm(code) {
    const r = DB.find(x => x.code === code); if (!r) return;
    $("#fCode").value = r.code; $("#fName").value = r.name || ""; $("#fCat").value = r.cat;
    $("#fDonor").value = r.donor; $("#fQty").value = r.qty; $("#fValue").value = r.value;
    $("#fLoc").value = r.loc; $("#fDate").value = r.date || ""; $("#fState").value = r.state;
    $("#fNote").value = r.note || "";
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast("Article chargé dans le formulaire");
  }

  // ---------- Dashboard ----------
  function renderDash() {
    $("#kAssets").textContent = DB.length;
    $("#kAssetsSub").textContent = DB.reduce((s, r) => s + (r.qty || 0), 0) + " unités";
    $("#kValue").textContent = money(DB.reduce((s, r) => s + (r.value || 0) * (r.qty || 0), 0));
    $("#kCats").textContent = new Set(DB.map(r => r.cat)).size;
    $("#kDonors").textContent = new Set(DB.map(r => r.donor)).size;

    // recent table
    const head = $("#recentTbl thead"), body = $("#recentTbl tbody");
    head.innerHTML = `<tr><th>Code</th><th>Désignation</th><th>Catégorie</th><th>Bailleur</th><th>Enregistré</th></tr>`;
    const recent = [...DB].sort((a, b) => (b.created || 0) - (a.created || 0)).slice(0, 6);
    body.innerHTML = recent.length ? recent.map(r => `<tr><td class="code">${r.code}</td><td>${esc(r.name) || "—"}</td><td>${esc(r.cat)}</td><td>${esc(r.donor)}</td><td>${new Date(r.created || Date.now()).toLocaleDateString("fr-FR")}</td></tr>`).join("")
      : `<tr><td colspan="5"><div class="empty"><div class="big">▤</div>Le registre est vide.</div></td></tr>`;

    // chart
    const cats = {}; DB.forEach(r => cats[r.cat] = (cats[r.cat] || 0) + 1);
    const labels = Object.keys(cats), data = Object.values(cats);
    if (catChart) catChart.destroy();
    if (labels.length) {
      catChart = new Chart($("#catChart"), {
        type: "bar",
        data: { labels, datasets: [{ label: "Articles", data, backgroundColor: "#052a5e", borderRadius: 6 }] },
        options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }
      });
    }
  }

  // ---------- Procedures flow ----------
  function renderProcFlow() {
    const steps = [
      ["1", "Réquisition & planification", "Expression du besoin, inscription au Plan de Passation des Marchés (PPM)."],
      ["2", "Prospection & fournisseurs", "Étude de marché, pré-qualification, règle des trois devis (hors CPA)."],
      ["3", "Mise en concurrence", "Dossier d'appel d'offres, publication, ouverture et évaluation des offres."],
      ["4", "Attribution & contrat", "Décision d'attribution, délai de recours, signature et garanties."],
      ["5", "Exécution & réception", "Suivi du contrat, inspection, réception et acceptation."],
      ["6", "Paiement & clôture", "Vérification budgétaire, facturation, paiement et archivage."]
    ];
    $("#procFlow").innerHTML = `<div class="grid-flow" style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">` +
      steps.map(s => `<div style="border:1px solid var(--line);border-radius:12px;padding:16px;background:#fff">
        <div style="width:34px;height:34px;border-radius:9px;background:var(--tchad-gold);color:var(--navy-900);display:grid;place-items:center;font:800 15px var(--ff-display);margin-bottom:10px">${s[0]}</div>
        <b style="display:block;color:var(--navy-900);margin-bottom:4px">${s[1]}</b>
        <span class="muted" style="font-size:13px">${s[2]}</span></div>`).join("") + `</div>`;
  }

  // ---------- Reports ----------
  function wireReports() {
    $("#rpRun").addEventListener("click", runReport);
    $("#rpExport").addEventListener("click", () => {
      if (!window._rpRows || !window._rpRows.length) { toast("Aucun résultat à exporter", "err"); return; }
      exportCSV(window._rpRows, "insapt-rapport");
    });
  }
  function assetAgeYears(r) {
    if (!r.date) return null;
    const d = new Date(r.date); if (isNaN(d)) return null;
    return +((Date.now() - d.getTime()) / (365.25 * 864e5)).toFixed(1);
  }
  function runReport() {
    const type = $("#rpType").value, filt = ($("#rpFilter").value || "").toLowerCase().trim();
    let rows = [], title = "Résultat", head = [];
    const num = (filt.match(/(\d+(\.\d+)?)/) || [])[1];

    if (type === "age") {
      title = "Âge des actifs (ancienneté)";
      head = ["Code", "Désignation", "Catégorie", "Acquis le", "Âge (ans)", "Bailleur"];
      rows = DB.map(r => ({ ...r, age: assetAgeYears(r) }))
        .filter(r => r.age != null)
        .filter(r => num ? r.age >= parseFloat(num) : true)
        .sort((a, b) => b.age - a.age)
        .map(r => [r.code, r.name || "—", r.cat, r.date, r.age, r.donor]);
    } else if (type === "donor") {
      title = "Actifs par bailleur / source";
      head = ["Code", "Désignation", "Catégorie", "Bailleur", "Valeur", "Emplacement"];
      rows = DB.filter(r => !filt || r.donor.toLowerCase().includes(filt))
        .sort((a, b) => a.donor.localeCompare(b.donor))
        .map(r => [r.code, r.name || "—", r.cat, r.donor, money(r.value), r.loc]);
    } else if (type === "cat") {
      title = "Actifs par catégorie";
      head = ["Catégorie", "Nombre d'articles", "Unités", "Valeur totale (XAF)"];
      const g = groupBy(DB, "cat");
      rows = Object.entries(g).filter(([k]) => !filt || k.toLowerCase().includes(filt))
        .map(([k, arr]) => [k, arr.length, sum(arr, "qty"), money(arr.reduce((s, r) => s + (r.value || 0) * (r.qty || 0), 0))]);
    } else if (type === "loc") {
      title = "Actifs par emplacement / pôle";
      head = ["Emplacement", "Nombre d'articles", "Unités", "Valeur totale (XAF)"];
      const g = groupBy(DB, "loc");
      rows = Object.entries(g).filter(([k]) => !filt || k.toLowerCase().includes(filt))
        .map(([k, arr]) => [k, arr.length, sum(arr, "qty"), money(arr.reduce((s, r) => s + (r.value || 0) * (r.qty || 0), 0))]);
    } else if (type === "value") {
      title = "Valeur d'inventaire par pôle";
      head = ["Pôle / emplacement", "Valeur totale (XAF)", "Part (%)"];
      const g = groupBy(DB, "loc");
      const tot = DB.reduce((s, r) => s + (r.value || 0) * (r.qty || 0), 0) || 1;
      rows = Object.entries(g).map(([k, arr]) => {
        const v = arr.reduce((s, r) => s + (r.value || 0) * (r.qty || 0), 0);
        return [k, money(v), ((v / tot) * 100).toFixed(1)];
      }).sort((a, b) => parseFloat(b[2]) - parseFloat(a[2]));
    } else if (type === "state") {
      title = "Actifs par état (à réformer en priorité)";
      head = ["Code", "Désignation", "État", "Âge (ans)", "Emplacement", "Bailleur"];
      const order = { "À réformer": 0, "Passable": 1, "Bon": 2, "Neuf": 3 };
      rows = DB.filter(r => !filt || r.state.toLowerCase().includes(filt))
        .sort((a, b) => (order[a.state] ?? 9) - (order[b.state] ?? 9))
        .map(r => [r.code, r.name || "—", r.state, assetAgeYears(r) ?? "—", r.loc, r.donor]);
    }

    $("#rpTitle").textContent = title;
    const th = $("#rpTbl thead"), tb = $("#rpTbl tbody");
    th.innerHTML = "<tr>" + head.map(h => `<th>${h}</th>`).join("") + "</tr>";
    tb.innerHTML = rows.length ? rows.map(r => "<tr>" + r.map((c, i) => `<td${i === 0 ? ' class="code"' : ''}>${esc(String(c))}</td>`).join("") + "</tr>").join("")
      : `<tr><td colspan="${head.length}"><div class="empty"><div class="big">◔</div>Aucun résultat pour ce rapport.</div></td></tr>`;
    // store for export (with header)
    window._rpRows = rows.length ? [head, ...rows].map(r => Object.fromEntries(r.map((v, i) => [head[i] || ("c" + i), v]))) : [];
    if (window._rpRows.length) window._rpRows.shift(); // drop the header-as-row duplicate; exportCSV builds its own header
    toast(rows.length + " ligne(s)");
  }

  // ---------- Documents / Google config ----------
  function wireDocs() {
    $("#lnkManual").addEventListener("click", e => { e.preventDefault(); switchView("manual"); });
    const lc = $("#lnkCode"); if (lc) lc.addEventListener("click", e => { e.preventDefault(); switchView("code"); });
    $("#gsSave").addEventListener("click", async () => {
      GS = { url: $("#gsUrl").value.trim(), key: $("#gsKey").value.trim() };
      save(GS_KEY, GS);
      if (!GS.url) { markConn(false); toast("Configuration effacée"); return; }
      toast("Test de connexion…");
      const ok = await ping();
      markConn(ok);
      toast(ok ? "Connexion Google active" : "Échec — vérifiez l'URL/clé", ok ? "ok" : "err");
    });
    $("#gsPull").addEventListener("click", pullFromGoogle);
  }
  function markConn(live) {
    const dot = $("#connDot"), txt = $("#connTxt");
    dot.classList.toggle("live", !!live);
    txt.textContent = live ? "Google · en ligne" : "Local";
  }

  // ---------- Google Apps Script sync ----------
  async function ping() {
    try {
      const r = await fetch(GS.url + "?action=ping&key=" + encodeURIComponent(GS.key));
      const j = await r.json(); return j && j.ok;
    } catch (e) { return false; }
  }
  async function pushToGoogle(rec) {
    if (!GS.url || !rec) return;
    try {
      await fetch(GS.url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" }, // avoids CORS preflight
        body: JSON.stringify({ action: "upsert", key: GS.key, record: rec })
      });
    } catch (e) { /* silent; local remains source of truth */ }
  }
  async function syncAll() {
    if (!GS.url) { toast("Configurez Google d'abord (onglet Documents & liens)", "err"); switchView("docs"); return; }
    toast("Synchronisation en cours…");
    let ok = 0;
    for (const r of DB) { try { await pushToGoogle(r); ok++; } catch (e) {} }
    toast(`${ok}/${DB.length} article(s) synchronisé(s)`, "ok");
  }
  async function pullFromGoogle() {
    if (!GS.url) { toast("Configurez Google d'abord", "err"); return; }
    try {
      toast("Import depuis Google Sheet…");
      const r = await fetch(GS.url + "?action=list&key=" + encodeURIComponent(GS.key));
      const j = await r.json();
      if (j && j.ok && Array.isArray(j.records)) {
        const map = {}; DB.forEach(x => map[x.code] = x);
        j.records.forEach(x => map[x.code] = Object.assign(map[x.code] || {}, x));
        DB = Object.values(map); saveDB(); renderAll();
        // realign sequence to max existing
        const maxSeq = DB.reduce((m, r) => { const n = parseInt((r.code || "").split("-").pop()); return isNaN(n) ? m : Math.max(m, n); }, SEQ);
        SEQ = maxSeq; save(SEQ_KEY, SEQ); $("#bcNext").textContent = peekNext();
        toast(`${j.records.length} article(s) importé(s)`, "ok");
      } else toast("Réponse inattendue du serveur", "err");
    } catch (e) { toast("Échec de l'import", "err"); }
  }

  // ---------- Manual loader ----------
  let manualLoaded = false;
  async function loadManual() {
    if (manualLoaded) return;
    try {
      const [b, t] = await Promise.all([
        fetch("manual-body.html").then(r => r.text()),
        fetch("manual-toc.html").then(r => r.text())
      ]);
      $("#manualBody").innerHTML = b;
      $("#manualToc").innerHTML = t;
      // intercept toc clicks to scroll within manual-body
      $$("#manualToc a").forEach(a => a.addEventListener("click", e => {
        e.preventDefault();
        const id = a.getAttribute("href").slice(1);
        const el = document.getElementById(id);
        if (el) $("#manualBody").scrollTo({ top: el.offsetTop - 10, behavior: "smooth" });
      }));
      // Version A (circuit CPA) / Version B (passation directe CPM) switch
      $$("#manualBody .mver-switch button").forEach(btn => btn.addEventListener("click", () => {
        const v = btn.dataset.ver;
        $$("#manualBody .mver-switch button").forEach(b => b.setAttribute("aria-pressed", String(b === btn)));
        $$("#manualBody .mver").forEach(d => { d.hidden = d.dataset.ver !== v; });
        $$("#manualToc li[data-ver]").forEach(li => { li.hidden = li.dataset.ver !== v; });
        $("#manualBody").scrollTo({ top: 0 });
      }));
      manualLoaded = true;
    } catch (e) {
      $("#manualBody").innerHTML = "<p class='muted'>Le manuel n'a pas pu être chargé. Vérifiez que <code>manual-body.html</code> est présent.</p>";
    }
  }

  // ---------- Code des Marchés Publics (searchable) ----------
  let codeReady = false, codeActiveChip = "";
  // live copy of articles: starts from bundled file, may be replaced by Google
  let CODE_ARTICLES = (window.CODE_MP && window.CODE_MP.articles) ? window.CODE_MP.articles.slice() : [];

  function initCode() {
    if (codeReady) {
      // still refresh from Google on re-entry if connected
      if (GS.url) loadCodeFromGoogle();
      return;
    }
    if (!CODE_ARTICLES.length && !GS.url) {
      $("#codeResults").innerHTML = "<p class='muted'>Base du Code indisponible.</p>"; return;
    }

    // popular keyword chips
    const chips = ["appel d'offres", "gré à gré", "avenant", "garantie", "seuil", "ARMP", "recours", "PPM", "délai de paiement", "corruption", "réception", "DSP"];
    $("#codeChips").innerHTML = chips.map(c =>
      `<button class="btn btn-ghost btn-sm" data-chip="${esc(c)}" style="padding:5px 11px;font-size:12px">${esc(c)}</button>`).join("");
    $$("#codeChips [data-chip]").forEach(b => b.addEventListener("click", () => {
      codeActiveChip = b.dataset.chip; $("#codeSearch").value = b.dataset.chip; runCodeSearch();
    }));

    $("#codeSearch").addEventListener("input", runCodeSearch);
    $("#codeTitre").addEventListener("change", runCodeSearch);
    const rb = $("#codeRefresh"); if (rb) rb.addEventListener("click", () => loadCodeFromGoogle(true));
    const sb = $("#codeSeed"); if (sb) sb.addEventListener("click", seedCodeToGoogle);

    codeReady = true;
    rebuildTitreFilter();
    runCodeSearch();
    // if Google is configured, pull the live copy (overrides bundled)
    if (GS.url) loadCodeFromGoogle();
  }

  function rebuildTitreFilter() {
    const sel = $("#codeTitre");
    const cur = sel.value;
    const titres = [...new Set(CODE_ARTICLES.map(a => a.titre))];
    sel.innerHTML = '<option value="">Tous les Titres</option>' +
      titres.map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join("");
    if (cur) sel.value = cur;
  }

  // Load the Code from the Google Sheet (CodeMP tab). Falls back silently.
  async function loadCodeFromGoogle(announce) {
    if (!GS.url) { if (announce) toast("Configurez Google d'abord (Documents & liens)", "err"); return; }
    try {
      const r = await fetch(GS.url + "?action=code_list&key=" + encodeURIComponent(GS.key));
      const j = await r.json();
      if (j && j.ok && Array.isArray(j.articles) && j.articles.length) {
        CODE_ARTICLES = j.articles;
        rebuildTitreFilter();
        runCodeSearch();
        if (announce) toast(`${j.articles.length} article(s) chargé(s) depuis Google`, "ok");
        markCodeSource("google", j.articles.length);
      } else {
        if (announce) toast("Sheet du Code vide — utilisez « Publier vers Google »", "warn");
        markCodeSource("local", CODE_ARTICLES.length);
      }
    } catch (e) {
      if (announce) toast("Échec du chargement depuis Google", "err");
      markCodeSource("local", CODE_ARTICLES.length);
    }
  }

  // One-time push of the bundled 69 articles into an empty CodeMP sheet.
  async function seedCodeToGoogle() {
    if (!GS.url) { toast("Configurez Google d'abord (Documents & liens)", "err"); switchView("docs"); return; }
    const src = (window.CODE_MP && window.CODE_MP.articles) || [];
    if (!src.length) { toast("Aucun article local à publier", "err"); return; }
    try {
      toast("Publication du Code vers Google…");
      const r = await fetch(GS.url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "code_seed", key: GS.key, articles: src })
      });
      const j = await r.json();
      if (j && j.ok && j.count > 0) { toast(`${j.count} article(s) publié(s) dans Google`, "ok"); loadCodeFromGoogle(true); }
      else if (j && j.ok && j.count === 0) toast("Le Sheet contient déjà des articles — rien à publier", "warn");
      else toast("Réponse inattendue du serveur", "err");
    } catch (e) { toast("Échec de la publication", "err"); }
  }

  function markCodeSource(kind, n) {
    const el = $("#codeSource"); if (!el) return;
    if (kind === "google") { el.textContent = `Source : Google Sheet · ${n} articles`; el.style.color = "var(--ok)"; }
    else { el.textContent = `Source : fichier local · ${n} articles`; el.style.color = "var(--slate)"; }
  }

  function runCodeSearch() {
    const meta = (window.CODE_MP && window.CODE_MP.meta) || { ref: "Décret N°2130/PR/2020", note: "" };
    if (!CODE_ARTICLES.length) { $("#codeResults").innerHTML = "<p class='muted'>Base du Code indisponible.</p>"; return; }
    const q = ($("#codeSearch").value || "").toLowerCase().trim();
    const titre = $("#codeTitre").value;
    const terms = q.split(/\s+/).filter(Boolean);

    const scored = CODE_ARTICLES.map(a => {
      if (titre && a.titre !== titre) return null;
      const tags = a.tags || [];
      if (!terms.length) return { a, score: 0 };
      let score = 0, all = true;
      terms.forEach(t => {
        let hit = 0;
        if (("article " + a.art).includes(t) || String(a.art) === t) hit += 5;
        if (tags.some(tag => tag.toLowerCase().includes(t))) hit += 4;
        if ((a.heading || "").toLowerCase().includes(t)) hit += 3;
        if ((a.body || "").toLowerCase().includes(t)) hit += 1;
        if (!hit) all = false; else score += hit;
      });
      return all ? { a, score } : null;
    }).filter(Boolean).sort((x, y) => y.score - x.score);

    $("#codeCount").innerHTML = `<b>${scored.length}</b> article(s) — ${esc(meta.ref)} · <span class="muted">${esc(meta.note)}</span>`;

    const hi = s => terms.length ? terms.reduce((acc, t) =>
      acc.replace(new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi"), '<mark style="background:var(--gold-soft,#fff4c9);padding:0 2px;border-radius:3px">$1</mark>'), s) : s;

    $("#codeResults").innerHTML = scored.length ? scored.map(({ a }) => `
      <article class="panel" style="margin:0">
        <div class="panel-body" style="padding:18px 20px">
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:6px">
            <span class="badge ok" style="background:var(--navy-050);color:var(--navy-800)">Article ${esc(a.art)}</span>
            <span class="muted" style="font-size:12px">${esc(a.titre)} · ${esc(a.chapitre)}</span>
          </div>
          <h3 style="font-size:16px;margin:2px 0 6px">${hi(esc(a.heading))}</h3>
          <p style="margin:0 0 10px;font-size:14.5px;color:var(--ink)">${hi(esc(a.body))}</p>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${(a.tags || []).map(t => `<span style="font-size:11px;color:var(--slate);background:var(--wash);border:1px solid var(--line);padding:3px 8px;border-radius:20px">${esc(t)}</span>`).join("")}
          </div>
        </div>
      </article>`).join("")
      : `<div class="panel" style="margin:0"><div class="empty"><div class="big">§</div>Aucun article ne correspond à « ${esc(q)} ».</div></div>`;
  }

  // ---------- Helpers ----------
  function groupBy(arr, k) { return arr.reduce((a, r) => { (a[r[k]] = a[r[k]] || []).push(r); return a; }, {}); }
  function sum(arr, k) { return arr.reduce((s, r) => s + (Number(r[k]) || 0), 0); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  function exportCSV(rows, name) {
    if (!rows || !rows.length) { toast("Rien à exporter", "err"); return; }
    const cols = Object.keys(rows[0]);
    const csv = [cols.join(",")].concat(rows.map(r => cols.map(c => {
      let v = r[c] == null ? "" : String(r[c]); if (/[",\n]/.test(v)) v = '"' + v.replace(/"/g, '""') + '"'; return v;
    }).join(","))).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name + "-" + new Date().toISOString().slice(0, 10) + ".csv";
    a.click(); URL.revokeObjectURL(a.href);
    toast("Export CSV téléchargé", "ok");
  }

  function renderAll() { renderDash(); renderStock(); $("#bcNext").textContent = peekNext(); }

})();

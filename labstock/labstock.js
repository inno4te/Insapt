/* ===========================================================
   INSAPT — LaBiEp Lab Stock
   Gestion des stocks de réactifs & consommables
   Conforme SOP R-3 (PPSO/FEFO), SOP R-2 (réception/chaîne du froid)
   Manuel de Passation des Marchés INSAPT — Ch. 11.4 / 11.6 / 11.7
   =========================================================== */
(function () {
  "use strict";

  /* ---------------- Auth ---------------- */
  /* ── Accounts ──────────────────────────────────────────────────
     SUPER-ADMIN: full access incl. user management & audit
     ADMIN:       all stock ops + reports + dashboard
     OPERATOR:    daily stock ops (recv / issue / view)
     Operator accounts are created by admins in GS (LabUsers tab).
  ──────────────────────────────────────────────────────────── */
  var BUILT_IN = [
    { user: "labiep",  pass: "lab1ep",  role: "superadmin", name: "Administrateur Système" },
    { user: "labadmin",pass: "lab4dm1n",role: "admin",      name: "Chef de Laboratoire" }
  ];
  var CURRENT_USER = null;   /* set on login: {user, role, name} */
  var LS_AUTH  = "insapt_ls_auth";
  var LS_DATA  = "insapt_ls_data";
  var LS_MOVES = "insapt_ls_moves";
  var LS_CFG   = "insapt_ls_cfg";
  var LS_QUEUE = "insapt_ls_queue";   /* offline mutation queue */

  /* ------------- Alert thresholds (SOP R-3 §4.5 / §4.2) ------------- */
  /* ============================================================
     HARDWIRED BACKEND — no user configuration required.
     URL and key are set at build time; the Settings page shows
     them read-only for reference.
  ============================================================ */
  var GS_URL = "https://script.google.com/macros/s/AKfycbyZr2pxJS1mBqLRQv9Oli5jbbenmD-HHj6AvL_GH49Qp1XAHimIBitIdOUUqxDFyZaKFw/exec";
  var GS_KEY = "INSAPT-SCM-KEY";

  var CFG_DEFAULT = {
    critDays: 30,
    warnDays: 90,
    watchDays: 365,
    lossTarget: 3,
    varTarget: 2,
    leadTime: 90,
    coverage: 60,
    gsUrl: GS_URL,    /* hardwired — always online */
    gsKey: GS_KEY
  };

  var DB = [], MOVES = [], CFG = {}, VIEW = "dash", SORT = { k: "name", d: 1 };
  var ONLINE = false;          /* true once a successful GS call returns */
  var QUEUE  = [];             /* offline mutations waiting to flush      */
  var SYNCING = false;         /* prevents re-entrant flush               */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------- Utilities ---------------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function today() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function parseD(s) {
    if (!s) return null;
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s).trim());
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]); d.setHours(0, 0, 0, 0);
    return isNaN(d) ? null : d;
  }
  function daysTo(s) {
    var d = parseD(s); if (!d) return null;
    return Math.round((d - today()) / 86400000);
  }
  function fmtD(s) {
    var d = parseD(s); if (!d) return "—";
    return String(d.getDate()).padStart(2, "0") + "/" +
           String(d.getMonth() + 1).padStart(2, "0") + "/" + d.getFullYear();
  }
  function nowISO() { return new Date().toISOString().slice(0, 10); }
  function num(v) { return (v === null || v === undefined || v === "") ? null : Number(v); }
  function qty(r) { var q = num(r.qty_remaining); return q === null ? 0 : q; }

  /* ------ Expiry banding — the core FEFO classification ------ */
  function band(r) {
    if (r.expiry_flag === "n_a") return "na";
    var d = daysTo(r.date_expiry);
    if (d === null) return "nodate";
    if (d < 0) return "exp";
    if (d <= CFG.critDays) return "d30";
    if (d <= CFG.warnDays) return "d90";
    if (d <= CFG.watchDays) return "d365";
    return "ok";
  }
  var BAND_LBL = {
    exp: "Périmé", d30: "≤ 30 j", d90: "≤ 90 j", d365: "≤ 12 mois",
    ok: "Conforme", nodate: "Date absente", na: "N/A"
  };
  function bandPill(r) {
    var b = band(r), d = daysTo(r.date_expiry), t = BAND_LBL[b];
    if (b === "exp") t = "Périmé (" + Math.abs(d) + " j)";
    else if (b === "d30" || b === "d90") t = d + " j";
    else if (b === "d365") t = Math.round(d / 30) + " mois";
    return '<span class="pill ' + b + '">' + esc(t) + "</span>";
  }

  /* ---------------- Persistence ---------------- */
  function save() {
    try {
      localStorage.setItem(LS_DATA,  JSON.stringify(DB));
      localStorage.setItem(LS_MOVES, JSON.stringify(MOVES));
      localStorage.setItem(LS_CFG,   JSON.stringify(CFG));
      localStorage.setItem(LS_QUEUE, JSON.stringify(QUEUE));
    } catch (e) { toast("Stockage local plein — exportez vos données", "err"); }
  }
  function load() {
    CFG = Object.assign({}, CFG_DEFAULT);
    try {
      var c = JSON.parse(localStorage.getItem(LS_CFG) || "null");
      if (c) Object.assign(CFG, c);
    } catch (e) {}
    try {
      var d = JSON.parse(localStorage.getItem(LS_DATA) || "null");
      DB = (d && d.length) ? d : (window.LS_SEED || []).map(function (x) { return Object.assign({}, x); });
    } catch (e) { DB = (window.LS_SEED || []).slice(); }
    try { MOVES = JSON.parse(localStorage.getItem(LS_MOVES) || "[]"); } catch (e) { MOVES = []; }
    try { QUEUE = JSON.parse(localStorage.getItem(LS_QUEUE) || "[]"); } catch (e) { QUEUE = []; }
  }
  function resetSeed() {
    if (!confirm("Réinitialiser la base à partir des fichiers sources ?\nToutes les modifications locales seront perdues.")) return;
    DB = (window.LS_SEED || []).map(function (x) { return Object.assign({}, x); });
    MOVES = []; save(); render(); toast("Base réinitialisée — " + DB.length + " lots", "ok");
  }

  function toast(msg, kind) {
    var t = $("#toast"); t.className = "toast on " + (kind || "");
    t.textContent = msg;
    clearTimeout(t._h); t._h = setTimeout(function () { t.className = "toast " + (kind || ""); }, 3400);
  }

  /* ---------------- CSV ---------------- */
  function csvCell(v) {
    var s = String(v == null ? "" : v);
    return /[",;\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function downloadCSV(name, headers, rows) {
    var lines = [headers.map(csvCell).join(";")];
    rows.forEach(function (r) { lines.push(r.map(csvCell).join(";")); });
    var blob = new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "INSAPT_LaBiEp_" + name + "_" + nowISO() + ".csv";
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
    toast("Export CSV : " + rows.length + " lignes", "ok");
  }
  var EXPORT_COLS = [
    ["name", "Désignation"], ["category", "Catégorie"], ["subcategory", "Sous-catégorie"],
    ["manufacturer", "Fabricant"], ["catalog_ref", "Réf. catalogue"], ["lot", "N° de lot"],
    ["serial", "N° de série"], ["qty_received", "Qté reçue"], ["qty_remaining", "Qté restante"],
    ["unit", "Unité"], ["date_reception", "Date réception"], ["date_manufacture", "Date fabrication"],
    ["date_expiry", "Date péremption"], ["location", "Emplacement"], ["temperature", "Température"],
    ["status", "Statut"], ["source", "Source"], ["notes", "Observations"]
  ];
  function exportRows(name, rows) {
    var hd = EXPORT_COLS.map(function (c) { return c[1]; }).concat(["Alerte péremption", "Jours restants"]);
    var data = rows.map(function (r) {
      return EXPORT_COLS.map(function (c) { return r[c[0]]; })
        .concat([BAND_LBL[band(r)], daysTo(r.date_expiry)]);
    });
    downloadCSV(name, hd, data);
  }

  /* ================= LOGIN ================= */
  function initLogin() {
    var f = $("#loginForm");
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var u = $("#lu").value.trim().toLowerCase(), p = $("#lp").value;
      /* 1. Check built-in accounts first (always available offline) */
      var bi = BUILT_IN.filter(function(a){ return a.user === u && a.pass === p; })[0];
      if (bi) {
        CURRENT_USER = bi;
        try { sessionStorage.setItem(LS_AUTH, JSON.stringify(bi)); } catch(e2) {}
        openApp();
        return;
      }
      /* 2. Try GS operator accounts */
      $("#loginErr").innerHTML = "Vérification du compte…"; $("#loginErr").classList.add("show");
      gsCallRaw("ls_auth", { user: u, pass: p })
        .then(function(j) {
          if (j && j.ok) {
            CURRENT_USER = { user: u, role: j.role || "operator", name: j.name || u };
            try { sessionStorage.setItem(LS_AUTH, JSON.stringify(CURRENT_USER)); } catch(e2) {}
            openApp();
          } else {
            showLoginErr("Identifiant ou mot de passe incorrect.");
          }
        })
        .catch(function() {
          /* GS unreachable — only built-in accounts allowed */
          showLoginErr("Identifiant incorrect ou serveur inaccessible.");
        });
    });
    /* Resume session */
    try {
      var s = sessionStorage.getItem(LS_AUTH);
      if (s) { CURRENT_USER = JSON.parse(s); if (CURRENT_USER) openApp(); }
    } catch(e) {}
  }
  function showLoginErr(msg) {
    var el = $("#loginErr"); el.innerHTML = msg; el.classList.add("show");
    $("#lp").value = ""; $("#lp").focus();
  }
  function openApp() {
    $("#login").style.display = "none";
    $("#app").classList.add("on");
    applyRole();          /* show / hide nav items based on role */
    load(); buildFilters(); render();
    autoConnect();        /* connect & pull live data immediately */
  }
  /* Show/hide nav items based on role */
  function applyRole() {
    var r = CURRENT_USER ? CURRENT_USER.role : "operator";
    var name = CURRENT_USER ? CURRENT_USER.name : "";
    /* user display */
    var ud = $("#userDisplay"); if (ud) ud.textContent = name + " (" + r + ")";
    /* super-admin only: user management, audit */
    $$(".role-super").forEach(function(el){ el.style.display = (r === "superadmin") ? "" : "none"; });
    /* admin + super: reports, analysis, settings */
    $$(".role-admin").forEach(function(el){ el.style.display = (r === "superadmin" || r === "admin") ? "" : "none"; });
  }

  /* On login: if a GS URL is configured, pull the live database
     so all admins share the same up-to-date source of truth.
     If offline, work from localStorage and queue mutations. */
  function autoConnect() {
    if (!CFG.gsUrl) { setSyncIdle("Stockage local"); return; }
    setSyncBusy("Connexion en cours…");
    gsCall("ls_list")
      .then(function (j) {
        if (!j || !j.ok || !j.records) throw new Error("Réponse inattendue");
        if (j.records.length) {
          DB = j.records; save();
          buildFilters(); render();
          toast("Base rechargée depuis Google — " + DB.length + " lots", "ok");
        }
        ONLINE = true;
        setSyncBusy("Vérification des mouvements…");
        return gsCall("ls_moves");
      })
      .then(function (jm) {
        if (jm && jm.ok && jm.moves && jm.moves.length > MOVES.length) {
          MOVES = jm.moves; save();
        }
        setSync(true, "En ligne — Google Sheets", QUEUE.length || null);
        if (QUEUE.length) flushQueue();
      })
      .catch(function (err) {
        setSync(false, "Hors ligne — stockage local");
        if (QUEUE.length) toast(QUEUE.length + " modification(s) en attente de synchronisation", "warn");
      });
  }
  function setSyncIdle(msg) {
    var dot = $("#syncDot"); if (!dot) return;
    dot.className = "sync-dot"; $("#syncTxt").textContent = msg;
  }
  function logout() {
    CURRENT_USER = null;
    try { sessionStorage.removeItem(LS_AUTH); } catch (e) {}
    location.reload();
  }

  /* ================= NAVIGATION ================= */
  function go(v) {
    VIEW = v;
    $$(".nav a").forEach(function (a) { a.classList.toggle("on", a.dataset.v === v); });
    $$(".view").forEach(function (s) { s.classList.toggle("on", s.id === "v-" + v); });
    var titles = {
      dash:     ["Tableau de bord",          "Vue d'ensemble des stocks et alertes de péremption"],
      inv:      ["Inventaire",               "Base complète des lots — recherche, ajout, modification"],
      out:      ["Sortie de stock PPSO/FEFO","Prélèvement selon le principe Premier Périmé Sorti en Premier"],
      recv:     ["Réception",               "Enregistrement d'un nouveau lot avec contrôles SOP R-2"],
      upload:   ["Importer des données",    "Import Excel ou CSV dans la base de stock"],
      rep:      ["Rapports",                "Rapports réglementaires exportables en CSV"],
      order:    ["Niveaux de commande",     "Recommandations de réapprovisionnement et points de commande"],
      ana:      ["Analyse",                 "Doublons, qualité des données et indicateurs"],
      admindash:["Tableau de bord admin",   "Surveillance complète — péremptions, conformité FEFO, inventaire"],
      users:    ["Gestion des comptes",     "Créer et gérer les comptes opérateurs du LaBiEp"],
      audit:    ["Audit & conformité FEFO", "Journal complet, analyse des pertes et conformité PPSO par agent"],
      cfg:      ["Paramètres",             "Seuils d'alerte, synchronisation et sauvegarde"]
    };
    var t = titles[v] || ["", ""];
    $("#pgTitle").innerHTML = esc(t[0]) + "<small>" + esc(t[1]) + "</small>";
    render();
    window.scrollTo(0, 0);
  }

  /* ================= DASHBOARD ================= */
  function renderDash() {
    var perish = DB.filter(function (r) { return band(r) !== "na"; });
    var g = function (b) { return DB.filter(function (r) { return band(r) === b; }); };
    var exp = g("exp"), d30 = g("d30"), d90 = g("d90"), d365 = g("d365"), nod = g("nodate");
    var zero = DB.filter(function (r) { return band(r) !== "na" && qty(r) === 0; });
    var lossRate = perish.length ? (exp.length / perish.length * 100) : 0;

    $("#kpis").innerHTML = [
      kpi("", DB.length, "Lots en base", cats().length + " catégories · " + locs().length + " emplacements"),
      kpi("crit", exp.length, "Périmés", "KPI perte " + lossRate.toFixed(1) + " % (cible < " + CFG.lossTarget + " %)"),
      kpi("danger", d30.length, "Péremption ≤ " + CFG.critDays + " j", "Alerte prioritaire — SOP R-3 §4.5"),
      kpi("warn", d90.length, "Péremption ≤ " + CFG.warnDays + " j", "Double étiquetage requis"),
      kpi("gold", d365.length, "Péremption ≤ 12 mois", "Suivi rapproché"),
      kpi("", nod.length, "Dates manquantes", "À régulariser — traçabilité SOP R-3 §4.1"),
      kpi(zero.length ? "danger" : "ok", zero.length, "Stock épuisé", "Quantité restante nulle"),
      kpi(lossRate <= CFG.lossTarget ? "ok" : "crit", lossRate.toFixed(1) + " %", "Taux de péremption", "Cible < " + CFG.lossTarget + " % — SOP R-3 §6")
    ].join("");

    // Alert lists
    $("#alertExp").innerHTML = alertTable(exp, "Aucun lot périmé.", true);
    $("#alertSoon").innerHTML = alertTable(
      d30.concat(d90).sort(function (a, b) { return (daysTo(a.date_expiry) || 0) - (daysTo(b.date_expiry) || 0); }),
      "Aucun lot proche de la péremption.", false);
    $("#nExp").textContent = exp.length;
    $("#nSoon").textContent = d30.length + d90.length;

    // Distribution bars
    $("#byCat").innerHTML = bars(countBy("category"), DB.length);
    $("#byLoc").innerHTML = bars(countBy("location").slice(0, 12), DB.length);
    $("#byBand").innerHTML = [
      barRow("Périmés", exp.length, DB.length, "crit"),
      barRow("≤ " + CFG.critDays + " jours", d30.length, DB.length, "danger"),
      barRow("≤ " + CFG.warnDays + " jours", d90.length, DB.length, "warn"),
      barRow("≤ 12 mois", d365.length, DB.length, "warn"),
      barRow("Conformes", g("ok").length, DB.length, "ok"),
      barRow("Date absente", nod.length, DB.length, ""),
      barRow("Non périssables", g("na").length, DB.length, "")
    ].join("");
  }
  function kpi(cls, n, l, s) {
    return '<div class="kpi ' + cls + '"><div class="n">' + esc(n) + '</div><div class="l">' +
      esc(l) + '</div><div class="s">' + esc(s) + "</div></div>";
  }
  function alertTable(rows, emptyMsg, isExp) {
    if (!rows.length) return '<div class="empty"><span class="ic">✓</span><b>' + esc(emptyMsg) + "</b></div>";
    var h = '<div class="tbl-scroll"><table class="tbl"><thead><tr>' +
      "<th>Désignation</th><th>Lot</th><th>Péremption</th><th>Alerte</th><th>Emplacement</th><th class='num'>Qté</th>" +
      "</tr></thead><tbody>";
    rows.slice(0, 25).forEach(function (r) {
      h += '<tr class="' + (isExp ? "row-exp" : (band(r) === "d30" ? "row-30" : "row-90")) + '">' +
        '<td class="t-name">' + esc(r.name) + '<span class="t-sub">' + esc(r.category) + " · " + esc(r.subcategory || "") + "</span></td>" +
        '<td class="mono">' + esc(r.lot || r.catalog_ref || "—") + "</td>" +
        '<td class="mono">' + fmtD(r.date_expiry) + "</td>" +
        "<td>" + bandPill(r) + "</td>" +
        "<td>" + esc(r.location) + '<span class="t-sub">' + esc(r.temperature) + "</span></td>" +
        '<td class="num">' + (qty(r) || "0") + " " + esc(r.unit || "") + "</td></tr>";
    });
    h += "</tbody></table></div>";
    if (rows.length > 25) h += '<div class="count-note">Affichage des 25 premiers sur ' + rows.length + " lots. Utilisez les rapports pour la liste complète.</div>";
    return h;
  }
  function countBy(k) {
    var m = {};
    DB.forEach(function (r) { var v = r[k] || "Non spécifié"; m[v] = (m[v] || 0) + 1; });
    return Object.keys(m).map(function (v) { return [v, m[v]]; })
      .sort(function (a, b) { return b[1] - a[1]; });
  }
  function bars(pairs, tot) {
    return pairs.map(function (p) { return barRow(p[0], p[1], tot, ""); }).join("");
  }
  function barRow(lbl, n, tot, cls) {
    var pc = tot ? (n / tot * 100) : 0;
    return '<div class="bar-row"><span class="lbl" title="' + esc(lbl) + '">' + esc(lbl) + "</span>" +
      '<span class="track"><span class="fill ' + cls + '" style="width:' + pc.toFixed(1) + '%"></span></span>' +
      '<span class="val">' + n + "</span></div>";
  }
  function cats() { return countBy("category").map(function (p) { return p[0]; }); }
  function locs() { return countBy("location").map(function (p) { return p[0]; }); }

  /* ================= INVENTORY ================= */
  function buildFilters() {
    var sel = function (id, arr, all) {
      var e = $(id); if (!e) return;
      e.innerHTML = '<option value="">' + all + "</option>" +
        arr.map(function (v) { return '<option value="' + esc(v) + '">' + esc(v) + "</option>"; }).join("");
    };
    sel("#fCat", cats(), "Toutes catégories");
    sel("#fLoc", locs(), "Tous emplacements");
    sel("#fTemp", countBy("temperature").map(function (p) { return p[0]; }), "Toutes températures");
    sel("#rCat", cats(), "—");
    sel("#rLoc", locs(), "—");
  }
  function filtered() {
    var q = ($("#fQ").value || "").toLowerCase().trim();
    var c = $("#fCat").value, l = $("#fLoc").value, t = $("#fTemp").value, b = $("#fBand").value;
    var out = DB.filter(function (r) {
      if (c && r.category !== c) return false;
      if (l && r.location !== l) return false;
      if (t && r.temperature !== t) return false;
      if (b && band(r) !== b) return false;
      if (q) {
        var hay = [r.name, r.category, r.subcategory, r.manufacturer, r.catalog_ref,
                   r.lot, r.serial, r.location, r.notes, r.source].join(" ").toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
    var k = SORT.k, d = SORT.d;
    out.sort(function (a, b2) {
      var va = a[k], vb = b2[k];
      if (k === "date_expiry") {
        var da = daysTo(a.date_expiry), db = daysTo(b2.date_expiry);
        if (da === null) return 1; if (db === null) return -1;
        return (da - db) * d;
      }
      if (k === "qty_remaining") return ((num(va) || 0) - (num(vb) || 0)) * d;
      return String(va || "").localeCompare(String(vb || ""), "fr") * d;
    });
    return out;
  }
  function renderInv() {
    var rows = filtered();
    $("#invCount").textContent = rows.length + " lot" + (rows.length > 1 ? "s" : "") +
      " sur " + DB.length + " · " + rows.reduce(function (s, r) { return s + qty(r); }, 0).toLocaleString("fr") + " unités";
    if (!rows.length) {
      $("#invBody").innerHTML = '<div class="empty"><span class="ic">🔍</span><b>Aucun lot ne correspond</b>Modifiez les filtres ou la recherche.</div>';
      return;
    }
    var cols = [
      ["name", "Désignation"], ["lot", "Lot / Réf."], ["qty_remaining", "Qté"],
      ["date_expiry", "Péremption"], [null, "Alerte"], ["location", "Emplacement"],
      ["category", "Catégorie"], ["source", "Source"], [null, ""]
    ];
    var h = '<div class="tbl-scroll"><table class="tbl"><thead><tr>';
    cols.forEach(function (c) {
      if (c[0]) {
        h += '<th class="sortable' + (SORT.k === c[0] ? " sorted" : "") + '" data-k="' + c[0] + '">' +
          esc(c[1]) + '<span class="arr">' + (SORT.k === c[0] ? (SORT.d > 0 ? "▲" : "▼") : "↕") + "</span></th>";
      } else h += "<th>" + esc(c[1]) + "</th>";
    });
    h += "</tr></thead><tbody>";
    rows.slice(0, 400).forEach(function (r) {
      var b = band(r);
      var cls = b === "exp" ? "row-exp" : b === "d30" ? "row-30" : b === "d90" ? "row-90" :
                b === "nodate" ? "row-nodate" : "";
      h += '<tr class="' + cls + '">' +
        '<td class="t-name">' + esc(r.name) + '<span class="t-sub">' + esc(r.manufacturer || r.subcategory || "") + "</span></td>" +
        '<td class="mono">' + esc(r.lot || r.catalog_ref || "—") + "</td>" +
        '<td class="num">' + (qty(r) ? qty(r).toLocaleString("fr") : '<span class="pill zero">0</span>') +
          (r.unit ? " " + esc(r.unit) : "") + "</td>" +
        '<td class="mono">' + fmtD(r.date_expiry) + "</td>" +
        "<td>" + bandPill(r) + "</td>" +
        "<td>" + esc(r.location) + '<span class="t-sub">' + esc(r.temperature) + "</span></td>" +
        "<td>" + esc(r.category) + "</td>" +
        '<td><span class="t-sub">' + esc(r.source) + "</span></td>" +
        '<td style="white-space:nowrap">' +
          '<button class="btn btn-ghost btn-xs" data-edit="' + r.id + '">Modifier</button> ' +
          '<button class="btn btn-ghost btn-xs" data-del="' + r.id + '">Suppr.</button></td></tr>';
    });
    h += "</tbody></table></div>";
    if (rows.length > 400) h += '<div class="count-note">Affichage limité à 400 lignes. Affinez la recherche ou exportez en CSV.</div>';
    $("#invBody").innerHTML = h;

    $$("#invBody th.sortable").forEach(function (th) {
      th.onclick = function () {
        var k = th.dataset.k;
        SORT = { k: k, d: SORT.k === k ? -SORT.d : 1 };
        renderInv();
      };
    });
    $$("#invBody [data-edit]").forEach(function (b2) {
      b2.onclick = function () { openEdit(b2.dataset.edit); };
    });
    $$("#invBody [data-del]").forEach(function (b2) {
      b2.onclick = function () { delLot(b2.dataset.del); };
    });
  }

  /* ------------- Add / Edit lot ------------- */
  var EDIT_ID = null;
  function openEdit(id) {
    EDIT_ID = id || null;
    var r = id ? DB.filter(function (x) { return x.id === id; })[0] : null;
    if (id && !r) return;
    $("#mTitle").textContent = id ? "Modifier le lot" : "Ajouter un lot";
    var f = ["name", "category", "subcategory", "manufacturer", "catalog_ref", "lot", "serial",
             "qty_received", "qty_remaining", "unit", "date_reception", "date_manufacture",
             "date_expiry", "location", "temperature", "source", "notes", "status", "min_level"];
    f.forEach(function (k) {
      var e = $("#e_" + k); if (!e) return;
      e.value = r ? (r[k] == null ? "" : r[k]) : "";
    });
    if (!r) { $("#e_date_reception").value = nowISO(); $("#e_status").value = "active"; }
    $("#e_srcHint").textContent = r ? ("Origine : " + (r.source || "—")) : "";
    $("#mEdit").classList.add("on");
    setTimeout(function () { $("#e_name").focus(); }, 60);
  }
  function saveEdit(e) {
    e.preventDefault();
    var get = function (k) { var el = $("#e_" + k); return el ? el.value.trim() : ""; };
    if (!get("name")) { toast("La désignation est obligatoire", "err"); return; }
    var rec = {
      name: get("name"), category: get("category") || "Non classé",
      subcategory: get("subcategory"), manufacturer: get("manufacturer"),
      catalog_ref: get("catalog_ref"), lot: get("lot"), serial: get("serial"),
      qty_received: num(get("qty_received")), qty_remaining: num(get("qty_remaining")),
      unit: get("unit") || "unité",
      date_reception: get("date_reception"), date_manufacture: get("date_manufacture"),
      date_expiry: get("date_expiry"),
      location: get("location") || "Non spécifié",
      temperature: get("temperature") || "Non spécifiée",
      source: get("source") || "Saisie manuelle", notes: get("notes"),
      status: get("status") || "active", min_level: num(get("min_level")),
      last_update: nowISO()
    };
    rec.expiry_flag = rec.date_expiry ? "ok" : (rec.category === "Équipement" ? "n_a" : "missing");
    if (EDIT_ID) {
      var i = DB.findIndex(function (x) { return x.id === EDIT_ID; });
      rec.id = EDIT_ID; DB[i] = Object.assign(DB[i], rec);
      logMove("edit", rec.id, rec.name, null, "Fiche modifiée");
    } else {
      rec.id = "M" + Date.now().toString(36).toUpperCase();
      DB.push(rec);
      logMove("in", rec.id, rec.name, rec.qty_remaining, "Réception — " + rec.source);
    }
    save(); $("#mEdit").classList.remove("on");
    buildFilters(); render();
    toast(EDIT_ID ? "Lot mis à jour" : "Lot ajouté à la base", "ok");
    pushRemote("upsert", { record: rec });
  }
  function delLot(id) {
    var r = DB.filter(function (x) { return x.id === id; })[0]; if (!r) return;
    if (!confirm("Supprimer définitivement ce lot ?\n\n" + r.name + "\nLot : " + (r.lot || "—") +
                 "\nEmplacement : " + r.location)) return;
    DB = DB.filter(function (x) { return x.id !== id; });
    logMove("del", id, r.name, qty(r), "Lot supprimé de la base");
    save(); render(); toast("Lot supprimé", "ok");
    pushRemote("del", { id: id });
  }

  /* ================= FEFO ISSUE ================= */
  function renderOut() {
    var q = ($("#oQ").value || "").toLowerCase().trim();
    if (!q) {
      $("#oResults").innerHTML = '<div class="empty"><span class="ic">📦</span><b>Recherchez un article à prélever</b>' +
        "Saisissez une désignation, un fabricant ou une référence. Le système classera les lots disponibles selon la séquence PPSO/FEFO.</div>";
      return;
    }
    var hits = DB.filter(function (r) {
      if (band(r) === "na" && r.category === "Équipement") return false;
      if (qty(r) <= 0) return false;
      var hay = [r.name, r.manufacturer, r.catalog_ref, r.lot, r.subcategory].join(" ").toLowerCase();
      return hay.indexOf(q) !== -1;
    });
    if (!hits.length) {
      $("#oResults").innerHTML = '<div class="empty"><span class="ic">🔍</span><b>Aucun lot disponible</b>' +
        "Aucun lot en stock ne correspond à « " + esc(q) + " ». Vérifiez l'orthographe ou consultez l'inventaire complet.</div>";
      return;
    }
    // FEFO ordering: nearest expiry first; no-date lots last
    hits.sort(function (a, b) {
      var da = daysTo(a.date_expiry), db = daysTo(b.date_expiry);
      if (da === null && db === null) return 0;
      if (da === null) return 1;
      if (db === null) return -1;
      return da - db;
    });
    var expired = hits.filter(function (r) { return band(r) === "exp"; });
    var h = "";
    if (expired.length) {
      h += '<div class="fefo-warn"><b>⚠ ' + expired.length + " lot(s) périmé(s) dans cette sélection</b>" +
        "Les lots périmés ne doivent pas être prélevés pour usage analytique. Mettez-les en quarantaine et établissez un Certificat de Destruction (formulaire R-3.B).</div>";
    }
    h += '<div class="fefo-list">';
    hits.slice(0, 30).forEach(function (r, i) {
      var b = band(r), d = daysTo(r.date_expiry);
      var isExp = b === "exp";
      var first = i === 0 && !isExp;
      h += '<div class="fefo-lot ' + (first ? "rank1" : "") + (isExp ? " is-exp" : "") + '">' +
        '<div class="fefo-rank">' + (i + 1) + "</div>" +
        '<div class="fefo-meta">' +
          '<div class="nm">' + esc(r.name) + "</div>" +
          '<div class="rw">' +
            "<span>Lot <b>" + esc(r.lot || r.catalog_ref || "—") + "</b></span>" +
            "<span>Disponible <b>" + qty(r).toLocaleString("fr") + " " + esc(r.unit || "") + "</b></span>" +
            (r.manufacturer ? "<span>" + esc(r.manufacturer) + "</span>" : "") +
          "</div>" +
          '<div class="fefo-loc">📍 ' + esc(r.location) +
            (r.temperature && r.temperature !== "Non spécifiée" ? " · " + esc(r.temperature) : "") + "</div>" +
        "</div>" +
        '<div class="fefo-act">' +
          (first ? '<span class="fefo-badge">PRÉLEVER EN PREMIER</span><br>' : "") +
          '<span class="exp-d">' + fmtD(r.date_expiry) + "</span>" +
          '<span class="days">' + (d === null ? "date absente" : isExp ? "périmé depuis " + Math.abs(d) + " j" : "dans " + d + " j") + "</span>" +
          '<button class="btn ' + (isExp ? "btn-danger" : first ? "btn-ok" : "btn-ghost") + ' btn-sm" data-issue="' + r.id + '">' +
            (isExp ? "Mettre au rebut" : "Prélever") + "</button>" +
        "</div></div>";
    });
    h += "</div>";
    if (hits.length > 30) h += '<div class="count-note">30 premiers lots affichés sur ' + hits.length + ".</div>";
    $("#oResults").innerHTML = h;
    $$("#oResults [data-issue]").forEach(function (b2) {
      b2.onclick = function () { openIssue(b2.dataset.issue, hits); };
    });
  }

  var ISSUE_ID = null, ISSUE_LIST = [];
  function openIssue(id, list) {
    ISSUE_ID = id; ISSUE_LIST = list || [];
    var r = DB.filter(function (x) { return x.id === id; })[0]; if (!r) return;
    var rank = ISSUE_LIST.findIndex(function (x) { return x.id === id; });
    var fefoFirst = ISSUE_LIST.filter(function (x) { return band(x) !== "exp"; })[0];
    var isDerog = fefoFirst && fefoFirst.id !== id && band(r) !== "exp";
    $("#iTitle").textContent = band(r) === "exp" ? "Mise au rebut" : "Prélèvement de stock";
    $("#iInfo").innerHTML =
      "<b>" + esc(r.name) + "</b><br>" +
      "Lot " + esc(r.lot || r.catalog_ref || "—") + " · Péremption " + fmtD(r.date_expiry) +
      " · Disponible <b>" + qty(r) + " " + esc(r.unit || "") + "</b><br>" +
      "📍 " + esc(r.location) + (r.temperature !== "Non spécifiée" ? " · " + esc(r.temperature) : "");
    $("#iQty").value = ""; $("#iQty").max = qty(r);
    $("#iWho").value = ""; $("#iWhy").value = "";
    var w = $("#iDerog");
    if (isDerog) {
      w.className = "note warn";
      w.innerHTML = "<b>Dérogation à la séquence PPSO/FEFO</b>Le lot à péremption la plus proche est <b>" +
        esc(fefoFirst.lot || fefoFirst.name) + "</b> (" + fmtD(fefoFirst.date_expiry) + ", 📍 " +
        esc(fefoFirst.location) + "). Toute dérogation doit être justifiée et documentée par le chef d'unité (SOP R-3 §4.3).";
      w.style.display = "";
      $("#iWhy").required = true;
      $("#iWhyLbl").textContent = "Justification de la dérogation PPSO (obligatoire)";
    } else if (band(r) === "exp") {
      w.className = "note danger";
      w.innerHTML = "<b>Lot périmé</b>Cette sortie sera enregistrée comme mise au rebut. Un Certificat de Destruction (R-3.B) signé doit être archivé, et l'analyse des causes profondes (R-3.D) réalisée si le seuil de perte est dépassé.";
      w.style.display = "";
      $("#iWhy").required = false;
      $("#iWhyLbl").textContent = "Motif / référence du certificat de destruction";
    } else {
      w.style.display = "none";
      $("#iWhy").required = false;
      $("#iWhyLbl").textContent = "Observation (facultatif)";
    }
    $("#mIssue").classList.add("on");
    setTimeout(function () { $("#iQty").focus(); }, 60);
  }
  function confirmIssue(e) {
    e.preventDefault();
    var r = DB.filter(function (x) { return x.id === ISSUE_ID; })[0]; if (!r) return;
    var n = Number($("#iQty").value);
    if (!n || n <= 0) { toast("Saisissez une quantité valide", "err"); return; }
    if (n > qty(r)) { toast("Quantité supérieure au stock disponible (" + qty(r) + ")", "err"); return; }
    var who = $("#iWho").value.trim(), why = $("#iWhy").value.trim();
    if ($("#iWhy").required && !why) { toast("La justification de dérogation est obligatoire", "err"); return; }
    r.qty_remaining = qty(r) - n;
    r.last_update = nowISO();
    var kind = band(r) === "exp" ? "scrap" : "out";
    var mv = { ts: new Date().toISOString(), kind: kind, id: r.id, name: r.name,
               qty: n, note: why, who: who || "", lot: r.lot || "", loc: r.location || "" };
    logMove(kind, r.id, r.name, n, why, who, r.lot, r.location);
    save(); $("#mIssue").classList.remove("on");
    render(); renderOut();
    toast((kind === "scrap" ? "Mise au rebut enregistrée : " : "Sortie enregistrée : ") +
      n + " " + (r.unit || "") + " — reste " + r.qty_remaining, "ok");
    pushRemote("upsert", { record: r });
    pushRemote("move", { move: mv });
  }
  function logMove(kind, id, name, n, note, who, lot, loc) {
    MOVES.unshift({
      ts: new Date().toISOString(), kind: kind, id: id, name: name,
      qty: n, note: note || "", who: who || "", lot: lot || "", loc: loc || ""
    });
    if (MOVES.length > 4000) MOVES.length = 4000;
  }

  /* ================= RECEPTION ================= */
  function renderRecv() {
    var e = $("#rExpiry").value;
    var w = $("#rCheck");
    if (!e) { w.style.display = "none"; return; }
    var d = daysTo(e);
    w.style.display = "";
    if (d === null) { w.style.display = "none"; return; }
    if (d < 0) {
      w.className = "note danger";
      w.innerHTML = "<b>Lot déjà périmé</b>Ne pas accepter en stock. Refuser la livraison et notifier le SPM (SOP R-2).";
    } else if (d < 365) {
      w.className = "note warn";
      w.innerHTML = "<b>Durée de péremption restante : " + Math.round(d / 30) + " mois (" + d + " jours)</b>" +
        "Inférieure au minimum de 12 mois requis à la réception. Une décision écrite du Directeur du LNSP est nécessaire : " +
        "acceptation avec plan de consommation accéléré, ou refus avec notification au SPM (SOP R-3 §4.2).";
    } else {
      w.className = "note ok";
      w.innerHTML = "<b>Durée de péremption conforme</b>" + Math.round(d / 30) +
        " mois restants — supérieure au minimum réglementaire de 12 mois.";
    }
  }
  function submitRecv(e) {
    e.preventDefault();
    var g = function (id) { var el = $(id); return el ? el.value.trim() : ""; };
    if (!g("#rName")) { toast("La désignation est obligatoire", "err"); return; }
    var rec = {
      id: "R" + Date.now().toString(36).toUpperCase(),
      name: g("#rName"), category: g("#rCatSel") || "Réactif PCR",
      subcategory: g("#rSub"), manufacturer: g("#rMan"),
      catalog_ref: g("#rRef"), lot: g("#rLot"), serial: "",
      qty_received: num(g("#rQty")), qty_remaining: num(g("#rQty")),
      unit: g("#rUnit") || "unité",
      date_reception: g("#rDate") || nowISO(),
      date_manufacture: "", date_expiry: g("#rExpiry"),
      expiry_flag: g("#rExpiry") ? "ok" : "missing",
      location: g("#rLocSel") || g("#rLocNew") || "Non spécifié",
      temperature: g("#rTemp") || "Non spécifiée",
      source: g("#rSource") || "Réception directe",
      notes: g("#rNote"), status: "active", min_level: null,
      last_update: nowISO()
    };
    var d = daysTo(rec.date_expiry);
    if (d !== null && d < 365 && d >= 0 && !$("#rApproved").checked) {
      toast("Confirmez la décision du Directeur LNSP pour un lot < 12 mois", "err"); return;
    }
    if (d !== null && d < 365 && d >= 0) {
      rec.notes = (rec.notes ? rec.notes + " | " : "") +
        "Réception < 12 mois — décision Directeur LNSP consignée le " + nowISO();
    }
    DB.push(rec);
    var inMv = { ts: new Date().toISOString(), kind: "in", id: rec.id, name: rec.name,
                 qty: rec.qty_received, note: "Réception — " + rec.source + " · PVIR",
                 who: g("#rWho"), lot: rec.lot || "", loc: rec.location || "" };
    logMove("in", rec.id, rec.name, rec.qty_received,
      "Réception — " + rec.source + " · PVIR", g("#rWho"), rec.lot, rec.location);
    save(); buildFilters(); render();
    $("#recvForm").reset(); $("#rCheck").style.display = "none";
    toast("Lot réceptionné et enregistré — " + rec.name, "ok");
    pushRemote("upsert", { record: rec });
    pushRemote("move", { move: inMv });
  }

  /* ================= REPORTS ================= */
  var REPORTS = [
    { id: "exp", n: "Lots périmés", d: "Tous les lots dont la date de péremption est dépassée. Base du Certificat de Destruction R-3.B.",
      f: function () { return DB.filter(function (r) { return band(r) === "exp"; }); } },
    { id: "d30", n: "Péremption ≤ 30 jours", d: "Alerte prioritaire SOP R-3 §4.5 — utilisation accélérée, transfert ou mise au rebut.",
      f: function () { return DB.filter(function (r) { return band(r) === "d30"; }); } },
    { id: "d90", n: "Péremption ≤ 90 jours", d: "Lots nécessitant un double étiquetage / code couleur (SOP R-3 §4.3).",
      f: function () { return DB.filter(function (r) { return ["d30", "d90"].indexOf(band(r)) >= 0; }); } },
    { id: "d365", n: "Péremption ≤ 12 mois", d: "Suivi rapproché et planification du réapprovisionnement.",
      f: function () { return DB.filter(function (r) { return ["d30", "d90", "d365"].indexOf(band(r)) >= 0; }); } },
    { id: "nodate", n: "Dates de péremption manquantes", d: "Non-conformité de traçabilité — champs obligatoires SOP R-3 §4.1.",
      f: function () { return DB.filter(function (r) { return band(r) === "nodate"; }); } },
    { id: "zero", n: "Stock épuisé", d: "Lots à quantité restante nulle — à réapprovisionner ou archiver.",
      f: function () { return DB.filter(function (r) { return band(r) !== "na" && qty(r) === 0; }); } },
    { id: "full", n: "Inventaire complet", d: "Base intégrale — support de l'inventaire physique mensuel (R-3.A).",
      f: function () { return DB.slice(); } },
    { id: "cold", n: "Stocks en chaîne du froid", d: "Lots stockés à température dirigée — surveillance quotidienne SOP R-2.",
      f: function () { return DB.filter(function (r) { return /-20|-80|\+2/.test(r.temperature || ""); }); } },
    { id: "loc", n: "Inventaire par emplacement", d: "Trié par emplacement puis par péremption — support du comptage physique.",
      f: function () {
        return DB.slice().sort(function (a, b) {
          var c = String(a.location).localeCompare(String(b.location), "fr");
          if (c) return c;
          var da = daysTo(a.date_expiry), db = daysTo(b.date_expiry);
          if (da === null) return 1; if (db === null) return -1;
          return da - db;
        });
      } }
  ];
  function renderRep() {
    var h = "";
    REPORTS.forEach(function (rp) {
      var n = rp.f().length;
      h += '<div class="card"><div class="card-h"><h3>' + esc(rp.n) +
        "<small>" + esc(rp.d) + "</small></h3>" +
        '<span class="pill ' + (n ? "info" : "ok") + '">' + n + " lot" + (n > 1 ? "s" : "") + "</span>" +
        '<button class="btn btn-ghost btn-sm" data-prev="' + rp.id + '">Aperçu</button>' +
        '<button class="btn btn-sm" data-csv="' + rp.id + '"' + (n ? "" : " disabled") + ">Exporter CSV</button></div>" +
        '<div class="card-b flush" id="prev-' + rp.id + '" style="display:none"></div></div>';
    });
    // Movement journal
    h += '<div class="card"><div class="card-h"><h3>Journal des mouvements' +
      "<small>Entrées, sorties, rebuts et modifications — traçabilité complète</small></h3>" +
      '<span class="pill info">' + MOVES.length + " mouvement" + (MOVES.length > 1 ? "s" : "") + "</span>" +
      '<button class="btn btn-ghost btn-sm" id="prevMoves">Aperçu</button>' +
      '<button class="btn btn-sm" id="csvMoves"' + (MOVES.length ? "" : " disabled") + ">Exporter CSV</button></div>" +
      '<div class="card-b flush" id="prev-moves" style="display:none"></div></div>';
    $("#repList").innerHTML = h;

    $$("#repList [data-csv]").forEach(function (b) {
      b.onclick = function () {
        var rp = REPORTS.filter(function (x) { return x.id === b.dataset.csv; })[0];
        exportRows(rp.id, rp.f());
      };
    });
    $$("#repList [data-prev]").forEach(function (b) {
      b.onclick = function () {
        var rp = REPORTS.filter(function (x) { return x.id === b.dataset.prev; })[0];
        var box = $("#prev-" + rp.id);
        if (box.style.display !== "none") { box.style.display = "none"; b.textContent = "Aperçu"; return; }
        box.innerHTML = alertTable(rp.f(), "Aucun lot dans ce rapport.", rp.id === "exp");
        box.style.display = ""; b.textContent = "Masquer";
      };
    });
    $("#csvMoves").onclick = function () {
      downloadCSV("mouvements",
        ["Horodatage", "Type", "Désignation", "Lot", "Quantité", "Emplacement", "Agent", "Observation"],
        MOVES.map(function (m) {
          var K = { in: "Entrée", out: "Sortie", scrap: "Rebut", edit: "Modification", del: "Suppression" };
          return [m.ts.replace("T", " ").slice(0, 19), K[m.kind] || m.kind, m.name, m.lot, m.qty, m.loc, m.who, m.note];
        }));
    };
    $("#prevMoves").onclick = function () {
      var box = $("#prev-moves");
      if (box.style.display !== "none") { box.style.display = "none"; $("#prevMoves").textContent = "Aperçu"; return; }
      if (!MOVES.length) {
        box.innerHTML = '<div class="empty"><span class="ic">📋</span><b>Aucun mouvement enregistré</b>Les entrées, sorties et rebuts apparaîtront ici.</div>';
      } else {
        var K = { in: "Entrée", out: "Sortie", scrap: "Rebut", edit: "Modification", del: "Suppression" };
        var P = { in: "ok", out: "info", scrap: "exp", edit: "nodate", del: "d30" };
        var t = '<div class="tbl-scroll"><table class="tbl"><thead><tr><th>Date</th><th>Type</th><th>Désignation</th><th>Lot</th><th class="num">Qté</th><th>Agent</th><th>Observation</th></tr></thead><tbody>';
        MOVES.slice(0, 100).forEach(function (m) {
          t += "<tr><td class='mono'>" + esc(m.ts.replace("T", " ").slice(0, 16)) + "</td>" +
            '<td><span class="pill ' + (P[m.kind] || "info") + '">' + esc(K[m.kind] || m.kind) + "</span></td>" +
            '<td class="t-name">' + esc(m.name) + "</td>" +
            '<td class="mono">' + esc(m.lot || "—") + "</td>" +
            '<td class="num">' + (m.qty == null ? "—" : m.qty) + "</td>" +
            "<td>" + esc(m.who || "—") + "</td><td>" + esc(m.note || "") + "</td></tr>";
        });
        t += "</tbody></table></div>";
        if (MOVES.length > 100) t += '<div class="count-note">100 mouvements les plus récents sur ' + MOVES.length + ".</div>";
        box.innerHTML = t;
      }
      box.style.display = ""; $("#prevMoves").textContent = "Masquer";
    };
  }

  /* ================= ANALYSIS ================= */
  function normName(s) {
    return String(s || "").toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ").trim();
  }
  function findDuplicates() {
    var m = {};
    DB.forEach(function (r) {
      var k = normName(r.name) + "|" + normName(r.lot || "") + "|" + normName(r.catalog_ref || "");
      (m[k] = m[k] || []).push(r);
    });
    var exact = Object.keys(m).filter(function (k) { return m[k].length > 1; })
      .map(function (k) { return { kind: "exact", rows: m[k] }; });
    // same name + same lot, different records (potential double entry)
    var n2 = {};
    DB.forEach(function (r) {
      if (!r.lot) return;
      var k = normName(r.name) + "||" + normName(r.lot);
      (n2[k] = n2[k] || []).push(r);
    });
    var byLot = Object.keys(n2).filter(function (k) { return n2[k].length > 1; })
      .map(function (k) { return { kind: "lot", rows: n2[k] }; });
    // same name across different locations (consolidation opportunity)
    var n3 = {};
    DB.forEach(function (r) { (n3[normName(r.name)] = n3[normName(r.name)] || []).push(r); });
    var spread = Object.keys(n3).filter(function (k) {
      var ls = {}; n3[k].forEach(function (r) { ls[r.location] = 1; });
      return n3[k].length > 1 && Object.keys(ls).length > 1;
    }).map(function (k) { return { kind: "spread", rows: n3[k] }; });
    var seen = {};
    var all = exact.concat(byLot).filter(function (g) {
      var key = g.rows.map(function (r) { return r.id; }).sort().join(",");
      if (seen[key]) return false; seen[key] = 1; return true;
    });
    return { dup: all, spread: spread };
  }
  function renderAna() {
    var t = $("#anaTab").dataset.t || "dup";
    $$("#anaTab button").forEach(function (b) { b.classList.toggle("on", b.dataset.t === t); });
    if (t === "dup") renderDup();
    else if (t === "order") renderOrder();
    else renderQuality();
  }
  function renderDup() {
    var d = findDuplicates();
    var h = '<div class="note"><b>Détection des doublons</b>Trois analyses : lots strictement identiques (désignation + lot + référence), ' +
      "lots partageant désignation et numéro de lot (risque de double saisie), et articles dispersés sur plusieurs emplacements (opportunité de regroupement).</div>";
    h += '<div class="card"><div class="card-h"><h3>Doublons probables<small>Même désignation et même numéro de lot</small></h3>' +
      '<span class="pill ' + (d.dup.length ? "d30" : "ok") + '">' + d.dup.length + " groupe(s)</span>" +
      '<button class="btn btn-sm" id="csvDup"' + (d.dup.length ? "" : " disabled") + '>Exporter CSV</button></div><div class="card-b">';
    if (!d.dup.length) {
      h += '<div class="empty"><span class="ic">✓</span><b>Aucun doublon détecté</b>La base ne contient pas de lots strictement identiques.</div>';
    } else {
      d.dup.slice(0, 40).forEach(function (g) {
        h += '<div class="dup-grp"><div class="dup-h">' + esc(g.rows[0].name) +
          " — " + g.rows.length + " enregistrements" +
          (g.rows[0].lot ? " · lot " + esc(g.rows[0].lot) : "") + "</div><div class='dup-b'>" +
          miniTable(g.rows) + "</div></div>";
      });
      if (d.dup.length > 40) h += '<div class="count-note">40 premiers groupes sur ' + d.dup.length + ".</div>";
    }
    h += "</div></div>";
    h += '<div class="card"><div class="card-h"><h3>Articles dispersés<small>Même désignation présente à plusieurs emplacements</small></h3>' +
      '<span class="pill info">' + d.spread.length + " article(s)</span>" +
      '<button class="btn btn-sm" id="csvSpread"' + (d.spread.length ? "" : " disabled") + '>Exporter CSV</button></div><div class="card-b">';
    if (!d.spread.length) {
      h += '<div class="empty"><span class="ic">✓</span><b>Aucune dispersion</b>Chaque article est concentré sur un emplacement.</div>';
    } else {
      d.spread.slice(0, 25).forEach(function (g) {
        var ls = {}; g.rows.forEach(function (r) { ls[r.location] = 1; });
        h += '<div class="dup-grp"><div class="dup-h" style="background:var(--info-bg);color:var(--info)">' +
          esc(g.rows[0].name) + " — " + g.rows.length + " lots sur " + Object.keys(ls).length +
          " emplacements</div><div class='dup-b'>" + miniTable(g.rows) + "</div></div>";
      });
      if (d.spread.length > 25) h += '<div class="count-note">25 premiers sur ' + d.spread.length + ".</div>";
    }
    h += "</div></div>";
    $("#anaBody").innerHTML = h;
    var dupRows = [].concat.apply([], d.dup.map(function (g) { return g.rows; }));
    var sprRows = [].concat.apply([], d.spread.map(function (g) { return g.rows; }));
    if ($("#csvDup")) $("#csvDup").onclick = function () { exportRows("doublons", dupRows); };
    if ($("#csvSpread")) $("#csvSpread").onclick = function () { exportRows("articles_disperses", sprRows); };
  }
  function miniTable(rows) {
    var h = '<div class="tbl-scroll"><table class="tbl"><thead><tr><th>Réf. interne</th><th>Lot</th><th class="num">Qté</th><th>Péremption</th><th>Emplacement</th><th>Source</th></tr></thead><tbody>';
    rows.forEach(function (r) {
      h += '<tr><td class="mono">' + esc(r.id) + "</td>" +
        '<td class="mono">' + esc(r.lot || r.catalog_ref || "—") + "</td>" +
        '<td class="num">' + qty(r) + " " + esc(r.unit || "") + "</td>" +
        '<td class="mono">' + fmtD(r.date_expiry) + " " + bandPill(r) + "</td>" +
        "<td>" + esc(r.location) + "</td><td><span class='t-sub'>" + esc(r.source) + "</span></td></tr>";
    });
    return h + "</tbody></table></div>";
  }

  /* --- Reorder advisory: ROP = CMM x lead time + safety stock --- */
  function consumptionByItem() {
    var m = {};
    MOVES.forEach(function (mv) {
      if (mv.kind !== "out") return;
      var k = normName(mv.name);
      m[k] = (m[k] || 0) + (Number(mv.qty) || 0);
    });
    return m;
  }
  function renderOrder() {
    var cons = consumptionByItem();
    var oldest = MOVES.length ? new Date(MOVES[MOVES.length - 1].ts) : null;
    var months = oldest ? Math.max(1, (Date.now() - oldest) / (30 * 86400000)) : 0;
    // aggregate stock by item
    var agg = {};
    DB.forEach(function (r) {
      if (r.category === "Équipement") return;
      var k = normName(r.name);
      if (!agg[k]) agg[k] = { name: r.name, qty: 0, unit: r.unit, locs: {}, cat: r.category, nearest: null, lots: 0 };
      agg[k].qty += qty(r); agg[k].lots++;
      agg[k].locs[r.location] = 1;
      var d = daysTo(r.date_expiry);
      if (d !== null && (agg[k].nearest === null || d < agg[k].nearest)) agg[k].nearest = d;
    });
    var rows = Object.keys(agg).map(function (k) {
      var a = agg[k];
      var used = cons[k] || 0;
      var cmm = months > 0 && used > 0 ? used / months : 0;
      var rop = cmm > 0 ? Math.ceil(cmm * (CFG.leadTime / 30) + cmm * (CFG.coverage / 30)) : null;
      var cover = cmm > 0 ? Math.round(a.qty / cmm * 30) : null;
      return {
        name: a.name, cat: a.cat, qty: a.qty, unit: a.unit, lots: a.lots,
        nloc: Object.keys(a.locs).length, cmm: cmm, rop: rop, cover: cover,
        nearest: a.nearest,
        flag: rop !== null && a.qty <= rop ? "order" : (a.qty === 0 ? "out" : "ok")
      };
    });
    rows.sort(function (a, b) {
      var o = { out: 0, order: 1, ok: 2 };
      if (o[a.flag] !== o[b.flag]) return o[a.flag] - o[b.flag];
      return (a.cover === null ? 1e9 : a.cover) - (b.cover === null ? 1e9 : b.cover);
    });
    var needOrder = rows.filter(function (r) { return r.flag !== "ok"; });

    var h = '<div class="note"><b>Méthode de calcul du point de commande</b>' +
      "Point de commande = CMM × délai d'approvisionnement + stock de sécurité, où CMM est la consommation mensuelle moyenne " +
      "calculée à partir du journal des sorties. Paramètres actuels : délai <b>" + CFG.leadTime + " jours</b>, couverture de sécurité <b>" +
      CFG.coverage + " jours</b> (modifiables dans Paramètres).</div>";
    if (!MOVES.filter(function (m2) { return m2.kind === "out"; }).length) {
      h += '<div class="note warn"><b>Historique de consommation insuffisant</b>' +
        "Aucune sortie n'a encore été enregistrée. Le point de commande ne peut pas être calculé tant que la plateforme n'a pas accumulé " +
        "d'historique de prélèvements. Enregistrez les sorties via l'onglet <b>Sortie de stock</b> — les recommandations apparaîtront automatiquement. " +
        "En attendant, le tableau ci-dessous présente les niveaux de stock agrégés et les articles épuisés.</div>";
    }
    h += '<div class="card"><div class="card-h"><h3>Niveaux de stock et recommandations de commande' +
      "<small>Agrégation par article, tous lots confondus</small></h3>" +
      '<span class="pill ' + (needOrder.length ? "d30" : "ok") + '">' + needOrder.length + " à commander</span>" +
      '<button class="btn btn-sm" id="csvOrder">Exporter CSV</button></div><div class="card-b flush">' +
      '<div class="tbl-scroll"><table class="tbl"><thead><tr><th>Article</th><th>Catégorie</th>' +
      '<th class="num">Stock</th><th class="num">Lots</th><th class="num">CMM</th>' +
      '<th class="num">Point cde</th><th class="num">Couverture</th><th>Statut</th></tr></thead><tbody>';
    rows.slice(0, 300).forEach(function (r) {
      var pill = r.flag === "out" ? '<span class="pill exp">Épuisé</span>' :
                 r.flag === "order" ? '<span class="pill d30">À commander</span>' :
                 '<span class="pill ok">Suffisant</span>';
      h += "<tr" + (r.flag === "out" ? ' class="row-exp"' : r.flag === "order" ? ' class="row-30"' : "") + ">" +
        '<td class="t-name">' + esc(r.name) + (r.nloc > 1 ? '<span class="t-sub">' + r.nloc + " emplacements</span>" : "") + "</td>" +
        "<td>" + esc(r.cat) + "</td>" +
        '<td class="num">' + r.qty.toLocaleString("fr") + " " + esc(r.unit || "") + "</td>" +
        '<td class="num">' + r.lots + "</td>" +
        '<td class="num">' + (r.cmm ? r.cmm.toFixed(1) : "—") + "</td>" +
        '<td class="num">' + (r.rop === null ? "—" : r.rop) + "</td>" +
        '<td class="num">' + (r.cover === null ? "—" : r.cover + " j") + "</td>" +
        "<td>" + pill + "</td></tr>";
    });
    h += "</tbody></table></div>";
    if (rows.length > 300) h += '<div class="count-note">300 premiers articles sur ' + rows.length + ".</div>";
    h += "</div></div>";
    $("#anaBody").innerHTML = h;
    $("#csvOrder").onclick = function () {
      downloadCSV("niveaux_commande",
        ["Article", "Catégorie", "Stock total", "Unité", "Nb lots", "Nb emplacements",
         "CMM", "Point de commande", "Couverture (jours)", "Statut"],
        rows.map(function (r) {
          return [r.name, r.cat, r.qty, r.unit, r.lots, r.nloc,
                  r.cmm ? r.cmm.toFixed(2) : "", r.rop === null ? "" : r.rop,
                  r.cover === null ? "" : r.cover,
                  r.flag === "out" ? "Épuisé" : r.flag === "order" ? "À commander" : "Suffisant"];
        }));
    };
  }
  function renderQuality() {
    var perish = DB.filter(function (r) { return band(r) !== "na"; });
    var issues = [
      { n: "Date de péremption absente", d: "Champ obligatoire pour tout réactif ou consommable (SOP R-3 §4.1).",
        rows: perish.filter(function (r) { return !r.date_expiry; }) },
      { n: "Numéro de lot absent", d: "Identifiant unique fabricant — indispensable à la traçabilité par lot.",
        rows: perish.filter(function (r) { return !r.lot && !r.catalog_ref; }) },
      { n: "Date de réception absente", d: "Date d'entrée en stock après PVIR.",
        rows: DB.filter(function (r) { return !r.date_reception; }) },
      { n: "Emplacement non spécifié", d: "Empêche le prélèvement PPSO et le comptage physique.",
        rows: DB.filter(function (r) { return !r.location || r.location === "Non spécifié"; }) },
      { n: "Température de conservation non spécifiée", d: "Requis pour la surveillance de la chaîne du froid (SOP R-2).",
        rows: perish.filter(function (r) { return !r.temperature || r.temperature === "Non spécifiée"; }) },
      { n: "Quantité restante non renseignée", d: "Solde théorique impossible à réconcilier lors de l'inventaire.",
        rows: DB.filter(function (r) { return r.qty_remaining === null || r.qty_remaining === undefined || r.qty_remaining === ""; }) },
      { n: "Date de péremption ambiguë à l'import", d: "Cellule source contenant plusieurs dates — la plus proche a été retenue par prudence.",
        rows: DB.filter(function (r) { return r.expiry_flag === "ambiguous"; }) },
      { n: "Date de péremption illisible à l'import", d: "Format source non interprétable — ressaisie manuelle nécessaire.",
        rows: DB.filter(function (r) { return r.expiry_flag === "invalid"; }) }
    ];
    var totalIssues = issues.reduce(function (s, i) { return s + i.rows.length; }, 0);
    var score = DB.length ? Math.max(0, 100 - (totalIssues / (DB.length * issues.length) * 100 * issues.length)) : 100;

    var h = '<div class="note"><b>Qualité des données</b>' +
      "Contrôles dérivés des champs obligatoires de la SOP R-3 §4.1. Chaque anomalie est exportable pour régularisation par le Gestionnaire de Stock.</div>";
    h += '<div class="kpis">' +
      kpi(score > 80 ? "ok" : score > 55 ? "warn" : "crit", Math.round(score) + " %", "Score de complétude", "Champs obligatoires renseignés") +
      kpi("", DB.length, "Lots contrôlés", issues.length + " points de contrôle") +
      kpi(totalIssues ? "warn" : "ok", totalIssues, "Anomalies détectées", "Toutes catégories confondues") +
      "</div>";
    issues.forEach(function (it, i) {
      h += '<div class="card"><div class="card-h"><h3>' + esc(it.n) + "<small>" + esc(it.d) + "</small></h3>" +
        '<span class="pill ' + (it.rows.length ? "d90" : "ok") + '">' + it.rows.length + "</span>" +
        '<button class="btn btn-ghost btn-sm" data-q="' + i + '">Aperçu</button>' +
        '<button class="btn btn-sm" data-qc="' + i + '"' + (it.rows.length ? "" : " disabled") + ">Exporter CSV</button></div>" +
        '<div class="card-b flush" id="q-' + i + '" style="display:none"></div></div>';
    });
    $("#anaBody").innerHTML = h;
    $$("#anaBody [data-qc]").forEach(function (b) {
      b.onclick = function () {
        var it = issues[+b.dataset.qc];
        exportRows("qualite_" + normName(it.n).replace(/ /g, "_"), it.rows);
      };
    });
    $$("#anaBody [data-q]").forEach(function (b) {
      b.onclick = function () {
        var i = +b.dataset.q, box = $("#q-" + i);
        if (box.style.display !== "none") { box.style.display = "none"; b.textContent = "Aperçu"; return; }
        box.innerHTML = issues[i].rows.length ? miniTable(issues[i].rows.slice(0, 50)) :
          '<div class="empty"><span class="ic">✓</span><b>Aucune anomalie</b></div>';
        if (issues[i].rows.length > 50) box.innerHTML += '<div class="count-note">50 premiers sur ' + issues[i].rows.length + ".</div>";
        box.style.display = ""; b.textContent = "Masquer";
      };
    });
  }

  /* ================= SETTINGS / SYNC ================= */
  function renderCfg() {
    ["critDays", "warnDays", "watchDays", "lossTarget", "varTarget", "leadTime", "coverage", "gsUrl", "gsKey"]
      .forEach(function (k) { var e = $("#c_" + k); if (e) e.value = CFG[k]; });
    $("#cfgStats").innerHTML =
      "<b>" + DB.length + "</b> lots · <b>" + MOVES.length + "</b> mouvements · " +
      "Source initiale : " + (window.LS_SEED_META ? window.LS_SEED_META.count : 0) + " lots importés des fichiers LaBiEp" +
      (QUEUE.length ? " · <b style='color:var(--warn)'>" + QUEUE.length + " opération(s) en attente</b>" : "");
  }
  function saveCfg(e) {
    e.preventDefault();
    ["critDays", "warnDays", "watchDays", "lossTarget", "varTarget", "leadTime", "coverage"]
      .forEach(function (k) { CFG[k] = Number($("#c_" + k).value) || CFG_DEFAULT[k]; });
    CFG.gsUrl = $("#c_gsUrl").value.trim();
    CFG.gsKey = $("#c_gsKey").value.trim() || CFG_DEFAULT.gsKey;
    QUEUE = [];  /* clear any stale queue against a new URL */
    save(); render(); toast("Paramètres enregistrés", "ok");
    autoConnect();
  }
  /* -------- Offline queue --------
     Every mutation that needs to reach GS is routed through pushRemote().
     If online, the call fires immediately.  If offline, the mutation is
     stored in QUEUE and replayed in order when the connection returns.
     Format: { action, payload, ts }   action in {upsert,del,move}       */
  function pushRemote(action, payload) {
    if (ONLINE && CFG.gsUrl) {
      var gsAction = action === "upsert" ? "ls_upsert" :
                     action === "del"    ? "ls_delete" : "ls_move";
      setSyncBusy("Synchronisation…");
      gsCall(gsAction, payload)
        .then(function (j) {
          if (!j || !j.ok) throw new Error("Erreur serveur");
          setSync(true, "Synchronisé — " + new Date().toLocaleTimeString("fr"));
        })
        .catch(function (err) {
          /* Connection dropped mid-session — queue for later */
          ONLINE = false;
          setSync(false, "Hors ligne — modification en attente");
          QUEUE.push({ action: action, payload: payload, ts: new Date().toISOString() });
          save();
        });
    } else {
      QUEUE.push({ action: action, payload: payload, ts: new Date().toISOString() });
      save();
      var cnt = QUEUE.length;
      setSyncIdle("Hors ligne · " + cnt + " en attente");
    }
  }

  /* Replay queued mutations in the order they were created. */
  function flushQueue() {
    if (SYNCING || !QUEUE.length || !CFG.gsUrl) return;
    SYNCING = true;
    setSyncBusy("Synchronisation (" + QUEUE.length + " opérations)…");
    var remaining = QUEUE.slice();
    QUEUE = []; save();

    function next(i) {
      if (i >= remaining.length) {
        SYNCING = false;
        setSync(true, "Synchronisé — " + new Date().toLocaleTimeString("fr"));
        toast("Synchronisation complète — " + remaining.length + " opération(s)", "ok");
        return;
      }
      var m = remaining[i];
      var gsAction = m.action === "upsert" ? "ls_upsert" :
                     m.action === "del"    ? "ls_delete" : "ls_move";
      gsCall(gsAction, m.payload)
        .then(function (j) {
          if (!j || !j.ok) throw new Error("err");
          next(i + 1);
        })
        .catch(function () {
          /* Put back unprocessed items and bail */
          QUEUE = remaining.slice(i).concat(QUEUE);
          save(); SYNCING = false;
          setSync(false, "Erreur de synchronisation · " + QUEUE.length + " en attente");
        });
    }
    next(0);
  }

  /* Raw GS call used during login (before CFG is loaded) */
  function gsCallRaw(action, payload) {
    return fetch(GS_URL, {
      method: "POST", redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(Object.assign({ action: action, key: GS_KEY }, payload || {}))
    }).then(function(r){ return r.json(); });
  }
  function gsCall(action, payload) {
    if (!CFG.gsUrl) return Promise.reject(new Error("URL Google Apps Script non configurée"));
    var url = CFG.gsUrl;
    if (payload) {
      return fetch(url, {
        method: "POST", redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(Object.assign({ action: action, key: CFG.gsKey }, payload))
      }).then(function (r) { return r.json(); });
    }
    return fetch(url + "?action=" + encodeURIComponent(action) + "&key=" + encodeURIComponent(CFG.gsKey))
      .then(function (r) { return r.json(); });
  }
  function syncPush() {
    /* Manual full-replace — useful after an import or reset.
       Normal usage: individual changes sync automatically via pushRemote(). */
    var b = $("#btnPush"); b.disabled = true; b.textContent = "Envoi complet…";
    gsCall("ls_seed", { records: DB })
      .then(function (j) {
        if (!j.ok) throw new Error(j.error || "Erreur serveur");
        setSync(true, "Base envoyée vers Google Sheets — " + j.count + " lots");
        toast("Publié vers Google : " + j.count + " lots", "ok");
      })
      .catch(function (e) { setSync(false, e.message); toast("Échec de l'envoi : " + e.message, "err"); })
      .then(function () { b.disabled = false; b.textContent = "Publier vers Google"; });
  }
  function syncPull() {
    var b = $("#btnPull"); b.disabled = true; b.textContent = "Chargement…";
    gsCall("ls_list")
      .then(function (j) {
        if (!j.ok) throw new Error(j.error || "Erreur serveur");
        if (!j.records || !j.records.length) throw new Error("La feuille Google est vide — publiez d'abord la base");
        DB = j.records; save(); buildFilters(); render();
        setSync(true, "En ligne — Google Sheets");
        toast("Base rechargée : " + DB.length + " lots", "ok");
      })
      .catch(function (e) { setSync(false, e.message); toast("Échec du chargement : " + e.message, "err"); })
      .then(function () { b.disabled = false; b.textContent = "Recharger depuis Google"; });
  }
  function syncTest() {
    var b = $("#btnTest"); b.disabled = true; b.textContent = "Test…";
    gsCall("ping")
      .then(function (j) {
        if (!j.ok) throw new Error("Réponse inattendue");
        setSync(true, "En ligne — Google Sheets");
        toast("Connexion Google Apps Script établie", "ok");
      })
      .catch(function (e) { setSync(false, e.message); toast("Échec : " + e.message, "err"); })
      .then(function () { b.disabled = false; b.textContent = "Tester la connexion"; });
  }
  function setSync(ok, msg, pending) {
    ONLINE = !!ok;
    var dot = $("#syncDot"); if (!dot) return;
    dot.className = "sync-dot " + (ok ? "ok" : "err");
    var label = msg || (ok ? "En ligne — Google Sheets" : "Hors ligne — stockage local");
    if (pending) label += " · " + pending + " en attente";
    $("#syncTxt").textContent = label;
    var e = $("#cfgSyncMsg");
    if (e) { e.className = "note " + (ok ? "ok" : "danger"); e.innerHTML = "<b>" + (ok ? "Succès" : "Échec") + "</b>" + esc(msg); e.style.display = ""; }
    if (ok && QUEUE.length) flushQueue();
  }
  function setSyncBusy(msg) {
    var dot = $("#syncDot"); if (!dot) return;
    dot.className = "sync-dot"; $("#syncTxt").textContent = msg || "Synchronisation…";
  }
  function exportBackup() {
    var blob = new Blob([JSON.stringify({ db: DB, moves: MOVES, cfg: CFG, at: new Date().toISOString() }, null, 1)],
      { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "INSAPT_LaBiEp_sauvegarde_" + nowISO() + ".json";
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
    toast("Sauvegarde JSON téléchargée", "ok");
  }
  function importBackup(ev) {
    var f = ev.target.files[0]; if (!f) return;
    var fr = new FileReader();
    fr.onload = function () {
      try {
        var j = JSON.parse(fr.result);
        if (!j.db || !j.db.length) throw new Error("Fichier invalide");
        if (!confirm("Restaurer " + j.db.length + " lots ? La base actuelle sera remplacée.")) return;
        DB = j.db; MOVES = j.moves || []; if (j.cfg) Object.assign(CFG, j.cfg);
        save(); buildFilters(); render();
        toast("Sauvegarde restaurée — " + DB.length + " lots", "ok");
      } catch (e) { toast("Échec de la restauration : " + e.message, "err"); }
      ev.target.value = "";
    };
    fr.readAsText(f);
  }

  /* ================= RENDER DISPATCH ================= */
  function render() {
    var exp = DB.filter(function (r) { return band(r) === "exp"; }).length;
    var soon = DB.filter(function (r) { return ["d30", "d90"].indexOf(band(r)) >= 0; }).length;
    var bd = $("#navBadgeDash"), bo = $("#navBadgeOut");
    if (bd) { bd.textContent = exp + soon; bd.style.display = (exp + soon) ? "" : "none"; }
    if (bo) { bo.textContent = exp; bo.style.display = exp ? "" : "none"; }
    if (VIEW === "dash")   renderDash();
    else if (VIEW === "inv")   renderInv();
    else if (VIEW === "out")   renderOut();
    else if (VIEW === "recv")  {}             /* handled by form events */
    else if (VIEW === "rep")   renderRep();
    else if (VIEW === "ana")   renderAna();
    else if (VIEW === "upload") renderUpload();
    else if (VIEW === "order")  renderOrderReport();
    else if (VIEW === "admindash") renderAdminDash();
    else if (VIEW === "users")    renderUsers();
    else if (VIEW === "audit")    renderAudit();
    else if (VIEW === "cfg")   renderCfg();
  }
  var VIEWS_ADMIN = ["rep","ana","order","admindash","users","audit","upload","cfg"];
  var VIEWS_SUPER = ["users","audit","admindash"];

  /* ================= WIRE UP ================= */
  document.addEventListener("DOMContentLoaded", function () {
    initLogin();
    $$(".nav a").forEach(function (a) { a.onclick = function (e) { e.preventDefault(); go(a.dataset.v); }; });
    $("#btnLogout").onclick = logout;
    $("#btnMasterXLSX").onclick = downloadMasterXLSX;
    ["#fQ", "#fCat", "#fLoc", "#fTemp", "#fBand"].forEach(function (s) {
      var e = $(s); if (e) e.addEventListener(e.tagName === "INPUT" ? "input" : "change", renderInv);
    });
    $("#fClear").onclick = function () {
      ["#fQ", "#fCat", "#fLoc", "#fTemp", "#fBand"].forEach(function (s) { $(s).value = ""; });
      renderInv();
    };
    $("#btnAdd").onclick = function () { openEdit(null); };
    $("#btnExportInv").onclick = function () { exportRows("inventaire_filtre", filtered()); };
    $("#editForm").onsubmit = saveEdit;
    $("#oQ").addEventListener("input", renderOut);
    $("#issueForm").onsubmit = confirmIssue;
    $("#rExpiry").addEventListener("change", renderRecv);
    $("#recvForm").onsubmit = submitRecv;
    $("#cfgForm").onsubmit = saveCfg;
    $("#btnTest").onclick = syncTest;
    $("#btnPush").onclick = syncPush;
    $("#btnPull").onclick = syncPull;
    $("#btnBackup").onclick = exportBackup;
    $("#fileRestore").addEventListener("change", importBackup);
    $("#btnReset").onclick = resetSeed;
    $$("#anaTab button").forEach(function (b) {
      b.onclick = function () { $("#anaTab").dataset.t = b.dataset.t; renderAna(); };
    });
    $$("[data-close]").forEach(function (b) {
      b.onclick = function () { b.closest(".modal").classList.remove("on"); };
    });
    $$(".modal").forEach(function (m) {
      m.onclick = function (e) { if (e.target === m) m.classList.remove("on"); };
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") $$(".modal.on").forEach(function (m) { m.classList.remove("on"); });
    });
  });


  /* ================================================================
     FEATURE BLOCK 2 — Added features
     1. Excel / CSV upload
     2. Color-coded Excel master download (SheetJS)
     3. Order level report
     4. FEFO pick form → PDF slip (jsPDF, no expired)
     5. Super-admin dashboard
     6. User management
     7. FEFO compliance audit
  ================================================================ */

  /* ──────────────────────────────────────────────────────────────
     1. UPLOAD (Excel / CSV)
  ────────────────────────────────────────────────────────────── */
  var UPLOAD_PREVIEW = [];
  function renderUpload() {
    var h = '<div class="note"><b>Import Excel ou CSV</b>' +
      'Les colonnes sont détectées automatiquement. Colonnes reconnues : ' +
      'Désignation / Description, Fabricant / Manufacturer, Réf. catalogue / Reference, ' +
      'N° de lot / Lot, Qté reçue, Qté restante, Unité, Date réception, Date péremption, ' +
      'Emplacement, Température, Catégorie, Notes/Remarques. ' +
      'Les colonnes non reconnues sont ignorées. Les lots existants avec le même numéro de lot ET la même désignation sont mis à jour.</div>';
    h += '<div class="card"><div class="card-h"><h3>Choisir le fichier</h3></div><div class="card-b">' +
      '<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">' +
      '<label class="btn btn-ghost" style="cursor:pointer">📂 Parcourir<input id="uploadFile" type="file" accept=".xlsx,.xls,.csv" style="display:none"></label>' +
      '<span id="uploadName" style="color:var(--slate);font-size:13px">Aucun fichier sélectionné</span></div>' +
      '<div id="uploadPreview" style="margin-top:16px"></div></div></div>';
    $("#v-upload").innerHTML = h;
    $("#uploadFile").addEventListener("change", handleUploadFile);
  }
  function handleUploadFile(ev) {
    var f = ev.target.files[0]; if (!f) return;
    $("#uploadName").textContent = f.name;
    var ext = f.name.split(".").pop().toLowerCase();
    var reader = new FileReader();
    if (ext === "csv") {
      reader.onload = function(e) { parseCSVUpload(e.target.result); };
      reader.readAsText(f, "utf-8");
    } else {
      reader.onload = function(e) { parseXLSXUpload(e.target.result); };
      reader.readAsArrayBuffer(f);
    }
  }
  function parseXLSXUpload(ab) {
    if (!window.XLSX) { toast("Chargement de la bibliothèque Excel…",""); loadXLSX(function(){ parseXLSXUpload(ab); }); return; }
    try {
      var wb = window.XLSX.read(ab, { type:"array", cellDates:true });
      var ws = wb.Sheets[wb.SheetNames[0]];
      var rows = window.XLSX.utils.sheet_to_json(ws, { raw:false, defval:"" });
      showUploadPreview(rows);
    } catch(e) { toast("Erreur de lecture : " + e.message, "err"); }
  }
  function parseCSVUpload(text) {
    var lines = text.replace(/\r/g,"").split("\n").filter(Boolean);
    if (!lines.length) return;
    var sep = lines[0].includes(";") ? ";" : ",";
    var hdr = lines[0].split(sep).map(function(h){ return h.replace(/^"|"$/g,"").trim(); });
    var rows = lines.slice(1).map(function(l){
      var o = {}, vals = l.split(sep).map(function(v){ return v.replace(/^"|"$/g,"").trim(); });
      hdr.forEach(function(k,i){ o[k] = vals[i] || ""; });
      return o;
    });
    showUploadPreview(rows);
  }
  var COL_MAP = {
    "désignation":"name","designation":"name","description":"name","article":"name","reagent":"name",
    "fabricant":"manufacturer","manufacturer":"manufacturer","marque":"manufacturer",
    "réf. catalogue":"catalog_ref","reference":"catalog_ref","ref catalogue":"catalog_ref","article number":"catalog_ref","catalog_ref":"catalog_ref",
    "n° de lot":"lot","lot number":"lot","lot":"lot","batch":"lot",
    "qté reçue":"qty_received","quantite recue":"qty_received","qty received":"qty_received","qty recu":"qty_received",
    "qté restante":"qty_remaining","quantite restante":"qty_remaining","qty remaining":"qty_remaining","stock amount":"qty_remaining",
    "unité":"unit","unit":"unit","unité de mesure":"unit",
    "date réception":"date_reception","date reception":"date_reception","date de reception":"date_reception",
    "date péremption":"date_expiry","date expiry":"date_expiry","expiration":"date_expiry","date de expiration":"date_expiry","expiry date":"date_expiry",
    "date fabrication":"date_manufacture","manufacture date":"date_manufacture",
    "emplacement":"location","location":"location","storage place":"location","salle":"location",
    "température":"temperature","temperature":"temperature","temp":"temperature",
    "catégorie":"category","category":"category","type":"category",
    "sous-catégorie":"subcategory","subcategory":"subcategory",
    "source":"source","notes":"notes","remarques":"notes","observations":"notes","remark":"notes",
    "statut":"status","status":"status"
  };
  function normalH(h) {
    return h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
  }
  function mapRow(raw) {
    var out = { category:"Import", subcategory:"", manufacturer:"", catalog_ref:"", lot:"",
                qty_received:null, qty_remaining:null, unit:"unité", date_reception:"",
                date_expiry:"", date_manufacture:"", location:"Non spécifié",
                temperature:"Non spécifiée", source:"Import fichier", notes:"", status:"active" };
    Object.keys(raw).forEach(function(k) {
      var mapped = COL_MAP[normalH(k)];
      if (mapped && raw[k]) out[mapped] = raw[k];
    });
    out.name = out.name || ""; 
    ["qty_received","qty_remaining"].forEach(function(k){
      if (out[k] !== null && out[k] !== "") out[k] = Number(String(out[k]).replace(",",".")) || null;
    });
    // fix dates
    ["date_reception","date_expiry","date_manufacture"].forEach(function(k){
      if (out[k]) { var d = parseD(out[k]); out[k] = d ? d.toISOString().slice(0,10) : ""; }
    });
    out.expiry_flag = out.date_expiry ? "ok" : (out.category === "Équipement" ? "n_a" : "missing");
    return out;
  }
  function showUploadPreview(rows) {
    UPLOAD_PREVIEW = rows.map(mapRow).filter(function(r){ return r.name && r.name.length > 1; });
    if (!UPLOAD_PREVIEW.length) {
      $("#uploadPreview").innerHTML = '<div class="note danger"><b>Aucune ligne reconnue</b>Vérifiez que la première ligne contient des en-têtes.</div>';
      return;
    }
    var new_ = 0, upd = 0;
    UPLOAD_PREVIEW.forEach(function(r) {
      var ex = DB.filter(function(d){ return d.lot && r.lot && normalH(d.lot)===normalH(r.lot) && normalH(d.name)===normalH(r.name); })[0];
      if (ex) upd++; else new_++;
    });
    var h = '<div class="note ok"><b>' + UPLOAD_PREVIEW.length + ' lignes reconnues</b> — ' +
      new_ + ' nouveau(x) lot(s) · ' + upd + ' mise(s) à jour</div>';
    h += '<div class="tbl-scroll"><table class="tbl"><thead><tr>' +
      '<th>Désignation</th><th>Lot</th><th class="num">Qté reçue</th><th class="num">Qté rest.</th>' +
      '<th>Péremption</th><th>Emplacement</th><th>Action</th></tr></thead><tbody>';
    UPLOAD_PREVIEW.slice(0,30).forEach(function(r){
      var ex = DB.filter(function(d){ return d.lot && r.lot && normalH(d.lot)===normalH(r.lot) && normalH(d.name)===normalH(r.name); })[0];
      h += '<tr><td class="t-name">'+esc(r.name)+'</td><td class="mono">'+esc(r.lot||"—")+'</td>' +
        '<td class="num">'+esc(r.qty_received||"")+'</td><td class="num">'+esc(r.qty_remaining||"")+'</td>' +
        '<td class="mono">'+esc(r.date_expiry||"—")+'</td><td>'+esc(r.location)+'</td>' +
        '<td><span class="pill '+(ex?"info":"ok")+'">'+(ex?"Mise à jour":"Nouveau")+'</span></td></tr>';
    });
    h += '</tbody></table></div>';
    if (UPLOAD_PREVIEW.length > 30) h += '<div class="count-note">Aperçu limité aux 30 premières lignes sur '+UPLOAD_PREVIEW.length+'.</div>';
    h += '<div style="margin-top:14px;display:flex;gap:10px">' +
      '<button class="btn" id="btnImportConfirm">Importer les ' + UPLOAD_PREVIEW.length + ' lots</button>' +
      '<button class="btn btn-ghost" id="btnImportCancel">Annuler</button></div>';
    $("#uploadPreview").innerHTML = h;
    $("#btnImportConfirm").onclick = confirmImport;
    $("#btnImportCancel").onclick = function(){ $("#uploadPreview").innerHTML=""; UPLOAD_PREVIEW=[]; };
  }
  function confirmImport() {
    var added=0, updated=0;
    UPLOAD_PREVIEW.forEach(function(r) {
      var ex = DB.filter(function(d){ return d.lot && r.lot && normalH(d.lot)===normalH(r.lot) && normalH(d.name)===normalH(r.name); })[0];
      if (ex) {
        Object.assign(ex, r, { id: ex.id, last_update: nowISO() });
        pushRemote("upsert", { record: ex }); updated++;
      } else {
        r.id = "IMP" + Date.now().toString(36).toUpperCase() + (added);
        r.last_update = nowISO();
        DB.push(r);
        pushRemote("upsert", { record: r }); added++;
      }
    });
    save(); buildFilters(); render(); UPLOAD_PREVIEW = [];
    toast("Import terminé : " + added + " ajout(s) · " + updated + " mise(s) à jour", "ok");
    go("inv");
  }
  function loadXLSX(cb) {
    if (window.XLSX) { cb(); return; }
    var s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    s.onload = cb; document.head.appendChild(s);
  }

  /* ──────────────────────────────────────────────────────────────
     2. MASTER EXCEL DOWNLOAD (color-coded)
  ────────────────────────────────────────────────────────────── */
  function downloadMasterXLSX() {
    loadXLSX(function() {
      var wb = window.XLSX.utils.book_new();
      var rows = DB.slice().sort(function(a,b){
        var da=daysTo(a.date_expiry), db=daysTo(b.date_expiry);
        if(da===null) return 1; if(db===null) return -1; return da-db;
      });
      var HDRS = ["ID","Désignation","Catégorie","Sous-catégorie","Fabricant","Réf. catalogue",
                  "N° de lot","N° de série","Qté reçue","Qté restante","Unité",
                  "Date réception","Date fabrication","Date péremption","Alerte péremption",
                  "Jours restants","Emplacement","Température","Source","Statut","Observations"];
      var data = [HDRS];
      rows.forEach(function(r) {
        var d = daysTo(r.date_expiry);
        data.push([r.id,r.name,r.category,r.subcategory||"",r.manufacturer||"",r.catalog_ref||"",
          r.lot||"",r.serial||"",r.qty_received,r.qty_remaining,r.unit||"",
          r.date_reception||"",r.date_manufacture||"",r.date_expiry||"",
          BAND_LBL[band(r)], d===null?"":d, r.location,r.temperature||"",r.source||"",r.status||"",r.notes||""]);
      });
      var ws = window.XLSX.utils.aoa_to_sheet(data);
      // Column widths
      ws["!cols"] = [8,35,18,16,20,16,14,14,9,9,8,13,13,13,14,9,22,14,18,10,30].map(function(w){return{wch:w};});
      // Color coding by band
      var FILL = { exp:"FFCCD5", d30:"FFD6D6", d90:"FFF3CD", d365:"FFF9E6", ok:"D4F4E2", nodate:"EEEEEE", na:"E8EEFF" };
      var FONT = { exp:"8B0000", d30:"C0392B", d90:"7D4F00", d365:"7D6000", ok:"1A5C36", nodate:"555555", na:"1A3A6B" };
      rows.forEach(function(r, i) {
        var b = band(r);
        var fill = FILL[b] || "FFFFFF", fnt = FONT[b] || "000000";
        HDRS.forEach(function(_, ci) {
          var addr = window.XLSX.utils.encode_cell({ r: i+1, c: ci });
          if (!ws[addr]) return;
          ws[addr].s = {
            fill: { fgColor: { rgb: fill } },
            font: { color: { rgb: fnt }, bold: ci===1 },
            border: { bottom: { style:"thin", color:{rgb:"CCCCCC"} } }
          };
        });
      });
      // Header style
      HDRS.forEach(function(_, ci) {
        var addr = window.XLSX.utils.encode_cell({ r:0, c:ci });
        if (!ws[addr]) return;
        ws[addr].s = { fill:{fgColor:{rgb:"002664"}}, font:{color:{rgb:"FFFFFF"},bold:true}, alignment:{wrapText:true} };
      });
      window.XLSX.utils.book_append_sheet(wb, ws, "Inventaire");
      // Legend sheet
      var leg = window.XLSX.utils.aoa_to_sheet([
        ["Couleur","Signification","Seuil"],
        ["Rouge foncé","Périmé","Date dépassée"],["Rouge","Péremption critique","≤ 30 jours"],
        ["Orange","Double étiquetage requis","≤ 90 jours"],["Jaune","Suivi rapproché","≤ 12 mois"],
        ["Vert","Conforme","OK"],["Gris","Date absente","Non renseignée"],["Bleu clair","Non périssable","N/A"],
        ["","Source : SOP R-3 / Manuel INSAPT",""]
      ]);
      window.XLSX.utils.book_append_sheet(wb, leg, "Légende");
      // Summary sheet
      var g=function(b){return DB.filter(function(r){return band(r)===b;}).length;};
      var sum = window.XLSX.utils.aoa_to_sheet([
        ["Rapport","Valeur"],
        ["Date de génération", new Date().toLocaleString("fr")],
        ["Total lots",DB.length],["Périmés",g("exp")],
        ["≤ 30 jours",g("d30")],["≤ 90 jours",g("d90")],["≤ 12 mois",g("d365")],
        ["Conformes",g("ok")],["Dates absentes",g("nodate")],
        ["Non périssables",g("na")],
        ["Taux de péremption",((g("exp")/Math.max(1,DB.filter(function(r){return band(r)!=="na";}).length))*100).toFixed(1)+"%"],
        ["Généré par",CURRENT_USER?CURRENT_USER.name:"—"],
        ["Référence","SOP R-3 §4 — INSAPT LaBiEp"]
      ]);
      window.XLSX.utils.book_append_sheet(wb, sum, "Résumé");
      window.XLSX.writeFile(wb, "INSAPT_LaBiEp_MasterStock_" + nowISO() + ".xlsx");
      toast("Téléchargement en cours…", "ok");
    });
  }

  /* ──────────────────────────────────────────────────────────────
     3. ORDER LEVEL REPORT (shared admin + operator view)
  ────────────────────────────────────────────────────────────── */
  function renderOrderReport() {
    var cons = consumptionByItem();
    var oldest = MOVES.filter(function(m){return m.kind==="out";});
    var months = oldest.length > 0
      ? Math.max(1, (Date.now() - new Date(oldest[oldest.length-1].ts)) / (30*86400000))
      : 0;
    var agg = {};
    DB.forEach(function(r) {
      if (r.category === "Équipement") return;
      var k = normName(r.name);
      if (!agg[k]) agg[k] = { name:r.name, qty:0, unit:r.unit, cat:r.category, lots:0, locs:{}, nearest:null, min:r.min_level };
      agg[k].qty += qty(r); agg[k].lots++;
      agg[k].locs[r.location] = 1;
      var d = daysTo(r.date_expiry);
      if (d !== null && (agg[k].nearest===null || d < agg[k].nearest)) agg[k].nearest = d;
      if (r.min_level !== null && r.min_level !== undefined && agg[k].min === null) agg[k].min = r.min_level;
    });
    var rows = Object.keys(agg).map(function(k) {
      var a = agg[k];
      var used = cons[k] || 0;
      var cmm = (months > 0 && used > 0) ? used / months : 0;
      var rop = cmm > 0 ? Math.ceil(cmm * (CFG.leadTime/30) + cmm * (CFG.coverage/30)) : (a.min || null);
      var cover = cmm > 0 ? Math.round(a.qty / cmm * 30) : null;
      var toOrder = rop !== null ? Math.max(0, rop * 2 - a.qty) : null;
      return { name:a.name, cat:a.cat, qty:a.qty, unit:a.unit, lots:a.lots,
               nloc:Object.keys(a.locs).length, cmm:cmm, rop:rop, cover:cover,
               toOrder:toOrder, nearest:a.nearest,
               flag: (rop!==null && a.qty<=rop) ? "order" : (a.qty===0?"out":"ok") };
    });
    rows.sort(function(a,b){
      var o={out:0,order:1,ok:2}; if(o[a.flag]!==o[b.flag]) return o[a.flag]-o[b.flag];
      return (a.cover===null?1e9:a.cover)-(b.cover===null?1e9:b.cover);
    });
    var needOrder = rows.filter(function(r){return r.flag!=="ok";});
    var h = '<div class="kpis">' +
      kpi(needOrder.length?"danger":"ok", needOrder.length, "Articles à commander", "Sous le point de commande ou épuisés") +
      kpi("", rows.length, "Articles suivis", "Tous réactifs et consommables") +
      kpi("warn", rows.filter(function(r){return r.cmm===0;}).length, "Sans historique CMM", "Aucune sortie enregistrée") +
      '</div>';
    if (!months) {
      h += '<div class="note warn"><b>Historique insuffisant</b>Aucune sortie enregistrée. ' +
        'Les recommandations sont basées sur le stock minimum saisi. Enregistrez les sorties pour calculer la CMM automatiquement.</div>';
    }
    h += '<div class="card"><div class="card-h">' +
      '<h3>Recommandations de commande<small>CMM × (délai ' + CFG.leadTime + ' j + couverture ' + CFG.coverage + ' j)</small></h3>' +
      '<button class="btn btn-sm" id="csvOrder2">Exporter CSV</button>' +
      '<button class="btn btn-gold btn-sm" id="xlsxOrder">Exporter Excel</button></div>' +
      '<div class="card-b flush"><div class="tbl-scroll"><table class="tbl"><thead><tr>' +
      '<th>Article</th><th>Catégorie</th><th class="num">Stock actuel</th>' +
      '<th class="num">CMM</th><th class="num">Point de cde</th>' +
      '<th class="num">Couverture</th><th class="num">Qté à commander</th><th>État</th>' +
      '</tr></thead><tbody>';
    rows.slice(0,300).forEach(function(r) {
      var pill = r.flag==="out"?'<span class="pill exp">Épuisé</span>':
                 r.flag==="order"?'<span class="pill d30">Commander</span>':
                 '<span class="pill ok">Suffisant</span>';
      h += '<tr' + (r.flag==="out"?' class="row-exp"':r.flag==="order"?' class="row-30"':"") + '>' +
        '<td class="t-name">'+esc(r.name)+'</td><td>'+esc(r.cat)+'</td>' +
        '<td class="num">'+r.qty.toLocaleString("fr")+" "+esc(r.unit||"")+"</td>" +
        '<td class="num">'+(r.cmm?r.cmm.toFixed(1):"—")+"</td>" +
        '<td class="num">'+(r.rop===null?"—":r.rop)+"</td>" +
        '<td class="num">'+(r.cover===null?"—":r.cover+" j")+"</td>" +
        '<td class="num" style="font-weight:700;color:var('+(r.toOrder?'--danger':'--ok')+')">'+
          (r.toOrder===null?"—":r.toOrder>0?"+"+r.toOrder+" "+esc(r.unit||""):"Suffisant")+"</td>" +
        "<td>"+pill+"</td></tr>";
    });
    h += '</tbody></table></div></div></div>';
    $("#v-order").innerHTML = h;
    $("#csvOrder2").onclick = function() {
      downloadCSV("commandes",
        ["Article","Catégorie","Stock","Unité","CMM","Point de commande","Couverture","Qté à commander","État"],
        rows.map(function(r){return[r.name,r.cat,r.qty,r.unit,r.cmm?r.cmm.toFixed(2):"",r.rop||"",r.cover||"",r.toOrder||"",r.flag==="out"?"Épuisé":r.flag==="order"?"À commander":"Suffisant"];}));
    };
    $("#xlsxOrder").onclick = function() { downloadOrderXLSX(rows); };
  }
  function downloadOrderXLSX(rows) {
    loadXLSX(function(){
      var wb = window.XLSX.utils.book_new();
      var data = [["Article","Catégorie","Stock actuel","Unité","CMM","Point de commande","Couverture (j)","Qté à commander","État"]];
      rows.forEach(function(r){ data.push([r.name,r.cat,r.qty,r.unit,r.cmm?r.cmm.toFixed(2):"",r.rop||"",r.cover||"",r.toOrder||"",r.flag==="out"?"Épuisé":r.flag==="order"?"À commander":"Suffisant"]); });
      var ws = window.XLSX.utils.aoa_to_sheet(data);
      ws["!cols"] = [35,18,12,8,8,12,12,14,12].map(function(w){return{wch:w};});
      window.XLSX.utils.book_append_sheet(wb,ws,"Commandes");
      window.XLSX.writeFile(wb,"INSAPT_LaBiEp_Commandes_"+nowISO()+".xlsx");
      toast("Export Excel commandes téléchargé","ok");
    });
  }

  /* ──────────────────────────────────────────────────────────────
     4. FEFO PICK FORM → PDF SLIP  (jsPDF, no expired lots)
  ────────────────────────────────────────────────────────────── */
  function openIssue(id, list) {
    ISSUE_ID = id; ISSUE_LIST = list || [];
    var r = DB.filter(function(x){ return x.id===id; })[0]; if (!r) return;
    if (band(r) === "exp") { toast("Lot périmé — non disponible au prélèvement. Utilisez Mise au rebut.","err"); return; }
    var rank = ISSUE_LIST.findIndex(function(x){ return x.id===id; });
    var fefoFirst = ISSUE_LIST.filter(function(x){ return band(x)!=="exp" && qty(x)>0; })[0];
    var isDerog = fefoFirst && fefoFirst.id !== id;
    $("#iTitle").textContent = "Bon de prélèvement PPSO/FEFO";
    var d = daysTo(r.date_expiry);
    $("#iInfo").innerHTML =
      "<b>" + esc(r.name) + "</b><br>" +
      "Lot : " + esc(r.lot||r.catalog_ref||"—") + " · Péremption : " + fmtD(r.date_expiry) +
      (d!==null?" (" + d + " j)":"") +
      " · Disponible : <b>" + qty(r) + " " + esc(r.unit||"") + "</b><br>" +
      '<span class="fefo-loc">📍 ' + esc(r.location) +
      (r.temperature&&r.temperature!=="Non spécifiée"?" · "+esc(r.temperature):"") + "</span>";
    $("#iQty").value=""; $("#iQty").max=qty(r);
    $("#iWho").value=""; $("#iWhy").value="";
    var w = $("#iDerog");
    if (isDerog) {
      w.className = "note warn";
      w.innerHTML = "<b>Dérogation à la séquence PPSO/FEFO</b>Le lot prioritaire est <b>" +
        esc(fefoFirst.lot||fefoFirst.name) + "</b> (" + fmtD(fefoFirst.date_expiry) +
        ") · 📍 " + esc(fefoFirst.location) + ". Justification obligatoire (SOP R-3 §4.3).";
      w.style.display = "";
      $("#iWhy").required = true;
      $("#iWhyLbl").textContent = "Justification de la dérogation PPSO (obligatoire)";
    } else {
      w.style.display="none";
      $("#iWhy").required = false;
      $("#iWhyLbl").textContent = "Observation (facultatif)";
    }
    $("#mIssue").classList.add("on");
    setTimeout(function(){ $("#iQty").focus(); }, 60);
  }
  function confirmIssue(e) {
    e.preventDefault();
    var r = DB.filter(function(x){ return x.id===ISSUE_ID; })[0]; if(!r) return;
    var n = Number($("#iQty").value);
    if (!n || n<=0) { toast("Saisissez une quantité valide","err"); return; }
    if (n > qty(r)) { toast("Quantité supérieure au stock disponible (" + qty(r) + ")","err"); return; }
    var who = $("#iWho").value.trim(), why = $("#iWhy").value.trim();
    if ($("#iWhy").required && !why) { toast("La justification de dérogation est obligatoire","err"); return; }
    var fefoFirst = ISSUE_LIST.filter(function(x){ return band(x)!=="exp" && qty(x)>0; })[0];
    var isDerog = fefoFirst && fefoFirst.id !== ISSUE_ID;
    var oldQty = qty(r);
    r.qty_remaining = oldQty - n;
    r.last_update = nowISO();
    var mv = { ts: new Date().toISOString(), kind:"out", id:r.id, name:r.name,
               qty:n, note:why, who:who||CURRENT_USER?.name||"", lot:r.lot||"", loc:r.location||"",
               fefo_ok: isDerog?"derogation":"ok", user:CURRENT_USER?.user||"" };
    logMove("out", r.id, r.name, n, why, who||CURRENT_USER?.name, r.lot, r.location);
    save(); $("#mIssue").classList.remove("on");
    render(); renderOut();
    pushRemote("upsert", { record: r });
    pushRemote("move", { move: mv });
    toast("Sortie enregistrée : " + n + " " + (r.unit||"") + " — reste " + r.qty_remaining, "ok");
    /* Generate PDF pick slip */
    setTimeout(function(){ generatePickSlip(r, n, who||CURRENT_USER?.name||"", why, isDerog, oldQty); }, 200);
  }
  function generatePickSlip(r, n, who, why, isDerog, wasQty) {
    if (!window.jspdf) { loadJsPDF(function(){ generatePickSlip(r,n,who,why,isDerog,wasQty); }); return; }
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a5" });
    var W = 148, M = 12, y = M;
    // Header band
    doc.setFillColor(0,38,100); doc.rect(0,0,W,22,"F");
    doc.setFillColor(254,203,0); doc.rect(0,22,W,2,"F");
    doc.setTextColor(255,255,255); doc.setFontSize(13); doc.setFont("helvetica","bold");
    doc.text("INSAPT — LaBiEp", M, 10);
    doc.setFontSize(9); doc.setFont("helvetica","normal");
    doc.text("Bon de Prélèvement PPSO/FEFO", M, 17);
    doc.text("N° " + Date.now().toString(36).toUpperCase(), W-M, 17, {align:"right"});
    y = 30;
    // Article block
    doc.setTextColor(0,38,100); doc.setFontSize(10); doc.setFont("helvetica","bold");
    doc.text("ARTICLE À PRÉLEVER", M, y); y += 6;
    doc.setTextColor(20,33,61); doc.setFont("helvetica","bold"); doc.setFontSize(12);
    doc.text(r.name, M, y); y += 6;
    doc.setFont("helvetica","normal"); doc.setFontSize(9);
    if (r.manufacturer) doc.text("Fabricant : " + r.manufacturer, M, y), y+=5;
    doc.text("Référence : " + (r.catalog_ref||"—") + "   |   Lot : " + (r.lot||"—"), M, y); y+=7;
    // FEFO Lot block
    doc.setFillColor(0,38,100); doc.setTextColor(255,255,255);
    doc.roundedRect(M, y, W-M*2, 22, 2, 2, "F"); y+=6;
    doc.setFontSize(8); doc.text("SÉQUENCE PPSO / FEFO — LOT PRIORITAIRE", M+4, y); y+=5;
    doc.setFontSize(11); doc.setFont("helvetica","bold");
    doc.text("Lot : " + (r.lot||r.catalog_ref||"—"), M+4, y); y+=5;
    doc.setFontSize(9); doc.setFont("helvetica","normal");
    doc.text("Péremption : " + fmtD(r.date_expiry) + "   |   Qté disponible avant prélèvement : " + wasQty + " " + (r.unit||""), M+4, y);
    y+=10; doc.setTextColor(20,33,61);
    // Location highlight
    doc.setFillColor(254,203,0); doc.setTextColor(0,38,100);
    doc.roundedRect(M, y, W-M*2, 12, 2, 2, "F");
    doc.setFontSize(10); doc.setFont("helvetica","bold");
    doc.text("📍  " + r.location + (r.temperature&&r.temperature!=="Non spécifiée"?"  ·  "+r.temperature:""), M+4, y+8);
    y+=16; doc.setTextColor(20,33,61);
    // Quantity
    doc.setFillColor(227,245,236); doc.roundedRect(M, y, W-M*2, 11, 2, 2, "F");
    doc.setFontSize(10); doc.setFont("helvetica","bold"); doc.setTextColor(18,122,81);
    doc.text("Quantité à prélever : " + n + " " + (r.unit||""), M+4, y+7.5);
    y+=15; doc.setTextColor(20,33,61);
    // Derogation warning
    if (isDerog) {
      doc.setFillColor(253,240,216); doc.roundedRect(M,y,W-M*2,12,2,2,"F");
      doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(154,100,16);
      doc.text("⚠  DÉROGATION PPSO — Justification : " + (why||"—"), M+4, y+8, {maxWidth:W-M*2-8});
      y+=16; doc.setTextColor(20,33,61);
    }
    // Agent / date
    doc.setFont("helvetica","normal"); doc.setFontSize(9);
    doc.text("Agent : " + (who||"—") + "     Date : " + fmtD(nowISO()) + "     Heure : " + new Date().toLocaleTimeString("fr"), M, y); y+=7;
    if (why&&!isDerog) doc.text("Obs. : " + why, M, y), y+=7;
    // Signature area
    y+=4;
    doc.setDrawColor(200,210,220); doc.line(M,y,W/2-4,y); doc.line(W/2+4,y,W-M,y);
    doc.setFontSize(8); doc.text("Signature de l'agent préleveur",M,y+5);
    doc.text("Signature du superviseur",W/2+4,y+5);
    y+=12;
    // Footer
    doc.setFillColor(0,38,100); doc.rect(0,doc.internal.pageSize.height-8,W,8,"F");
    doc.setTextColor(255,255,255); doc.setFontSize(7); doc.setFont("helvetica","normal");
    doc.text("INSAPT LaBiEp — Conforme SOP R-3 §4.3 PPSO/FEFO — Généré le " + new Date().toLocaleString("fr"), W/2, doc.internal.pageSize.height-3, {align:"center"});
    doc.save("BonPrelevement_" + (r.lot||r.name).replace(/\s+/g,"_") + "_" + nowISO() + ".pdf");
    toast("Bon de prélèvement PDF généré","ok");
  }
  function loadJsPDF(cb) {
    if (window.jspdf) { cb(); return; }
    var s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = cb; document.head.appendChild(s);
  }

  /* ──────────────────────────────────────────────────────────────
     5. SUPER-ADMIN DASHBOARD
  ────────────────────────────────────────────────────────────── */
  function renderAdminDash() {
    var g=function(b){return DB.filter(function(r){return band(r)===b;});};
    var exp=g("exp"),d30=g("d30"),d90=g("d90"),nod=g("nodate"),zero=DB.filter(function(r){return band(r)!=="na"&&qty(r)===0;});
    var perish=DB.filter(function(r){return band(r)!=="na";});
    var lossRate=perish.length?(exp.length/perish.length*100):0;
    // FEFO compliance from moves
    var moves_out=MOVES.filter(function(m){return m.kind==="out";});
    var fefo_total=moves_out.length, fefo_ok=moves_out.filter(function(m){return m.fefo_ok==="ok";}).length;
    var fefo_rate=fefo_total?Math.round(fefo_ok/fefo_total*100):100;
    // By user stats
    var byUser={};
    MOVES.forEach(function(m){
      var u=m.user||m.who||"inconnu";
      if(!byUser[u])byUser[u]={total:0,ok:0,derog:0,scrap:0,recv:0};
      if(m.kind==="out"){byUser[u].total++;if(m.fefo_ok==="ok")byUser[u].ok++;else byUser[u].derog++;}
      if(m.kind==="scrap")byUser[u].scrap++;
      if(m.kind==="in")byUser[u].recv++;
    });
    var h='<div class="kpis">' +
      kpi("crit",exp.length,"Lots périmés","Certificat de destruction requis") +
      kpi("danger",d30.length,"Alerte ≤ 30 j","Utilisation ou transfert immédiat") +
      kpi("warn",d90.length,"Alerte ≤ 90 j","Double étiquetage SOP R-3 §4.3") +
      kpi("",nod.length,"Dates absentes","Non-conformité de traçabilité") +
      kpi(zero.length?"danger":"ok",zero.length,"Stock épuisé","Réapprovisionner") +
      kpi(lossRate<=CFG.lossTarget?"ok":"crit",lossRate.toFixed(1)+" %","Taux de péremption","Cible < "+CFG.lossTarget+" %") +
      kpi(fefo_rate>=95?"ok":"warn",fefo_rate+" %","Conformité FEFO","Sur "+fefo_total+" sorties enregistrées") +
      kpi("",MOVES.length,"Total mouvements","Journal complet") +
      '</div>';
    // Urgent alerts
    h+='<div class="card"><div class="card-h"><h3>🔴 Action immédiate requise</h3>' +
      '<button class="btn btn-sm" onclick="exportRows(\'urgents\',window._urgents||[])">CSV</button></div>' +
      '<div class="card-b flush" id="adminAlerts"></div></div>';
    // FEFO compliance by user
    h+='<div class="card"><div class="card-h"><h3>Conformité FEFO par agent' +
      '<small>Basé sur le journal des sorties enregistrées</small></h3>' +
      '<button class="btn btn-sm" id="csvFefoUser">Exporter CSV</button></div><div class="card-b">';
    var uKeys=Object.keys(byUser);
    if(!uKeys.length){h+='<div class="empty"><span class="ic">📋</span><b>Aucune sortie enregistrée</b>Les agents doivent utiliser le module Sortie de stock.</div>';}
    else{
      h+='<div class="tbl-scroll"><table class="tbl"><thead><tr><th>Agent</th><th class="num">Sorties</th>' +
        '<th class="num">FEFO OK</th><th class="num">Dérogations</th><th class="num">Mises au rebut</th>' +
        '<th class="num">Réceptions</th><th class="num">Conformité</th><th>Alerte</th></tr></thead><tbody>';
      uKeys.sort(function(a,b){var ra=byUser[a],rb=byUser[b];return (rb.total-rb.ok)-(ra.total-ra.ok);}).forEach(function(u){
        var s=byUser[u]; var rate=s.total?Math.round(s.ok/s.total*100):100;
        h+='<tr><td class="t-name">'+esc(u)+'</td><td class="num">'+s.total+'</td>' +
          '<td class="num" style="color:var(--ok)">'+s.ok+'</td>' +
          '<td class="num" style="color:var(--warn)">'+s.derog+'</td>' +
          '<td class="num" style="color:var(--danger)">'+s.scrap+'</td>' +
          '<td class="num">'+s.recv+'</td>' +
          '<td class="num"><b style="color:var('+(rate>=95?"--ok":rate>=80?"--warn":"--danger")+')">'+rate+'%</b></td>' +
          '<td>'+(rate<80?'<span class="pill d30">Formation requise</span>':rate<95?'<span class="pill d90">À surveiller</span>':'<span class="pill ok">Conforme</span>')+'</td></tr>';
      });
      h+='</tbody></table></div>';
    }
    h+='</div></div>';
    // Expiry timeline
    h+='<div class="card"><div class="card-h"><h3>Lots périmés — Détail' +
      '<small>Action : Certificat de Destruction R-3.B + rapport des causes (SOP R-3.D si taux > '+CFG.lossTarget+' %)</small></h3>' +
      '<button class="btn btn-sm" onclick="exportRows(\'expired\',window.DB.filter(function(r){return window._band(r)===\"exp\";}))">Exporter CSV</button></div>' +
      '<div class="card-b flush" id="adminExpDetail"></div></div>';
    // Inventory confirmation
    h+='<div class="card"><div class="card-h"><h3>⬛ Confirmation d\'inventaire' +
      '<small>Cochez chaque emplacement contrôlé lors de l\'inventaire mensuel physique (formulaire R-3.A)</small></h3>' +
      '<button class="btn btn-sm" id="btnConfirmInv">Générer rapport d\'inventaire</button></div>' +
      '<div class="card-b" id="invConfirm"></div></div>';
    $("#v-admindash").innerHTML = h;
    // Populate urgent alerts
    var urgents=exp.concat(d30).sort(function(a,b){return (daysTo(a.date_expiry)||0)-(daysTo(b.date_expiry)||0);});
    window._urgents=urgents; window._band=band;
    $("#adminAlerts").innerHTML=alertTable(urgents,"Aucune alerte urgente — inventaire conforme.",true);
    // Populate expired detail
    $("#adminExpDetail").innerHTML=alertTable(exp,"Aucun lot périmé.",true);
    // Inventory checklist
    var locList=countBy("location").slice(0,25);
    var chk='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:8px">';
    locList.forEach(function(p,i){
      chk+='<label style="display:flex;align-items:center;gap:9px;padding:8px 12px;border:1px solid var(--line);border-radius:8px;cursor:pointer;font-size:13px">' +
        '<input type="checkbox" id="ic_'+i+'" style="width:auto"> <span><b>'+esc(p[0])+'</b> — '+p[1]+' lots</span></label>';
    });
    chk+='</div>';
    $("#invConfirm").innerHTML=chk;
    $("#btnConfirmInv").onclick=function(){
      var done=locList.filter(function(p,i){return document.getElementById("ic_"+i)&&document.getElementById("ic_"+i).checked;});
      var total=locList.length;
      var note="Inventaire partiel ("+done.length+"/"+total+" emplacements contrôlés) — "+new Date().toLocaleString("fr");
      if(done.length===total) note="Inventaire complet ("+total+" emplacements) — "+new Date().toLocaleString("fr");
      logMove("audit","SYSTEM","Confirmation inventaire physique",null,note,CURRENT_USER?CURRENT_USER.name:"admin");
      pushRemote("move",{move:{ts:new Date().toISOString(),kind:"audit",id:"SYS",name:"Inventaire physique",qty:null,note:note,who:CURRENT_USER?CURRENT_USER.name:"",lot:"",loc:"",user:CURRENT_USER?CURRENT_USER.user:""}});
      save(); toast(note,"ok");
    };
    // FEFO user CSV
    if($("#csvFefoUser")) $("#csvFefoUser").onclick=function(){
      downloadCSV("fefo_par_agent",
        ["Agent","Sorties","FEFO OK","Dérogations","Mises au rebut","Réceptions","Conformité %"],
        Object.keys(byUser).map(function(u){var s=byUser[u];var rate=s.total?Math.round(s.ok/s.total*100):100;
          return[u,s.total,s.ok,s.derog,s.scrap,s.recv,rate];}));
    };
  }

  /* ──────────────────────────────────────────────────────────────
     6. USER MANAGEMENT (superadmin only)
  ────────────────────────────────────────────────────────────── */
  var GS_USERS = [];  /* cache from ls_users */
  function renderUsers() {
    var h='<div class="note"><b>Gestion des comptes opérateurs</b>Les comptes créés ici permettent au personnel du labo de se connecter ' +
      'et d\'enregistrer des mouvements de stock. Rôles : <b>admin</b> (rapports + paramètres) · <b>operator</b> (opérations quotidiennes).</div>';
    h+='<div class="card"><div class="card-h"><h3>Comptes actifs</h3>' +
      '<button class="btn btn-sm" id="btnRefreshUsers">↻ Actualiser</button>' +
      '<button class="btn btn-gold btn-sm" id="btnNewUser">+ Nouveau compte</button></div>' +
      '<div class="card-b flush" id="usersList"><div class="empty"><span class="ic">⟳</span><b>Chargement…</b></div></div></div>';
    h+='<div class="card"><div class="card-h"><h3>Comptes système (intégrés)</h3></div><div class="card-b">' +
      '<div class="tbl-scroll"><table class="tbl"><thead><tr><th>Identifiant</th><th>Nom</th><th>Rôle</th><th>Statut</th></tr></thead><tbody>';
    BUILT_IN.forEach(function(a){h+='<tr><td class="mono">'+esc(a.user)+'</td><td>'+esc(a.name)+'</td><td><span class="pill na">'+esc(a.role)+'</span></td><td><span class="pill ok">Intégré</span></td></tr>';});
    h+='</tbody></table></div><p style="font-size:12px;color:var(--slate);margin:10px 0 0">Ces comptes sont définis dans le code source et ne peuvent pas être modifiés depuis l\'interface.</p></div></div>';
    $("#v-users").innerHTML=h;
    $("#btnRefreshUsers").onclick=loadUsers;
    $("#btnNewUser").onclick=function(){openUserModal(null);};
    loadUsers();
  }
  function loadUsers(){
    if(!$("#usersList"))return;
    gsCall("ls_users")
      .then(function(j){
        GS_USERS=j.users||[];
        renderUserTable();
      })
      .catch(function(){ $("#usersList").innerHTML='<div class="note danger"><b>Hors ligne</b>Impossible de charger les comptes depuis Google Sheets.</div>'; });
  }
  function renderUserTable(){
    if(!GS_USERS.length){
      $("#usersList").innerHTML='<div class="empty"><span class="ic">👥</span><b>Aucun compte opérateur créé</b>Cliquez sur "+ Nouveau compte" pour en ajouter un.</div>';
      return;
    }
    var h='<div class="tbl-scroll"><table class="tbl"><thead><tr><th>Identifiant</th><th>Nom</th>' +
      '<th>Rôle</th><th>Section</th><th>Créé le</th><th>Statut</th><th></th></tr></thead><tbody>';
    GS_USERS.forEach(function(u){
      h+='<tr><td class="mono">'+esc(u.user)+'</td><td class="t-name">'+esc(u.name)+'</td>' +
        '<td><span class="pill '+(u.role==="admin"?"info":"ok")+'">'+esc(u.role)+'</span></td>' +
        '<td>'+esc(u.section||"—")+'</td><td class="mono">'+esc((u.created||"").slice(0,10))+'</td>' +
        '<td><span class="pill '+(u.active!=="false"?"ok":"d30")+'">'+(u.active!=="false"?"Actif":"Désactivé")+'</span></td>' +
        '<td style="white-space:nowrap">' +
        '<button class="btn btn-ghost btn-xs" data-uname="'+esc(u.user)+'" data-uact="edit">Modifier</button> ' +
        '<button class="btn btn-ghost btn-xs" data-uname="'+esc(u.user)+'" data-uact="toggle">'+(u.active!=="false"?"Désactiver":"Activer")+'</button></td></tr>';
    });
    h+='</tbody></table></div>';
    $("#usersList").innerHTML=h;
    $$("#usersList [data-uname]").forEach(function(b){
      b.onclick=function(){
        var u=GS_USERS.filter(function(x){return x.user===b.dataset.uname;})[0];
        if(!u)return;
        if(b.dataset.uact==="edit") openUserModal(u);
        else toggleUser(u);
      };
    });
  }
  function openUserModal(u){
    var h='<div class="modal-h"><h3>'+(u?"Modifier le compte":"Nouveau compte opérateur")+'</h3>' +
      '<button class="modal-x" data-close type="button">×</button></div>' +
      '<form id="userForm" style="display:contents">' +
      '<div class="modal-b">' +
      '<div class="grid2">' +
      '<div class="field"><label>Identifiant *</label><input id="uu_user" required placeholder="ex: jean.dupont" value="'+esc(u?u.user:"")+'"></div>' +
      '<div class="field"><label>Mot de passe '+(u?"(laisser vide pour ne pas changer)":"*")+'</label><input id="uu_pass" type="password" '+(u?"":"required")+'></div>' +
      '</div>' +
      '<div class="grid2">' +
      '<div class="field"><label>Nom complet *</label><input id="uu_name" required placeholder="Prénom Nom" value="'+esc(u?u.name:"")+'"></div>' +
      '<div class="field"><label>Section / service</label><input id="uu_section" placeholder="ex: Biologie moléculaire" value="'+esc(u?u.section||"":"")+'"></div>' +
      '</div>' +
      '<div class="field"><label>Rôle</label><select id="uu_role">' +
      '<option value="operator"'+(u&&u.role==="operator"?" selected":"")+'>Opérateur (accès quotidien)</option>' +
      '<option value="admin"'+(u&&u.role==="admin"?" selected":"")+'>Admin (rapports + paramètres)</option>' +
      '</select></div>' +
      '<div class="note"><b>Accès opérateur :</b> Inventaire, Sortie de stock, Réception, Commandes<br>' +
      '<b>Accès admin :</b> tout ce qui précède + Rapports, Analyse, Paramètres</div>' +
      '</div>' +
      '<div class="modal-f"><button class="btn btn-ghost" type="button" data-close>Annuler</button>' +
      '<button class="btn" type="submit">'+(u?"Enregistrer":"Créer le compte")+'</button></div></form>';
    var m=$("#mGeneric"); m.innerHTML=h; m.classList.add("on");
    $$("[data-close]",m).forEach(function(b){b.onclick=function(){m.classList.remove("on");};});
    $("#userForm").onsubmit=function(ev){
      ev.preventDefault();
      var nu={user:$("#uu_user").value.trim().toLowerCase(), name:$("#uu_name").value.trim(),
               section:$("#uu_section").value.trim(), role:$("#uu_role").value,
               active:"true", created:u?(u.created||nowISO()):nowISO()};
      var pass=$("#uu_pass").value;
      if(!u&&!pass){toast("Mot de passe requis pour un nouveau compte","err");return;}
      if(pass) nu.pass=pass;
      gsCall("ls_user_upsert",{user_rec:nu})
        .then(function(j){
          if(!j.ok) throw new Error(j.error||"Erreur");
          m.classList.remove("on"); toast((u?"Compte mis à jour : ":"Compte créé : ")+nu.name,"ok");
          loadUsers();
        })
        .catch(function(e){toast("Erreur : "+e.message,"err");});
    };
  }
  function toggleUser(u){
    if(!confirm((u.active!=="false"?"Désactiver":"Activer")+" le compte "+u.name+" ?"))return;
    var nu=Object.assign({},u,{active:u.active==="false"?"true":"false"});
    gsCall("ls_user_upsert",{user_rec:nu})
      .then(function(j){if(!j.ok)throw new Error(j.error||"Erreur");toast("Compte mis à jour","ok");loadUsers();})
      .catch(function(e){toast("Erreur : "+e.message,"err");});
  }

  /* ──────────────────────────────────────────────────────────────
     7. AUDIT REPORT
  ────────────────────────────────────────────────────────────── */
  function renderAudit() {
    var h='<div class="tabs" id="auditTab" data-t="fefo">' +
      '<button data-t="fefo" class="on">Conformité FEFO</button>' +
      '<button data-t="moves">Journal complet</button>' +
      '<button data-t="losses">Analyse des pertes</button>' +
      '</div><div id="auditBody"></div>';
    $("#v-audit").innerHTML=h;
    $$("#auditTab button").forEach(function(b){ b.onclick=function(){
      $$("#auditTab button").forEach(function(x){x.classList.remove("on");});
      b.classList.add("on"); $("#auditTab").dataset.t=b.dataset.t; renderAuditTab();
    };});
    renderAuditTab();
  }
  function renderAuditTab(){
    var t=($("#auditTab")||{}).dataset&&$("#auditTab").dataset.t||"fefo";
    if(t==="fefo") renderAuditFEFO();
    else if(t==="moves") renderAuditMoves();
    else renderAuditLosses();
  }
  function renderAuditFEFO(){
    var out=MOVES.filter(function(m){return m.kind==="out";});
    var byUser={}, byDate={};
    out.forEach(function(m){
      var u=m.user||m.who||"inconnu";
      if(!byUser[u])byUser[u]={name:u,total:0,ok:0,derog:0,items:[]};
      byUser[u].total++;
      var isOk=(m.fefo_ok==="ok"||!m.fefo_ok&&!m.note);
      if(isOk)byUser[u].ok++; else byUser[u].derog++;
      byUser[u].items.push(m);
      var d=(m.ts||"").slice(0,7);
      if(!byDate[d])byDate[d]={total:0,ok:0};
      byDate[d].total++; if(isOk)byDate[d].ok++;
    });
    var h='<div class="note"><b>Rapport de conformité FEFO</b>Basé sur '+out.length+' sortie(s) enregistrée(s). ' +
      'Les sorties sans le champ <code>fefo_ok</code> (avant la mise à jour) sont supposées conformes.</div>';
    h+='<div class="card"><div class="card-h"><h3>Par agent</h3>' +
      '<button class="btn btn-sm" id="csvAuditFefo">Exporter CSV</button></div><div class="card-b flush">';
    if(!Object.keys(byUser).length){
      h+='<div class="empty"><span class="ic">📋</span><b>Aucune sortie enregistrée</b></div>';
    } else {
      h+='<div class="tbl-scroll"><table class="tbl"><thead><tr><th>Agent</th><th class="num">Sorties</th>' +
        '<th class="num">Conformes</th><th class="num">Dérogations</th><th class="num">Taux</th>' +
        '<th>Évaluation</th></tr></thead><tbody>';
      Object.values(byUser).sort(function(a,b){return(b.derog-a.derog);}).forEach(function(u){
        var rate=u.total?Math.round(u.ok/u.total*100):100;
        h+='<tr><td class="t-name">'+esc(u.name)+'</td><td class="num">'+u.total+'</td>' +
          '<td class="num" style="color:var(--ok)">'+u.ok+'</td>' +
          '<td class="num" style="color:var(--warn)">'+u.derog+'</td>' +
          '<td class="num"><b>'+rate+'%</b></td>' +
          '<td>'+(rate>=95?'<span class="pill ok">Excellent</span>':rate>=80?'<span class="pill d90">À améliorer</span>':'<span class="pill d30">Formation requise</span>')+'</td></tr>';
      });
      h+='</tbody></table></div>';
    }
    h+='</div></div>';
    // Monthly trend
    var months=Object.keys(byDate).sort();
    if(months.length>1){
      h+='<div class="card"><div class="card-h"><h3>Tendance mensuelle FEFO</h3></div><div class="card-b">';
      months.forEach(function(d){
        var r=byDate[d]; var rate=r.total?Math.round(r.ok/r.total*100):100;
        h+=barRow(d, r.ok, r.total, rate>=95?"ok":rate>=80?"warn":"crit");
        h+='<div style="font-size:11px;color:var(--slate);margin:-5px 0 8px 214px">'+rate+'% conforme ('+r.ok+'/'+r.total+')</div>';
      });
      h+='</div></div>';
    }
    $("#auditBody").innerHTML=h;
    if($("#csvAuditFefo")) $("#csvAuditFefo").onclick=function(){
      downloadCSV("audit_fefo",["Agent","Sorties","Conformes","Dérogations","Taux %"],
        Object.values(byUser).map(function(u){var r=u.total?Math.round(u.ok/u.total*100):100;return[u.name,u.total,u.ok,u.derog,r];}));
    };
  }
  function renderAuditMoves(){
    var filter_kind=$("#auditMoveKind")?$("#auditMoveKind").value:"";
    var filter_user=$("#auditMoveUser")?$("#auditMoveUser").value:"";
    var filtered2=MOVES.filter(function(m){
      if(filter_kind&&m.kind!==filter_kind)return false;
      if(filter_user&&(m.user||m.who||"").toLowerCase().indexOf(filter_user.toLowerCase())<0)return false;
      return true;
    });
    var K={in:"Entrée",out:"Sortie",scrap:"Rebut",edit:"Modification",del:"Suppression",audit:"Audit"};
    var P={in:"ok",out:"info",scrap:"exp",edit:"nodate",del:"d30",audit:"na"};
    var h='<div class="card"><div class="card-h"><h3>Journal des mouvements<small>'+filtered2.length+' enregistrement(s)</small></h3>' +
      '<button class="btn btn-sm" id="csvAllMoves">Exporter CSV</button></div><div class="card-b">' +
      '<div class="filters" style="margin-bottom:14px">' +
      '<div class="field"><label>Type</label><select id="auditMoveKind">' +
      '<option value="">Tous</option><option value="in">Entrées</option><option value="out">Sorties</option>' +
      '<option value="scrap">Rebuts</option><option value="edit">Modifications</option>' +
      '<option value="del">Suppressions</option><option value="audit">Audits</option>' +
      '</select></div>' +
      '<div class="field"><label>Agent</label><input id="auditMoveUser" placeholder="Nom ou identifiant"></div>' +
      '</div>';
    if(!filtered2.length){h+='<div class="empty"><span class="ic">📋</span><b>Aucun mouvement</b></div>';}
    else{
      h+='<div class="tbl-scroll"><table class="tbl"><thead><tr><th>Date/Heure</th><th>Type</th><th>Article</th>' +
        '<th>Lot</th><th class="num">Qté</th><th>Agent</th><th>Emplacement</th><th>FEFO</th><th>Observation</th></tr></thead><tbody>';
      filtered2.slice(0,200).forEach(function(m){
        h+='<tr><td class="mono">'+esc((m.ts||"").replace("T"," ").slice(0,16))+'</td>' +
          '<td><span class="pill '+(P[m.kind]||"info")+'">'+(K[m.kind]||m.kind)+'</span></td>' +
          '<td class="t-name">'+esc(m.name)+'</td>' +
          '<td class="mono">'+esc(m.lot||"—")+'</td>' +
          '<td class="num">'+(m.qty==null?"—":m.qty)+'</td>' +
          '<td>'+esc(m.user||m.who||"—")+'</td>' +
          '<td>'+esc(m.loc||"—")+'</td>' +
          '<td>'+(m.kind==="out"?'<span class="pill '+(m.fefo_ok==="derogation"?"d90":"ok")+'">'+(m.fefo_ok==="derogation"?"Dérogation":"OK")+'</span>':"—")+'</td>' +
          '<td>'+esc(m.note||"")+'</td></tr>';
      });
      h+='</tbody></table></div>';
      if(filtered2.length>200)h+='<div class="count-note">200 premiers sur '+filtered2.length+'.</div>';
    }
    h+='</div></div>';
    $("#auditBody").innerHTML=h;
    $("#auditMoveKind").onchange=function(){ renderAuditMoves(); };
    $("#auditMoveUser").oninput=function(){ renderAuditMoves(); };
    if($("#csvAllMoves")) $("#csvAllMoves").onclick=function(){
      downloadCSV("journal_complet",
        ["Horodatage","Type","Article","Lot","Quantité","Agent","Emplacement","FEFO","Observation"],
        filtered2.map(function(m){return[(m.ts||"").replace("T"," ").slice(0,19),K[m.kind]||m.kind,m.name,m.lot||"",m.qty,m.user||m.who||"",m.loc||"",m.kind==="out"?(m.fefo_ok==="derogation"?"Dérogation":"OK"):"",m.note||""];}));
    };
  }
  function renderAuditLosses(){
    var perish=DB.filter(function(r){return band(r)!=="na";});
    var exp=DB.filter(function(r){return band(r)==="exp";});
    var scraps=MOVES.filter(function(m){return m.kind==="scrap";});
    var lossRate=perish.length?(exp.length/perish.length*100):0;
    var h='<div class="kpis">' +
      kpi(lossRate<=CFG.lossTarget?"ok":"crit",exp.length,"Lots périmés en stock","Pertes en stock actuel") +
      kpi("",scraps.length,"Lots mis au rebut","Via le module Sortie — total historique") +
      kpi(lossRate<=CFG.lossTarget?"ok":"crit",lossRate.toFixed(1)+" %","Taux de péremption (stock)","Cible < "+CFG.lossTarget+" % — SOP R-3 §6") +
      '</div>';
    // Expired lots details
    h+='<div class="card"><div class="card-h"><h3>Lots périmés en stock — Analyse des causes</h3>' +
      '<button class="btn btn-sm" onclick="exportRows(\'pertes\',DB.filter(function(r){return _band(r)===\"exp\";}))">Exporter CSV</button></div>' +
      '<div class="card-b flush">'+alertTable(exp,"Aucune perte en stock actuel.",true)+'</div></div>';
    // Scraps from moves
    h+='<div class="card"><div class="card-h"><h3>Historique des mises au rebut</h3>' +
      '<button class="btn btn-sm" id="csvScraps">Exporter CSV</button></div><div class="card-b flush">';
    if(!scraps.length){h+='<div class="empty"><span class="ic">✓</span><b>Aucune mise au rebut enregistrée</b></div>';}
    else{
      h+='<div class="tbl-scroll"><table class="tbl"><thead><tr><th>Date</th><th>Article</th><th>Lot</th><th class="num">Qté</th><th>Agent</th><th>Motif</th></tr></thead><tbody>';
      scraps.forEach(function(m){
        h+='<tr><td class="mono">'+esc((m.ts||"").slice(0,10))+'</td><td class="t-name">'+esc(m.name)+'</td>' +
          '<td class="mono">'+esc(m.lot||"—")+'</td><td class="num">'+esc(m.qty||"—")+'</td>' +
          '<td>'+esc(m.user||m.who||"—")+'</td><td>'+esc(m.note||"—")+'</td></tr>';
      });
      h+='</tbody></table></div>';
    }
    h+='</div></div>';
    $("#auditBody").innerHTML=h;
    window._band=band;
    if($("#csvScraps"))$("#csvScraps").onclick=function(){
      downloadCSV("rebuts",["Date","Article","Lot","Quantité","Agent","Motif"],
        scraps.map(function(m){return[(m.ts||"").slice(0,10),m.name,m.lot||"",m.qty||"",m.user||m.who||"",m.note||""];}));
    };
  }



})();

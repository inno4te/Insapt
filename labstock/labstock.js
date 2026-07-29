/* ===========================================================
   INSAPT — LaBiEp Lab Stock
   Gestion des stocks de réactifs & consommables
   Conforme SOP R-3 (PPSO/FEFO), SOP R-2 (réception/chaîne du froid)
   Manuel de Passation des Marchés INSAPT — Ch. 11.4 / 11.6 / 11.7
   =========================================================== */
(function () {
  "use strict";

  /* ---------------- Auth ---------------- */
  var USER = "labiep", PASS = "lab1ep";
  var LS_AUTH = "insapt_ls_auth";
  var LS_DATA = "insapt_ls_data";
  var LS_MOVES = "insapt_ls_moves";
  var LS_CFG = "insapt_ls_cfg";

  /* ------------- Alert thresholds (SOP R-3 §4.5 / §4.2) ------------- */
  var CFG_DEFAULT = {
    critDays: 30,      // SOP R-3 §4.5 — alerte prioritaire
    warnDays: 90,      // SOP R-3 §4.3 — double étiquetage
    watchDays: 365,    // SOP R-3 §4.2 — < 12 mois à réception
    lossTarget: 3,     // KPI : taux de péremption cible < 3 %
    varTarget: 2,      // KPI : écart inventaire < 2 %
    leadTime: 90,      // délai d'approvisionnement (jours)
    coverage: 60,      // stock de sécurité (jours)
    gsUrl: "",
    gsKey: "INSAPT-SCM-KEY"
  };

  var DB = [], MOVES = [], CFG = {}, VIEW = "dash", SORT = { k: "name", d: 1 };
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
      localStorage.setItem(LS_DATA, JSON.stringify(DB));
      localStorage.setItem(LS_MOVES, JSON.stringify(MOVES));
      localStorage.setItem(LS_CFG, JSON.stringify(CFG));
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
      if (u === USER && p === PASS) {
        try { sessionStorage.setItem(LS_AUTH, "1"); } catch (e2) {}
        openApp();
      } else {
        $("#loginErr").classList.add("show");
        $("#lp").value = ""; $("#lp").focus();
      }
    });
    try { if (sessionStorage.getItem(LS_AUTH) === "1") openApp(); } catch (e) {}
  }
  function openApp() {
    $("#login").style.display = "none";
    $("#app").classList.add("on");
    load(); buildFilters(); render();
  }
  function logout() {
    try { sessionStorage.removeItem(LS_AUTH); } catch (e) {}
    location.reload();
  }

  /* ================= NAVIGATION ================= */
  function go(v) {
    VIEW = v;
    $$(".nav a").forEach(function (a) { a.classList.toggle("on", a.dataset.v === v); });
    $$(".view").forEach(function (s) { s.classList.toggle("on", s.id === "v-" + v); });
    var titles = {
      dash: ["Tableau de bord", "Vue d'ensemble des stocks et alertes de péremption"],
      inv: ["Inventaire", "Base complète des lots — recherche, ajout, modification"],
      out: ["Sortie de stock (PPSO/FEFO)", "Prélèvement selon la séquence Premier Périmé Sorti en Premier"],
      recv: ["Réception", "Enregistrement d'un nouveau lot avec contrôles SOP R-2"],
      rep: ["Rapports", "Rapports réglementaires exportables en CSV"],
      ana: ["Analyse", "Doublons, niveaux de commande et qualité des données"],
      cfg: ["Paramètres & synchronisation", "Seuils d'alerte et connexion Google Sheets"]
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
  }
  function delLot(id) {
    var r = DB.filter(function (x) { return x.id === id; })[0]; if (!r) return;
    if (!confirm("Supprimer définitivement ce lot ?\n\n" + r.name + "\nLot : " + (r.lot || "—") +
                 "\nEmplacement : " + r.location)) return;
    DB = DB.filter(function (x) { return x.id !== id; });
    logMove("del", id, r.name, qty(r), "Lot supprimé de la base");
    save(); render(); toast("Lot supprimé", "ok");
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
    logMove(kind, r.id, r.name, n, why, who, r.lot, r.location);
    save(); $("#mIssue").classList.remove("on");
    render(); renderOut();
    toast((kind === "scrap" ? "Mise au rebut enregistrée : " : "Sortie enregistrée : ") +
      n + " " + (r.unit || "") + " — reste " + r.qty_remaining, "ok");
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
    logMove("in", rec.id, rec.name, rec.qty_received,
      "Réception — " + rec.source + " · PVIR", g("#rWho"), rec.lot, rec.location);
    save(); buildFilters(); render();
    $("#recvForm").reset(); $("#rCheck").style.display = "none";
    toast("Lot réceptionné et enregistré — " + rec.name, "ok");
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
      "Source initiale : " + (window.LS_SEED_META ? window.LS_SEED_META.count : 0) + " lots importés des fichiers LaBiEp";
  }
  function saveCfg(e) {
    e.preventDefault();
    ["critDays", "warnDays", "watchDays", "lossTarget", "varTarget", "leadTime", "coverage"]
      .forEach(function (k) { CFG[k] = Number($("#c_" + k).value) || CFG_DEFAULT[k]; });
    CFG.gsUrl = $("#c_gsUrl").value.trim();
    CFG.gsKey = $("#c_gsKey").value.trim() || CFG_DEFAULT.gsKey;
    save(); render(); toast("Paramètres enregistrés", "ok");
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
    var b = $("#btnPush"); b.disabled = true; b.textContent = "Envoi…";
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
        setSync(true, "Base rechargée depuis Google Sheets — " + DB.length + " lots");
        toast("Rechargé depuis Google : " + DB.length + " lots", "ok");
      })
      .catch(function (e) { setSync(false, e.message); toast("Échec du chargement : " + e.message, "err"); })
      .then(function () { b.disabled = false; b.textContent = "Recharger depuis Google"; });
  }
  function syncTest() {
    var b = $("#btnTest"); b.disabled = true; b.textContent = "Test…";
    gsCall("ping")
      .then(function (j) {
        if (!j.ok) throw new Error("Réponse inattendue");
        setSync(true, "Connexion établie");
        toast("Connexion Google Apps Script établie", "ok");
      })
      .catch(function (e) { setSync(false, e.message); toast("Échec : " + e.message, "err"); })
      .then(function () { b.disabled = false; b.textContent = "Tester la connexion"; });
  }
  function setSync(ok, msg) {
    $("#syncDot").className = "sync-dot " + (ok ? "ok" : "err");
    $("#syncTxt").textContent = msg || (ok ? "Connecté" : "Hors ligne");
    var e = $("#cfgSyncMsg");
    if (e) { e.className = "note " + (ok ? "ok" : "danger"); e.innerHTML = "<b>" + (ok ? "Succès" : "Échec") + "</b>" + esc(msg); e.style.display = ""; }
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
    if (VIEW === "dash") renderDash();
    else if (VIEW === "inv") renderInv();
    else if (VIEW === "out") renderOut();
    else if (VIEW === "rep") renderRep();
    else if (VIEW === "ana") renderAna();
    else if (VIEW === "cfg") renderCfg();
  }

  /* ================= WIRE UP ================= */
  document.addEventListener("DOMContentLoaded", function () {
    initLogin();
    $$(".nav a").forEach(function (a) { a.onclick = function (e) { e.preventDefault(); go(a.dataset.v); }; });
    $("#btnLogout").onclick = logout;
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
})();

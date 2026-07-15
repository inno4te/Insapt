/**
 * INSAPT — SCM Google Apps Script backend
 * ------------------------------------------------------------
 * Live Google Sheets store for the INSAPT SCM portal. Two datasets
 * share one spreadsheet, on two tabs:
 *   • "Stocks"  — asset / stock register (barcodes)
 *   • "CodeMP"  — Code des Marchés Publics (Décret N°2130/PR/2020)
 *
 * Deploy as a Web App (Execute as: Me, Access: Anyone) and paste
 * the /exec URL into the portal (Documents & liens → Connexion Google).
 *
 * STOCK endpoints
 *   GET  ?action=ping&key=...                 -> {ok:true}
 *   GET  ?action=list&key=...                 -> {ok:true, records:[...]}
 *   POST {action:"upsert", key, record}       -> {ok:true, code}
 *   POST {action:"bulk",   key, records}      -> {ok:true, count}
 *
 * CODE (Procurement Code) endpoints
 *   GET  ?action=code_list&key=...            -> {ok:true, articles:[...]}
 *   POST {action:"code_upsert", key, article} -> {ok:true, art}
 *   POST {action:"code_seed",   key, articles}-> {ok:true, count}
 *      (code_seed writes only if the CodeMP sheet is empty, so you can
 *       push the bundled 69 articles once to populate Google.)
 *
 * The portal sends POST bodies as text/plain to avoid CORS preflight.
 * ------------------------------------------------------------
 */

// 1) Set a shared key that matches what you type into the portal.
var SHARED_KEY = 'INSAPT-SCM-KEY';

// 2) Leave blank to auto-create/use a spreadsheet named below,
//    or paste an existing Spreadsheet ID here.
var SPREADSHEET_ID = '';
var SPREADSHEET_NAME = 'INSAPT — Registre des Stocks & Code des Marchés (SCM)';

// --- Stock register ---
var SHEET_NAME = 'Stocks';
var COLUMNS = ['code', 'name', 'cat', 'donor', 'qty', 'value',
               'loc', 'date', 'state', 'note', 'created', 'updated'];

// --- Procurement Code ---
var CODE_SHEET_NAME = 'CodeMP';
var CODE_COLUMNS = ['art', 'titre', 'chapitre', 'heading', 'body', 'tags', 'updated'];

/* ==================== ROUTER ==================== */

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.key !== SHARED_KEY) return json({ ok: false, error: 'unauthorized' });
  if (p.action === 'ping')      return json({ ok: true, ts: Date.now() });
  if (p.action === 'list')      return json({ ok: true, records: listRecords() });
  if (p.action === 'code_list') return json({ ok: true, articles: listArticles() });
  return json({ ok: false, error: 'unknown action' });
}

function doPost(e) {
  var body = {};
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json({ ok: false, error: 'bad json' }); }
  if (body.key !== SHARED_KEY) return json({ ok: false, error: 'unauthorized' });

  // Stock
  if (body.action === 'upsert' && body.record) {
    upsert(body.record);
    return json({ ok: true, code: body.record.code });
  }
  if (body.action === 'bulk' && body.records) {
    body.records.forEach(upsert);
    return json({ ok: true, count: body.records.length });
  }

  // Procurement Code
  if (body.action === 'code_upsert' && body.article) {
    upsertArticle(body.article);
    return json({ ok: true, art: body.article.art });
  }
  if (body.action === 'code_seed' && body.articles) {
    var n = seedArticles(body.articles);
    return json({ ok: true, count: n });
  }

  return json({ ok: false, error: 'unknown action' });
}

/* ==================== SPREADSHEET ==================== */

function getSpreadsheet() {
  if (SPREADSHEET_ID) return SpreadsheetApp.openById(SPREADSHEET_ID);
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SS_ID');
  if (id) return SpreadsheetApp.openById(id);
  var ss = SpreadsheetApp.create(SPREADSHEET_NAME);
  props.setProperty('SS_ID', ss.getId());
  return ss;
}

function getSheetByName(name, cols) {
  var ss = getSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, cols.length).setValues([cols]);
    sh.getRange(1, 1, 1, cols.length).setFontWeight('bold').setBackground('#052a5e').setFontColor('#ffffff');
    sh.setFrozenRows(1);
  }
  return sh;
}

function getSheet()     { return getSheetByName(SHEET_NAME, COLUMNS); }
function getCodeSheet() { return getSheetByName(CODE_SHEET_NAME, CODE_COLUMNS); }

/* ==================== STOCK ==================== */

function listRecords() {
  var sh = getSheet();
  var rng = sh.getDataRange().getValues();
  if (rng.length < 2) return [];
  var header = rng[0], out = [];
  for (var i = 1; i < rng.length; i++) {
    var row = rng[i], obj = {};
    for (var c = 0; c < header.length; c++) obj[header[c]] = row[c];
    if (obj.code) out.push(obj);
  }
  return out;
}

function upsert(rec) {
  var sh = getSheet();
  var values = sh.getDataRange().getValues();
  var header = values[0];
  var codeCol = header.indexOf('code');
  var now = new Date().toISOString();

  var rowIdx = -1;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][codeCol]) === String(rec.code)) { rowIdx = i + 1; break; }
  }
  var line = COLUMNS.map(function (k) {
    if (k === 'updated') return now;
    if (k === 'created') return rec.created ? new Date(rec.created).toISOString() : now;
    return rec[k] != null ? rec[k] : '';
  });
  if (rowIdx > 0) sh.getRange(rowIdx, 1, 1, COLUMNS.length).setValues([line]);
  else sh.appendRow(line);
}

/* ==================== PROCUREMENT CODE ==================== */

// tags are stored as a single "|"-joined cell; converted back to array on read.
function listArticles() {
  var sh = getCodeSheet();
  var rng = sh.getDataRange().getValues();
  if (rng.length < 2) return [];
  var header = rng[0], out = [];
  for (var i = 1; i < rng.length; i++) {
    var row = rng[i], obj = {};
    for (var c = 0; c < header.length; c++) obj[header[c]] = row[c];
    if (!obj.art && obj.art !== 0) continue;
    obj.art = String(obj.art);
    obj.tags = obj.tags ? String(obj.tags).split('|').map(function (t) { return t.trim(); }).filter(Boolean) : [];
    delete obj.updated;
    out.push(obj);
  }
  return out;
}

function upsertArticle(a) {
  var sh = getCodeSheet();
  var values = sh.getDataRange().getValues();
  var header = values[0];
  var artCol = header.indexOf('art');
  var now = new Date().toISOString();

  var rowIdx = -1;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][artCol]) === String(a.art)) { rowIdx = i + 1; break; }
  }
  var tags = Array.isArray(a.tags) ? a.tags.join('|') : (a.tags || '');
  var line = CODE_COLUMNS.map(function (k) {
    if (k === 'updated') return now;
    if (k === 'tags') return tags;
    return a[k] != null ? a[k] : '';
  });
  if (rowIdx > 0) sh.getRange(rowIdx, 1, 1, CODE_COLUMNS.length).setValues([line]);
  else sh.appendRow(line);
}

// Seeds the CodeMP sheet only if it's currently empty (header only).
function seedArticles(articles) {
  var sh = getCodeSheet();
  if (sh.getLastRow() > 1) return 0; // already populated; do nothing
  var now = new Date().toISOString();
  var rows = articles.map(function (a) {
    var tags = Array.isArray(a.tags) ? a.tags.join('|') : (a.tags || '');
    return CODE_COLUMNS.map(function (k) {
      if (k === 'updated') return now;
      if (k === 'tags') return tags;
      return a[k] != null ? a[k] : '';
    });
  });
  if (rows.length) sh.getRange(2, 1, rows.length, CODE_COLUMNS.length).setValues(rows);
  return rows.length;
}

/* ==================== UTIL ==================== */

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* Run once from the editor to create the spreadsheet + tabs and grant scopes. */
function setup() {
  var s1 = getSheet();
  var s2 = getCodeSheet();
  Logger.log('Spreadsheet ready: ' + s1.getParent().getUrl());
}

/**
 * INSAPT — SCM Google Apps Script backend
 * ------------------------------------------------------------
 * Provides a live Google Sheets store for the INSAPT SCM portal.
 * Deploy as a Web App (Execute as: Me, Access: Anyone) and paste
 * the /exec URL into the portal (Documents & liens → Connexion Google).
 *
 * Endpoints
 *   GET  ?action=ping&key=...              -> {ok:true}
 *   GET  ?action=list&key=...              -> {ok:true, records:[...]}
 *   POST {action:"upsert", key, record}    -> {ok:true, code}
 *   POST {action:"bulk",   key, records}   -> {ok:true, count}
 *
 * The portal sends POST bodies as text/plain to avoid CORS preflight.
 * ------------------------------------------------------------
 */

// 1) Set a shared key that matches what you type into the portal.
var SHARED_KEY = 'INSAPT-SCM-KEY';

// 2) Leave blank to auto-create/use a spreadsheet named below,
//    or paste an existing Spreadsheet ID here.
var SPREADSHEET_ID = '';
var SPREADSHEET_NAME = 'INSAPT — Registre des Stocks (SCM)';
var SHEET_NAME = 'Stocks';

var COLUMNS = ['code', 'name', 'cat', 'donor', 'qty', 'value',
               'loc', 'date', 'state', 'note', 'created', 'updated'];

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.key !== SHARED_KEY) return json({ ok: false, error: 'unauthorized' });
  if (p.action === 'ping') return json({ ok: true, ts: Date.now() });
  if (p.action === 'list') return json({ ok: true, records: listRecords() });
  return json({ ok: false, error: 'unknown action' });
}

function doPost(e) {
  var body = {};
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json({ ok: false, error: 'bad json' }); }
  if (body.key !== SHARED_KEY) return json({ ok: false, error: 'unauthorized' });

  if (body.action === 'upsert' && body.record) {
    upsert(body.record);
    return json({ ok: true, code: body.record.code });
  }
  if (body.action === 'bulk' && body.records) {
    body.records.forEach(upsert);
    return json({ ok: true, count: body.records.length });
  }
  return json({ ok: false, error: 'unknown action' });
}

/* ---------------- Sheet helpers ---------------- */

function getSheet() {
  var ss;
  if (SPREADSHEET_ID) {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  } else {
    var props = PropertiesService.getScriptProperties();
    var id = props.getProperty('SS_ID');
    if (id) {
      ss = SpreadsheetApp.openById(id);
    } else {
      ss = SpreadsheetApp.create(SPREADSHEET_NAME);
      props.setProperty('SS_ID', ss.getId());
    }
  }
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]);
    sh.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold').setBackground('#052a5e').setFontColor('#ffffff');
    sh.setFrozenRows(1);
  }
  return sh;
}

function listRecords() {
  var sh = getSheet();
  var rng = sh.getDataRange().getValues();
  if (rng.length < 2) return [];
  var header = rng[0];
  var out = [];
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

  // find existing row by code
  var rowIdx = -1;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][codeCol]) === String(rec.code)) { rowIdx = i + 1; break; }
  }

  var line = COLUMNS.map(function (k) {
    if (k === 'updated') return now;
    if (k === 'created') return rec.created ? new Date(rec.created).toISOString() : now;
    return rec[k] != null ? rec[k] : '';
  });

  if (rowIdx > 0) {
    sh.getRange(rowIdx, 1, 1, COLUMNS.length).setValues([line]);
  } else {
    sh.appendRow(line);
  }
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* Optional: run once from the editor to create the sheet and grant scopes. */
function setup() {
  var sh = getSheet();
  Logger.log('Spreadsheet ready: ' + sh.getParent().getUrl());
}

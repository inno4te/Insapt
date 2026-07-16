/**
 * INSAPT — SCM + Academy Google Apps Script backend
 * ------------------------------------------------------------
 * One spreadsheet, four tabs:
 *   • Stocks     — asset / stock register (barcodes)
 *   • CodeMP     — Code des Marchés Publics (Décret N°2130/PR/2020)
 *   • Learners   — INSAPT Academy learners & progress
 *   • ELSettings — Academy settings (signer, pass mark)
 *
 * Deploy as a Web App (Execute as: Me, Access: Anyone) and paste
 * the /exec URL into the SCM portal (Documents & liens).
 * The Academy uses the same URL and shared key.
 *
 * STOCK endpoints
 *   GET  ?action=ping&key=...                 -> {ok:true}
 *   GET  ?action=list&key=...                 -> {ok:true, records:[...]}
 *   POST {action:"upsert", key, record}       -> {ok:true, code}
 *   POST {action:"bulk",   key, records}      -> {ok:true, count}
 *
 * CODE endpoints
 *   GET  ?action=code_list&key=...            -> {ok:true, articles:[...]}
 *   POST {action:"code_upsert", key, article} -> {ok:true, art}
 *   POST {action:"code_seed",   key, articles}-> {ok:true, count}
 *
 * ACADEMY endpoints
 *   POST {action:"el_login", key, name, section} -> {ok, id, name, section, progress, settings}
 *   POST {action:"el_save",  key, id, name, section, progress} -> {ok}
 *   GET  ?action=el_settings&key=...          -> {ok, settings}
 *   GET  ?action=el_admin_list&key=...&admin=user:pass -> {ok, learners:[...]}
 *   POST {action:"el_settings_set", key, admin, settings} -> {ok}
 * ------------------------------------------------------------
 */

var SHARED_KEY = 'INSAPT-SCM-KEY';
var SPREADSHEET_ID = '';
var SPREADSHEET_NAME = 'INSAPT — SCM & Academy';

var ADMIN_USER = 'forteh';
var ADMIN_PASS = 'f0rteh';

var SHEET_NAME  = 'Stocks';
var COLUMNS     = ['code','name','cat','donor','qty','value','loc','date','state','note','created','updated'];

var CODE_SHEET_NAME = 'CodeMP';
var CODE_COLUMNS    = ['art','titre','chapitre','heading','body','tags','updated'];

var EL_SHEET_NAME     = 'Learners';
var EL_COLUMNS        = ['id','name','section','progress','created','updated'];
var EL_SET_SHEET_NAME = 'ELSettings';
var EL_SET_COLUMNS    = ['key','value'];

/* ==================== ROUTER ==================== */

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.key !== SHARED_KEY) return json({ ok:false, error:'unauthorized' });
  if (p.action === 'ping')          return json({ ok:true, ts:Date.now() });
  if (p.action === 'list')          return json({ ok:true, records:listRecords() });
  if (p.action === 'code_list')     return json({ ok:true, articles:listArticles() });
  if (p.action === 'el_settings')   return json({ ok:true, settings:readSettings() });
  if (p.action === 'el_admin_list') {
    if (!isAdmin(p.admin)) return json({ ok:false, error:'admin auth' });
    return json({ ok:true, learners:listLearners() });
  }
  return json({ ok:false, error:'unknown action' });
}

function doPost(e) {
  var body = {};
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json({ ok:false, error:'bad json' }); }
  if (body.key !== SHARED_KEY) return json({ ok:false, error:'unauthorized' });

  // Stock
  if (body.action === 'upsert' && body.record) { upsert(body.record); return json({ ok:true, code:body.record.code }); }
  if (body.action === 'bulk'   && body.records){ body.records.forEach(upsert); return json({ ok:true, count:body.records.length }); }

  // Code
  if (body.action === 'code_upsert' && body.article) { upsertArticle(body.article); return json({ ok:true, art:body.article.art }); }
  if (body.action === 'code_seed'   && body.articles){ return json({ ok:true, count:seedArticles(body.articles) }); }

  // Academy
  if (body.action === 'el_login')      return json(elLogin(body.name, body.section));
  if (body.action === 'el_save')       return json(elSave(body));
  if (body.action === 'el_settings_set') {
    if (!isAdmin(body.admin)) return json({ ok:false, error:'admin auth' });
    writeSettings(body.settings || {});
    return json({ ok:true });
  }

  return json({ ok:false, error:'unknown action' });
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
    sh.getRange(1,1,1,cols.length).setValues([cols]);
    sh.getRange(1,1,1,cols.length).setFontWeight('bold').setBackground('#052a5e').setFontColor('#ffffff');
    sh.setFrozenRows(1);
  }
  return sh;
}
function getSheet()      { return getSheetByName(SHEET_NAME, COLUMNS); }
function getCodeSheet()  { return getSheetByName(CODE_SHEET_NAME, CODE_COLUMNS); }
function getELSheet()    { return getSheetByName(EL_SHEET_NAME, EL_COLUMNS); }
function getELSetSheet() { return getSheetByName(EL_SET_SHEET_NAME, EL_SET_COLUMNS); }

/* ==================== STOCK ==================== */

function listRecords() {
  var sh = getSheet(), rng = sh.getDataRange().getValues();
  if (rng.length < 2) return [];
  var header = rng[0], out = [];
  for (var i=1;i<rng.length;i++){ var row=rng[i],o={}; for (var c=0;c<header.length;c++) o[header[c]]=row[c]; if (o.code) out.push(o); }
  return out;
}
function upsert(rec) {
  var sh = getSheet(), values = sh.getDataRange().getValues(), header = values[0];
  var codeCol = header.indexOf('code'), now = new Date().toISOString(), rowIdx = -1;
  for (var i=1;i<values.length;i++) if (String(values[i][codeCol])===String(rec.code)) { rowIdx=i+1; break; }
  var line = COLUMNS.map(function(k){
    if (k==='updated') return now;
    if (k==='created') return rec.created ? new Date(rec.created).toISOString() : now;
    return rec[k]!=null?rec[k]:'';
  });
  if (rowIdx>0) sh.getRange(rowIdx,1,1,COLUMNS.length).setValues([line]);
  else sh.appendRow(line);
}

/* ==================== CODE MP ==================== */

function listArticles() {
  var sh = getCodeSheet(), rng = sh.getDataRange().getValues();
  if (rng.length < 2) return [];
  var header = rng[0], out = [];
  for (var i=1;i<rng.length;i++){
    var row=rng[i], o={}; for (var c=0;c<header.length;c++) o[header[c]]=row[c];
    if (o.art===''||o.art==null) continue;
    o.art = String(o.art);
    o.tags = o.tags ? String(o.tags).split('|').map(function(x){return x.trim();}).filter(Boolean) : [];
    delete o.updated; out.push(o);
  }
  return out;
}
function upsertArticle(a) {
  var sh = getCodeSheet(), values = sh.getDataRange().getValues(), header = values[0];
  var artCol = header.indexOf('art'), now = new Date().toISOString(), rowIdx = -1;
  for (var i=1;i<values.length;i++) if (String(values[i][artCol])===String(a.art)) { rowIdx=i+1; break; }
  var tags = Array.isArray(a.tags)?a.tags.join('|'):(a.tags||'');
  var line = CODE_COLUMNS.map(function(k){
    if (k==='updated') return now;
    if (k==='tags')    return tags;
    return a[k]!=null?a[k]:'';
  });
  if (rowIdx>0) sh.getRange(rowIdx,1,1,CODE_COLUMNS.length).setValues([line]);
  else sh.appendRow(line);
}
function seedArticles(articles) {
  var sh = getCodeSheet();
  if (sh.getLastRow() > 1) return 0;
  var now = new Date().toISOString();
  var rows = articles.map(function(a){
    var tags = Array.isArray(a.tags)?a.tags.join('|'):(a.tags||'');
    return CODE_COLUMNS.map(function(k){
      if (k==='updated') return now;
      if (k==='tags')    return tags;
      return a[k]!=null?a[k]:'';
    });
  });
  if (rows.length) sh.getRange(2,1,rows.length,CODE_COLUMNS.length).setValues(rows);
  return rows.length;
}

/* ==================== ACADEMY ==================== */

function slug(s){ return String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
function isAdmin(a){ return a === (ADMIN_USER+':'+ADMIN_PASS); }

function elLogin(name, section) {
  if (!name) return { ok:false, error:'name required' };
  var sh = getELSheet();
  var values = sh.getDataRange().getValues();
  var header = values[0];
  var iName = header.indexOf('name'), iSec = header.indexOf('section'), iProg = header.indexOf('progress'), iId = header.indexOf('id');
  var id = slug(name) + (section ? '-' + slug(section).slice(0,10) : '');
  var now = new Date().toISOString(), rowIdx = -1, existing = null;
  for (var i=1;i<values.length;i++){
    if (String(values[i][iId])===id) { rowIdx=i+1; existing=values[i]; break; }
  }
  if (rowIdx > 0) {
    // update touched fields
    sh.getRange(rowIdx, iSec+1).setValue(section || existing[iSec]);
    sh.getRange(rowIdx, header.indexOf('updated')+1).setValue(now);
    return { ok:true, id:id, name:existing[iName], section:section||existing[iSec], progress:existing[iProg]||'', settings: readSettings() };
  }
  var line = EL_COLUMNS.map(function(k){
    if (k==='id') return id; if (k==='name') return name;
    if (k==='section') return section||''; if (k==='progress') return '';
    if (k==='created' || k==='updated') return now; return '';
  });
  sh.appendRow(line);
  return { ok:true, id:id, name:name, section:section||'', progress:'', settings: readSettings() };
}

function elSave(b) {
  if (!b.id) return { ok:false, error:'id required' };
  var sh = getELSheet();
  var values = sh.getDataRange().getValues();
  var header = values[0];
  var iId = header.indexOf('id');
  var now = new Date().toISOString();
  for (var i=1;i<values.length;i++){
    if (String(values[i][iId]) === String(b.id)) {
      if (b.name)     sh.getRange(i+1, header.indexOf('name')+1).setValue(b.name);
      if (b.section)  sh.getRange(i+1, header.indexOf('section')+1).setValue(b.section);
      if (b.progress!=null) sh.getRange(i+1, header.indexOf('progress')+1).setValue(b.progress);
      sh.getRange(i+1, header.indexOf('updated')+1).setValue(now);
      return { ok:true };
    }
  }
  // if not found, create it
  var line = EL_COLUMNS.map(function(k){
    if (k==='id') return b.id;
    if (k==='name') return b.name||'';
    if (k==='section') return b.section||'';
    if (k==='progress') return b.progress||'';
    if (k==='created' || k==='updated') return now;
    return '';
  });
  sh.appendRow(line);
  return { ok:true, created:true };
}

function listLearners() {
  var sh = getELSheet(), rng = sh.getDataRange().getValues();
  if (rng.length < 2) return [];
  var header = rng[0], out = [];
  for (var i=1;i<rng.length;i++){
    var row=rng[i], o={}; for (var c=0;c<header.length;c++) o[header[c]]=String(row[c]);
    if (o.id) out.push(o);
  }
  return out;
}

function readSettings() {
  var sh = getELSetSheet(), rng = sh.getDataRange().getValues(), o = {};
  for (var i=1;i<rng.length;i++) { if (rng[i][0]) o[rng[i][0]] = rng[i][1]; }
  return o;
}
function writeSettings(s) {
  var sh = getELSetSheet();
  var values = sh.getDataRange().getValues();
  var map = {};
  for (var i=1;i<values.length;i++) if (values[i][0]) map[values[i][0]] = i+1;
  Object.keys(s).forEach(function(k){
    if (map[k]) sh.getRange(map[k], 2).setValue(s[k]);
    else sh.appendRow([k, s[k]]);
  });
}

/* ==================== UTIL ==================== */

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* Run once from the editor to create all tabs and grant scopes. */
function setup() {
  getSheet(); getCodeSheet(); getELSheet(); getELSetSheet();
  Logger.log('Spreadsheet ready: ' + getSpreadsheet().getUrl());
}

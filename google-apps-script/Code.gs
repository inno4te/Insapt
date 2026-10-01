/**
 * INSAPT — SCM + Academy Google Apps Script backend
 * ------------------------------------------------------------
 * One spreadsheet, four tabs:
 *   • Stocks     — asset / stock register (barcodes)
 *   • CodeMP     — Code des Marchés Publics (Décret N°2130/PR/2020)
 *   • Learners   — INSAPT Academy learners & progress
 *   • ELSettings — Academy settings (signer, pass mark)
 *   • LabStock   — LaBiEp stock lots (réactifs, consommables, équipements)
 *   • LabMoves   — journal des mouvements (entrées, sorties, rebuts)
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
 *
 * LAB STOCK endpoints (LaBiEp — réactifs & consommables)
 *   GET  ?action=ls_list&key=...              -> {ok:true, records:[...]}
 *   POST {action:"ls_seed",   key, records}   -> {ok:true, count}   (remplace tout)
 *   POST {action:"ls_upsert", key, record}    -> {ok:true, id}
 *   POST {action:"ls_delete", key, id}        -> {ok:true}
 *   GET  ?action=ls_moves&key=...             -> {ok:true, moves:[...]}
 *   POST {action:"ls_move",   key, move}      -> {ok:true}
 *   GET  ?action=ls_users&key=...             -> {ok:true, users:[...]}
 *   POST {action:"ls_user_upsert", key, user_rec} -> {ok:true}
 *   POST {action:"ls_auth",  user, pass}     -> {ok, role, name}  (no key needed)
 *   POST {action:"ls_bulk_upsert", key, records} -> {ok:true, count}  (ADDITIVE push)
 *
 * ERP ACHATS endpoints (record-level, additive, stale writes refused)
 *   GET  ?action=erp_list&key=...[&since=ISO] -> {ok:true, records:[{coll,id,updated,data}]}
 *   POST {action:"erp_upsert", key, rec}         -> {ok, count, stale:[...]}
 *   POST {action:"erp_bulk",   key, recs}        -> {ok, count, stale:[...]}
 *   POST {action:"erp_file_put", key, id,name,type,data} / GET ?action=erp_file_get&id=
 *
 * SYNC POLICY: ls_bulk_upsert and ls_upsert are ALWAYS additive (insert-or-update).
 *   NEVER use ls_seed (full-replace) from autoConnect.
 *   ls_seed is reserved for deliberate manual resets only.
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
  if (p.action === 'ls_list')       return json({ ok:true, records:lsList() });
  if (p.action === 'ls_moves')      return json({ ok:true, moves:lsMoves() });
  if (p.action === 'ls_users')      return json({ ok:true, users:lsListUsers() });
  if (p.action === 'erp_list')      return json({ ok:true, records:erpList(p.since) });
  if (p.action === 'erp_file_get')  return json(erpFileGet(p.id));
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
  if (body.action === 'ls_seed'   && body.records) { return json({ ok:true, count:lsSeed(body.records) }); }
  if (body.action === 'ls_upsert' && body.record)  { lsUpsert(body.record); return json({ ok:true, id:body.record.id }); }
  if (body.action === 'ls_delete' && body.id)      { lsDelete(body.id); return json({ ok:true }); }
  if (body.action === 'ls_move'   && body.move)    { lsMove(body.move); return json({ ok:true }); }
  if (body.action === 'ls_user_upsert' && body.user_rec) { lsUpsertUser(body.user_rec); return json({ ok:true }); }
  if (body.action === 'ls_bulk_upsert' && body.records)  { return json({ ok:true, count:lsBulkUpsert(body.records) }); }
  if (body.action === 'ls_auth')   { return json(lsAuth(body.user, body.pass)); }

  // ERP Achats INSAPT (additif : insertion ou mise à jour par enregistrement, jamais d'effacement)
  if (body.action === 'erp_upsert' && body.rec)   return json(erpUpsertSafe([body.rec]));
  if (body.action === 'erp_bulk'   && body.recs)  return json(erpUpsertSafe(body.recs));
  if (body.action === 'erp_file_put' && body.id)  return json(erpFilePut(body));

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


/* ==================== LAB STOCK (LaBiEp) ====================
   Feuille LabStock : un lot par ligne.
   Feuille LabMoves : journal des mouvements (append-only).
   Conforme SOP R-3 §4.1 — champs de traçabilité obligatoires.
============================================================ */

var LS_COLS = ['id','name','category','subcategory','manufacturer','catalog_ref','lot','serial',
               'qty_received','qty_remaining','unit','date_reception','date_manufacture','date_expiry',
               'expiry_flag','location','temperature','last_update','notes','source','status','min_level'];

var LS_MOVE_COLS = ['ts','kind','id','name','lot','qty','loc','who','note'];

function getLabSheet() {
  var ss = getSpreadsheet();
  var sh = ss.getSheetByName('LabStock');
  if (!sh) {
    sh = ss.insertSheet('LabStock');
    sh.appendRow(LS_COLS);
    sh.getRange(1,1,1,LS_COLS.length).setFontWeight('bold').setBackground('#eef3fb');
    sh.setFrozenRows(1);
  }
  return sh;
}

function getLabMoveSheet() {
  var ss = getSpreadsheet();
  var sh = ss.getSheetByName('LabMoves');
  if (!sh) {
    sh = ss.insertSheet('LabMoves');
    sh.appendRow(LS_MOVE_COLS);
    sh.getRange(1,1,1,LS_MOVE_COLS.length).setFontWeight('bold').setBackground('#eef3fb');
    sh.setFrozenRows(1);
  }
  return sh;
}

/* Dates arrive as 'YYYY-MM-DD' strings; keep them as text so no locale drift. */
function lsCell(v) {
  if (v === null || v === undefined) return '';
  if (v instanceof Date) return Utilities.formatDate(v, 'UTC', 'yyyy-MM-dd');
  return v;
}

function lsList() {
  var sh = getLabSheet();
  var vals = sh.getDataRange().getValues();
  if (vals.length < 2) return [];
  var hdr = vals[0].map(function(h){ return String(h).trim(); });
  var out = [];
  for (var i = 1; i < vals.length; i++) {
    if (!vals[i][0] && !vals[i][1]) continue;
    var o = {};
    for (var c = 0; c < hdr.length; c++) o[hdr[c]] = lsCell(vals[i][c]);
    ['qty_received','qty_remaining','min_level'].forEach(function(k){
      o[k] = (o[k] === '' || o[k] === null) ? null : Number(o[k]);
    });
    out.push(o);
  }
  return out;
}

/* Full replace — used by "Publier vers Google". Chunked for large batches. */
function lsSeed(records) {
  var sh = getLabSheet();
  sh.clear();
  sh.appendRow(LS_COLS);
  sh.getRange(1,1,1,LS_COLS.length).setFontWeight('bold').setBackground('#eef3fb');
  sh.setFrozenRows(1);
  if (!records || !records.length) return 0;
  var rows = records.map(function(r){
    return LS_COLS.map(function(c){
      var v = r[c];
      return (v === null || v === undefined) ? '' : v;
    });
  });
  var CHUNK = 500;
  for (var i = 0; i < rows.length; i += CHUNK) {
    var slice = rows.slice(i, i + CHUNK);
    sh.getRange(sh.getLastRow() + 1, 1, slice.length, LS_COLS.length).setValues(slice);
  }
  // keep date columns as plain text to avoid locale reformatting
  var n = sh.getLastRow() - 1;
  if (n > 0) {
    [12,13,14,18].forEach(function(col){
      sh.getRange(2, col, n, 1).setNumberFormat('@');
    });
  }
  return rows.length;
}

function lsUpsert(rec) {
  var sh = getLabSheet();
  var vals = sh.getDataRange().getValues();
  var rowIdx = -1;
  for (var i = 1; i < vals.length; i++) {
    if (String(vals[i][0]) === String(rec.id)) { rowIdx = i + 1; break; }
  }
  var row = LS_COLS.map(function(c){
    var v = rec[c];
    return (v === null || v === undefined) ? '' : v;
  });
  if (rowIdx > 0) sh.getRange(rowIdx, 1, 1, LS_COLS.length).setValues([row]);
  else sh.appendRow(row);
}

function lsDelete(id) {
  var sh = getLabSheet();
  var vals = sh.getDataRange().getValues();
  for (var i = vals.length - 1; i >= 1; i--) {
    if (String(vals[i][0]) === String(id)) sh.deleteRow(i + 1);
  }
}

function lsMove(m) {
  var sh = getLabMoveSheet();
  sh.appendRow(LS_MOVE_COLS.map(function(c){
    var v = m[c];
    return (v === null || v === undefined) ? '' : v;
  }));
}

function lsMoves() {
  var sh = getLabMoveSheet();
  var vals = sh.getDataRange().getValues();
  if (vals.length < 2) return [];
  var hdr = vals[0].map(function(h){ return String(h).trim(); });
  var out = [];
  for (var i = 1; i < vals.length; i++) {
    var o = {};
    for (var c = 0; c < hdr.length; c++) o[hdr[c]] = lsCell(vals[i][c]);
    out.push(o);
  }
  return out.reverse();
}



/* Additive bulk upsert — inserts or updates each record by id.
   NEVER clears the sheet. Safe to call from autoConnect and syncPush.
   Processes in batches internally; caller batches at 50 records. */
function lsBulkUpsert(records) {
  if (!records || !records.length) return 0;
  var sh = getLabSheet();
  var vals = sh.getDataRange().getValues();
  /* Build id->rowIndex map (1-based, first data row = 2) */
  var idCol = LS_COLS.indexOf('id');
  var rowMap = {};
  for (var i = 1; i < vals.length; i++) {
    var id = String(vals[i][idCol] || '');
    if (id) rowMap[id] = i + 1;   /* 1-based sheet row */
  }
  var toAppend = [];
  records.forEach(function(rec) {
    var row = LS_COLS.map(function(c){ var v=rec[c]; return (v===null||v===undefined)?'':v; });
    var rid = String(rec.id || '');
    if (rid && rowMap[rid]) {
      /* Update existing row */
      sh.getRange(rowMap[rid], 1, 1, LS_COLS.length).setValues([row]);
    } else {
      toAppend.push(row);
    }
  });
  if (toAppend.length) {
    sh.getRange(sh.getLastRow() + 1, 1, toAppend.length, LS_COLS.length).setValues(toAppend);
  }
  return records.length;
}

/* ==================== LAB STOCK — USER MANAGEMENT ====================
   Tab: LabUsers
   Columns: user, pass, name, section, role, active, created, updated
   Passwords are stored as SHA-256 hex to avoid plain-text in sheet.
   For a simple deployment SHA-256 is implemented in pure GS below.
================================================================ */

var LS_USER_COLS = ['user','pass','name','section','role','active','created','updated'];

function getLabUserSheet() {
  var ss = getSpreadsheet();
  var sh = ss.getSheetByName('LabUsers');
  if (!sh) {
    sh = ss.insertSheet('LabUsers');
    sh.appendRow(LS_USER_COLS);
    sh.getRange(1,1,1,LS_USER_COLS.length).setFontWeight('bold').setBackground('#eef3fb');
    sh.setFrozenRows(1);
    /* Protect password column (col 2) from accidental view */
    sh.getRange(1,2,1000,1).setNumberFormat('@');
  }
  return sh;
}

function lsListUsers() {
  var sh = getLabUserSheet();
  var vals = sh.getDataRange().getValues();
  if (vals.length < 2) return [];
  var hdr = vals[0];
  return vals.slice(1).filter(function(r){ return r[0]; }).map(function(r){
    var o = {};
    hdr.forEach(function(k,i){ o[k] = lsCell(r[i]); });
    delete o.pass;  /* never return password */
    return o;
  });
}

function lsUpsertUser(rec) {
  var sh = getLabUserSheet();
  var vals = sh.getDataRange().getValues();
  var rowIdx = -1;
  for (var i = 1; i < vals.length; i++) {
    if (String(vals[i][0]).toLowerCase() === String(rec.user).toLowerCase()) { rowIdx = i+1; break; }
  }
  /* Hash password if provided */
  if (rec.pass) rec.pass = lsHashPass(rec.pass);
  else if (rowIdx > 0) {
    /* Keep existing password */
    rec.pass = String(vals[rowIdx-1][1]);
  }
  rec.updated = new Date().toISOString().slice(0,10);
  if (!rec.created) rec.created = rec.updated;
  var row = LS_USER_COLS.map(function(k){ return rec[k] !== undefined ? rec[k] : ''; });
  if (rowIdx > 0) sh.getRange(rowIdx, 1, 1, LS_USER_COLS.length).setValues([row]);
  else sh.appendRow(row);
}

/* Validate credentials — called by ls_auth endpoint (no shared key needed).
   Rate limiting: not implemented here; rely on GS execution limits. */
function lsAuth(user, pass) {
  if (!user || !pass) return { ok: false, error: 'Missing credentials' };
  var sh = getLabUserSheet();
  var vals = sh.getDataRange().getValues();
  if (vals.length < 2) return { ok: false, error: 'No users' };
  var hdr = vals[0];
  var col = function(n){ return hdr.indexOf(n); };
  var hash = lsHashPass(pass);
  for (var i = 1; i < vals.length; i++) {
    var u = String(vals[i][col('user')]).toLowerCase();
    if (u !== String(user).toLowerCase()) continue;
    if (vals[i][col('active')] === 'false') return { ok:false, error:'Compte désactivé' };
    var stored = String(vals[i][col('pass')]);
    if (stored !== hash) return { ok:false, error:'Mot de passe incorrect' };
    return { ok:true, role: String(vals[i][col('role')])||'operator',
             name: String(vals[i][col('name')])||user };
  }
  return { ok:false, error:'Utilisateur introuvable' };
}

/* Simple SHA-256 via GS Utilities.computeDigest */
function lsHashPass(pass) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(pass), Utilities.Charset.UTF_8);
  return bytes.map(function(b){ return ('0'+(b & 0xFF).toString(16)).slice(-2); }).join('');
}


/* ==================== ERP ACHATS INSAPT ====================
   Feuille ERP      : une ligne par enregistrement (dossier, fournisseur, ligne budgétaire, journal…)
                      colonnes key | coll | id | updated | data(JSON)
   Feuille ERPFiles : pièces jointes découpées en morceaux de 40 000 caractères
                      colonnes fileId | part | total | name | type | updated | chunk
   Politique : insertion ou mise à jour par enregistrement. Une écriture plus ancienne que
   la version stockée est refusée (renvoie la version actuelle). Rien n'est jamais effacé.
============================================================ */
var ERP_COLS  = ['key','coll','id','updated','data'];
var ERPF_COLS = ['fileId','part','total','name','type','updated','chunk'];
var ERP_CHUNK = 40000;

function getErpSheet()  { return getSheetByName('ERP', ERP_COLS); }
function getErpFSheet() { return getSheetByName('ERPFiles', ERPF_COLS); }

function erpList(since) {
  var sh = getErpSheet(), v = sh.getDataRange().getValues(), out = [];
  for (var i = 1; i < v.length; i++) {
    if (!v[i][0]) continue;
    var up = String(v[i][3] || '');
    if (since && up <= String(since)) continue;
    var d = null; try { d = JSON.parse(v[i][4]); } catch (e) { continue; }
    out.push({ coll: String(v[i][1]), id: String(v[i][2]), updated: up, data: d });
  }
  return out;
}

function erpUpsertSafe(recs) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(20000); } catch (e) { return { ok:false, error:'busy' }; }
  try {
    var sh = getErpSheet();
    sh.getRange('D:E').setNumberFormat('@');   // texte brut AVANT écriture : évite la conversion des dates ISO
    var v = sh.getDataRange().getValues(), map = {}, stale = [], n = 0, add = [];
    for (var i = 1; i < v.length; i++) if (v[i][0]) map[String(v[i][0])] = { row: i + 1, updated: String(v[i][3] || ''), data: v[i][4] };
    recs.forEach(function (r) {
      if (!r || !r.coll || !r.id) return;
      var key = r.coll + ':' + r.id, up = String(r.updated || new Date().toISOString());
      var js = JSON.stringify(r.data || {});
      if (js.length > 49000) { stale.push({ key:key, error:'too large' }); return; }
      var cur = map[key];
      if (cur && cur.updated > up) {          // version stockée plus récente : on refuse l'écriture
        var cd = null; try { cd = JSON.parse(cur.data); } catch (e) {}
        stale.push({ coll:r.coll, id:r.id, updated:cur.updated, data:cd }); return;
      }
      var row = [key, r.coll, r.id, up, js];
      if (cur && cur.row > 0) sh.getRange(cur.row, 1, 1, ERP_COLS.length).setValues([row]);
      else if (cur) { add[cur.addIdx] = row; cur.updated = up; cur.data = js; }   // même clé deux fois dans le lot
      else { map[key] = { row: -1, addIdx: add.length, updated: up, data: js }; add.push(row); }
      n++;
    });
    if (add.length) sh.getRange(sh.getLastRow() + 1, 1, add.length, ERP_COLS.length).setValues(add);
    return { ok:true, count:n, stale:stale };
  } finally { lock.releaseLock(); }
}

function erpFilePut(b) {
  var data = String(b.data || '');
  if (data.length > 3000000) return { ok:false, error:'fichier trop volumineux (max ~2 Mo)' };
  var sh = getErpFSheet(), total = Math.max(1, Math.ceil(data.length / ERP_CHUNK)), rows = [], up = new Date().toISOString();
  for (var i = 0; i < total; i++) rows.push([b.id, i + 1, total, b.name || '', b.type || '', up, data.substr(i * ERP_CHUNK, ERP_CHUNK)]);
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, ERPF_COLS.length).setValues(rows);
  return { ok:true, id:b.id, parts:total };
}

function erpFileGet(id) {
  var v = getErpFSheet().getDataRange().getValues(), parts = {}, meta = null;
  for (var i = 1; i < v.length; i++) if (String(v[i][0]) === String(id)) { parts[v[i][1]] = v[i][6]; meta = { total:v[i][2], name:v[i][3], type:v[i][4] }; }
  if (!meta) return { ok:false, error:'introuvable' };
  var d = ''; for (var k = 1; k <= meta.total; k++) { if (parts[k] === undefined) return { ok:false, error:'fichier incomplet' }; d += parts[k]; }
  return { ok:true, id:id, name:meta.name, type:meta.type, data:d };
}

/* ==================== UTIL ==================== */

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* Run once from the editor to create all tabs and grant scopes. */
function setup() {
  getSheet(); getCodeSheet(); getELSheet(); getELSetSheet(); getLabSheet(); getLabMoveSheet(); getLabUserSheet(); getErpSheet(); getErpFSheet();
  Logger.log('Spreadsheet ready: ' + getSpreadsheet().getUrl());
}

/**
 * Kanaku Book — Google Apps Script backend.
 *
 * Deploy this as a Web App (Execute as: Me, Access: Anyone).
 * The sheet this script is bound to needs three tabs, which this script
 * will create automatically with headers the first time they are needed:
 *
 *   Users:    Username | Password
 *   Members:  Name
 *   Entries:  Timestamp | Date | Name | Amount | Note | LoggedBy
 *
 * Reads (login, getMembers) come in as GET requests with a ?callback=
 * parameter and are answered as JSONP, because the app's fetch(no-cors)
 * writes cannot read responses.
 * Writes (addEntry, addMember) come in as POST with a plain-text JSON body.
 */

var TABS = {
  users:   { name: 'Users',   headers: ['Username', 'Password'] },
  members: { name: 'Members', headers: ['Name'] },
  entries: { name: 'Entries', headers: ['Timestamp', 'Date', 'Name', 'Amount', 'Note', 'LoggedBy', 'Id'] }
};

// 12 placeholder members seeded when the Members tab is first created.
// Rename them in the sheet or via the app's "+ Add" button.
var PLACEHOLDER_MEMBERS = [
  'Member 1', 'Member 2', 'Member 3', 'Member 4',
  'Member 5', 'Member 6', 'Member 7', 'Member 8',
  'Member 9', 'Member 10', 'Member 11', 'Member 12'
];

/** Returns the tab, creating it with headers (and seed data) if missing. */
function getSheet_(tab) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(tab.name);
  if (!sheet) {
    sheet = ss.insertSheet(tab.name);
    sheet.appendRow(tab.headers);
    sheet.getRange(1, 1, 1, tab.headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    if (tab.name === 'Members') {
      PLACEHOLDER_MEMBERS.forEach(function (name) { sheet.appendRow([name]); });
    }
  }
  return sheet;
}

/** Handles reads. JSONP: wraps the JSON reply in the callback function name. */
function doGet(e) {
  var params = (e && e.parameter) || {};
  var action = params.action || '';
  var result;

  try {
    if (action === 'login') {
      result = login_(params.username, params.password);
    } else if (action === 'getMembers') {
      result = { ok: true, members: getMembers_() };
    } else if (action === 'getEntries') {
      result = { ok: true, entries: getEntries_(params.from, params.to, params.limit) };
    } else if (action === 'ping') {
      result = { ok: true, pong: true };
    } else {
      result = { ok: false, error: 'Unknown action: ' + action };
    }
  } catch (err) {
    result = { ok: false, error: String(err) };
  }

  var json = JSON.stringify(result);
  var callback = String(params.callback || '');
  if (/^[\w.]+$/.test(callback)) {
    return ContentService
      .createTextOutput(callback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

/** Handles writes. The app sends fetch(mode:'no-cors') with a text/plain JSON body. */
function doPost(e) {
  var result;
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var action = body.action || '';

    if (action === 'addEntry') {
      addEntry_(body);
      result = { ok: true };
    } else if (action === 'addMember') {
      addMember_(body.name);
      result = { ok: true };
    } else if (action === 'deleteEntry') {
      deleteEntry_(body);
      result = { ok: true };
    } else {
      result = { ok: false, error: 'Unknown action: ' + action };
    }
  } catch (err) {
    result = { ok: false, error: String(err) };
  }
  // The app can't read this (no-cors), but it helps when testing by hand.
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function login_(username, password) {
  username = String(username || '').trim();
  password = String(password || '');
  if (!username || !password) return { ok: false, error: 'Missing username or password' };

  var sheet = getSheet_(TABS.users);
  var rows = sheet.getDataRange().getValues(); // row 0 = headers
  for (var i = 1; i < rows.length; i++) {
    var u = String(rows[i][0]).trim();
    var p = String(rows[i][1]);
    if (u.toLowerCase() === username.toLowerCase() && p === password) {
      return { ok: true, user: u };
    }
  }
  return { ok: false, error: 'Wrong username or password' };
}

function getMembers_() {
  var sheet = getSheet_(TABS.members);
  var rows = sheet.getDataRange().getValues();
  var members = [];
  for (var i = 1; i < rows.length; i++) {
    var name = String(rows[i][0]).trim();
    if (name) members.push(name);
  }
  return members;
}

/**
 * Returns entries whose Date is between `from` and `to` (yyyy-MM-dd, both
 * optional), newest first. `limit` caps the row count (default and max 1000)
 * to keep the JSONP reply small.
 */
function getEntries_(from, to, limit) {
  var sheet = getSheet_(TABS.entries);
  var rows = sheet.getDataRange().getValues(); // row 0 = headers
  // Use the spreadsheet's timezone, not the script's: new Apps Script
  // projects often default to America/New_York, which would shift every
  // date back a day when converting Date cells to yyyy-MM-dd strings.
  var tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  from = String(from || '');
  to = String(to || '');

  var out = [];
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    // The Date column may come back as a Date object (Sheets auto-parses it)
    var date = r[1];
    if (date instanceof Date) {
      date = Utilities.formatDate(date, tz, 'yyyy-MM-dd');
    } else {
      date = String(date || '');
    }
    if (from && date < from) continue;
    if (to && date > to) continue;
    out.push({
      date: date,
      name: String(r[2] || '').trim(),
      amount: Number(r[3]) || 0,
      note: String(r[4] || ''),
      by: String(r[5] || ''),
      id: String(r[6] || '')
    });
  }
  out.reverse();
  var cap = Math.min(Number(limit) || 1000, 1000);
  return out.slice(0, cap);
}

function addMember_(name) {
  name = String(name || '').trim();
  if (!name) throw new Error('Member name is empty');

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = getSheet_(TABS.members);
    var existing = getMembers_().map(function (m) { return m.toLowerCase(); });
    if (existing.indexOf(name.toLowerCase()) === -1) {
      sheet.appendRow([name]);
    }
  } finally {
    lock.releaseLock();
  }
}

function addEntry_(body) {
  var name = String(body.name || '').trim();
  var amount = Number(body.amount);
  if (!name) throw new Error('Member name is empty');
  if (!isFinite(amount) || amount <= 0) throw new Error('Bad amount');

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = getSheet_(TABS.entries);
    // sheets created before the delete feature lack the Id header
    if (sheet.getRange(1, 7).getValue() !== 'Id') {
      sheet.getRange(1, 7).setValue('Id').setFontWeight('bold');
    }
    sheet.appendRow([
      new Date(),                        // Timestamp (when it was saved)
      String(body.date || ''),           // Date (the date chosen in the app)
      name,
      amount,
      String(body.note || ''),
      String(body.loggedBy || ''),
      String(body.id || '')              // unique id, used by deleteEntry
    ]);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Deletes one entry row. Prefers the unique Id; entries saved before the
 * delete feature have no Id, so it falls back to the newest row matching
 * the same date + name + amount.
 */
function deleteEntry_(body) {
  var id = String(body.id || '');
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = getSheet_(TABS.entries);
    var rows = sheet.getDataRange().getValues();
    var target = -1;

    if (id) {
      for (var i = rows.length - 1; i >= 1; i--) {
        if (String(rows[i][6] || '') === id) { target = i; break; }
      }
    }
    if (target === -1 && !id) {
      var tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
      var date = String(body.date || '');
      var name = String(body.name || '').trim().toLowerCase();
      var amount = Number(body.amount);
      for (var j = rows.length - 1; j >= 1; j--) {
        var d = rows[j][1];
        d = (d instanceof Date) ? Utilities.formatDate(d, tz, 'yyyy-MM-dd') : String(d || '');
        if (d === date &&
            String(rows[j][2] || '').trim().toLowerCase() === name &&
            Number(rows[j][3]) === amount) { target = j; break; }
      }
    }
    if (target > 0) sheet.deleteRow(target + 1); // +1: values are 0-based, rows 1-based
  } finally {
    lock.releaseLock();
  }
}

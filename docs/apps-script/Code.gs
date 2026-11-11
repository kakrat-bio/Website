// Kakrat newsletter sign-ups -> Google Sheet.
// The kakrat.com sign-up box sends name + email + page here as well as to Buttondown.
const SHEET_ID = '1KCY4kxY_932RPGJhnRnmLDga3oyzJIGYymrGQFevQgY';
// Shared with the kakrat.com comments function (Cloudflare secret COMMENTS_WEBHOOK_TOKEN).
const COMMENT_TOKEN = 'REPLACE_WITH_COMMENTS_WEBHOOK_TOKEN'; // real value lives only in the Apps Script project + Cloudflare secret
const FEED_URL = 'https://kakrat.com/rss.xml';

// Alerts go to the account that owns this script (kakratkosh@gmail.com).
function owner_() {
  return Session.getEffectiveUser().getEmail();
}

function esc_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Run once by hand: names the sheet and adds the header row.
function setup() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  ss.rename('Kakrat subscribers');
  const sh = ss.getSheets()[0];
  sh.setName('Sign-ups');
  sh.getRange(1, 1, 1, 4)
    .setValues([['Date (IST)', 'First name', 'Email', 'Signed up on page']])
    .setFontWeight('bold');
  sh.setFrozenRows(1);
}

// Stops a value starting with = + - @ being read as a formula.
function safe_(v) {
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.type === 'comment') return commentAlert_(p);
  const email = String(p.email || '').trim().toLowerCase();
  if (p.website || email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return ContentService.createTextOutput('ignored');
  }
  const name = String(p.name || '').trim().slice(0, 80);
  const page = String(p.page || '').trim().slice(0, 200);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    const already = sh.getRange('C:C').createTextFinder(email).matchEntireCell(true).findNext();
    if (!already) {
      const date = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm');
      sh.appendRow([date, safe_(name), safe_(email), safe_(page)]);
    }
  } finally {
    lock.releaseLock();
  }
  return ContentService.createTextOutput('ok');
}

// ---- New-comment alerts (called by kakrat.com's comments function) ----
function commentAlert_(p) {
  if (p.token !== COMMENT_TOKEN) return ContentService.createTextOutput('ignored');
  const slug = String(p.slug || '').slice(0, 120);
  const name = String(p.name || '').slice(0, 80);
  const body = String(p.body || '').slice(0, 3000);
  const kind = p.isReply === 'true' ? 'reply' : 'comment';
  const url = 'https://kakrat.com/articles/' + encodeURIComponent(slug);
  MailApp.sendEmail({
    to: owner_(),
    subject: 'New ' + kind + ' on Kakrat: ' + slug,
    htmlBody: '<p><strong>' + esc_(name) + '</strong> left a ' + kind + ' on <a href="' + url + '">' + esc_(slug) + '</a>:</p>' +
      '<blockquote style="border-left:3px solid #ccc;padding-left:12px;white-space:pre-wrap">' + esc_(body) + '</blockquote>' +
      '<p>It is waiting for your approval: <a href="https://kakrat.com/admin/comments">kakrat.com/admin/comments</a></p>',
  });
  return ContentService.createTextOutput('ok');
}

// ---- Reminder to send the newsletter after each new article ----
// Runs every hour (trigger made by setupReminders). Emails you once per new article.
function checkNewArticles() {
  const props = PropertiesService.getScriptProperties();
  const seen = JSON.parse(props.getProperty('seenArticles') || '[]');
  const xml = UrlFetchApp.fetch(FEED_URL, { muteHttpExceptions: true });
  if (xml.getResponseCode() !== 200) return;
  const items = XmlService.parse(xml.getContentText()).getRootElement().getChild('channel').getChildren('item');
  const articles = items.map(function (it) {
    return { title: it.getChildText('title'), link: it.getChildText('link'), description: it.getChildText('description') };
  });
  if (seen.length === 0) {
    // First run: remember what is already published, don't email about old pieces.
    props.setProperty('seenArticles', JSON.stringify(articles.map(function (a) { return a.link; })));
    return;
  }
  const fresh = articles.filter(function (a) { return seen.indexOf(a.link) === -1; });
  fresh.forEach(function (a) {
    MailApp.sendEmail({
      to: owner_(),
      subject: 'New on Kakrat: send the newsletter for "' + a.title + '"',
      htmlBody: '<p>A new article just went live:</p>' +
        '<p><a href="' + a.link + '"><strong>' + esc_(a.title) + '</strong></a><br>' + esc_(a.description) + '</p>' +
        '<p><strong>To email your subscribers:</strong> open <a href="https://buttondown.com/emails/new">Buttondown, New email</a>, ' +
        'paste the draft below, check it, and send.</p><hr>' +
        '<p><em>Subject:</em> ' + esc_(a.title) + '</p>' +
        '<p>' + esc_(a.description) + '</p><p><a href="' + a.link + '">Read it on Kakrat</a></p>',
    });
  });
  if (fresh.length) {
    props.setProperty('seenArticles', JSON.stringify(seen.concat(fresh.map(function (a) { return a.link; })).slice(-500)));
  }
}

// Run once by hand: makes the hourly trigger and records the articles already published.
function setupReminders() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'checkNewArticles') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('checkNewArticles').timeBased().everyHours(1).create();
  checkNewArticles();
}

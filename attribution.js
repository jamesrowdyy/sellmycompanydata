/* Referral attribution.
   A partner link carries a code in the query (?src=<code>) or in the path (/r/<code>/).
   The code is remembered for the session and sent with every form, so a company that was
   introduced is stamped to whoever introduced it. */
(function () {
  var KEY = 'smcd-src';
  function clean(v) { return String(v || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40); }
  function fromPath() { var m = /^\/r\/([^\/?#]+)/.exec(location.pathname); return m ? clean(m[1]) : ''; }
  function fromQuery() {
    try { var p = new URLSearchParams(location.search); return clean(p.get('src') || p.get('ref')); }
    catch (e) { return ''; }
  }
  var src = fromPath() || fromQuery();
  try {
    if (src) sessionStorage.setItem(KEY, src);
    else src = sessionStorage.getItem(KEY) || '';
  } catch (e) { /* private browsing: attribution is best effort */ }
  window.SMCD_SRC = src;
  window.smcdSrc = function () { return window.SMCD_SRC || ''; };

  // Carry the code into the estimate and referral links on this page.
  function fill() {
    var s = window.SMCD_SRC;
    if (!s) return;
    var els = document.querySelectorAll('[data-attrib]');
    for (var i = 0; i < els.length; i++) {
      var href = els[i].getAttribute('href') || '/';
      if (href.indexOf('src=') !== -1) continue;
      els[i].setAttribute('href', href + (href.indexOf('?') === -1 ? '?' : '&') + 'src=' + encodeURIComponent(s));
    }
    var note = document.getElementById('src-note'), code = document.getElementById('src-code');
    if (note && code) { code.textContent = s; note.hidden = false; }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fill);
  else fill();
})();

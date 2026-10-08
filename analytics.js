/* Consent-gated, explicit events only. No form values, URL queries, replay,
   autocapture, email addresses or identified profiles are sent. */
(function () {
  'use strict';
  var cfg = window.SMCD_ANALYTICS_CONFIG || {};
  var ga = /^G-[A-Z0-9]+$/.test(cfg.ga4MeasurementId || '') ? cfg.ga4MeasurementId : '';
  var ph = /^phc_[A-Za-z0-9_-]+$/.test(cfg.posthogProjectToken || '') ? cfg.posthogProjectToken : '';
  var host = ['https://us.i.posthog.com', 'https://eu.i.posthog.com'].indexOf(cfg.posthogHost) >= 0 ? cfg.posthogHost : '';
  if (!host) ph = '';
  if (!ga && !ph) return;
  var consentKey = 'smcd.analytics.consent.v1', sessionKey = 'smcd.analytics.session.v1';
  var allowed = ['estimate_started', 'estimate_completed', 'seller_lead_submitted', 'buyer_brief_submitted', 'referral_submitted', 'booking_opened'];
  var pages = ['/', '/buyers/', '/refer/', '/privacy/', '/terms/', '/data-licensing/', '/data-valuation/'];
  var path = pages.indexOf(location.pathname) >= 0 ? location.pathname : '/other/';
  var pageUrl = location.origin + path;
  var referrer = '';
  try { var r = new URL(document.referrer); if (/^https?:$/.test(r.protocol)) referrer = r.origin + '/'; } catch (_) {}
  var privacySignal = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
  var enabled = false, pageviewSent = false, gaLoaded = false, session = null;
  function storage(type, action, key, value) { try { return window[type][action](key, value); } catch (_) { return null; } }
  function saveConsent(value) { storage('localStorage', 'setItem', consentKey, value); }
  function sessionId() {
    if (session && Date.now() - session.last < 30 * 60 * 1000) { session.last = Date.now(); }
    else {
      try { session = JSON.parse(storage('sessionStorage', 'getItem', sessionKey) || 'null'); } catch (_) { session = null; }
      if (!session || !/^[a-f0-9-]{36}$/.test(session.id) || Date.now() - session.last >= 30 * 60 * 1000) session = {id: crypto.randomUUID(), last: Date.now()};
      session.last = Date.now();
    }
    storage('sessionStorage', 'setItem', sessionKey, JSON.stringify(session));
    return session.id;
  }
  function initGa() {
    if (!ga || gaLoaded) return;
    gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {analytics_storage:'granted', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied'});
    window.gtag('js', new Date());
    window.gtag('config', ga, {send_page_view:false, page_location:pageUrl, page_referrer:referrer, page_title:document.title, allow_google_signals:false, allow_ad_personalization_signals:false, cookie_flags:'SameSite=Lax;Secure'});
    var script = document.createElement('script'); script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ga);
    document.head.appendChild(script);
  }
  function capture(name) {
    if (!enabled || privacySignal) return;
    var isPageview = name === 'page_view';
    if (!isPageview && allowed.indexOf(name) < 0) return;
    if (ga) window.gtag('event', name, {send_to:ga, page_location:pageUrl, page_referrer:referrer, page_title:document.title});
    if (ph) {
      var body = {api_key:ph, event:isPageview ? '$pageview' : name, distinct_id:sessionId(), properties:{$current_url:pageUrl, $pathname:path, $host:location.hostname, $referrer:referrer, $referring_domain:referrer ? new URL(referrer).hostname : '$direct', $process_person_profile:false, $is_identified:false}};
      fetch(host + '/i/v0/e/', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body), credentials:'omit', referrerPolicy:'no-referrer', keepalive:true}).catch(function () {});
    }
  }
  function enable() {
    if (privacySignal) return;
    enabled = true;
    if (ga) window['ga-disable-' + ga] = false;
    initGa();
    if (ga) window.gtag('consent', 'update', {analytics_storage:'granted'});
    if (!pageviewSent) { capture('page_view'); pageviewSent = true; }
  }
  function disable() {
    enabled = false; session = null;
    storage('sessionStorage','removeItem',sessionKey);
    if (ga) {
      window['ga-disable-' + ga] = true;
      if (window.gtag) window.gtag('consent','update',{analytics_storage:'denied'});
      ['_ga', '_ga_' + ga.slice(2)].forEach(function (key) {
        ['', ';domain=' + location.hostname, ';domain=.' + location.hostname].forEach(function (domain) {
          document.cookie = key + '=;Max-Age=0;path=/;SameSite=Lax;Secure' + domain;
        });
      });
    }
  }
  var panel = document.createElement('section');
  panel.className = 'analytics-consent'; panel.setAttribute('aria-label','Analytics preferences'); panel.hidden = true;
  panel.innerHTML = '<div><strong>Help us improve this website</strong><p>Allow optional analytics to measure visits and calculator use. We don’t send your form answers or record sessions. <a href="/privacy/">Privacy notice</a></p></div><div class="analytics-actions"><button type="button" class="btn btn-ghost" data-choice="denied">Decline</button><button type="button" class="btn btn-primary" data-choice="granted">Allow analytics</button></div>';
  document.body.appendChild(panel);
  panel.addEventListener('click', function (e) {
    var button = e.target.closest('[data-choice]'); if (!button) return;
    var choice = button.getAttribute('data-choice'); saveConsent(choice); panel.hidden = true;
    if (choice === 'granted') enable(); else disable();
    settings.focus({preventScroll:true});
  });
  var settings = document.createElement('button'); settings.type = 'button'; settings.className = 'analytics-settings'; settings.textContent = 'Analytics preferences';
  settings.addEventListener('click', function () { panel.hidden = false; panel.querySelector('button').focus({preventScroll:true}); });
  var footer = document.querySelector('.footer-details'); if (footer) footer.appendChild(settings);
  if (privacySignal) { disable(); settings.textContent = 'Analytics off — browser privacy setting'; settings.disabled = true; }
  else {
    var consent = storage('localStorage','getItem',consentKey);
    if (consent === 'granted') enable(); else if (consent !== 'denied') panel.hidden = false;
  }
  window.addEventListener('smcd:conversion', function (e) {
    // Ignore supplied properties: only the six known event names may leave the page.
    var name = e.detail && e.detail.event;
    if (typeof name === 'string' && name.indexOf('smcd_') === 0) capture(name.slice(5));
  });
})();

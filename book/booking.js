// Cal.com's official embed queue; styling is scoped to this embed, not the account.
(function (C, A, L) {
  var p = function (a, ar) { a.q.push(ar); };
  var d = C.document;
  C.Cal = C.Cal || function () {
    var cal = C.Cal;
    var ar = arguments;
    if (!cal.loaded) {
      cal.ns = {};
      cal.q = cal.q || [];
      d.head.appendChild(d.createElement('script')).src = A;
      cal.loaded = true;
    }
    if (ar[0] === L) {
      var api = function () { p(api, arguments); };
      var namespace = ar[1];
      api.q = api.q || [];
      if (typeof namespace === 'string') {
        cal.ns[namespace] = cal.ns[namespace] || api;
        p(cal.ns[namespace], ar);
        p(cal, ['initNamespace', namespace]);
      } else { p(cal, ar); }
      return;
    }
    p(cal, ar);
  };
})(window, 'https://app.cal.com/embed/embed.js', 'init');
Cal('init', 'company-data', {origin: 'https://cal.com'});
Cal.ns['company-data']('inline', {
  elementOrSelector: '#company-data-calendar',
  calLink: 'jamesrowdyy/15min',
  config: {layout: 'month_view', theme: 'light', notes: 'Sell My Company Data valuation call'}
});
Cal.ns['company-data']('ui', {
  theme: 'light', layout: 'month_view', hideEventTypeDetails: false,
  cssVarsPerTheme: {light: {
    'cal-brand': '#254A3D', 'cal-brand-emphasis': '#18211E',
    'cal-brand-text': '#F4F3EE', 'cal-brand-subtle': '#DCE8D9',
    'cal-text': '#18211E', 'cal-text-emphasis': '#18211E',
    'cal-text-subtle': '#52605A', 'cal-bg': '#F4F3EE',
    'cal-bg-emphasis': '#DCE8D9', 'cal-bg-subtle': '#EAE7E0',
    'cal-border': '#C7CCC4', 'cal-border-subtle': '#C7CCC4'
  }}
});

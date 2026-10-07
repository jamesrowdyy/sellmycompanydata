(function () {
  document.querySelectorAll('.mobile-routes a').forEach(function (link) {
    if (link.pathname === location.pathname) link.setAttribute('aria-current', 'page');
  });
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  if (!reduce.matches && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); }
      });
    }, {threshold: 0.12});
    document.querySelectorAll('.data-flow,.path-card,.supply-item,.steps .card').forEach(function (el) {observer.observe(el);});
  }
  var buttons = document.querySelectorAll('[data-flow]');
  if (!buttons.length) return;
  var sourceArt = document.querySelector('.flow-art').innerHTML;
  var stageArt = [sourceArt, '<span class="flow-symbol">✓</span><span class="flow-symbol">⌁</span>', '<span class="flow-symbol">↗︎</span><span class="flow-symbol">✓</span>'];
  var steps = [
    ['The work already lives in your tools.', 'Messages, documents and operating records. Start with the systems your team already uses.'],
    ['You approve the scope. We prepare the data.', 'Rights review and de-identification come before delivery. You decide which sources are included.'],
    ['A defined licence. You keep ownership.', 'Scope, permitted use and payment are agreed in writing before the approved data reaches a buyer.']
  ];
  buttons.forEach(function (button, i) {
    button.addEventListener('click', function () {
      buttons.forEach(function (b) {b.setAttribute('aria-pressed', String(b === button));});
      document.getElementById('flow-title').textContent = steps[i][0];
      document.getElementById('flow-copy').textContent = steps[i][1];
      document.querySelector('.flow-track span').style.left = (i * 41) + '%';
      document.querySelector('.flow-art').innerHTML = stageArt[i];
      var detail = document.querySelector('.flow-detail');
      detail.classList.remove('changing');
      void detail.offsetWidth;
      detail.classList.add('changing');
    });
  });
})();

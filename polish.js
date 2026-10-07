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
    document.querySelectorAll('.business-grid,.path-card,.supply-item,.steps .card').forEach(function (el) {observer.observe(el);});
  }
})();

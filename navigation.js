// Keep every destination reachable in the compact mobile header.
(function () {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;
  function close() {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  nav.addEventListener('click', function (event) {
    if (event.target.closest('a')) close();
  });
  document.addEventListener('click', function (event) {
    if (!nav.contains(event.target) && !toggle.contains(event.target)) close();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      close();
      toggle.focus();
    }
  });
  window.matchMedia('(max-width:900px)').addEventListener('change', close);
  // Reflect the existing calculator selection state for keyboard/screen-reader users.
  document.querySelectorAll('.chip, .seg button').forEach(function (control) {
    function sync() { control.setAttribute('aria-pressed', String(control.classList.contains('on'))); }
    sync();
    new MutationObserver(sync).observe(control, {attributes:true, attributeFilter:['class']});
  });
})();

// Scroll-reveal for [data-animate] elements (typically post figures).
// Variants and styling live in css/figures.css. Stagger with
// data-animate-delay="<ms>". Falls back to always-visible when the user
// prefers reduced motion or IntersectionObserver is unavailable.

export function initFigureAnimations() {
  var elements = document.querySelectorAll('[data-animate]');
  if (!elements.length) {
    return;
  }

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    elements.forEach(function (el) {
      el.classList.add('is-revealed');
    });
    return;
  }

  document.body.classList.add('has-figure-animations');

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) {
        return;
      }

      var el = entry.target;
      var delay = el.getAttribute('data-animate-delay');
      if (delay) {
        el.style.transitionDelay = delay + 'ms';
      }
      el.classList.add('is-revealed');
      observer.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });

  elements.forEach(function (el) {
    observer.observe(el);
  });
}

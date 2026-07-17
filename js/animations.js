/* ============================================================================
   Servicio Técnico de Nevecones — animations.js
   Efectos visuales de alto rendimiento:
     - Scroll Reveal (IntersectionObserver, con delays por elemento)
     - Contadores animados (easing, se disparan al entrar en viewport)
     - Efecto Ripple en botones (.ripple)
     - Parallax ligero del hero y mouse tracking sutil
   Respeta prefers-reduced-motion: si el usuario reduce movimiento, se muestran
   los elementos sin animación y se desactivan parallax/tracking.
   ========================================================================== */

(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     1) SCROLL REVEAL
     Cada elemento con [data-reveal] aparece al entrar en el viewport.
     data-reveal-delay="ms" permite escalonar (stagger) la aparición.
     ========================================================================== */
  const revealEls = document.querySelectorAll('[data-reveal]');

  if (prefersReduced || !('IntersectionObserver' in window)) {
    // Sin animación: mostrar todo directamente.
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = parseInt(el.dataset.revealDelay || '0', 10);
          // Aplicar el retardo como transition-delay puntual (no bloquea nada).
          el.style.transitionDelay = delay + 'ms';
          el.classList.add('is-visible');
          // Una vez revelado, dejar de observar (ahorra trabajo).
          observer.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ==========================================================================
     2) CONTADORES ANIMADOS
     Elementos [data-counter="N"] cuentan desde 0 hasta N cuando son visibles.
     data-suffix agrega "+", "%", etc. Se formatea con separador de miles.
     ========================================================================== */
  const counters = document.querySelectorAll('[data-counter]');

  function formatNumber(n) {
    // Separador de miles con punto (formato Colombia): 12.000
    return Math.floor(n).toLocaleString('es-CO');
  }

  function animateCounter(el) {
    const target = parseFloat(el.dataset.counter) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1600; // ms
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // Easing suave (easeOutExpo) para un conteo natural.
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      el.textContent = formatNumber(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = formatNumber(target) + suffix;
    }
    requestAnimationFrame(tick);
  }

  if (counters.length) {
    if (prefersReduced || !('IntersectionObserver' in window)) {
      counters.forEach((el) => {
        el.textContent = formatNumber(parseFloat(el.dataset.counter) || 0) + (el.dataset.suffix || '');
      });
    } else {
      const counterObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach((el) => counterObserver.observe(el));
    }
  }

  /* ==========================================================================
     3) EFECTO RIPPLE
     Onda de material al hacer clic en cualquier .ripple. Se calcula la posición
     relativa del clic para originar la onda desde ese punto.
     ========================================================================== */
  if (!prefersReduced) {
    document.querySelectorAll('.ripple').forEach((btn) => {
      btn.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const wave = document.createElement('span');
        wave.className = 'ripple__wave';
        wave.style.width = wave.style.height = size + 'px';
        wave.style.left = (e.clientX - rect.left - size / 2) + 'px';
        wave.style.top = (e.clientY - rect.top - size / 2) + 'px';
        this.appendChild(wave);
        // Limpiar el nodo tras la animación para no acumular DOM.
        wave.addEventListener('animationend', () => wave.remove());
      });
    });
  }

  /* ==========================================================================
     4) PARALLAX LIGERO + MOUSE TRACKING (solo escritorio, con puntero fino)
     - La imagen del hero se desplaza sutilmente al hacer scroll (profundidad).
     - Un leve desplazamiento según el mouse aporta vida sin distraer.
     Todo con requestAnimationFrame y desactivado si se reduce el movimiento.
     ========================================================================== */
  const heroMedia = document.querySelector('.hero__media img');
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  if (heroMedia && !prefersReduced) {
    let scrollOffset = 0;
    let mouseX = 0;
    let mouseY = 0;
    let ticking = false;

    function applyTransform() {
      // Parallax de scroll (máx ~40px) + tracking de mouse (máx ~12px).
      const y = scrollOffset * 0.15;
      heroMedia.style.transform =
        `translate3d(${mouseX * 12}px, ${(-y) + (mouseY * 10)}px, 0) scale(1.08)`;
      ticking = false;
    }

    function requestTick() {
      if (!ticking) { requestAnimationFrame(applyTransform); ticking = true; }
    }

    window.addEventListener('scroll', () => {
      // Solo mientras el hero es potencialmente visible (primer viewport).
      if (window.scrollY < window.innerHeight) {
        scrollOffset = window.scrollY;
        requestTick();
      }
    }, { passive: true });

    if (finePointer) {
      const hero = document.querySelector('.hero');
      hero.addEventListener('mousemove', (e) => {
        // Normalizar la posición del mouse al rango [-1, 1].
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        requestTick();
      });
      hero.addEventListener('mouseleave', () => {
        mouseX = 0; mouseY = 0; requestTick();
      });
    }
  }
})();

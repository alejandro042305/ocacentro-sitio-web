/* ============================================================================
   Servicio Técnico de Nevecones — ui.js
   Componentes de interfaz:
     - Acordeón de FAQ (accesible, un panel abierto a la vez opcional)
     - Carrusel de testimonios (dots dinámicos, teclado, autoplay pausable,
       soporte táctil por arrastre/swipe)
   Sin dependencias. Accesible por teclado y compatible con lectores de pantalla.
   ========================================================================== */

(function () {
  'use strict';

  /* ==========================================================================
     0) CARRUSEL DE FOTOS DEL HERO (crossfade automático)
     Rota las imágenes del hero con un fundido suave y genera los puntos
     indicadores. Se pausa si la pestaña no está visible o si el usuario
     prefiere menos movimiento.
     ========================================================================== */
  (function heroCarousel() {
    const carousel = document.getElementById('heroCarousel');
    const dotsWrap = document.getElementById('heroDots');
    if (!carousel) return;

    const slides = Array.from(carousel.querySelectorAll('.hero__slide'));
    if (slides.length <= 1) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let current = 0;
    let timer = null;
    const INTERVAL = 5000;

    // Generar puntos indicadores (clicables)
    const dots = [];
    if (dotsWrap) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'hero__dot' + (i === 0 ? ' is-active' : '');
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Mostrar imagen ' + (i + 1));
        dot.addEventListener('click', () => { show(i); restart(); });
        dotsWrap.appendChild(dot);
        dots.push(dot);
      });
    }

    function show(i) {
      current = (i + slides.length) % slides.length;
      slides.forEach((s, si) => s.classList.toggle('is-active', si === current));
      dots.forEach((d, di) => d.classList.toggle('is-active', di === current));
    }
    function next() { show(current + 1); }
    function start() { if (!reduced) { stop(); timer = setInterval(next, INTERVAL); } }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });
    start();
  })();

  /* ==========================================================================
     1) ACORDEÓN DE FAQ
     Cada botón .faq__q controla su panel .faq__a. Se anima la altura con
     max-height calculado dinámicamente (transición suave y sin saltos).
     ========================================================================== */
  const faqItems = document.querySelectorAll('.faq__item');

  faqItems.forEach((item) => {
    const button = item.querySelector('.faq__q');
    const panel = item.querySelector('.faq__a');
    if (!button || !panel) return;

    button.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Comportamiento acordeón: cerrar los demás (mejor lectura, menos scroll).
      faqItems.forEach((other) => {
        if (other !== item) {
          other.classList.remove('is-open');
          const q = other.querySelector('.faq__q');
          const a = other.querySelector('.faq__a');
          if (q) q.setAttribute('aria-expanded', 'false');
          if (a) a.style.maxHeight = null;
        }
      });

      // Alternar el actual
      item.classList.toggle('is-open', !isOpen);
      button.setAttribute('aria-expanded', String(!isOpen));
      panel.style.maxHeight = !isOpen ? panel.scrollHeight + 'px' : null;
    });
  });

  // Recalcular altura del panel abierto al redimensionar (evita cortes de texto).
  window.addEventListener('resize', () => {
    const openPanel = document.querySelector('.faq__item.is-open .faq__a');
    if (openPanel) openPanel.style.maxHeight = openPanel.scrollHeight + 'px';
  }, { passive: true });

  /* ==========================================================================
     2) CARRUSEL DE TESTIMONIOS
     - Genera los "dots" según la cantidad de slides.
     - Navegación con botones, dots, teclado (← →) y arrastre/swipe táctil.
     - Autoplay que se pausa al interactuar o al pasar el mouse por encima.
     ========================================================================== */
  const carousel = document.querySelector('[data-carousel]');
  if (!carousel) return;

  const track = carousel.querySelector('.carousel__track');
  const slides = Array.from(carousel.querySelectorAll('[data-slide]'));
  const prevBtn = carousel.querySelector('[data-carousel-prev]');
  const nextBtn = carousel.querySelector('[data-carousel-next]');
  const dotsWrap = carousel.querySelector('.carousel__dots');

  if (!track || slides.length === 0) return;

  let index = 0;
  let autoplayTimer = null;
  const AUTOPLAY_MS = 6000;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Generar dots dinámicamente y enlazarlos a cada slide ---
  const dots = [];
  if (dotsWrap) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel__dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Ir al testimonio ' + (i + 1));
      dot.addEventListener('click', () => goTo(i, true));
      dotsWrap.appendChild(dot);
      dots.push(dot);
    });
  }

  // --- Mover el carrusel a un índice concreto ---
  function goTo(i, userAction) {
    index = (i + slides.length) % slides.length; // envolver (loop)
    track.style.transform = `translateX(-${index * 100}%)`;

    dots.forEach((dot, di) => {
      const active = di === index;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-selected', String(active));
    });

    // Accesibilidad: marcar el slide visible.
    slides.forEach((slide, si) => {
      slide.setAttribute('aria-hidden', String(si !== index));
    });

    if (userAction) restartAutoplay();
  }

  function next() { goTo(index + 1, true); }
  function prev() { goTo(index - 1, true); }

  if (nextBtn) nextBtn.addEventListener('click', next);
  if (prevBtn) prevBtn.addEventListener('click', prev);

  // --- Navegación con teclado cuando el carrusel tiene foco ---
  carousel.setAttribute('tabindex', '0');
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
  });

  // --- Soporte táctil / arrastre (swipe) ---
  let startX = 0;
  let isDragging = false;

  function onPointerDown(clientX) { startX = clientX; isDragging = true; pauseAutoplay(); }
  function onPointerUp(clientX) {
    if (!isDragging) return;
    const delta = clientX - startX;
    if (Math.abs(delta) > 45) { delta < 0 ? next() : prev(); }
    isDragging = false;
    startAutoplay();
  }

  carousel.addEventListener('touchstart', (e) => onPointerDown(e.touches[0].clientX), { passive: true });
  carousel.addEventListener('touchend', (e) => onPointerUp(e.changedTouches[0].clientX), { passive: true });

  // --- Autoplay (pausable) ---
  function startAutoplay() {
    if (prefersReduced || slides.length <= 1) return;
    stopAutoplay();
    autoplayTimer = setInterval(() => goTo(index + 1, false), AUTOPLAY_MS);
  }
  function stopAutoplay() { if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; } }
  function pauseAutoplay() { stopAutoplay(); }
  function restartAutoplay() { stopAutoplay(); startAutoplay(); }

  // Pausar autoplay al pasar el mouse o enfocar (mejor UX y accesibilidad).
  carousel.addEventListener('mouseenter', pauseAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);
  carousel.addEventListener('focusin', pauseAutoplay);
  carousel.addEventListener('focusout', startAutoplay);

  // Pausar cuando la pestaña no está visible (ahorra recursos).
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopAutoplay() : startAutoplay();
  });

  // Inicializar
  goTo(0, false);
  startAutoplay();
})();

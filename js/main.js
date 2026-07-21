/* ============================================================================
   Servicio Técnico de Nevecones — main.js
   Núcleo de interacción: navbar inteligente, menú móvil, barra de progreso
   de scroll, botón "volver arriba", enlace activo y arranque de la app.
   JavaScript ES6+ puro, sin dependencias. Todos los listeners de scroll usan
   requestAnimationFrame para no bloquear el hilo principal (rendimiento).
   ========================================================================== */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     Utilidad: throttle basado en requestAnimationFrame.
     Garantiza que el callback se ejecute como máximo una vez por frame (~16ms),
     evitando "layout thrashing" en eventos de alta frecuencia (scroll/resize).
     -------------------------------------------------------------------------- */
  function rafThrottle(callback) {
    let ticking = false;
    return function (...args) {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        callback.apply(this, args);
        ticking = false;
      });
    };
  }

  /* --------------------------------------------------------------------------
     Referencias del DOM (se consultan una sola vez).
     -------------------------------------------------------------------------- */
  const navbar        = document.getElementById('navbar');
  const navToggle     = document.getElementById('navToggle');
  const navLinks      = document.getElementById('navLinks');
  const navScrim      = document.getElementById('navScrim');
  const progressBar   = document.getElementById('scrollProgressBar');
  const backToTop     = document.getElementById('backToTop');
  const yearEl        = document.getElementById('year');
  const sections      = document.querySelectorAll('main section[id]');
  const menuLinks     = navLinks ? navLinks.querySelectorAll('a') : [];

  /* --------------------------------------------------------------------------
     1) Navbar inteligente: cambia de estilo al hacer scroll.
     2) Barra de progreso de lectura.
     3) Botón "volver arriba" visible tras cierto scroll.
     Todo se calcula en un único handler para minimizar reflows.
     -------------------------------------------------------------------------- */
  function onScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    // Navbar con fondo glass al superar 40px
    if (navbar) navbar.classList.toggle('is-scrolled', scrollY > 40);

    // Progreso de lectura (0–100%)
    if (progressBar && docHeight > 0) {
      const progress = Math.min((scrollY / docHeight) * 100, 100);
      progressBar.style.width = progress + '%';
    }

    // Botón volver arriba
    if (backToTop) backToTop.classList.toggle('is-visible', scrollY > 600);
  }

  window.addEventListener('scroll', rafThrottle(onScroll), { passive: true });
  onScroll(); // estado inicial correcto al recargar a mitad de página

  /* --------------------------------------------------------------------------
     Menú móvil: abrir/cerrar con accesibilidad (aria-expanded + bloqueo scroll).
     -------------------------------------------------------------------------- */
  function closeMenu() {
    if (!navToggle || !navLinks) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menú');
    navLinks.classList.remove('is-open');
    if (navScrim) navScrim.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  }

  function toggleMenu() {
    if (!navToggle || !navLinks) return;
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Abrir menú' : 'Cerrar menú');
    navLinks.classList.toggle('is-open', !isOpen);
    if (navScrim) navScrim.classList.toggle('is-open', !isOpen);
    document.body.classList.toggle('menu-open', !isOpen);
  }

  if (navToggle) navToggle.addEventListener('click', toggleMenu);

  // Cerrar el menú al pulsar un enlace (navegación de una sola página)
  menuLinks.forEach((link) => link.addEventListener('click', closeMenu));

  // Cerrar al tocar el fondo oscuro
  if (navScrim) navScrim.addEventListener('click', closeMenu);

  // Cerrar con tecla Escape (accesibilidad de teclado)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // Cerrar si se hace clic fuera del panel cuando está abierto
  document.addEventListener('click', (e) => {
    if (!navLinks || !navLinks.classList.contains('is-open')) return;
    if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) closeMenu();
  });

  /* --------------------------------------------------------------------------
     Botón "volver arriba": scroll suave al inicio.
     -------------------------------------------------------------------------- */
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* --------------------------------------------------------------------------
     Enlace activo en el navbar según la sección visible (scroll spy).
     Se usa IntersectionObserver en lugar de cálculos de scroll (más eficiente).
     -------------------------------------------------------------------------- */
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute('id');
          menuLinks.forEach((link) => {
            const href = link.getAttribute('href') || '';
            // Solo afectar enlaces de ancla internos (#seccion). En un sitio
            // multipágina, los enlaces a otras páginas (/servicios/, etc.)
            // conservan su estado "activo" definido con aria-current="page".
            if (href.charAt(0) !== '#') return;
            link.classList.toggle('is-active', href === '#' + id);
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((section) => spy.observe(section));
  }

  /* --------------------------------------------------------------------------
     Año dinámico en el footer.
     -------------------------------------------------------------------------- */
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* --------------------------------------------------------------------------
     Arranque de la app: fade-in elegante cuando el DOM está listo.
     -------------------------------------------------------------------------- */
  window.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('app-ready');
  });
  // Salvaguarda: si por alguna razón el evento ya ocurrió, aplicar de inmediato.
  if (document.readyState !== 'loading') document.body.classList.add('app-ready');
})();

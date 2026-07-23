/* ============================================================================
   Servicio Técnico de Nevecones — form.js
   Validación, sanitización y envío del formulario de contacto.

   SEGURIDAD (buenas prácticas Front-End):
     - Sanitización de entradas para prevenir XSS (se escapan caracteres HTML).
     - Validación completa del lado del cliente (formato, longitud, requeridos).
     - Honeypot anti-spam (campo oculto "website"): si se llena, se descarta.
     - Manejo de errores robusto y mensajes accesibles (aria-live).

   ENVÍO REAL DEL FORMULARIO:
     HTML/CSS/JS puro NO envía correos por sí solo. Aquí queda TODO preparado.
     Elige e implementa UNA opción en la función enviarFormulario():
       A) Formspree  → descomenta el bloque FORMSPREE y pon tu endpoint.
       B) EmailJS    → descomenta el bloque EMAILJS y añade el SDK + tus IDs.
       C) API propia → descomenta el bloque API_PROPIA y apunta a tu backend.
     Sin backend configurado, el formulario valida y muestra un mensaje de éxito
     de demostración (modo simulado) para que la UX sea completa desde el inicio.
   ========================================================================== */

(function () {
  'use strict';

  const form = document.getElementById('contactForm');
  if (!form) return;

  const statusEl = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');
  const honeypot = form.querySelector('#website');

  // Web3Forms: https://web3forms.com — sin backend propio, envía directo a tu correo.
  const WEB3FORMS_ACCESS_KEY = 'd909098c-bc3c-4d6d-b34a-7d25d529af1e';
  // Ruta absoluta: el formulario vive tanto en la raíz (inicio) como en /contacto/,
  // así que una ruta relativa apuntaría a lugares distintos según la página.
  const GRACIAS_URL = '/gracias/';

  /* --------------------------------------------------------------------------
     Sanitización: escapa caracteres peligrosos para evitar inyección/XSS.
     Se usa antes de mostrar cualquier valor o de enviarlo a un backend.
     -------------------------------------------------------------------------- */
  function sanitize(value) {
    return String(value)
      .trim()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* --------------------------------------------------------------------------
     Reglas de validación por campo.
     Cada regla retorna un string de error (o cadena vacía si es válido).
     -------------------------------------------------------------------------- */
  const validators = {
    nombre(v) {
      if (!v) return 'Por favor escribe tu nombre.';
      if (v.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
      if (!/^[a-zA-ZÀ-ÿñÑ\s.'-]{3,60}$/.test(v)) return 'El nombre contiene caracteres no válidos.';
      return '';
    },
    telefono(v) {
      if (!v) return 'Por favor escribe tu teléfono.';
      const digits = v.replace(/[^0-9]/g, '');
      if (digits.length < 7 || digits.length > 15) return 'Ingresa un teléfono válido (7 a 15 dígitos).';
      return '';
    },
    correo(v) {
      if (!v) return 'Por favor escribe tu correo.';
      // Validación de email pragmática y segura (no permisiva en exceso).
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Ingresa un correo electrónico válido.';
      return '';
    },
    servicio(v) {
      if (!v) return 'Selecciona el servicio que necesitas.';
      return '';
    },
    descripcion(v) {
      if (!v) return 'Cuéntanos qué necesitas.';
      if (v.length < 10) return 'Describe el problema con un poco más de detalle (mín. 10 caracteres).';
      if (v.length > 600) return 'La descripción es demasiado larga (máx. 600 caracteres).';
      return '';
    }
  };

  /* --------------------------------------------------------------------------
     Mostrar/limpiar el error de un campo (con estados visuales y aria).
     -------------------------------------------------------------------------- */
  function setFieldError(name, message) {
    const input = form.querySelector('[name="' + name + '"]');
    const errorEl = form.querySelector('[data-error-for="' + name + '"]');
    if (!input) return;
    const fieldWrap = input.closest('.field');

    if (message) {
      if (fieldWrap) { fieldWrap.classList.add('is-invalid'); fieldWrap.classList.remove('is-valid'); }
      input.setAttribute('aria-invalid', 'true');
      if (errorEl) errorEl.textContent = message;
    } else {
      if (fieldWrap) { fieldWrap.classList.remove('is-invalid'); fieldWrap.classList.add('is-valid'); }
      input.removeAttribute('aria-invalid');
      if (errorEl) errorEl.textContent = '';
    }
  }

  /* --------------------------------------------------------------------------
     Validar un campo puntual (usado en tiempo real: eventos blur/input).
     -------------------------------------------------------------------------- */
  function validateField(name) {
    const input = form.querySelector('[name="' + name + '"]');
    if (!input || !validators[name]) return true;
    const message = validators[name](input.value.trim());
    setFieldError(name, message);
    return message === '';
  }

  // Validación en vivo: al salir del campo y mientras se corrige.
  Object.keys(validators).forEach((name) => {
    const input = form.querySelector('[name="' + name + '"]');
    if (!input) return;
    input.addEventListener('blur', () => validateField(name));
    input.addEventListener('input', () => {
      const fieldWrap = input.closest('.field');
      // Solo re-evaluar en vivo si ya estaba marcado como inválido (menos ruido).
      if (fieldWrap && fieldWrap.classList.contains('is-invalid')) validateField(name);
    });
  });

  /* --------------------------------------------------------------------------
     Mensajes de estado del formulario (accesibles vía aria-live="polite").
     -------------------------------------------------------------------------- */
  function setStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.remove('is-success', 'is-error');
    if (type) statusEl.classList.add('is-' + type);
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.classList.toggle('is-loading', isLoading);
    submitBtn.disabled = isLoading;
  }

  /* --------------------------------------------------------------------------
     ENVÍO: Web3Forms (https://web3forms.com). Sin backend propio: envía
     el formulario directo al correo configurado en la access_key.
     -------------------------------------------------------------------------- */
  function enviarFormulario(data) {
    const fd = new FormData();
    fd.append('access_key', WEB3FORMS_ACCESS_KEY);
    fd.append('subject', 'Nueva solicitud de servicio — OCACENTRO');
    fd.append('from_name', data.nombre);
    Object.keys(data).forEach((key) => fd.append(key, data[key]));

    return fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: fd
    })
      .then((res) => res.json().then((json) => ({ ok: res.ok, json })))
      .then(({ ok, json }) => {
        if (!ok || !json.success) throw new Error(json.message || 'Error de envío');
        return json;
      });
  }

  /* --------------------------------------------------------------------------
     Manejo del submit: validar todo → sanitizar → enviar → responder.
     -------------------------------------------------------------------------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    setStatus('', null);

    // 1) Honeypot: si el campo oculto tiene contenido, es un bot → abortar en silencio.
    if (honeypot && honeypot.value.trim() !== '') {
      // Redirigir igual que un envío real para no dar pistas al bot, pero no enviar nada.
      window.location.href = GRACIAS_URL;
      return;
    }

    // 2) Validar todos los campos.
    let isValid = true;
    let firstInvalid = null;
    Object.keys(validators).forEach((name) => {
      const ok = validateField(name);
      if (!ok && !firstInvalid) firstInvalid = form.querySelector('[name="' + name + '"]');
      isValid = isValid && ok;
    });

    if (!isValid) {
      setStatus('Revisa los campos marcados e inténtalo de nuevo.', 'error');
      if (firstInvalid) firstInvalid.focus(); // llevar el foco al primer error (accesibilidad)
      return;
    }

    // 3) Construir el payload sanitizado (defensa en profundidad contra XSS).
    const payload = {
      nombre: sanitize(form.nombre.value),
      telefono: sanitize(form.telefono.value),
      correo: sanitize(form.correo.value),
      servicio: sanitize(form.servicio.value),
      descripcion: sanitize(form.descripcion.value),
      origen: 'serviciotecnicodenevecones.com'
    };

    // 4) Enviar.
    setLoading(true);
    setStatus('Enviando tu solicitud…', null);

    enviarFormulario(payload)
      .then(() => {
        // Éxito: llevar al usuario a la vista de gracias (opciones: inicio / WhatsApp).
        window.location.href = GRACIAS_URL;
      })
      .catch(() => {
        setStatus('No pudimos enviar tu solicitud. Escríbenos por WhatsApp al 313 320 7064 y te atendemos de inmediato.', 'error');
        setLoading(false);
      });
  });
})();

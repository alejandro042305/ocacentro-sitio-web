# Servicio Técnico de Nevecones — Sitio web

Landing page de alto rendimiento para empresa de servicio técnico de refrigeración
en Bogotá. Construida **desde cero** con **HTML5 + CSS3 + JavaScript ES6+ puro**,
sin frameworks ni librerías externas. Lista para desplegar en Hostinger (u otro
hosting estático) sin pasos de compilación.

---

## 🚀 Despliegue en Hostinger (o cualquier hosting)

1. Sube **todo el contenido** de esta carpeta a la raíz del hosting
   (normalmente `public_html/`), respetando la estructura de carpetas.
2. Verifica que el dominio apunte a esa carpeta.
3. Activa **HTTPS** (certificado SSL gratuito en Hostinger). El sitio ya usa
   rutas relativas y absolutas compatibles con HTTPS.
4. Listo. No se requiere Node, ni build, ni base de datos.

> Sugerencia: activa la **compresión Gzip/Brotli** y el **cache del navegador**
> desde el panel del hosting para exprimir aún más el rendimiento.

### Estructura del proyecto (multipágina con URLs limpias)

```
/
├── index.html            # INICIO  →  https://tu-dominio.com/
├── servicios/
│   └── index.html        # SERVICIOS  →  https://tu-dominio.com/servicios/
├── empresa/
│   └── index.html        # EMPRESA  →  https://tu-dominio.com/empresa/
├── contacto/
│   └── index.html        # CONTACTO  →  https://tu-dominio.com/contacto/
├── css/
│   ├── styles.css        # Sistema de diseño, layout y componentes
│   ├── animations.css    # Keyframes y scroll reveal
│   └── responsive.css    # Media queries (320px → 4K)
├── js/
│   ├── main.js           # Navbar, menú móvil, scroll progress, back-to-top
│   ├── animations.js     # Scroll reveal, contadores, ripple, parallax
│   ├── ui.js             # FAQ acordeón, carrusel de testimonios
│   └── form.js           # Validación, sanitización y envío del formulario
├── assets/
│   ├── images/           # Placeholders SVG (reemplazar por fotos reales .webp)
│   ├── icons/            # Íconos PWA (generar — ver abajo)
│   └── fonts/            # (opcional) fuentes autoalojadas
├── .htaccess             # URLs limpias, HTTPS, caché, compresión, seguridad
├── sitemap.xml
├── robots.txt
├── manifest.json
├── favicon.svg
└── favicon.ico           # (generar — ver abajo)
```

### 🔗 URLs limpias (sin `.html`, con barra final)

Cada página vive en su **propia carpeta con un `index.html`**. Así el navegador
muestra `tu-dominio.com/servicios/` en lugar de `tu-dominio.com/servicios.html`.
No requiere configuración: funciona de forma nativa en Hostinger (Apache) y en
casi cualquier hosting. El `.htaccess` incluido además:

- Fuerza **HTTPS** y unifica el dominio **sin www** (canónico).
- Redirige cualquier `/pagina.html` antiguo → `/pagina/` (301, conserva el SEO).
- Activa **compresión Gzip**, **caché del navegador** y **cabeceras de seguridad**.

> ⚠️ **Rutas raíz-absolutas.** Todas las referencias a CSS/JS/imágenes usan `/css/…`,
> `/js/…`, `/assets/…` (desde la raíz del dominio). Por eso **el sitio debe probarse
> con un servidor**, no abriendo el archivo con doble clic (`file://` no resuelve
> las rutas raíz). Ver "Cómo probarlo en local" abajo.

### Cómo probarlo en local

```bash
cd servicio-tecnico-nevecones
python -m http.server 8000
# Abre http://localhost:8000  (y navega a /servicios/, /empresa/, /contacto/)
```

---

## 🖼️ Reemplazar imágenes por fotos reales

Los archivos en `assets/images/*.svg` son **placeholders profesionales**. Para
producción, reemplázalos por **fotografías reales** de tus trabajos. Recomendado:

- Formato **`.webp`** (mejor compresión sin perder calidad).
- Actualiza el `src` en `index.html` en cada punto marcado con `REEMPLAZAR`.
- Mantén los atributos `width`, `height`, `loading="lazy"` y `alt` descriptivo
  (importantes para **rendimiento**, **CLS** y **accesibilidad/SEO**).

Imágenes a sustituir:

| Ubicación | Archivo sugerido | Tamaño recomendado |
|-----------|------------------|--------------------|
| Hero | `assets/images/hero.webp` | 1920×1200 |
| Por qué elegirnos | `assets/images/tecnico.webp` | 900×1000 |
| Galería (5 imágenes) | `assets/images/galeria-1..5.webp` | 900×600 / 600×600 |
| Testimonios (4 avatares) | `assets/images/avatar-1..4.webp` | 104×104 |
| Open Graph / redes | `assets/images/og-image.jpg` | 1200×630 |

> El **hero** usa `fetchpriority="high"`; el resto usa `loading="lazy"`.

---

## 📧 Conectar el formulario (envío real)

HTML/CSS/JS puro **no envía correos por sí solo**. La lógica ya está preparada en
`js/form.js`, con validación y sanitización completas. Elige **una** opción y
descoméntala dentro de la función `enviarFormulario()`:

- **Formspree** (más simple, sin código de servidor):
  1. Crea un formulario en <https://formspree.io> y copia tu endpoint.
  2. En `js/form.js`, descomenta el bloque *OPCIÓN A* y pon tu ID.
- **EmailJS** (envío desde el navegador):
  1. Añade el SDK e inicialízalo en `index.html`.
  2. Descomenta el bloque *OPCIÓN B* con tus IDs de servicio/plantilla.
- **API propia** (backend propio):
  1. Descomenta el bloque *OPCIÓN C* y apunta el `fetch()` a tu endpoint.

Mientras no conectes un backend, el formulario funciona en **modo simulado**
(valida y muestra mensaje de éxito) para no dejar la UX incompleta.

Incluye protección **anti-spam (honeypot)** y **sanitización XSS** ya integradas.

---

## 🗺️ Integrar Google Maps

En la sección **Cobertura** (`#cobertura`) hay un bloque preparado. Sustituye el
enlace-imagen por el `<iframe>` de Google Maps:

1. En Google Maps → **Compartir** → **Insertar un mapa** → copia el `<iframe>`.
2. Pégalo dentro de `.map-placeholder` reemplazando la imagen. Ejemplo:

```html
<iframe
  src="https://www.google.com/maps/embed?pb=..."
  width="100%" height="440" style="border:0;border-radius:26px"
  loading="lazy" allowfullscreen
  referrerpolicy="no-referrer-when-downgrade"
  title="Ubicación — Servicio Técnico de Nevecones"></iframe>
```

---

## 🎨 Íconos e imágenes que faltan por generar (binarios)

Estos archivos son binarios y deben generarse una sola vez (no se incluyen):

- `favicon.ico` — genera desde `favicon.svg` en <https://realfavicongenerator.net>
  o <https://favicon.io>.
- `assets/icons/apple-touch-icon.png` (180×180)
- `assets/icons/icon-192.png` (192×192)
- `assets/icons/icon-512.png` (512×512)
- `assets/images/og-image.jpg` (1200×630) — imagen para compartir en redes.

Mientras tanto, el navegador usará `favicon.svg` (ya incluido y funcional).

---

## ✅ Datos de la empresa (ya integrados)

- **Teléfono / WhatsApp:** +57 313 320 7064
- **Correo:** ocatecservices@gmail.com
- **Dirección:** Carrera 106 #71A-83, Bogotá
- **Cobertura:** Bogotá, Soacha, Mosquera, Chía, Zipaquirá
- **Redes:** Facebook e Instagram (@ocatecsas)

> Si algún dato cambia, edítalo en `index.html` (bloque `LocalBusiness` de
> schema.org, sección de contacto y footer) y en `manifest.json`.

---

## ⚡ Rendimiento, SEO y accesibilidad

- CSS crítico inline + resto diferido (mejora **LCP**).
- Fuentes con `preconnect` + `display=swap`.
- JS modular con `defer`, `IntersectionObserver` y throttling con
  `requestAnimationFrame` (sin listeners de scroll costosos).
- Imágenes con dimensiones explícitas (evita **CLS**) y `lazy loading`.
- **Schema.org** (`HVACBusiness` + `FAQPage`), Open Graph, Twitter Cards,
  `sitemap.xml`, `robots.txt`, `canonical`.
- Accesibilidad: HTML semántico, `aria-*`, foco visible, navegación por teclado,
  `prefers-reduced-motion`, enlace *saltar al contenido*.

### Cómo auditar

Abre Chrome DevTools → **Lighthouse** → analiza en modo móvil y escritorio.
Para resultados óptimos, prueba sobre HTTPS con las imágenes reales en `.webp`.

---

© OCATEC SAS — Servicio Técnico de Nevecones. Bogotá, Colombia.

# FitZone – Club de Entrenamiento Funcional

Sitio web promocional para **FitZone**, un club de entrenamiento funcional que ofrece membresías por niveles (Básico, Pro, Élite y Familiar). El propósito del sitio es presentar los planes disponibles y permitir que los usuarios se inscriban a través de un formulario de contacto, aplicando buenas prácticas de HTML5 semántico, CSS3 responsivo y JavaScript vanilla sin dependencias externas.

---

## Correr localmente

1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   ```

2. Entra a la carpeta del proyecto:
   ```bash
   cd Pr_tecnologias_web
   ```

3. Abre `index.html` en el navegador:
   - **Opción A – Doble clic:** abre el explorador de archivos y haz doble clic sobre `index.html`.
   - **Opción B – Live Server (VSCode):** clic derecho sobre `index.html` → **Open with Live Server**.

> No requiere instalación de dependencias ni servidor backend. Solo HTML, CSS y JavaScript vanilla.

---

## Estructura de archivos

```
Pr_tecnologias_web/
│
├── index.html              → Estructura semántica de la página (HTML5)
├── mockApi.js              → API simulada: GET y POST con delays y errores
├── README.md               → Este archivo
│
└── template/
    ├── css/
    │   ├── variables.css   → Tokens de diseño: colores, espaciados, tipografía
    │   ├── base.css        → Reset CSS y estilos base de elementos HTML
    │   ├── layout.css      → Cabecera, barra de navegación, footer
    │   ├── components.css  → Botones, spinner, tarjetas de plan, campos de form
    │   ├── sections.css    → Hero, sección de planes, sección de inscripción
    │   ├── utilities.css   → Clases utilitarias (.visually-hidden)
    │   └── responsive.css  → Media queries (≤1024px, ≤768px, ≤400px)
    │
    └── js/
        ├── hamburger.js    → Menú móvil (toggle + animación hamburguesa)
        ├── scrollspy.js    → Marca el enlace activo en la nav según sección visible
        ├── planes.js       → Carga, renderiza planes y sincroniza el <select>
        ├── form.js         → Validación, envío del formulario y estados de carga
        └── app.js          → Coordinador: inicializa todos los módulos al cargar
```

---

## Endpoints simulados en mockApi.js

### `getPlanes()`

| Campo              | Detalle |
|--------------------|---------|
| Equivalente HTTP   | `GET /api/planes` |
| Parámetros         | Ninguno |
| Delay              | 600 ms mínimo (simula latencia de red) |
| Error simulado     | 25 % de probabilidad → `Promise.reject` + `console.log("500 Internal Server Error")` |
| Respuesta éxito    | `Array<{ id, nombre, precio, descripcion, caracteristicas[] }>` |

**Ejemplo de respuesta exitosa:**
```json
[
  {
    "id": 1,
    "nombre": "Plan Básico",
    "precio": 29900,
    "descripcion": "Ideal para comenzar tu vida activa.",
    "caracteristicas": ["Acceso a sala de pesas", "Cardio ilimitado", "1 clase grupal/semana", "Casillero incluido"]
  }
]
```

---

### `registrarInscripcion(datos)`

| Campo              | Detalle |
|--------------------|---------|
| Equivalente HTTP   | `POST /api/inscripciones` |
| Parámetros         | `{ nombre: string, email: string, telefono: string, planId: number }` |
| Delay              | 800 ms mínimo (simula latencia de red) |
| Error simulado     | 20 % de probabilidad → `Promise.reject` + `console.log("500 Internal Server Error")` |
| Respuesta éxito    | `{ success: true, mensaje: string }` |

**Ejemplo de respuesta exitosa:**
```json
{
  "success": true,
  "mensaje": "Inscripción registrada correctamente para Laura Gómez. Te contactaremos pronto al correo laura@gmail.com."
}
```

---

## Cumplimiento de requerimientos del parcial

### A. Estructura y semántica HTML

| Requerimiento | Implementación |
|---|---|
| Mínimo 3 secciones con interacción | Hero (CTA → scroll), Planes (carga async + botón por tarjeta), Formulario (validación + envío) |
| Etiquetas semánticas HTML5 | `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`. Sin `<div>` genéricos para estructura |
| Jerarquía de encabezados | Un solo `<h1>` en el hero · `<h2>` en cada sección · `<h3>` en cada tarjeta de plan |
| Labels visibles en formularios | Cada campo tiene `<label for="id">` visible; el `placeholder` es complementario |
| Tipos de input correctos | `type="text"` nombre · `type="email"` correo · `type="tel"` teléfono |

### B. Modelo de caja y diseño responsivo

| Requerimiento | Implementación |
|---|---|
| Sin desbordamientos | Revisado en todos los viewports; uso de `max-width` y `box-sizing: border-box` |
| Responsivo desktop y móvil | CSS Grid con `auto-fit minmax(270px,1fr)` para planes · Flexbox para nav y hero · Media queries en `responsive.css` |
| Espaciado coherente | Escala de 8 px: `--space-1` (8 px) a `--space-12` (96 px) en `variables.css` |

### C. Usabilidad (heurísticas Nielsen)

| Requerimiento | Implementación |
|---|---|
| Botones con texto de acción específica | "Ver planes disponibles" · "Seleccionar este plan" · "Confirmar inscripción" · "Cancelar mi pedido" · "Reintentar carga de planes" |
| Errores con qué falló y cómo corregirlo | Cada campo tiene mensaje en 3 partes: **qué** falló → **por qué** → **cómo** corregirlo. Mensaje junto al campo afectado, no en banner genérico |
| Estado de carga visible | Botón se deshabilita y cambia a "Procesando inscripción…" · Spinner mientras carga el catálogo |
| Confirmación antes de acciones irreversibles | `confirm()` antes de limpiar el formulario con "Cancelar mi pedido" |
| Estado vacío con mensaje explicativo | "No hay planes disponibles en este momento. Intenta recargar la página." |
| Jerarquía visual clara | Botón primario (naranja sólido) destaca la acción principal · Botón secundario/cancelar en outline |
| El usuario siempre sabe dónde está | Scroll spy con `IntersectionObserver`: el enlace de la sección visible se marca con `.is-active` en la nav |

### D. API simulada (mockApi.js)

| Requerimiento | Implementación |
|---|---|
| Mínimo 2 endpoints (GET + POST) | `getPlanes()` y `registrarInscripcion(datos)` |
| Delay mínimo 500 ms | 600 ms y 800 ms respectivamente |
| Simular éxito y error | Error aleatorio (25 % / 20 %) con `console.log("500 Internal Server Error")` + `Promise.reject` |
| Front maneja ambos casos | Mensajes de error descriptivos en pantalla; botón de reintento en el catálogo |
| Documentado en README | Ver sección "Endpoints simulados" arriba |

### E. Repositorio y código

| Requerimiento | Implementación |
|---|---|
| Repositorio público en GitHub | Pendiente de publicar |
| Descripción del proyecto en README | Primera sección de este archivo |
| Cómo correrlo localmente | Sección "Correr localmente" |
| Documentación de endpoints | Sección "Endpoints simulados en mockApi.js" |

---

## Tecnologías utilizadas

- **HTML5** — semántica, ARIA (`aria-live`, `aria-invalid`, `aria-required`, `role="alert"`)
- **CSS3** — Custom Properties, Grid, Flexbox, Media Queries, animaciones (`@keyframes`)
- **JavaScript ES6+** — `async/await`, Promises, DOM API, `IntersectionObserver`

Sin frameworks ni librerías externas. Sin dependencias de `npm`.

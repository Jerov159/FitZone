# FitZone – Club de Entrenamiento Funcional

Sitio web promocional para **FitZone**, un club de entrenamiento funcional que ofrece membresías por niveles (Básico, Pro, Élite y Familiar). El propósito del sitio es presentar los planes disponibles, permitir que los usuarios se inscriban a través de un formulario de contacto y demostrar buenas prácticas de HTML5 semántico, CSS3 responsivo y JavaScript vanilla.

---

## Correr localmente

1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   ```

2. Abre la carpeta del proyecto:
   ```bash
   cd Pr_tecnologias_web
   ```

3. Abre `index.html` directamente en tu navegador:
   - **Opción A – Doble clic:** abre el explorador de archivos, navega hasta la carpeta y haz doble clic en `index.html`.
   - **Opción B – Live Server (VSCode):** instala la extensión *Live Server*, haz clic derecho sobre `index.html` y elige **Open with Live Server**.

> No requiere instalación de dependencias ni servidor backend. El proyecto usa únicamente HTML, CSS y JavaScript vanilla.

---

## Estructura de archivos

```
Pr_tecnologias_web/
├── index.html     → Estructura semántica completa de la página
├── styles.css     → Estilos, layout responsivo y componentes visuales
├── mockApi.js     → API simulada (GET y POST con delays y errores aleatorios)
├── app.js         → Lógica del frontend: renderizado, validación y estados
└── README.md      → Este archivo
```

---

## Endpoints simulados en mockApi.js

### `getPlanes()`

| Campo              | Detalle                                                              |
|--------------------|----------------------------------------------------------------------|
| Equivalente HTTP   | `GET /api/planes`                                                    |
| Parámetros         | Ninguno                                                              |
| Delay              | 600 ms mínimo                                                        |
| Probabilidad error | 25 %                                                                 |
| Respuesta éxito    | `Array<{ id, nombre, precio, descripcion, caracteristicas[] }>`      |
| Respuesta error    | `Promise.reject(Error)` + `console.log("500 Internal Server Error")` |

**Ejemplo de respuesta exitosa:**
```json
[
  {
    "id": 1,
    "nombre": "Plan Básico",
    "precio": 29900,
    "descripcion": "Ideal para comenzar tu vida activa.",
    "caracteristicas": ["Acceso a sala de pesas", "Cardio ilimitado", "..."]
  }
]
```

---

### `registrarInscripcion(datos)`

| Campo              | Detalle                                                              |
|--------------------|----------------------------------------------------------------------|
| Equivalente HTTP   | `POST /api/inscripciones`                                            |
| Parámetros         | `{ nombre: string, email: string, telefono: string, planId: number }`|
| Delay              | 800 ms mínimo                                                        |
| Probabilidad error | 20 %                                                                 |
| Respuesta éxito    | `{ success: true, mensaje: string }`                                 |
| Respuesta error    | `Promise.reject(Error)` + `console.log("500 Internal Server Error")` |

**Ejemplo de respuesta exitosa:**
```json
{
  "success": true,
  "mensaje": "Inscripción registrada correctamente para Laura Gómez. Te contactaremos pronto al correo laura@correo.com."
}
```

---

## Decisiones de diseño y usabilidad

- **Semántica HTML5:** se usan `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>` para toda la estructura principal. Ningún `<div>` genérico como contenedor estructural.
- **Jerarquía de encabezados:** un único `<h1>` en el hero, `<h2>` por sección, `<h3>` dentro de cada tarjeta de plan.
- **Accesibilidad:** todos los campos del formulario tienen `<label for="id">` visible; se usan `aria-live`, `aria-invalid`, `aria-required` y `role="alert"` en los mensajes de error.
- **Estados de carga:** el botón "Confirmar inscripción" se deshabilita y cambia a "Procesando inscripción…" durante la llamada a la API y vuelve a su estado original al finalizar.
- **Errores descriptivos:** cada campo del formulario tiene un mensaje de error específico que explica exactamente qué está mal y cómo corregirlo.
- **Confirmación de cancelación:** el botón "Cancelar mi pedido" muestra un `confirm()` antes de borrar los datos si el usuario ha ingresado algo.
- **Estado vacío:** si el catálogo no devuelve datos, se muestra el mensaje "No hay planes disponibles en este momento. Intenta recargar la página." junto a un botón de reintento.
- **Diseño responsivo:** CSS Grid (`auto-fit minmax`) para el catálogo, Flexbox para nav y hero, menú hamburguesa en móvil (`≤768px`), formulario de ancho completo en pantallas pequeñas.

---

## Tecnologías utilizadas

- HTML5 (semántica, ARIA)
- CSS3 (Custom Properties, Grid, Flexbox, Media Queries, animaciones)
- JavaScript ES6+ (async/await, Promises, DOM API)

Sin frameworks ni librerías externas.

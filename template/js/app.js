/**
 * template/js/app.js
 * Coordinador principal — punto de entrada de la aplicación.
 *
 * Responsabilidad única: orquestar la inicialización de cada módulo
 * una vez que el DOM está listo. No contiene lógica de negocio.
 *
 * Orden de carga esperado en index.html:
 *   1. mockApi.js         (capa de datos / API simulada)
 *   2. hamburger.js       → FitZone.inicializarHamburguesa
 *   3. scrollspy.js       → FitZone.inicializarScrollSpy
 *   4. planes.js          → FitZone.cargarPlanes
 *   5. form.js            → FitZone.inicializarFormulario
 *   6. app.js  ← este archivo (debe ir ÚLTIMO)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Año dinámico en el footer
  const footerYear = document.getElementById('footerYear');
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  // Inicializar módulos en orden lógico
  FitZone.inicializarHamburguesa();
  FitZone.inicializarScrollSpy();
  FitZone.cargarPlanes();
  FitZone.inicializarFormulario();
});

/**
 * template/js/scrollspy.js
 * Módulo: Scroll spy — marca el enlace de navegación activo según la
 *         sección actualmente visible en la ventana.
 * Expone: FitZone.inicializarScrollSpy()
 *
 * Heurística aplicada:
 *   - Visibilidad del estado del sistema (Nielsen #1): el usuario siempre
 *     sabe en qué sección de la página se encuentra.
 * Lista de verificación corte 1:
 *   - "Módulo activo en navegación está marcado."
 */

window.FitZone = window.FitZone || {};

FitZone.inicializarScrollSpy = function () {
  const secciones  = document.querySelectorAll('main section[id]');
  const enlacesNav = document.querySelectorAll('.nav-menu__link[href^="#"]');

  if (!secciones.length || !enlacesNav.length) return;

  /** Aplica .is-active al enlace cuyo href coincide con idSeccion */
  function marcarEnlaceActivo(idSeccion) {
    enlacesNav.forEach(enlace => {
      const apuntaA = enlace.getAttribute('href').replace('#', '');
      enlace.classList.toggle('is-active', apuntaA === idSeccion);
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          marcarEnlaceActivo(entry.target.id);
        }
      });
    },
    {
      // Una sección se considera "activa" cuando entra en la franja
      // comprendida entre el 15 % superior y el 75 % inferior del viewport
      rootMargin: '-15% 0px -75% 0px',
      threshold: 0
    }
  );

  secciones.forEach(seccion => observer.observe(seccion));

  // Estado inicial: marcar "Inicio" como activo
  marcarEnlaceActivo('hero');
};

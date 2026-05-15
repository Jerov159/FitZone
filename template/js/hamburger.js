/**
 * template/js/hamburger.js
 * Módulo: Menú hamburguesa para navegación móvil.
 * Expone: FitZone.inicializarHamburguesa()
 *
 * Heurística aplicada:
 *   - Control y libertad del usuario (Nielsen #3): el menú puede cerrarse
 *     haciendo clic en el botón, en un enlace, o fuera del menú.
 */

window.FitZone = window.FitZone || {};

FitZone.inicializarHamburguesa = function () {
  const btnHamburger = document.getElementById('btnHamburger');
  const navMenu      = document.getElementById('navMenu');

  if (!btnHamburger || !navMenu) return;

  /** Abre o cierra el menú y actualiza aria-expanded */
  btnHamburger.addEventListener('click', () => {
    const estaAbierto = navMenu.classList.toggle('is-open');
    btnHamburger.setAttribute('aria-expanded', String(estaAbierto));
    btnHamburger.setAttribute(
      'aria-label',
      estaAbierto ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'
    );
  });

  /** Cerrar al hacer clic en cualquier enlace del menú */
  navMenu.querySelectorAll('.nav-menu__link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('is-open');
      btnHamburger.setAttribute('aria-expanded', 'false');
      btnHamburger.setAttribute('aria-label', 'Abrir menú de navegación');
    });
  });

  /** Cerrar al hacer clic fuera del menú */
  document.addEventListener('click', (e) => {
    if (!btnHamburger.contains(e.target) && !navMenu.contains(e.target)) {
      navMenu.classList.remove('is-open');
      btnHamburger.setAttribute('aria-expanded', 'false');
    }
  });
};

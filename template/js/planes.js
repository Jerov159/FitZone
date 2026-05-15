/**
 * template/js/planes.js
 * Módulo: Catálogo de planes — carga, renderizado y sincronización con el
 *         formulario de inscripción.
 * Expone: FitZone.cargarPlanes()
 *
 * Depende de:
 *   - mockApi.js (función global getPlanes)
 *
 * Heurísticas aplicadas:
 *   - Visibilidad del estado (Nielsen #1): spinner durante la carga.
 *   - Diagnóstico útil (Nielsen #9): mensaje descriptivo en error/vacío.
 *   - Control del usuario (Nielsen #3): botón "Reintentar carga de planes".
 */

window.FitZone = window.FitZone || {};

FitZone.cargarPlanes = function () {
  // ── Referencias al DOM ──────────────────────────────────────────────────
  const planesLoading       = document.getElementById('planesLoading');
  const planesError         = document.getElementById('planesError');
  const planesGrid          = document.getElementById('planesGrid');
  const planesEmpty         = document.getElementById('planesEmpty');
  const planesRetry         = document.getElementById('planesRetry');
  const btnReintentarPlanes = document.getElementById('btnReintentarPlanes');
  const selectPlan          = document.getElementById('planSeleccionado');

  // ── Helpers de estado ────────────────────────────────────────────────────

  /**
   * Muestra solo el elemento de estado indicado y oculta los demás.
   * @param {'loading'|'error'|'grid'|'empty'} estado
   */
  function mostrarSoloEstado(estado) {
    planesLoading.classList.toggle('visually-hidden', estado !== 'loading');
    planesError.classList.toggle('visually-hidden',   estado !== 'error');
    planesGrid.classList.toggle('visually-hidden',    estado !== 'grid');
    planesEmpty.classList.toggle('visually-hidden',   estado !== 'empty');
    planesRetry.classList.toggle('visually-hidden',   estado !== 'error' && estado !== 'empty');
  }

  /**
   * Construye las tarjetas <article> de cada plan y las inserta en el grid.
   * @param {Array} planes
   */
  function renderizarPlanes(planes) {
    planesGrid.innerHTML = '';

    const formatCOP = valor => new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(valor);

    planes.forEach((plan, index) => {
      const esFeatured = index === 1; // El Plan Pro se destaca visualmente

      const caracteristicasHTML = plan.caracteristicas
        .map(c => `
          <li class="plan-card__feature">
            <span class="plan-card__feature-icon" aria-hidden="true">✓</span>
            <span>${c}</span>
          </li>`)
        .join('');

      const li = document.createElement('li');
      li.innerHTML = `
        <article
          class="plan-card ${esFeatured ? 'plan-card--featured' : ''}"
          aria-label="Plan ${plan.nombre}"
        >
          ${esFeatured ? '<span class="plan-card__badge">Más popular</span>' : ''}
          <header class="plan-card__header">
            <h3 class="plan-card__name">${plan.nombre}</h3>
            <p class="plan-card__price">
              <span class="plan-card__amount">${formatCOP(plan.precio)}</span>
              <span class="plan-card__currency">COP</span>
              <span class="plan-card__period">/ mes</span>
            </p>
          </header>
          <p class="plan-card__desc">${plan.descripcion}</p>
          <ul class="plan-card__features" aria-label="Características del ${plan.nombre}">
            ${caracteristicasHTML}
          </ul>
          <button
            class="btn btn--primary btn--plan"
            type="button"
            data-plan-id="${plan.id}"
            aria-label="Seleccionar el ${plan.nombre} e ir al formulario"
          >
            Seleccionar este plan
          </button>
        </article>`;

      planesGrid.appendChild(li);

      // Pre-seleccionar plan y hacer scroll al formulario
      li.querySelector('.btn--plan').addEventListener('click', () => {
        seleccionarPlanEnFormulario(plan.id);
      });
    });
  }

  /**
   * Rellena el <select> del formulario con las opciones de planes.
   * @param {Array} planes
   */
  function sincronizarSelectPlanes(planes) {
    while (selectPlan.options.length > 1) {
      selectPlan.remove(1);
    }

    const formatCOP = valor => new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(valor);

    planes.forEach(plan => {
      const option = document.createElement('option');
      option.value = plan.id;
      option.textContent = `${plan.nombre} — ${formatCOP(plan.precio)} / mes`;
      selectPlan.appendChild(option);
    });
  }

  /**
   * Pre-selecciona el plan en el <select> del formulario y hace scroll
   * para que el usuario pueda completar su inscripción de inmediato.
   * @param {number} planId
   */
  function seleccionarPlanEnFormulario(planId) {
    selectPlan.value = planId;
    // Limpiar posible error de "plan no seleccionado"
    selectPlan.classList.remove('is-invalid');
    selectPlan.removeAttribute('aria-invalid');
    const errorPlan = document.getElementById('planError');
    if (errorPlan) errorPlan.textContent = '';

    document.getElementById('inscripcion').scrollIntoView({ behavior: 'smooth' });

    // Enfocar el primer campo vacío del formulario
    setTimeout(() => {
      const nombre = document.getElementById('nombre');
      const email  = document.getElementById('email');
      if (nombre && !nombre.value.trim()) {
        nombre.focus();
      } else if (email && !email.value.trim()) {
        email.focus();
      } else {
        document.getElementById('btnConfirmar')?.focus();
      }
    }, 600);
  }

  // ── Orquestación principal ───────────────────────────────────────────────

  async function ejecutarCarga() {
    mostrarSoloEstado('loading');

    try {
      const planes = await getPlanes();

      if (!planes || planes.length === 0) {
        mostrarSoloEstado('empty');
        return;
      }

      renderizarPlanes(planes);
      sincronizarSelectPlanes(planes);
      mostrarSoloEstado('grid');

    } catch (_error) {
      mostrarSoloEstado('error');
      planesError.textContent =
        'No pudimos cargar los planes disponibles. ' +
        'Hubo un problema de conexión con el servidor. ' +
        'Por favor intenta nuevamente en unos momentos.';
    }
  }

  // Botón de reintento
  btnReintentarPlanes.addEventListener('click', ejecutarCarga);

  // Carga inicial
  ejecutarCarga();
};

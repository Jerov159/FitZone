/**
 * app.js
 * Lógica principal de FitZone.
 * Consume mockApi.js como si fueran llamadas reales a una API REST.
 * Responsabilidades:
 *   - Cargar y renderizar el catálogo de planes
 *   - Sincronizar el <select> del formulario con los planes cargados
 *   - Validar el formulario del lado del cliente (onBlur + onSubmit)
 *   - Gestionar estados de carga, éxito y error
 *   - Manejar la confirmación antes de cancelar el formulario
 *   - Scroll spy: marcar el enlace de navegación activo según sección visible
 */

/* ════════════════════════════════════════════════════════════════
   REFERENCIAS AL DOM
   ════════════════════════════════════════════════════════════════ */

// Sección de planes
const planesLoading      = document.getElementById('planesLoading');
const planesError        = document.getElementById('planesError');
const planesGrid         = document.getElementById('planesGrid');
const planesEmpty        = document.getElementById('planesEmpty');
const planesRetry        = document.getElementById('planesRetry');
const btnReintentarPlanes= document.getElementById('btnReintentarPlanes');

// Formulario
const formInscripcion    = document.getElementById('formInscripcion');
const inputNombre        = document.getElementById('nombre');
const inputEmail         = document.getElementById('email');
const inputTelefono      = document.getElementById('telefono');
const selectPlan         = document.getElementById('planSeleccionado');
const btnConfirmar       = document.getElementById('btnConfirmar');
const btnCancelar        = document.getElementById('btnCancelar');
const formApiMessage     = document.getElementById('formApiMessage');

// Mensajes de error de campos
const errorNombre        = document.getElementById('nombreError');
const errorEmail         = document.getElementById('emailError');
const errorTelefono      = document.getElementById('telefonoError');
const errorPlan          = document.getElementById('planError');

// Footer
const footerYear         = document.getElementById('footerYear');

// Hamburguesa
const btnHamburger       = document.getElementById('btnHamburger');
const navMenu            = document.getElementById('navMenu');


/* ════════════════════════════════════════════════════════════════
   INICIALIZACIÓN
   ════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  footerYear.textContent = new Date().getFullYear();
  inicializarHamburguesa();
  inicializarScrollSpy();
  cargarPlanes();
});


/* ════════════════════════════════════════════════════════════════
   MENÚ HAMBURGUESA (MOBILE)
   ════════════════════════════════════════════════════════════════ */

function inicializarHamburguesa() {
  btnHamburger.addEventListener('click', () => {
    const estaAbierto = navMenu.classList.toggle('is-open');
    btnHamburger.setAttribute('aria-expanded', String(estaAbierto));
    btnHamburger.setAttribute(
      'aria-label',
      estaAbierto ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'
    );
  });

  // Cerrar el menú al hacer clic en un enlace
  navMenu.querySelectorAll('.nav-menu__link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('is-open');
      btnHamburger.setAttribute('aria-expanded', 'false');
      btnHamburger.setAttribute('aria-label', 'Abrir menú de navegación');
    });
  });

  // Cerrar si se hace clic fuera del menú
  document.addEventListener('click', (e) => {
    if (!btnHamburger.contains(e.target) && !navMenu.contains(e.target)) {
      navMenu.classList.remove('is-open');
      btnHamburger.setAttribute('aria-expanded', 'false');
    }
  });
}


/* ════════════════════════════════════════════════════════════════
   SCROLL SPY — NAVEGACIÓN ACTIVA
   Heurística: "El usuario siempre debe saber dónde está."
   Lista de verificación Corte 1: "Módulo activo en nav está marcado."
   ════════════════════════════════════════════════════════════════ */

/**
 * Usa IntersectionObserver para detectar qué sección es visible y
 * aplica la clase `is-active` al enlace de navegación correspondiente.
 */
function inicializarScrollSpy() {
  const secciones = document.querySelectorAll('main section[id]');
  const enlacesNav = document.querySelectorAll('.nav-menu__link[href^="#"]');

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
      // La sección se considera "activa" cuando su parte superior
      // cruza el 20% superior de la ventana
      rootMargin: '-15% 0px -75% 0px',
      threshold: 0
    }
  );

  secciones.forEach(seccion => observer.observe(seccion));

  // Marcar "Inicio" como activo por defecto al cargar
  marcarEnlaceActivo('hero');
}


/* ════════════════════════════════════════════════════════════════
   CARGA DE PLANES
   ════════════════════════════════════════════════════════════════ */

/**
 * Orquesta la carga del catálogo de planes desde la API simulada.
 * Gestiona todos los estados: cargando, vacío, error, datos.
 */
async function cargarPlanes() {
  // Mostrar solo el estado de carga
  mostrarSoloEstadoPlanes('loading');

  try {
    const planes = await getPlanes();

    if (!planes || planes.length === 0) {
      mostrarSoloEstadoPlanes('empty');
      return;
    }

    renderizarPlanes(planes);
    sincronizarSelectPlanes(planes);
    mostrarSoloEstadoPlanes('grid');

  } catch (error) {
    mostrarSoloEstadoPlanes('error');
    planesError.textContent =
      'No pudimos cargar los planes disponibles. Hubo un problema de conexión con el servidor. ' +
      'Por favor intenta nuevamente en unos momentos.';
  }
}

/**
 * Controla qué elemento de estado de planes es visible.
 * @param {'loading'|'error'|'grid'|'empty'} estado
 */
function mostrarSoloEstadoPlanes(estado) {
  planesLoading.classList.toggle('visually-hidden', estado !== 'loading');
  planesError.classList.toggle('visually-hidden',   estado !== 'error');
  planesGrid.classList.toggle('visually-hidden',    estado !== 'grid');
  planesEmpty.classList.toggle('visually-hidden',   estado !== 'empty');
  planesRetry.classList.toggle('visually-hidden',   estado !== 'error' && estado !== 'empty');
}

/**
 * Construye y agrega las tarjetas de plan al grid del DOM.
 * @param {Array} planes - Array de objetos plan devuelto por getPlanes()
 */
function renderizarPlanes(planes) {
  planesGrid.innerHTML = '';

  planes.forEach((plan, index) => {
    const esFeatured = index === 1; // El segundo plan (Pro) se destaca
    const precioFormateado = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(plan.precio);

    const li = document.createElement('li');

    const caracteristicasHTML = plan.caracteristicas
      .map(c => `
        <li class="plan-card__feature">
          <span class="plan-card__feature-icon" aria-hidden="true">✓</span>
          <span>${c}</span>
        </li>`)
      .join('');

    li.innerHTML = `
      <article class="plan-card ${esFeatured ? 'plan-card--featured' : ''}" aria-label="Plan ${plan.nombre}">
        ${esFeatured ? '<span class="plan-card__badge">Más popular</span>' : ''}
        <header class="plan-card__header">
          <h3 class="plan-card__name">${plan.nombre}</h3>
          <p class="plan-card__price">
            <span class="plan-card__amount">${precioFormateado}</span>
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

    // Listener para pre-seleccionar el plan en el formulario
    li.querySelector('.btn--plan').addEventListener('click', () => {
      seleccionarPlanEnFormulario(plan.id);
    });
  });
}

/**
 * Rellena el <select> del formulario con las opciones de planes cargados.
 * @param {Array} planes
 */
function sincronizarSelectPlanes(planes) {
  // Limpiar opciones dinámicas anteriores (conservar la opción vacía)
  while (selectPlan.options.length > 1) {
    selectPlan.remove(1);
  }
  planes.forEach(plan => {
    const option = document.createElement('option');
    option.value = plan.id;
    option.textContent = `${plan.nombre} — ${new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(plan.precio)} / mes`;
    selectPlan.appendChild(option);
  });
}

/**
 * Pre-selecciona un plan en el <select> y hace scroll al formulario.
 * @param {number} planId
 */
function seleccionarPlanEnFormulario(planId) {
  selectPlan.value = planId;
  limpiarErrorCampo(selectPlan, errorPlan);
  document.getElementById('inscripcion').scrollIntoView({ behavior: 'smooth' });
  // Enfocar el primer campo vacío del formulario
  setTimeout(() => {
    if (!inputNombre.value.trim()) {
      inputNombre.focus();
    } else if (!inputEmail.value.trim()) {
      inputEmail.focus();
    } else {
      btnConfirmar.focus();
    }
  }, 600);
}

// Botón "Reintentar carga de planes"
btnReintentarPlanes.addEventListener('click', cargarPlanes);


/* ════════════════════════════════════════════════════════════════
   FORMULARIO DE INSCRIPCIÓN
   ════════════════════════════════════════════════════════════════ */

formInscripcion.addEventListener('submit', async (e) => {
  e.preventDefault();

  ocultarMensajeApi();

  const esValido = validarFormulario();
  if (!esValido) return;

  const datos = {
    nombre:    inputNombre.value.trim(),
    email:     inputEmail.value.trim().toLowerCase(),
    telefono:  inputTelefono.value.trim(),
    planId:    Number(selectPlan.value)
  };

  iniciarEstadoCarga();

  try {
    const respuesta = await registrarInscripcion(datos);
    if (respuesta.success) {
      mostrarMensajeApi(respuesta.mensaje, 'success');
      formInscripcion.reset();
      limpiarTodosLosErrores();
    }
  } catch (error) {
    mostrarMensajeApi(
      'No pudimos procesar tu inscripción. El servidor tuvo un problema. ' +
      'Por favor intenta de nuevo en unos momentos.',
      'error'
    );
  } finally {
    finalizarEstadoCarga();
  }
});

/**
 * Deshabilita el botón y cambia su texto durante la llamada a la API.
 */
function iniciarEstadoCarga() {
  btnConfirmar.disabled = true;
  btnConfirmar.setAttribute('aria-disabled', 'true');
  btnConfirmar.dataset.textoOriginal = btnConfirmar.textContent;
  btnConfirmar.textContent = 'Procesando inscripción…';
}

/**
 * Restaura el botón a su estado normal después de la llamada a la API.
 */
function finalizarEstadoCarga() {
  btnConfirmar.disabled = false;
  btnConfirmar.setAttribute('aria-disabled', 'false');
  btnConfirmar.textContent = btnConfirmar.dataset.textoOriginal || 'Confirmar inscripción';
}

/**
 * Confirmación antes de cancelar/limpiar el formulario.
 * Se muestra solo si hay datos ingresados.
 */
btnCancelar.addEventListener('click', () => {
  const hayCamposRellenos =
    inputNombre.value || inputEmail.value ||
    inputTelefono.value || selectPlan.value;

  if (hayCamposRellenos) {
    const confirmar = confirm(
      '¿Seguro que deseas cancelar? Se borrarán todos los datos ingresados.'
    );
    if (!confirmar) return;
  }

  formInscripcion.reset();
  limpiarTodosLosErrores();
  ocultarMensajeApi();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ════════════════════════════════════════════════════════════════
   VALIDACIÓN DEL FORMULARIO
   ════════════════════════════════════════════════════════════════ */

/**
 * Ejecuta todas las validaciones del formulario.
 * @returns {boolean} true si todos los campos son válidos
 */
function validarFormulario() {
  let valido = true;

  // Nombre: requerido, mínimo 3 caracteres
  const nombre = inputNombre.value.trim();
  if (!nombre) {
    // Qué: campo vacío | Por qué: es obligatorio para identificarte | Cómo: ingrésalo
    marcarErrorCampo(inputNombre, errorNombre,
      'El campo "Nombre completo" está vacío. Es obligatorio para poder identificarte. Escribe tu nombre completo.');
    valido = false;
  } else if (nombre.length < 3) {
    // Qué: nombre demasiado corto | Por qué: mínimo 3 caracteres | Cómo: amplíalo
    marcarErrorCampo(inputNombre, errorNombre,
      'El nombre ingresado es demasiado corto. Debe tener al menos 3 caracteres. Verifica que hayas escrito tu nombre completo.');
    valido = false;
  } else {
    limpiarErrorCampo(inputNombre, errorNombre);
  }

  // Email: requerido + formato válido
  const email = inputEmail.value.trim();
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    // Qué: campo vacío | Por qué: necesitamos contactarte | Cómo: ingrésalo
    marcarErrorCampo(inputEmail, errorEmail,
      'El campo "Correo electrónico" está vacío. Lo necesitamos para enviarte la confirmación. Escribe tu dirección de email.');
    valido = false;
  } else if (!regexEmail.test(email)) {
    // Qué: formato inválido | Por qué: no tiene estructura usuario@dominio.com | Cómo: corrígelo
    marcarErrorCampo(inputEmail, errorEmail,
      'El correo electrónico no tiene un formato válido. Debe seguir la estructura usuario@dominio.com (ej: laura@gmail.com). Corrígelo e intenta de nuevo.');
    valido = false;
  } else {
    limpiarErrorCampo(inputEmail, errorEmail);
  }

  // Teléfono: requerido, mínimo 7 dígitos numéricos
  const telefono = inputTelefono.value.trim();
  const regexTel = /^\+?[\d\s\-()]{7,}$/;
  if (!telefono) {
    // Qué: campo vacío | Por qué: necesitamos tu contacto | Cómo: ingrésalo
    marcarErrorCampo(inputTelefono, errorTelefono,
      'El campo "Teléfono" está vacío. Lo necesitamos para que un asesor te contacte. Escribe tu número de celular o fijo.');
    valido = false;
  } else if (!regexTel.test(telefono)) {
    // Qué: formato inválido | Por qué: contiene caracteres no numéricos o es muy corto | Cómo: corrígelo
    marcarErrorCampo(inputTelefono, errorTelefono,
      'El número de teléfono no es válido. Debe contener al menos 7 dígitos numéricos (ej: 3001234567). Elimina letras o símbolos e intenta de nuevo.');
    valido = false;
  } else {
    limpiarErrorCampo(inputTelefono, errorTelefono);
  }

  // Plan: requerido
  if (!selectPlan.value) {
    // Qué: no hay plan seleccionado | Por qué: es necesario para procesar | Cómo: elige uno
    marcarErrorCampo(selectPlan, errorPlan,
      'No has seleccionado un plan. Es necesario para completar tu inscripción. Elige el plan que mejor se adapte a tus objetivos.');
    valido = false;
  } else {
    limpiarErrorCampo(selectPlan, errorPlan);
  }

  // Enfocar el primer campo con error para accesibilidad
  if (!valido) {
    const primerError = formInscripcion.querySelector('.is-invalid');
    if (primerError) primerError.focus();
  }

  return valido;
}

/**
 * Marca visualmente un campo como inválido y muestra el mensaje de error.
 */
function marcarErrorCampo(input, errorEl, mensaje) {
  input.classList.add('is-invalid');
  input.setAttribute('aria-invalid', 'true');
  errorEl.textContent = mensaje;
}

/**
 * Limpia el estado de error de un campo.
 */
function limpiarErrorCampo(input, errorEl) {
  input.classList.remove('is-invalid');
  input.removeAttribute('aria-invalid');
  errorEl.textContent = '';
}

/**
 * Limpia todos los errores del formulario a la vez.
 */
function limpiarTodosLosErrores() {
  limpiarErrorCampo(inputNombre,   errorNombre);
  limpiarErrorCampo(inputEmail,    errorEmail);
  limpiarErrorCampo(inputTelefono, errorTelefono);
  limpiarErrorCampo(selectPlan,    errorPlan);
}

// Validación en tiempo real al salir de cada campo (blur)
inputNombre.addEventListener('blur',   () => validarCampoNombre());
inputEmail.addEventListener('blur',    () => validarCampoEmail());
inputTelefono.addEventListener('blur', () => validarCampoTelefono());
selectPlan.addEventListener('change',  () => {
  if (selectPlan.value) limpiarErrorCampo(selectPlan, errorPlan);
});

function validarCampoNombre() {
  const v = inputNombre.value.trim();
  if (!v) {
    marcarErrorCampo(inputNombre, errorNombre,
      'El campo "Nombre completo" está vacío. Es obligatorio para poder identificarte. Escribe tu nombre completo.');
  } else if (v.length < 3) {
    marcarErrorCampo(inputNombre, errorNombre,
      'El nombre ingresado es demasiado corto. Debe tener al menos 3 caracteres. Verifica que hayas escrito tu nombre completo.');
  } else {
    limpiarErrorCampo(inputNombre, errorNombre);
  }
}

function validarCampoEmail() {
  const v = inputEmail.value.trim();
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!v) {
    marcarErrorCampo(inputEmail, errorEmail,
      'El campo "Correo electrónico" está vacío. Lo necesitamos para enviarte la confirmación. Escribe tu dirección de email.');
  } else if (!regex.test(v)) {
    marcarErrorCampo(inputEmail, errorEmail,
      'El correo electrónico no tiene un formato válido. Debe seguir la estructura usuario@dominio.com (ej: laura@gmail.com). Corrígelo e intenta de nuevo.');
  } else {
    limpiarErrorCampo(inputEmail, errorEmail);
  }
}

function validarCampoTelefono() {
  const v = inputTelefono.value.trim();
  const regex = /^\+?[\d\s\-()]{7,}$/;
  if (!v) {
    marcarErrorCampo(inputTelefono, errorTelefono,
      'El campo "Teléfono" está vacío. Lo necesitamos para que un asesor te contacte. Escribe tu número de celular o fijo.');
  } else if (!regex.test(v)) {
    marcarErrorCampo(inputTelefono, errorTelefono,
      'El número de teléfono no es válido. Debe contener al menos 7 dígitos numéricos (ej: 3001234567). Elimina letras o símbolos e intenta de nuevo.');
  } else {
    limpiarErrorCampo(inputTelefono, errorTelefono);
  }
}


/* ════════════════════════════════════════════════════════════════
   MENSAJES DE RESPUESTA API
   ════════════════════════════════════════════════════════════════ */

/**
 * Muestra el mensaje de respuesta de la API con el estilo correcto.
 * @param {string} mensaje
 * @param {'success'|'error'} tipo
 */
function mostrarMensajeApi(mensaje, tipo) {
  formApiMessage.textContent = mensaje;
  formApiMessage.classList.remove('visually-hidden', 'form-api-message--success', 'form-api-message--error');
  formApiMessage.classList.add(`form-api-message--${tipo}`);
  formApiMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Oculta el mensaje de respuesta de la API.
 */
function ocultarMensajeApi() {
  formApiMessage.classList.add('visually-hidden');
  formApiMessage.classList.remove('form-api-message--success', 'form-api-message--error');
  formApiMessage.textContent = '';
}

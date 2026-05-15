/**
 * template/js/form.js
 * Módulo: Formulario de inscripción — validación, envío y gestión de estados.
 * Expone: FitZone.inicializarFormulario()
 *
 * Depende de:
 *   - mockApi.js (función global registrarInscripcion)
 *
 * Heurísticas aplicadas:
 *   - Visibilidad del estado (Nielsen #1): botón cambia a "Procesando…".
 *   - Prevención de errores (Nielsen #5): validación onBlur antes del envío.
 *   - Diagnóstico útil (Nielsen #9): errores con Qué / Por qué / Cómo.
 *   - Control del usuario (Nielsen #3): confirm() antes de cancelar.
 */

window.FitZone = window.FitZone || {};

FitZone.inicializarFormulario = function () {
  // ── Referencias al DOM ──────────────────────────────────────────────────
  const formInscripcion = document.getElementById('formInscripcion');
  const inputNombre     = document.getElementById('nombre');
  const inputEmail      = document.getElementById('email');
  const inputTelefono   = document.getElementById('telefono');
  const selectPlan      = document.getElementById('planSeleccionado');
  const btnConfirmar    = document.getElementById('btnConfirmar');
  const btnCancelar     = document.getElementById('btnCancelar');
  const formApiMessage  = document.getElementById('formApiMessage');

  const errorNombre   = document.getElementById('nombreError');
  const errorEmail    = document.getElementById('emailError');
  const errorTelefono = document.getElementById('telefonoError');
  const errorPlan     = document.getElementById('planError');

  // ── Helpers de estado de campo ───────────────────────────────────────────

  /** Marca un campo como inválido y muestra el mensaje de error junto a él */
  function marcarError(input, errorEl, mensaje) {
    input.classList.add('is-invalid');
    input.setAttribute('aria-invalid', 'true');
    errorEl.textContent = mensaje;
  }

  /** Limpia el estado de error de un campo */
  function limpiarError(input, errorEl) {
    input.classList.remove('is-invalid');
    input.removeAttribute('aria-invalid');
    errorEl.textContent = '';
  }

  /** Limpia todos los errores del formulario */
  function limpiarTodosLosErrores() {
    limpiarError(inputNombre,   errorNombre);
    limpiarError(inputEmail,    errorEmail);
    limpiarError(inputTelefono, errorTelefono);
    limpiarError(selectPlan,    errorPlan);
  }

  // ── Mensajes de respuesta de la API ──────────────────────────────────────

  /** Muestra el resultado de la llamada a la API con el estilo adecuado */
  function mostrarMensajeApi(mensaje, tipo) {
    formApiMessage.textContent = mensaje;
    formApiMessage.classList.remove(
      'visually-hidden',
      'form-api-message--success',
      'form-api-message--error'
    );
    formApiMessage.classList.add(`form-api-message--${tipo}`);
    formApiMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /** Oculta el mensaje de respuesta de la API */
  function ocultarMensajeApi() {
    formApiMessage.classList.add('visually-hidden');
    formApiMessage.classList.remove(
      'form-api-message--success',
      'form-api-message--error'
    );
    formApiMessage.textContent = '';
  }

  // ── Estado de carga del botón ─────────────────────────────────────────────

  function iniciarEstadoCarga() {
    btnConfirmar.disabled = true;
    btnConfirmar.setAttribute('aria-disabled', 'true');
    btnConfirmar.dataset.textoOriginal = btnConfirmar.textContent;
    btnConfirmar.textContent = 'Procesando inscripción…';
  }

  function finalizarEstadoCarga() {
    btnConfirmar.disabled = false;
    btnConfirmar.setAttribute('aria-disabled', 'false');
    btnConfirmar.textContent =
      btnConfirmar.dataset.textoOriginal || 'Confirmar inscripción';
  }

  // ── Validaciones individuales (onBlur) ────────────────────────────────────
  // Se valida al perder el foco, no mientras el usuario escribe.
  // (Nielsen #5 / slide 25 del docente: "validar onBlur, no onKeyup")

  function validarNombre() {
    const v = inputNombre.value.trim();
    if (!v) {
      marcarError(inputNombre, errorNombre,
        'El campo "Nombre completo" está vacío. ' +
        'Es obligatorio para poder identificarte. ' +
        'Escribe tu nombre completo.');
      return false;
    }
    if (v.length < 3) {
      marcarError(inputNombre, errorNombre,
        'El nombre ingresado es demasiado corto. ' +
        'Debe tener al menos 3 caracteres. ' +
        'Verifica que hayas escrito tu nombre completo.');
      return false;
    }
    limpiarError(inputNombre, errorNombre);
    return true;
  }

  function validarEmail() {
    const v     = inputEmail.value.trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!v) {
      marcarError(inputEmail, errorEmail,
        'El campo "Correo electrónico" está vacío. ' +
        'Lo necesitamos para enviarte la confirmación. ' +
        'Escribe tu dirección de email.');
      return false;
    }
    if (!regex.test(v)) {
      marcarError(inputEmail, errorEmail,
        'El correo electrónico no tiene un formato válido. ' +
        'Debe seguir la estructura usuario@dominio.com (ej: laura@gmail.com). ' +
        'Corrígelo e intenta de nuevo.');
      return false;
    }
    limpiarError(inputEmail, errorEmail);
    return true;
  }

  function validarTelefono() {
    const v     = inputTelefono.value.trim();
    const regex = /^\+?[\d\s\-()]{7,}$/;
    if (!v) {
      marcarError(inputTelefono, errorTelefono,
        'El campo "Teléfono" está vacío. ' +
        'Lo necesitamos para que un asesor te contacte. ' +
        'Escribe tu número de celular o fijo.');
      return false;
    }
    if (!regex.test(v)) {
      marcarError(inputTelefono, errorTelefono,
        'El número de teléfono no es válido. ' +
        'Debe contener al menos 7 dígitos numéricos (ej: 3001234567). ' +
        'Elimina letras o símbolos e intenta de nuevo.');
      return false;
    }
    limpiarError(inputTelefono, errorTelefono);
    return true;
  }

  function validarPlan() {
    if (!selectPlan.value) {
      marcarError(selectPlan, errorPlan,
        'No has seleccionado un plan. ' +
        'Es necesario para completar tu inscripción. ' +
        'Elige el plan que mejor se adapte a tus objetivos.');
      return false;
    }
    limpiarError(selectPlan, errorPlan);
    return true;
  }

  /** Ejecuta todas las validaciones y retorna true si el formulario es válido */
  function validarFormulario() {
    // Evaluar todos los campos (no usar && para que todos se marquen a la vez)
    const resultados = [
      validarNombre(),
      validarEmail(),
      validarTelefono(),
      validarPlan()
    ];
    const esValido = resultados.every(Boolean);

    // Enfocar el primer campo con error para accesibilidad
    if (!esValido) {
      formInscripcion.querySelector('.is-invalid')?.focus();
    }
    return esValido;
  }

  // ── Listeners de validación en tiempo real (onBlur) ───────────────────────
  inputNombre.addEventListener('blur',   validarNombre);
  inputEmail.addEventListener('blur',    validarEmail);
  inputTelefono.addEventListener('blur', validarTelefono);
  selectPlan.addEventListener('change',  () => {
    if (selectPlan.value) limpiarError(selectPlan, errorPlan);
  });

  // ── Envío del formulario ──────────────────────────────────────────────────
  formInscripcion.addEventListener('submit', async (e) => {
    e.preventDefault();
    ocultarMensajeApi();

    if (!validarFormulario()) return;

    const datos = {
      nombre:   inputNombre.value.trim(),
      email:    inputEmail.value.trim().toLowerCase(),
      telefono: inputTelefono.value.trim(),
      planId:   Number(selectPlan.value)
    };

    iniciarEstadoCarga();

    try {
      const respuesta = await registrarInscripcion(datos);
      if (respuesta.success) {
        mostrarMensajeApi(respuesta.mensaje, 'success');
        formInscripcion.reset();
        limpiarTodosLosErrores();
      }
    } catch (_error) {
      mostrarMensajeApi(
        'No pudimos procesar tu inscripción. ' +
        'El servidor tuvo un problema interno. ' +
        'Por favor intenta de nuevo en unos momentos.',
        'error'
      );
    } finally {
      finalizarEstadoCarga();
    }
  });

  // ── Cancelar formulario ───────────────────────────────────────────────────
  // Requiere confirmación si hay datos ingresados (acción destructiva).
  btnCancelar.addEventListener('click', () => {
    const hayCamposRellenos =
      inputNombre.value   ||
      inputEmail.value    ||
      inputTelefono.value ||
      selectPlan.value;

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
};

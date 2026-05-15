/**
 * mockApi.js
 * Simula llamadas a una API REST para la página FitZone.
 * Todas las funciones devuelven Promises con delay artificial para
 * reproducir latencia de red y errores de servidor (HTTP 500).
 */

// ─── Datos estáticos que simularían la base de datos del servidor ─────────────

const _planes = [
  {
    id: 1,
    nombre: "Plan Básico",
    precio: 29900,
    descripcion: "Ideal para comenzar tu vida activa. Acceso a sala de pesas y cardio.",
    caracteristicas: [
      "Acceso a sala de pesas",
      "Cardio ilimitado",
      "1 clase grupal por semana",
      "Casillero incluido"
    ]
  },
  {
    id: 2,
    nombre: "Plan Pro",
    precio: 49900,
    descripcion: "Para quienes buscan más variedad y acompañamiento profesional.",
    caracteristicas: [
      "Todo lo del Plan Básico",
      "Clases grupales ilimitadas",
      "Evaluación física inicial",
      "Acceso a zona de CrossFit"
    ]
  },
  {
    id: 3,
    nombre: "Plan Élite",
    precio: 79900,
    descripcion: "Experiencia completa con entrenador personal y nutrición.",
    caracteristicas: [
      "Todo lo del Plan Pro",
      "4 sesiones de entrenador personal / mes",
      "Plan nutricional personalizado",
      "Acceso 24/7 al gimnasio"
    ]
  },
  {
    id: 4,
    nombre: "Plan Familiar",
    precio: 109900,
    descripcion: "El Plan Élite para hasta 3 integrantes del mismo núcleo familiar.",
    caracteristicas: [
      "Todo lo del Plan Élite",
      "Hasta 3 miembros del hogar",
      "Descuento en tienda FitZone",
      "Estacionamiento reservado"
    ]
  }
];

// ─── Función auxiliar interna ─────────────────────────────────────────────────

/**
 * Decide aleatoriamente si simular un error 500.
 * @param {number} probabilidad - Valor entre 0 y 1 (ej: 0.25 = 25 %).
 * @returns {boolean} true si debe lanzarse el error.
 */
function _debeSimularError(probabilidad) {
  return Math.random() < probabilidad;
}

// ─── Endpoints simulados ──────────────────────────────────────────────────────

/**
 * getPlanes()
 * Equivalente HTTP: GET /api/planes
 *
 * Simula la obtención del catálogo de planes desde el servidor.
 * Delay mínimo: 600 ms.
 * Error aleatorio: 25 % de probabilidad.
 *
 * @returns {Promise<Array>} Array de objetos { id, nombre, precio, descripcion, caracteristicas[] }
 */
function getPlanes() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (_debeSimularError(0.25)) {
        console.log("500 Internal Server Error");
        reject(new Error("500 Internal Server Error"));
        return;
      }
      // Retorna copia del array para evitar mutaciones externas
      resolve(_planes.map(p => ({ ...p, caracteristicas: [...p.caracteristicas] })));
    }, 600);
  });
}

/**
 * registrarInscripcion(datos)
 * Equivalente HTTP: POST /api/inscripciones
 *
 * Simula el registro de un nuevo usuario en el sistema.
 * Delay mínimo: 800 ms.
 * Error aleatorio: 20 % de probabilidad.
 *
 * @param {{ nombre: string, email: string, telefono: string, planId: number }} datos
 * @returns {Promise<{ success: boolean, mensaje: string }>}
 */
function registrarInscripcion(datos) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (_debeSimularError(0.20)) {
        console.log("500 Internal Server Error");
        reject(new Error("500 Internal Server Error"));
        return;
      }
      resolve({
        success: true,
        mensaje: `Inscripción registrada correctamente para ${datos.nombre}. Te contactaremos pronto al correo ${datos.email}.`
      });
    }, 800);
  });
}

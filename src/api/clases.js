import { axiosPrivate } from "./axiosPrivate";
import { axiosPublic } from "./axiosPublic";

// Clases (plantillas)
export const getClases = (todas = false) =>
  axiosPrivate.get("/clases", { params: todas ? { todas: "true" } : {} });

export const postCrearClase = (data) => axiosPrivate.post("/clases", data);

export const putActualizarClase = (id, data) =>
  axiosPrivate.put(`/clases/${id}`, data);

export const patchToggleActivaClase = (id) =>
  axiosPrivate.patch(`/clases/${id}/toggle-activa`);

export const deleteClase = (id) => axiosPrivate.delete(`/clases/${id}`);

// Sesiones (ocurrencias generadas del horario semanal)
export const getSesionesClases = (params = {}) =>
  axiosPrivate.get("/clases/sesiones", { params });

export const getInscritosSesion = (claseId, fecha) =>
  axiosPrivate.get(`/clases/${claseId}/inscritos`, { params: { fecha } });

// Excepciones puntuales (cancelar una fecha o cambiar su cupo, o forzar que
// una clase se mantenga habilitada pese a un feriado bloqueado)
export const postExcepcionClase = (claseId, data) =>
  axiosPrivate.post(`/clases/${claseId}/excepciones`, data);

export const deleteExcepcionClase = (excepcionId) =>
  axiosPrivate.delete(`/clases/excepciones/${excepcionId}`);

// Feriados del módulo de clases (por empresa): listar + bloquear/desbloquear
// el día completo. La lista de feriados en sí sigue siendo global (mismo
// origen que api/feriados.js), esto solo agrega el estado de bloqueo propio
// del gimnasio.
export const getFeriadosClases = (params = {}) =>
  axiosPrivate.get("/clases/feriados", { params });

export const postBloquearFeriadoClase = (fecha, data) =>
  axiosPrivate.post(`/clases/feriados/${fecha}/bloquear`, data);

export const deleteBloquearFeriadoClase = (fecha) =>
  axiosPrivate.delete(`/clases/feriados/${fecha}/bloquear`);

// Inscripciones
export const postInscribirCliente = (claseId, data) =>
  axiosPrivate.post(`/clases/${claseId}/inscribir`, data);

export const patchCancelarInscripcion = (inscripcionId, motivo) =>
  axiosPrivate.patch(`/clases/inscripcion/${inscripcionId}/cancelar`, {
    motivo,
  });

export const patchPagoInscripcion = (inscripcionId, data) =>
  axiosPrivate.patch(`/clases/inscripcion/${inscripcionId}/pago`, data);

// Mis inscripciones (vista del cliente logueado) — usada por ClasesContext.
// Faltaba exportarse, igual que pasaba con getClasesPublicas antes.
export const getMisInscripciones = () =>
  axiosPrivate.get("/clases/mis-inscripciones");

// ── Público (sin login) ─────────────────────────────────────────────────
// NOTA: estas tres ya se usaban en useLandingData.js / ClasePruebaInvitado.jsx
// pero nunca se habían exportado desde acá — el landing de cualquier
// empresa con módulo de clases grupales estaba silenciosamente rompiendo
// esa carga (getClasesPublicas era `undefined` en tiempo de ejecución).

export const getClasesPublicas = (slug) =>
  axiosPublic.get(`/clases/${slug}/publicas`);

export const getSesionesPublicas = (slug, params = {}) =>
  axiosPublic.get(`/clases/${slug}/sesiones-publicas`, { params });

export const postInscribirPruebaGratisInvitado = (slug, data) =>
  axiosPublic.post(`/clases/${slug}/prueba-gratis`, data);

// Reservar clase sin login por RUT: usa la membresía activa si el RUT tiene
// una (pide teléfono/correo como segundo factor), o cae al flujo de prueba
// gratis si no tiene. Un solo endpoint para ambos casos.
export const postInscribirClasePublica = (slug, data) =>
  axiosPublic.post(`/clases/${slug}/inscribir-publico`, data);

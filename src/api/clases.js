import { axiosPrivate } from "./axiosPrivate";
import { axiosPublic } from "./axiosPublic";

// Clases (plantillas)
export const getClases = (todas = false) =>
  axiosPrivate.get("/clases", { params: todas ? { todas: "true" } : {} });

// Catálogo público (landing de la empresa, sin login)
export const getClasesPublicas = (slug) =>
  axiosPublic.get(`/clases/${slug}/publicas`);

// Sesiones (horario + cupo) sin login, para agendar la clase de prueba
export const getSesionesPublicas = (slug, params = {}) =>
  axiosPublic.get(`/clases/${slug}/sesiones-publicas`, { params });

// Agendar la clase de prueba gratis sin crear cuenta
export const postInscribirPruebaGratisInvitado = (slug, payload) =>
  axiosPublic.post(`/clases/${slug}/prueba-gratis`, payload);

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

// Excepciones puntuales (cancelar una fecha o cambiar su cupo)
export const postExcepcionClase = (claseId, data) =>
  axiosPrivate.post(`/clases/${claseId}/excepciones`, data);

export const deleteExcepcionClase = (excepcionId) =>
  axiosPrivate.delete(`/clases/excepciones/${excepcionId}`);

// Inscripciones
export const postInscribirCliente = (claseId, data) =>
  axiosPrivate.post(`/clases/${claseId}/inscribir`, data);

export const patchCancelarInscripcion = (inscripcionId, motivo) =>
  axiosPrivate.patch(`/clases/inscripcion/${inscripcionId}/cancelar`, {
    motivo,
  });

export const patchPagoInscripcion = (inscripcionId, data) =>
  axiosPrivate.patch(`/clases/inscripcion/${inscripcionId}/pago`, data);

// Mis inscripciones (vista del cliente logueado)
export const getMisInscripciones = () =>
  axiosPrivate.get("/clases/mis-inscripciones");

import { axiosPrivate } from "./axiosPrivate";

export const listarSuscripciones = (params) => {
  return axiosPrivate.get("/suscripcion/listar", { params });
}

// Historial de visitas de una suscripción (qué reservas descontaron del plan)
export const getUsoSuscripcion = (id) => axiosPrivate.get(`/suscripcion/${id}/uso`);

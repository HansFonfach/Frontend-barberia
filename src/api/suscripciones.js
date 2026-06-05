import { axiosPrivate } from "./axiosPrivate";

export const listarSuscripciones = (params) => {
  return axiosPrivate.get("/suscripcion/listar", { params });
}
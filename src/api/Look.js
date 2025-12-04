import { axiosPrivate } from "./axiosPrivate";

export const getEstadoLookCliente = () => {
  return axiosPrivate.get("/test/recordatorios-inteligentes");
};
import { axiosPrivate } from "./axiosPrivate";

export const getEstadoLookCliente = async () => {
  const res = await axiosPrivate.get("/test/recordatorios-inteligentes");
  return res.data.data; // devuelve { corte, barba } directo
};
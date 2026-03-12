import { axiosPrivate } from "./axiosPrivate";
import { axiosPublic } from "./axiosPublic";

export const verificarFeriado = async (fecha) => {
  const res = await axiosPublic.get(`/feriados/verificar?fecha=${fecha}`);
  return res.data;
};
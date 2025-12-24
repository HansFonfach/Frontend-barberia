import { axiosPrivate } from "./axiosPrivate";

export const iniciarPagoSuscripcion = async () => {
  const res = await axiosPrivate.post("/pagos/suscripcion/iniciar");
  return res.data;
};

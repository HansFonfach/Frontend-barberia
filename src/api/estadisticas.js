import { axiosPrivate } from "./axiosPrivate";

export const getTotalReservasHoyBarbero = () => {
  return axiosPrivate.get("/estadisticas/reservasHoyBarbero/userId");
};

export const getTotalSuscripcionesActivas = () => {
  return axiosPrivate.get("/estadisticas/suscripcionesActivas");
};
export const getTotalClientes = () => {
  return axiosPrivate.get("/estadisticas/totalClientes");
};
export const getIngresoMensual = () => {
  return axiosPrivate.get("/estadisticas/ingresoMensual");
};

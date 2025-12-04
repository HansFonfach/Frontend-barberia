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
export const getCitasEsteMes = () => {
  return axiosPrivate.get("/estadisticas/citasMes/userId");
};
export const getUltimaReserva = () => {
  return axiosPrivate.get("/estadisticas/ultima-reserva/userId");
};
export const getProximaReserva = () => {
  return axiosPrivate.get("/estadisticas/proxima-reserva/userId");
};
export const getProximoCliente = () =>{
  return axiosPrivate.get("/estadisticas/proximo-cliente")
}
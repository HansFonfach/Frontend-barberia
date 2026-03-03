import { axiosPrivate } from "./axiosPrivate";

export const getTotalReservasHoyBarbero = () => {
  return axiosPrivate.get("/estadisticas/reservasHoyBarbero");
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
  return axiosPrivate.get("/estadisticas/citasMes");
};
export const getUltimaReserva = () => {
  return axiosPrivate.get("/estadisticas/ultima-reserva");
};
export const getProximaReserva = () => {
  return axiosPrivate.get("/estadisticas/proxima-reserva");
};
export const getProximoCliente = () => {
  return axiosPrivate.get("/estadisticas/proximo-cliente");
};

export const getIngresoTotal = () => {
  return axiosPrivate.get("/estadisticas/ingreso-total");
};

export const getReservasCompletadas = () => {
  return axiosPrivate.get("/estadisticas/reservas-completadas");
};

export const getReservasCanceladas = () => {
  return axiosPrivate.get("/estadisticas/reservas-canceladas");
};

export const getReservasNoAsistidas = () => {
  return axiosPrivate.get("/estadisticas/reservas-no-asistidas");
};

export const getHoraMasCancelada = () => {
  return axiosPrivate.get("/estadisticas/hora-mas-cancelada");
};
export const getServicioMasPopular = () => {
  return axiosPrivate.get("/estadisticas/servicio-mas-popular");
};

export const getTasaDeCancelacion = () => {
  return axiosPrivate.get("/estadisticas/tasa-de-cancelacion");
};
export const getTasaDeAsistencia = () => {
  return axiosPrivate.get("/estadisticas/tasa-de-asistencia");
};

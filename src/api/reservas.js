import { axiosPrivate } from "./axiosPrivate";

export const getReservasByUserId = (id) => {
  return axiosPrivate.get(`/reservas/${id}`); // usar GET para obtener datos
};

export const reservarHora = async (fecha, barbero, hora, servicio, usuario) => {
  return axiosPrivate.post("/reservas", {
    fecha,
    barbero,
    hora,
    servicio,
    cliente: usuario,
  });
};

export const getReservasDiariasByBarberId = () => {
  return axiosPrivate.get("/reservas/barbero");
};

export const postCancelarReserva = async (reservaId) => {
  return axiosPrivate.delete(`/reservas/${reservaId}`);
};

export const getReservasActivas = async (userId) => {
  return axiosPrivate.get(`/reservas/activas/${userId}`);
};

export const getResevasPorFecha = (fecha) => {
  return axiosPrivate.get(`/reservas/barbero/por-fecha?fecha=${fecha}`);
};

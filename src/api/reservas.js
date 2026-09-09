import { axiosPrivate } from "./axiosPrivate";
import { axiosPublic } from "./axiosPublic";

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

export const postCancelarReserva = async (reservaId, motivo) => {
  return axiosPrivate.delete(`/reservas/${reservaId}`, {
    data: { motivo },
  });
};

export const postMarcarReservaNoAsistida = async (reservaId) => {
  return axiosPrivate.patch(`/reservas/${reservaId}/no-asistio`);
};

export const getReservasActivas = async (userId) => {
  return axiosPrivate.get(`/reservas/activas/${userId}`);
};

export const getResevasPorFecha = (fecha, hasta, barberoId) => {
  const params = new URLSearchParams({ fecha });
  // "hasta" es opcional: si viene, trae un rango de fechas (ej. la semana
  // completa) en vez de un solo día — lo usa la vista "Semana" del panel.
  if (hasta) params.set("hasta", hasta);
  // "barberoId" es opcional y solo lo respeta el backend si quien pregunta
  // es admin — "todos" trae la agenda de todo el equipo, o un id puntual
  // trae la de ese profesional. Lo usa el selector de "Equipo".
  if (barberoId) params.set("barberoId", barberoId);
  return axiosPrivate.get(`/reservas/barbero/por-fecha?${params.toString()}`);
};

export const getConfirmarAsistencia = (token, respuesta) => {
  return axiosPublic.get(
    `/reservas/confirmacion/${token}?respuesta=${respuesta}`,
  );
};

export const patchReagendarReserva = (reservaId, fecha, hora) => {
  return axiosPrivate.patch(`/reservas/${reservaId}/reagendar`, {
    fecha,
    hora,
  });
};

export const patchActualizarReserva = (
  reservaId,
  observacionFinal,
  productos,
  extras,
) => {
  return axiosPrivate.patch(`/reservas/${reservaId}/actualizar`, {
    observacionFinal,
    productos,
    extras,
  });
};

export const patchMarcarAbono = (reservaId, monto) => {
  return axiosPrivate.patch(`/reservas/${reservaId}/marcarAbono`, { monto });
};

export const patchRevertirAbono = (reservaId) => {
  return axiosPrivate.patch(`/reservas/${reservaId}/revertirAbono`);
};

export const getConfirmarAsistenciaWhatsapp = (token) => {
  return axiosPublic.get(`/reservas/confirmar-reserva?token=${token}`);
};

export const getCancelarAsistenciaWhatsapp = (token) => {
  return axiosPublic.get(`/reservas/cancelar-reserva?token=${token}`);
};

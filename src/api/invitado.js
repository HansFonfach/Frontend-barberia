import { axiosPublic } from "./axiosPublic";

export const postReservarHoraInvitado = (slug, payload) => {
  return axiosPublic.post(`/reserva/invitado/${slug}`, payload);
};

export const postCancelarHoraInvitado = (token) => {
  return axiosPublic.post("/reserva/invitado/cancelar-reserva-invitado", {
    token,
  });
};

export const getInfoReservaInvitado = (token) => {
  return axiosPublic.get(`/reserva/invitado/info-por-token?token=${token}`);
};

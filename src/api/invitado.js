import { axiosPublic } from "./axiosPublic";

export const postReservarHoraInvitado = (slug, payload) => {
  return axiosPublic.post(`/reserva/invitado/${slug}`, payload);
};

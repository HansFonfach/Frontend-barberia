import { axiosPublic } from "./axiosPublic";

export const postReservarHoraInvitado = (data) => {
  return axiosPublic.post("/reserva/invitado", data);
};

import { axiosPublic } from "./axiosPublic";

export const postReservarHoraInvitado = (slug, payload) => {
  return axiosPublic.post(`/reserva/invitado/${slug}`, payload);
};
export const postCancelarHoraInvitado = () =>{
  return axiosPublic.post('/reserva/invitado/cancelar-reserva-invitado')
}

export const getInfoReservaInvitado = () => {
 return axiosPublic.post('/reserva/invitado/info-por-token')
}

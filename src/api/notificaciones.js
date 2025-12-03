import { axiosPrivate } from "./axiosPrivate";

export const postCrearNotificacion = async (
  fecha,
  horas,
  barberoId,
  usuarioId
) => {
  try {
    return axiosPrivate.post("/notificaciones/crearNotificacion", {
      fecha,
      horas,
      barberoId,
      usuarioId,
    });
  } catch (error) {
    throw error;
  }
};

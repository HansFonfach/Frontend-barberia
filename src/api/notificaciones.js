import { axiosPrivate } from "./axiosPrivate";

export const postCrearNotificacion = async (payload) => {
  try {
    return await axiosPrivate.post(
      "/notificaciones/crearNotificacion",
      payload
    );
  } catch (error) {
    throw error;
  }
};

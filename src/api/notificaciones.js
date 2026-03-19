import { axiosPrivate } from "./axiosPrivate";
import { axiosPublic } from "./axiosPublic";

export const postCrearNotificacion = async (payload) => {
  try {
    return await axiosPublic.post(
      "/notificaciones/crearNotificacion",
      payload
    );
  } catch (error) {
    throw error;
  }
};

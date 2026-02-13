import { axiosPrivate } from "./axiosPrivate";
import { axiosPublic } from "./axiosPublic";

export const getServicios = () => {
  return axiosPrivate.get("/servicios");
};

export const postCreateServicios = (data) => {
  return axiosPrivate.post("/servicios", data);
};

export const postUpdateServicios = (id, data) => {
  return axiosPrivate.put(`/servicios/${id}`, data);
};

export const postDeleteServicios = (id) => {
  return axiosPrivate.delete(`/servicios/${id}`);
};

export const getServiciosBarbero = (barberoId) => {
  return axiosPublic.get(`/barberoServicio/barberos/${barberoId}/servicios`);
};

export const getServiciosPublicos = (slug) => {
  return axiosPublic.get(`servicios/${slug}/serviciosPublicos`);
};


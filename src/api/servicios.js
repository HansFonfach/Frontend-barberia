import { axiosPrivate } from "./axiosPrivate";

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

export const getServiciosBarbero = (barberoId) =>{
  return axiosPrivate.get(`/barberoServicio/barberos/${barberoId}/servicios`)
}
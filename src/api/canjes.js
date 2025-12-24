import { axiosPrivate } from "./axiosPrivate";

// Crear canje
export const postCreateCanje = (data) => {
  return axiosPrivate.post("/canjes/crearCanje", data);
};

// Actualizar canje
export const putUpdateCanje = (id, data) => {
  return axiosPrivate.put(`/canjes/actualizarCanje/${id}`, data);
};

// Eliminar canje (soft delete)
export const putDeleteCanje = (id) => {
  return axiosPrivate.put(`/canjes/eliminarCanje/${id}`);
};

// Listar canjes
export const getAllCanje = () => {
  return axiosPrivate.get("/canjes/listarCanjes");
};

export const postCanjearPuntos = (idCanje) => {
  return axiosPrivate.post(`/canjes/canjear/${idCanje}`);
};

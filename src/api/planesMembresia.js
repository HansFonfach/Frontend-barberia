import { axiosPrivate } from "./axiosPrivate";
import { axiosPublic } from "./axiosPublic";

export const getPlanesMembresia = (todos = false) =>
  axiosPrivate.get("/planesMembresia", {
    params: todos ? { todos: "true" } : {},
  });

// Catálogo público de planes (landing de la empresa, sin login)
export const getPlanesPublicos = (slug) =>
  axiosPublic.get(`/planesMembresia/${slug}/publicas`);

export const postCrearPlanMembresia = (data) =>
  axiosPrivate.post("/planesMembresia", data);

export const putActualizarPlanMembresia = (id, data) =>
  axiosPrivate.put(`/planesMembresia/${id}`, data);

export const patchToggleActivoPlan = (id) =>
  axiosPrivate.patch(`/planesMembresia/${id}/toggle-activo`);

export const deletePlanMembresia = (id) =>
  axiosPrivate.delete(`/planesMembresia/${id}`);

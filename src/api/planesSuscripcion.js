import { axiosPrivate } from "./axiosPrivate";

// CRUD de plantillas de plan de suscripción (Gestión de planes de
// suscripción). Solo para negocios con permiteSuscripcion activo.
export const getPlanesSuscripcion = (todos = true) =>
  axiosPrivate.get("/planesSuscripcion", {
    params: todos ? { todos: "true" } : {},
  });

export const postCrearPlanSuscripcion = (data) =>
  axiosPrivate.post("/planesSuscripcion", data);

export const putActualizarPlanSuscripcion = (id, data) =>
  axiosPrivate.put(`/planesSuscripcion/${id}`, data);

export const patchToggleActivoPlanSuscripcion = (id) =>
  axiosPrivate.patch(`/planesSuscripcion/${id}/toggle-activo`);

export const deletePlanSuscripcion = (id) =>
  axiosPrivate.delete(`/planesSuscripcion/${id}`);

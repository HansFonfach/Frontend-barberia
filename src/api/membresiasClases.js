import { axiosPrivate } from "./axiosPrivate";

export const postCrearMembresia = (data) =>
  axiosPrivate.post("/membresiasClases", data);

export const patchCancelarMembresia = (id) =>
  axiosPrivate.patch(`/membresiasClases/${id}/cancelar`);

export const getEstadoMembresiaCliente = (clienteId) =>
  axiosPrivate.get(`/membresiasClases/cliente/${clienteId}/estado`);

export const getListarMembresias = (params = {}) =>
  axiosPrivate.get("/membresiasClases", { params });

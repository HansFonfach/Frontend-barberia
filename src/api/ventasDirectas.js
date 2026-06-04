import { axiosPrivate } from "./axiosPrivate";

export const postCrearVentaDirecta = (data) => {
  return axiosPrivate.post("/ventasProductos/ventas-directas", data);
};

export const getVentasDirectas = (params) => {
  return axiosPrivate.get("/ventasProductos/ventas-directas", { params });
};

export const getVentaDirecta = (id) => {
  return axiosPrivate.get(`/ventasProductos/ventas-directas/${id}`);
};

export const patchAnularVentaDirecta = (id, data) => {
  return axiosPrivate.patch(`/ventasProductos/ventas-directas/${id}/anular`, data);
};

export const getEstadisticasVentasDirectas = (params) => {
  return axiosPrivate.get("/ventasProductos/ventas-directas/estadisticas", { params });
};
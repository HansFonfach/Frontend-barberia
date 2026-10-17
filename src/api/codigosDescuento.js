import { axiosPrivate } from "./axiosPrivate";
import { axiosPublic } from "./axiosPublic";

// ── Panel del negocio (solo admin) ──
export const getCodigosDescuento = () => axiosPrivate.get("/codigos-descuento");

export const postCodigoDescuento = (data) =>
  axiosPrivate.post("/codigos-descuento", data);

export const patchCodigoDescuento = (id, data) =>
  axiosPrivate.patch(`/codigos-descuento/${id}`, data);

export const deleteCodigoDescuento = (id) =>
  axiosPrivate.delete(`/codigos-descuento/${id}`);

// ── Al reservar (cliente, invitado o profesional): calcula el precio con el código ──
export const validarCodigoDescuentoRequest = (slug, payload) =>
  axiosPublic.post(`/codigos-descuento/validar/${slug}`, payload);

import { axiosPrivate } from "./axiosPrivate";
import { axiosPublic } from "./axiosPublic";

const BASE = "/reservas-mesa";

/* ── Panel ── */
export const getConfiguracionReservasMesa = () => axiosPrivate.get(`${BASE}/configuracion`);
export const putConfiguracionReservasMesa = (data) => axiosPrivate.put(`${BASE}/configuracion`, data);

export const getBloqueosReservasMesa = (desde) =>
  axiosPrivate.get(`${BASE}/bloqueos`, { params: desde ? { desde } : {} });
export const postBloqueoReservasMesa = (data) => axiosPrivate.post(`${BASE}/bloqueos`, data);
export const deleteBloqueoReservasMesa = (id) => axiosPrivate.delete(`${BASE}/bloqueos/${id}`);

export const getDisponibilidadMesa = ({ fecha, personas, excluir }) =>
  axiosPrivate.get(`${BASE}/disponibilidad`, {
    params: { fecha, personas, ...(excluir ? { excluir } : {}) },
  });

export const getReservasMesaDia = (fecha) => axiosPrivate.get(`${BASE}/dia/${fecha}`);
export const getCalendarioReservasMesa = (desde, hasta) =>
  axiosPrivate.get(`${BASE}/calendario`, { params: { desde, hasta } });
export const getReservasMesa = (filtros) => axiosPrivate.get(BASE, { params: filtros });
export const getReservaMesa = (id) => axiosPrivate.get(`${BASE}/${id}`);
export const postReservaMesa = (data) => axiosPrivate.post(BASE, data);
export const patchReservaMesa = (id, data) => axiosPrivate.patch(`${BASE}/${id}`, data);
export const patchEstadoReservaMesa = (id, data) => axiosPrivate.patch(`${BASE}/${id}/estado`, data);

/* ── Página pública ── */
export const getInfoReservaMesaPublica = (slug) => axiosPublic.get(`${BASE}/publico/${slug}/info`);
export const getDisponibilidadMesaPublica = (slug, { fecha, personas }) =>
  axiosPublic.get(`${BASE}/publico/${slug}/disponibilidad`, { params: { fecha, personas } });
export const postReservaMesaPublica = (slug, data) => axiosPublic.post(`${BASE}/publico/${slug}`, data);
export const getCancelacionReservaMesa = (token) =>
  axiosPublic.get(`${BASE}/publico/cancelacion/${encodeURIComponent(token)}`);
export const postCancelarReservaMesa = (token) => axiosPublic.post(`${BASE}/publico/cancelar`, { token });

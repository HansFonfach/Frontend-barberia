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
export const getAfectadasBloqueoMesa = (id) => axiosPrivate.get(`${BASE}/bloqueos/${id}/afectadas`);
export const postCancelarAfectadasBloqueoMesa = (id, data) =>
  axiosPrivate.post(`${BASE}/bloqueos/${id}/cancelar-afectadas`, data);

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

/* ── Clientes y promociones (admin) ── */
export const getClientesMesa = (params) => axiosPrivate.get(`${BASE}/clientes`, { params });
export const exportarClientesMesa = (params) =>
  axiosPrivate.get(`${BASE}/clientes/exportar`, { params, responseType: "blob" });
export const patchPromocionesClienteMesa = (telefono, acepta) =>
  axiosPrivate.patch(`${BASE}/clientes/${encodeURIComponent(telefono)}/promociones`, { acepta });
export const getCampanasMesa = () => axiosPrivate.get(`${BASE}/campanas`);
export const postCampanaMesa = (data) => axiosPrivate.post(`${BASE}/campanas`, data);
export const postPruebaCampanaMesa = (data) => axiosPrivate.post(`${BASE}/campanas/prueba`, data);

/* ── Baja de promociones (público) ── */
export const getBajaPromociones = (token) =>
  axiosPublic.get(`${BASE}/publico/baja/${encodeURIComponent(token)}`);
export const postBajaPromociones = (token) => axiosPublic.post(`${BASE}/publico/baja`, { token });

/* ── Confirmar asistencia desde WhatsApp (público) ── */
export const getAsistenciaMesa = (token) => axiosPublic.get(`${BASE}/publico/asistencia/${encodeURIComponent(token)}`);
export const postAsistenciaMesa = (token, accion) => axiosPublic.post(`${BASE}/publico/asistencia`, { token, accion });

/* ── Lista de espera ── */
export const postListaEsperaMesa = (slug, data) => axiosPublic.post(`${BASE}/publico/${slug}/lista-espera`, data);
export const getListaEsperaMesa = (fecha) => axiosPrivate.get(`${BASE}/lista-espera`, { params: { fecha } });
export const deleteListaEsperaMesa = (id) => axiosPrivate.delete(`${BASE}/lista-espera/${id}`);

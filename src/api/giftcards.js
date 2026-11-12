import { axiosPrivate } from "./axiosPrivate";
import { axiosPublic } from "./axiosPublic";

// ── Público: página "Regalar" y la giftcard en línea ──
export const getGiftcardsPublico = (slug) => axiosPublic.get(`/giftcards/publico/${slug}`);

// formData con los datos + el archivo "comprobante"
export const postSolicitudGiftcard = (slug, formData) =>
  axiosPublic.post(`/giftcards/publico/${slug}/solicitud`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getGiftcardPublica = (slug, codigo) =>
  axiosPublic.get(`/giftcards/publico/${slug}/tarjeta/${encodeURIComponent(codigo)}`);

// ── Panel del negocio (solo admin) ──
export const getGiftcards = (estado = "todas") => axiosPrivate.get("/giftcards", { params: { estado } });
export const getGiftcard = (id) => axiosPrivate.get(`/giftcards/${id}`);
export const postGiftcard = (data) => axiosPrivate.post("/giftcards", data);
export const aprobarGiftcard = (id) => axiosPrivate.patch(`/giftcards/${id}/aprobar`);
export const rechazarGiftcard = (id, motivo) => axiosPrivate.patch(`/giftcards/${id}/rechazar`, { motivo });
export const anularGiftcard = (id) => axiosPrivate.patch(`/giftcards/${id}/anular`);
export const reenviarGiftcard = (id) => axiosPrivate.post(`/giftcards/${id}/reenviar`);
export const getConfigGiftcards = () => axiosPrivate.get("/giftcards/configuracion");
export const putConfigGiftcards = (data) => axiosPrivate.put("/giftcards/configuracion", data);

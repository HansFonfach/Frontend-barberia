import { axiosPrivate } from "./axiosPrivate";

// El cliente envía FormData (planId, metodo y opcionalmente el archivo
// "comprobante" si el método es transferencia).
export const postCrearSolicitudMembresia = (formData) =>
  axiosPrivate.post("/solicitudesMembresia", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getMisSolicitudesMembresia = () =>
  axiosPrivate.get("/solicitudesMembresia/mias");

export const getSolicitudesMembresiaPendientes = () =>
  axiosPrivate.get("/solicitudesMembresia/pendientes");

export const patchAprobarSolicitudMembresia = (id) =>
  axiosPrivate.patch(`/solicitudesMembresia/${id}/aprobar`);

export const patchRechazarSolicitudMembresia = (id, motivo = "") =>
  axiosPrivate.patch(`/solicitudesMembresia/${id}/rechazar`, { motivo });

import { axiosPrivate } from "./axiosPrivate";
import { axiosPublic } from "./axiosPublic";

// El cliente envía FormData (planId, metodo y opcionalmente el archivo
// "comprobante" si el método es transferencia).
export const postCrearSolicitudMembresia = (formData) =>
  axiosPrivate.post("/solicitudesMembresia", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Checkout público (sin login): mismo FormData de arriba + datos de contacto
// (nombre, apellido, rut, email, telefono).
export const postCrearSolicitudMembresiaPublica = (slug, formData) =>
  axiosPublic.post(`/solicitudesMembresia/publica/${slug}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getMisSolicitudesMembresia = () =>
  axiosPrivate.get("/solicitudesMembresia/mias");

// Panel de pagos del admin: estado = "pendiente" | "aprobada" | "rechazada" | "todas"
export const getSolicitudesMembresia = (estado = "todas") =>
  axiosPrivate.get("/solicitudesMembresia", { params: { estado } });

// Alias retrocompatible (se sigue usando en GestionMembresias.jsx)
export const getSolicitudesMembresiaPendientes = () =>
  axiosPrivate.get("/solicitudesMembresia/pendientes");

export const patchAprobarSolicitudMembresia = (id) =>
  axiosPrivate.patch(`/solicitudesMembresia/${id}/aprobar`);

export const patchRechazarSolicitudMembresia = (id, motivo = "") =>
  axiosPrivate.patch(`/solicitudesMembresia/${id}/rechazar`, { motivo });

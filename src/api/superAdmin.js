import { axiosSuperAdmin } from "./axiosSuperAdmin";

export const loginSuperAdminRequest = (email, password) =>
  axiosSuperAdmin.post("/superadmin/login", { email, password });

export const logoutSuperAdminRequest = () => axiosSuperAdmin.post("/superadmin/logout");

export const getEmpresasRequest = () => axiosSuperAdmin.get("/superadmin/empresas");

export const patchEstadoEmpresaRequest = (id, estado) =>
  axiosSuperAdmin.patch(`/superadmin/empresas/${id}/estado`, { estado });

export const patchSuscripcionEmpresaRequest = (id, estadoSuscripcion, motivoSuspension) =>
  axiosSuperAdmin.patch(`/superadmin/empresas/${id}/suscripcion`, {
    estadoSuscripcion,
    motivoSuspension,
  });

export const patchCobroEmpresaRequest = (id, { cuotaMensual, fechaPago }) =>
  axiosSuperAdmin.patch(`/superadmin/empresas/${id}/cobro`, { cuotaMensual, fechaPago });

export const postPagoEmpresaRequest = (id, { monto, notas }) =>
  axiosSuperAdmin.post(`/superadmin/empresas/${id}/pago`, { monto, notas });

export const getGananciasRequest = () => axiosSuperAdmin.get("/superadmin/ganancias");

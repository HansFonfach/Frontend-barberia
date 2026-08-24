import { axiosPrivate } from "./axiosPrivate";

// Estadísticas del dashboard para empresas de tipo gimnasio (rubro
// "gimnasio", modulos.clasesGrupales activo). Espejo de EstadisticasContext
// pero orientado a membresías/clases en vez de reservas con crédito.

export const getIngresosGimnasio = () =>
  axiosPrivate.get("/estadisticasGimnasio/ingresos");

export const getMembresiasGimnasio = () =>
  axiosPrivate.get("/estadisticasGimnasio/membresias");

export const getClasesHoyGimnasio = () =>
  axiosPrivate.get("/estadisticasGimnasio/clases-hoy");

export const getClientesGimnasio = () =>
  axiosPrivate.get("/estadisticasGimnasio/clientes");

export const getPorCobrarGimnasio = () =>
  axiosPrivate.get("/estadisticasGimnasio/por-cobrar");

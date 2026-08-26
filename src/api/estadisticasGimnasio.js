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

// Panel de estadísticas completo (selector de período + comparación).
// `opciones` = { periodo: "este_mes" | "mes_anterior" | "ultimos_3_meses" |
//   "ultimos_6_meses" | "este_anio" | "anio_anterior" | "personalizado",
//   desde, hasta } — desde/hasta solo aplican con periodo:"personalizado".
export const getResumenPeriodoGimnasio = (opciones = {}) =>
  axiosPrivate.get("/estadisticasGimnasio/resumen", { params: opciones });

export const getClientesAnalisisGimnasio = (opciones = {}) =>
  axiosPrivate.get("/estadisticasGimnasio/clientes-analisis", { params: opciones });

export const getDemandaGimnasio = (opciones = {}) =>
  axiosPrivate.get("/estadisticasGimnasio/demanda", { params: opciones });

export const getEvolucionGimnasio = (meses = 6) =>
  axiosPrivate.get("/estadisticasGimnasio/evolucion", { params: { meses } });

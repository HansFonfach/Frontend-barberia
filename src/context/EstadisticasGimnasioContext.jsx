import { createContext, useContext } from "react";
import {
  getIngresosGimnasio,
  getMembresiasGimnasio,
  getClasesHoyGimnasio,
  getClientesGimnasio,
  getPorCobrarGimnasio,
  getResumenPeriodoGimnasio,
  getClientesAnalisisGimnasio,
  getDemandaGimnasio,
  getEvolucionGimnasio,
} from "api/estadisticasGimnasio";

// Equivalente a EstadisticasContext pero para empresas de tipo gimnasio
// (membresías + clases grupales, sin reservas con crédito). Se mantiene
// como contexto aparte para no mezclar los dos modelos de negocio dentro
// de un mismo archivo cada vez más largo.
const EstadisticasGimnasioContext = createContext();

export const useEstadisticasGimnasio = () => {
  const context = useContext(EstadisticasGimnasioContext);
  if (!context)
    throw new Error(
      "useEstadisticasGimnasio must be used within a EstadisticasGimnasioProvider",
    );
  return context;
};

export const EstadisticasGimnasioProvider = ({ children }) => {
  const ingresosGimnasio = async () => {
    try {
      const res = await getIngresosGimnasio();
      return res.data.data; // { total, totalMesAnterior, variacionPorcentaje, detalle }
    } catch (error) {
      console.error("Error en ingresosGimnasio:", error);
      return {
        total: 0,
        totalMesAnterior: 0,
        variacionPorcentaje: null,
        detalle: {
          membresias: 0,
          membresiasCantidad: 0,
          pasesDiarios: 0,
          pasesDiariosCantidad: 0,
          productos: 0,
        },
      };
    }
  };

  const membresiasGimnasio = async () => {
    try {
      const res = await getMembresiasGimnasio();
      return res.data.data; // { activas, nuevasDelMes, porVencer, solicitudesPendientes }
    } catch (error) {
      console.error("Error en membresiasGimnasio:", error);
      return { activas: 0, nuevasDelMes: 0, porVencer: 0, solicitudesPendientes: 0 };
    }
  };

  const clasesHoyGimnasio = async () => {
    try {
      const res = await getClasesHoyGimnasio();
      return res.data.data; // { sesiones: [...], proxima }
    } catch (error) {
      console.error("Error en clasesHoyGimnasio:", error);
      return { sesiones: [], proxima: null };
    }
  };

  const clientesGimnasio = async () => {
    try {
      const res = await getClientesGimnasio();
      return res.data.data; // { total, nuevosDelMes }
    } catch (error) {
      console.error("Error en clientesGimnasio:", error);
      return { total: 0, nuevosDelMes: 0 };
    }
  };

  const porCobrarGimnasio = async () => {
    try {
      const res = await getPorCobrarGimnasio();
      return res.data.data; // { total, cantidad, solicitudesPendientes }
    } catch (error) {
      console.error("Error en porCobrarGimnasio:", error);
      return { total: 0, cantidad: 0, solicitudesPendientes: 0 };
    }
  };

  // ── Panel de estadísticas completo (selector de período) ──────────────
  const RESUMEN_VACIO = {
    periodo: null,
    clases: { realizadas: 0, programadas: 0, canceladas: 0, variacionCanceladas: null },
    asistencias: { total: 0, variacionPorcentaje: null, promedioPorClase: 0, tasaOcupacion: 0, promedioPorDia: [] },
    ingresos: { total: 0, totalAnterior: 0, variacionPorcentaje: null, detalle: {} },
    membresias: { activas: 0, variacionActivas: null, nuevas: 0, variacionNuevas: null, porVencer: 0 },
    clientes: { nuevos: 0, variacionNuevos: null, activos: 0, variacionActivos: null },
  };

  const resumenPeriodoGimnasio = async (opciones) => {
    try {
      const res = await getResumenPeriodoGimnasio(opciones);
      return res.data.data;
    } catch (error) {
      console.error("Error en resumenPeriodoGimnasio:", error);
      return RESUMEN_VACIO;
    }
  };

  const clientesAnalisisGimnasio = async (opciones) => {
    try {
      const res = await getClientesAnalisisGimnasio(opciones);
      return res.data.data;
    } catch (error) {
      console.error("Error en clientesAnalisisGimnasio:", error);
      return {
        topAsistentes: [],
        clientesEnCaida: [],
        clientesNuevos: [],
        clientesPorVencer: [],
        clientesEnRiesgo: [],
        retencion: null,
      };
    }
  };

  const demandaGimnasio = async (opciones) => {
    try {
      const res = await getDemandaGimnasio(opciones);
      return res.data.data;
    } catch (error) {
      console.error("Error en demandaGimnasio:", error);
      return { diasSemana: [], horariosTop: [], horariosBajos: [], clasesTop: [], clasesBajas: [] };
    }
  };

  const evolucionGimnasio = async (meses) => {
    try {
      const res = await getEvolucionGimnasio(meses);
      return res.data.data;
    } catch (error) {
      console.error("Error en evolucionGimnasio:", error);
      return { meses: meses || 6, evolucion: [] };
    }
  };

  return (
    <EstadisticasGimnasioContext.Provider
      value={{
        ingresosGimnasio,
        membresiasGimnasio,
        clasesHoyGimnasio,
        clientesGimnasio,
        porCobrarGimnasio,
        resumenPeriodoGimnasio,
        clientesAnalisisGimnasio,
        demandaGimnasio,
        evolucionGimnasio,
      }}
    >
      {children}
    </EstadisticasGimnasioContext.Provider>
  );
};

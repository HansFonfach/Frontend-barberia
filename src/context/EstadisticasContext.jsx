import { getTotalClientes } from "api/estadisticas";
import { getTotalReservasHoyBarbero } from "api/estadisticas";
import { getUltimaReserva } from "api/estadisticas";
import { getProximoCliente } from "api/estadisticas";
import { getReservasCompletadas } from "api/estadisticas";
import { getReservasNoAsistidas } from "api/estadisticas";
import { getServicioMasPopular } from "api/estadisticas";
import { getTasaDeAsistencia } from "api/estadisticas";
import { getTop5ClientesCanceladores } from "api/estadisticas";
import { getTop5ClientesNoAsistidores } from "api/estadisticas";
import { getTop5ClientesAsistentes } from "api/estadisticas";
import { getTasaDeCancelacion } from "api/estadisticas";
import { getHoraMasCancelada } from "api/estadisticas";
import { getReservasCanceladas } from "api/estadisticas";
import { getIngresoTotal } from "api/estadisticas";
import { getProximaReserva } from "api/estadisticas";
import { getCitasEsteMes } from "api/estadisticas";
import { getTotalSuscripcionesActivas } from "api/estadisticas";
import { getIngresoMensual } from "api/estadisticas";
import { createContext, useContext } from "react";

const EstadisticasContext = createContext();

export const useEstadisticas = () => {
  const context = useContext(EstadisticasContext);
  if (!context)
    throw new Error(
      "useEstadisticas must be used within a EstadisticasProvider",
    );
  return context;
};

export const EstadisticasProvider = ({ children }) => {
  const totalReservasHoyBarbero = async () => {
    try {
      const res = await getTotalReservasHoyBarbero();
      // El backend ya devuelve { total }, así que devolvemos el objeto completo
      return res.data.data; // ← ahora devuelve { total }
    } catch (error) {
      console.error("Error en totalReservasHoyBarbero:", error);
      return { total: 0 }; // ← valor por defecto
    }
  };

  const totalCitasEsteMes = async () => {
    try {
      const res = await getCitasEsteMes();
      return res.data.data.total;
    } catch (error) {
      throw error;
    }
  };
  const ultimaReserva = async () => {
    try {
      const res = await getUltimaReserva();
      return res.data.data; // ← ahora devuelve { fecha, hora }
    } catch (error) {
      return null;
    }
  };

  const proximaReserva = async () => {
    try {
      const res = await getProximaReserva();
      return res.data.data; // ← ahora devuelve { fecha, hora }
    } catch (error) {
      return null;
    }
  };
  const proximoCliente = async () => {
    try {
      const res = await getProximoCliente();

      if (!res.data.ok) {
        // Si no hay reserva, devuelves null
        return null;
      }

      // Si hay reserva, devuelves los datos directamente
      return res.data.data;
    } catch (error) {
      console.error("Error en proximoCliente:", error);
      return null;
    }
  };
  const totalSuscripcionesActivas = async () => {
    try {
      const res = await getTotalSuscripcionesActivas();
      // El backend ya devuelve { total }
      return res.data.data; // ← ahora devuelve { total }
    } catch (error) {
      console.error("Error en totalSuscripcionesActivas:", error);
      return { total: 0 }; // ← valor por defecto
    }
  };
  const totalClientes = async () => {
    try {
      const res = await getTotalClientes();
      return res.data.data.total;
    } catch (error) {
      throw error;
    }
  };
  const ingresoMensual = async () => {
    try {
      const res = await getIngresoMensual();
      return res.data.data; // { ingresoTotal, detalle }
    } catch (error) {
      throw error;
    }
  };

  const ingresoTotal = async () => {
    try {
      const res = await getIngresoTotal();
      return res.data.data.total;
    } catch (error) {
      throw error;
    }
  };

  const reservasCompletadas = async () => {
    try {
      const res = await getReservasCompletadas();
      return res.data.data.total;
    } catch (error) {
      throw error;
    }
  };

  const reservasCanceladas = async () => {
    try {
      const res = await getReservasCanceladas();
      return res.data.data.total;
    } catch (error) {
      throw error;
    }
  };

  const reservasNoAsistidas = async () => {
    try {
      const res = await getReservasNoAsistidas();
      return res.data.data.total;
    } catch (error) {
      throw error;
    }
  };

  const horaMasCancelada = async () => {
    try {
      const res = await getHoraMasCancelada();
      return res.data.data.total;
    } catch (error) {
      throw error;
    }
  };

  const servicioMasPopular = async () => {
    try {
      const res = await getServicioMasPopular();
      return res.data.data.total;
    } catch (error) {
      throw error;
    }
  };
  const tasaDeCancelacion = async () => {
    try {
      const res = await getTasaDeCancelacion();
      return res.data.data.total;
    } catch (error) {
      throw error;
    }
  };
  const tasaDeAsistencia = async () => {
    try {
      const res = await getTasaDeAsistencia();
      return res.data.data.total;
    } catch (error) {
      throw error;
    }
  };

  const top5ClientesAsistentes = async () => {
    try {
      const res = await getTop5ClientesAsistentes();
      return res.data.data; // ✅ retorna el array directamente
    } catch (error) {
      throw error;
    }
  };
  const top5ClientesCanceladores = async () => {
    try {
      const res = await getTop5ClientesCanceladores();
      return res.data.data; // ✅ retorna el array directamente
    } catch (error) {
      throw error;
    }
  };
  const top5ClientesNoAsistidores = async () => {
    try {
      const res = await getTop5ClientesNoAsistidores();
      return res.data.data; // ✅ retorna el array directamente
    } catch (error) {
      throw error;
    }
  };

  return (
    <EstadisticasContext.Provider
      value={{
        ingresoMensual,
        totalSuscripcionesActivas,
        totalClientes,
        totalReservasHoyBarbero,
        totalCitasEsteMes,
        ultimaReserva,
        proximaReserva,
        proximoCliente,
        ingresoTotal,
        reservasCompletadas,
        reservasCanceladas,
        reservasNoAsistidas,
        horaMasCancelada,
        servicioMasPopular,
        tasaDeCancelacion,
        tasaDeAsistencia,
        top5ClientesAsistentes, // ← nombre correcto
        top5ClientesCanceladores,
        top5ClientesNoAsistidores,
      }}
    >
      {children}
    </EstadisticasContext.Provider>
  );
};

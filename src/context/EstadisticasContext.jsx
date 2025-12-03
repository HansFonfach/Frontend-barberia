import { getTotalClientes } from "api/estadisticas";
import { getTotalReservasHoyBarbero } from "api/estadisticas";
import { getUltimaReserva } from "api/estadisticas";
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
      "useEstadisticas must be used within a EstadisticasProvider"
    );
  return context;
};

export const EstadisticasProvider = ({ children }) => {
  const totalReservasHoyBarbero = async () => {
    try {
      const res = await getTotalReservasHoyBarbero();
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const totalCitasEsteMes = async () => {
    try {
      const res = await getCitasEsteMes();
      return res.data;
    } catch (error) {
      throw error;
    }
  };
  const ultimaReserva = async () => {
    try {
      const res = await getUltimaReserva(); // Axios call
      return res.data.fecha; // fecha bonita si existe
    } catch (error) {
      // Capturamos el mensaje que manda el backend
      if (error.response && error.response.data?.message) {
        return error.response.data.message; // "No se encontraron reservas pasadas"
      }
      return "Error al obtener última reserva";
    }
  };

  const proximaReserva = async () => {
    try {
      const res = await getProximaReserva();
      // Validar si el backend dice ok false
      if (!res.data.ok) {
        throw new Error(res.data.message || "No se encontró próxima reserva");
      }
      return res.data.fecha; // o res.data.fecha si prefieres
    } catch (error) {
      // Si Axios lanza error por status >=400
      if (error.response && error.response.data?.message) {
        return error.response.data.message;
      }
      console.error("Error obteniendo próxima reserva:", error.message);
      return "Error al obtener próxima reserva";
    }
  };

  const totalSuscripcionesActivas = async () => {
    try {
      const res = await getTotalSuscripcionesActivas();
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const totalClientes = async () => {
    try {
      const res = await getTotalClientes();
      return res.data;
    } catch (error) {
      throw error;
    }
  };
  const ingresoMensual = async () => {
    try {
      const res = await getIngresoMensual();
      return res.data;
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
      }}
    >
      {children}
    </EstadisticasContext.Provider>
  );
};

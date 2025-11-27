import { getTotalClientes } from "api/estadisticas";
import { getTotalReservasHoyBarbero } from "api/estadisticas";
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
      value={{ ingresoMensual, totalSuscripcionesActivas, totalClientes, totalReservasHoyBarbero }}
    >
      {children}
    </EstadisticasContext.Provider>
  );
};

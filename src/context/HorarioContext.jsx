// context/HorarioContext.jsx

import { getObtenerExcepcionesPorDia } from "api/horarios";
import { postRevertirHoraPorDia } from "api/horarios";
import { postAsignarHorario } from "api/horarios";
import { getHorariosByBarbero } from "api/horarios";
import { postCancelarHoraExtraDiaria } from "api/horarios";
import { postAgregarHoraExtraDiaria } from "api/horarios";
import { getHorasDisponibles, postCancelarHoraDiaria } from "api/horarios.js";
import { createContext, useContext } from "react";

const HorarioContext = createContext();

export const useHorario = () => {
  const context = useContext(HorarioContext);
  if (!context)
    throw new Error("useHorario must be used within a HorarioProvider");
  return context;
};

export const HorarioProvider = ({ children }) => {
  const getHorasDisponiblesBarbero = async (barberoId, fecha) => {
    try {
      const result = await getHorasDisponibles(barberoId, fecha);
      console.log("📊 Resultado desde API:", result);

      // ✅ Ahora result contiene todas las propiedades del backend
      return result; // ← Esto ya es el objeto completo
    } catch (err) {
      console.error("❌ Error al obtener horas disponibles:", err);
      throw err;
    }
  };

  const crearHorarioBarbero = async (barbero, dia, bloques) => {
    try {
      const result = await postAsignarHorario(barbero, dia, bloques);
      return result;
    } catch (err) {
      console.error("❌ Error al asignar horarios", err);
      throw err;
    }
  };

  const obtenerHorarioBarbero = async (barbero) => {
    try {
      const result = await getHorariosByBarbero(barbero);
      return result;
    } catch (err) {
      console.error("❌ Error al asignar horarios", err);
      throw err;
    }
  };

  const cancelarHoraPorDia = async (hora, fecha, barbero) => {
    try {
      const res = await postCancelarHoraDiaria(barbero, fecha, hora);
      return res;
    } catch (error) {
      throw error;
    }
  };
  const revertirHoraPorDia = async (hora, fecha, barbero) => {
    try {
      const res = await postRevertirHoraPorDia(barbero, fecha, hora);
      return res;
    } catch (error) {
      throw error;
    }
  };

  const agregarHoraExtraDiaria = async (barbero, fecha, hora) => {
    try {
      const res = await postAgregarHoraExtraDiaria(barbero, fecha, hora);
      return res;
    } catch (error) {
      throw error;
    }
  };
  const cancelarHoraExtraDiaria = async (barbero, fecha, hora) => {
    try {
      const res = await postCancelarHoraExtraDiaria(barbero, fecha, hora);
      return res;
    } catch (error) {
      throw error;
    }
  };
  try {
  } catch (error) {}

  const obtenerExcepcionesPorDia = async (barberoId, fecha) => {
    try {
      const res = await getObtenerExcepcionesPorDia(barberoId, fecha);
      return res;
    } catch (error) {
      throw error;
    }
  };

  return (
    <HorarioContext.Provider
      value={{
        getHorasDisponiblesBarbero,
        cancelarHoraPorDia,
        agregarHoraExtraDiaria,
        obtenerExcepcionesPorDia,
        revertirHoraPorDia,
        cancelarHoraExtraDiaria,
        crearHorarioBarbero,
        obtenerHorarioBarbero,
      }}
    >
      {children}
    </HorarioContext.Provider>
  );
};

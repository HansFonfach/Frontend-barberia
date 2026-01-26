// context/HorarioContext.jsx

import { getObtenerExcepcionesPorDia } from "api/horarios";

import { postAsignarHorario } from "api/horarios";
import { postToggleHora } from "api/horarios";
import { getHorarioBasePorDia } from "api/horarios";
import { deleteHorarioDia } from "api/horarios";
import { getHorariosByBarbero } from "api/horarios";
import { postCancelarHoraExtraDiaria } from "api/horarios";
import { postAgregarHoraExtraDiaria } from "api/horarios";
import { getHorasDisponibles } from "api/horarios.js";
import { createContext, useContext } from "react";

const HorarioContext = createContext();

export const useHorario = () => {
  const context = useContext(HorarioContext);
  if (!context)
    throw new Error("useHorario must be used within a HorarioProvider");
  return context;
};

export const HorarioProvider = ({ children }) => {
  const getHorasDisponiblesBarbero = async (barberoId, fecha, servicioId) => {
    try {
      const result = await getHorasDisponibles(barberoId, fecha, servicioId);
      console.log(result);

      return result; // objeto completo del backend
    } catch (err) {
      console.error("❌ Error al obtener horas disponibles:", err);
      throw err;
    }
  };

  const crearHorarioBarbero = async (horario) => {
    try {
      const result = await postAsignarHorario(horario);
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
      console.error("❌ Error al obtener horarios", err);
      throw err;
    }
  };

  const eliminarHorarioDia = async (barberoId, diaSemana) => {
    try {
      const result = await deleteHorarioDia(barberoId, diaSemana);
      return result;
    } catch (error) {
      console.error("❌ Error al obtener horarios", error);
      throw error;
    }
  };

  const obtenerHorarioBasePorDia = async (barbero, fecha) => {
    console.log("🌐 Request horarios base:", { barbero, fecha });

    try {
      const result = await getHorarioBasePorDia(barbero, fecha);
      console.log("✅ Resultado completo:", result);

      // Asegurar que devolvemos un array
      if (result && result.bloques) {
        return result.bloques; // Esto debería ser un array
      } else if (Array.isArray(result)) {
        return result; // Si ya es array
      } else {
        return []; // Array vacío por defecto
      }
    } catch (error) {
      console.error("❌ Error al obtener horarios:", error);
      return []; // Devolver array vacío en caso de error
    }
  };

  const toggleHoraPorDia = async (hora, fecha, barbero, esFeriado = false) => {
    try {
      const motivo = esFeriado
        ? "Habilitada en feriado"
        : "Modificación manual";
      const res = await postToggleHora(barbero, fecha, hora, motivo, esFeriado);
      return res;
    } catch (error) {
      throw error;
    }
  };

  const cancelarHoraPorDia = async (
    hora,
    fecha,
    barbero,
    esFeriado = false,
  ) => {
    try {
      const motivo = esFeriado ? "Bloqueada en feriado" : "Cancelación manual";
      const res = await postToggleHora(barbero, fecha, hora, motivo, esFeriado);
      return res;
    } catch (error) {
      throw error;
    }
  };

  const revertirHoraPorDia = async (
    hora,
    fecha,
    barbero,
    esFeriado = false,
  ) => {
    try {
      const motivo = esFeriado ? "Habilitada en feriado" : "Reactivación";
      const res = await postToggleHora(barbero, fecha, hora, motivo, esFeriado);
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
        eliminarHorarioDia,
        toggleHoraPorDia,
        obtenerHorarioBasePorDia,
      }}
    >
      {children}
    </HorarioContext.Provider>
  );
};

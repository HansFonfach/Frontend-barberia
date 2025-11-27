import { axiosPrivate } from "./axiosPrivate";

export const getHorasDisponibles = async (barberoId, fecha) => {
  try {
    const res = await axiosPrivate.get(
      `/horarios/${barberoId}/horarios-disponibles?fecha=${fecha}`
    );

    // ✅ CORRECCIÓN: Devolver TODA la respuesta del backend
    console.log("📊 Respuesta completa del backend en API:", res.data);
    return res.data; // ← Esto devuelve todo el objeto
  } catch (error) {
    throw error;
  }
};

export const postCancelarHoraDiaria = async (
  barberoId,
  fecha,
  horaInicio,
  motivo
) => {
  try {
    const res = await axiosPrivate.post(`/excepcionHorario/cancelar`, {
      barbero: barberoId,
      fecha,
      horaInicio,
      motivo,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const postRevertirHoraPorDia = async (
  barberoId,
  fecha,
  horaInicio,
  motivo
) => {
  try {
    const res = await axiosPrivate.post(`/excepcionHorario/revertir`, {
      barbero: barberoId,
      fecha,
      horaInicio,
      motivo,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const postAgregarHoraExtraDiaria = async (
  barberoId,
  fecha,
  horaInicio
) => {
  try {
    const res = await axiosPrivate.post(
      `/excepcionHorario/agregar-hora-extra`,
      {
        barbero: barberoId,
        fecha,
        horaInicio,
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};
export const postCancelarHoraExtraDiaria = async (
  barberoId,
  fecha,
  horaInicio
) => {
  try {
    const res = await axiosPrivate.post(
      `/excepcionHorario/cancelar-hora-extra`,
      {
        barbero: barberoId,
        fecha,
        horaInicio,
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const getObtenerExcepcionesPorDia = async (barberoId, fecha) => {
  try {
    const res = await axiosPrivate.get(
      `/excepcionHorario/${barberoId}?fecha=${fecha}`
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const postAsignarHorario = async (barbero, dia, bloques) => {
  try {
    const res = await axiosPrivate.post("/horarios", {
      barbero,
      dia,
      bloques,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const getHorariosByBarbero = async (barberoId) => {
  try {
    const res = await axiosPrivate.get(`/horarios/barbero/${barberoId}`);
    return res.data;
  } catch (error) {
    throw error;
  }
};

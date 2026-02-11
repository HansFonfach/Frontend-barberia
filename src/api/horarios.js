import { axiosPrivate } from "./axiosPrivate";
import { axiosPublic } from "./axiosPublic";

export const getHorasDisponibles = async (barberoId, fecha, servicioId) => {
  try {
    const res = await axiosPublic.get(
      `/horarios/barbero/${barberoId}/horas-disponibles`,
      {
        params: {
          fecha,
          servicioId,
        },
      }
    );

    return res.data;
  } catch (error) {
    throw error;
  }
};

export const getHorarioBasePorDia = async (barberoId, fecha) => {
  try {
    const res = await axiosPrivate.get(
      `/horarios/barbero/${barberoId}/horarioBase?fecha=${fecha}`
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};

// NUEVA FUNCIÓN UNIFICADA - REEMPLAZA A cancelarHora y revertirHora
export const postToggleHora = async (
  barbero,
  fecha,
  horaInicio,
  motivo = ""
) => {
  try {
    const res = await axiosPrivate.post("/excepcionHorario/toggle", {
      barbero,
      fecha,
      horaInicio,
      motivo,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

// ESTAS YA NO SE USAN - LAS DEJAMOS POR COMPATIBILIDAD PERO DEBERÍAS ELIMINARLAS
export const postCancelarHoraDiaria = async (
  barberoId,
  fecha,
  horaInicio,
  motivo
) => {
  try {
    // Llama a toggle en su lugar
    const res = await axiosPrivate.post("/excepcionHorario/toggle", {
      barbero: barberoId,
      fecha,
      horaInicio,
      motivo: motivo || "Cancelación manual",
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
    // Llama a toggle en su lugar
    const res = await axiosPrivate.post("/excepcionHorario/toggle", {
      barbero: barberoId,
      fecha,
      horaInicio,
      motivo: motivo || "Reactivación",
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};
// FIN DE FUNCIONES OBSOLETAS

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
      `/excepcionHorario/eliminar-hora-extra`, // ← CAMBIA EL ENDPOINT
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

export const postAsignarHorario = async (horario) => {
  const res = await axiosPrivate.post("/horarios", {
    barbero: horario.barbero,
    diaSemana: horario.diaSemana,
    horaInicio: horario.horaInicio,
    horaFin: horario.horaFin,
    colacionInicio: horario.colacionInicio,
    colacionFin: horario.colacionFin,
    duracionBloque: horario.duracionBloque,
  });

  return res.data;
};

export const getHorariosByBarbero = async (barberoId) => {
  try {
    const res = await axiosPrivate.get(`/horarios/barbero/${barberoId}`);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const deleteHorarioDia = async (barberoId, diaSemana) => {
  return axiosPrivate.delete(
    `/horarios/barbero/${barberoId}/dia/${diaSemana}`,
  );
};

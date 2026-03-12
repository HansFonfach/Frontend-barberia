import { useEffect, useState, useCallback } from "react";
import { useHorario } from "context/HorarioContext";
import { verificarFeriado } from "api/feriados"; // ← necesitas esta función en tu api

const asegurarArray = (v) => (Array.isArray(v) ? v : []);
const normalizarHora = (hora) =>
  typeof hora === "string" ? hora.slice(0, 5) : null;

export const useGestionHorariosAdmin = (barbero, fecha) => {
  const { obtenerHorarioBasePorDia, obtenerExcepcionesPorDia } = useHorario();

  const [horasBase, setHorasBase] = useState([]);
  const [excepciones, setExcepciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [infoFeriado, setInfoFeriado] = useState(null); // ← NUEVO

  const cargarHorarios = useCallback(async () => {
    if (!barbero || !fecha) return;

    setCargando(true);
    setError("");

    try {
      // Horario base
      const base = await obtenerHorarioBasePorDia(barbero, fecha);
      const baseNormalizado = asegurarArray(base)
        .map((h) => normalizarHora(h?.hora))
        .filter(Boolean)
        .map((hora) => ({ hora, origen: "base" }));
      setHorasBase(baseNormalizado);

      // Excepciones
      const res = await obtenerExcepcionesPorDia(barbero, fecha);
      const excepcionesData = asegurarArray(res?.excepciones || res)
        .map((e) => ({
          hora: normalizarHora(e.horaInicio || e.hora),
          tipo: e.tipo,
          id: e.id,
          origen: "excepcion",
        }))
        .filter((e) => e.hora);
      setExcepciones(excepcionesData);

      // ← NUEVO: verificar si es feriado
      const feriado = await verificarFeriado(fecha);
      setInfoFeriado(feriado?.esFeriado ? feriado : null);
    } catch (err) {
      console.error("❌ Error cargando horarios admin:", err);
      setError("Error al cargar horarios del día");
      setHorasBase([]);
      setExcepciones([]);
    } finally {
      setCargando(false);
    }
  }, [barbero, fecha, obtenerHorarioBasePorDia, obtenerExcepcionesPorDia]);

  useEffect(() => {
    cargarHorarios();
  }, [cargarHorarios]);

  const obtenerTodasLasHoras = useCallback(() => {
    const horasExtras = excepciones
      .filter((e) => e.tipo === "extra")
      .map((e) => ({ hora: e.hora, origen: "extra" }));

    return [...horasBase, ...horasExtras].sort((a, b) =>
      a.hora.localeCompare(b.hora)
    );
  }, [horasBase, excepciones]);

  const obtenerHorasCanceladas = useCallback(() => {
    // ← CLAVE: si es feriado, todas las horas base están bloqueadas
    // EXCEPTO las que tienen ExcepcionHorario tipo "extra" (habilitadas por el barbero)
    if (infoFeriado) {
      const horasHabilitadas = new Set(
        excepciones.filter((e) => e.tipo === "extra").map((e) => e.hora)
      );
      return horasBase
        .map((h) => h.hora)
        .filter((hora) => !horasHabilitadas.has(hora));
    }

    return excepciones.filter((e) => e.tipo === "bloqueo").map((e) => e.hora);
  }, [excepciones, horasBase, infoFeriado]);

  const obtenerHorasExtra = useCallback(() => {
    return excepciones
      .filter((e) => e.tipo === "extra")
      .map((e) => ({ hora: e.hora }));
  }, [excepciones]);

  return {
    todasLasHoras: obtenerTodasLasHoras(),
    horasExtra: obtenerHorasExtra(),
    horasCanceladas: obtenerHorasCanceladas(),
    excepciones,
    cargando,
    error,
    refetch: cargarHorarios,
    infoFeriado, // ← NUEVO: para que el componente sepa si es feriado
  };
};
import { useEffect, useState, useCallback } from "react";
import { useHorario } from "context/HorarioContext";
import { verificarFeriado } from "api/feriados";
import { getHorasProfesionalDia } from "api/horarios"; // ← NUEVA

const asegurarArray = (v) => (Array.isArray(v) ? v : []);
const normalizarHora = (hora) =>
  typeof hora === "string" ? hora.slice(0, 5) : null;

export const useGestionHorariosAdmin = (barbero, fecha) => {
  const { obtenerHorarioBasePorDia, obtenerExcepcionesPorDia } = useHorario();

  const [horasBase, setHorasBase] = useState([]);
  const [excepciones, setExcepciones] = useState([]);
  const [horasAdmin, setHorasAdmin] = useState([]); // ← NUEVO: grilla completa
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [infoFeriado, setInfoFeriado] = useState(null);

  const cargarHorarios = useCallback(async () => {
    if (!barbero || !fecha) return;

    setCargando(true);
    setError("");

    try {
      // ── Todo en paralelo para no esperar de a uno ──
      const [base, resExcepciones, feriado, resAdmin] = await Promise.all([
        obtenerHorarioBasePorDia(barbero, fecha),
        obtenerExcepcionesPorDia(barbero, fecha),
        verificarFeriado(fecha),
        getHorasProfesionalDia(barbero, fecha), // ← NUEVO
      ]);

      // Horario base (sin cambios)
      const baseNormalizado = asegurarArray(base)
        .map((h) => normalizarHora(h?.hora))
        .filter(Boolean)
        .map((hora) => ({ hora, origen: "base" }));
      setHorasBase(baseNormalizado);

      // Excepciones (sin cambios)
      const excepcionesData = asegurarArray(
        resExcepciones?.excepciones || resExcepciones
      )
        .map((e) => ({
          hora: normalizarHora(e.horaInicio || e.hora),
          tipo: e.tipo,
          id: e.id,
          origen: "excepcion",
        }))
        .filter((e) => e.hora);
      setExcepciones(excepcionesData);

      // Feriado (sin cambios)
      setInfoFeriado(feriado?.esFeriado ? feriado : null);

      // ── NUEVO: grilla completa del back ──
      setHorasAdmin(asegurarArray(resAdmin?.horas));

    } catch (err) {
      console.error("❌ Error cargando horarios admin:", err);
      setError("Error al cargar horarios del día");
      setHorasBase([]);
      setExcepciones([]);
      setHorasAdmin([]);
    } finally {
      setCargando(false);
    }
  }, [barbero, fecha, obtenerHorarioBasePorDia, obtenerExcepcionesPorDia]);

  useEffect(() => {
    cargarHorarios();
  }, [cargarHorarios]);

  // ── Sin cambios ──
  const obtenerTodasLasHoras = useCallback(() => {
    const horasExtras = excepciones
      .filter((e) => e.tipo === "extra")
      .map((e) => ({ hora: e.hora, origen: "extra" }));

    return [...horasBase, ...horasExtras].sort((a, b) =>
      a.hora.localeCompare(b.hora)
    );
  }, [horasBase, excepciones]);

  const obtenerHorasCanceladas = useCallback(() => {
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

  // ── NUEVO: buscar una hora específica en la grilla ──
  const obtenerEstadoHora = useCallback(
    (hora) => horasAdmin.find((h) => h.hora === hora) ?? null,
    [horasAdmin]
  );

  return {
    // Lo que ya tenías (sin cambios)
    todasLasHoras: obtenerTodasLasHoras(),
    horasExtra: obtenerHorasExtra(),
    horasCanceladas: obtenerHorasCanceladas(),
    excepciones,
    cargando,
    error,
    refetch: cargarHorarios,
    infoFeriado,

    // NUEVO: grilla enriquecida del back
    horasAdmin,         // array completo con estado, reserva, etc.
    obtenerEstadoHora,  // helper para buscar una hora puntual
  };
};
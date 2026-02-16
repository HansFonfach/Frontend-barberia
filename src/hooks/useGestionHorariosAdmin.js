// src/hooks/useGestionHorariosAdmin.js
import { useEffect, useState, useCallback } from "react";
import { useHorario } from "context/HorarioContext";

const asegurarArray = (v) => (Array.isArray(v) ? v : []);

const normalizarHora = (hora) =>
  typeof hora === "string" ? hora.slice(0, 5) : null;

export const useGestionHorariosAdmin = (barbero, fecha) => {
  const { obtenerHorarioBasePorDia, obtenerExcepcionesPorDia } = useHorario();

  const [horasBase, setHorasBase] = useState([]);
  const [excepciones, setExcepciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

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
          origen: "excepcion"
        }))
        .filter(e => e.hora);
      setExcepciones(excepcionesData);
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

  // Función para obtener todas las horas únicas (base + extras)
  const obtenerTodasLasHoras = useCallback(() => {
    // Horas del horario base
    const horasBaseSet = new Set(horasBase.map(h => h.hora));
    
    // Horas extra que no están en el horario base
    const horasExtras = excepciones
      .filter(e => e.tipo === "extra")
      .map(e => ({ hora: e.hora, origen: "extra" }));
    
    // Combinar y ordenar
    return [...horasBase, ...horasExtras]
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }, [horasBase, excepciones]);

  // Función para obtener horas canceladas
  const obtenerHorasCanceladas = useCallback(() => {
    return excepciones
      .filter(e => e.tipo === "bloqueo")
      .map(e => e.hora);
  }, [excepciones]);

  // Función para obtener horas extra
  const obtenerHorasExtra = useCallback(() => {
    return excepciones
      .filter(e => e.tipo === "extra")
      .map(e => ({ hora: e.hora }));
  }, [excepciones]);

  return {
    todasLasHoras: obtenerTodasLasHoras(),
    horasExtra: obtenerHorasExtra(),
    horasCanceladas: obtenerHorasCanceladas(),
    excepciones,
    cargando,
    error,
    refetch: cargarHorarios,
  };
};
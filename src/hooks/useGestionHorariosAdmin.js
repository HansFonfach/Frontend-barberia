// src/hooks/useGestionHorariosAdmin.js
import { useEffect, useState } from "react";
import { useHorario } from "context/HorarioContext";

const asegurarArray = (v) => (Array.isArray(v) ? v : []);

export const useGestionHorariosAdmin = (barbero, fecha) => {
  const {
    obtenerHorarioBasePorDia,
    obtenerExcepcionesPorDia,
  } = useHorario();

  const [todasLasHoras, setTodasLasHoras] = useState([]);
  const [horasExtra, setHorasExtra] = useState([]);
  const [horasCanceladas, setHorasCanceladas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!barbero || !fecha) return;

    const cargarHorarios = async () => {
      setCargando(true);
      setError("");

      try {
        // 1️⃣ Horario base
        const base = await obtenerHorarioBasePorDia(barbero, fecha);
        setTodasLasHoras(asegurarArray(base));

        // 2️⃣ Excepciones
        const res = await obtenerExcepcionesPorDia(barbero, fecha);
        const excepciones = asegurarArray(res?.excepciones || res);

        const extra = excepciones
          .filter((e) => e?.tipo === "extra")
          .map((e) => e.horaInicio);

        const canceladas = excepciones
          .filter((e) => e?.tipo === "bloqueo")
          .map((e) => e.horaInicio);

        setHorasExtra(extra);
        setHorasCanceladas(canceladas);
      } catch (err) {
        console.error("❌ Error cargando horarios admin:", err);
        setError("Error al cargar horarios del día");
        setTodasLasHoras([]);
        setHorasExtra([]);
        setHorasCanceladas([]);
      } finally {
        setCargando(false);
      }
    };

    cargarHorarios();
  }, [barbero, fecha, obtenerHorarioBasePorDia, obtenerExcepcionesPorDia]);

  return {
    todasLasHoras,
    horasExtra,
    horasCanceladas,
    cargando,
    error,
  };
};

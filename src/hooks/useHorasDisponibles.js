// hooks/useHorasDisponibles.js
import { useState, useEffect } from "react";
// hooks/useHorasDisponibles.js - CORREGIDO
export const useHorasDisponibles = (barbero, fecha, getHorasFn) => {
  const [horas, setHoras] = useState([]);
  const [todasLasHoras, setTodasLasHoras] = useState([]);
  const [horasBloqueadas, setHorasBloqueadas] = useState([]);
  const [horasExtra, setHorasExtra] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!barbero || !fecha) {
      setHoras([]);
      setTodasLasHoras([]);
      setHorasBloqueadas([]);
      setHorasExtra([]);
      setMensaje(!barbero ? "Cargando barbero..." : "Selecciona una fecha");
      return;
    }

    const fetchHoras = async () => {
      setCargando(true);
      try {
        const result = await getHorasFn(barbero, fecha);
        console.log("🔍🔍🔍 RESPUESTA COMPLETA:", result);
        
        // ✅ Ahora result contiene directamente las propiedades del backend
        const horasDisponiblesFiltradas = result.horasDisponibles || [];
        const todasLasHorasSinFiltrar = result.todasLasHoras || [];
        const bloqueadas = result.horasBloqueadas || [];
        const extras = result.horasExtra || [];
        
        setHoras(horasDisponiblesFiltradas);
        setTodasLasHoras(todasLasHorasSinFiltrar);
        setHorasBloqueadas(bloqueadas);
        setHorasExtra(extras);
        setMensaje(result.message || "");
      } catch (err) {
        console.error("❌ Error en useHorasDisponibles:", err);
        setMensaje("Error al obtener horarios");
        setHoras([]);
        setTodasLasHoras([]);
        setHorasBloqueadas([]);
        setHorasExtra([]);
      } finally {
        setCargando(false);
      }
    };

    fetchHoras();
  }, [barbero, fecha, getHorasFn]);

  return { 
    horas,
    todasLasHoras,
    horasBloqueadas, 
    horasExtra, 
    mensaje, 
    cargando 
  };
};
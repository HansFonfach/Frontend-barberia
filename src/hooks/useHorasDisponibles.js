// hooks/useHorasDisponibles.js
import { useState, useEffect } from "react";

export const useHorasDisponibles = (barbero, fecha, getHorasFn) => {
  const [horas, setHoras] = useState([]);
  const [todasLasHoras, setTodasLasHoras] = useState([]);
  const [horasBloqueadas, setHorasBloqueadas] = useState([]);
  const [horasExtra, setHorasExtra] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [esFeriado, setEsFeriado] = useState(false);
  const [nombreFeriado, setNombreFeriado] = useState("");
  const [comportamientoFeriado, setComportamientoFeriado] = useState("");

  useEffect(() => {
    if (!barbero || !fecha) {
      setHoras([]);
      setTodasLasHoras([]);
      setHorasBloqueadas([]);
      setHorasExtra([]);
      setMensaje(!barbero ? "Cargando barbero..." : "Selecciona una fecha");
      setEsFeriado(false);
      setNombreFeriado("");
      setComportamientoFeriado("");
      return;
    }

    const fetchHoras = async () => {
      setCargando(true);
      try {
        const result = await getHorasFn(barbero, fecha);
        console.log("🔍 RESPUESTA COMPLETA DE HORAS:", result);
        
        // EXTRAER TODAS LAS PROPIEDADES
        setHoras(result.horasDisponibles || []);
        setTodasLasHoras(result.todasLasHoras || []);
        setHorasBloqueadas(result.horasBloqueadas || []);
        setHorasExtra(result.horasExtra || []);
        setMensaje(result.message || "");
        
        // ¡ESTAS SON LAS NUEVAS PROPIEDADES QUE ESTÁS IGNORANDO!
        setEsFeriado(result.esFeriado || false);
        setNombreFeriado(result.nombreFeriado || "");
        setComportamientoFeriado(result.comportamientoFeriado || "");
        
        console.log("📊 Datos procesados EN HOOK:", {
          horas: (result.horasDisponibles || []).length,
          horasBloqueadas: (result.horasBloqueadas || []).length,
          esFeriado: result.esFeriado,
          nombreFeriado: result.nombreFeriado,
          comportamientoFeriado: result.comportamientoFeriado
        });
        
      } catch (err) {
        console.error("❌ Error en useHorasDisponibles:", err);
        setMensaje("Error al obtener horarios");
        setHoras([]);
        setTodasLasHoras([]);
        setHorasBloqueadas([]);
        setHorasExtra([]);
        setEsFeriado(false);
        setNombreFeriado("");
        setComportamientoFeriado("");
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
    cargando,
    esFeriado,        // ← ¡NUEVO!
    nombreFeriado,    // ← ¡NUEVO!
    comportamientoFeriado  // ← ¡NUEVO!
  };
};
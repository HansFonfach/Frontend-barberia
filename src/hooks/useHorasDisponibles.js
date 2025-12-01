// hooks/useHorasDisponibles.js
import { useState, useEffect } from "react";

// Función helper para asegurar que siempre sea un array
const asegurarArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && data.data && Array.isArray(data.data)) return data.data;
  if (data && typeof data === 'object') return Object.values(data);
  return [];
};

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
        console.log("🔍 RESPUESTA COMPLETA DE HORAS:", result);
        
        // VALIDACIONES SEGURAS
        let horasDisponiblesArray = [];
        let todasLasHorasArray = [];
        let bloqueadasArray = [];
        let extrasArray = [];
        let mensajeTexto = "";

        // Caso 1: Result tiene las propiedades directas
        if (result && typeof result === 'object') {
          horasDisponiblesArray = asegurarArray(result.horasDisponibles || result.horas || result.data || []);
          todasLasHorasArray = asegurarArray(result.todasLasHoras || []);
          bloqueadasArray = asegurarArray(result.horasBloqueadas || []);
          extrasArray = asegurarArray(result.horasExtra || []);
          mensajeTexto = result.message || result.mensaje || "";
        }
        // Caso 2: Result es directamente un array
        else if (Array.isArray(result)) {
          horasDisponiblesArray = result;
        }
        
        console.log("📊 Datos procesados:", {
          horas: horasDisponiblesArray.length,
          todasLasHoras: todasLasHorasArray.length,
          bloqueadas: bloqueadasArray.length,
          extras: extrasArray.length,
          mensaje: mensajeTexto
        });

        setHoras(horasDisponiblesArray);
        setTodasLasHoras(todasLasHorasArray);
        setHorasBloqueadas(bloqueadasArray);
        setHorasExtra(extrasArray);
        setMensaje(mensajeTexto);
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
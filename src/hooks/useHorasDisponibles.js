// hooks/useHorasDisponibles.js - VERSIÓN CORREGIDA
import { useState, useEffect } from "react";

export const useHorasDisponibles = (barbero, fecha, servicioId, getHorasFn) => {
  const [horas, setHoras] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [dataCompleta, setDataCompleta] = useState(null);

  useEffect(() => {
    console.log("🔄 useHorasDisponibles:", {
      barbero: barbero || "NO",
      fecha: fecha || "NO",
      servicioId: servicioId || "NO"
    });

    // 1. Si NO hay barbero seleccionado
    if (!barbero) {
      console.log("⏸️ Pausado: Esperando selección de barbero");
      setHoras([]);
      setMensaje("Selecciona un barbero");
      setDataCompleta(null);
      return;
    }

    // 2. Si NO hay fecha seleccionada
    if (!fecha) {
      console.log("⏸️ Pausado: Esperando selección de fecha");
      setHoras([]);
      setMensaje("Selecciona un día");
      setDataCompleta(null);
      return;
    }

    // 3. Si NO hay servicio seleccionado
    if (!servicioId) {
      console.log("⏸️ Pausado: Esperando selección de servicio");
      setHoras([]);
      setMensaje("Selecciona un servicio");
      setDataCompleta(null);
      return;
    }

    // 4. ¡TODO COMPLETO! Puede hacer la llamada
    console.log("🚀 Todos los datos listos, haciendo llamada API...");

    const fetchHoras = async () => {
      setCargando(true);
      setMensaje("");
      try {
        console.log("📡 Llamando API con:", { barbero, fecha, servicioId });
        const res = await getHorasFn(barbero, fecha, servicioId);
        
        console.log("✅ API respondió:", {
          horasCount: res.horasDisponibles?.length || 0,
          todasHoras: res.todasLasHoras?.length || 0,
          feriado: res.esFeriado
        });
        
        setHoras(res.horasDisponibles || []);
        setDataCompleta(res);
        
        if (!res.horasDisponibles || res.horasDisponibles.length === 0) {
          if (res.esFeriado) {
            setMensaje(`🎉 Feriado: ${res.nombreFeriado || 'Día festivo'}`);
          } else {
            setMensaje("No hay horas disponibles para esta fecha");
          }
        }
      } catch (err) {
        console.error("❌ Error API:", {
          mensaje: err.message,
          data: err.response?.data
        });
        setHoras([]);
        setMensaje(err.response?.data?.message || "Error al obtener horarios");
        setDataCompleta(null);
      } finally {
        setCargando(false);
      }
    };

    fetchHoras();
  }, [barbero, fecha, servicioId, getHorasFn]);

  return { 
    horas, 
    mensaje, 
    cargando, 
    dataCompleta
  };
};
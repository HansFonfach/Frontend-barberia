// hooks/useHorasDisponibles.js
import { useState, useEffect } from "react";

export const useHorasDisponibles = (barbero, fecha, servicioId, getHorasFn) => {
  const [horas, setHoras] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [dataCompleta, setDataCompleta] = useState(null);

  useEffect(() => {
    // 1. Validaciones básicas
    if (!barbero) {
      setHoras([]);
      setMensaje("Selecciona un barbero");
      setDataCompleta(null);
      return;
    }

    if (!fecha) {
      setHoras([]);
      setMensaje("Selecciona un día");
      setDataCompleta(null);
      return;
    }

    if (!servicioId) {
      setHoras([]);
      setMensaje("Selecciona un servicio");
      setDataCompleta(null);
      return;
    }

    const fetchHoras = async () => {
      setCargando(true);
      setMensaje("");

      try {
        const res = await getHorasFn(barbero, fecha, servicioId);

        const horasRespuesta = res.horas || [];
        const hayDisponibles = horasRespuesta.some(
          (h) => h.estado === "disponible"
        );

        setHoras(horasRespuesta);
        setDataCompleta(res);

        if (!hayDisponibles) {
          if (res.esFeriado) {
            setMensaje(`🎉 Feriado: ${res.nombreFeriado || "Día festivo"}`);
          } else {
            setMensaje("No hay horas disponibles para esta fecha");
          }
        }
      } catch (err) {
        console.error("❌ Error API:", err);
        setHoras([]);
        setMensaje(
          err.response?.data?.message || "Error al obtener horarios"
        );
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
    dataCompleta,
  };
};

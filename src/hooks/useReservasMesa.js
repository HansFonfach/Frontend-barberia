// Hooks de datos del panel de reservas de mesa. Solo cargan y guardan:
// las reglas (capacidad, estados) las decide el backend.
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getConfiguracionReservasMesa,
  putConfiguracionReservasMesa,
  getReservasMesaDia,
  getReservasMesa,
  patchEstadoReservaMesa,
} from "api/reservasMesa";

export const useConfiguracionReservasMesa = () => {
  const [estado, setEstado] = useState({
    configuracion: null,
    faltantes: [],
    faltantesWeb: [],
    permisos: { cancelar: false, forzar: false },
    esAdmin: false,
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const { data } = await getConfiguracionReservasMesa();
      setEstado(data);
    } catch (e) {
      setError(e?.response?.data?.message || "No se pudo cargar la configuración");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const guardar = useCallback(async (configuracion) => {
    const { data } = await putConfiguracionReservasMesa(configuracion);
    setEstado((prev) => ({ ...prev, ...data }));
    return data;
  }, []);

  return { ...estado, cargando, error, recargar: cargar, guardar };
};

export const useReservasMesaDia = (fecha) => {
  const [datos, setDatos] = useState({ reservas: [], resumen: null, toleranciaMinutos: 0 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const pedido = useRef(0);

  const cargar = useCallback(
    async ({ silencioso = false } = {}) => {
      if (!fecha) return;
      const id = ++pedido.current;
      if (!silencioso) setCargando(true);
      setError("");
      try {
        const { data } = await getReservasMesaDia(fecha);
        if (id === pedido.current) setDatos(data);
      } catch (e) {
        if (id === pedido.current) setError(e?.response?.data?.message || "No se pudieron cargar las reservas");
      } finally {
        if (id === pedido.current) setCargando(false);
      }
    },
    [fecha],
  );

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Se refresca solo cada minuto (otra persona del equipo puede estar
  // marcando llegadas o tomando reservas al mismo tiempo)
  useEffect(() => {
    const t = setInterval(() => cargar({ silencioso: true }), 60000);
    return () => clearInterval(t);
  }, [cargar]);

  const cambiarEstado = useCallback(
    async (reservaId, cuerpo) => {
      await patchEstadoReservaMesa(reservaId, cuerpo);
      await cargar({ silencioso: true });
    },
    [cargar],
  );

  return { ...datos, cargando, error, recargar: cargar, cambiarEstado };
};

export const useListadoReservasMesa = (filtros) => {
  const [datos, setDatos] = useState({ items: [], total: 0, pagina: 1, paginas: 0 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const clave = JSON.stringify(filtros);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const { data } = await getReservasMesa(JSON.parse(clave));
      setDatos(data);
    } catch (e) {
      setError(e?.response?.data?.message || "No se pudieron cargar las reservas");
    } finally {
      setCargando(false);
    }
  }, [clave]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { ...datos, cargando, error, recargar: cargar };
};

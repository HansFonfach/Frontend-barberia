// src/views/admin/pages/hooks/useReservaFlow.js
import { useState, useContext, useEffect, useCallback } from "react";
import { useReserva } from "context/ReservaContext";
import { useAuth } from "context/AuthContext";
import { useNavigate } from "react-router-dom";
import ServiciosContext from "context/ServiciosContext";
import { useHorasDisponibles } from "hooks/useHorasDisponibles";
import { useRutValidator } from "hooks/useRutValidador";
import { useUsuario } from "context/usuariosContext";
import { useHorario } from "context/HorarioContext";
import Swal from "sweetalert2";

const DAYS_TO_SHOW = 7;

export const useReservaBarbero = () => {
  // Estado básico
  const [fecha, setFecha] = useState("");
  const [barbero, setBarbero] = useState("");
  const [hora, setHora] = useState("");
  const [servicio, setServicio] = useState("");
  const [pasoActual, setPasoActual] = useState(1);
  const [reservando, setReservando] = useState(false);
  const [rutValido, setRutValido] = useState(false);

  // Semana / disponibilidad
  const [weekStart, setWeekStart] = useState(new Date());
  const [weekDays, setWeekDays] = useState([]);
  const [loadingWeek, setLoadingWeek] = useState(false);

  // Hooks / context
  const navigate = useNavigate();
  const { user } = useAuth();
  const { servicios } = useContext(ServiciosContext);
  const { postReservarHora } = useReserva();
  const { getBarberosDisponibles, barberos, getUserByRut } = useUsuario();
  const { rut, handleRutChange, error, isValid, clearRut } = useRutValidator();
  const { getHorasDisponiblesBarbero } = useHorario();

  // Búsqueda de usuario
  const [buscandoUsuario, setBuscandoUsuario] = useState(false);
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null);
  const [errorBusqueda, setErrorBusqueda] = useState("");

  // Hook para horas disponibles
  const {
    horas: horasDisponibles,
    mensaje: mensajeHoras,
    cargando: cargandoHoras,
  } = useHorasDisponibles(barbero, fecha, getHorasDisponiblesBarbero);

  // Control de pasos simplificado
  useEffect(() => {
    if (!rut) {
      setPasoActual(1);
    } else if (!servicio || !barbero) {
      setPasoActual(2);
    } else if (!fecha) {
      setPasoActual(3);
    } else if (!hora) {
      setPasoActual(4);
    } else {
      setPasoActual(5);
    }
  }, [rut, servicio, barbero, fecha, hora]);

  useEffect(() => {
    let isMounted = true;

    const buscarUsuario = async () => {
      const rutNumerico = rut?.replace(/\D/g, "") || "";
      if (rutNumerico.length >= 7) {
        setBuscandoUsuario(true);
        setUsuarioEncontrado(null);
        setErrorBusqueda("");
        setRutValido(false); // ← por defecto no válido hasta confirmar

        try {
          const usuario = await getUserByRut(rut);
          if (isMounted) {
            if (usuario && (usuario._id || usuario.id || usuario.rut)) {
              setUsuarioEncontrado(usuario);
              setRutValido(true); // ✅ RUT válido y usuario existe
            } else {
              setErrorBusqueda("Usuario no encontrado");
            }
          }
        } catch (err) {
          setErrorBusqueda("Error al buscar usuario");
        } finally {
          if (isMounted) setBuscandoUsuario(false);
        }
      } else {
        setRutValido(false);
      }
    };

    const timeoutId = setTimeout(buscarUsuario, 800);
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [rut]);

  // Cargar barberos al inicio
  useEffect(() => {
    const loadBarberos = async () => {
      try {
        await getBarberosDisponibles();
      } catch (err) {
        console.error("Error cargando barberos:", err);
      }
    };
    loadBarberos();
  }, [getBarberosDisponibles]);

  // Utilidades
  const formatDayLabel = (d) => {
    return d.toLocaleDateString("es-CL", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const isoDate = (d) => d.toISOString().split("T")[0];

  // Encontrar slots consecutivos para servicios de 2 horas
  const findConsecutiveStarts = (horas = []) => {
    const setHoras = new Set(horas);
    const starts = [];
    for (let h of horas) {
      const [hh, mm] = h.split(":").map(Number);
      const next = `${String(hh + 1).padStart(2, "0")}:${String(mm).padStart(
        2,
        "0"
      )}`;
      if (setHoras.has(next)) starts.push(h);
    }
    return starts;
  };

  // Construir semana de fechas
  const buildWeekDates = useCallback((start) => {
    const dates = [];
    const s = new Date(start);
    s.setHours(0, 0, 0, 0);
    for (let i = 0; i < DAYS_TO_SHOW; i++) {
      const d = new Date(s);
      d.setDate(s.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, []);

  // Fetch disponibilidad semanal
  const fetchWeekAvailability = useCallback(
    async (barberoId, serviceDuracion, startDate) => {
      if (!barberoId || !serviceDuracion) {
        setWeekDays(
          buildWeekDates(startDate).map((d) => ({
            date: d,
            label: formatDayLabel(d),
            iso: isoDate(d),
            available: false,
            hours: [],
          }))
        );
        return;
      }

      setLoadingWeek(true);
      try {
        const dates = buildWeekDates(startDate);
        const promises = dates.map((d) =>
          getHorasDisponiblesBarbero(barberoId, isoDate(d)).catch((err) => {
            console.error("Error fetch horas day:", isoDate(d), err);
            return null;
          })
        );
        const results = await Promise.all(promises);

        const newWeek = dates.map((d, idx) => {
          const res = results[idx];
          const horas =
            (res && res.horasDisponibles) || (res && res.horas) || [];
          const starts120 =
            serviceDuracion === 120 ? findConsecutiveStarts(horas) : [];
          const available =
            serviceDuracion === 120 ? starts120.length > 0 : horas.length > 0;

          return {
            date: d,
            label: formatDayLabel(d),
            iso: isoDate(d),
            available,
            hours: horas,
            starts120,
          };
        });

        setWeekDays(newWeek);
      } catch (err) {
        console.error("Error fetchWeekAvailability:", err);
        setWeekDays(
          buildWeekDates(startDate).map((d) => ({
            date: d,
            label: formatDayLabel(d),
            iso: isoDate(d),
            available: false,
            hours: [],
          }))
        );
      } finally {
        setLoadingWeek(false);
      }
    },
    [buildWeekDates, getHorasDisponiblesBarbero]
  );

  // Cuando cambian barbero, servicio o weekStart => recargar semana
  useEffect(() => {
    if (!servicio || !barbero) {
      setWeekDays(
        buildWeekDates(weekStart).map((d) => ({
          date: d,
          label: formatDayLabel(d),
          iso: isoDate(d),
          available: false,
          hours: [],
        }))
      );
      return;
    }

    const svc = servicios.find((s) => s._id === servicio);
    const duracion = svc ? svc.duracion || 60 : 60;
    fetchWeekAvailability(barbero, duracion, weekStart);
  }, [
    barbero,
    servicio,
    weekStart,
    buildWeekDates,
    fetchWeekAvailability,
    servicios,
  ]);

  // Handlers
  const handleSelectDay = (iso) => {
    console.log("Seleccionando día:", iso);
    setFecha(iso);
    setHora("");
  };

  const prevWeek = () => {
    const d = new Date(weekStart);
    const prev = new Date(d);
    prev.setDate(d.getDate() - DAYS_TO_SHOW);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (prev < today) {
      setWeekStart(today);
    } else {
      setWeekStart(prev);
    }
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + DAYS_TO_SHOW);
    setWeekStart(d);
  };

  const nextHour = (h) => {
    const [hh, mm] = h.split(":").map(Number);
    return `${String(hh + 1).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  };

  const duracionSeleccionado = (() => {
    const svc = servicios.find((s) => s._id === servicio);
    return svc ? svc.duracion || 60 : 60;
  })();
  const handleReservar = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!user)
      return Swal.fire("Error", "Debes iniciar sesión para reservar", "error");

    setReservando(true);

    // Determinar usuario para la reserva
    const usuarioId = usuarioEncontrado?._id || user._id || user.id;

    if (!usuarioId) {
      setReservando(false);
      return Swal.fire(
        "Error",
        "No se pudo determinar el usuario para la reserva",
        "error"
      );
    }

    try {
      const horasAReservar =
        duracionSeleccionado === 120 ? [hora, nextHour(hora)] : [hora];

      for (const h of horasAReservar) {
        try {
          await postReservarHora(fecha, barbero, h, servicio, usuarioId);
        } catch (error) {
          const backendMessage =
            error.response?.data?.message || "No se pudo realizar la reserva";

          Swal.fire("Error", backendMessage, "error");
          return;
        }
      }

      Swal.fire(
        "Reserva exitosa",
        "Tu hora se ha reservado correctamente. Te enviaremos un correo con la confirmación de tu hora.",
        "success"
      );
      navigate("/admin/index");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo realizar la reserva.", "error");
    } finally {
      setReservando(false);
    }
  };
  const handleLimpiarRut = () => {
    clearRut();
    setUsuarioEncontrado(null);
    setErrorBusqueda("");
    setServicio("");
    setBarbero("");
    setFecha("");
    setHora("");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setWeekStart(today);
  };

  const handleSeleccionarServicio = (servicioId) => {
    setServicio(servicioId);
    setFecha("");
    setHora("");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setWeekStart(today);
  };

  const handleSeleccionarBarbero = (barberoId) => {
    setBarbero(barberoId);
    setFecha("");
    setHora("");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setWeekStart(today);
  };

  return {
    // Estado
    fecha,
    setFecha,
    barbero,
    setBarbero,
    hora,
    setHora,
    servicio,
    setServicio,
    pasoActual,
    reservando,
    setReservando,

    // Semana
    weekStart,
    setWeekStart,
    weekDays,
    loadingWeek,

    // Hooks
    navigate,
    user,
    servicios,
    postReservarHora,

    // RUT y usuario
    rut,
    handleRutChange,
    error,
    isValid,
    clearRut,
    buscandoUsuario,
    usuarioEncontrado,
    errorBusqueda,
    rutValido,

    // Barberos
    barberos,

    // Horas disponibles
    horasDisponibles,
    mensajeHoras,
    cargandoHoras,

    // Handlers
    handleSelectDay,
    prevWeek,
    nextWeek,
    handleReservar,
    handleLimpiarRut,
    handleSeleccionarServicio,
    handleSeleccionarBarbero,
  };
};

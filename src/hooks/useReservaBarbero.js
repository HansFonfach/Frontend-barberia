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
  // --- ESTADOS BÁSICOS ---
  const [fecha, setFecha] = useState("");
  const [barbero, setBarbero] = useState("");
  const [hora, setHora] = useState("");
  const [servicio, setServicio] = useState("");
  const [pasoActual, setPasoActual] = useState(1);
  const [reservando, setReservando] = useState(false);
  const [rutValido, setRutValido] = useState(false);

  // --- SEMANA ---
  const [weekStart, setWeekStart] = useState(new Date());
  const [weekDays, setWeekDays] = useState([]);
  const [loadingWeek, setLoadingWeek] = useState(false);

  // --- HOOKS / CONTEXTOS ---
  const navigate = useNavigate();
  const { user } = useAuth();
  const { servicios, loadingServicios } = useContext(ServiciosContext);
  const { postReservarHora } = useReserva();
  const { getBarberosDisponibles, barberos, getUserByRut } = useUsuario();
  const { rut, handleRutChange, error, isValid, clearRut } = useRutValidator();
  const { getHorasDisponiblesBarbero } = useHorario();

  // --- RUT / USUARIO ---
  const [buscandoUsuario, setBuscandoUsuario] = useState(false);
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null);
  const [errorBusqueda, setErrorBusqueda] = useState("");

  // --- HORAS DISPONIBLES ---
  const {
    horas: horasDisponibles,
    mensaje: mensajeHoras,
    cargando: cargandoHoras,
  } = useHorasDisponibles(barbero, fecha, getHorasDisponiblesBarbero);

  // --------------------------------------------------
  //      CONTROL DE PASOS  (NO CORRE SI CARGANDO)
  // --------------------------------------------------
  useEffect(() => {
    if (loadingServicios) return;

    if (!rut) setPasoActual(1);
    else if (!servicio || !barbero) setPasoActual(2);
    else if (!fecha) setPasoActual(3);
    else if (!hora) setPasoActual(4);
    else setPasoActual(5);
  }, [rut, servicio, barbero, fecha, hora, loadingServicios]);

  // --------------------------------------------------
  //      BÚSQUEDA DE USUARIO POR RUT
  // --------------------------------------------------
  useEffect(() => {
    if (loadingServicios) return;

    let isMounted = true;

    const buscarUsuario = async () => {
      const rutNumerico = rut?.replace(/\D/g, "") || "";
      if (rutNumerico.length < 7) {
        setRutValido(false);
        return;
      }

      setBuscandoUsuario(true);
      setUsuarioEncontrado(null);
      setErrorBusqueda("");
      setRutValido(false);

      try {
        const usuario = await getUserByRut(rut);

        if (isMounted) {
          if (usuario && (usuario._id || usuario.id || usuario.rut)) {
            setUsuarioEncontrado(usuario);
            setRutValido(true);
          } else {
            setErrorBusqueda("Usuario no encontrado");
          }
        }
      } catch {
        setErrorBusqueda("Error al buscar usuario");
      } finally {
        if (isMounted) setBuscandoUsuario(false);
      }
    };

    const timeoutId = setTimeout(buscarUsuario, 800);
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [rut, loadingServicios]);

  // --------------------------------------------------
  //      CARGAR BARBEROS AL INICIO
  // --------------------------------------------------
  useEffect(() => {
    if (loadingServicios) return;

    const loadBarberos = async () => {
      try {
        await getBarberosDisponibles();
      } catch (err) {
        console.error("Error cargando barberos:", err);
      }
    };

    loadBarberos();
  }, [getBarberosDisponibles, loadingServicios]);

  // --------------------------------------------------
  //     UTILIDADES Y CÁLCULOS
  // --------------------------------------------------
  const formatDayLabel = (d) =>
    d.toLocaleDateString("es-CL", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

  const isoDate = (d) => d.toISOString().split("T")[0];

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

  const buildWeekDates = useCallback((start) => {
    const dates = [];
    const s = new Date(start);
    s.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const d = new Date(s);
      d.setDate(s.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, []);

  // --------------------------------------------------
  //    FETCH DISPONIBILIDAD SEMANAL
  // --------------------------------------------------
  const fetchWeekAvailability = useCallback(
    async (barberoId, serviceDuracion, startDate) => {
      if (loadingServicios) return;

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
          getHorasDisponiblesBarbero(barberoId, isoDate(d)).catch(() => null)
        );

        const results = await Promise.all(promises);

        const newWeek = dates.map((d, idx) => {
          const res = results[idx];
          const horas = res?.horasDisponibles || res?.horas || [];
          const starts120 =
            serviceDuracion === 120 ? findConsecutiveStarts(horas) : [];

          return {
            date: d,
            label: formatDayLabel(d),
            iso: isoDate(d),
            available:
              serviceDuracion === 120 ? starts120.length > 0 : horas.length > 0,
            hours: horas,
            starts120,
          };
        });

        setWeekDays(newWeek);
      } catch {
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
    [buildWeekDates, getHorasDisponiblesBarbero, loadingServicios]
  );

  // --------------------------------------------------
  //      RECARGA DE SEMANA SI CAMBIA SERVICIO/BARBERO
  // --------------------------------------------------
  useEffect(() => {
    if (loadingServicios) return;

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
    const duracion = svc?.duracion || 60;

    fetchWeekAvailability(barbero, duracion, weekStart);
  }, [
    barbero,
    servicio,
    weekStart,
    buildWeekDates,
    fetchWeekAvailability,
    servicios,
    loadingServicios,
  ]);

  // --------------------------------------------------
  //      HANDLERS
  // --------------------------------------------------
  const handleSelectDay = (iso) => {
    setFecha(iso);
    setHora("");
  };

  const prevWeek = () => {
    const d = new Date(weekStart);
    const prev = new Date(d);
    prev.setDate(d.getDate() - 7);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    setWeekStart(prev < today ? today : prev);
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const nextHour = (h) => {
    const [hh, mm] = h.split(":").map(Number);
    return `${String(hh + 1).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  };

  const duracionSeleccionado = (() => {
    const svc = servicios.find((s) => s._id === servicio);
    return svc?.duracion || 60;
  })();

  const handleReservar = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!user)
      return Swal.fire("Error", "Debes iniciar sesión para reservar", "error");

    setReservando(true);

    const usuarioId = usuarioEncontrado?._id || user._id || user.id;

    if (!usuarioId) {
      setReservando(false);
      return Swal.fire("Error", "No se pudo determinar el usuario", "error");
    }

    try {
      const horasAReservar =
        duracionSeleccionado === 120 ? [hora, nextHour(hora)] : [hora];

      for (const h of horasAReservar) {
        try {
          await postReservarHora(fecha, barbero, h, servicio, usuarioId);
        } catch (error) {
          const backendMessage =
            error.response?.data?.message || "No se pudo reservar";
          Swal.fire("Error", backendMessage, "error");
          return;
        }
      }

      Swal.fire(
        "Reserva exitosa",
        "Tu hora ha sido reservada correctamente, te enviaremos un correo con los datos de tu reserva.",
        "success"
      );
      navigate("/admin/index");
    } catch {
      Swal.fire("Error", "No se pudo realizar la reserva", "error");
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

  const handleSeleccionarServicio = (id) => {
    setServicio(id);
    setFecha("");
    setHora("");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setWeekStart(today);
  };

  const handleSeleccionarBarbero = (id) => {
    setBarbero(id);
    setFecha("");
    setHora("");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setWeekStart(today);
  };

  // --------------------------------------------------
  //       **RETORNO FINAL (NO ANTES!)**
  // --------------------------------------------------

  if (loadingServicios) {
    return {
      loadingServicios: true,
      pasoActual: 1,
      servicios: [],
      barberos: [],
      weekDays: [],
      horasDisponibles: [],
    };
  }

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

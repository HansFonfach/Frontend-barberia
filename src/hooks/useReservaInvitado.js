// src/hooks/useReservaInvitado.js
import { useState, useContext, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { useReserva } from "context/ReservaContext";
import ServiciosContext from "context/ServiciosContext";
import { useUsuario } from "context/usuariosContext";
import { useHorario } from "context/HorarioContext";
import { useHorasDisponibles } from "hooks/useHorasDisponibles";
import { postReservarHoraInvitado } from "api/invitado";

export const useReservaInvitado = () => {
  // ────────────────────────────────
  // ESTADOS BÁSICOS
  // ────────────────────────────────
  const [fecha, setFecha] = useState("");
  const [barbero, setBarbero] = useState("");
  const [hora, setHora] = useState("");
  const [servicio, setServicio] = useState("");
  const [pasoActual, setPasoActual] = useState(1);
  const [reservando, setReservando] = useState(false);

  // ────────────────────────────────
  // SEMANA
  // ────────────────────────────────
  const [weekStart, setWeekStart] = useState(new Date());
  const [weekDays, setWeekDays] = useState([]);
  const [loadingWeek, setLoadingWeek] = useState(false);

  // ────────────────────────────────
  // INVITADO
  // ────────────────────────────────
  const [invitado, setInvitado] = useState({
    nombre: "",
    apellido: "",
    rut: "",
    telefono: "",
    email: "",
  });

  // ────────────────────────────────
  // CONTEXTOS
  // ────────────────────────────────
  const { barberos, getBarberosDisponibles } = useUsuario();
  const { servicios, serviciosBarberos, cargarServiciosBarbero, loadingServicios } = useContext(ServiciosContext);
  const { getHorasDisponiblesBarbero, } = useHorario(); // Ajusta según tu contexto reserva/invitado

  // ────────────────────────────────
  // CARGAR BARBEROS Y SERVICIOS
  // ────────────────────────────────
  useEffect(() => {
    getBarberosDisponibles();
  }, [getBarberosDisponibles]);

  useEffect(() => {
    if (!servicio) return;
    barberos.forEach((b) => {
      if (!serviciosBarberos[b._id]) {
        cargarServiciosBarbero(b._id);
      }
    });
  }, [servicio, barberos, serviciosBarberos, cargarServiciosBarbero]);

  // ────────────────────────────────
  // DURACIÓN DEL SERVICIO
  // ────────────────────────────────
  const duracionServicio = (() => {
    if (!barbero || !servicio) return 60;
    const serviciosB = serviciosBarberos[barbero] || [];
    const svc = serviciosB.find((s) => {
      const servicioId = s.servicioId?._id || s.servicioId;
      return String(servicioId) === String(servicio);
    });
    return svc?.duracion || 60;
  })();

  // ────────────────────────────────
  // HORAS DISPONIBLES (usa tu hook compartido)
  // ────────────────────────────────
  const {
    horas: horasDisponibles,
    mensaje: mensajeHoras,
    cargando: cargandoHoras,
    dataCompleta: horasDataCompleta,
  } = useHorasDisponibles(barbero, fecha, servicio, getHorasDisponiblesBarbero);

  // ────────────────────────────────
  // FILTRAR BARBEROS SEGÚN SERVICIO
  // ────────────────────────────────
  const barberosFiltrados = servicio
    ? barberos.filter((b) => {
        const serviciosB = serviciosBarberos[b._id] || [];
        return serviciosB.some((s) => String(s.servicioId?._id || s.servicioId) === String(servicio));
      })
    : [];

  // ────────────────────────────────
  // CONTROL DE PASOS
  // ────────────────────────────────
  useEffect(() => {
    if (loadingServicios) return;
    if (!servicio) setPasoActual(1);
    else if (!barbero) setPasoActual(2);
    else if (!fecha) setPasoActual(3);
    else if (!hora) setPasoActual(4);
    else setPasoActual(5);
  }, [servicio, barbero, fecha, hora, loadingServicios]);

  // ────────────────────────────────
  // UTILIDADES FECHA
  // ────────────────────────────────
  const isoDate = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const formatDayLabel = (d) =>
    d.toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" });

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

  // ────────────────────────────────
  // CARGAR DISPONIBILIDAD SEMANAL
  // ────────────────────────────────
  const fetchWeekAvailability = useCallback(async () => {
    const dates = buildWeekDates(weekStart);
    if (!barbero || !servicio) {
      setWeekDays(dates.map((d) => ({
        date: d,
        label: formatDayLabel(d),
        iso: isoDate(d),
        available: false,
        horas: [],
        mensaje: "Selecciona servicio y barbero",
      })));
      return;
    }

    setLoadingWeek(true);
    try {
      const results = await Promise.all(
        dates.map((d) => getHorasDisponiblesBarbero(barbero, isoDate(d), servicio).catch(() => ({ horas: [] })))
      );

      setWeekDays(dates.map((d, idx) => {
        const horas = results[idx]?.horas || [];
        const horasLibres = horas.filter((h) => h.estado === "disponible");
        return {
          date: d,
          label: formatDayLabel(d),
          iso: isoDate(d),
          available: horasLibres.length > 0,
          horas,
          mensaje: horas.length === 0 ? "No disponible" : horasLibres.length === 0 ? "Sin horas libres" : "",
        };
      }));
    } finally {
      setLoadingWeek(false);
    }
  }, [barbero, servicio, weekStart, buildWeekDates, getHorasDisponiblesBarbero]);

  useEffect(() => {
    fetchWeekAvailability();
  }, [barbero, servicio, weekStart, fetchWeekAvailability]);

  // ────────────────────────────────
  // HANDLERS
  // ────────────────────────────────
  const handleSelectDay = (iso) => {
    setFecha(iso);
    setHora("");
  };

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const handleSeleccionarServicio = (id) => {
    setServicio(id);
    setBarbero("");
    setFecha("");
    setHora("");
    setWeekStart(new Date());
  };

  const handleSeleccionarBarbero = (id) => {
    setBarbero(id);
    setFecha("");
    setHora("");
    setWeekStart(new Date());
  };

  // ────────────────────────────────
  // RESERVAR COMO INVITADO
  // ────────────────────────────────
  const reservarComoInvitado = async () => {
    if (!invitado.nombre || !invitado.apellido || !invitado.rut || !invitado.telefono || !invitado.email) {
      Swal.fire("Error", "Completa todos tus datos", "warning");
      return;
    }

    if (!servicio || !barbero || !fecha || !hora) {
      Swal.fire("Error", "Completa todos los pasos", "warning");
      return;
    }

    setReservando(true);
    try {
      await postReservarHoraInvitado({ fecha, barbero, hora, servicio, invitado });
      Swal.fire("Reserva creada", "Tu hora fue agendada", "success");
      setHora(""); setFecha(""); setBarbero(""); setServicio("");
      setInvitado({ nombre: "", apellido: "", rut: "", telefono: "", email: "" });
    } catch (error) {
      Swal.fire("Error", error?.response?.data?.message || "No se pudo reservar", "error");
    } finally {
      setReservando(false);
    }
  };

  return {
    fecha, setFecha,
    barbero, setBarbero,
    hora, setHora,
    servicio, setServicio,
    pasoActual,
    reservando,

    weekStart,
    weekDays,
    loadingWeek,

    servicios,
    barberos,
    barberosFiltrados,
    serviciosBarberos,
    loadingServicios,

    horasDisponibles,
    mensajeHoras,
    cargandoHoras,
    horasDataCompleta,
    duracionServicio,

    handleSelectDay,
    prevWeek,
    nextWeek,
    handleSeleccionarServicio,
    handleSeleccionarBarbero,
    reservarComoInvitado,
    invitado,
    setInvitado,
  };
};

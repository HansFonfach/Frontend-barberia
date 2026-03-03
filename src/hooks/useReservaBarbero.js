// src/views/admin/pages/hooks/useReservaBarbero.js
import { useState, useContext, useEffect, useCallback } from "react";
import { useReserva } from "context/ReservaContext";
import { useNavigate } from "react-router-dom";
import ServiciosContext from "context/ServiciosContext";
import { useHorasDisponibles } from "hooks/useHorasDisponibles";
import { useRutValidator } from "hooks/useRutValidador";
import { useUsuario } from "context/usuariosContext";
import { useHorario } from "context/HorarioContext";
import { postReservarHoraInvitado } from "api/invitado";
import { useAuth } from "context/AuthContext";
import Swal from "sweetalert2";

export const useReservaBarbero = () => {
  // --- ESTADOS BÁSICOS ---
  const [fecha, setFecha] = useState("");
  const [barbero, setBarbero] = useState("");
  const [hora, setHora] = useState("");
  const [servicio, setServicio] = useState("");
  const [pasoActual, setPasoActual] = useState(1);
  const [reservando, setReservando] = useState(false);
  const { user } = useAuth();
  const slug = user?.empresa?.slug;

  // --- SEMANA ---
  const [weekStart, setWeekStart] = useState(new Date());
  const [weekDays, setWeekDays] = useState([]);
  const [loadingWeek, setLoadingWeek] = useState(false);

  // --- INVITADO ---
  const [modoInvitado, setModoInvitado] = useState(false);
  const [modalInvitado, setModalInvitado] = useState(false);
  const [invitado, setInvitado] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    email: "",
  });

  // --- HOOKS / CONTEXTOS ---
  const navigate = useNavigate();
  const {
    servicios,
    serviciosBarberos,
    cargarServiciosBarbero,
    loadingServicios,
  } = useContext(ServiciosContext);
  const { postReservarHora } = useReserva();
  const { getBarberosDisponibles, barberos, getUserByRut } = useUsuario();
  const { getHorasDisponiblesBarbero } = useHorario();

  // --- RUT / USUARIO ---
  const [buscandoUsuario, setBuscandoUsuario] = useState(false);
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null);
  const [errorBusqueda, setErrorBusqueda] = useState("");

  const {
    rut,
    handleRutChange,
    error: errorRut,
    isValid,
    clearRut,
    cleanRut,
  } = useRutValidator("");

  // --- DURACIÓN DEL SERVICIO ---
  const duracionServicio = (() => {
    if (!barbero || !servicio) return 60;
    const serviciosB = serviciosBarberos[barbero] || [];
    const svc = serviciosB.find((s) => {
      const servicioId = s.servicioId?._id || s.servicioId;
      return String(servicioId) === String(servicio);
    });
    return svc?.duracion || 60;
  })();

  // --- HORAS DISPONIBLES ---
  const {
    horas: horasDisponibles,
    mensaje: mensajeHoras,
    cargando: cargandoHoras,
    dataCompleta: horasDataCompleta,
  } = useHorasDisponibles(barbero, fecha, servicio, getHorasDisponiblesBarbero);

  // --------------------------------------------------
  // CONTROL DE PASOS
  // --------------------------------------------------
  useEffect(() => {
    if (loadingServicios) return;

    // Paso 1: necesita usuario encontrado O modo invitado activo
    if (!usuarioEncontrado && !modoInvitado) {
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
  }, [
    servicio,
    barbero,
    fecha,
    hora,
    loadingServicios,
    usuarioEncontrado,
    modoInvitado,
  ]);

  // --------------------------------------------------
  // FILTRADO DE BARBEROS
  // --------------------------------------------------
  const barberosFiltrados = servicio
    ? barberos.filter((b) => {
        const serviciosB = serviciosBarberos[b._id] || [];
        return serviciosB.some(
          (s) => String(s.servicioId) === String(servicio),
        );
      })
    : [];

  // --------------------------------------------------
  // CARGAR SERVICIOS AL SELECCIONAR SERVICIO
  // --------------------------------------------------
  useEffect(() => {
    if (!servicio) return;
    barberos.forEach(async (b) => {
      if (!serviciosBarberos[b._id]) {
        await cargarServiciosBarbero(b._id);
      }
    });
  }, [servicio, barberos, serviciosBarberos, cargarServiciosBarbero]);

  // --------------------------------------------------
  // BÚSQUEDA DE USUARIO POR RUT
  // --------------------------------------------------
  useEffect(() => {
    if (!cleanRut || cleanRut.length < 3) {
      setUsuarioEncontrado(null);
      setModoInvitado(false);
      setErrorBusqueda("");
      setBuscandoUsuario(false);
      return;
    }

    let isMounted = true;
    let timeoutId;

    const buscarUsuario = async () => {
      if (!isMounted) return;

      setBuscandoUsuario(true);
      setUsuarioEncontrado(null);
      setModoInvitado(false);
      setErrorBusqueda("");

      try {
        // ⚠️ BUG PENDIENTE: getUserByRut puede estar retornando el usuario
        // del token en vez del buscado. Revisar api/usuarios y usuariosContext
        // cuando se compartan esos archivos.
        const usuario = await getUserByRut(cleanRut);

        if (isMounted) {
          if (usuario && usuario._id) {
            setUsuarioEncontrado(usuario);
            setModoInvitado(false);
            setErrorBusqueda("");
          } else {
            // ✅ En vez de error, activar modo invitado
            setUsuarioEncontrado(null);
            setModoInvitado(true);
            setErrorBusqueda("");
          }
        }
      } catch (err) {
        if (isMounted) {
          // ✅ Si el error es "no encontrado", activar modo invitado
          const esNoEncontrado =
            err?.response?.status === 404 ||
            err?.message?.toLowerCase().includes("no encontrado") ||
            err?.message?.toLowerCase().includes("not found");

          if (esNoEncontrado) {
            setModoInvitado(true);
            setErrorBusqueda("");
          } else {
            // Error real de red u otro
            setErrorBusqueda(err.message || "Error al buscar usuario");
            setModoInvitado(false);
          }
          setUsuarioEncontrado(null);
        }
      } finally {
        if (isMounted) setBuscandoUsuario(false);
      }
    };

    timeoutId = setTimeout(buscarUsuario, 800);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [cleanRut, getUserByRut]);

  // --------------------------------------------------
  // SEMANA Y DISPONIBILIDAD
  // --------------------------------------------------
  const isoDate = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;

  const formatDayLabel = (d) =>
    d.toLocaleDateString("es-CL", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

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

  const fetchWeekAvailability = useCallback(
    async (barberoId, serviceId, startDate) => {
      if (!barberoId || !serviceId) {
        const dates = buildWeekDates(startDate);
        setWeekDays(
          dates.map((d) => ({
            date: d,
            label: formatDayLabel(d),
            iso: isoDate(d),
            available: false,
            horas: [],
            mensaje: !barberoId ? "Selecciona barbero" : "Selecciona servicio",
          })),
        );
        return;
      }

      setLoadingWeek(true);
      try {
        const dates = buildWeekDates(startDate);
        const promises = dates.map((d) =>
          getHorasDisponiblesBarbero(barberoId, isoDate(d), serviceId).catch(
            () => ({ horas: [] }),
          ),
        );

        const results = await Promise.all(promises);

        const newWeek = dates.map((d, idx) => {
          const horas = results[idx]?.horas || [];
          const horasDisponibles = horas.filter(
            (h) => h.estado === "disponible",
          );
          return {
            date: d,
            label: formatDayLabel(d),
            iso: isoDate(d),
            available: horasDisponibles.length > 0,
            horas,
            mensaje:
              horas.length === 0
                ? "No disponible"
                : horasDisponibles.length === 0
                  ? "Sin horas libres"
                  : "",
          };
        });

        setWeekDays(newWeek);
      } catch (err) {
        console.error("❌ Error en fetchWeekAvailability:", err);
        const dates = buildWeekDates(startDate);
        setWeekDays(
          dates.map((d) => ({
            date: d,
            label: formatDayLabel(d),
            iso: isoDate(d),
            available: false,
            horas: [],
            mensaje: "Error al verificar disponibilidad",
          })),
        );
      } finally {
        setLoadingWeek(false);
      }
    },
    [buildWeekDates, getHorasDisponiblesBarbero],
  );

  useEffect(() => {
    if (loadingServicios) return;

    // ✅ Cargar semana si hay usuario encontrado O modo invitado
    const clienteListo = usuarioEncontrado || modoInvitado;

    if (!clienteListo || !servicio || !barbero) {
      const dates = buildWeekDates(weekStart);
      setWeekDays(
        dates.map((d) => ({
          date: d,
          label: formatDayLabel(d),
          iso: isoDate(d),
          available: false,
          horas: [],
          mensaje: !clienteListo
            ? "Ingresa RUT del cliente"
            : !servicio
              ? "Selecciona servicio"
              : "Selecciona barbero",
        })),
      );
      return;
    }

    fetchWeekAvailability(barbero, servicio, weekStart);
  }, [
    barbero,
    servicio,
    weekStart,
    fetchWeekAvailability,
    loadingServicios,
    usuarioEncontrado,
    modoInvitado,
  ]);

  // --------------------------------------------------
  // HANDLERS
  // --------------------------------------------------
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

  const calcularHoraFin = useCallback(
    (horaInicio) => {
      const [hh, mm] = horaInicio.split(":").map(Number);
      const totalMinutos = hh * 60 + mm + duracionServicio;
      const finH = Math.floor(totalMinutos / 60);
      const finM = totalMinutos % 60;
      return `${String(finH).padStart(2, "0")}:${String(finM).padStart(2, "0")}`;
    },
    [duracionServicio],
  );

  // --------------------------------------------------
  // VALIDACIÓN INVITADO
  // --------------------------------------------------
  const invitadoValido =
    invitado.nombre &&
    invitado.apellido &&
    invitado.telefono?.length === 8 &&
    invitado.email;

  // --------------------------------------------------
  // RESERVAR
  // --------------------------------------------------
  const handleReservar = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    if (!usuarioEncontrado && !modoInvitado) {
      Swal.fire("Error", "Debes ingresar un RUT válido", "error");
      return;
    }

    if (!servicio || !barbero || !fecha || !hora) {
      Swal.fire("Error", "Completa todos los campos requeridos", "error");
      return;
    }

    // Si es invitado, abrir modal para completar datos si faltan
    if (modoInvitado && !invitadoValido) {
      setModalInvitado(true);
      return;
    }

    setReservando(true);

    try {
      if (modoInvitado) {
        // ✅ Reservar como invitado usando el mismo endpoint que ya tienes
        await postReservarHoraInvitado(user?.empresa?.slug, {
          servicio,
          barbero,
          fecha,
          hora,
          rut: cleanRut,
          nombre: invitado.nombre,
          apellido: invitado.apellido,
          telefono: invitado.telefono,
          email: invitado.email,
        });

        Swal.fire({
          title: "¡Reserva exitosa!",
          html: `
            <p><strong>Cliente:</strong> ${invitado.nombre} ${invitado.apellido}</p>
            <p><strong>RUT:</strong> ${rut}</p>
            <p><strong>Fecha:</strong> ${fecha}</p>
            <p><strong>Hora:</strong> ${hora} - ${calcularHoraFin(hora)}</p>
            <p><strong>Duración:</strong> ${duracionServicio} minutos</p>
          `,
          icon: "success",
          confirmButtonText: "Aceptar",
        });
      } else {
        // ✅ Reservar usuario existente
        // ⚠️ BUG PENDIENTE: verificar que usuarioEncontrado._id sea el del cliente
        // y no del profesional logueado. Revisar getUserByRut y reservarHora en api/
        const usuarioId = usuarioEncontrado._id || usuarioEncontrado.id;
        await postReservarHora(fecha, barbero, hora, servicio, usuarioId);

        Swal.fire({
          title: "¡Reserva exitosa!",
          html: `
            <p><strong>Cliente:</strong> ${usuarioEncontrado.nombre} ${usuarioEncontrado.apellido}</p>
            <p><strong>RUT:</strong> ${usuarioEncontrado.rut}</p>
            <p><strong>Fecha:</strong> ${fecha}</p>
            <p><strong>Hora:</strong> ${hora} - ${calcularHoraFin(hora)}</p>
            <p><strong>Duración:</strong> ${duracionServicio} minutos</p>
          `,
          icon: "success",
          confirmButtonText: "Aceptar",
        });
      }

      handleLimpiarTodo();
      navigate("/admin/mis-reservas");
    } catch (error) {
      console.error("Error al reservar:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "No se pudo realizar la reserva",
        icon: "error",
      });
    } finally {
      setReservando(false);
    }
  };

  // Confirmar reserva invitado desde modal
  const handleConfirmarInvitado = async () => {
    if (!invitadoValido) return;
    setModalInvitado(false);
    await handleReservar();
  };

  // --------------------------------------------------
  // LIMPIAR
  // --------------------------------------------------
  const handleLimpiarRut = () => {
    clearRut();
    setUsuarioEncontrado(null);
    setModoInvitado(false);
    setErrorBusqueda("");
    setInvitado({ nombre: "", apellido: "", telefono: "", email: "" });
    setServicio("");
    setBarbero("");
    setFecha("");
    setHora("");
    setWeekStart(new Date());
  };

  const handleLimpiarTodo = () => {
    handleLimpiarRut();
    setWeekDays([]);
    setModalInvitado(false);
  };

  // --------------------------------------------------
  // EXPORT
  // --------------------------------------------------
  return {
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

    weekStart,
    setWeekStart,
    weekDays,
    loadingWeek,

    servicios,
    loadingServicios,
    barberos,
    barberosFiltrados,

    // RUT / Usuario
    rut,
    handleRutChange,
    error: errorRut,
    isValid,
    clearRut,
    cleanRut,
    buscandoUsuario,
    usuarioEncontrado,
    errorBusqueda,

    // Invitado
    modoInvitado,
    modalInvitado,
    setModalInvitado,
    invitado,
    setInvitado,
    invitadoValido,
    handleConfirmarInvitado,

    // Horas
    horasDisponibles,
    mensajeHoras,
    cargandoHoras,
    horasDataCompleta,
    duracionServicio,

    // Handlers
    handleSelectDay,
    prevWeek,
    nextWeek,
    handleReservar,
    handleLimpiarRut,
    handleLimpiarTodo,
    handleSeleccionarServicio,
    handleSeleccionarBarbero,
    calcularHoraFin,
    postReservarHora,
    navigate,
  };
};

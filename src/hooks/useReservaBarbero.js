// src/views/admin/pages/hooks/useReservaBarbero.js
import { useState, useContext, useEffect, useCallback } from "react";
import { useReserva } from "context/ReservaContext";
import { useNavigate } from "react-router-dom";
import ServiciosContext from "context/ServiciosContext";
import { useHorasDisponibles } from "hooks/useHorasDisponibles";
import { useRutValidator } from "hooks/useRutValidador";
import { useUsuario } from "context/usuariosContext";
import { useHorario } from "context/HorarioContext";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

// Configurar dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

export const useReservaBarbero = () => {
  // --- ESTADOS BÁSICOS ---
  const [fecha, setFecha] = useState("");
  const [barbero, setBarbero] = useState("");
  const [hora, setHora] = useState("");
  const [servicio, setServicio] = useState("");
  const [pasoActual, setPasoActual] = useState(1);
  const [reservando, setReservando] = useState(false);

  // --- SEMANA ---
  const [weekStart, setWeekStart] = useState(dayjs().tz("America/Santiago"));
  const [weekDays, setWeekDays] = useState([]);
  const [loadingWeek, setLoadingWeek] = useState(false);

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

  // Hook de validación de RUT
  const {
    rut,
    handleRutChange,
    error: errorRut,
    isValid,
    clearRut,
    cleanRut,
  } = useRutValidator("");

  // --- DURACIÓN DEL SERVICIO SELECCIONADO ---
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
  // FUNCIONES DE FECHA CORREGIDAS CON ZONA HORARIA
  // --------------------------------------------------
  const isoDate = useCallback((d) => {
    // Asegurarnos que 'd' sea dayjs en zona horaria Chile
    const fechaChile = dayjs.isDayjs(d) ? d : dayjs(d).tz("America/Santiago");
    return fechaChile.format("YYYY-MM-DD");
  }, []);

  const formatDayLabel = useCallback((d) => {
    const fechaChile = dayjs.isDayjs(d) ? d : dayjs(d).tz("America/Santiago");
    return fechaChile.format("ddd DD MMM");
  }, []);

  const buildWeekDates = useCallback((start) => {
    const startDate = dayjs.isDayjs(start) ? start : dayjs(start).tz("America/Santiago");
    const dates = [];
    
    for (let i = 0; i < 7; i++) {
      dates.push(startDate.add(i, "day"));
    }
    
    return dates;
  }, []);

  // --------------------------------------------------
  // CONTROL DE PASOS
  // --------------------------------------------------
  useEffect(() => {
    if (loadingServicios) return;

    if (!usuarioEncontrado) {
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
  }, [servicio, barbero, fecha, hora, loadingServicios, usuarioEncontrado]);

  // --------------------------------------------------
  // FILTRADO DE BARBEROS
  // --------------------------------------------------
  const barberosFiltrados = servicio
    ? barberos.filter((b) => {
        const serviciosB = serviciosBarberos[b._id] || [];
        return serviciosB.some(
          (s) => String(s.servicioId) === String(servicio)
        );
      })
    : [];

  // --------------------------------------------------
  // CARGAR SERVICIOS
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
  // BÚSQUEDA DE USUARIO
  // --------------------------------------------------
  useEffect(() => {
    if (!cleanRut || cleanRut.length < 3) {
      setUsuarioEncontrado(null);
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
      setErrorBusqueda("");

      try {
        const usuario = await getUserByRut(cleanRut);

        if (isMounted) {
          if (usuario && usuario._id) {
            setUsuarioEncontrado(usuario);
            setErrorBusqueda("");
          } else {
            setErrorBusqueda("Usuario no encontrado");
            setUsuarioEncontrado(null);
          }
        }
      } catch (err) {
        if (isMounted) {
          setErrorBusqueda(err.message || "Error al buscar usuario");
          setUsuarioEncontrado(null);
        }
      } finally {
        if (isMounted) {
          setBuscandoUsuario(false);
        }
      }
    };

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(buscarUsuario, 800);

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [cleanRut, getUserByRut]);

  // --------------------------------------------------
  // SEMANA Y DISPONIBILIDAD - CORREGIDO
  // --------------------------------------------------
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
            horasDisponibles: [],
            mensaje: !barberoId
              ? "Selecciona barbero"
              : !serviceId
              ? "Selecciona servicio"
              : "",
          }))
        );
        return;
      }

      setLoadingWeek(true);
      try {
        const dates = buildWeekDates(startDate);
        
        console.log("🔄 Fetching week availability:", {
          barberoId,
          serviceId,
          startDate: startDate.format("YYYY-MM-DD"),
          dates: dates.map(d => d.format("YYYY-MM-DD"))
        });

        const promises = dates.map((d) =>
          getHorasDisponiblesBarbero(barberoId, isoDate(d), serviceId)
            .then((res) => {
              console.log(`📊 Horas para ${isoDate(d)}:`, {
                horas: res?.horasDisponibles,
                cantidad: res?.horasDisponibles?.length,
                fechaEnviada: isoDate(d),
                respuestaCompleta: res
              });
              return res;
            })
            .catch((err) => {
              console.error(`❌ Error para ${isoDate(d)}:`, err);
              return { horasDisponibles: [] };
            })
        );

        const results = await Promise.all(promises);

        const newWeek = dates.map((d, idx) => {
          const res = results[idx];
          const horas = res?.horasDisponibles || [];
          
          console.log(`📅 Día ${isoDate(d)}:`, {
            horasDisponibles: horas,
            cantidad: horas.length,
            fechaFrontend: d.format("YYYY-MM-DD")
          });

          return {
            date: d,
            label: formatDayLabel(d),
            iso: isoDate(d),
            available: horas.length > 0,
            horasDisponibles: horas,
            mensaje: horas.length === 0 ? "No disponible" : "",
            // Agregar info extra para debug
            _debug: {
              fechaEnviada: isoDate(d),
              fechaBackend: res?.fecha,
              duracionServicio: res?.duracionServicio
            }
          };
        });

        setWeekDays(newWeek);
      } catch (err) {
        console.error("❌ Error en fetchWeekAvailability:", err);
      } finally {
        setLoadingWeek(false);
      }
    },
    [buildWeekDates, formatDayLabel, getHorasDisponiblesBarbero, isoDate]
  );

  // Efecto principal de disponibilidad
  useEffect(() => {
    if (loadingServicios) return;

    if (!usuarioEncontrado || !servicio || !barbero) {
      const dates = buildWeekDates(weekStart);
      setWeekDays(
        dates.map((d) => ({
          date: d,
          label: formatDayLabel(d),
          iso: isoDate(d),
          available: false,
          horasDisponibles: [],
          mensaje: !usuarioEncontrado
            ? "Ingresa RUT del cliente"
            : !servicio
            ? "Selecciona servicio"
            : !barbero
            ? "Selecciona barbero"
            : "Completa los pasos anteriores",
        }))
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
  ]);

  // --------------------------------------------------
  // HANDLERS
  // --------------------------------------------------
  const handleSelectDay = (iso) => {
    console.log("📅 Día seleccionado:", iso);
    setFecha(iso);
    setHora("");
  };

  const prevWeek = () => {
    setWeekStart(weekStart.subtract(7, "day"));
  };

  const nextWeek = () => {
    setWeekStart(weekStart.add(7, "day"));
  };

  const handleSeleccionarServicio = (id) => {
    console.log("✂️ Servicio seleccionado:", id);
    setServicio(id);
    setFecha("");
    setHora("");
    setWeekStart(dayjs().tz("America/Santiago"));
  };

  const handleSeleccionarBarbero = (id) => {
    console.log("💈 Barbero seleccionado:", id);
    setBarbero(id);
    setFecha("");
    setHora("");
    setWeekStart(dayjs().tz("America/Santiago"));
  };

  const calcularHoraFin = useCallback(
    (horaInicio) => {
      const [hh, mm] = horaInicio.split(":").map(Number);
      const totalMinutos = hh * 60 + mm + duracionServicio;
      const finH = Math.floor(totalMinutos / 60);
      const finM = totalMinutos % 60;
      return `${String(finH).padStart(2, "0")}:${String(finM).padStart(
        2,
        "0"
      )}`;
    },
    [duracionServicio]
  );

  const handleReservar = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    if (!usuarioEncontrado) {
      Swal.fire(
        "Error",
        "Debes ingresar un RUT válido y encontrar al cliente",
        "error"
      );
      return;
    }

    if (!servicio || !barbero || !fecha || !hora) {
      Swal.fire("Error", "Completa todos los campos requeridos", "error");
      return;
    }

    console.log("📤 Reservando:", {
      fecha,
      barbero,
      hora,
      servicio,
      cliente: usuarioEncontrado._id,
      duracion: duracionServicio
    });

    setReservando(true);

    try {
      const usuarioId = usuarioEncontrado._id || usuarioEncontrado.id;

      await postReservarHora(fecha, barbero, hora, servicio, usuarioId);

      Swal.fire({
        title: "¡Reserva exitosa!",
        html: `
        <div class="text-left">
          <p><strong>Cliente:</strong> ${usuarioEncontrado.nombre} ${
          usuarioEncontrado.apellido
        }</p>
          <p><strong>Barbero:</strong> ${
            barberos.find((b) => b._id === barbero)?.nombre || "Barbero"
          }</p>
          <p><strong>Fecha:</strong> ${fecha}</p>
          <p><strong>Hora:</strong> ${hora} - ${calcularHoraFin(hora)}</p>
          <p><strong>Duración:</strong> ${duracionServicio} minutos</p>
        </div>
      `,
        icon: "success",
        confirmButtonText: "Aceptar",
      });

      handleLimpiarTodo();
      navigate("/admin/mis-reservas");
    } catch (error) {
      console.error("❌ Error al reservar:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "No se pudo realizar la reserva",
        icon: "error",
        footer: error.response?.data?.detalles 
          ? `<div class="text-left"><small>${JSON.stringify(error.response.data.detalles)}</small></div>`
          : undefined
      });
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
    setWeekStart(dayjs().tz("America/Santiago"));
  };

  const handleLimpiarTodo = () => {
    handleLimpiarRut();
    setWeekDays([]);
  };

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

    navigate,
    servicios,
    loadingServicios,

    postReservarHora,

    rut,
    handleRutChange,
    error: errorRut,
    isValid,
    clearRut,
    buscandoUsuario,
    usuarioEncontrado,
    errorBusqueda,
    cleanRut,
    barberos,
    barberosFiltrados,

    horasDisponibles,
    mensajeHoras,
    cargandoHoras,
    horasDataCompleta,
    duracionServicio,

    handleSelectDay,
    prevWeek,
    nextWeek,
    handleReservar,
    handleLimpiarRut,
    handleLimpiarTodo,
    handleSeleccionarServicio,
    handleSeleccionarBarbero,

    calcularHoraFin,
  };
};
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

export const useReservaBarbero = () => {
  // --- ESTADOS BÁSICOS ---
  const [fecha, setFecha] = useState("");
  const [barbero, setBarbero] = useState("");
  const [hora, setHora] = useState("");
  const [servicio, setServicio] = useState("");
  const [pasoActual, setPasoActual] = useState(1);
  const [reservando, setReservando] = useState(false);

  // --- SEMANA ---
  const [weekStart, setWeekStart] = useState(new Date());
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
  // CONTROL DE PASOS - FLUJO BARBERO
  // --------------------------------------------------
  useEffect(() => {
    if (loadingServicios) return;

    // FLUJO BARBERO: siempre necesita usuario encontrado primero
    if (!usuarioEncontrado) {
      setPasoActual(1); // Paso 1: Ingresar RUT del cliente
    } else if (!servicio || !barbero) {
      setPasoActual(2); // Paso 2: Seleccionar servicio y barbero
    } else if (!fecha) {
      setPasoActual(3); // Paso 3: Seleccionar fecha
    } else if (!hora) {
      setPasoActual(4); // Paso 4: Seleccionar hora
    } else {
      setPasoActual(5); // Paso 5: Resumen
    }
  }, [servicio, barbero, fecha, hora, loadingServicios, usuarioEncontrado]);

  // --------------------------------------------------
  // FILTRADO DE BARBEROS SEGÚN SERVICIO
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
  // CARGAR SERVICIOS DE CADA BARBERO AL SELECCIONAR SERVICIO
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
  // BÚSQUEDA DE USUARIO POR RUT - CON DEBOUNCE
  // --------------------------------------------------
  // En el useEffect de búsqueda, REEMPLAZA completamente:
  useEffect(() => {
    // Solo buscar si hay un RUT limpio válido
    if (!cleanRut || cleanRut.length < 3) {
      console.log("⏸️ No buscar: RUT muy corto o vacío");
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
        console.log(`🔍 [EFECTO] Buscando usuario con: "${cleanRut}"`);

        const usuario = await getUserByRut(cleanRut);

        console.log(`📦 [EFECTO] Resultado recibido:`, usuario);

        if (isMounted) {
          if (usuario && usuario._id) {
            console.log(
              "✅ [EFECTO] Usuario ENCONTRADO, actualizando estado...",
            );
            setUsuarioEncontrado(usuario);
            setErrorBusqueda("");
          } else {
            console.log("❌ [EFECTO] Usuario NO encontrado");
            setErrorBusqueda("Usuario no encontrado");
            setUsuarioEncontrado(null);
          }
        }
      } catch (err) {
        console.error("❌ [EFECTO] Error en búsqueda:", err.message);
        if (isMounted) {
          setErrorBusqueda(err.message || "Error al buscar usuario");
          setUsuarioEncontrado(null);
        }
      } finally {
        if (isMounted) {
          console.log("🏁 [EFECTO] Finalizando búsqueda");
          setBuscandoUsuario(false);
        }
      }
    };

    // Clear previous timeout
    if (timeoutId) clearTimeout(timeoutId);

    // Nuevo timeout con debounce
    timeoutId = setTimeout(buscarUsuario, 800);

    return () => {
      console.log("🧹 [EFECTO] Limpiando efecto");
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
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
            horasDisponibles: [],
            mensaje: !barberoId
              ? "Selecciona barbero"
              : !serviceId
                ? "Selecciona servicio"
                : "",
          })),
        );
        return;
      }

      setLoadingWeek(true);
      try {
        const dates = buildWeekDates(startDate);

        const promises = dates.map((d) => {
          const fechaIso = isoDate(d);
          console.log(`🔍 Verificando disponibilidad para:`, {
            barbero: barberoId,
            fecha: fechaIso,
            servicio: serviceId,
          });

          return getHorasDisponiblesBarbero(barberoId, fechaIso, serviceId)
            .then((res) => {
              console.log(`✅ Respuesta para ${fechaIso}:`, res);
              return res;
            })
            .catch((err) => {
              console.error(`❌ Error para ${fechaIso}:`, err);
              return { horas: [] }; // 🔥 IMPORTANTE: debe ser { horas: [] } no { horasDisponibles: [] }
            });
        });

        const results = await Promise.all(promises);
        console.log("📊 Resultados completos:", results);

        const newWeek = dates.map((d, idx) => {
          const res = results[idx];

          // 🔥 CORREGIDO: La estructura correcta es { horas: [...] }
          // donde cada hora tiene { hora: "09:00", estado: "disponible", ... }
          const horas = res?.horas || [];

          // Filtrar solo las horas disponibles
          const horasDisponibles = horas.filter(
            (h) => h.estado === "disponible",
          );

          const disponible = horasDisponibles.length > 0;

          console.log(
            `📅 Día ${isoDate(d)}: ${disponible ? "✅ Disponible" : "❌ No disponible"} (${horasDisponibles.length} horas disponibles de ${horas.length} total)`,
          );

          return {
            date: d,
            label: formatDayLabel(d),
            iso: isoDate(d),

            // 🔥 EXACTAMENTE IGUAL AL CLIENTE
            available: horasDisponibles.length > 0,
            horas: horas, // 👈 TODAS las horas con estado

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
            horasDisponibles: [],
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

    // Solo cargar disponibilidad si hay usuario encontrado
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

  const nextHour = (h) => {
    const [hh, mm] = h.split(":").map(Number);
    const totalMinutos = hh * 60 + mm + 60;
    const nuevaH = Math.floor(totalMinutos / 60);
    const nuevaM = totalMinutos % 60;
    return `${String(nuevaH).padStart(2, "0")}:${String(nuevaM).padStart(
      2,
      "0",
    )}`;
  };

  const calcularHoraFin = useCallback(
    (horaInicio) => {
      const [hh, mm] = horaInicio.split(":").map(Number);
      const totalMinutos = hh * 60 + mm + duracionServicio;
      const finH = Math.floor(totalMinutos / 60);
      const finM = totalMinutos % 60;
      return `${String(finH).padStart(2, "0")}:${String(finM).padStart(
        2,
        "0",
      )}`;
    },
    [duracionServicio],
  );
  const handleReservar = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    if (!usuarioEncontrado) {
      Swal.fire(
        "Error",
        "Debes ingresar un RUT válido y encontrar al cliente",
        "error",
      );
      return;
    }

    if (!servicio || !barbero || !fecha || !hora) {
      Swal.fire("Error", "Completa todos los campos requeridos", "error");
      return;
    }

    setReservando(true);

    try {
      const usuarioId = usuarioEncontrado._id || usuarioEncontrado.id;

      // ✅ UNA SOLA RESERVA
      await postReservarHora(fecha, barbero, hora, servicio, usuarioId);

      Swal.fire({
        title: "¡Reserva exitosa!",
        html: `
        <div class="text-left">
          <p><strong>Cliente:</strong> ${usuarioEncontrado.nombre} ${
            usuarioEncontrado.apellido
          }</p>
          <p><strong>RUT:</strong> ${usuarioEncontrado.rut}</p>
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

  const handleLimpiarRut = () => {
    clearRut();
    setUsuarioEncontrado(null);
    setErrorBusqueda("");
    // Limpiar todos los campos
    setServicio("");
    setBarbero("");
    setFecha("");
    setHora("");
    setWeekStart(new Date());
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
    cleanRut, // 👈 Exportamos cleanRut
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

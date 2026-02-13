// src/hooks/useReservaInvitado.js
import { useState, useEffect, useCallback, useRef } from "react";
import Swal from "sweetalert2";
import { getServiciosPublicos, getServiciosBarbero } from "api/servicios";
import { getBarberosPublico } from "api/usuarios";
import { getHorasDisponibles } from "api/horarios";
import { postReservarHoraInvitado } from "api/invitado";
import { useHorasDisponibles } from "hooks/useHorasDisponibles";

export const useReservaInvitado = (slug) => {
  // ────────────────────────────────
  // REFS PARA CONTROLAR BUCLES
  // ────────────────────────────────
  const fetchingWeekRef = useRef(false);
  const prevBarberoRef = useRef("");
  const prevServicioRef = useRef("");
  const prevWeekStartRef = useRef("");

  // ────────────────────────────────
  // ESTADOS BASE
  // ────────────────────────────────
  const [servicios, setServicios] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [serviciosBarberos, setServiciosBarberos] = useState({});

  const [servicio, setServicio] = useState("");
  const [barbero, setBarbero] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");

  // 📅 ESTADOS PARA LA SEMANA
  const [weekStart, setWeekStart] = useState(new Date());
  const [weekDays, setWeekDays] = useState([]);
  const [loadingWeek, setLoadingWeek] = useState(false);

  const [loadingServicios, setLoadingServicios] = useState(true);
  const [loadingBarberos, setLoadingBarberos] = useState(true);
  const [reservando, setReservando] = useState(false);

  const [pasoActual, setPasoActual] = useState(1);

  const [invitado, setInvitado] = useState({
    nombre: "",
    apellido: "",
    rut: "",
    telefono: "",
    email: "",
  });

  // ────────────────────────────────
  // HOOK DE HORAS DISPONIBLES
  // ────────────────────────────────
  const {
    horas: horasDisponibles,
    mensaje: mensajeHoras,
    cargando: cargandoHoras,
    dataCompleta: horasDataCompleta,
  } = useHorasDisponibles(barbero, fecha, servicio, getHorasDisponibles);

  // ────────────────────────────────
  // UTILIDADES FECHA
  // ────────────────────────────────
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

  // ────────────────────────────────
  // CARGA INICIAL: SERVICIOS + BARBEROS
  // ────────────────────────────────
  useEffect(() => {
    if (!slug) return;

    const fetchInicial = async () => {
      try {
        setLoadingServicios(true);
        setLoadingBarberos(true);

        const [serviciosRes, barberosRes] = await Promise.all([
          getServiciosPublicos(slug),
          getBarberosPublico(slug),
        ]);

        setServicios(
          Array.isArray(serviciosRes?.data?.servicios)
            ? serviciosRes.data.servicios
            : [],
        );
        setBarberos(Array.isArray(barberosRes?.data) ? barberosRes.data : []);
      } catch (e) {
        console.error("❌ Error carga inicial:", e);
        setServicios([]);
        setBarberos([]);
      } finally {
        setLoadingServicios(false);
        setLoadingBarberos(false);
      }
    };

    fetchInicial();
  }, [slug]);

  // ────────────────────────────────
  // CARGAR SERVICIOS DE UN BARBERO (CACHE)
  // ────────────────────────────────
  const cargarServiciosBarbero = useCallback(
    async (barberoId) => {
      if (!barberoId || serviciosBarberos[barberoId]) return;

      try {
        const data = await getServiciosBarbero(barberoId);

        setServiciosBarberos((prev) => ({
          ...prev,
          [barberoId]: Array.isArray(data?.data) ? data.data : [],
        }));
      } catch (e) {
        console.error("❌ Error servicios barbero:", e);
        setServiciosBarberos((prev) => ({ ...prev, [barberoId]: [] }));
      }
    },
    [serviciosBarberos],
  );

  // ────────────────────────────────
  // FILTRAR BARBEROS SEGÚN SERVICIO SELECCIONADO
  // ────────────────────────────────
  const barberosFiltrados = servicio
    ? barberos.filter((b) => {
        const serviciosB = serviciosBarberos[b._id] || [];
        return serviciosB.some(
          (s) => String(s.servicioId) === String(servicio),
        );
      })
    : [];

  // ────────────────────────────────
  // DURACIÓN DEL SERVICIO
  // ────────────────────────────────
  const duracionServicio = (() => {
    if (!barbero || !servicio) return 60;
    const serviciosB = serviciosBarberos[barbero] || [];
    const match = serviciosB.find(
      (s) => String(s.servicioId) === String(servicio),
    );
    return match?.duracion || 60;
  })();

  // ────────────────────────────────
  // CARGAR DISPONIBILIDAD SEMANAL
  // ────────────────────────────────
  const fetchWeekAvailability = useCallback(
    async (barberoId, serviceId, startDate) => {
      // Evitar llamadas múltiples
      if (fetchingWeekRef.current) {
        return;
      }

      const dates = buildWeekDates(startDate);
      const weekStartKey = isoDate(startDate);

      // Verificar si ya cargamos estos mismos datos
      if (
        prevBarberoRef.current === barberoId &&
        prevServicioRef.current === serviceId &&
        prevWeekStartRef.current === weekStartKey
      ) {
        return;
      }

      if (!barberoId || !serviceId) {
        console.log("⛔ No se puede cargar semana - falta:", {
          barberoId,
          serviceId,
        });
        const emptyDays = dates.map((d) => ({
          date: d,
          label: formatDayLabel(d),
          iso: isoDate(d),
          available: false,
          horas: [],
          mensaje: !barberoId
            ? "Selecciona un barbero"
            : "Selecciona un servicio",
        }));
        setWeekDays(emptyDays);
        return;
      }

      console.log("✅ Cargando semana para:", {
        barberoId,
        serviceId,
        startDate,
      });

      fetchingWeekRef.current = true;
      setLoadingWeek(true);

      try {
        const results = await Promise.all(
          dates.map(async (d) => {
            try {
              const response = await getHorasDisponibles(
                barberoId,
                isoDate(d),
                serviceId,
              );

              // Extraer horas de la respuesta
              const horasData = response?.horas || [];

              return {
                horas: Array.isArray(horasData) ? horasData : [],
                esFeriado: response?.esFeriado || false,
                nombreFeriado: response?.nombreFeriado || "",
              };
            } catch (error) {
              console.error(`Error en fecha ${isoDate(d)}:`, error);
              return { horas: [], esFeriado: false, nombreFeriado: "" };
            }
          }),
        );

        const newWeekDays = dates.map((d, idx) => {
          const data = results[idx] || { horas: [] };
          const horas = data.horas || [];
          const horasArray = Array.isArray(horas) ? horas : [];

          const horasDisponibles = horasArray.filter(
            (h) => h?.estado === "disponible",
          );

          return {
            date: d,
            label: formatDayLabel(d),
            iso: isoDate(d),
            available: horasDisponibles.length > 0,
            horas: horasArray,
            esFeriado: data.esFeriado || false,
            nombreFeriado: data.nombreFeriado || "",
            mensaje:
              horasArray.length === 0
                ? "No disponible"
                : horasDisponibles.length === 0
                  ? "Sin horas libres"
                  : "",
          };
        });

        console.log("📅 Días de semana actualizados:", newWeekDays);
        setWeekDays(newWeekDays);

        // Guardar referencia de lo que cargamos
        prevBarberoRef.current = barberoId;
        prevServicioRef.current = serviceId;
        prevWeekStartRef.current = weekStartKey;
      } catch (error) {
        console.error("Error cargando disponibilidad semanal:", error);
        const errorDays = dates.map((d) => ({
          date: d,
          label: formatDayLabel(d),
          iso: isoDate(d),
          available: false,
          horas: [],
          mensaje: "Error al cargar",
        }));
        setWeekDays(errorDays);
      } finally {
        setLoadingWeek(false);
        fetchingWeekRef.current = false;
      }
    },
    [buildWeekDates, formatDayLabel, isoDate],
  );

  // ────────────────────────────────
  // EFECTO PARA CARGAR SEMANA - VERSIÓN CONTROLADA
  // ────────────────────────────────
  useEffect(() => {
    console.log("🔄 Efecto semana - verificando:", { servicio, barbero });

    // Mostrar días vacíos si falta algún dato
    if (!servicio || !barbero) {
      console.log("⏳ Esperando selección completa...");
      const dates = buildWeekDates(weekStart);
      const emptyDays = dates.map((d) => ({
        date: d,
        label: formatDayLabel(d),
        iso: isoDate(d),
        available: false,
        horas: [],
        mensaje: !barbero
          ? "Selecciona un barbero"
          : !servicio
            ? "Selecciona un servicio"
            : "Completa la selección",
      }));
      setWeekDays(emptyDays);
      return;
    }

    // Programar la carga con un pequeño delay para evitar múltiples llamadas
    const timeoutId = setTimeout(() => {
      fetchWeekAvailability(barbero, servicio, weekStart);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    servicio,
    barbero,
    weekStart,
    fetchWeekAvailability,
    buildWeekDates,
    formatDayLabel,
    isoDate,
  ]);

  // ────────────────────────────────
  // CONTROL DE PASOS
  // ────────────────────────────────
  useEffect(() => {
    if (!servicio) setPasoActual(1);
    else if (!barbero) setPasoActual(2);
    else if (!fecha) setPasoActual(3);
    else if (!hora) setPasoActual(4);
    else setPasoActual(5);
  }, [servicio, barbero, fecha, hora]);

  // ────────────────────────────────
  // HANDLERS DE SELECCIÓN
  // ────────────────────────────────
  const handleSeleccionarServicio = (id) => {
    console.log("📌 Servicio seleccionado:", id);
    setServicio(id);
    setBarbero("");
    setFecha("");
    setHora("");
    setWeekStart(new Date());

    // Resetear referencias
    prevBarberoRef.current = "";
    prevServicioRef.current = "";
    prevWeekStartRef.current = "";

    barberos.forEach((b) => {
      cargarServiciosBarbero(b._id);
    });
  };

  const handleSeleccionarBarbero = (id) => {
    console.log("👤 Barbero seleccionado:", id, "con servicio:", servicio);
    setBarbero(id);
    setFecha("");
    setHora("");
    setWeekStart(new Date());

    // Resetear referencias de semana para forzar recarga
    prevBarberoRef.current = "";
    prevServicioRef.current = "";
    prevWeekStartRef.current = "";

    if (!serviciosBarberos[id]) {
      cargarServiciosBarbero(id);
    }
  };

  const handleSelectDay = (iso) => {
    console.log("📅 Día seleccionado:", iso);
    setFecha(iso);
    setHora("");
  };

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
    // Resetear referencia de semana para forzar recarga
    prevWeekStartRef.current = "";
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
    // Resetear referencia de semana para forzar recarga
    prevWeekStartRef.current = "";
  };

  const reservarComoInvitado = async () => {
    if (Object.values(invitado).some((v) => !v)) {
      return Swal.fire("Error", "Completa tus datos", "warning");
    }

    if (!servicio || !barbero || !fecha || !hora) {
      return Swal.fire("Error", "Completa todos los pasos", "warning");
    }

    setReservando(true);
    try {
      // 👇 CORRECCIÓN: pasar slug y payload por separado
      await postReservarHoraInvitado(slug, {
        servicio,
        barbero,
        fecha,
        hora,
        nombre: invitado.nombre, // ← Sacar del objeto invitado
        apellido: invitado.apellido, // ← Sacar del objeto invitado
        rut: invitado.rut, // ← Sacar del objeto invitado
        email: invitado.email, // ← Sacar del objeto invitado
        telefono: invitado.telefono, // ← Sacar del objeto invitado
      });
      Swal.fire("Reserva creada", "Tu hora fue agendada", "success");

      // Resetear formulario después de reservar exitosamente
      setServicio("");
      setBarbero("");
      setFecha("");
      setHora("");
      setInvitado({
        nombre: "",
        apellido: "",
        rut: "",
        telefono: "",
        email: "",
      });
    } catch (e) {
      console.error("Error al reservar:", e);
      Swal.fire(
        "Error",
        e?.response?.data?.message || "No se pudo reservar",
        "error",
      );
    } finally {
      setReservando(false);
    }
  };
  // ────────────────────────────────
  // EXPORT
  // ────────────────────────────────
  return {
    // data
    servicios,
    barberos,
    barberosFiltrados,
    serviciosBarberos,
    horasDisponibles,
    mensajeHoras,
    horasDataCompleta,

    servicio,
    barbero,
    fecha,
    hora,
    invitado,

    loadingServicios,
    loadingBarberos,
    cargandoHoras,
    reservando,
    pasoActual,
    duracionServicio,

    // 📅 datos de la semana
    weekStart,
    weekDays,
    loadingWeek,

    // actions
    setInvitado,
    setHora,
    handleSeleccionarServicio,
    handleSeleccionarBarbero,
    handleSelectDay,
    prevWeek,
    nextWeek,
    reservarComoInvitado,
    cargarServiciosBarbero,
  };
};

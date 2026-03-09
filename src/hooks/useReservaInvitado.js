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
  const [diasPermitidos, setDiasPermitidos] = useState(15);

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
      if (fetchingWeekRef.current) return;

      const dates = buildWeekDates(startDate);
      const weekStartKey = isoDate(startDate);

      if (
        prevBarberoRef.current === barberoId &&
        prevServicioRef.current === serviceId &&
        prevWeekStartRef.current === weekStartKey
      ) {
        return;
      }

      if (!barberoId || !serviceId) {
        setWeekDays(
          dates.map((d) => ({
            date: d,
            label: formatDayLabel(d),
            iso: isoDate(d),
            available: false,
            horas: [],
            mensaje: !barberoId
              ? "Selecciona un barbero"
              : "Selecciona un servicio",
          })),
        );
        return;
      }

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

              return {
                horas: Array.isArray(response?.horas) ? response.horas : [],
                esFeriado: response?.esFeriado || false,
                nombreFeriado: response?.nombreFeriado || "",
                diasPermitidos: response?.diasPermitidos ?? null,
              };
            } catch (error) {
              console.error(`Error en fecha ${isoDate(d)}:`, error);
              return {
                horas: [],
                esFeriado: false,
                nombreFeriado: "",
                diasPermitidos: null,
              };
            }
          }),
        );

        // ✅ Leer diasPermitidos del primer resultado que lo traiga
        const dp =
          results.find((r) => r?.diasPermitidos != null)?.diasPermitidos ?? 15;
        setDiasPermitidos(dp);

        setWeekDays(
          dates.map((d, idx) => {
            const data = results[idx] || { horas: [] };
            const horas = Array.isArray(data.horas) ? data.horas : [];
            const horasDisponibles = horas.filter(
              (h) => h?.estado === "disponible",
            );

            return {
              date: d,
              label: formatDayLabel(d),
              iso: isoDate(d),
              available: horasDisponibles.length > 0,
              horas,
              esFeriado: data.esFeriado || false,
              nombreFeriado: data.nombreFeriado || "",
              mensaje:
                horas.length === 0
                  ? "No disponible"
                  : horasDisponibles.length === 0
                    ? "Sin horas libres"
                    : "",
            };
          }),
        );

        prevBarberoRef.current = barberoId;
        prevServicioRef.current = serviceId;
        prevWeekStartRef.current = weekStartKey;
      } catch (error) {
        console.error("Error cargando disponibilidad semanal:", error);
        setWeekDays(
          dates.map((d) => ({
            date: d,
            label: formatDayLabel(d),
            iso: isoDate(d),
            available: false,
            horas: [],
            mensaje: "Error al cargar",
          })),
        );
      } finally {
        setLoadingWeek(false);
        fetchingWeekRef.current = false;
      }
    },
    [buildWeekDates, formatDayLabel, isoDate],
  );

  // ────────────────────────────────
  // EFECTO PARA CARGAR SEMANA
  // ────────────────────────────────
  useEffect(() => {
    if (!servicio || !barbero) {
      const dates = buildWeekDates(weekStart);
      setWeekDays(
        dates.map((d) => ({
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
        })),
      );
      return;
    }

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
    setServicio(id);
    setBarbero("");
    setFecha("");
    setHora("");
    setWeekStart(new Date());
    prevBarberoRef.current = "";
    prevServicioRef.current = "";
    prevWeekStartRef.current = "";

    barberos.forEach((b) => {
      cargarServiciosBarbero(b._id);
    });
  };

  const handleSeleccionarBarbero = (id) => {
    setBarbero(id);
    setFecha("");
    setHora("");
    setWeekStart(new Date());
    prevBarberoRef.current = "";
    prevServicioRef.current = "";
    prevWeekStartRef.current = "";

    if (!serviciosBarberos[id]) {
      cargarServiciosBarbero(id);
    }
  };

  const handleSelectDay = (iso) => {
    setFecha(iso);
    setHora("");
  };

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
    prevWeekStartRef.current = "";
  };

  const nextWeek = () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const limiteDate = new Date(hoy);
    limiteDate.setDate(hoy.getDate() + diasPermitidos);

    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);

    if (d > limiteDate) return;

    setWeekStart(d);
    prevWeekStartRef.current = "";
  };

  // ────────────────────────────────
  // RESERVAR COMO INVITADO
  // ────────────────────────────────
  const reservarComoInvitado = async () => {
    if (Object.values(invitado).some((v) => !v)) {
      return Swal.fire("Error", "Completa tus datos", "warning");
    }

    if (!servicio || !barbero || !fecha || !hora) {
      return Swal.fire("Error", "Completa todos los pasos", "warning");
    }

    setReservando(true);
    try {
      const { data: respuesta } = await postReservarHoraInvitado(slug, {
        servicio,
        barbero,
        fecha,
        hora,
        nombre: invitado.nombre,
        apellido: invitado.apellido,
        rut: invitado.rut,
        email: invitado.email,
        telefono: invitado.telefono,
      });

      // ✅ Si requiere abono, mostrar datos de transferencia
      if (respuesta?.abono?.requerido && respuesta?.datosPago) {
        const { banco, tipoCuenta, numeroCuenta, titular, rut, correo } =
          respuesta.datosPago;
        const monto = respuesta.abono.monto;

        await Swal.fire({
          title: "✅ Reserva creada",
          icon: "success",
          html: `
  <p style="color:#6c757d; font-size:0.95rem; margin-bottom:16px">
    Tu hora fue agendada. Para confirmarla, transfiere el abono a:
  </p>

  <div style="background:#f8f9fa; border-radius:12px; padding:16px; text-align:left">
    
    <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #e9ecef">
      <span style="color:#6c757d; font-size:0.85rem">Monto</span>
      <span style="font-weight:700; color:#2dce89; font-size:1.1rem">$${monto.toLocaleString("es-CL")}</span>
    </div>

    <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #e9ecef">
      <span style="color:#6c757d; font-size:0.85rem">Banco</span>
      <span style="font-weight:600; font-size:0.9rem">${banco}</span>
    </div>

    <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #e9ecef">
      <span style="color:#6c757d; font-size:0.85rem">Tipo cuenta</span>
      <span style="font-weight:600; font-size:0.9rem">${tipoCuenta}</span>
    </div>

    <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #e9ecef">
      <span style="color:#6c757d; font-size:0.85rem">N° cuenta</span>
      <span style="font-weight:600; font-size:0.9rem">${numeroCuenta}</span>
    </div>

    <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #e9ecef">
      <span style="color:#6c757d; font-size:0.85rem">Titular</span>
      <span style="font-weight:600; font-size:0.9rem">${titular}</span>
    </div>

    <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #e9ecef">
      <span style="color:#6c757d; font-size:0.85rem">RUT</span>
      <span style="font-weight:600; font-size:0.9rem">${rut}</span>
    </div>

    <div style="display:flex; justify-content:space-between; padding:8px 0">
      <span style="color:#6c757d; font-size:0.85rem">Correo</span>
      <span style="font-weight:600; font-size:0.9rem; word-break:break-all">${correo}</span>
    </div>

  </div>

  <div style="background:#fff3cd; border-radius:8px; padding:12px 16px; margin-top:12px; display:flex; align-items:center; gap:10px; text-align:left">
    <span style="font-size:1.2rem">📱</span>
    <span style="font-size:0.85rem; color:#856404">
      Envía el comprobante al <b> ${respuesta.datosPago.telefonoEmpresa || ""}</b>
    </span>
  </div>
`,
          confirmButtonText: "Entendido",
        });
      } else {
        await Swal.fire(
          "Reserva creada",
          "Tu hora fue agendada, te enviaremos un correo confirmando tu reserva.",
          "success",
        );
      }

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
    diasPermitidos,

    loadingServicios,
    loadingBarberos,
    cargandoHoras,
    reservando,
    pasoActual,
    duracionServicio,

    weekStart,
    weekDays,
    loadingWeek,

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

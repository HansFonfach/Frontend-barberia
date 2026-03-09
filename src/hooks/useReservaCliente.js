// src/hooks/useReservaCliente.js
import { useState, useContext, useEffect, useCallback } from "react";
import Swal from "sweetalert2";

// Contextos
import { useAuth } from "context/AuthContext";
import { useReserva } from "context/ReservaContext";
import ServiciosContext from "context/ServiciosContext";
import { useUsuario } from "context/usuariosContext";
import { useHorario } from "context/HorarioContext";
import { useHorasDisponibles } from "hooks/useHorasDisponibles";
import { useNavigate } from "react-router-dom";

export const useReservaCliente = () => {
  // ────────────────────────────────
  // USUARIO LOGUEADO
  // ────────────────────────────────
  const { user } = useAuth();

  // ────────────────────────────────
  // ESTADOS BÁSICOS
  // ────────────────────────────────
  const [fecha, setFecha] = useState("");
  const [barbero, setBarbero] = useState("");
  const [hora, setHora] = useState("");
  const [servicio, setServicio] = useState("");
  const [pasoActual, setPasoActual] = useState(1);
  const [reservando, setReservando] = useState(false);
  const [diasPermitidos, setDiasPermitidos] = useState(15);

  const [suscripcion, setSuscripcion] = useState(null);

  // ────────────────────────────────
  // SEMANA
  // ────────────────────────────────
  const [weekStart, setWeekStart] = useState(new Date());
  const [weekDays, setWeekDays] = useState([]);
  const [loadingWeek, setLoadingWeek] = useState(false);
  const navigate = useNavigate();

  // ────────────────────────────────
  // CONTEXTOS
  // ────────────────────────────────
  const {
    servicios,
    serviciosBarberos,
    cargarServiciosBarbero,
    loadingServicios,
  } = useContext(ServiciosContext);

  const { barberos, getSuscripcionActiva } = useUsuario();
  const { postReservarHora } = useReserva();
  const { getHorasDisponiblesBarbero } = useHorario();

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

  const calcularServiciosReserva = (duracion) => {
    return duracion >= 120 ? 2 : 1;
  };

  const serviciosReserva = servicio
    ? calcularServiciosReserva(duracionServicio)
    : 0;

  const serviciosRestantes = suscripcion
    ? Math.max(0, suscripcion.serviciosTotales - suscripcion.serviciosUsados)
    : 0;

  const excedente = suscripcion
    ? Math.max(0, serviciosReserva - serviciosRestantes)
    : 0;

  const nuevosUsados = suscripcion
    ? suscripcion.serviciosUsados + serviciosReserva
    : 0;

  // ────────────────────────────────
  // HORAS DISPONIBLES
  // ────────────────────────────────
  const {
    horas: horasDisponibles,
    mensaje: mensajeHoras,
    cargando: cargandoHoras,
    dataCompleta: horasDataCompleta,
  } = useHorasDisponibles(barbero, fecha, servicio, getHorasDisponiblesBarbero);

  // ────────────────────────────────
  // CONTROL DE PASOS (CLIENTE)
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
  // FILTRAR BARBEROS SEGÚN SERVICIO
  // ────────────────────────────────
  const barberosFiltrados = servicio
    ? barberos.filter((b) => {
        const serviciosB = serviciosBarberos[b._id] || [];
        return serviciosB.some((s) => {
          const servicioId = s.servicioId?._id || s.servicioId;
          return String(servicioId) === String(servicio);
        });
      })
    : [];

  useEffect(() => {
    if (!user?.id) return;

    const cargarSuscripcion = async () => {
      const sus = await getSuscripcionActiva().catch(() => null);
      setSuscripcion(sus);
    };

    cargarSuscripcion();
  }, [user?.id]);

  // ────────────────────────────────
  // CARGAR SERVICIOS POR BARBERO
  // ────────────────────────────────
  useEffect(() => {
    if (!servicio) return;

    barberos.forEach((b) => {
      if (!serviciosBarberos[b._id]) {
        cargarServiciosBarbero(b._id);
      }
    });
  }, [servicio, barberos, serviciosBarberos, cargarServiciosBarbero]);

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
  // CARGAR DISPONIBILIDAD SEMANAL
  // ────────────────────────────────
  const fetchWeekAvailability = useCallback(
    async (barberoId, serviceId, startDate) => {
      const dates = buildWeekDates(startDate);

      // ⛔ Sin barbero o servicio → semana bloqueada
      if (!barberoId || !serviceId) {
        setWeekDays(
          dates.map((d) => ({
            date: d,
            label: formatDayLabel(d),
            iso: isoDate(d),
            available: false,
            horas: [],
            mensaje: "Selecciona servicio y barbero",
          })),
        );
        return;
      }

      setLoadingWeek(true);

      try {
        const results = await Promise.all(
          dates.map((d) =>
            getHorasDisponiblesBarbero(barberoId, isoDate(d), serviceId).catch(
              () => ({ horas: [] }),
            ),
          ),
        );

        // ✅ Leer diasPermitidos ANTES del setWeekDays, fuera del map
        const dp =
          results.find((r) => r?.diasPermitidos != null)?.diasPermitidos ?? 15;
        setDiasPermitidos(dp);

        setWeekDays(
          dates.map((d, idx) => {
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
          }),
        );
      } finally {
        setLoadingWeek(false);
      }
    },
    [buildWeekDates, getHorasDisponiblesBarbero],
  );

  useEffect(() => {
    if (!servicio || !barbero) return;
    fetchWeekAvailability(barbero, servicio, weekStart);
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
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const limiteDate = new Date(hoy);
    limiteDate.setDate(hoy.getDate() + diasPermitidos); // ✅ usa el estado

    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);

    if (d > limiteDate) return;

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
  // RESERVAR (CLIENTE)
  // ────────────────────────────────
  const handleReservar = async () => {
    if (!user || !servicio || !barbero || !fecha || !hora) {
      Swal.fire("Error", "Completa todos los pasos", "error");
      return;
    }

    setReservando(true);

    try {
      const respuesta = await postReservarHora(
        fecha,
        barbero,
        hora,
        servicio,
        user.id,
      );

      // ✅ Si la reserva requiere abono, mostrar datos de pago
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
      Envía el comprobante al <b>+569 ${respuesta.datosPago.telefonoEmpresa || ""}</b>
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

      setHora("");
      navigate(`/${user.empresa.slug}/admin/administrar-reservas`);
    } catch (error) {
      Swal.fire(
        "Error",
        error?.response?.data?.message || "No se pudo reservar",
        "error",
      );
    } finally {
      setReservando(false);
    }
  };

  // ────────────────────────────────
  // API PÚBLICA
  // ────────────────────────────────
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
    weekDays,
    loadingWeek,

    servicios,
    barberos,
    barberosFiltrados,
    loadingServicios,

    horasDisponibles,
    mensajeHoras,
    cargandoHoras,
    horasDataCompleta,
    duracionServicio,
    diasPermitidos,

    handleSelectDay,
    prevWeek,
    nextWeek,
    handleReservar,
    handleSeleccionarServicio,
    handleSeleccionarBarbero,

    suscripcion,
    serviciosReserva,
    serviciosRestantes,
    excedente,
    nuevosUsados,
  };
};

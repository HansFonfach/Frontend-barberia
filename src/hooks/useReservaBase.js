import { useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ServiciosContext from "context/ServiciosContext";
import { useUsuario } from "context/usuariosContext";
import { useHorario } from "context/HorarioContext";
import { useHorasDisponibles } from "hooks/useHorasDisponibles";

export const useReservaBase = () => {
  const navigate = useNavigate();

  const [fecha, setFecha] = useState("");
  const [barbero, setBarbero] = useState("");
  const [hora, setHora] = useState("");
  const [servicio, setServicio] = useState("");
  const [pasoActual, setPasoActual] = useState(1);
  const [reservando, setReservando] = useState(false);

  const [weekStart, setWeekStart] = useState(new Date());
  const [weekDays, setWeekDays] = useState([]);
  const [loadingWeek, setLoadingWeek] = useState(false);

  const {
    servicios,
    serviciosBarberos,
    cargarServiciosBarbero,
    loadingServicios,
  } = useContext(ServiciosContext);

  const { barberos } = useUsuario();
  const { getHorasDisponiblesBarbero } = useHorario();

  // Duración servicio
  const duracionServicio = (() => {
    if (!barbero || !servicio) return 60;
    const serviciosB = serviciosBarberos[barbero] || [];
    const svc = serviciosB.find(
      (s) => String(s.servicioId?._id || s.servicioId) === String(servicio)
    );
    return svc?.duracion || 60;
  })();

  const {
    horas: horasDisponibles,
    mensaje: mensajeHoras,
    cargando: cargandoHoras,
    dataCompleta: horasDataCompleta,
  } = useHorasDisponibles(barbero, fecha, servicio, getHorasDisponiblesBarbero);

  return {
    // estados
    fecha,
    barbero,
    hora,
    servicio,
    pasoActual,
    reservando,

    weekStart,
    weekDays,
    loadingWeek,

    servicios,
    barberos,
    loadingServicios,

    horasDisponibles,
    mensajeHoras,
    cargandoHoras,
    horasDataCompleta,
    duracionServicio,

    // setters
    setFecha,
    setBarbero,
    setHora,
    setServicio,
    setWeekStart,
    setReservando,

    navigate,
  };
};

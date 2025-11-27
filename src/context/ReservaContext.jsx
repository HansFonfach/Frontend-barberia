// ReservaContext.jsx
import { createContext, useContext, useState } from "react";
import {
  getReservasByUserId,
  reservarHora,
  postCancelarReserva,
  getReservasDiariasByBarberId,
  getReservasActivas,
  getResevasPorFecha,
} from "../api/reservas";

const ReservaContext = createContext();

export const useReserva = () => {
  const context = useContext(ReservaContext);
  if (!context)
    throw new Error("useReserva must be used within a ReservaProvider");
  return context;
};

export const ReservaProvider = ({ children }) => {
  const [reservas, setReservas] = useState([]);
  const [reservaActual, setReservaActual] = useState(null);
  const [barberos, setBarberos] = useState([]);
  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  //const { user } = useAuth();
  // const [mensajeHoras, setMensajeHoras] = useState("");

  const getAllReservasByUser = async (id) => {
    try {
      const res = await getReservasByUserId(id);
      setReservas(res.data);
      return res.data;
    } catch (error) {
      console.error("Error al obtener las reservas", error);
      return [];
    }
  };

  const getReservasDiaByBarber = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getReservasDiariasByBarberId();
      setReservas(res.data.reservas || []);
    } catch (err) {
      setError("No se pudieron cargar las reservas");
    } finally {
      setLoading(false);
    }
  };

  const postReservarHora = async (fecha, barbero, hora, servicio, usuario) => {
    if (!barbero || !fecha || !usuario || !servicio || !hora) {
      console.warn("Faltan datos para reservar la hora");
      setError("Faltan datos para reservar la hora");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await reservarHora(fecha, barbero, hora, servicio, usuario);

      setReservas((prev) => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error("Error al reservar la hora", err);

      // Guardo mensaje de error local si quieres
      setError(err?.response?.data?.message || "No se pudo reservar la hora.");

      // 🚨 **ESTE ES EL CAMBIO IMPORTANTE**
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getReservasPorFechaBarbero = async (fecha) => {
    setLoading(true);
    setError(null);
    try {
      // Llamas a un endpoint que acepte fecha opcional
      const res = await getResevasPorFecha(fecha);
      setReservas(res.data.reservas || []);
    } catch (err) {
      console.error("Error al obtener reservas por fecha:", err);
      setError("No se pudieron cargar las reservas");
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  const cancelarReserva = async (idReserva) => {
    if (!idReserva) {
      console.warn("No se ha podido cancelar su reserva. Intenta nuevamente");
      setError("No se ha podido cancelar su reserva. Intenta nuevamente.");
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await postCancelarReserva(idReserva);
      return res.data;
    } catch (err) {
      console.error("Error al cancelar la hora", err);
      setError("No se pudo cancelar la hora. Intenta nuevamente.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reservasActivas = async (userId) => {
    try {
      const res = await getReservasActivas(userId);
      return res.data;
    } catch (err) {
      console.error("Error al obtener la reservas activas", err);
      setError("No se pudo obtener las reservas activas.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReservaContext.Provider
      value={{
        reservas,
        reservaActual,
        barberos,
        horasDisponibles,
        loading,
        error,
        getAllReservasByUser,
        setReservaActual,
        postReservarHora,
        cancelarReserva,
        getReservasDiaByBarber,
        reservasActivas,
        getReservasPorFechaBarbero,
      }}
    >
      {children}
    </ReservaContext.Provider>
  );
};

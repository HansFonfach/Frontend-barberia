import { createContext, useContext, useState } from "react";
import axios from "axios";
import { postCrearNotificacion } from "api/notificaciones";

const NotificacionContext = createContext();

export const NotificacionProvider = ({ children }) => {
  const [notificaciones, setNotificaciones] = useState([]);

  const obtenerNotificaciones = async () => {
    const { data } = await axios.get("/api/notificaciones");
    setNotificaciones(data);
  };

const crearNotificacion = async ({ fecha, horas, barberoId, usuarioId }) => {
  try {
    const res = await postCrearNotificacion(fecha, horas, barberoId, usuarioId);
    console.log("✅ Estoy en el context:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Error en crearNotificacion:", error.response?.data || error.message);
    throw error;
  }
};

  return (
    <NotificacionContext.Provider
      value={{ notificaciones, crearNotificacion, obtenerNotificaciones }}
    >
      {children}
    </NotificacionContext.Provider>
  );
};

export const useNotificacion = () => useContext(NotificacionContext);

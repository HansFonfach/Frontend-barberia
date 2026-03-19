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
  const crearNotificacion = async ({
    fecha,
    hora,
    horas,
    barberoId,
    usuarioId,
    emailInvitado, // ← faltaba
    esInvitado, // ← faltaba
  }) => {
    try {
      const payload = {
        fecha,
        barberoId,
        ...(hora ? { hora } : {}),
        ...(horas ? { horas } : {}),
        ...(usuarioId ? { usuarioId } : {}),
        ...(esInvitado ? { esInvitado: true, emailInvitado } : {}),
      };

      const res = await postCrearNotificacion(payload);
      return res.data;
    } catch (error) {
      console.error(
        "❌ Error en crearNotificacion:",
        error.response?.data || error.message,
      );
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

// context/UsuarioContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { getUsuarios } from "api/usuarios";
import { useAuth } from "context/AuthContext"; // Importar useAuth
import { putUsuario } from "api/usuarios";
import { getUsuarioByRut } from "api/usuarios";
import { postSubscribeUserById } from "api/usuarios";
import { putUnsubscribeUserById } from "api/usuarios";
import { getTodosLosUsuarios } from "api/usuarios";
import { getSubActiva } from "api/usuarios";
import { getVerMisPuntos } from "api/usuarios";

const UsuarioContext = createContext();

export const useUsuario = () => {
  const context = useContext(UsuarioContext);
  if (!context)
    throw new Error("useUsuario must be used within a UsuarioProvider");
  return context;
};

export const UsuarioProvider = ({ children }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [errors, setErrors] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [suscripcionActiva, setSuscripcionActiva] = useState(null);
  const [suscripcionLista, setSuscripcionLista] = useState(false); // 👈 NUEVO
  const [puntos, setPuntos] = useState(0);

  const { isAuthenticated, user } = useAuth(); // Usar el contexto de auth

  // dentro de UsuarioProvider
  const getAllUsers = async () => {
    try {
      setCargando(true);
      const res = await getTodosLosUsuarios();
      setUsuarios(res.data.usuarios); // ✅ accedemos al array real
      setBarberos(res.data.usuarios.filter((u) => u.rol === "barbero"));
      setErrors(null);
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
      setErrors(error.response?.data || error.message);
    } finally {
      setCargando(false);
    }
  };

  const getBarberosDisponibles = async () => {
    try {
      const res = await getUsuarios();
      setBarberos(res.data.filter((u) => u.rol === "barbero"));
    } catch (error) {
      console.error("Error al obtener los barberos:", error);
      setErrors(error.response?.data || error.message);
    }
  };

  const updateUser = async (id, data) => {
    try {
      const res = await putUsuario(id, data);
      console.log(res.data.message); // "Usuario actualizado correctamente"
      setErrors(null);
    } catch (error) {
      console.error("Error al actualizar al usuario", error);
      setErrors(error.response?.data || error.message);
    }
  };
  const subscribeUser = async (_id) => {
    try {
      const res = await postSubscribeUserById(_id);
      setErrors(null);
      return res.data;
    } catch (error) {
      const err = error.response?.data || { message: error.message };
      setErrors(err);
      throw err;
    }
  };

  const unsubscribeUser = async (_id) => {
    try {
      const res = await putUnsubscribeUserById(_id);
      setErrors(null);
      return res.data;
    } catch (error) {
      const err = error.response?.data || { message: error.message };
      setErrors(err);
      throw err;
    }
  };
  const getSuscripcionActiva = async () => {
    try {
      const res = await getSubActiva();
      setErrors(null);

      setSuscripcionActiva(res.data || null);
      setSuscripcionLista(true); // 👈 AHORA SÍ

      return res.data;
    } catch (error) {
      const err = error.response?.data || { message: error.message };
      setErrors(err);

      setSuscripcionActiva(null);
      setSuscripcionLista(true); // 👈 IMPORTANTE también en error

      throw err;
    }
  };

  // En tu context - agrega más logs
  const getUserByRut = async (rut) => {
    try {
      const res = await getUsuarioByRut(rut);

      return res.data;
    } catch (error) {
      console.error("💥 Error en getUserByRut:", error);
      console.error("📋 Detalles del error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      setErrors(error.response?.data || error.message);
      return null;
    }
  };

  // Recargar usuarios cuando la autenticación cambie
  useEffect(() => {
    const fetchData = async () => {
      // Solo cargar datos si está autenticado y hay un usuario
      if (isAuthenticated && user) {
        try {
          setCargando(true);
          const res = await getUsuarios();
          setUsuarios(res.data);
          setBarberos(res.data.filter((u) => u.rol === "barbero"));
          setErrors(null);
        } catch (error) {
          console.error("Error al cargar datos:", error);
          setErrors(error.response?.data || error.message);
        } finally {
          setCargando(false);
        }
      } else {
        // Si no está autenticado, limpiar los datos
        setUsuarios([]);
        setBarberos([]);
        setCargando(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user]); // Dependencias: cuando auth o user cambien

  const getVerPuntos = async () => {
    if (!isAuthenticated) return;

    try {
      setCargando(true);
      const res = await getVerMisPuntos();

      console.log("🟢 Puntos desde backend:", res.data.puntos);

      setPuntos(res.data.puntos);
      setErrors(null);
    } catch (error) {
      console.error("🔴 Error al obtener los puntos:", error);
      setErrors(error.response?.data || error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <UsuarioContext.Provider
      value={{
        usuarios,
        barberos,
        errors,
        cargando,
        puntos,
        suscripcionActiva,
        suscripcionLista,
        updateUser,
        getAllUsers,
        getBarberosDisponibles,
        getUserByRut,
        subscribeUser,
        unsubscribeUser,
        getSuscripcionActiva,
        getVerPuntos,
      }}
    >
      {children}
    </UsuarioContext.Provider>
  );
};

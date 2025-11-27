// context/UsuarioContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { getUsuarios } from "api/usuarios";
import { useAuth } from "context/AuthContext"; // Importar useAuth
import { putUsuario } from "api/usuarios";
import { getUsuarioByRut } from "api/usuarios";
import { postSubscribeUserById } from "api/usuarios";
import { putUnsubscribeUserById } from "api/usuarios";

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

  const { isAuthenticated, user } = useAuth(); // Usar el contexto de auth

  const getAllUsers = async () => {
    try {
      setCargando(true);
      const res = await getUsuarios();
      setUsuarios(res.data);
      setBarberos(res.data.filter((u) => u.rol === "barbero"));
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

  // En tu context - agrega más logs
  const getUserByRut = async (rut) => {
    try {
      console.log("🌐 Haciendo request a API con RUT:", rut);
      const res = await getUsuarioByRut(rut);
      console.log("📡 Respuesta de API:", res);
      console.log("📊 Datos del usuario:", res.data);
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

  return (
    <UsuarioContext.Provider
      value={{
        usuarios,
        barberos,
        errors,
        cargando,
        updateUser,
        getAllUsers,
        getBarberosDisponibles,
        getUserByRut,
        subscribeUser,
        unsubscribeUser,
      }}
    >
      {children}
    </UsuarioContext.Provider>
  );
};

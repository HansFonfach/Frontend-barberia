import { createContext, useContext, useEffect, useState } from "react";
import {
  verifyRequest,
  loginRequest,
  registerRequest,
  forgotPasswordRequest,
  updateUserPasswordRequest,
} from "api/auth";
import { useNavigate } from "react-router-dom";
import { setupAxiosInterceptors } from "api/axiosPrivate";
import Swal from "sweetalert2";

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState(null);
  const navigate = useNavigate();

  // Guardar token en localStorage y sessionStorage como fallback
  const saveToken = (token) => {
    if (token) {
      localStorage.setItem("token", token);
      sessionStorage.setItem("token", token);
    }
  };

  // Cerrar sesión: limpia cookie y almacenamiento local
  const signOut = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include", // limpia cookie en backend
      });
    } catch (err) {
      console.log("Error logout:", err);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      setUser(null);
      setIsAuthenticated(false);
      navigate("/login");
    }
  };

  // Verificar sesión al iniciar
  // AuthContext corregido
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await verifyRequest();
        setUser(res.data.usuario);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(res.data.usuario));
      } catch (err) {
        console.log("Error verificando sesión:", err);
        // NO llamar a signOut() automáticamente
        // En su lugar, mantener el usuario de localStorage si existe
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } else {
          // Solo limpiar si realmente no hay usuario
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  // LOGIN
  const signIn = async (credentials) => {
    try {
      const res = await loginRequest(credentials);
      const usuario = res.data.user;

      if (res.data.token) saveToken(res.data.token);

      localStorage.setItem("user", JSON.stringify(usuario));
      setUser(usuario);
      setIsAuthenticated(true);
      setErrors(null);

      return res.data;
    } catch (error) {
      setErrors(error.response?.data || "Error desconocido");
      throw error;
    }
  };

  // REGISTER
  const register = async (data) => {
    try {
      const res = await registerRequest(data);
      const usuario = res.data.user;

      if (res.data.token) saveToken(res.data.token);

      localStorage.setItem("user", JSON.stringify(usuario));
      setUser(usuario);
      setIsAuthenticated(true);
      setErrors(null);

      return res.data;
    } catch (error) {
      setErrors(error.response?.data || "Error desconocido");
      throw error;
    }
  };

  // OLVIDÉ MI CONTRASEÑA
  const forgotPassword = async (email) => {
    try {
      const res = await forgotPasswordRequest(email);
      return res.data;
    } catch (error) {
      setErrors(error.response?.data || "Error desconocido");
      throw error;
    }
  };

  // CAMBIO DE CONTRASEÑA
  const updatePassword = async (id, currentPassword, newPassword) => {
    try {
      const res = await updateUserPasswordRequest(
        id,
        currentPassword,
        newPassword
      );
      return res.data;
    } catch (error) {
      setErrors(error.response?.data || "Error desconocido");
      throw error;
    }
  };

  // Configurar interceptores de Axios
  useEffect(() => {
    setupAxiosInterceptors(signOut);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        errors,
        signIn,
        signOut,
        register,
        forgotPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

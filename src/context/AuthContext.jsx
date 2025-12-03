import { createContext, useContext, useEffect, useState, useCallback } from "react";
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
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const navigate = useNavigate();

  // Guardar token en localStorage y sessionStorage como fallback
  const saveToken = (token) => {
    if (token) {
      localStorage.setItem("token", token);
      sessionStorage.setItem("token", token);
    }
  };

  // Cerrar sesión
  const signOut = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.log("Error logout:", err);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      setUser(null);
      setIsAuthenticated(false);
      setInitialCheckDone(true);
      navigate("/login");
    }
  };

  // Función para verificar sesión que se puede llamar desde fuera
  const verifySession = useCallback(async () => {
    try {
      const res = await verifyRequest();
      setUser(res.data.usuario);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(res.data.usuario));
      return res.data.usuario;
    } catch (err) {
      console.log("Error verificando sesión:", err);
      
      // Si hay error 401 (no autorizado), mantener usuario local
      if (err.response?.status === 401) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          return parsedUser;
        }
      }
      
      // Si no hay usuario almacenado
      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);
      return null;
    } finally {
      setLoading(false);
      setInitialCheckDone(true);
    }
  }, []);

  // Verificar sesión al iniciar
  useEffect(() => {
    verifySession();
  }, [verifySession]);

  // LOGIN
  const signIn = async (credentials) => {
    try {
      setLoading(true);
      const res = await loginRequest(credentials);
      const usuario = res.data.user;

      if (res.data.token) saveToken(res.data.token);

      // Esperar un momento para que la cookie se establezca
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verificar sesión inmediatamente después del login
      const verifiedUser = await verifySession();
      
      if (verifiedUser) {
        localStorage.setItem("user", JSON.stringify(verifiedUser));
        setUser(verifiedUser);
        setIsAuthenticated(true);
        setErrors(null);
      }

      return { ...res.data, user: verifiedUser || usuario };
    } catch (error) {
      setErrors(error.response?.data || "Error desconocido");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // REGISTER
  const register = async (data) => {
    try {
      setLoading(true);
      const res = await registerRequest(data);
      const usuario = res.data.user;

      if (res.data.token) saveToken(res.data.token);

      // Esperar un momento para que la cookie se establezca
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verificar sesión después del registro
      const verifiedUser = await verifySession();
      
      if (verifiedUser) {
        localStorage.setItem("user", JSON.stringify(verifiedUser));
        setUser(verifiedUser);
        setIsAuthenticated(true);
        setErrors(null);
      }

      return { ...res.data, user: verifiedUser || usuario };
    } catch (error) {
      setErrors(error.response?.data || "Error desconocido");
      throw error;
    } finally {
      setLoading(false);
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
        initialCheckDone, // Exportamos este estado
        errors,
        signIn,
        signOut,
        register,
        forgotPassword,
        updatePassword,
        verifySession, // Exportamos la función para verificar
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
import { createContext, useContext, useEffect, useState } from "react";
import { verifyRequest, loginRequest, registerRequest } from "api/auth";
import { useNavigate } from "react-router-dom";
import { setupAxiosInterceptors } from "api/axiosPrivate";
import { forgotPasswordRequest } from "api/auth";
import { updateUserPasswordRequest } from "api/auth";

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

  // ✅ Función para guardar token (maneja ambos métodos)
  const saveToken = (token) => {
    if (token) {
      localStorage.setItem("token", token);
      // También podrías guardarlo en sessionStorage como fallback
      sessionStorage.setItem("token", token);
    }
  };

  // Verificar sesión al iniciar
  useEffect(() => {
    // En el verifySession del AuthContext
    const verifySession = async () => {
      try {
        const res = await verifyRequest();
        setUser(res.data.usuario);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(res.data.usuario));
      } catch (error) {
        console.warn("Sesión inválida o expirada");
        // ✅ SOLO cerrar sesión silenciosamente, sin alertas
        signOut();
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

      // ✅ Guardar token de fallback si viene en la respuesta
      if (res.data.token) {
        saveToken(res.data.token);
      }

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

      // ✅ Guardar token de fallback si viene en la respuesta
      if (res.data.token) {
        saveToken(res.data.token);
      }

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

  const forgotPassword = async (email) => {
    try {
      const res = await forgotPasswordRequest(email);
      return res.data;
    } catch (error) {
      setErrors(error.response?.data || "Error desconocido");
      throw error;
    }
  };

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

  // LOGOUT
  const signOut = async () => {
    try {
      // Limpiar backend
      await fetch(`${process.env.REACT_APP_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.log("Error en logout:", error);
    } finally {
      // Limpiar frontend completamente
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      setUser(null);
      setIsAuthenticated(false);
      navigate("/login");
    }
  };

  // Configurar interceptores
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

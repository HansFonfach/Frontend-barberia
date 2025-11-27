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

  // Verificar sesión al iniciar
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await verifyRequest();
        setUser(res.data.usuario);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(res.data.usuario));
      } catch (error) {
        console.warn("Sesión inválida o expirada:", error.response?.data);
        signOut();
      } finally {
        setLoading(false);
      }
    };

    verifySession(); // ✅ Siempre verificar, el token está en cookies
  }, []);

  // LOGIN
  const signIn = async (credentials) => {
    try {
      const res = await loginRequest(credentials);
      const usuario = res.data.user;

      // ✅ SOLO guardar usuario, NO token (está en cookies)
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

      // ✅ SOLO guardar usuario, NO token
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
      const res = await updateUserPasswordRequest(id, currentPassword, newPassword);
      return res.data;
    } catch (error) {
      setErrors(error.response?.data || "Error desconocido");
      throw error;
    }
  };

  // LOGOUT - también limpiar cookie en backend
  const signOut = async () => {
    try {
      // Llamar al backend para limpiar la cookie
      await fetch(`${process.env.REACT_APP_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.log("Error en logout:", error);
    } finally {
      // Limpiar frontend
      localStorage.removeItem("user");
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
        updatePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
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
    // Solo leer al inicio, después solo usamos el estado
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const navigate = useNavigate();

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
      setUser(null);
      setIsAuthenticated(false);
      setInitialCheckDone(true);
      navigate("/");
    }
  };

  // 🔍 Verificar sesión - MÁS ROBUSTO
  const verifySession = useCallback(async () => {
    // Si no hay token en localStorage, no intentar verificar
    if (!localStorage.getItem("token")) {
      setLoading(false);
      setInitialCheckDone(true);
      return null;
    }

    try {
      const res = await verifyRequest();
      setUser(res.data);
      setIsAuthenticated(true);
      // Actualizar localStorage con datos frescos
      localStorage.setItem("user", JSON.stringify(res.data));
      return res.data;
    } catch (err) {
      console.log("Error verificando sesión:", err);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      setIsAuthenticated(false);
      return null;
    } finally {
      setLoading(false);
      setInitialCheckDone(true);
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  // 🔐 Login - USAR TOKEN DE RESPUESTA
  const signIn = async (credentials) => {
    try {
      setLoading(true);
      const res = await loginRequest(credentials);

      const { user: userData, token } = res.data;

      // Guardar token y usuario
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);
      setErrors(null);

      return userData;
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

      const { user: userData, token } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);
      setErrors(null);

      return res.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Error desconocido";
      setErrors(msg);
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
        newPassword,
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

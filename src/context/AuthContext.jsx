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
import { getEmpresaById } from "api/empresa";

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser || storedUser === "undefined") {
      localStorage.removeItem("user");
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch (err) {
      console.error("Error parseando user desde localStorage", err);
      localStorage.removeItem("user");
      return null;
    }
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
      navigate("/");
    }
  };

  // Función para verificar sesión que se puede llamar desde fuera
  // 🔍 Verificar sesión (se ejecuta al iniciar)
  const verifySession = useCallback(async () => {
    try {
      const res = await verifyRequest();

      setUser(res.data); // 👈 USUARIO REAL
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(res.data));

      return res.data;
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("user");
      return null;
    } finally {
      setLoading(false);
      setInitialCheckDone(true);
    }
  }, []);

  // 🚀 Check inicial
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      verifySession();
    } else {
      setLoading(false);
      setInitialCheckDone(true); // marca como verificado aunque no haya token
    }
  }, [verifySession]);

  // LOGIN
  // 🔐 Login
const signIn = async (credentials) => {
  try {
    setLoading(true);
    const res = await loginRequest(credentials);

    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
      sessionStorage.setItem("token", res.data.token); // ✅ fallback
    }

    // ✅ Pequeño delay para que el token esté disponible antes del verify
    await new Promise((resolve) => setTimeout(resolve, 100));

    const verifiedUser = await verifySession();

    if (!verifiedUser) {
      throw new Error("No se pudo verificar la sesión");
    }

    setErrors(null);
    return verifiedUser;
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

      if (res.data.token) saveToken(res.data.token);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const verifiedUser = await verifySession();

      if (verifiedUser) {
        localStorage.setItem("user", JSON.stringify(verifiedUser));
        setUser(verifiedUser);
        setIsAuthenticated(true);
        setErrors(null);
      }

      return { ...res.data, user: verifiedUser };
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Error desconocido";

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

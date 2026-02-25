import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import {
  loginRequest,
  registerRequest,
  verifyRequest,
  forgotPasswordRequest,
  updateUserPasswordRequest,
} from "api/auth";

import { initAxiosInterceptors } from "api/axiosPrivate";
import { putUpdatePerfilUsuario } from "api/usuarios";

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const interceptorsReady = useRef(false);

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const [loading, setLoading] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [errors, setErrors] = useState(null);

  // 🔐 Logout centralizado (idempotente)
  const signOut = useCallback(async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (_) {}

    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setIsAuthenticated(false);
    setInitialCheckDone(true);
    navigate("/");
  }, [navigate]);

  // 🟢 Registrar interceptores UNA SOLA VEZ
  useEffect(() => {
    initAxiosInterceptors(() => signOut);
  }, []);

  // 🔍 Verificación de sesión (NO hace logout)
  const verifySession = useCallback(async () => {
    try {
      const res = await verifyRequest();

      setUser(res.data);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(res.data));

      return res.data;
    } catch (err) {
      console.warn("verifySession falló (tolerado)");
      return null;
    } finally {
      setLoading(false);
      setInitialCheckDone(true);
    }
  }, []);

  // 🚀 Check inicial al cargar app
  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token) {
      verifySession();
    } else {
      setLoading(false);
      setInitialCheckDone(true);
    }
  }, [verifySession]);

  // 🔐 LOGIN
  const signIn = async (credentials) => {
    try {
      setLoading(true);

      const res = await loginRequest(credentials);
      const token = res.data?.token;

      if (token) {
        localStorage.setItem("token", token);
        sessionStorage.setItem("token", token);
      }

      await new Promise((r) => setTimeout(r, 100));

      const verifiedUser = await verifySession();
      if (!verifiedUser) throw new Error("No se pudo verificar sesión");

      setErrors(null);
      return verifiedUser;
    } catch (error) {
      setErrors(error.response?.data?.message || "Error al iniciar sesión");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 📝 REGISTER
  const register = async (data) => {
    try {
      setLoading(true);
      const res = await registerRequest(data);

      // ✅ Si requiere verificación, retornamos eso directo sin loguear
      if (res.data?.requiresVerification) {
        return { requiresVerification: true };
      }

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        sessionStorage.setItem("token", res.data.token);
      }

      await new Promise((r) => setTimeout(r, 100));
      const verifiedUser = await verifySession();
      if (!verifiedUser) throw new Error("Registro incompleto");

      setErrors(null);
      return { requiresVerification: false, verifiedUser };
    } catch (error) {
      setErrors(error.response?.data?.message || "Error al registrarse");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 🔁 RECUPERAR PASSWORD
  const forgotPassword = async (email, slug) => {
    const res = await forgotPasswordRequest(email, slug);
    return res.data;
  };

  // 🔑 CAMBIO PASSWORD
  const updatePassword = async (id, currentPassword, newPassword) => {
    const res = await updateUserPasswordRequest(
      id,
      currentPassword,
      newPassword,
    );
    return res.data;
  };

  const actualizarPerfil = async (data) => {
    try {
      const res = await putUpdatePerfilUsuario(data);

      setUser(res.data.usuario);
      localStorage.setItem("user", JSON.stringify(res.data.usuario));

      return res.data.usuario;
    } catch (error) {
      throw error;
    }
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        initialCheckDone,
        errors,
        signIn,
        signOut,
        register,
        forgotPassword,
        updatePassword,
        verifySession,
        actualizarPerfil,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

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

  // 📱 Detectar si es dispositivo móvil
  const isMobile = useCallback(() => {
    return /iPhone|iPad|iPod|Android|webOS|BlackBerry|Windows Phone/i.test(
      navigator.userAgent
    );
  }, []);

  // 🔐 Guardar token en múltiples lugares para redundancia
  const saveToken = useCallback((token) => {
    if (token) {
      localStorage.setItem("token", token);
      sessionStorage.setItem("token", token);
      
      // También guardar timestamp para control de expiración
      localStorage.setItem("token_timestamp", Date.now().toString());
    }
  }, []);

  // 🧹 Limpiar todo el almacenamiento
  const clearAllStorage = useCallback(() => {
    // Limpiar localStorage (excepto datos necesarios)
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("token_timestamp");
    localStorage.removeItem("refreshToken");
    
    // Limpiar sessionStorage
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    
    // Limpiar cookies del cliente
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=; expires=" + new Date().toUTCString() + "; path=/");
    });
  }, []);

  // 🚪 Cerrar sesión mejorado
  const signOut = useCallback(async (showAlert = false) => {
    try {
      // Intentar hacer logout en el backend
      await fetch(`${process.env.REACT_APP_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      console.log("Error en logout:", err);
    } finally {
      // Limpiar todo el almacenamiento
      clearAllStorage();
      
      // Resetear estados
      setUser(null);
      setIsAuthenticated(false);
      setInitialCheckDone(true);
      
      // Redirigir al login
      navigate("/", { replace: true });
    }
  }, [navigate, clearAllStorage]);

  // 🔍 Verificar sesión con soporte para móviles
  const verifySession = useCallback(async (retryCount = 0) => {
    try {
      // Configurar headers especiales para móviles
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const config = {};
      
      // Para móviles, enviar token en header además de la cookie
      if (isMobile() && token) {
        config.headers = {
          'Authorization': `Bearer ${token}`,
          'X-Client-Type': 'mobile',
          'X-Client-Info': navigator.userAgent,
        };
      } else if (token) {
        // Para desktop, igual podemos enviar el token como respaldo
        config.headers = {
          'Authorization': `Bearer ${token}`,
        };
      }

      const res = await verifyRequest(config);
      
      // Si la respuesta es exitosa, actualizar estado
      if (res.data) {
        setUser(res.data);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(res.data));
        
        // Si el token vino en la respuesta, actualizarlo
        if (res.data.token) {
          saveToken(res.data.token);
        }
        
        return res.data;
      } else {
        throw new Error("Respuesta inválida del servidor");
      }
    } catch (err) {
      console.error("Error verificando sesión:", err);
      
      // Reintentar una vez para móviles (a veces Safari es lento)
      if (isMobile() && retryCount < 1 && err.code !== "ERR_NETWORK") {
        console.log("Reintentando verificación para móvil...");
        await new Promise(resolve => setTimeout(resolve, 1500));
        return verifySession(retryCount + 1);
      }
      
      // Si es error de red y hay token, no limpiar inmediatamente
      if (err.code === "ERR_NETWORK" && localStorage.getItem("token")) {
        console.log("Error de red, manteniendo sesión actual");
        return user;
      }
      
      // Limpiar todo si hay error de autenticación
      if (err.response?.status === 401) {
        clearAllStorage();
        setUser(null);
        setIsAuthenticated(false);
      } else {
        // Para otros errores, mantener el usuario actual
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("user");
      }
      
      return null;
    } finally {
      setLoading(false);
      setInitialCheckDone(true);
    }
  }, [isMobile, saveToken, user, clearAllStorage]);

  // 🚀 Check inicial mejorado
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const userData = localStorage.getItem("user");
      
      // Si hay token, intentar verificar sesión
      if (token) {
        await verifySession();
      } 
      // Si no hay token pero hay user data, intentar verificar igual (puede haber cookie)
      else if (userData && userData !== "undefined") {
        try {
          await verifySession();
        } catch {
          // Si falla, limpiar user data
          localStorage.removeItem("user");
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
          setInitialCheckDone(true);
        }
      } 
      // No hay token ni user data
      else {
        setLoading(false);
        setInitialCheckDone(true);
      }
    };

    initializeAuth();
  }, [verifySession]);

  // 🔐 Login mejorado
  const signIn = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setErrors(null);
      
      const res = await loginRequest(credentials);

      // Guardar token si viene en la respuesta
      if (res.data.token) {
        saveToken(res.data.token);
      }

      // Pequeño delay para asegurar que la cookie se estableció (importante para Safari)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verificar que la sesión se estableció correctamente
      const verifiedUser = await verifySession();

      if (!verifiedUser) {
        throw new Error("No se pudo verificar la sesión");
      }

      // Mostrar mensaje de bienvenida
      Swal.fire({
        icon: "success",
        title: "¡Bienvenido!",
        text: `Hola ${verifiedUser.nombre || verifiedUser.email}`,
        timer: 2000,
        showConfirmButton: false,
      });

      return verifiedUser;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message ||
                          "Error al iniciar sesión";
      
      setErrors(errorMessage);
      
      // Mostrar error al usuario
      Swal.fire({
        icon: "error",
        title: "Error de autenticación",
        text: errorMessage,
        confirmButtonText: "Entendido",
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [saveToken, verifySession]);

  // 📝 Register mejorado
  const register = useCallback(async (data) => {
    try {
      setLoading(true);
      setErrors(null);
      
      const res = await registerRequest(data);

      // Guardar token si viene en la respuesta
      if (res.data.token) {
        saveToken(res.data.token);
      }

      // Delay para Safari
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verificar sesión
      const verifiedUser = await verifySession();

      if (!verifiedUser) {
        throw new Error("No se pudo verificar la sesión después del registro");
      }

      // Guardar usuario en localStorage
      localStorage.setItem("user", JSON.stringify(verifiedUser));
      setUser(verifiedUser);
      setIsAuthenticated(true);

      // Mensaje de éxito
      Swal.fire({
        icon: "success",
        title: "¡Registro exitoso!",
        text: "Tu cuenta ha sido creada correctamente",
        timer: 2000,
        showConfirmButton: false,
      });

      return { ...res.data, user: verifiedUser };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message ||
                          "Error en el registro";
      
      setErrors(errorMessage);
      
      Swal.fire({
        icon: "error",
        title: "Error en el registro",
        text: errorMessage,
        confirmButtonText: "Entendido",
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [saveToken, verifySession]);

  // 🔑 Forgot Password
  const forgotPassword = useCallback(async (email) => {
    try {
      setErrors(null);
      const res = await forgotPasswordRequest(email);
      
      Swal.fire({
        icon: "success",
        title: "Correo enviado",
        text: "Revisa tu bandeja de entrada para restablecer tu contraseña",
        confirmButtonText: "Entendido",
      });
      
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Error al enviar el correo";
      
      setErrors(errorMessage);
      
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonText: "Entendido",
      });
      
      throw error;
    }
  }, []);

  // 🔄 Update Password
  const updatePassword = useCallback(async (id, currentPassword, newPassword) => {
    try {
      setErrors(null);
      const res = await updateUserPasswordRequest(id, currentPassword, newPassword);
      
      Swal.fire({
        icon: "success",
        title: "Contraseña actualizada",
        text: "Tu contraseña ha sido cambiada exitosamente",
        confirmButtonText: "Entendido",
      });
      
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Error al actualizar la contraseña";
      
      setErrors(errorMessage);
      
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonText: "Entendido",
      });
      
      throw error;
    }
  }, []);

  // 🛡️ Configurar interceptores de Axios
  useEffect(() => {
    const cleanup = setupAxiosInterceptors(signOut, verifySession);
    
    // Cleanup function para remover interceptores si es necesario
    return () => {
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [signOut, verifySession]);

  // ⏰ Verificar expiración del token periódicamente (solo si hay sesión)
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkTokenExpiration = setInterval(async () => {
      const tokenTimestamp = localStorage.getItem("token_timestamp");
      
      if (tokenTimestamp) {
        const elapsed = Date.now() - parseInt(tokenTimestamp);
        const oneHour = 60 * 60 * 1000; // 1 hora en milisegundos
        
        // Si pasaron 55 minutos, renovar token (esto requeriría endpoint de refresh)
        if (elapsed > oneHour * 0.9) { // 90% de la hora
          console.log("Token próximo a expirar, verificando sesión...");
          await verifySession();
        }
      }
    }, 5 * 60 * 1000); // Cada 5 minutos

    return () => clearInterval(checkTokenExpiration);
  }, [isAuthenticated, verifySession]);

  // Valores del contexto
  const contextValue = {
    // Estados
    user,
    isAuthenticated,
    loading,
    initialCheckDone,
    errors,
    
    // Métodos de autenticación
    signIn,
    signOut,
    register,
    forgotPassword,
    updatePassword,
    verifySession,
    
    // Utilidades
    isMobile: isMobile(),
    saveToken,
    clearAllStorage,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
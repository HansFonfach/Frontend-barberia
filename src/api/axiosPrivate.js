import axios from "axios";
import Swal from "sweetalert2";

export const axiosPrivate = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setupAxiosInterceptors = (signOut, getAuthState) => {
  // Variable para evitar múltiples alertas simultáneas
  let isRefreshing = false;
  let failedQueue = [];

  const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  // REQUEST INTERCEPTOR
  const requestInterceptor = axiosPrivate.interceptors.request.use(
    (config) => {
      // Evitar agregar token a endpoints públicos (login, refresh, etc.)
      const publicEndpoints = ['/auth/login', '/auth/refresh', '/auth/register'];
      const isPublicEndpoint = publicEndpoints.some(endpoint => 
        config.url?.includes(endpoint)
      );

      if (isPublicEndpoint) {
        return config;
      }

      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // RESPONSE INTERCEPTOR
  const responseInterceptor = axiosPrivate.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const status = error.response?.status;
      const { isAuthenticated, initialCheckDone } = getAuthState();

      // Obtener estado fresco en cada llamada para evitar problemas de closure
      const getFreshAuthState = () => {
        try {
          return getAuthState();
        } catch (err) {
          return { isAuthenticated: false, initialCheckDone: true };
        }
      };

      const freshAuthState = getFreshAuthState();

      // Manejo de error 401
      if (status === 401) {
        // Ignorar si es la verificación inicial o si el usuario no está autenticado
        if (!freshAuthState.initialCheckDone || !freshAuthState.isAuthenticated) {
          return Promise.reject(error);
        }

        // Si ya estamos refrescando el token, encolar la solicitud
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axiosPrivate(originalRequest);
            })
            .catch(err => Promise.reject(err));
        }

        isRefreshing = true;

        try {
          // Intentar refrescar el token
          const refreshToken = localStorage.getItem("refreshToken") || 
                               sessionStorage.getItem("refreshToken");
          
          if (refreshToken) {
            const response = await axios.post(
              `${process.env.REACT_APP_API_URL}/auth/refresh`,
              { refreshToken },
              { withCredentials: true }
            );

            if (response.data.accessToken) {
              // Guardar nuevo token
              const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
              storage.setItem("token", response.data.accessToken);
              
              // Actualizar header de la solicitud original
              originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
              
              // Procesar cola de solicitudes pendientes
              processQueue(null, response.data.accessToken);
              
              // Reintentar solicitud original
              return axiosPrivate(originalRequest);
            }
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          
          // Mostrar alerta solo si no hay otras alertas activas
          if (!Swal.isVisible()) {
            await Swal.fire({
              icon: "warning",
              title: "Sesión expirada",
              text: "Tu sesión ha caducado. Inicia sesión nuevamente.",
              confirmButtonText: "Aceptar",
              allowOutsideClick: false,
              allowEscapeKey: false,
              timer: 5000,
              timerProgressBar: true,
            });
          }
          
          signOut();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Manejo de otros errores comunes
      if (status === 403) {
        if (!Swal.isVisible()) {
          await Swal.fire({
            icon: "error",
            title: "Acceso denegado",
            text: "No tienes permisos para realizar esta acción.",
            confirmButtonText: "Aceptar",
          });
        }
      }

      if (status === 500) {
        if (!Swal.isVisible()) {
          await Swal.fire({
            icon: "error",
            title: "Error del servidor",
            text: "Ha ocurrido un error interno. Por favor, inténtalo más tarde.",
            confirmButtonText: "Aceptar",
          });
        }
      }

      // Para errores de red
      if (!error.response) {
        if (!Swal.isVisible()) {
          await Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
            confirmButtonText: "Reintentar",
            showCancelButton: true,
            cancelButtonText: "Cancelar",
          }).then((result) => {
            if (result.isConfirmed) {
              return axiosPrivate(originalRequest);
            }
          });
        }
      }

      return Promise.reject(error);
    }
  );

  // Función de limpieza
  return () => {
    axiosPrivate.interceptors.request.eject(requestInterceptor);
    axiosPrivate.interceptors.response.eject(responseInterceptor);
    isRefreshing = false;
    failedQueue = [];
  };
};

// Función helper para uso opcional
export const clearAxiosInterceptors = () => {
  axiosPrivate.interceptors.request.clear();
  axiosPrivate.interceptors.response.clear();
};
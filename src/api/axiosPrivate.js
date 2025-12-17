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
  // REQUEST
  const requestInterceptor = axiosPrivate.interceptors.request.use(
    (config) => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // RESPONSE
  const responseInterceptor = axiosPrivate.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error.response?.status;
      const { isAuthenticated, initialCheckDone } = getAuthState();

      /**
       * 🔑 CLAVE:
       * - Ignorar 401 durante el check inicial
       * - Solo cerrar sesión si el usuario YA estaba autenticado
       */
      if (status === 401 && initialCheckDone && isAuthenticated) {
        await Swal.fire({
          icon: "warning",
          title: "Sesión expirada",
          text: "Tu sesión ha caducado. Inicia sesión nuevamente.",
          confirmButtonText: "Aceptar",
          allowOutsideClick: false,
          allowEscapeKey: false,
        });

        signOut();
      }

      return Promise.reject(error);
    }
  );

  // Cleanup (MUY IMPORTANTE)
  return () => {
    axiosPrivate.interceptors.request.eject(requestInterceptor);
    axiosPrivate.interceptors.response.eject(responseInterceptor);
  };
};

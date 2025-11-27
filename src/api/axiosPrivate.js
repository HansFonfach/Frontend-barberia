import axios from "axios";
import Swal from "sweetalert2";

export const axiosPrivate = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true, // envía cookies por defecto
  headers: { "Content-Type": "application/json" },
});

export const setupAxiosInterceptors = (signOut) => {
  // Interceptor request
  axiosPrivate.interceptors.request.use(
    (config) => {
      config.withCredentials = true; // cookies para navegadores compatibles

      // Fallback para Safari: usar token en header
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
        config.withCredentials = false; // Safari solo necesita header
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Interceptor response
  axiosPrivate.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error.response?.status;
      if (status === 401) {
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
};

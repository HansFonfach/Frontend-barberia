import axios from "axios";
import Swal from "sweetalert2";

export const axiosPrivate = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Configura los interceptores de Axios.
 */
export const setupAxiosInterceptors = (signOut) => {
  // Interceptor de request para asegurar credenciales
  axiosPrivate.interceptors.request.use(
    (config) => {
      config.withCredentials = true;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor de response
  axiosPrivate.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error.response?.status;
      const originalRequest = error.config;

      console.log("Error de axios:", status, error.response?.data);

      if (status === 401) {
        try {
          await Swal.fire({
            icon: "warning",
            title: "Sesión expirada",
            text: "Tu sesión ha caducado. Inicia sesión nuevamente.",
            confirmButtonText: "Aceptar",
            allowOutsideClick: false,
            allowEscapeKey: false,
          });
        } finally {
          signOut();
        }
      }

      return Promise.reject(error);
    }
  );
};
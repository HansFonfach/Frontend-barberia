import axios from "axios";
import Swal from "sweetalert2";

export const axiosPrivate = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true, // ✅ Esto ya está bien
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setupAxiosInterceptors = (signOut) => {
  // Interceptor de request
  axiosPrivate.interceptors.request.use(
    (config) => {
      // Asegurar que withCredentials esté siempre en true
      config.withCredentials = true;
      
      // Token de fallback si las cookies no funcionan
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (token && !config.headers['Authorization']) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
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
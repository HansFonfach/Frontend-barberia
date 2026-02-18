import axios from "axios";
import Swal from "sweetalert2";

export const axiosPrivate = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true, // Importante para cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token a cada petición
axiosPrivate.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const setupAxiosInterceptors = (signOut) => {
  let isAlertOpen = false;

  axiosPrivate.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (!error.response) {
        return Promise.reject(error);
      }

      const { status } = error.response;

      // 401 = No autorizado
      if (status === 401 && !isAlertOpen) {
        isAlertOpen = true;

        try {
          await Swal.fire({
            icon: "warning",
            title: "Sesión expirada",
            text: "Tu sesión ha caducado. Inicia sesión nuevamente.",
            confirmButtonText: "Aceptar",
            allowOutsideClick: false,
          });
        } finally {
          isAlertOpen = false;
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          signOut();
        }
      }

      return Promise.reject(error);
    }
  );
};
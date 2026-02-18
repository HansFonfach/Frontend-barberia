import axios from "axios";
import Swal from "sweetalert2";

export const axiosPrivate = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

export const setupAxiosInterceptors = (signOut) => {
  let isAlertOpen = false;

  // ✅ NUEVO: adjuntar token en cada request
  axiosPrivate.interceptors.request.use((config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  });

  axiosPrivate.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (!error.response) return Promise.reject(error);

      const { status } = error.response;

      if (status === 401 && !isAlertOpen) {
        isAlertOpen = true;
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
          isAlertOpen = false;
          signOut();
        }
      }

      return Promise.reject(error);
    }
  );
};
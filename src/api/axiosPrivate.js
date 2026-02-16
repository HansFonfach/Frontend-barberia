import axios from "axios";
import Swal from "sweetalert2";

export const axiosPrivate = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

export const setupAxiosInterceptors = (signOut) => {
  let isAlertOpen = false; // 🔒 evita múltiples alertas

  axiosPrivate.interceptors.response.use(
    (response) => response,
    async (error) => {
      // ⛔ Si no hay respuesta (error de red, backend caído, etc.)
      if (!error.response) {
        return Promise.reject(error);
      }

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
          signOut(); // 🔥 logout seguro
        }
      }

      return Promise.reject(error);
    }
  );
};

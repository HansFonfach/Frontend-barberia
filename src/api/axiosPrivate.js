import axios from "axios";
import Swal from "sweetalert2";

export const axiosPrivate = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});


/**
 * Configura los interceptores de respuesta de Axios.
 * @param {Function} signOut - Función que limpia sesión y redirige al login.
 */
export const setupAxiosInterceptors = (signOut) => {
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
          signOut(); // 👈 se ejecuta cuando cierra el alert
        }
      }

      return Promise.reject(error);
    }
  );
};

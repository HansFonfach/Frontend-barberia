import axios from "axios";
import Swal from "sweetalert2";

export const axiosPrivate = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true, // ✅ Esto ya está bien
  headers: {
    "Content-Type": "application/json",
  },
});
// api/axiosPrivate.js - CORREGIDO
export const setupAxiosInterceptors = (signOut) => {
  axiosPrivate.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error.response?.status;
      const originalRequest = error.config;

      console.log("🔍 Error de axios:", status, error.response?.data);

      // ✅ CORRECCIÓN: Solo mostrar "sesión expirada" si YA estaba autenticado
      if (status === 401) {
        const user = localStorage.getItem("user");

        // Si NO hay usuario guardado, es un error de login normal
        if (!user) {
          console.log("Error 401 durante login - no mostrar alert");
          return Promise.reject(error);
        }

        // Si HAY usuario guardado, entonces la sesión expiró
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

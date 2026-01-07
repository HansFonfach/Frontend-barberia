import axios from "axios";
import Swal from "sweetalert2";

/**
 * Instancia privada de Axios con configuración base.
 */
export const axiosPrivate = axios.create({
  baseURL: "http://localhost:4000", // Cambiar a tu base real en producción
  withCredentials: true, // Permite enviar cookies
});

/**
 * Configura interceptores de respuesta para manejar errores globales.
 * Actualmente maneja 401 (sesión expirada).
 *
 * @param {Function} signOut - Función que limpia sesión y redirige al login.
 */
export const setupAxiosInterceptors = (signOut) => {
  let isAlertOpen = false; // Evita múltiples alertas 401 simultáneas

  axiosPrivate.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error.response?.status;

      // Manejo de sesión expirada
      if (status === 401 && !isAlertOpen) {
        isAlertOpen = true;
        try {
          await Swal.fire({
            icon: "warning",
            title: "Sesión expirada",
            text: "Tu sesión ha caducado. Por favor, inicia sesión nuevamente.",
            confirmButtonText: "Aceptar",
            allowOutsideClick: false,
            allowEscapeKey: false,
          });
        } finally {
          isAlertOpen = false;
          signOut(); // Limpiar sesión y redirigir
        }
      }

      // Retorna el error para que pueda ser manejado localmente si es necesario
      return Promise.reject(error);
    }
  );
};

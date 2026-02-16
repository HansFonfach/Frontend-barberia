import axios from "axios";
import Swal from "sweetalert2";

export const axiosPrivate = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setupAxiosInterceptors = (signOut, verifySession) => {
  let isAlertOpen = false;
  let isRefreshing = false; // Para evitar múltiples refrescos

  axiosPrivate.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // ⛔ Si no hay respuesta (error de red, backend caído, etc.)
      if (!error.response) {
        return Promise.reject(error);
      }

      const { status } = error.response;

      // 🔄 Intentar refresh token si existe (si tuvieras endpoint de refresh)
      if (status === 401 && !originalRequest._retry && !isAlertOpen) {
        originalRequest._retry = true;

        // Verificar si realmente la sesión expiró o es un error falso
        try {
          // Intentar verificar sesión antes de mostrar alerta
          const user = await verifySession();
          if (user) {
            // Si la sesión es válida, reintentar la petición original
            return axiosPrivate(originalRequest);
          }
        } catch (verifyError) {
          // Si la verificación falla, la sesión realmente expiró
          console.log("Verificación falló, sesión expirada");
        }

        // Solo mostrar alerta si realmente la sesión expiró
        if (!isAlertOpen) {
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
            signOut(); // Logout seguro
          }
        }
      }

      return Promise.reject(error);
    }
  );
};
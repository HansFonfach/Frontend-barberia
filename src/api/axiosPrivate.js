import axios from "axios";
import Swal from "sweetalert2";

export const axiosPrivate = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

let isAlertOpen = false;
let isLoggingOut = false;
let firstAuthCheck = true;

export const setupAxiosInterceptors = (signOut) => {
  // 🟢 REQUEST: adjuntar token SI existe
  axiosPrivate.interceptors.request.use(
    (config) => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  // 🔴 RESPONSE: manejar 401 con tolerancia
  axiosPrivate.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (!error.response) return Promise.reject(error);

      const { status } = error.response;
      const url = error.config?.url || "";

      const esRutaAuth =
        url.includes("/auth/me") ||
        url.includes("/auth/verify") ||
        url.includes("/auth/profile");

      // ⚠️ Primer 401 tras F5 → lo ignoramos
      if (status === 401 && esRutaAuth && firstAuthCheck) {
        firstAuthCheck = false;
        return Promise.reject(error);
      }

      // 🔒 Logout real
      if (status === 401 && esRutaAuth && !isAlertOpen && !isLoggingOut) {
        isAlertOpen = true;
        isLoggingOut = true;

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
    },
  );
};

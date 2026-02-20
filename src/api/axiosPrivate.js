import axios from "axios";
import Swal from "sweetalert2";

export const axiosPrivate = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

let isLoggingOut = false;
let interceptorsInitialized = false;

export const initAxiosInterceptors = (getSignOut) => {
  if (interceptorsInitialized) return;
  interceptorsInitialized = true;

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

  axiosPrivate.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (!error.response) return Promise.reject(error);

      const { status } = error.response;
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (status === 401 && token && !isLoggingOut) {
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
          getSignOut()();
          isLoggingOut = false;
        }
      }

      return Promise.reject(error);
    },
  );
};
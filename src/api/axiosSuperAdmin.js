import axios from "axios";

// Instancia SEPARADA de axiosPrivate a propósito: ese lee el token del
// tenant (localStorage "token") e inyecta signOut() del AuthContext del
// tenant si expira. El panel de super-admin es un mundo aparte (login,
// token y cookie propios: "superadminToken"), así que mezclarlo con esa
// instancia terminaría mandando el token equivocado o cerrando la sesión
// de un negocio por error.
export const axiosSuperAdmin = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

axiosSuperAdmin.interceptors.request.use((config) => {
  const token = localStorage.getItem("superadminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosSuperAdmin.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("superadminToken");
      if (window.location.pathname !== "/superadmin/login") {
        window.location.href = "/superadmin/login";
      }
    }
    return Promise.reject(error);
  },
);

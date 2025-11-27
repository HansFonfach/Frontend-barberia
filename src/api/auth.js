import { axiosPrivate } from "./axiosPrivate";
import { axiosPublic } from "./axiosPublic";

export const loginRequest = (user) => {
  return axiosPublic.post("/auth/login", user, { 
    withCredentials: true 
  });
};

export const registerRequest = (user) => {
  return axiosPublic.post("/auth/register", user, { 
    withCredentials: true // ✅ AGREGAR esto
  });
};

export const forgotPasswordRequest = (email) => {
  return axiosPublic.post("/auth/forgot-password", { email }); // ✅ Corregir: enviar como objeto
};

export const logoutRequest = () => {
  return axiosPublic.post("/auth/logout", null, { 
    withCredentials: true 
  });
};

export const updateUserPasswordRequest = (id, currentPassword, newPassword) => {
  return axiosPrivate.post(`/auth/change-password/${id}`, {
    currentPassword,
    newPassword,
  }); // ✅ axiosPrivate ya tiene withCredentials: true por defecto
};

export const verifyRequest = () => {
  return axiosPrivate.get("/auth/verify"); // ✅ axiosPrivate ya tiene withCredentials: true por defecto
};
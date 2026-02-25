import { axiosPrivate } from "./axiosPrivate";
import { axiosPublic } from "./axiosPublic";

export const loginRequest = (user, slug) => {
  return axiosPublic.post(`/auth/${slug}/login`, user, {
    withCredentials: true,
  });
};

export const registerRequest = (user, slug) => {
  return axiosPublic.post(`/auth/${slug}/register`, user, {
    withCredentials: true, // ✅ AGREGAR esto
  });
};

export const forgotPasswordRequest = (email, slug) => {
  return axiosPublic.post(`/auth/${slug}/forgot-password`, email); // ✅ Corregir: enviar como objeto
};

export const logoutRequest = () => {
  return axiosPublic.post("/auth/logout", null, {
    withCredentials: true,
  });
};

export const updateUserPasswordRequest = (id, currentPassword, newPassword) => {
  return axiosPrivate.post(`/auth/change-password/${id}`, {
    currentPassword,
    newPassword,
  }); // ✅ axiosPrivate ya tiene withCredentials: true por defecto
};

export const verifyRequest = () =>
  axiosPrivate.get("/auth/me", { withCredentials: true });

export const verifyClaim = (token) => {
  return axiosPublic.get(`/auth/verify-claim?token=${token}`);
};
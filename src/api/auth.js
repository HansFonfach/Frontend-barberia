import { axiosPrivate } from "./axiosPrivate";
import { axiosPublic } from "./axiosPublic";

export const loginRequest = (user) => {
  return axiosPublic.post("/auth/login", user, { withCredentials: true });
};

export const registerRequest = (user) => {
  return axiosPublic.post("/auth/register", user);
};

export const forgotPasswordRequest = (email) => {
  return axiosPublic.post("/auth/forgot-password", email);
};

export const logoutRequest = () => {
  // Logout típicamente borra la cookie en el servidor
  return axiosPublic.post("/auth/logout", null, { withCredentials: true });
};

export const updateUserPasswordRequest = (id, currentPassword, newPassword) => {
  return axiosPrivate.post(`/auth/change-password/${id}`, {
    currentPassword,
    newPassword,
  });
};

export const verifyRequest = () => {
  // Verify normalmente es un GET que devuelve los datos del usuario desde la cookie
  return axiosPrivate.get("/auth/verify", { withCredentials: true });
};

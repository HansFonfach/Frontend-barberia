import { axiosPrivate } from "./axiosPrivate";
import { axiosPublic } from "./axiosPublic";

export const getEmpresaPorSlug = (slug) => {
  return axiosPublic.get(`/empresa/slug/${slug}`);
};
export const getEmpresaById = (id) => axiosPrivate.get(`/empresa/${id}`);

export const patchActualizarEmpresa = (data) =>
  axiosPrivate.patch("/empresa/actualizar", data);

export const postRegistroEmpresa = (data) => {
  return axiosPublic.post("/empresa/registro-negocio", data);
};

export const postLogoEmpresa = (empresaId, formData) =>
  axiosPrivate.put(`/empresa/${empresaId}/logo`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const postFotoPerfilEmpresa = (empresaId, formData) =>
  axiosPrivate.post(`/empresa/${empresaId}/foto-perfil`, formData, {});

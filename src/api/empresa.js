
import { axiosPrivate } from "./axiosPrivate";
import { axiosPublic } from "./axiosPublic";

export const getEmpresaPorSlug = (slug) => {
  return axiosPublic.get(`/empresa/slug/${slug}`);
};
export const getEmpresaById = (id) =>
  axiosPrivate.get(`/empresa/${id}`);

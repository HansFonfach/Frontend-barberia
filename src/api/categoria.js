import { axiosPrivate } from "./axiosPrivate";
import { axiosPublic } from "./axiosPublic";

export const crearCategoria = async (data) => {
  const res = await axiosPrivate.post("/categoria/crearCategoria", data);
  return res.data;
};

export const listarCategoriasPublico = async (slug) => {
  const res = await axiosPublic.get(`/categoria/${slug}/categorias`);
  return res.data;
};

import { axiosPrivate } from "./axiosPrivate";


export const postCreateProducto = (data) => {
  return axiosPrivate.post("/productos/crearProducto", data);
};


export const putUpdateProductos = (id, data) => {
  return axiosPrivate.put(`/productos/actualizarProducto/${id}`, data);
};


export const putDeleteProducto = (id) => {
  return axiosPrivate.put(`/productos/eliminarProducto/${id}`);
};

export const getAllProductos = () => {
  return axiosPrivate.get("/productos/listarProductos");
};

  
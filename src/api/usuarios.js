import { axiosPrivate } from "./axiosPrivate";

export const getUsuarios = () => {
  return axiosPrivate.get("/usuarios");
};

export const putUsuario = (id, data) => {
  return axiosPrivate.put(`/usuarios/${id}`, data);
};

export const getUsuarioByRut = (rut) => {
  console.log(`📡 API: GET /usuarios/rut/${rut} en puerto 4000`);
  return axiosPrivate.get(`/usuarios/rut/${rut}`);
};
export const postSubscribeUserById = (_id) => {
  return axiosPrivate.post(`/suscripcion/usuario/${_id}/suscribir`);
};

export const putUnsubscribeUserById = (_id) => {
  return axiosPrivate.put(`/suscripcion/usuario/${_id}/cancelarSub`);
};

export const getTodosLosUsuarios = () => {
  return axiosPrivate.get(`/usuarios/todosLosUsuarios`);
};

export const getSubActiva = () => {
  return axiosPrivate.get("/suscripcion/usuario/activa");
};

export const getVerMisPuntos = () => {
  return axiosPrivate.get("/usuarios/misPuntos");
};

export const postAsignarServiciosAlBarbero = (
  barberoId,
  serviciosAsignados,
) => {
  return axiosPrivate.post(
    `/barberoServicio/barberos/${barberoId}/servicios`,
    serviciosAsignados,
  );
};

export const postCrearBarbero = (data) => {
  return axiosPrivate.post(`/usuarios/barbero/crearBarbero`, data);
};

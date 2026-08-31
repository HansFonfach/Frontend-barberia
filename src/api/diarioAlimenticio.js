import { axiosPrivate } from "./axiosPrivate";

// Diario alimenticio (modulos.entrenamientoPersonal): bitácora personal de
// comidas + agua + suplementos, pensada para apoyar controles con un
// nutricionista. Simétrico para todos los clientes de la empresa — cada
// quien solo ve/edita lo suyo. Separado de "Plan alimenticio" (que muestra
// la meta calórica calculada + ideas de comida) porque este es un registro
// del día a día, no una recomendación.

// ── Comidas ──

// data = FormData con: tipoComida (desayuno|almuerzo|once|cena|colacion|
//   otro), descripcion?, fecha?, foto? (archivo, opcional)
export const postComida = (data) =>
  axiosPrivate.post("/diario-alimenticio/comida", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getComidas = (desde, hasta) =>
  axiosPrivate.get("/diario-alimenticio/comidas", {
    params: { desde, hasta },
  });

export const deleteComida = (id) =>
  axiosPrivate.delete(`/diario-alimenticio/comida/${id}`);

// ── Agua ──

export const postAgua = (mililitros) =>
  axiosPrivate.post("/diario-alimenticio/agua", { mililitros });

export const getAguaHoy = () => axiosPrivate.get("/diario-alimenticio/agua/hoy");

export const deleteAgua = (id) =>
  axiosPrivate.delete(`/diario-alimenticio/agua/${id}`);

// ── Suplementos ──

export const postSuplemento = (nombre) =>
  axiosPrivate.post("/diario-alimenticio/suplemento", { nombre });

export const getSuplementos = () => axiosPrivate.get("/diario-alimenticio/suplementos");

export const deleteSuplemento = (id) =>
  axiosPrivate.delete(`/diario-alimenticio/suplemento/${id}`);

// Marca/desmarca como tomado HOY (alterna según el estado actual).
export const putTomaSuplemento = (id) =>
  axiosPrivate.put(`/diario-alimenticio/suplemento/${id}/toma`);

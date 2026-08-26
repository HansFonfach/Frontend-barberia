import { axiosPrivate } from "./axiosPrivate";

// Progreso personal del cliente (racha, resumen mensual, hitos) + bitácora
// de peso/medidas. Solo para empresas con modulos.clasesGrupales activo.

export const getMiProgreso = () =>
  axiosPrivate.get("/progreso-cliente/mi-progreso");

// data = { clienteId? (solo lo usa el admin), fecha?, pesoKg?, alturaCm?,
//   grasaCorporalPorcentaje?, medidas?: { cinturaCm, caderaCm, pechoCm,
//   brazoCm, piernaCm }, notas? }
export const postMedicionCorporal = (data) =>
  axiosPrivate.post("/progreso-cliente/medicion-corporal", data);

export const getMisMedicionesCorporales = () =>
  axiosPrivate.get("/progreso-cliente/medicion-corporal/mias");

export const getMedicionesClienteCorporal = (clienteId) =>
  axiosPrivate.get(`/progreso-cliente/medicion-corporal/cliente/${clienteId}`);

export const deleteMedicionCorporal = (id) =>
  axiosPrivate.delete(`/progreso-cliente/medicion-corporal/${id}`);

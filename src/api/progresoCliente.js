import { axiosPrivate } from "./axiosPrivate";

// Progreso personal del cliente (racha, resumen mensual, hitos) — solo
// para empresas con modulos.clasesGrupales activo. La bitácora de
// peso/medidas de acá abajo, en cambio, también sirve para empresas que
// solo tienen modulos.entrenamientoPersonal (ver progresoClienteRoutes.js).

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

// Comparativa mensual: último registro de bitácora vs. el anterior más
// cercano a ~1 mes atrás (deltas puros, sin interpretar).
export const getComparativaBitacora = () =>
  axiosPrivate.get("/progreso-cliente/comparativa-bitacora");

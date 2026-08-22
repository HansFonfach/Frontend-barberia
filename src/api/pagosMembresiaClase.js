import { axiosPrivate } from "./axiosPrivate";

// Inicia un pago online (Transbank WebPay Plus) de una mensualidad de
// clases grupales. El back valida todo (plan real, precio real, que no
// tenga ya una mensualidad activa) — acá solo se manda el id del plan.
export const postIniciarPagoMembresia = (planId) =>
  axiosPrivate.post("/pagosMembresiaClase/iniciar", { planId });

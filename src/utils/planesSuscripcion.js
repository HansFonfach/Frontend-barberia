// utils/planesSuscripcion.js
//
// Cálculos para mostrar los planes de suscripción en la página pública y al
// reservar: cuántos servicios trae un plan, cuánto costarían pagando cada
// servicio por separado y cuánto se ahorra. Siempre se calcula con el
// servicio más barato que incluye el plan, para no prometer de más.

/** Servicios totales del plan (cupos por ciclo × ciclos). */
export const totalServiciosPlan = (p) =>
  (Number(p?.cantidadPorCiclo) || 0) *
  Math.max(1, Math.floor((Number(p?.duracionDias) || 0) / Math.max(1, Number(p?.cicloDias) || 1)));

/** Precio normal del servicio más barato que cubre el plan. */
const precioServicioBase = (p, servicios = []) => {
  const incluidos = (p?.serviciosPermitidos || []).map((s) => Number(s?.precio)).filter((n) => n > 0);
  const lista = incluidos.length
    ? incluidos
    : (servicios || []).map((s) => Number(s?.precio)).filter((n) => n > 0);
  return lista.length ? Math.min(...lista) : 0;
};

/** { normal, ahorro, porcentaje } del plan completo. ahorro = 0 si no conviene. */
export const ahorroPlan = (p, servicios = []) => {
  const total = totalServiciosPlan(p);
  const normal = precioServicioBase(p, servicios) * total;
  const ahorro = Math.max(0, Math.round(normal - (Number(p?.precio) || 0)));
  return { normal, ahorro, porcentaje: normal > 0 ? Math.round((ahorro / normal) * 100) : 0 };
};

/**
 * El plan a sugerir a quien reserva este servicio:
 * { plan, precioPorServicio, ahorroPorServicio } o null si ningún plan lo
 * incluye o ninguno le sale más barato.
 * Se prefiere el plan más "a la medida" del servicio (el que incluye menos
 * servicios distintos; ej. "La Santa" = solo corte, antes que "Dupla" = corte
 * y barba) y, entre esos, el que más ahorra. Los planes marcados para no
 * sugerirse (ej. "Padre e hijo") se saltan.
 */
export const mejorPlanParaServicio = (planes = [], servicioId, precioServicio) => {
  const precio = Number(precioServicio) || 0;
  if (!servicioId || precio <= 0) return null;
  let mejor = null;
  for (const plan of planes || []) {
    if (plan.sugerirAlReservar === false) continue;
    const ids = (plan.serviciosPermitidos || []).map((s) => String(s?._id || s));
    if (ids.length && !ids.includes(String(servicioId))) continue;
    // Menos servicios distintos = más a la medida; "cualquier servicio" al final
    const especificidad = ids.length || 9999;
    const total = totalServiciosPlan(plan);
    if (!total) continue;
    const precioPorServicio = Math.round((Number(plan.precio) || 0) / total);
    const ahorroPorServicio = precio - precioPorServicio;
    if (ahorroPorServicio <= 0) continue;
    const esMejor =
      !mejor ||
      especificidad < mejor.especificidad ||
      (especificidad === mejor.especificidad && ahorroPorServicio > mejor.ahorroPorServicio);
    if (esMejor) mejor = { plan, precioPorServicio, ahorroPorServicio, especificidad };
  }
  return mejor;
};

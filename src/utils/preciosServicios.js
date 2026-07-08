export function calcularPrecioFinal(servicio, fechaSeleccionada) {
  if (!servicio) return null;
  const { precio, descuento } = servicio;

  if (!descuento?.activo) return precio;

  const soloFechaChile = (d) => {
    return new Date(d).toLocaleDateString("en-CA", {
      timeZone: "America/Santiago",
    });
  };

  const fechaReservaStr = fechaSeleccionada
    ? soloFechaChile(fechaSeleccionada)
    : soloFechaChile(new Date());

  const inicioStr = descuento.fechaInicio ? soloFechaChile(descuento.fechaInicio) : null;
  const finStr = descuento.fechaFin ? soloFechaChile(descuento.fechaFin) : null;

  const yaComenzo = !inicioStr || fechaReservaStr >= inicioStr;
  const noHaTerminado = !finStr || fechaReservaStr <= finStr;

  if (!yaComenzo || !noHaTerminado) return precio;

  const rebaja = Math.round(precio * (descuento.porcentaje / 100));
  return precio - rebaja;
}
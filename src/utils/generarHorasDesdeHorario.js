export const generarHorasDesdeHorario = (horario) => {
  const horas = [];

  const toMin = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const fromMin = (m) =>
    `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(
      m % 60
    ).padStart(2, "0")}`;

  const start = toMin(horario.horaInicio);
  const end = toMin(horario.horaFin);
  const block = horario.duracionBloque || 30;

  const colStart = horario.colacionInicio
    ? toMin(horario.colacionInicio)
    : null;
  const colEnd = horario.colacionFin ? toMin(horario.colacionFin) : null;

  for (let t = start; t < end; t += block) {
    const enColacion =
      colStart !== null && t >= colStart && t < colEnd;

    if (!enColacion) horas.push(fromMin(t));
  }

  return horas;
};

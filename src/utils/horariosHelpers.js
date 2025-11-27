// Constantes
export const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export const CONFIG_HORARIOS = {
  HORA_INICIO: 8,
  HORA_FIN: 19,
  BLOQUE_DURACION: 1 // hora
};

// Funciones puras (no dependen de estado de React)
export const generarBloques = (inicio = CONFIG_HORARIOS.HORA_INICIO, fin = CONFIG_HORARIOS.HORA_FIN) => {
  const bloques = [];
  for (let hora = inicio; hora <= fin; hora++) {
    const horaStr = hora.toString().padStart(2, "0");
    bloques.push(`${horaStr}:00`);
  }
  return bloques;
};

export const normalizarHora = (hora) => {
  if (!hora) return "";
  const [h, m] = hora.split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
};

export const inicializarHorarios = () => 
  DIAS_SEMANA.reduce((acc, dia) => {
    acc[dia] = [];
    return acc;
  }, {});

// Convertir día nombre a número (Lunes → 1, Domingo → 0)
export const diaNombreANumero = (diaNombre) => {
  const indice = DIAS_SEMANA.indexOf(diaNombre);
  return indice === 6 ? 0 : indice + 1; // Domingo = 0, Lunes = 1, etc.
};

// Convertir día número a nombre (1 → Lunes, 0 → Domingo)
export const diaNumeroANombre = (diaNumero) => {
  return diaNumero === 0 ? DIAS_SEMANA[6] : DIAS_SEMANA[diaNumero - 1];
};

// Validar si hay horarios seleccionados
export const hayHorariosSeleccionados = (horarios) => {
  return Object.values(horarios).some(bloques => bloques.length > 0);
};
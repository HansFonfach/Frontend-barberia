import { useState, useEffect } from "react";
import {
  inicializarHorarios,
  normalizarHora,
  DIAS_SEMANA,
  diaNombreANumero,
} from "../utils/horariosHelpers";

export const useHorariosBase = (barberoSeleccionado, obtenerHorarioBarbero) => {
  const [horarios, setHorarios] = useState(inicializarHorarios);
  const [cargando, setCargando] = useState(false);

  // 🔹 Alterna selección de un bloque horario
  const toggleBloque = (dia, bloque) => {
    const horaNormalizada = normalizarHora(bloque);
    setHorarios((prev) => {
      const diaBloques = prev[dia] || [];
      const nuevo = diaBloques.includes(horaNormalizada)
        ? diaBloques.filter((b) => b !== horaNormalizada)
        : [...diaBloques, horaNormalizada];
      return { ...prev, [dia]: nuevo };
    });
  };

  // 🔹 Reinicia todos los horarios
  const resetHorarios = () => {
    setHorarios(inicializarHorarios());
  };

  // 🔹 Carga horarios existentes del barbero
  useEffect(() => {
    const cargarHorarios = async () => {
      if (!barberoSeleccionado) {
        resetHorarios();
        return;
      }

      try {
        const data = await obtenerHorarioBarbero(barberoSeleccionado);

        const nuevosHorarios = inicializarHorarios();

        data.forEach((horario) => {
          const diaNombre =
            DIAS_SEMANA[horario.dia === 0 ? 6 : horario.dia - 1];
          horario.bloques.forEach((bloque) => {
            nuevosHorarios[diaNombre].push(normalizarHora(bloque.horaInicio));
          });
        });

        setHorarios(nuevosHorarios);
      } catch (error) {
        console.error("Error al cargar horarios", error);
        resetHorarios();
      }
    };

    cargarHorarios();
  }, [barberoSeleccionado, obtenerHorarioBarbero]);

  // 🔹 Prepara los datos para enviar al backend
  const prepararDatosEnvio = () => {
    return Object.entries(horarios)
      .filter(([, bloques]) => bloques.length > 0)
      .map(([diaNombre, bloquesDia]) => {
        const diaNumero = diaNombreANumero(diaNombre);

        const bloquesFormateados = bloquesDia.map((horaInicio) => ({
          horaInicio: normalizarHora(horaInicio),
          horaFin: normalizarHora(horaInicio), // misma hora seleccionada
        }));

        return {
          dia: diaNumero,
          bloques: bloquesFormateados,
        };
      });
  };

  return {
    // Estado
    horarios,
    cargando,

    // Setters
    setCargando,

    // Acciones
    toggleBloque,
    resetHorarios,
    prepararDatosEnvio,
  };
};

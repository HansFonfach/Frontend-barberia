import { createContext, useContext } from "react";
import {
  postRegistroEntrenamiento,
  getMisRegistrosEntrenamiento,
  deleteRegistroEntrenamiento,
  getMiProgresoEntrenamiento,
  getCatalogoEjerciciosEntrenamiento,
  postRutina,
  getMisRutinas,
  getRutinasCompartidas,
  putRutina,
  deleteRutina,
} from "api/entrenamientoPersonal";

// Progreso de entrenamiento personal: racha + resumen mensual + hitos +
// sugerencia de qué entrenar hoy (o descansar) + aviso de constancia,
// calculados desde los registros libres que cada cliente va anotando
// (gimnasio por su cuenta, fútbol, etc. — sin depender de clases agendadas).
const EntrenamientoPersonalContext = createContext();

export const useEntrenamientoPersonal = () => {
  const context = useContext(EntrenamientoPersonalContext);
  if (!context)
    throw new Error(
      "useEntrenamientoPersonal must be used within an EntrenamientoPersonalProvider",
    );
  return context;
};

const PROGRESO_VACIO = {
  totalHistorico: 0,
  esteMes: 0,
  mesAnterior: 0,
  variacionMes: null,
  minutosEsteMes: 0,
  rachaSemanas: 0,
  hitos: [],
  proximoHito: null,
  faltanParaProximoHito: null,
  diasSinActividad: null,
  avisoConstancia: false,
  yaRegistroHoy: false,
  registrosHoy: [],
  sugerencia: null,
  sugerenciasPeso: [],
};

export const EntrenamientoPersonalProvider = ({ children }) => {
  const miProgresoEntrenamiento = async () => {
    try {
      const res = await getMiProgresoEntrenamiento();
      return res.data.data;
    } catch (error) {
      console.error("Error en miProgresoEntrenamiento:", error);
      return PROGRESO_VACIO;
    }
  };

  const crearRegistroEntrenamiento = async (data) => {
    const res = await postRegistroEntrenamiento(data);
    return res.data.data;
  };

  const misRegistrosEntrenamiento = async (dias) => {
    try {
      const res = await getMisRegistrosEntrenamiento(dias);
      return res.data.data.registros || [];
    } catch (error) {
      console.error("Error en misRegistrosEntrenamiento:", error);
      return [];
    }
  };

  const eliminarRegistroEntrenamiento = async (id) => {
    const res = await deleteRegistroEntrenamiento(id);
    return res.data.data;
  };

  const catalogoEjercicios = async () => {
    try {
      const res = await getCatalogoEjerciciosEntrenamiento();
      return res.data.data.catalogo || [];
    } catch (error) {
      console.error("Error en catalogoEjercicios:", error);
      return [];
    }
  };

  const crearRutina = async (data) => {
    const res = await postRutina(data);
    return res.data.data;
  };

  const misRutinas = async () => {
    try {
      const res = await getMisRutinas();
      return res.data.data.rutinas || [];
    } catch (error) {
      console.error("Error en misRutinas:", error);
      return [];
    }
  };

  const rutinasCompartidas = async () => {
    try {
      const res = await getRutinasCompartidas();
      return res.data.data.rutinas || [];
    } catch (error) {
      console.error("Error en rutinasCompartidas:", error);
      return [];
    }
  };

  const actualizarRutina = async (id, data) => {
    const res = await putRutina(id, data);
    return res.data.data;
  };

  const eliminarRutina = async (id) => {
    const res = await deleteRutina(id);
    return res.data.data;
  };

  return (
    <EntrenamientoPersonalContext.Provider
      value={{
        miProgresoEntrenamiento,
        crearRegistroEntrenamiento,
        misRegistrosEntrenamiento,
        eliminarRegistroEntrenamiento,
        catalogoEjercicios,
        crearRutina,
        misRutinas,
        rutinasCompartidas,
        actualizarRutina,
        eliminarRutina,
      }}
    >
      {children}
    </EntrenamientoPersonalContext.Provider>
  );
};

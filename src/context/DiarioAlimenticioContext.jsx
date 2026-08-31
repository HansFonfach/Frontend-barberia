import { createContext, useContext } from "react";
import {
  postComida,
  getComidas,
  deleteComida,
  postAgua,
  getAguaHoy,
  deleteAgua,
  postSuplemento,
  getSuplementos,
  deleteSuplemento,
  putTomaSuplemento,
} from "api/diarioAlimenticio";

// Diario alimenticio: bitácora personal de comidas + agua + suplementos,
// separada de EntrenamientoPersonalContext para no mezclar "lo que hago en
// el gym" con "lo que como" — ambas viven bajo el mismo módulo
// (entrenamientoPersonal) pero son datos y flujos distintos.
const DiarioAlimenticioContext = createContext();

export const useDiarioAlimenticio = () => {
  const context = useContext(DiarioAlimenticioContext);
  if (!context)
    throw new Error(
      "useDiarioAlimenticio must be used within a DiarioAlimenticioProvider",
    );
  return context;
};

export const DiarioAlimenticioProvider = ({ children }) => {
  // Sin try/catch: el formulario necesita saber si falló (ej: la foto no
  // subió) para avisar y no dar por registrada una comida que no se guardó.
  const crearComida = async (formData) => {
    const res = await postComida(formData);
    return res.data.data;
  };

  const misComidas = async (desde, hasta) => {
    try {
      const res = await getComidas(desde, hasta);
      return res.data.data || [];
    } catch (error) {
      console.error("Error en misComidas:", error);
      return [];
    }
  };

  const eliminarComida = async (id) => {
    const res = await deleteComida(id);
    return res.data.data;
  };

  const crearAgua = async (mililitros) => {
    const res = await postAgua(mililitros);
    return res.data.data;
  };

  const AGUA_VACIA = { registros: [], totalMililitros: 0 };
  const aguaHoy = async () => {
    try {
      const res = await getAguaHoy();
      return res.data.data || AGUA_VACIA;
    } catch (error) {
      console.error("Error en aguaHoy:", error);
      return AGUA_VACIA;
    }
  };

  const eliminarAgua = async (id) => {
    const res = await deleteAgua(id);
    return res.data.data;
  };

  const crearSuplemento = async (nombre) => {
    const res = await postSuplemento(nombre);
    return res.data.data;
  };

  const misSuplementos = async () => {
    try {
      const res = await getSuplementos();
      return res.data.data || [];
    } catch (error) {
      console.error("Error en misSuplementos:", error);
      return [];
    }
  };

  const eliminarSuplemento = async (id) => {
    const res = await deleteSuplemento(id);
    return res.data.data;
  };

  const toggleTomaSuplemento = async (id) => {
    const res = await putTomaSuplemento(id);
    return res.data.data;
  };

  return (
    <DiarioAlimenticioContext.Provider
      value={{
        crearComida,
        misComidas,
        eliminarComida,
        crearAgua,
        aguaHoy,
        eliminarAgua,
        crearSuplemento,
        misSuplementos,
        eliminarSuplemento,
        toggleTomaSuplemento,
      }}
    >
      {children}
    </DiarioAlimenticioContext.Provider>
  );
};

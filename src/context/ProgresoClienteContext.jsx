import { createContext, useContext } from "react";
import {
  getMiProgreso,
  postMedicionCorporal,
  getMisMedicionesCorporales,
  getMedicionesClienteCorporal,
  deleteMedicionCorporal,
  getComparativaBitacora,
} from "api/progresoCliente";

// Progreso del cliente: racha de constancia + resumen mensual + hitos
// (calculados a partir de asistencias reales, nunca inventados) y la
// bitácora de peso/medidas (100% descriptiva: acá no se interpreta nada,
// solo se guarda y se devuelve lo que la persona anotó).
const ProgresoClienteContext = createContext();

export const useProgresoCliente = () => {
  const context = useContext(ProgresoClienteContext);
  if (!context)
    throw new Error(
      "useProgresoCliente must be used within a ProgresoClienteProvider",
    );
  return context;
};

const PROGRESO_VACIO = {
  totalHistorico: 0,
  esteMes: 0,
  mesAnterior: 0,
  variacionMes: null,
  rachaSemanas: 0,
  hitos: [],
  proximoHito: null,
  faltanParaProximoHito: null,
};

export const ProgresoClienteProvider = ({ children }) => {
  const miProgreso = async () => {
    try {
      const res = await getMiProgreso();
      return res.data.data;
    } catch (error) {
      console.error("Error en miProgreso:", error);
      return PROGRESO_VACIO;
    }
  };

  const crearMedicionCorporal = async (data) => {
    const res = await postMedicionCorporal(data);
    return res.data.data;
  };

  const misMedicionesCorporales = async () => {
    try {
      const res = await getMisMedicionesCorporales();
      return res.data.data.mediciones || [];
    } catch (error) {
      console.error("Error en misMedicionesCorporales:", error);
      return [];
    }
  };

  const medicionesClienteCorporal = async (clienteId) => {
    try {
      const res = await getMedicionesClienteCorporal(clienteId);
      return res.data.data.mediciones || [];
    } catch (error) {
      console.error("Error en medicionesClienteCorporal:", error);
      return [];
    }
  };

  const eliminarMedicionCorporal = async (id) => {
    const res = await deleteMedicionCorporal(id);
    return res.data.data;
  };

  const comparativaBitacora = async () => {
    try {
      const res = await getComparativaBitacora();
      return res.data.data;
    } catch (error) {
      console.error("Error en comparativaBitacora:", error);
      return { disponible: false, motivo: "error" };
    }
  };

  return (
    <ProgresoClienteContext.Provider
      value={{
        miProgreso,
        crearMedicionCorporal,
        misMedicionesCorporales,
        medicionesClienteCorporal,
        eliminarMedicionCorporal,
        comparativaBitacora,
      }}
    >
      {children}
    </ProgresoClienteContext.Provider>
  );
};

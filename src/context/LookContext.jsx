import { createContext, useContext, useState } from "react";
import { getEstadoLookCliente } from "api/Look";

const LookContext = createContext();

export const LookProvider = ({ children }) => {
  const [lookData, setLookData] = useState(null);
  const [loadingLook, setLoadingLook] = useState(false);
  const [errorLook, setErrorLook] = useState(null);

  const estadoLookCliente = async (userId) => {
    try {
      setLoadingLook(true);
      setErrorLook(null);

      const data = await getEstadoLookCliente(userId); // ya es { corte, barba }
      setLookData(data);
      return data;
    } catch (err) {
      console.error("❌ Error al obtener estado del look:", err);
      setErrorLook(err);
      throw err;
    } finally {
      setLoadingLook(false);
    }
  };

  return (
    <LookContext.Provider
      value={{
        estadoLookCliente,
        lookData,
        loadingLook,
        errorLook,
      }}
    >
      {children}
    </LookContext.Provider>
  );
};

export const useLook = () => useContext(LookContext);

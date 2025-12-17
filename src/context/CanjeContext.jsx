import { getAllCanje } from "api/canjes";
import { postCreateCanje } from "api/canjes";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

/**
 * Context
 */
const CanjeContext = createContext(undefined);

/**
 * Hook seguro para consumir el context
 */
export const useCanje = () => {
  const context = useContext(CanjeContext);

  if (!context) {
    throw new Error("useCanje debe usarse dentro de un CanjeProvider");
  }

  return context;
};

/**
 * Provider
 */
export const CanjeProvider = ({ children }) => {
  // Estados base (sin lógica aún)
  const [canjes, setCanjes] = useState([]);
  const [selectedCanje, setSelectedCanje] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const crearCanje = async (data) => {
    try {
      const res = await postCreateCanje(data);
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const listarCanjes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getAllCanje();
      setCanjes(res.data.canjes);
    } catch (err) {
      setError("Error al listar canjes");
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setCanjes]);
  /**
   * Value memoizado
   * Evita renders innecesarios
   */
  const value = useMemo(
    () => ({
      canjes,
      setCanjes,
      selectedCanje,
      setSelectedCanje,
      loading,
      setLoading,
      error,
      setError,
      crearCanje,
      listarCanjes,
    }),
    [canjes, selectedCanje, loading, error, crearCanje]
  );

  return (
    <CanjeContext.Provider value={value}>{children}</CanjeContext.Provider>
  );
};

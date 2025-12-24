import {
  getAllCanje,
  postCanjearPuntos,
  postCreateCanje,
} from "api/canjes";
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
 * Hook seguro
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
  const [canjes, setCanjes] = useState([]);
  const [selectedCanje, setSelectedCanje] = useState(null);

  const [loading, setLoading] = useState(false); // carga general
  const [loadingCanje, setLoadingCanje] = useState(false); // SOLO canje
  const [error, setError] = useState(null);

  /* =========================
     LISTAR CANJES
  ========================= */
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
  }, []);

  /* =========================
     CREAR CANJE
  ========================= */
  const crearCanje = async (data) => {
    try {
      setLoading(true);
      const res = await postCreateCanje(data);
      return res.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     CANJEAR
  ========================= */
  const canjear = async (idCanje) => {
    try {
      setLoadingCanje(true);
      setError(null);

      const res = await postCanjearPuntos(idCanje);

      // 🔥 actualización optimista del stock
      setCanjes((prev) =>
        prev.map((c) =>
          c._id === idCanje ? { ...c, stock: c.stock - 1 } : c
        )
      );

      return res.data;
    } catch (error) {
      setError(error.response?.data?.message || "Error al canjear");
      throw error;
    } finally {
      setLoadingCanje(false);
    }
  };

  /* =========================
     VALUE
  ========================= */
  const value = useMemo(
    () => ({
      canjes,
      setCanjes,
      selectedCanje,
      setSelectedCanje,
      loading,
      loadingCanje,
      error,
      crearCanje,
      listarCanjes,
      canjear,
    }),
    [canjes, selectedCanje, loading, loadingCanje, error]
  );

  return (
    <CanjeContext.Provider value={value}>
      {children}
    </CanjeContext.Provider>
  );
};

import {
  postCrearVentaDirecta,
  getVentasDirectas,
  patchAnularVentaDirecta,
  getEstadisticasVentasDirectas,
} from "api/ventasDirectas";
import { createContext, useCallback, useContext, useState } from "react";

const VentaDirectaContext = createContext(undefined);

export const useVentaDirecta = () => {
  const context = useContext(VentaDirectaContext);
  if (!context) {
    throw new Error(
      "useVentaDirecta debe usarse dentro de un VentaDirectaProvider"
    );
  }
  return context;
};

export const VentaDirectaProvider = ({ children }) => {
  const [ventas, setVentas] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* =========================
     LISTAR
  ========================= */
  const listarVentas = useCallback(async (params) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getVentasDirectas(params);
      setVentas(res.data.ventas);
    } catch (err) {
      setError("Error al listar ventas directas");
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================
     CREAR
  ========================= */
  const crearVenta = async (data) => {
    try {
      setLoading(true);
      const res = await postCrearVentaDirecta(data);
      setVentas((prev) => [res.data.venta, ...prev]);
      return res.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     ANULAR
  ========================= */
  const anularVenta = async (id, motivoAnulacion = "") => {
    try {
      setLoading(true);
      const res = await patchAnularVentaDirecta(id, { motivoAnulacion });
      setVentas((prev) =>
        prev.map((v) => (v._id === id ? res.data.venta : v))
      );
      return res.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     ESTADÍSTICAS
  ========================= */
  const cargarEstadisticas = useCallback(async (params) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getEstadisticasVentasDirectas(params);
      setEstadisticas(res.data);
    } catch (err) {
      setError("Error al cargar estadísticas");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <VentaDirectaContext.Provider
      value={{
        ventas,
        estadisticas,
        loading,
        error,
        listarVentas,
        crearVenta,
        anularVenta,
        cargarEstadisticas,
      }}
    >
      {children}
    </VentaDirectaContext.Provider>
  );
};
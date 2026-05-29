import { postCreateProducto } from "api/productos";
import { putDeleteProducto } from "api/productos";
import { putUpdateProductos } from "api/productos";
import { getAllProductos } from "api/productos";
import { createContext, useCallback, useContext, useState } from "react";

const ProductoContext = createContext(undefined);

export const useProducto = () => {
  const context = useContext(ProductoContext);
  if (!context) {
    throw new Error("useProducto debe usarse dentro de un ProductoProvider");
  }
  return context;
};

/**
 * Provider
 */
export const ProductoProvider = ({ children }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false); // carga general

  const [error, setError] = useState(null);

  /* =========================
     LISTAR CANJES
  ========================= */
  const listarProductos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getAllProductos();
      setProductos(res.data.productos);
    } catch (err) {
      setError("Error al listar canjes");
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================
     CREAR CANJE
  ========================= */
  const crearProducto = async (data) => {
    try {
      setLoading(true);
      const res = await postCreateProducto(data);
      setProductos((prev) => [...prev, res.data.producto]);
      console.log("estoy aca");
      return res.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const actualizarProducto = async (data) => {
    try {
      setLoading(true);

      const { id, ...productoData } = data;

      const res = await putUpdateProductos(id, productoData);

      setProductos((prev) =>
        prev.map((p) =>
          p._id === res.data.producto._id ? res.data.producto : p,
        ),
      );

      return res.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const eliminarProducto = async (data) => {
    try {
      const { id, estado } = data;

      const res = await putDeleteProducto(id, estado);

      setProductos((prev) =>
        prev.map((p) =>
          p._id === res.data.producto._id ? res.data.producto : p,
        ),
      );
      return res.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProductoContext.Provider
      value={{
        crearProducto,
        listarProductos,
        actualizarProducto,
        eliminarProducto,
        productos,
        loading,
      }}
    >
      {children}
    </ProductoContext.Provider>
  );
};

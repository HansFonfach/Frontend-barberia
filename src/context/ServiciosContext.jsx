import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
} from "react";
import { getServicios, postCreateServicios } from "api/servicios";
import { postUpdateServicios } from "api/servicios";
import { postDeleteServicios } from "api/servicios";

const ServiciosContext = createContext();

export const useServicios = () => {
  const context = useContext(ServiciosContext);

  if (!context)
    throw new Error("useServicios debe usarse dentro de un ServiciosProvider");

  return context;
};

export const ServiciosProvider = ({ children }) => {
  const [servicios, setServicios] = useState([]);
  const [loadingServicios, setLoadingServicios] = useState(true);

  // Obtener todos los servicios
  const getAllServicios = useCallback(async () => {
    try {
      setLoadingServicios(true); // ⬅️ antes de llamar a la API
      const res = await getServicios();
      setServicios(res.data || []);
    } catch (error) {
      console.error("❌ Error al obtener los servicios:", error);
    } finally {
      setLoadingServicios(false); // ⬅️ después siempre
    }
  }, []);

  // Crear un nuevo servicio
  const crearServicio = useCallback(
    async (nombre, precio, duracion, descripcion) => {
      try {
        const res = await postCreateServicios({
          nombre,
          precio,
          duracion,
          descripcion,
        });
        await getAllServicios(); // refresca lista después de crear
        return res.data;
      } catch (err) {
        console.error("❌ Error al crear el servicio:", err);
        throw err;
      }
    },
    [getAllServicios]
  );

  const updateServicio = useCallback(
    async (id, data) => {
      try {
        const res = await postUpdateServicios(id, data);
        await getAllServicios(); // refresca lista
        return res.data;
      } catch (err) {
        console.error("❌ Error al actualizar el servicio:", err);
        throw err;
      }
    },
    [getAllServicios]
  );

  const deleteServicio = useCallback(
    async (id) => {
      try {
        console.log("Llamando a /servicios/" + id);
        const res = await postDeleteServicios(id);
        await getAllServicios(); // refresca lista
        return res.data;
      } catch (err) {
        console.error("❌ Error al eliminar el servicio:", err);
        throw err;
      }
    },
    [getAllServicios]
  );

  useEffect(() => {
    getAllServicios();
  }, [getAllServicios]);

  // Memoizar el value para evitar renders innecesarios
  const value = useMemo(
    () => ({
      servicios,
      loadingServicios, // ⬅️ agregar esto
      getAllServicios,
      crearServicio,
      updateServicio,
      deleteServicio,
    }),
    [
      servicios,
      loadingServicios, // ⬅️ y acá también
      getAllServicios,
      crearServicio,
      updateServicio,
      deleteServicio,
    ]
  );
  return (
    <ServiciosContext.Provider value={value}>
      {children}
    </ServiciosContext.Provider>
  );
};

export default ServiciosContext;

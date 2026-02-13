import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
} from "react";
import {
  getServicios,
  postCreateServicios,
  postUpdateServicios,
  postDeleteServicios,
  getServiciosBarbero, // ✅ tu función de API
} from "api/servicios";

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
  const [serviciosBarberos, setServiciosBarberos] = useState({}); // servicios por barbero

  // ────────────────────────────────
  // Obtener todos los servicios
  // ────────────────────────────────
  const getAllServicios = useCallback(async () => {
    try {
      setLoadingServicios(true);
      const res = await getServicios();
      setServicios(res.data || []);
    } catch (error) {
      console.error("❌ Error al obtener los servicios:", error);
    } finally {
      setLoadingServicios(false);
    }
  }, []);

  // ────────────────────────────────
  // Obtener servicios de un barbero
  // ────────────────────────────────
  const cargarServiciosBarbero = useCallback(async (barberoId) => {
    try {
      const res = await getServiciosBarbero(barberoId); // axiosPrivate.get(...)
      const data = res.data || [];
      setServiciosBarberos((prev) => ({ ...prev, [barberoId]: data }));

      return data;
    } catch (error) {
      console.error("❌ Error cargando servicios del barbero:", error);
      setServiciosBarberos((prev) => ({ ...prev, [barberoId]: [] }));
      return [];
    }
  }, []);

  // ────────────────────────────────
  // Crear un nuevo servicio
  // ────────────────────────────────
  const crearServicio = useCallback(
    async (nombre, precio, descripcion, slug) => {
      try {
        const res = await postCreateServicios({ nombre, precio, descripcion, slug });
        await getAllServicios();
        return res.data;
      } catch (err) {
        console.error("❌ Error al crear el servicio:", err);
        throw err;
      }
    },
    [getAllServicios],
  );

  // ────────────────────────────────
  // Actualizar servicio
  // ────────────────────────────────
  const updateServicio = useCallback(
    async (id, data) => {
      try {
        const res = await postUpdateServicios(id, data);
        await getAllServicios();
        return res.data;
      } catch (err) {
        console.error("❌ Error al actualizar el servicio:", err);
        throw err;
      }
    },
    [getAllServicios],
  );

  // ────────────────────────────────
  // Eliminar servicio
  // ────────────────────────────────
  const deleteServicio = useCallback(
    async (id) => {
      try {
        const res = await postDeleteServicios(id);
        await getAllServicios();
        return res.data;
      } catch (err) {
        console.error("❌ Error al eliminar el servicio:", err);
        throw err;
      }
    },
    [getAllServicios],
  );

  // ────────────────────────────────
  // Cargar servicios al montar el provider
  // ────────────────────────────────
  useEffect(() => {
    getAllServicios();
  }, [getAllServicios]);

  // ────────────────────────────────
  // Value del context
  // ────────────────────────────────
  const value = useMemo(
    () => ({
      servicios,
      loadingServicios,
      getAllServicios,
      crearServicio,
      updateServicio,
      deleteServicio,
      serviciosBarberos, // servicios por barbero
      cargarServiciosBarbero, // función para traer servicios de un barbero
    }),
    [
      servicios,
      loadingServicios,
      getAllServicios,
      crearServicio,
      updateServicio,
      deleteServicio,
      serviciosBarberos,
      cargarServiciosBarbero,
    ],
  );

  return (
    <ServiciosContext.Provider value={value}>
      {children}
    </ServiciosContext.Provider>
  );
};

export default ServiciosContext;

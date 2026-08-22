import React, {
  createContext,
  useState,
  useCallback,
  useMemo,
  useContext,
} from "react";
import {
  getPlanesSuscripcion,
  postCrearPlanSuscripcion,
  putActualizarPlanSuscripcion,
  patchToggleActivoPlanSuscripcion,
  deletePlanSuscripcion,
} from "api/planesSuscripcion";

const PlanesSuscripcionContext = createContext();

export const usePlanesSuscripcion = () => {
  const context = useContext(PlanesSuscripcionContext);
  if (!context)
    throw new Error(
      "usePlanesSuscripcion debe usarse dentro de un PlanesSuscripcionProvider",
    );
  return context;
};

export const PlanesSuscripcionProvider = ({ children }) => {
  const [planes, setPlanes] = useState([]);
  const [loadingPlanes, setLoadingPlanes] = useState(true);

  const getAllPlanes = useCallback(async (todos = true) => {
    try {
      setLoadingPlanes(true);
      const res = await getPlanesSuscripcion(todos);
      setPlanes(res.data?.planes || []);
    } catch (error) {
      console.error("❌ Error al obtener los planes de suscripción:", error);
    } finally {
      setLoadingPlanes(false);
    }
  }, []);

  const crearPlan = useCallback(
    async (data) => {
      const res = await postCrearPlanSuscripcion(data);
      await getAllPlanes();
      return res.data;
    },
    [getAllPlanes],
  );

  const actualizarPlan = useCallback(
    async (id, data) => {
      const res = await putActualizarPlanSuscripcion(id, data);
      await getAllPlanes();
      return res.data;
    },
    [getAllPlanes],
  );

  const toggleActivoPlan = useCallback(
    async (id) => {
      const res = await patchToggleActivoPlanSuscripcion(id);
      await getAllPlanes();
      return res.data;
    },
    [getAllPlanes],
  );

  const eliminarPlan = useCallback(
    async (id) => {
      const res = await deletePlanSuscripcion(id);
      await getAllPlanes();
      return res.data;
    },
    [getAllPlanes],
  );

  const value = useMemo(
    () => ({
      planes,
      loadingPlanes,
      getAllPlanes,
      crearPlan,
      actualizarPlan,
      toggleActivoPlan,
      eliminarPlan,
    }),
    [
      planes,
      loadingPlanes,
      getAllPlanes,
      crearPlan,
      actualizarPlan,
      toggleActivoPlan,
      eliminarPlan,
    ],
  );

  return (
    <PlanesSuscripcionContext.Provider value={value}>
      {children}
    </PlanesSuscripcionContext.Provider>
  );
};

export default PlanesSuscripcionContext;

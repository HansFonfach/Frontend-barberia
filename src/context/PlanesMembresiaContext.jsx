import React, {
  createContext,
  useState,
  useCallback,
  useMemo,
  useContext,
} from "react";
import {
  getPlanesMembresia,
  postCrearPlanMembresia,
  putActualizarPlanMembresia,
  patchToggleActivoPlan,
  deletePlanMembresia,
} from "api/planesMembresia";

const PlanesMembresiaContext = createContext();

export const usePlanesMembresia = () => {
  const context = useContext(PlanesMembresiaContext);
  if (!context)
    throw new Error(
      "usePlanesMembresia debe usarse dentro de un PlanesMembresiaProvider",
    );
  return context;
};

export const PlanesMembresiaProvider = ({ children }) => {
  const [planes, setPlanes] = useState([]);
  const [loadingPlanes, setLoadingPlanes] = useState(true);

  const getAllPlanes = useCallback(async (todos = true) => {
    try {
      setLoadingPlanes(true);
      const res = await getPlanesMembresia(todos);
      setPlanes(res.data?.planes || []);
    } catch (error) {
      console.error("❌ Error al obtener los planes de membresía:", error);
    } finally {
      setLoadingPlanes(false);
    }
  }, []);

  const crearPlan = useCallback(
    async (data) => {
      const res = await postCrearPlanMembresia(data);
      await getAllPlanes();
      return res.data;
    },
    [getAllPlanes],
  );

  const actualizarPlan = useCallback(
    async (id, data) => {
      const res = await putActualizarPlanMembresia(id, data);
      await getAllPlanes();
      return res.data;
    },
    [getAllPlanes],
  );

  const toggleActivoPlan = useCallback(
    async (id) => {
      const res = await patchToggleActivoPlan(id);
      await getAllPlanes();
      return res.data;
    },
    [getAllPlanes],
  );

  const eliminarPlan = useCallback(
    async (id) => {
      const res = await deletePlanMembresia(id);
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
    <PlanesMembresiaContext.Provider value={value}>
      {children}
    </PlanesMembresiaContext.Provider>
  );
};

export default PlanesMembresiaContext;

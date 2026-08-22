import React, {
  createContext,
  useState,
  useCallback,
  useMemo,
  useContext,
} from "react";
import {
  getClases,
  postCrearClase,
  putActualizarClase,
  patchToggleActivaClase,
  deleteClase,
  getSesionesClases,
  getInscritosSesion,
  postInscribirCliente,
  patchCancelarInscripcion,
  getMisInscripciones,
} from "api/clases";

const ClasesContext = createContext();

export const useClases = () => {
  const context = useContext(ClasesContext);
  if (!context)
    throw new Error("useClases debe usarse dentro de un ClasesProvider");
  return context;
};

export const ClasesProvider = ({ children }) => {
  const [clases, setClases] = useState([]);
  const [loadingClases, setLoadingClases] = useState(true);

  // ────────────────────────────────
  // Obtener todas las clases (todas = true incluye inactivas)
  // ────────────────────────────────
  const getAllClases = useCallback(async (todas = true) => {
    try {
      setLoadingClases(true);
      const res = await getClases(todas);
      setClases(res.data?.clases || []);
    } catch (error) {
      console.error("❌ Error al obtener las clases:", error);
    } finally {
      setLoadingClases(false);
    }
  }, []);

  // ────────────────────────────────
  // Crear una clase nueva
  // ────────────────────────────────
  const crearClase = useCallback(
    async (data) => {
      const res = await postCrearClase(data);
      await getAllClases();
      return res.data;
    },
    [getAllClases],
  );

  // ────────────────────────────────
  // Actualizar clase
  // ────────────────────────────────
  const actualizarClase = useCallback(
    async (id, data) => {
      const res = await putActualizarClase(id, data);
      await getAllClases();
      return res.data;
    },
    [getAllClases],
  );

  // ────────────────────────────────
  // Activar / desactivar clase
  // ────────────────────────────────
  const toggleActivaClase = useCallback(
    async (id) => {
      const res = await patchToggleActivaClase(id);
      await getAllClases();
      return res.data;
    },
    [getAllClases],
  );

  // ────────────────────────────────
  // Eliminar clase
  // ────────────────────────────────
  const eliminarClase = useCallback(
    async (id) => {
      const res = await deleteClase(id);
      await getAllClases();
      return res.data;
    },
    [getAllClases],
  );

  // ────────────────────────────────
  // Sesiones generadas de una clase (o de todas) en un rango de fechas
  // ────────────────────────────────
  const getSesiones = useCallback(async (params = {}) => {
    const res = await getSesionesClases(params);
    return res.data?.sesiones || [];
  }, []);

  // ────────────────────────────────
  // Inscritos de una sesión puntual
  // ────────────────────────────────
  const getInscritos = useCallback(async (claseId, fecha) => {
    const res = await getInscritosSesion(claseId, fecha);
    return res.data?.inscritos || [];
  }, []);

  // ────────────────────────────────
  // Inscribir a un cliente en una sesión puntual
  // ────────────────────────────────
  const inscribirCliente = useCallback(async (claseId, data) => {
    const res = await postInscribirCliente(claseId, data);
    return res.data;
  }, []);

  // ────────────────────────────────
  // Cancelar la inscripción de un cliente a una sesión
  // ────────────────────────────────
  const cancelarInscripcion = useCallback(async (inscripcionId, motivo) => {
    const res = await patchCancelarInscripcion(inscripcionId, motivo);
    return res.data;
  }, []);

  // ────────────────────────────────
  // Mis inscripciones (vista del cliente logueado)
  // ────────────────────────────────
  const misInscripciones = useCallback(async () => {
    const res = await getMisInscripciones();
    return res.data?.inscripciones || [];
  }, []);

  const value = useMemo(
    () => ({
      clases,
      loadingClases,
      getAllClases,
      crearClase,
      actualizarClase,
      toggleActivaClase,
      eliminarClase,
      getSesiones,
      getInscritos,
      inscribirCliente,
      cancelarInscripcion,
      misInscripciones,
    }),
    [
      clases,
      loadingClases,
      getAllClases,
      crearClase,
      actualizarClase,
      toggleActivaClase,
      eliminarClase,
      getSesiones,
      getInscritos,
      inscribirCliente,
      cancelarInscripcion,
      misInscripciones,
    ],
  );

  return (
    <ClasesContext.Provider value={value}>{children}</ClasesContext.Provider>
  );
};

export default ClasesContext;

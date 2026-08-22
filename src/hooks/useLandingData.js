import { useEffect, useState } from "react";
import { getServiciosPublicos } from "api/servicios";
import { getBarberosPublico } from "api/usuarios";
import { getClasesPublicas } from "api/clases";
import { getPlanesPublicos } from "api/planesMembresia";

export const useLandingData = (slug) => {
  const [servicios, setServicios] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [clases, setClases] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [serviciosRes, profesionalesRes, clasesRes, planesRes] =
          await Promise.all([
            getServiciosPublicos(slug),
            getBarberosPublico(slug),
            // Estos dos solo devuelven algo si la empresa tiene el módulo
            // de clases grupales activo; para el resto (barberías, salones)
            // quedan en [].
            getClasesPublicas(slug).catch(() => null),
            getPlanesPublicos(slug).catch(() => null),
          ]);

        setServicios(serviciosRes?.data?.servicios || []);
        setProfesionales(profesionalesRes?.data || []);
        setClases(clasesRes?.data?.clases || []);
        setPlanes(planesRes?.data?.planes || []);
      } catch (error) {
        console.error("Error cargando landing:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  return {
    servicios,
    profesionales,
    clases,
    planes,
    loading,
  };
};

import { useEffect, useState } from "react";
import { getServiciosPublicos } from "api/servicios";
import { getBarberosPublico } from "api/usuarios";

export const useLandingData = (slug) => {
  const [servicios, setServicios] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [serviciosRes, profesionalesRes] = await Promise.all([
          getServiciosPublicos(slug),
          getBarberosPublico(slug),
        ]);

        setServicios(serviciosRes?.data?.servicios || []);
        setProfesionales(profesionalesRes?.data || []);
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
    loading,
  };
};
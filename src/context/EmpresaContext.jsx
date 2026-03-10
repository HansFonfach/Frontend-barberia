import { createContext, useContext, useState, useEffect } from "react";
import { getEmpresaPorSlug, patchActualizarEmpresa } from "api/empresa";
import { useParams } from "react-router-dom";

export const EmpresaContext = createContext();

export const EmpresaProvider = ({ children }) => {
  const { slug } = useParams();
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const fetchEmpresa = async () => {
      if (!slug) return;
      try {
        const res = await getEmpresaPorSlug(slug);
        setEmpresa(res.data);
      } catch (error) {
        console.error("Error cargando empresa pública:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresa();
  }, [slug]);

  const actualizarEmpresa = async (datos) => {
    setGuardando(true);
    try {
      const res = await patchActualizarEmpresa(datos);
      setEmpresa(res.data); // ✅ actualiza el contexto con los nuevos datos
      return res.data;
    } catch (error) {
      console.error("Error actualizando empresa:", error);
      throw error;
    } finally {
      setGuardando(false);
    }
  };

  return (
    <EmpresaContext.Provider value={{ empresa, loading, guardando, actualizarEmpresa }}>
      {children}
    </EmpresaContext.Provider>
  );
};

export const useEmpresa = () => useContext(EmpresaContext);
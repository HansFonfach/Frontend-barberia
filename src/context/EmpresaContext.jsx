import { createContext, useContext, useState, useEffect } from "react";
import { getEmpresaPorSlug } from "api/empresa";
import { useParams } from "react-router-dom";

export const EmpresaContext = createContext();

export const EmpresaProvider = ({ children }) => {
  const { slug } = useParams();
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <EmpresaContext.Provider value={{ empresa, loading }}>
      {children}
    </EmpresaContext.Provider>
  );
};

export const useEmpresa = () => useContext(EmpresaContext);

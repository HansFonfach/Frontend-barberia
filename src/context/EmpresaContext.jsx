import { createContext, useContext, useState, useEffect } from "react";
import { getEmpresaPorSlug, patchActualizarEmpresa } from "api/empresa";
import { useParams } from "react-router-dom";

export const EmpresaContext = createContext();

// Genera variante clara (para fondos/badges)
const getLightVariant = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},0.12)`;
};

// Genera variante oscura (para hover)
const getDarkVariant = (hex) => {
  const r = Math.floor(parseInt(hex.slice(1, 3), 16) * 0.8);
  const g = Math.floor(parseInt(hex.slice(3, 5), 16) * 0.8);
  const b = Math.floor(parseInt(hex.slice(5, 7), 16) * 0.8);
  return `rgb(${r},${g},${b})`;
};

const aplicarColores = (colores) => {
  if (!colores) return;
  const root = document.documentElement;

  root.style.setProperty("--color-primary", colores.primario);
  root.style.setProperty("--color-primary-light", getLightVariant(colores.primario));
  root.style.setProperty("--color-primary-dark", getDarkVariant(colores.primario));
  root.style.setProperty("--color-secondary", colores.secundario);
  root.style.setProperty("--color-bg", colores.fondo);
  root.style.setProperty("--color-text", colores.texto);
  root.style.setProperty("--color-text-muted", colores.textoMuted);
};

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
        aplicarColores(res.data.colores); // 👈 inyecta al cargar
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
      setEmpresa(res.data);
      aplicarColores(res.data.colores); // 👈 inyecta al guardar cambios
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
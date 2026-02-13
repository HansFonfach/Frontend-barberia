import { useParams } from "react-router-dom";
import { EmpresaProvider } from "context/EmpresaContext";

const EmpresaWrapper = ({ children }) => {
  const { slug } = useParams();

  if (!slug) {
    // si no hay slug, muestra algo en lugar de blanco
    return (
      <div className="text-center mt-5">
        <h3>Empresa no encontrada</h3>
        <p>Revisa que la URL sea correcta.</p>
      </div>
    );
  }

  return <EmpresaProvider slug={slug}>{children}</EmpresaProvider>;
};

export default EmpresaWrapper;

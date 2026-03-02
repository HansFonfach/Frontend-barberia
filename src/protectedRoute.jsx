import { Navigate, Outlet, useParams } from "react-router-dom";
import { useAuth } from "context/AuthContext";

export default function ProtectedRoute() {
  const { slug } = useParams();
  const { isAuthenticated, loading, initialCheckDone, user } = useAuth();

  if (loading || !initialCheckDone) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-warning" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/${slug}/login`} replace />;
  }

  // 👇 Si el slug de la URL no coincide con el de tu empresa, redirige
  const slugDeEmpresa = user?.empresa?.slug;
  if (slugDeEmpresa && slug !== slugDeEmpresa) {
    return <Navigate to={`/${slugDeEmpresa}/admin/dashboard`} replace />;
  }

  return <Outlet />;
}
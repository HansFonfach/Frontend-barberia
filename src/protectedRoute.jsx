import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "context/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, loading, initialCheckDone } = useAuth();

  // Mientras verifica sesión
  if (loading || !initialCheckDone) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // Si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Si está autenticado
  return <Outlet />;
}

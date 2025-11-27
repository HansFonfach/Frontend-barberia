import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "context/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  // Mientras verifica sesión, no renderizar nada (o muestra spinner)
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // Si no está autenticado (y ya terminó de verificar)
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Si está autenticado, renderiza la ruta
  return <Outlet />;
}

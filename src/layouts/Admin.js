import React from "react";
import { useLocation, Route, Routes, Navigate } from "react-router-dom";
import { Container } from "reactstrap";
import AdminNavbar from "components/Navbars/AdminNavbar.jsx";
import AdminFooter from "components/Footers/AdminFooter.js";
import Sidebar from "components/Sidebar/Sidebar.jsx";
import { useAuth } from "context/AuthContext";
import { clienteRoutes, barberoRoutes } from "./../routes";
import { useEmpresa } from "context/EmpresaContext";

const AdminLayout = (props) => {
  const mainContent = React.useRef(null);
  const location = useLocation();
  const { user } = useAuth();
  const { empresa, loading } = useEmpresa();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const routes = user?.rol === "barbero" ? barberoRoutes : clienteRoutes;

  // 🔥 1️⃣ Mientras carga la empresa
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  // 🔥 2️⃣ Si no existe empresa (seguridad extra)
  if (!empresa) {
    return null;
  }

  return (
    <>
      <Sidebar
        {...props}
        routes={routes}
        logo={{
          innerLink: "/admin/index",
          imgSrc: empresa.logo, // 👈 ya no hay fallback incorrecto
          imgAlt: empresa.nombre || "Logo Empresa",
        }}
      />

      <div className="main-content" ref={mainContent}>
        <AdminNavbar
          {...props}
          brandText={empresa.nombre} // 👈 mejor usar nombre empresa
        />

        <Routes>
          {routes.map((r, idx) => (
            <Route key={idx} path={r.path} element={r.component} />
          ))}

          {user?.rol === "barbero" ? (
            <Route
              path="*"
              element={<Navigate to="/admin/dashboard" replace />}
            />
          ) : (
            <Route
              path="*"
              element={<Navigate to="/admin/index" replace />}
            />
          )}
        </Routes>

        <Container fluid>
          <AdminFooter />
        </Container>
      </div>
    </>
  );
};

export default AdminLayout;
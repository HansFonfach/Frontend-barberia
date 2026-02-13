import React from "react";
import { useLocation, Route, Routes, Navigate } from "react-router-dom";
import { Container } from "reactstrap";
import AdminNavbar from "components/Navbars/AdminNavbar.jsx";
import AdminFooter from "components/Footers/AdminFooter.js";
import Sidebar from "components/Sidebar/Sidebar.jsx";
import { useAuth } from "context/AuthContext";
import { clienteRoutes, barberoRoutes } from "./../routes";

const AdminLayout = (props) => {
  const mainContent = React.useRef(null);
  const location = useLocation();
  const { user } = useAuth();

React.useEffect(() => {
  window.scrollTo(0, 0);
}, [location]);

  const routes = user?.rol === "barbero" ? barberoRoutes : clienteRoutes;

  return (
    <>
      <Sidebar
        {...props}
        routes={routes}
        logo={{
          innerLink: "/admin/index",
          imgSrc: require("../assets/img/brand/lasanta.png"),
          imgAlt: "Logo",
        }}
      />
      <div className="main-content" ref={mainContent}>
        <AdminNavbar
          {...props}
          brandText={user?.rol === "barbero" ? "Dashboard" : "Inicio"}
        />
        <Routes>
          {routes.map((r, idx) => (
            <Route key={idx} path={r.path} element={r.component} />
          ))}
          {/* Redirección por defecto según rol */}
          {user?.rol === "barbero" ? (
            <Route
              path="*"
              element={<Navigate to="/admin/dashboard" replace />}
            />
          ) : (
            <Route path="*" element={<Navigate to="/admin/index" replace />} />
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

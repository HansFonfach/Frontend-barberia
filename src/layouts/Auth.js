import React from "react";
import { useLocation, Route, Routes, Navigate } from "react-router-dom";
// reactstrap components
import { Container, Row, Col } from "reactstrap";

// core components
import AuthNavbar from "components/Navbars/AuthNavbar.jsx";
import AuthFooter from "components/Footers/AuthFooter.js";

import { publicRoutes } from "routes.js";
import { useAuth } from "context/AuthContext";

const Auth = (props) => {
  const mainContent = React.useRef(null);
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  React.useEffect(() => {
    document.body.classList.add("bg-default");
    return () => document.body.classList.remove("bg-default");
  }, []);

  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainContent.current.scrollTop = 0;
  }, [location]);

  // Redirige al dashboard si ya está logueado
  if (isAuthenticated) {
    return <Navigate to={user?.rol === "barbero" ? "/admin/dashboard" : "/admin/index"} replace />;
  }

  return (
    <>
      <div className="main-content" ref={mainContent}>
        <AuthNavbar />
        <div className="header bg-gradient-info py-7 py-lg-8">
          <Container>
            <div className="header-body text-center mb-7">
              <Row className="justify-content-center">
                <Col lg="5" md="6">
                  <h1 className="text-white">BIENVENIDO!</h1>
                  <p className="text-lead text-light">
                    Bienvenido al sistema de reserva de horas para
                    <span className="text-white d-block">La Santa Barbería.</span>
                  </p>
                </Col>
              </Row>
            </div>
          </Container>
          <div className="separator separator-bottom separator-skew zindex-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              version="1.1"
              viewBox="0 0 2560 100"
              x="0"
              y="0"
            >
              <polygon className="fill-default" points="2560 0 2560 100 0 100" />
            </svg>
          </div>
        </div>
        {/* Page content */}
        <Container className="mt--8 pb-5">
          <Row className="justify-content-center">
            <Routes>
              {publicRoutes.map((r, key) => (
                <Route path={r.path} element={r.component} key={key} />
              ))}
              <Route path="*" element={<Navigate to="/auth/login" replace />} />
            </Routes>
          </Row>
        </Container>
      </div>
      <AuthFooter />
    </>
  );
};

export default Auth;

import React from "react";
import {
  useLocation,
  Route,
  Routes,
  Navigate,
  useParams,
} from "react-router-dom";
import { Container, Row, Col } from "reactstrap";

import AuthNavbar from "components/Navbars/AuthNavbar.jsx";
import AuthFooter from "components/Footers/AuthFooter.js";

import Login from "views/pages/Login";
import Register from "views/pages/Register";

import { useAuth } from "context/AuthContext";
import { useEmpresa } from "context/EmpresaContext";

const Auth = () => {
  const mainContent = React.useRef(null);
  const location = useLocation();
  const { slug } = useParams();

  const { isAuthenticated, user } = useAuth();
  const { empresa } = useEmpresa();

  React.useEffect(() => {
    document.body.classList.add("bg-default");
    return () => document.body.classList.remove("bg-default");
  }, []);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // ✅ Redirige manteniendo slug
  if (isAuthenticated) {
    return (
      <Navigate
        to={`/${slug}/admin/${user?.rol === "barbero" ? "dashboard" : "index"}`}
        replace
      />
    );
  }

  return (
    <>
      <div className="main-content" ref={mainContent}>
        <AuthNavbar />

        {/* HEADER */}
        <div className="header bg-gradient-info py-7 py-lg-8">
          <Container>
            <div className="header-body text-center mb-7">
              <Row className="justify-content-center">
                <Col lg="5" md="6">
                  <h1 className="text-white">¡Bienvenido!</h1>
                  <p className="text-lead text-light">
                   
                  </p>
                </Col>
              </Row>
            </div>
          </Container>

          <div className="separator separator-bottom separator-skew zindex-100">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2560 100">
              <polygon
                className="fill-default"
                points="2560 0 2560 100 0 100"
              />
            </svg>
          </div>
        </div>

        {/* CONTENT */}
        <Container className="mt--8 pb-5">
          <Row className="justify-content-center">
            <Routes>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route
                path="*"
                element={<Navigate to={`/${slug}/login`} replace />}
              />
            </Routes>
          </Row>
        </Container>
      </div>

      <AuthFooter />
    </>
  );
};

export default Auth;

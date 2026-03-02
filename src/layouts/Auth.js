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
import ForgotPassword from "views/publico/ForgotPassword";
import ReiniciarContraseña from "views/publico/ReiniciarContraseña";

const Auth = () => {
  const mainContent = React.useRef(null);
  const location = useLocation();
  const { slug } = useParams();

  const { isAuthenticated, user } = useAuth();
  const { empresa } = useEmpresa();

  const isLumica = slug === "lumicabeauty";

  const theme = isLumica
    ? {
        primary: "#FF5DA1",
        primaryLight: "#FFE4F0",
        primaryDark: "#E64D8F",
        heroBg: "linear-gradient(135deg, #FF5DA1 0%, #E64D8F 100%)",
        fillColor: "#FFFFFF",
        headerClass: null,
      }
    : {
        primary: "#5e72e4",
        primaryLight: "#eaecfe",
        primaryDark: "#324cdd",
        heroBg: null,
        fillColor: null,
        headerClass: "bg-gradient-info",
      };

  React.useEffect(() => {
    if (isLumica) {
      document.body.classList.remove("bg-default");
      document.body.style.backgroundColor = "#FFF5FA";
    } else {
      document.body.classList.add("bg-default");
      document.body.style.backgroundColor = "";
    }
    return () => {
      document.body.classList.remove("bg-default");
      document.body.style.backgroundColor = "";
    };
  }, [isLumica]);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

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
        <div
          className={!isLumica ? "header bg-gradient-info py-7 py-lg-8" : "header py-7 py-lg-8"}
          style={isLumica ? { background: theme.heroBg } : {}}
        >
          <Container>
            <div className="header-body text-center mb-7">
              <Row className="justify-content-center">
                <Col lg="5" md="6">
                  <h1 className="text-white">¡Bienvenido!</h1>
                  {isLumica && (
                    <p className="text-white" style={{ opacity: 0.9 }}>
                      ✨ {empresa?.nombre || "Lumica Beauty"}
                    </p>
                  )}
                </Col>
              </Row>
            </div>
          </Container>

          <div className="separator separator-bottom separator-skew zindex-100">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2560 100">
              <polygon
                style={isLumica ? { fill: "#FFF5FA" } : {}}
                className={!isLumica ? "fill-default" : ""}
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
              <Route path="recuperar-contrasena" element={<ForgotPassword />} />
              <Route
                path="reiniciar-contrasena/:token"
                element={<ReiniciarContraseña />}
              />
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
import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  CardBody,
  Button,
  Navbar,
  Nav,
  NavItem,
} from "reactstrap";
// 1. Agregamos useParams para capturar el slug
import { Link, useLocation, useParams } from "react-router-dom";
// 2. Importamos tu servicio

import {
  FiCalendar,
  FiInstagram,
  FiSmartphone,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiClock,
} from "react-icons/fi";
import { getConfirmarAsistencia } from "api/reservas";

const ConfirmacionResultado = () => {
  const location = useLocation();
  const { slug } = useParams(); // Capturamos el slug de la URL (/:slug/confirmar-reserva)
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true); // Estado para saber si estamos llamando a la API
  const [config, setConfig] = useState({
    icon: <FiClock size={50} className="text-primary" />,
    title: "Procesando...",
    message: "Estamos verificando tu solicitud.",
    color: "primary",
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const respuestaDirecta = params.get("respuesta");
    const errorDirecto = params.get("error");
    const yaRespondida = params.get("ya_respondida");
    const token = params.get("token");

    if (errorDirecto) {
      actualizarUI(null, errorDirecto, yaRespondida === "true");
      return;
    }

    // ✅ Si hay token y respuesta, llamar al backend primero
    if (token && respuestaDirecta) {
      getConfirmarAsistencia(token, respuestaDirecta)
        .then(() => {
          actualizarUI(respuestaDirecta, null);
        })
        .catch((err) => {
          const errorType = err.response?.data?.error || "servidor";
          actualizarUI(null, errorType);
        });
      return;
    }

    // Sin token, solo mostrar resultado
    if (respuestaDirecta) {
      actualizarUI(respuestaDirecta, null, yaRespondida === "true");
      return;
    }

    actualizarUI(null, "servidor");
  }, [location]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const respuestaDirecta = params.get("respuesta");
    const errorDirecto = params.get("error");
    const yaRespondida = params.get("ya_respondida");
    const token = params.get("token"); // El token que viene en el link del correo

    // Función interna para actualizar la UI según el resultado
    const actualizarUI = (res, err, repetida = false) => {
      setLoading(false);
      if (err) {
        const errorConfigs = {
          politica: {
            icon: <FiAlertCircle size={50} className="text-warning" />,
            title: "Fuera de plazo",
            message:
              "El tiempo límite para cancelar ha expirado según las políticas.",
            color: "warning",
          },
          expirado: {
            icon: <FiXCircle size={50} className="text-danger" />,
            title: "Link Expirado",
            message: "Esta reserva ya ha pasado o el link ya no es válido.",
            color: "danger",
          },
          token: {
            icon: <FiXCircle size={50} className="text-danger" />,
            title: "Link Inválido",
            message: "El código de confirmación no es correcto.",
            color: "danger",
          },
          servidor: {
            icon: <FiAlertCircle size={50} className="text-muted" />,
            title: "Error técnico",
            message: "Hubo un problema. Intenta más tarde.",
            color: "secondary",
          },
        };
        setConfig(errorConfigs[err] || errorConfigs.servidor);
      } else if (res === "confirma") {
        setConfig({
          icon: <FiCheckCircle size={50} className="text-success" />,
          title: repetida ? "Ya confirmada" : "¡Cita Confirmada!",
          message: repetida
            ? "Esta cita ya había sido confirmada. ¡Te esperamos!"
            : "Gracias por confirmar. Tu profesional ha sido notificado.",
          color: "success",
        });
      } else if (res === "cancela") {
        setConfig({
          icon: <FiXCircle size={50} className="text-danger" />,
          title: "Cita Cancelada",
          message: "Tu reserva ha sido cancelada exitosamente.",
          color: "danger",
        });
      }
    };

    // LÓGICA DE DECISIÓN:
    // A. Si el backend ya nos mandó el resultado en la URL (?respuesta=...)
    if (respuestaDirecta || errorDirecto) {
      actualizarUI(respuestaDirecta, errorDirecto, yaRespondida === "true");
    }
    // B. Si solo viene el token, llamamos a la API usando tu servicio
    else if (token) {
      getConfirmarAsistencia(token)
        .then(() => {
          actualizarUI("confirma", null);
        })
        .catch((err) => {
          // Capturamos el error que venga del backend
          const errorType = err.response?.data?.error || "servidor";
          actualizarUI(null, errorType);
        });
    } else {
      // C. No hay nada en la URL
      actualizarUI(null, "servidor");
    }
  }, [location]);

  return (
    <div
      style={{
        backgroundColor: "#f8f9fe",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar
        fixed="top"
        expand="md"
        className={scrolled ? "bg-white shadow-sm py-2" : "bg-white py-3"}
      >
        <Container>
          <Link
            to={`/${slug}`}
            className="navbar-brand d-flex align-items-center font-weight-bold"
          >
            <FiCalendar className="mr-2" style={{ color: "#f72585" }} />
            Agenda<span style={{ color: "#4361ee" }}>Fonfach</span>
          </Link>
          <Nav className="ml-auto" navbar>
            <NavItem>
              <Button
                className="text-white"
                size="sm"
                style={{ background: "#4361ee", borderRadius: "50px" }}
                onClick={() => (window.location.href = `/${slug}`)} // Redirigir a la barbería específica
              >
                Ir al Inicio
              </Button>
            </NavItem>
          </Nav>
        </Container>
      </Navbar>

      <Container
        className="d-flex align-items-center justify-content-center flex-grow-1"
        style={{ paddingTop: "100px" }}
      >
        <Card
          className="border-0 shadow-lg"
          style={{ maxWidth: 450, width: "100%", borderRadius: 25 }}
        >
          <div
            style={{
              height: "6px",
              backgroundColor: loading ? "#4361ee" : `var(--${config.color})`,
            }}
          />
          <CardBody className="text-center p-5">
            <div className="mb-4">{config.icon}</div>
            <h2 className="font-weight-bold mb-3">{config.title}</h2>
            <p className="text-muted mb-4">{config.message}</p>
            <hr className="my-4" />
            <Button
              color="secondary"
              outline
              block
              className="rounded-pill"
              onClick={() => window.close()}
            >
              Cerrar ventana
            </Button>
          </CardBody>
        </Card>
      </Container>

      <footer className="py-4 bg-white border-top">
        <Container>
          <div className="d-flex flex-column align-items-center">
            <div className="mb-3">
              <a
                href="https://instagram.com/hans.fonfach"
                className="mx-3 text-muted"
              >
                <FiInstagram size={22} />
              </a>
              <a href="https://wa.me/56975297584" className="mx-3 text-muted">
                <FiSmartphone size={22} />
              </a>
            </div>
            <p className="text-muted small mb-0">
              © {new Date().getFullYear()} <strong>AgendaFonfach</strong>. Todos
              los derechos reservados.
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default ConfirmacionResultado;

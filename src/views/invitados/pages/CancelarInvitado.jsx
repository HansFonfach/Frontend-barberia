import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  CardBody,
  Button,
  Spinner,
  Navbar,
  Nav,
  NavItem,
} from "reactstrap";
import { Link } from "react-router-dom";
import { getInfoReservaInvitado, postCancelarHoraInvitado } from "api/invitado";
import dayjs from "dayjs";

// Iconos (los mismos del landing)
import {
  FiCalendar,
  FiInstagram,
  FiSmartphone,
} from "react-icons/fi";

const CancelarInvitado = () => {
  const [estado, setEstado] = useState("loading");
  const [mensaje, setMensaje] = useState("");
  const [token, setToken] = useState(null);
  const [reserva, setReserva] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // Navbar scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");

    if (!t) {
      setEstado("error");
      setMensaje("Link inválido");
      return;
    }

    setToken(t);

    getInfoReservaInvitado(t)
      .then(({ data }) => {
        setReserva(data);
        setEstado("confirm");
      })
      .catch((err) => {
        setEstado("error");
        setMensaje(
          err?.response?.data?.message || "Link inválido o expirado"
        );
      });
  }, []);

  const cancelarReserva = async () => {
    setEstado("loading");
    try {
      await postCancelarHoraInvitado(token);
      setEstado("success");
      setMensaje("Tu reserva fue cancelada correctamente");
    } catch (err) {
      setEstado("error");
      setMensaje(
        err?.response?.data?.message || "No se pudo cancelar la reserva"
      );
    }
  };

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      {/* ===== NAVBAR (LANDING) ===== */}
      <Navbar
        fixed="top"
        expand="md"
        className={scrolled ? "bg-white shadow-sm py-2" : "bg-white py-3"}
        style={{ transition: "all 0.3s ease" }}
      >
        <Container>
          <Link
            to="/"
            className="navbar-brand d-flex align-items-center font-weight-bold"
            style={{ color: "#1a1a1a", fontSize: "1.4rem" }}
          >
            <FiCalendar className="mr-2" style={{ color: "#f72585" }} />
            Agenda<span style={{ color: "#4361ee" }}>Fonfach</span>
          </Link>

          <Nav className="ml-auto" navbar>
            <NavItem>
              <Button
                size="sm"
                style={{
                  background: "#4361ee",
                  border: "none",
                  borderRadius: "50px",
                  fontWeight: "600",
                }}
                onClick={() => (window.location.href = "/registro-negocio")}
              >
                Quiero probarlo
              </Button>
            </NavItem>
          </Nav>
        </Container>
      </Navbar>

      {/* ===== CONTENIDO ===== */}
      <Container
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "calc(100vh - 200px)", paddingTop: "140px" }}
      >
        <Card
          className="border-0 shadow"
          style={{ maxWidth: 420, width: "100%", borderRadius: 20 }}
        >
          <CardBody className="text-center p-4">

            {estado === "loading" && (
              <>
                <Spinner color="primary" />
                <p className="mt-3 mb-0">Procesando…</p>
              </>
            )}

            {estado === "confirm" && reserva && (
              <>
                <h4 className="mb-3">¿Cancelar reserva?</h4>

                <div
                  className="text-left mb-3"
                  style={{
                    background: "#f8f9fa",
                    borderRadius: 12,
                    padding: "12px 16px",
                  }}
                >
                  <p className="mb-1">
                    <strong>💈 Barbero:</strong> {reserva.barbero}
                  </p>
                  <p className="mb-1">
                    <strong>✂️ Servicio:</strong> {reserva.servicio}
                  </p>
                  <p className="mb-1">
                    <strong>📅 Fecha:</strong>{" "}
                    {dayjs(reserva.fecha).format("DD/MM/YYYY")}
                  </p>
                  <p className="mb-0">
                    <strong>🕐 Hora:</strong>{" "}
                    {dayjs(reserva.fecha).format("HH:mm")}
                  </p>
                </div>

                <p className="text-muted small">
                  Si cancelas, tu hora quedará liberada para otra persona.
                </p>

                <Button
                  color="danger"
                  block
                  className="mt-3"
                  onClick={cancelarReserva}
                >
                  ❌ Cancelar reserva
                </Button>
              </>
            )}

            {estado === "success" && (
              <>
                <h4 className="text-success mb-2">✅ Reserva cancelada</h4>
                <p className="mb-0">{mensaje}</p>
              </>
            )}

            {estado === "error" && (
              <>
                <h4 className="text-danger mb-2">❌ Error</h4>
                <p className="mb-0">{mensaje}</p>
              </>
            )}

          </CardBody>
        </Card>
      </Container>

      {/* ===== FOOTER (LANDING) ===== */}
      <footer
        className="py-4"
        style={{ borderTop: "1px solid #eee", background: "#f8f9fa" }}
      >
        <Container>
          <div className="text-center mb-3">
            <FiCalendar style={{ color: "#f72585", fontSize: "1.5rem" }} />
            <span className="ml-2 font-weight-bold">AgendaFonfach</span>
          </div>

          <div className="text-center mb-3">
            <a
              href="https://instagram.com/hans.fonfach"
              target="_blank"
              rel="noopener noreferrer"
              className="mx-2"
            >
              <FiInstagram size={20} color="#4361ee" />
            </a>
            <a
              href="https://wa.me/56975297584"
              target="_blank"
              rel="noopener noreferrer"
              className="mx-2"
            >
              <FiSmartphone size={20} color="#25D366" />
            </a>
          </div>

          <p className="text-center text-muted small mb-0">
            © 2026 AgendaFonfach - Creado por Hans Fonfach Rodriguez
          </p>
        </Container>
      </footer>
    </div>
  );
};

export default CancelarInvitado;

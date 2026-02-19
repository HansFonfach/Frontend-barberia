import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  CardBody,
  Button,
  Spinner,
  Row,
  Col,
} from "reactstrap";
import { getInfoReservaInvitado, postCancelarHoraInvitado } from "api/invitado";
import dayjs from "dayjs";

// 👉 mismo header del dashboard
import UserHeader from "components/Headers/UserHeader";
// 👉 ajusta el path si tu footer se llama distinto
import AdminFooter from "components/Footers/AdminFooter";

const CancelarInvitado = () => {
  const [estado, setEstado] = useState("loading");
  const [mensaje, setMensaje] = useState("");
  const [token, setToken] = useState(null);
  const [reserva, setReserva] = useState(null);

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
        const msg =
          err?.response?.data?.message || "Link inválido o expirado";
        setEstado("error");
        setMensaje(msg);
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
        err?.response?.data?.message ||
          "No se pudo cancelar la reserva"
      );
    }
  };

  return (
    <>
      {/* ===== NAVBAR ===== */}
      <UserHeader />

      {/* ===== CONTENIDO ===== */}
      <Container
        fluid
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "calc(100vh - 140px)" }} // deja espacio al footer
      >
        <Row className="w-100 justify-content-center">
          <Col md="6" lg="4">
            <Card className="border-0 shadow">
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
                        borderRadius: 10,
                        padding: "14px 16px",
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
                    <h4 className="text-success mb-2">
                      ✅ Reserva cancelada
                    </h4>
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
          </Col>
        </Row>
      </Container>

      {/* ===== FOOTER ===== */}
      <AdminFooter />
    </>
  );
};

export default CancelarInvitado;

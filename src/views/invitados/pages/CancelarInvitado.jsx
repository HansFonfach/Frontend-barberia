import React, { useEffect, useState } from "react";
import { Container, Card, CardBody, Button, Spinner } from "reactstrap";
import { getInfoReservaInvitado, postCancelarHoraInvitado } from "api/invitado";
import dayjs from "dayjs";

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
        const msg = err?.response?.data?.message || "Link inválido o expirado";
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
      setMensaje(err?.response?.data?.message || "No se pudo cancelar la reserva");
    }
  };

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <Card style={{ maxWidth: 420, width: "100%" }}>
        <CardBody className="text-center">

          {estado === "loading" && (
            <>
              <Spinner />
              <p className="mt-3">Procesando…</p>
            </>
          )}

          {estado === "confirm" && reserva && (
            <>
              <h4>¿Cancelar reserva?</h4>

              <div className="text-left mt-3 mb-3" style={{ background: "#f8f9fa", borderRadius: 8, padding: "12px 16px" }}>
                <p className="mb-1"><strong>💈 Barbero:</strong> {reserva.barbero}</p>
                <p className="mb-1"><strong>✂️ Servicio:</strong> {reserva.servicio}</p>
                <p className="mb-1"><strong>📅 Fecha:</strong> {dayjs(reserva.fecha).format("DD/MM/YYYY")}</p>
                <p className="mb-0"><strong>🕐 Hora:</strong> {dayjs(reserva.fecha).format("HH:mm")}</p>
              </div>

              <p className="text-muted" style={{ fontSize: 13 }}>
                Si cancelas, tu hora quedará liberada para otra persona.
              </p>

              <Button color="danger" onClick={cancelarReserva} className="mt-2">
                ❌ Cancelar reserva
              </Button>
            </>
          )}

          {estado === "success" && (
            <>
              <h4 className="text-success">✅ Reserva cancelada</h4>
              <p>{mensaje}</p>
            </>
          )}

          {estado === "error" && (
            <>
              <h4 className="text-danger">❌ Error</h4>
              <p>{mensaje}</p>
            </>
          )}

        </CardBody>
      </Card>
    </Container>
  );
};

export default CancelarInvitado;
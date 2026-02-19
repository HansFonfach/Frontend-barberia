import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  CardBody,
  Button,
  Spinner,
} from "reactstrap";

const CancelarInvitado = () => {
  const [estado, setEstado] = useState("loading"); 
  // loading | confirm | success | error
  const [mensaje, setMensaje] = useState("");
  const [token, setToken] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");

    if (!t) {
      setEstado("error");
      setMensaje("Link inválido");
      return;
    }

    setToken(t);
    setEstado("confirm");
  }, []);

  const cancelarReserva = async () => {
    setEstado("loading");

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/reservas/cancelar-por-link`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setEstado("error");
        setMensaje(data.message || "No se pudo cancelar la reserva");
        return;
      }

      setEstado("success");
      setMensaje("Tu reserva fue cancelada correctamente");
    } catch (err) {
      setEstado("error");
      setMensaje("Error de conexión");
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

          {estado === "confirm" && (
            <>
              <h4>¿Cancelar reserva?</h4>
              <p>
                Si cancelas, tu hora quedará liberada para otra persona.
              </p>
              <Button
                color="danger"
                onClick={cancelarReserva}
                className="mt-2"
              >
                Cancelar reserva
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

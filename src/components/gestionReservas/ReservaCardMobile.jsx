import React from "react";
import {
  Card,
  CardBody,
  Button,
  Badge,
} from "reactstrap";

const ReservaCardMobile = ({
  reservas,
  empresa,
  onVer,
}) => {
  const getEstado = (reserva) => {
    if (reserva.estado === "cancelada")
      return "Cancelada";

    if (reserva.estado === "no_asistio")
      return "No asistió";

    if (reserva.estado === "completada")
      return "Completada";

    if (reserva.estado === "reagendada")
      return "Reagendada";

    if (
      reserva.confirmacionAsistencia
        ?.respondida &&
      reserva.confirmacionAsistencia
        ?.respuesta === "confirma"
    ) {
      return "Confirmada por Cliente";
    }

    const fechaReserva = new Date(
      reserva.fecha,
    );

    const ahora = new Date();

    if (reserva.estado === "confirmada")
      return "Confirmada";

    if (fechaReserva < ahora)
      return "Terminada";

    return "Pendiente";
  };

  const getColorEstado = (reserva) => {
    const estado = getEstado(reserva);

    switch (estado) {
      case "No asistió":
        return "danger";

      case "Cancelada":
        return "dark";

      case "Reagendada":
        return "warning";

      case "Confirmada por Cliente":
        return "success";

      case "Confirmada":
        return "primary";

      case "Terminada":
        return "secondary";

      case "Completada":
        return "success";

      default:
        return "info";
    }
  };

const iconoCliente = (reserva) => {
  const tieneNota = reserva.cliente?.notasProfesional?.trim();
  const nota = tieneNota ? " 📝" : "";

  if (reserva.suscripcion) return "⭐" + nota;
  if (empresa?.slug === "lumicabeauty") return "🎀" + nota;
  return "🧔🏻‍♂️" + nota;
};

  const reservasFiltradas =
    reservas.filter(
      (reserva) =>
        getEstado(reserva) !==
        "Reagendada",
    );

  return (
    <div className="reservas-mobile">
      {reservasFiltradas.map(
        (reserva) => (
          <Card
            key={reserva._id}
            className="mb-3 shadow-sm"
          >
            <CardBody className="p-3">
              {/* HEADER */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center">
                  <span
                    className="mr-2"
                    style={{
                      fontSize: "1.2rem",
                    }}
                  >
                    {iconoCliente(
                      reserva,
                    )}
                  </span>

                  <strong className="text-dark">
                    {
                      reserva.cliente
                        ?.nombre
                    }{" "}
                    {
                      reserva.cliente
                        ?.apellido
                    }
                  </strong>
                </div>

                <Badge
                  color={getColorEstado(
                    reserva,
                  )}
                  pill
                >
                  {getEstado(reserva)}
                </Badge>
              </div>

              {/* INFO */}
              <div className="pl-4 mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <small className="text-muted">
                    Servicio
                  </small>

                  <small className="font-weight-bold">
                    {
                      reserva.servicio
                        ?.nombre
                    }
                  </small>
                </div>

                <div className="d-flex justify-content-between mb-1">
                  <small className="text-muted">
                    Hora
                  </small>

                  <small className="font-weight-bold">
                    {new Date(
                      reserva.fecha,
                    ).toLocaleTimeString(
                      [],
                      {
                        hour:
                          "2-digit",
                        minute:
                          "2-digit",
                      },
                    )}
                  </small>
                </div>

                {reserva.suscripcion && (
                  <div className="d-flex justify-content-between">
                    <small className="text-muted">
                      Suscripción
                    </small>

                    <Badge
                      color="success"
                      pill
                    >
                      {
                        reserva
                          .suscripcion
                          .posicion
                      }
                      /
                      {
                        reserva
                          .suscripcion
                          .limite
                      }
                    </Badge>
                  </div>
                )}
              </div>

              {/* ACTIONS */}
              <div className="d-flex justify-content-end border-top pt-2">
                <Button
                  color="info"
                  size="sm"
                  onClick={() =>
                    onVer(reserva)
                  }
                >
                  Ver
                </Button>
              </div>
            </CardBody>
          </Card>
        ),
      )}
    </div>
  );
};

export default ReservaCardMobile;
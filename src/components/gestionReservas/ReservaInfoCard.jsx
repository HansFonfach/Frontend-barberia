import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
} from "reactstrap";

const ReservaInfoCard = ({ reservaSeleccionada }) => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-white border-0">
        <h6>Información Reserva</h6>
      </CardHeader>

      <CardBody>
        <p>
          <strong>Servicio:</strong>{" "}
          {reservaSeleccionada.servicio?.nombre}
        </p>

        <p>
          <strong>Fecha:</strong>{" "}
          {new Date(
            reservaSeleccionada.fecha,
          ).toLocaleDateString()}
        </p>

        <p>
          <strong>Hora:</strong>{" "}
          {new Date(
            reservaSeleccionada.fecha,
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </CardBody>
    </Card>
  );
};

export default ReservaInfoCard;

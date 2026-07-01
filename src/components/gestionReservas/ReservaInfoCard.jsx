import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
} from "reactstrap";

const ReservaInfoCard = ({
  reservaSeleccionada,
  onMarcarAbono,
  onRevertirAbono,
}) => {
  const abono = reservaSeleccionada.abono;
  const totalServicio = reservaSeleccionada.servicioSnapshot?.precio || 0;

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

        <hr className="my-3" />

        <p className="mb-1">
          <strong>Total:</strong> ${totalServicio.toLocaleString("es-CL")}
        </p>

        {abono?.estado === "pagado" ? (
          <>
            <p className="mb-1 text-success">
              <i className="ni ni-check-bold mr-1"></i>
              Abonado: ${abono.monto?.toLocaleString("es-CL")}
            </p>
            <p className="mb-2">
              <strong>Pendiente:</strong> $
              {(reservaSeleccionada.montoPendiente ?? 0).toLocaleString("es-CL")}
            </p>
          </>
        ) : (
          <p className="mb-2 text-muted">
            <i className="ni ni-time-alarm mr-1"></i>
            Sin abono registrado
          </p>
        )}

        {abono?.estado === "pagado" ? (
          <Button color="danger" outline size="sm" onClick={onRevertirAbono}>
            Revertir abono
          </Button>
        ) : (
          <Button color="info" size="sm" onClick={onMarcarAbono}>
            Marcar abonado
          </Button>
        )}
      </CardBody>
    </Card>
  );
};

export default ReservaInfoCard;
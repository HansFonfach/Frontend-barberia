import React from "react";
import { Card, CardHeader, CardBody, Badge } from "reactstrap";

const ClienteInfoCard = ({ reservaSeleccionada }) => {
  const cliente = reservaSeleccionada.cliente;
  const esSuscriptor = reservaSeleccionada.suscripcion;

  return (
    <Card className="shadow-sm mb-3 border-0">
      <CardBody>
        {/* nombre + badge */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h5 className="mb-0 font-weight-bold">
              {cliente?.nombre} {cliente?.apellido}
            </h5>
            <small className="text-muted">{cliente?.rut || "Sin RUT"}</small>
          </div>
          <Badge color={esSuscriptor ? "success" : "secondary"} pill>
            {esSuscriptor ? "Suscriptor" : "Regular"}
          </Badge>
        </div>

        <hr className="my-2" />

        {/* teléfono */}
        <div className="d-flex align-items-center mt-2">
          <i className="ni ni-mobile-button text-muted mr-2" />
          <span className="text-sm">{cliente?.telefono || "Sin teléfono"}</span>
        </div>

        {/* suscripción */}
        {esSuscriptor && (
          <div className="d-flex align-items-center mt-2">
            <i className="ni ni-badge text-muted mr-2" />
            <span className="text-sm">
              Visita {reservaSeleccionada.suscripcion.posicion} de{" "}
              {reservaSeleccionada.suscripcion.limite}
            </span>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default ClienteInfoCard;

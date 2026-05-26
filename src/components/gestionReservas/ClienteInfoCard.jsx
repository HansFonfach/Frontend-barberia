import React from "react";
import { Card, CardHeader, CardBody, Badge } from "reactstrap";

const ClienteInfoCard = ({ reservaSeleccionada, onEditarNota }) => {
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

        <hr className="my-2" />

        <div className="d-flex align-items-start justify-content-between mt-2">
          <div className="flex-grow-1">
            {cliente?.notasProfesional ? (
              <>
                <small className="text-muted d-block mb-1">
                  <i className="ni ni-pin-3 mr-1" /> Nota
                </small>
                <span className="text-sm">{cliente.notasProfesional}</span>
              </>
            ) : (
              <small className="text-muted">Sin nota</small>
            )}
          </div>

          <button
            className="btn btn-sm btn-outline-secondary ml-2"
            style={{ fontSize: 11, padding: "2px 8px", whiteSpace: "nowrap" }}
            onClick={() => onEditarNota && onEditarNota(cliente)}
          >
            <i className="ni ni-ruler-pencil mr-1" />
            {cliente?.notasProfesional ? "Editar" : "Agregar"}
          </button>
        </div>
      </CardBody>
    </Card>
  );
};

export default ClienteInfoCard;

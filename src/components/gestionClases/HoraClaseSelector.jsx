import React from "react";
import { FormGroup, Label, Row, Col, Button, Badge } from "reactstrap";
import { Clock } from "lucide-react";

const formatHora = (fechaISO) =>
  new Date(fechaISO).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Santiago",
  });

/**
 * Paso 3 del wizard "Agendar clase": elegir el horario del día ya
 * seleccionado. Mismo look de chips que usa HorasDisponibles en
 * "Reservar hora", adaptado a sesiones de clase (con cupo en vez de
 * disponible/ocupado simple).
 */
const HoraClaseSelector = ({ sesiones, sesionSeleccionada, onSeleccionar, yaInscrito }) => {
  if (!sesiones || sesiones.length === 0) {
    return (
      <FormGroup className="mb-4">
        <Label className="font-weight-bold d-flex align-items-center mb-3">
          <Clock size={18} className="mr-2 text-primary" />
          <span style={{ fontSize: "1.1rem" }}>Horario</span>
        </Label>
        <div className="alert alert-success text-center border-dashed">
          Elige un día para ver los horarios disponibles.
        </div>
      </FormGroup>
    );
  }

  return (
    <FormGroup className="mb-4">
      <Label className="font-weight-bold d-flex align-items-center mb-3">
        <Clock size={18} className="mr-2 text-primary" />
        <span style={{ fontSize: "1.1rem" }}>Horario</span>
      </Label>

      <Row className="px-2">
        {sesiones.map((s) => {
          const key = `${s.claseId}_${s.fecha}`;
          const isSelected = sesionSeleccionada?.fecha === s.fecha;
          const inscrito = yaInscrito(s);
          const disponible = !s.lleno && !inscrito;

          return (
            <Col key={key} xs="4" sm="3" md="3" className="p-1">
              <Button
                block
                outline={!isSelected}
                color={
                  inscrito ? "secondary" : disponible ? "success" : "light"
                }
                onClick={() => disponible && onSeleccionar(s)}
                className="py-2 border-2"
                style={{
                  cursor: disponible ? "pointer" : "default",
                  opacity: disponible ? 1 : 0.65,
                  fontWeight: isSelected ? "bold" : "500",
                  fontSize: "0.9rem",
                  borderRadius: "8px",
                  borderStyle: disponible ? "solid" : "dashed",
                }}
              >
                {formatHora(s.fecha)}
                <br />
                <small style={{ fontSize: "0.7rem" }}>
                  {inscrito
                    ? "Ya inscrito"
                    : s.lleno
                      ? "Sin cupo"
                      : `${s.cuposDisponibles} cupos`}
                </small>
              </Button>
            </Col>
          );
        })}
      </Row>

      {sesionSeleccionada && (
        <div
          className="mt-4 p-3"
          style={{
            backgroundColor: "#e8f5e9",
            borderLeft: "5px solid #28a745",
            borderRadius: "8px",
          }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <span className="text-success font-weight-bold d-block">
                Sesión seleccionada
              </span>
              <span className="h5 mb-0">{formatHora(sesionSeleccionada.fecha)}</span>
            </div>
            <Badge color="success" pill className="px-3 py-2">
              {sesionSeleccionada.duracion} min
            </Badge>
          </div>
        </div>
      )}
    </FormGroup>
  );
};

export default HoraClaseSelector;

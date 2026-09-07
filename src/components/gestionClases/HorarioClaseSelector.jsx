import React from "react";
import { FormGroup, Label, Row, Col, Button } from "reactstrap";
import { Clock } from "lucide-react";

const formatHora = (fechaISO) =>
  new Date(fechaISO).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Santiago",
  });

/**
 * Paso 2 del wizard "Agendar clase" (flujo por horario primero): agrupa
 * TODAS las sesiones del día elegido por hora exacta, sin importar de qué
 * clase son — porque en este punto el cliente todavía no eligió clase, solo
 * quiere ver qué horarios hay disponibles ese día. El paso siguiente
 * (ClaseEnHorarioSelector) recién muestra qué clase(s) hay en el horario
 * que elija acá.
 */
const HorarioClaseSelector = ({
  sesionesDelDia,
  horaSeleccionada,
  onSeleccionar,
  yaInscrito,
}) => {
  if (!sesionesDelDia || sesionesDelDia.length === 0) {
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

  // Agrupa por hora exacta (HH:mm en horario de Chile), juntando las
  // sesiones de todas las clases que caen en esa misma hora.
  const porHora = new Map();
  sesionesDelDia
    .slice()
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .forEach((s) => {
      const hora = formatHora(s.fecha);
      if (!porHora.has(hora)) porHora.set(hora, []);
      porHora.get(hora).push(s);
    });

  const horarios = Array.from(porHora.entries()).map(([hora, sesiones]) => {
    const disponibles = sesiones.filter(
      (s) => !s.lleno && !yaInscrito(s),
    ).length;
    return { hora, sesiones, disponibles, totalClases: sesiones.length };
  });

  return (
    <FormGroup className="mb-4">
      <Label className="font-weight-bold d-flex align-items-center mb-3">
        <Clock size={18} className="mr-2 text-primary" />
        <span style={{ fontSize: "1.1rem" }}>Selecciona horario</span>
      </Label>

      <Row className="px-2">
        {horarios.map(({ hora, disponibles, totalClases }) => {
          const isSelected = hora === horaSeleccionada;
          const disponible = disponibles > 0;

          return (
            <Col key={hora} xs="4" sm="3" md="3" className="p-1">
              <Button
                block
                outline={!isSelected}
                color={disponible ? "success" : "light"}
                onClick={() => disponible && onSeleccionar(hora)}
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
                {hora}
                <br />
                <small style={{ fontSize: "0.7rem" }}>
                  {disponible
                    ? `${totalClases} clase${totalClases > 1 ? "s" : ""}`
                    : "Sin cupo"}
                </small>
              </Button>
            </Col>
          );
        })}
      </Row>
    </FormGroup>
  );
};

export default HorarioClaseSelector;

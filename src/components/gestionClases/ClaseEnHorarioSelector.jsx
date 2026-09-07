import React from "react";
import { FormGroup, Label, Row, Col, Button } from "reactstrap";
import { Dumbbell } from "lucide-react";

/**
 * Paso 3 del wizard "Agendar clase" (flujo por horario primero): muestra
 * solo las clases que efectivamente tienen una sesión en el día y horario
 * ya elegidos (normalmente una, pero puede haber más de una si dos clases
 * distintas comparten horario). Mismo look de grilla que ClaseGridSelector,
 * pero acá cada botón ya sabe si esa clase, a esa hora, tiene cupo.
 */
const ClaseEnHorarioSelector = ({
  clases,
  sesionesDelHorario,
  claseId,
  onSeleccionar,
  yaInscrito,
}) => {
  const opciones = clases.map((c) => {
    const sesion = sesionesDelHorario.find((s) => s.claseId === c._id);
    const inscrito = sesion ? yaInscrito(sesion) : false;
    const disponible = !!sesion && !sesion.lleno && !inscrito;
    return { clase: c, sesion, inscrito, disponible };
  });

  return (
    <FormGroup className="mb-4">
      <Label className="font-weight-bold d-flex align-items-center mb-3">
        <Dumbbell size={18} className="mr-2 text-success" />
        <span style={{ fontSize: "1.1rem" }}>¿Qué clase quieres?</span>
      </Label>

      <Row className="g-2">
        {opciones.map(({ clase, sesion, inscrito, disponible }) => (
          <Col key={clase._id} xs="6" sm="4" lg="4" className="mb-2">
            <Button
              block
              disabled={!disponible}
              color={
                claseId === clase._id
                  ? "success"
                  : inscrito
                    ? "secondary"
                    : disponible
                      ? "outline-success"
                      : "light"
              }
              onClick={() => disponible && onSeleccionar(clase._id)}
              style={{
                height: "90px",
                whiteSpace: "normal",
                wordWrap: "break-word",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "8px 6px",
                lineHeight: 1.3,
                borderRadius: "12px",
                cursor: disponible ? "pointer" : "default",
                opacity: disponible ? 1 : 0.65,
                borderStyle: disponible ? "solid" : "dashed",
              }}
            >
              <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                {clase.nombre}
              </span>
              <span style={{ fontSize: "11px", opacity: 0.9, marginTop: "2px" }}>
                ⏱️ {clase.duracion} min
                {clase.instructor && ` • ${clase.instructor.nombre}`}
              </span>
              <small style={{ fontSize: "11px", marginTop: "2px" }}>
                {inscrito
                  ? "Ya inscrito"
                  : sesion?.lleno
                    ? "Sin cupo"
                    : sesion
                      ? `${sesion.cuposDisponibles} cupos`
                      : ""}
              </small>
            </Button>
          </Col>
        ))}

        {opciones.length === 0 && (
          <Col xs="12">
            <p className="text-muted text-center mb-0">
              No hay clases disponibles a esa hora.
            </p>
          </Col>
        )}
      </Row>
    </FormGroup>
  );
};

export default ClaseEnHorarioSelector;

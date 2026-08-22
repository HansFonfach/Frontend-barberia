import React from "react";
import { FormGroup, Label, Row, Col, Button } from "reactstrap";
import { Dumbbell } from "lucide-react";

/**
 * Paso 1 del wizard "Agendar clase": elegir la clase, con el mismo look de
 * grilla de botones que usa ServicioSelectorConDetalles en "Reservar hora".
 */
const ClaseGridSelector = ({ clases, claseId, onSeleccionar }) => {
  return (
    <FormGroup className="mb-4">
      <Label className="font-weight-bold d-flex align-items-center mb-3">
        <Dumbbell size={18} className="mr-2 text-success" />
        <span style={{ fontSize: "1.1rem" }}>Elige tu clase</span>
      </Label>

      <Row className="g-2">
        {clases.map((c) => (
          <Col key={c._id} xs="6" sm="4" lg="4" className="mb-2">
            <Button
              block
              color={claseId === c._id ? "success" : "outline-success"}
              onClick={() => onSeleccionar(c._id)}
              style={{
                height: "80px",
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
              }}
            >
              <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                {c.nombre}
              </span>
              <span style={{ fontSize: "11px", opacity: 0.9, marginTop: "2px" }}>
                ⏱️ {c.duracion} min
                {c.instructor && ` • ${c.instructor.nombre}`}
              </span>
            </Button>
          </Col>
        ))}

        {clases.length === 0 && (
          <Col xs="12">
            <p className="text-muted text-center mb-0">
              Todavía no hay clases activas para agendar.
            </p>
          </Col>
        )}
      </Row>
    </FormGroup>
  );
};

export default ClaseGridSelector;

// src/views/admin/pages/components/BarberoStep.jsx
import React from "react";
import { FormGroup, Label, Row, Col, Button } from "reactstrap";

const BarberoSelector = ({ barberos, barbero, onSeleccionarBarbero }) => {
  return (
    <FormGroup className="mb-3">
      <Label className="font-weight-bold">💈 Barbero</Label>
      <Row className="g-2">
        {barberos.length === 0 && (
          <Col>
            <p className="text-warning">
              No hay barberos disponibles
            </p>
          </Col>
        )}
        {barberos.map((b) => (
          <Col key={b._id} xs="6" sm="4" lg="4" className="mb-2">
            <Button
              block
              color={
                barbero === b._id ? "success" : "outline-success"
              }
              onClick={() => onSeleccionarBarbero(b._id)}
            >
              {b.nombre} {b.apellido}
            </Button>
          </Col>
        ))}
      </Row>
    </FormGroup>
  );
};

export default BarberoSelector;
// src/views/admin/pages/components/ServicioStep.jsx
import React from "react";
import { FormGroup, Label, Row, Col, Button } from "reactstrap";

const ServicioSelector = ({ servicios, servicio, onSeleccionarServicio }) => {
  return (
    <FormGroup className="mb-3">
      <Label className="font-weight-bold">✂️ Servicio</Label>
      <Row className="g-2">
        {servicios.map((s) => (
          <Col key={s._id} xs="6" sm="4" lg="4" className="mb-2">
            <Button
              block
              color={
                servicio === s._id ? "success" : "outline-success"
              }
              onClick={() => onSeleccionarServicio(s._id)}
            >
              {s.nombre} 
            </Button>
          </Col>
        ))}
      </Row>
    </FormGroup>
  );
};

export default ServicioSelector;
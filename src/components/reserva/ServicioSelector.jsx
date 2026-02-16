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
              color={servicio === s._id ? "success" : "outline-success"}
              onClick={() => onSeleccionarServicio(s._id)}
              style={{
                height: "60px",
                whiteSpace: "normal",
                wordWrap: "break-word",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "8px 4px",
                fontSize: "14px"
              }}
            >
              {s.nombre}
            </Button>
          </Col>
        ))}
      </Row>

      {/* Estilos para mantener consistencia en móvil */}
      <style>
        {`
          @media (max-width: 576px) {
            .btn {
              height: 70px !important;
              font-size: 13px !important;
              padding: 6px 2px !important;
            }
          }
        `}
      </style>
    </FormGroup>
  );
};

// Versión con duración y precio (si los necesitas)
export const ServicioSelectorConDetalles = ({ servicios, servicio, onSeleccionarServicio }) => {
  return (
    <FormGroup className="mb-3">
      <Label className="font-weight-bold">✂️ Servicio</Label>
      <Row className="g-2">
        {servicios.map((s) => (
          <Col key={s._id} xs="6" sm="4" lg="4" className="mb-2">
            <Button
              block
              color={servicio === s._id ? "success" : "outline-success"}
              onClick={() => onSeleccionarServicio(s._id)}
              style={{
                height: "80px",
                whiteSpace: "normal",
                wordWrap: "break-word",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "8px 4px",
                lineHeight: 1.3
              }}
            >
              <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                {s.nombre}
              </span>
              {(s.duracion || s.precio) && (
                <span style={{ fontSize: "11px", opacity: 0.9, marginTop: "2px" }}>
                  {s.duracion && `⏱️ ${s.duracion}min`}
                  {s.duracion && s.precio && " • "}
                  {s.precio && `$${s.precio}`}
                </span>
              )}
            </Button>
          </Col>
        ))}
      </Row>

      <style>
        {`
          @media (max-width: 576px) {
            .btn {
              height: 90px !important;
              font-size: 12px !important;
            }
          }
        `}
      </style>
    </FormGroup>
  );
};

export default ServicioSelector;
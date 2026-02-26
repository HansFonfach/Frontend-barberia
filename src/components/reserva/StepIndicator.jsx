// src/views/admin/pages/components/ProgressSteps.jsx
import React from "react";
import { Card, CardBody, Row, Col } from "reactstrap";
import { Check } from "lucide-react";

const StepIndicator = ({ pasoActual }) => {
  const pasos = [

    { numero: 1, label: "Servicio & Profesional" },
    { numero: 2, label: "Día" },
    { numero: 3, label: "Hora" },
    { numero: 4, label: "Confirmar" }
  ];

  return (
    <Card className="shadow-sm border-0 mb-4">
      <CardBody className="py-3">
        <Row className="align-items-center">
          {pasos.map((paso) => (
            <Col key={paso.numero} className="text-center">
              <div
                className={`d-inline-flex align-items-center justify-content-center rounded-circle ${
                  pasoActual >= paso.numero
                    ? "bg-success text-white"
                    : "bg-light text-muted"
                }`}
                style={{ width: 40, height: 40 }}
              >
                {pasoActual > paso.numero ? <Check size={18} /> : paso.numero}
              </div>
              <small className="d-block mt-1 font-weight-bold">
                {paso.label}
              </small>
            </Col>
          ))}
        </Row>
      </CardBody>
    </Card>
  );
};

export default StepIndicator;
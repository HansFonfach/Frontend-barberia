// src/views/admin/pages/components/BarberoStep.jsx
import React from "react";
import { FormGroup, Label, Row, Col, Button, Spinner } from "reactstrap";

const BarberoSelector = ({
  barberos,
  barbero,
  onSeleccionarBarbero,
  loading,
}) => {
  return (
    <FormGroup className="mb-3">
      <Label className="font-weight-bold">💈 Barbero</Label>

      {/* 🔄 LOADING */}
      {loading && (
        <div className="py-3 text-center">
          <Spinner size="sm" color="primary" className="mr-2" />
          <span className="text-muted">Cargando barberos...</span>
        </div>
      )}

      {/* ❌ SIN BARBEROS (solo cuando NO está cargando) */}
      {!loading && barberos.length === 0 && (
        <p className="text-warning mb-0">
          No hay barberos disponibles
        </p>
      )}

      {/* ✅ LISTA */}
      {!loading && barberos.length > 0 && (
        <Row className="g-2">
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
      )}
    </FormGroup>
  );
};

export default BarberoSelector;

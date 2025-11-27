// src/views/admin/pages/components/RutClienteStep.jsx
import React from "react";
import { FormGroup, Label, Input, Button, Spinner } from "reactstrap";

const RutInput = ({
  rut,
  handleRutChange,
  errorRut,
  handleLimpiarRut,
  buscandoUsuario,
  usuarioEncontrado,
  errorBusqueda,
  rutValido,
}) => {
  // Debug

  return (
    <FormGroup className="mb-4">
      <Label className="font-weight-bold text-dark mb-3">
        👤 RUT del Cliente
      </Label>

      <div className="position-relative mb-3">
        <Input
          type="text"
          value={rut}
          onChange={handleRutChange}
          placeholder="Ingresa RUT del cliente"
          className={`py-3 ${errorRut ? "is-invalid" : "border-success"}`}
          style={{ paddingRight: "50px" }}
        />

        {rut && (
          <Button
            color="link"
            className="position-absolute p-0"
            style={{ right: "15px", top: "50%", transform: "translateY(-50%)" }}
            onClick={handleLimpiarRut}
          >
            ✕
          </Button>
        )}
      </div>

      {/* Estados */}

      {buscandoUsuario && (
        <div className="alert alert-info py-2 mb-2">
          <Spinner size="sm" className="me-2" />
          Buscando cliente...
        </div>
      )}

      {usuarioEncontrado && (
        <div className="mt-2 text-success fw-bold">
          🧍 {usuarioEncontrado.nombre} {usuarioEncontrado.apellido}
        </div>
      )}

      {errorBusqueda && (
        <div className="mt-2 text-danger small">❌ {errorBusqueda}</div>
      )}

  
      {/* Estado inicial */}
      {!rut && !buscandoUsuario && !usuarioEncontrado && !errorBusqueda && (
        <div className="text-muted small">
          Ingresa el RUT del cliente para buscar en el sistema
        </div>
      )}
    </FormGroup>
  );
};

export default RutInput;

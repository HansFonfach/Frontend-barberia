// src/views/admin/pages/components/RutClienteStep.jsx
import React from "react";
import { FormGroup, Label, Input, Button, Spinner, Alert } from "reactstrap";

const RutInput = ({
  rut,
  handleRutChange,
  errorRut,
  handleLimpiarRut,
  buscandoUsuario,
  usuarioEncontrado,
  errorBusqueda,
}) => {
  const getInputClass = () => {
    if (errorRut || errorBusqueda) return "is-invalid";
    if (usuarioEncontrado) return "is-valid border-success";
    return "";
  };

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
          placeholder="Ingresa RUT del cliente o pasaporte"
          className={`py-3 ${getInputClass()}`}
          style={{ paddingRight: "50px" }}
          disabled={buscandoUsuario}
        />

        {rut && !buscandoUsuario && (
          <Button
            color="link"
            className="position-absolute p-0 text-muted"
            style={{ right: "15px", top: "50%", transform: "translateY(-50%)" }}
            onClick={handleLimpiarRut}
            title="Limpiar RUT"
          >
            ✕
          </Button>
        )}

        {buscandoUsuario && (
          <div
            className="position-absolute"
            style={{ right: "15px", top: "50%", transform: "translateY(-50%)" }}
          >
            <Spinner size="sm" color="primary" />
          </div>
        )}
      </div>

      {/* Mensajes de estado */}
      {buscandoUsuario && (
        <Alert color="info" className="py-2 mb-2 d-flex align-items-center">
          <Spinner size="sm" className="me-2" />
          <span className="small">Buscando cliente en el sistema...</span>
        </Alert>
      )}

      {usuarioEncontrado && !buscandoUsuario && (
        <Alert color="success" className="py-2 mb-2">
          <div className="d-flex align-items-center">
            <div>
              <strong className="d-block">Cliente encontrado:</strong>
              <div className="mt-1">
                <span className="fw-bold">
                  {usuarioEncontrado.nombre} {usuarioEncontrado.apellido}
                </span>
              </div>
            </div>
          </div>
        </Alert>
      )}

      {errorBusqueda && !buscandoUsuario && (
        <Alert color="danger" className="py-2 mb-2">
          <div className="d-flex align-items-center">
            <span className="me-2">❌</span>
            <span>{errorBusqueda}</span>
          </div>
        </Alert>
      )}

      {errorRut && !buscandoUsuario && (
        <Alert color="warning" className="py-2 mb-2">
          <div className="d-flex align-items-center">
            <span className="me-2">⚠️</span>
            <span>{errorRut}</span>
          </div>
        </Alert>
      )}

      {/* Estado inicial */}
      {!rut &&
        !buscandoUsuario &&
        !usuarioEncontrado &&
        !errorBusqueda &&
        !errorRut && (
          <div className="text-muted small">
            
          </div>
        )}
    </FormGroup>
  );
};

export default RutInput;

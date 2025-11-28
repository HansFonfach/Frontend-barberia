import React from "react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
  Row,
  Col,
} from "reactstrap";

const GestionUsuarioModal = ({
  isOpen,
  toggle,
  usuario,
  onSuscribir,
  onCancelarSuscripcion,
  onEliminar,
}) => {
  if (!usuario) return null;

  const sus = usuario.suscripcion;
  const susActiva = sus && sus.activa;

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="md">
      <ModalHeader toggle={toggle}>Gestionar Usuario</ModalHeader>

      <ModalBody>
        <Row>
          <Col md="12">
            <h5 className="mb-3">
              <strong>Información del usuario</strong>
            </h5>

            <p><strong>Nombre:</strong> {usuario.nombre} {usuario.apellido}</p>
            <p><strong>RUT:</strong> {usuario.rut}</p>
            <p><strong>Email:</strong> {usuario.email}</p>
            <p><strong>Teléfono:</strong> {usuario.telefono}</p>

            <p className="mt-3">
              <strong>Suscripción:</strong>{" "}
              {susActiva ? (
                <span className="text-success">
                  Activa (vence: {new Date(sus.fechaFin).toLocaleDateString()})
                </span>
              ) : (
                <span className="text-danger">Inactiva</span>
              )}
            </p>
          </Col>
        </Row>
      </ModalBody>

      <ModalFooter>
        {!susActiva && (
          <Button color="success" onClick={onSuscribir}>
            Suscribir
          </Button>
        )}

        {susActiva && (
          <Button color="warning" onClick={onCancelarSuscripcion}>
            Cancelar suscripción
          </Button>
        )}

        <Button color="danger" onClick={onEliminar}>
          Eliminar usuario
        </Button>

        <Button color="secondary" onClick={toggle}>
          Cerrar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default GestionUsuarioModal;

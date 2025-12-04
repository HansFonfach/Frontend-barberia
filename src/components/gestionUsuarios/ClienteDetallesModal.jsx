import React from "react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
  Row,
  Col,
  Badge,
  Card,
  CardBody
} from "reactstrap";

import { FiMail, FiPhone, FiCalendar, FiCreditCard, FiTrash2 } from "react-icons/fi";
import { MdOutlineSubscriptions, MdOutlinePerson } from "react-icons/md";
import { FiXCircle } from "react-icons/fi";

const ClienteDetallesModal = ({
  isOpen,
  toggle,
  usuario,
  onSuscribir,
  onCancelarSuscripcion,
  onEliminar
}) => {
  if (!usuario) return null;

  const sus = usuario.suscripcion;
  const susActiva = sus && sus.activa;

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="lg">
      {/* Header elegante */}
      <ModalHeader toggle={toggle} className="border-0 pb-0">
        <div className="d-flex align-items-center">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: "52px",
              height: "52px",
              backgroundColor: "#f5f6fa",
            }}
          >
            <MdOutlinePerson size={26} className="text-dark" />
          </div>

          <div className="ml-3">
            <h4 className="mb-0 font-weight-bold">
              {usuario.nombre} {usuario.apellido}
            </h4>
            <small className="text-muted">Cliente registrado</small>
          </div>
        </div>
      </ModalHeader>

      <ModalBody className="pt-2">
        <Row>
          {/* Información Personal */}
          <Col md="6">
            <Card className="border-0 shadow-sm mb-3 rounded-4">
              <CardBody>
                <h6 className="mb-3 font-weight-bold text-dark d-flex align-items-center">
                  <MdOutlinePerson className="mr-2" />
                  Información Personal
                </h6>

                <div className="mb-3">
                  <small className="text-muted d-block">RUT</small>
                  <p className="mb-0 font-weight-bold">{usuario.rut || "No especificado"}</p>
                </div>

                <div className="mb-3">
                  <small className="text-muted d-block">Email</small>
                  <p className="mb-0 d-flex align-items-center">
                    <FiMail size={15} className="mr-2 text-dark" />
                    {usuario.email}
                  </p>
                </div>

                <div>
                  <small className="text-muted d-block">Teléfono</small>
                  <p className="mb-0 d-flex align-items-center">
                    <FiPhone size={15} className="mr-2 text-dark" />
                    {usuario.telefono || "No especificado"}
                  </p>
                </div>
              </CardBody>
            </Card>
          </Col>

          {/* Suscripción */}
          <Col md="6">
            <Card className="border-0 shadow-sm mb-3 rounded-4">
              <CardBody>
                <h6 className="mb-3 font-weight-bold text-dark d-flex align-items-center">
                  <FiCreditCard className="mr-2" />
                  Estado de Suscripción
                </h6>

                <div className="d-flex align-items-center mb-3">
                  <Badge
                    pill
                    className="px-3 py-2"
                    color={susActiva ? "success" : "secondary"}
                  >
                    {susActiva ? "ACTIVA" : "INACTIVA"}
                  </Badge>

                  {susActiva && (
                    <small className="text-muted ml-3 d-flex align-items-center">
                      <FiCalendar size={14} className="mr-1" />
                      Vence: {new Date(sus.fechaFin).toLocaleDateString()}
                    </small>
                  )}
                </div>

                <div className="bg-success rounded p-3">
                  <small className="text-white d-block">
                    Registro: {new Date(usuario.createdAt).toLocaleDateString()}
                  </small>
                  <small className="text-white">
                    Última actualización: {new Date(usuario.updatedAt).toLocaleDateString()}
                  </small>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </ModalBody>

      {/* Footer moderno */}
      <ModalFooter className="border-0 pt-0">
        <div className="d-flex justify-content-between w-100">

          {/* Botón de Suscripción */}
          <div>
            {susActiva ? (
              <Button
                color="outline-warning"
                onClick={onCancelarSuscripcion}
                className="d-flex align-items-center px-3"
              >
                <FiXCircle className="mr-2" />
                Cancelar Suscripción
              </Button>
            ) : (
              <Button
                color="outline-success"
                onClick={onSuscribir}
                className="d-flex align-items-center px-3"
              >
                <MdOutlineSubscriptions className="mr-2" />
                Activar Suscripción
              </Button>
            )}
          </div>

          {/* Botón eliminar */}
          <Button
            color="outline-danger"
            onClick={onEliminar}
            className="d-flex align-items-center px-3"
          >
            <FiTrash2 className="mr-2" />
            Eliminar Cliente
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default ClienteDetallesModal;

// components/gestionUsuarios/ClienteDetallesModal.jsx
import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Row,
  Col,
  Badge,
  Card,
  CardBody,
  ListGroup,
  ListGroupItem,
} from "reactstrap";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiAward,
  FiStar,
  FiEdit,
  FiTrash2,
  FiX,
  FiCheck,
} from "react-icons/fi";

const ClienteDetallesModal = ({
  isOpen,
  toggle,
  usuario,
  onEditar,
  onSuscribir,
  onCancelarSuscripcion,
  onEliminar,
  fullscreen = false,
}) => {
  const [vistaMobile, setVistaMobile] = useState(false);

  useEffect(() => {
    setVistaMobile(window.innerWidth < 768 || fullscreen);
  }, [fullscreen]);

  if (!usuario) return null;

  const tieneSuscripcion = usuario.suscripcion?.activa;
  const suscripcionData = usuario.suscripcion;

  const formatFecha = (fecha) => {
    if (!fecha) return "No registrada";
    return new Date(fecha).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatRUT = (rut) => {
    if (!rut) return "No registrado";
    return rut;
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      className={vistaMobile ? "modal-fullscreen" : "modal-dialog-centered modal-lg"}
      contentClassName={vistaMobile ? "h-100" : ""}
    >
      <ModalHeader
        toggle={toggle}
        className={vistaMobile ? "py-2 bg-gradient-primary text-white" : "bg-gradient-primary text-white"}
      >
        <div className="d-flex align-items-center">
          <div className="avatar avatar-sm rounded-circle bg-white mr-2">
            <FiUser size={vistaMobile ? 14 : 18} className="text-primary" />
          </div>
          <span>Detalles del Cliente</span>
        </div>
      </ModalHeader>

      <ModalBody className={vistaMobile ? "p-2" : ""}>
        <Row>
          <Col xs="12" md="6" className={!vistaMobile ? "pr-2" : ""}>
            <Card className="shadow-sm mb-3">
              <CardBody className={vistaMobile ? "p-2" : ""}>
                <h6 className="text-primary mb-3 d-flex align-items-center">
                  <FiUser className="mr-2" size={vistaMobile ? 14 : 16} />
                  Información Personal
                </h6>
                
                <ListGroup flush className={vistaMobile ? "small" : ""}>
                  <ListGroupItem className="d-flex justify-content-between px-0 py-2 border-0">
                    <span className="text-muted">Nombre:</span>
                    <span className="font-weight-bold text-right">
                      {usuario.nombre} {usuario.apellido}
                    </span>
                  </ListGroupItem>
                  
                  <ListGroupItem className="d-flex justify-content-between px-0 py-2 border-0">
                    <span className="text-muted">RUT:</span>
                    <span className="font-weight-bold">{formatRUT(usuario.rut)}</span>
                  </ListGroupItem>
                  
                  <ListGroupItem className="d-flex justify-content-between px-0 py-2 border-0">
                    <span className="text-muted d-flex align-items-center">
                      <FiMail className="mr-1" size={12} /> Email:
                    </span>
                    <span className="font-weight-bold text-right small">
                      {usuario.email || "No registrado"}
                    </span>
                  </ListGroupItem>
                  
                  <ListGroupItem className="d-flex justify-content-between px-0 py-2 border-0">
                    <span className="text-muted d-flex align-items-center">
                      <FiPhone className="mr-1" size={12} /> Teléfono:
                    </span>
                    <span className="font-weight-bold">{usuario.telefono || "No registrado"}</span>
                  </ListGroupItem>
                </ListGroup>
              </CardBody>
            </Card>
          </Col>

          <Col xs="12" md="6" className={!vistaMobile ? "pl-2" : ""}>
            <Card className="shadow-sm mb-3">
              <CardBody className={vistaMobile ? "p-2" : ""}>
                <h6 className="text-primary mb-3 d-flex align-items-center">
                  <FiAward className="mr-2" size={vistaMobile ? 14 : 16} />
                  Estado de Suscripción
                </h6>

                <div className="text-center mb-3">
                  {tieneSuscripcion ? (
                    <Badge color="success" pill className="px-4 py-2">
                      <FiCheck className="mr-1" size={12} />
                      Suscripción Activa
                    </Badge>
                  ) : (
                    <Badge color="secondary" pill className="px-4 py-2">
                      <FiX className="mr-1" size={12} />
                      Sin Suscripción
                    </Badge>
                  )}
                </div>

                {tieneSuscripcion && suscripcionData && (
                  <ListGroup flush className={vistaMobile ? "small" : ""}>
                    <ListGroupItem className="d-flex justify-content-between px-0 py-2 border-0">
                      <span className="text-muted">Cortes realizados:</span>
                      <span className="font-weight-bold">
                        {suscripcionData.cortesRealizados || 0}
                      </span>
                    </ListGroupItem>
                    
                    <ListGroupItem className="d-flex justify-content-between px-0 py-2 border-0">
                      <span className="text-muted">Cortes restantes:</span>
                      <span className="font-weight-bold text-success">
                        {suscripcionData.cortesRestantes || 0}
                      </span>
                    </ListGroupItem>
                    
                    <ListGroupItem className="d-flex justify-content-between px-0 py-2 border-0">
                      <span className="text-muted">Fecha inicio:</span>
                      <span className="font-weight-bold">
                        {formatFecha(suscripcionData.fechaInicio)}
                      </span>
                    </ListGroupItem>
                    
                    <ListGroupItem className="d-flex justify-content-between px-0 py-2 border-0">
                      <span className="text-muted">Próximo vencimiento:</span>
                      <span className="font-weight-bold">
                        {formatFecha(suscripcionData.fechaExpiracion)}
                      </span>
                    </ListGroupItem>
                  </ListGroup>
                )}

                {!tieneSuscripcion && (
                  <div className="text-center py-3">
                    <FiStar size={32} className="text-muted mb-2" />
                    <p className="text-muted small mb-0">
                      Este cliente no tiene una suscripción activa
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </ModalBody>

      <ModalFooter className={vistaMobile ? "p-2 flex-wrap" : ""}>
        <div className="d-flex justify-content-between w-100 flex-wrap">
          <div className="mb-2 mb-md-0">
            <Button
              color="warning"
              size={vistaMobile ? "sm" : "md"}
              className="mr-2"
              onClick={onEditar}
            >
              <FiEdit size={vistaMobile ? 12 : 14} className="mr-1" />
              {vistaMobile ? "Editar" : "Editar información"}
            </Button>

            {tieneSuscripcion ? (
              <Button
                color="secondary"
                size={vistaMobile ? "sm" : "md"}
                onClick={onCancelarSuscripcion}
              >
                <FiX size={vistaMobile ? 12 : 14} className="mr-1" />
                {vistaMobile ? "Cancelar" : "Cancelar suscripción"}
              </Button>
            ) : (
              <Button
                color="success"
                size={vistaMobile ? "sm" : "md"}
                onClick={onSuscribir}
              >
                <FiStar size={vistaMobile ? 12 : 14} className="mr-1" />
                {vistaMobile ? "Suscribir" : "Activar suscripción"}
              </Button>
            )}
          </div>

          <div>
            <Button
              color="danger"
              size={vistaMobile ? "sm" : "md"}
              className="mr-2"
              onClick={onEliminar}
            >
              <FiTrash2 size={vistaMobile ? 12 : 14} className="mr-1" />
              {vistaMobile ? "Eliminar" : "Eliminar cliente"}
            </Button>

            <Button
              color="secondary"
              size={vistaMobile ? "sm" : "md"}
              onClick={toggle}
            >
              <FiX size={vistaMobile ? 12 : 14} className="mr-1" />
              Cerrar
            </Button>
          </div>
        </div>
      </ModalFooter>

      <style jsx>{`
        .modal-fullscreen {
          max-width: 100%;
          margin: 0;
          height: 100vh;
        }
        
        .modal-fullscreen .modal-content {
          height: 100vh;
          border-radius: 0;
        }
        
        @media (max-width: 768px) {
          .modal-content {
            border-radius: 0.5rem;
          }
          
          .list-group-item {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </Modal>
  );
};

export default ClienteDetallesModal;
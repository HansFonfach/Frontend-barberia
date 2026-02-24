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
    const check = () => setVistaMobile(window.innerWidth < 768 || fullscreen);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
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

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      className={vistaMobile ? "modal-fullscreen" : "modal-dialog-centered modal-lg"}
      contentClassName={vistaMobile ? "h-100" : ""}
    >
      {/* HEADER */}
      <ModalHeader
        toggle={toggle}
        className="bg-gradient-primary text-white"
        style={{ padding: vistaMobile ? "10px 14px" : "16px 24px" }}
      >
        <div className="d-flex align-items-center">
          <div
            style={{
              width: vistaMobile ? 28 : 36,
              height: vistaMobile ? 28 : 36,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
              flexShrink: 0,
            }}
          >
            <FiUser size={vistaMobile ? 14 : 18} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: vistaMobile ? "14px" : "16px", color: "#fff" }}>
              {usuario.nombre} {usuario.apellido}
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)" }}>
              {usuario.email || "Sin email"}
            </div>
          </div>
        </div>
      </ModalHeader>

      {/* BODY */}
      <ModalBody style={{ padding: vistaMobile ? "10px" : "20px", overflowY: "auto" }}>
        <Row>
          {/* INFO PERSONAL */}
          <Col xs="12" md="6" className="mb-3">
            <Card className="shadow-sm h-100">
              <CardBody style={{ padding: vistaMobile ? "10px 12px" : "16px" }}>
                <h6
                  className="text-primary mb-2 d-flex align-items-center"
                  style={{ fontSize: vistaMobile ? "12px" : "14px" }}
                >
                  <FiUser className="mr-1" size={13} />
                  Información Personal
                </h6>

                <ListGroup flush>
                  {[
                    { label: "RUT", value: usuario.rut || "No registrado" },
                    { label: "Teléfono", value: usuario.telefono || "No registrado", icon: <FiPhone size={11} className="mr-1" /> },
                    { label: "Email", value: usuario.email || "No registrado", icon: <FiMail size={11} className="mr-1" />, small: true },
                  ].map(({ label, value, icon, small }) => (
                    <ListGroupItem
                      key={label}
                      className="d-flex justify-content-between align-items-center px-0 border-0"
                      style={{ padding: "5px 0", fontSize: vistaMobile ? "12px" : "13px" }}
                    >
                      <span className="text-muted d-flex align-items-center">
                        {icon}{label}:
                      </span>
                      <span
                        className="font-weight-bold text-right ml-2"
                        style={{
                          fontSize: small && vistaMobile ? "11px" : undefined,
                          maxWidth: "55%",
                          wordBreak: "break-word",
                          textAlign: "right",
                        }}
                      >
                        {value}
                      </span>
                    </ListGroupItem>
                  ))}
                </ListGroup>
              </CardBody>
            </Card>
          </Col>

          {/* SUSCRIPCIÓN */}
          <Col xs="12" md="6" className="mb-3">
            <Card className="shadow-sm h-100">
              <CardBody style={{ padding: vistaMobile ? "10px 12px" : "16px" }}>
                <h6
                  className="text-primary mb-2 d-flex align-items-center"
                  style={{ fontSize: vistaMobile ? "12px" : "14px" }}
                >
                  <FiAward className="mr-1" size={13} />
                  Suscripción
                </h6>

                <div className="text-center mb-2">
                  {tieneSuscripcion ? (
                    <Badge color="success" pill style={{ padding: "6px 14px", fontSize: "12px" }}>
                      <FiCheck className="mr-1" size={11} />
                      Activa
                    </Badge>
                  ) : (
                    <Badge color="secondary" pill style={{ padding: "6px 14px", fontSize: "12px" }}>
                      <FiX className="mr-1" size={11} />
                      Sin suscripción
                    </Badge>
                  )}
                </div>

                {tieneSuscripcion && suscripcionData ? (
                  <ListGroup flush>
                    {[
                      { label: "Cortes realizados", value: suscripcionData.cortesRealizados || 0 },
                      { label: "Cortes restantes", value: suscripcionData.cortesRestantes || 0, green: true },
                      { label: "Inicio", value: formatFecha(suscripcionData.fechaInicio) },
                      { label: "Vencimiento", value: formatFecha(suscripcionData.fechaExpiracion) },
                    ].map(({ label, value, green }) => (
                      <ListGroupItem
                        key={label}
                        className="d-flex justify-content-between align-items-center px-0 border-0"
                        style={{ padding: "5px 0", fontSize: vistaMobile ? "12px" : "13px" }}
                      >
                        <span className="text-muted">{label}:</span>
                        <span className={`font-weight-bold ${green ? "text-success" : ""}`}>
                          {value}
                        </span>
                      </ListGroupItem>
                    ))}
                  </ListGroup>
                ) : (
                  <div className="text-center py-2">
                    <FiStar size={28} className="text-muted mb-1" />
                    <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
                      Sin suscripción activa
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </ModalBody>

      {/* FOOTER */}
      <ModalFooter style={{ padding: vistaMobile ? "8px 10px" : "12px 24px" }}>
        {vistaMobile ? (
          // Mobile: grid 2x2 de botones compactos
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", width: "100%" }}>
            <Button color="warning" size="sm" onClick={onEditar} block>
              <FiEdit size={12} className="mr-1" /> Editar
            </Button>

            {tieneSuscripcion ? (
              <Button color="secondary" size="sm" onClick={onCancelarSuscripcion} block>
                <FiX size={12} className="mr-1" /> Cancelar sus.
              </Button>
            ) : (
              <Button color="success" size="sm" onClick={onSuscribir} block>
                <FiStar size={12} className="mr-1" /> Suscribir
              </Button>
            )}

            <Button color="danger" size="sm" onClick={onEliminar} block>
              <FiTrash2 size={12} className="mr-1" /> Eliminar
            </Button>

            <Button color="light" size="sm" onClick={toggle} block>
              <FiX size={12} className="mr-1" /> Cerrar
            </Button>
          </div>
        ) : (
          // Desktop: layout original
          <div className="d-flex justify-content-between w-100">
            <div>
              <Button color="warning" className="mr-2" onClick={onEditar}>
                <FiEdit size={14} className="mr-1" /> Editar información
              </Button>

              {tieneSuscripcion ? (
                <Button color="secondary" onClick={onCancelarSuscripcion}>
                  <FiX size={14} className="mr-1" /> Cancelar suscripción
                </Button>
              ) : (
                <Button color="success" onClick={onSuscribir}>
                  <FiStar size={14} className="mr-1" /> Activar suscripción
                </Button>
              )}
            </div>

            <div>
              <Button color="danger" className="mr-2" onClick={onEliminar}>
                <FiTrash2 size={14} className="mr-1" /> Eliminar cliente
              </Button>
              <Button color="secondary" onClick={toggle}>
                <FiX size={14} className="mr-1" /> Cerrar
              </Button>
            </div>
          </div>
        )}
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
          display: flex;
          flex-direction: column;
        }
        .modal-fullscreen .modal-body {
          flex: 1;
          overflow-y: auto;
        }
      `}</style>
    </Modal>
  );
};

export default ClienteDetallesModal;

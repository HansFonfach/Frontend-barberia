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

const PLANES = [
  {
    id: "creditos",
    nombre: "La Santa Navaja",
    emoji: "✂️",
    precio: "$25.000",
    desc: "2 servicios · Corte o barba",
    color: "#2dce89",
  },
  {
    id: "combo_visita_corte_barba",
    nombre: "La Santa Dupla",
    emoji: "👑",
    precio: "$40.000",
    desc: "2 visitas · Corte + barba",
    color: "#fb6340",
  },
  {
    id: "padre_e_hijo",
    nombre: "En el nombre del padre y del hijo",
    emoji: "👨‍👦",
    precio: "$22.000",
    desc: "2 visitas · 2 Cortes",
    color: "#5e72e4",
  },
  {
    id: "barba",
    nombre: "La Santa Barba",
    emoji: "🧔",
    precio: "$40.000",
    desc: "4 visitas · 1 Barba por semana",
    color: "#11cdef",
  },
];

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
  const [eligiendoPlan, setEligiendoPlan] = useState(false);

  useEffect(() => {
    const check = () => setVistaMobile(window.innerWidth < 768 || fullscreen);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [fullscreen]);

  // Reset al cerrar
  useEffect(() => {
    if (!isOpen) setEligiendoPlan(false);
  }, [isOpen]);

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

  const handleElegirPlan = (tipoPlan) => {
    setEligiendoPlan(false);
    onSuscribir(tipoPlan);
  };

  /* =============================
     SELECTOR DE PLAN
  ============================== */
  const renderSelectorPlanes = () => (
    <div style={{ width: "100%" }}>
      <p
        className="text-center text-muted mb-3"
        style={{ fontSize: "13px", fontWeight: 600 }}
      >
        Selecciona el plan para {usuario.nombre}
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: vistaMobile ? "1fr" : "1fr 1fr",
          gap: "10px",
          marginBottom: "10px",
        }}
      >
        {PLANES.map((plan) => (
          <button
            key={plan.id}
            onClick={() => handleElegirPlan(plan.id)}
            style={{
              background: "#fff",
              border: `2px solid ${plan.color}`,
              borderRadius: "12px",
              padding: "12px 16px",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = plan.color + "15";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.transform = "none";
            }}
          >
            <span style={{ fontSize: "1.6rem" }}>{plan.emoji}</span>
            <div>
              <div
                style={{ fontWeight: 700, fontSize: "13px", color: "#32325d" }}
              >
                {plan.nombre}
              </div>
              <div style={{ fontSize: "11px", color: "#8898aa" }}>
                {plan.desc}
              </div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: "14px",
                  color: plan.color,
                  marginTop: "2px",
                }}
              >
                {plan.precio}
              </div>
            </div>
          </button>
        ))}
      </div>
      <Button
        color="light"
        size="sm"
        block
        onClick={() => setEligiendoPlan(false)}
        style={{ borderRadius: "8px", fontSize: "12px" }}
      >
        <FiX size={11} className="mr-1" /> Cancelar
      </Button>
    </div>
  );

  /* =============================
     FOOTER MOBILE
  ============================== */
  const renderFooterMobile = () => {
    if (eligiendoPlan) return renderSelectorPlanes();

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          width: "100%",
        }}
      >
        <Button color="warning" size="sm" onClick={onEditar} block>
          <FiEdit size={12} className="mr-1" /> Editar
        </Button>

        {tieneSuscripcion ? (
          <Button
            color="secondary"
            size="sm"
            onClick={onCancelarSuscripcion}
            block
          >
            <FiX size={12} className="mr-1" /> Cancelar sus.
          </Button>
        ) : (
          <Button
            color="success"
            size="sm"
            onClick={() => setEligiendoPlan(true)}
            block
          >
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
    );
  };

  /* =============================
     FOOTER DESKTOP
  ============================== */
  const renderFooterDesktop = () => {
    if (eligiendoPlan) return renderSelectorPlanes();

    return (
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
            <Button color="success" onClick={() => setEligiendoPlan(true)}>
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
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      className={
        vistaMobile ? "modal-fullscreen" : "modal-dialog-centered modal-lg"
      }
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
            <div
              style={{
                fontWeight: 700,
                fontSize: vistaMobile ? "14px" : "16px",
                color: "#fff",
              }}
            >
              {usuario.nombre} {usuario.apellido}
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)" }}>
              {usuario.email || "Sin email"}
            </div>
          </div>
        </div>
      </ModalHeader>

      {/* BODY */}
      <ModalBody
        style={{ padding: vistaMobile ? "10px" : "20px", overflowY: "auto" }}
      >
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
                    {
                      label: "Teléfono",
                      value: usuario.telefono || "No registrado",
                      icon: <FiPhone size={11} className="mr-1" />,
                    },
                    {
                      label: "Email",
                      value: usuario.email || "No registrado",
                      icon: <FiMail size={11} className="mr-1" />,
                      small: true,
                    },
                  ].map(({ label, value, icon, small }) => (
                    <ListGroupItem
                      key={label}
                      className="d-flex justify-content-between align-items-center px-0 border-0"
                      style={{
                        padding: "5px 0",
                        fontSize: vistaMobile ? "12px" : "13px",
                      }}
                    >
                      <span className="text-muted d-flex align-items-center">
                        {icon}
                        {label}:
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
                    <Badge
                      color="success"
                      pill
                      style={{ padding: "6px 14px", fontSize: "12px" }}
                    >
                      <FiCheck className="mr-1" size={11} /> Activa
                    </Badge>
                  ) : (
                    <Badge
                      color="secondary"
                      pill
                      style={{ padding: "6px 14px", fontSize: "12px" }}
                    >
                      <FiX className="mr-1" size={11} /> Sin suscripción
                    </Badge>
                  )}
                </div>

                {tieneSuscripcion && suscripcionData ? (
                  <ListGroup flush>
                    {[
                      {
                        label: "Plan",
                        value:
                          PLANES.find((p) => p.id === suscripcionData.tipoPlan)
                            ?.nombre || suscripcionData.tipoPlan,
                      },
                      {
                        label: "Servicios usados",
                        value: `${suscripcionData.serviciosUsados || 0} / ${suscripcionData.serviciosTotales || 0}`,
                      },
                      {
                        label: "Inicio",
                        value: formatFecha(suscripcionData.fechaInicio),
                      },
                      {
                        label: "Vencimiento",
                        value: formatFecha(suscripcionData.fechaFin),
                      },
                    ].map(({ label, value }) => (
                      <ListGroupItem
                        key={label}
                        className="d-flex justify-content-between align-items-center px-0 border-0"
                        style={{
                          padding: "5px 0",
                          fontSize: vistaMobile ? "12px" : "13px",
                        }}
                      >
                        <span className="text-muted">{label}:</span>
                        <span className="font-weight-bold">{value}</span>
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
        {vistaMobile ? renderFooterMobile() : renderFooterDesktop()}
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

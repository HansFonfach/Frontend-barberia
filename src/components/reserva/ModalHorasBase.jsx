// src/components/reserva/ModalHorasBase.jsx
import React from "react";
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
} from "reactstrap";
import { Clock, CheckCircle, AlertCircle, Bell } from "lucide-react";

const ModalHorasBase = ({
  isOpen,
  toggle,
  dia,
  horasBase,
  loading,
  horasSeleccionadas = [],
  toggleHora,
  onGuardar,
  barberoSeleccionado,
}) => {
  const horasBaseArray = Array.isArray(horasBase) ? horasBase : [];
  const horasSeleccionadasArray = Array.isArray(horasSeleccionadas)
    ? horasSeleccionadas
    : [];

  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no especificada";
    try {
      const date = parseLocal(dateString);
      return date.toLocaleDateString("es-CL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const parseLocal = (str) => {
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d); // <-- sin UTC
  };

  // Agrupar horas en mañana/tarde/noche
  const agruparHoras = (horas) => {
    const grupos = { mañana: [], tarde: [], noche: [] };
    horas.forEach((h) => {
      const [hh] = h.split(":").map(Number);
      if (hh < 12) grupos.mañana.push(h);
      else if (hh < 18) grupos.tarde.push(h);
      else grupos.noche.push(h);
    });
    return grupos;
  };

  const horasAgrupadas = agruparHoras(horasBaseArray);

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size="lg"
      centered
      className="modal-horas-base"
    >
      <ModalHeader toggle={toggle} className="border-0 pb-2 bg-success">
        <div className="d-flex align-items-center w-100">
          <div className="bg-white rounded-circle p-2 me-3 shadow-sm">
            <Bell size={20} className="text-success" />
          </div>
          <div>
            <h3 className="mb-0 ml-2 text-white" style={{ fontWeight: 900 }}>
              Notificación de Horarios
            </h3>
            <h5
              className="text-white ml-2"
              style={{ opacity: 0.9, fontWeight: 900 }}
            >
              Te avisaremos si se libera alguna hora
            </h5>
          </div>
        </div>
      </ModalHeader>

      <ModalBody className="pt-4" style={{ backgroundColor: "#fff" }}>
        {/* Tarjeta info día/barbero */}
        <Card className="border-0 shadow-sm mb-4">
          <CardBody className="p-3">
            <Row className="align-items-center">
              <Col xs={12} md={6} className="mb-2 mb-md-0">
                <div className="d-flex align-items-center">
                  <div>
                    <small className="text-muted d-block">
                      Fecha seleccionada
                    </small>
                    <strong>{formatDate(dia)}</strong>
                  </div>
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div className="d-flex align-items-center">
                  <div>
                    <small className="text-muted d-block">Barbero</small>
                    <strong>
                      {barberoSeleccionado?.nombre || "No seleccionado"}
                    </strong>
                  </div>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Cargando */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success mb-3" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <h5 className="text-muted">Cargando horarios disponibles</h5>
          </div>
        ) : horasBaseArray.length === 0 ? (
          <div className="text-center py-5">
            <div className="bg-light rounded-circle p-4 d-inline-flex mb-3">
              <AlertCircle size={40} className="text-muted" />
            </div>
            <h5 className="text-muted mb-2">Sin horarios disponibles</h5>
            <Button color="secondary" onClick={toggle}>
              Volver
            </Button>
          </div>
        ) : (
          <>
            {Object.entries(horasAgrupadas).map(([grupo, horas]) => {
              if (horas.length === 0) return null;
              const titulos = {
                mañana: "🌅 Mañana",
                tarde: "🌞 Tarde",
                noche: "🌙 Noche",
              };
              return (
                <div key={grupo} className="mb-4">
                  <h6 className="text-muted mb-2 fw-bold">{titulos[grupo]}</h6>
                  <Row className="g-2">
                    {horas.map((h) => {
                      const seleccionada = horasSeleccionadasArray.includes(h);
                      return (
                        <Col key={h} xs={6} sm={4} lg={3}>
                          <Button
                            block
                            color={seleccionada ? "success" : "outline-success"}
                            className="w-100 text-truncate"
                            style={{
                              minHeight: "60px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            onClick={() => toggleHora && toggleHora(h)}
                          >
                            <Clock size={14} className="me-1" />
                            {h}
                            {seleccionada && (
                              <CheckCircle size={14} className="ms-1" />
                            )}
                          </Button>
                        </Col>
                      );
                    })}
                  </Row>
                </div>
              );
            })}
          </>
        )}
      </ModalBody>

      <ModalFooter className="border-0 bg-white rounded-bottom">
        <Button color="danger" onClick={toggle} className="border">
          Cancelar
        </Button>
        <Button
          color="success"
          onClick={onGuardar}
          disabled={horasSeleccionadasArray.length === 0 || loading}
          className="fw-bold px-4 shadow-sm"
        >
          <CheckCircle size={16} className="me-2" />
          Guardar Notificación
          {horasSeleccionadasArray.length > 0 && (
            <Badge color="light" className="ms-2 text-dark">
              {horasSeleccionadasArray.length}
            </Badge>
          )}
        </Button>
      </ModalFooter>

      <style jsx>{`
        .modal-horas-base .modal-content {
          border-radius: 12px;
          overflow: hidden;
          border: none;
        }
      `}</style>
    </Modal>
  );
};

ModalHorasBase.defaultProps = {
  horasBase: [],
  horasSeleccionadas: [],
  loading: false,
  dia: null,
  barberoSeleccionado: null,
};

export default ModalHorasBase;

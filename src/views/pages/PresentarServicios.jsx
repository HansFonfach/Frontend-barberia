import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalBody,
  Badge,
} from "reactstrap";
import UserHeader from "components/Headers/UserHeader";
import { FaClock, FaCut, FaUserTie, FaTimes, FaCheckCircle } from "react-icons/fa";
import { useServicios } from "context/ServiciosContext";

const obtenerIconoServicio = (nombre = "") => {
  const n = nombre.toLowerCase();
  if (n.includes("corte") && n.includes("barba")) return <><FaCut className="mr-1" /><FaUserTie /></>;
  if (n.includes("barba")) return <FaUserTie />;
  return <FaCut />;
};

const obtenerColor = (index) => {
  const colores = ["primary", "success", "info", "warning"];
  return colores[index % colores.length];
};

const PresentarServicios = () => {
  const { servicios } = useServicios();
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

  return (
    <>
      <UserHeader />

      <style>{`
        .servicio-card {
          border: none;
          border-radius: 12px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
          overflow: hidden;
        }
        .servicio-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.12) !important;
        }
        .servicio-card-top {
          height: 6px;
        }
        .servicio-icon-circle {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          color: #fff;
          margin-bottom: 16px;
        }
        .servicio-nombre {
          font-size: 1.05rem;
          font-weight: 700;
          color: #32325d;
          margin-bottom: 6px;
        }
        .servicio-desc {
          font-size: 0.83rem;
          color: #8898aa;
          line-height: 1.6;
          min-height: 40px;
        }
        .servicio-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #f6f9fc;
          padding-top: 14px;
          margin-top: 14px;
        }
        .servicio-precio {
          font-size: 1.25rem;
          font-weight: 800;
          color: #32325d;
        }
        .servicio-duracion {
          font-size: 0.78rem;
          color: #adb5bd;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .ver-mas {
          font-size: 0.75rem;
          color: #5e72e4;
          font-weight: 600;
          letter-spacing: 0.03em;
        }

        /* MODAL */
        .modal-content {
          border-radius: 14px !important;
          border: none !important;
          overflow: hidden;
        }
        .modal-servicio-header {
          padding: 28px 28px 20px;
          border-bottom: 1px solid #f6f9fc;
          position: relative;
        }
        .modal-servicio-title {
          font-size: 1.4rem;
          font-weight: 800;
          color: #32325d;
          margin: 0;
        }
        .modal-close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: #f6f9fc;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8898aa;
          transition: background 0.2s;
        }
        .modal-close-btn:hover {
          background: #e9ecef;
          color: #525f7f;
        }
        .modal-servicio-body {
          padding: 24px 28px 28px !important;
        }
        .modal-precio-grande {
          font-size: 2.2rem;
          font-weight: 900;
          color: #32325d;
          line-height: 1;
        }
        .modal-precio-label {
          font-size: 0.75rem;
          color: #adb5bd;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .modal-info-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.875rem;
          color: #525f7f;
          margin-bottom: 10px;
        }
        .modal-desc {
          font-size: 0.875rem;
          color: #8898aa;
          line-height: 1.7;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #f6f9fc;
        }
        .btn-reservar-modal {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(87deg, #5e72e4 0, #825ee4 100%);
          color: #fff;
          font-weight: 700;
          font-size: 0.875rem;
          letter-spacing: 0.05em;
          cursor: pointer;
          margin-top: 22px;
          transition: opacity 0.2s;
        }
        .btn-reservar-modal:hover {
          opacity: 0.88;
        }
      `}</style>

      <Container fluid className="mt--7 pb-5">
        {/* HEADER */}
        <Row className="mb-4">
          <Col>
            <Card className="shadow border-0" style={{ borderRadius: 12 }}>
              <CardHeader className="bg-transparent border-0 pb-0 pt-4 px-4">
                <Row className="align-items-center">
                  <Col>
                    <h6 className="text-uppercase text-muted ls-1 mb-1">
                      Catálogo
                    </h6>
                    <h2 className="mb-0" style={{ color: "#32325d", fontWeight: 800 }}>
                      Nuestros Servicios
                    </h2>
                  </Col>
                  <Col className="text-right">
                    <Badge color="primary" pill className="px-3 py-2">
                      {servicios.length} disponibles
                    </Badge>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody className="px-4 pt-3 pb-2">
                <p className="text-muted mb-0" style={{ fontSize: "0.875rem" }}>
                  Selecciona un servicio para ver más detalles o reservar tu hora.
                </p>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* GRID */}
        {servicios.length === 0 ? (
          <Row>
            <Col className="text-center py-5 text-muted">
              <FaCut size={40} className="mb-3" style={{ opacity: 0.2 }} />
              <p>No hay servicios disponibles por el momento.</p>
            </Col>
          </Row>
        ) : (
          <Row>
            {servicios.map((s, index) => {
              const color = obtenerColor(index);
              return (
                <Col key={s._id} xl="3" lg="4" md="6" className="mb-4">
                  <Card
                    className="servicio-card shadow"
                    onClick={() => setServicioSeleccionado(s)}
                  >
                    <div className={`servicio-card-top bg-${color}`} />
                    <CardBody className="p-4">
                      <div className={`servicio-icon-circle bg-${color}`}>
                        {obtenerIconoServicio(s.nombre)}
                      </div>

                      <p className="servicio-nombre">{s.nombre}</p>
                      <p className="servicio-desc">
                        {s.descripcion || "Servicio profesional a cargo de nuestro equipo."}
                      </p>

                      <div className="servicio-footer">
                        <div>
                          <div className="servicio-precio">${s.precio?.toLocaleString()}</div>
                       
                        </div>
                        <span className="ver-mas">Ver detalle →</span>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>

      {/* MODAL */}
      <Modal
        isOpen={!!servicioSeleccionado}
        toggle={() => setServicioSeleccionado(null)}
        centered
        size="sm"
      >
        {servicioSeleccionado && (() => {
          const idx = servicios.findIndex((s) => s._id === servicioSeleccionado._id);
          const color = obtenerColor(idx);
          return (
            <ModalBody className="p-0">
              <div className={`servicio-card-top bg-${color}`} style={{ height: 5 }} />
              <div className="modal-servicio-header">
                <div className="d-flex align-items-center mb-1" style={{ gap: 12 }}>
                  <div
                    className={`servicio-icon-circle bg-${color}`}
                    style={{ marginBottom: 0, width: 40, height: 40, fontSize: "1rem" }}
                  >
                    {obtenerIconoServicio(servicioSeleccionado.nombre)}
                  </div>
                  <h3 className="modal-servicio-title">{servicioSeleccionado.nombre}</h3>
                </div>
                <button
                  className="modal-close-btn"
                  onClick={() => setServicioSeleccionado(null)}
                >
                  <FaTimes size={12} />
                </button>
              </div>

              <div className="modal-servicio-body">
                <div className="modal-precio-grande">
                  ${servicioSeleccionado.precio?.toLocaleString()}
                </div>
                <div className="modal-precio-label">precio por servicio</div>

              
                <div className="modal-info-item">
                  <FaCheckCircle color="#2dce89" />
                  <span>Realizado por profesionales certificados</span>
                </div>

                <p className="modal-desc">
                  {servicioSeleccionado.descripcion ||
                    "Servicio realizado con productos de calidad y técnicas profesionales para garantizar el mejor resultado."}
                </p>

                <button
                  className="btn-reservar-modal"
                  onClick={() => setServicioSeleccionado(null)}
                >
                  Reservar este servicio
                </button>
              </div>
            </ModalBody>
          );
        })()}
      </Modal>
    </>
  );
};

export default PresentarServicios;

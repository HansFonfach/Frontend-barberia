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
import { FaClock, FaCut, FaUserTie } from "react-icons/fa";
import { useServicios } from "context/ServiciosContext";

const PresentarServicios = () => {
  const { servicios } = useServicios();
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

  const obtenerIconoServicio = (nombre) => {
    const n = nombre.toLowerCase();

    if (n.includes("corte") && n.includes("barba"))
      return (
        <>
          <FaCut size={26} className="mr-1" />
          <FaUserTie size={24} />
        </>
      );

    if (n.includes("barba")) return <FaUserTie size={28} />;

    return <FaCut size={26} />;
  };

  return (
    <>
      <UserHeader />

      <Container className="mt--7 pb-4" fluid>
        <Row className="justify-content-center">
          <Col lg="10">
            <Card className="shadow border-0">
              <CardHeader className="bg-transparent text-center">
                <h2 className="mb-1 font-weight-bold">Servicios</h2>
                <p className="text-muted mb-0">
                  Selecciona un servicio
                </p>
              </CardHeader>

              <CardBody>
                {/* MOBILE */}
                <div className="d-block d-md-none">
                  {servicios.map((s) => (
                    <Card
                      key={s._id}
                      className="mb-3 shadow-sm"
                      onClick={() => setServicioSeleccionado(s)}
                      style={{ cursor: "pointer" }}
                    >
                      <CardBody>
                        <h5>{s.nombre}</h5>

                        <p className="text-muted small mb-2">
                          {s.descripcion}
                        </p>

                        <Badge color="success" pill>
                          ${s.precio}
                        </Badge>

                        <div className="mt-2 text-dark small">
                          <FaClock className="mr-1" />
                          {s.duracion || 30} min
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>

                {/* DESKTOP */}
                <Row className="d-none d-md-flex">
                  {servicios.map((serv) => (
                    <Col key={serv._id} md="4" lg="3" className="mb-3">
                      <Card
                        onClick={() => setServicioSeleccionado(serv)}
                        className="shadow-sm h-100"
                        style={{
                          borderRadius: "14px",
                          cursor: "pointer",
                        }}
                      >
                        <CardBody className="p-3">
                          <div className="d-flex align-items-center mb-2">
                            <div
                              className="mr-3"
                              style={{
                                width: 50,
                                height: 50,
                                borderRadius: "50%",
                                background: "#f4f4f4",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {obtenerIconoServicio(serv.nombre)}
                            </div>

                            <div>
                              <h5 className="mb-0">{serv.nombre}</h5>
                              <small className="text-muted">
                                {serv.duracion || 30} min
                              </small>
                            </div>
                          </div>

                          <div className="d-flex justify-content-between align-items-center">
                            <span className="font-weight-bold">
                              ${serv.precio}
                            </span>

                            <span className="text-muted small">
                              Ver detalle →
                            </span>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* MODAL */}
      <Modal
        isOpen={!!servicioSeleccionado}
        toggle={() => setServicioSeleccionado(null)}
        centered
      >
        {servicioSeleccionado && (
          <ModalBody className="p-4 text-center">
            <h3>{servicioSeleccionado.nombre}</h3>

            <Badge color="dark" pill className="mb-2">
              ${servicioSeleccionado.precio}
            </Badge>

            <p className="text-muted">
              {servicioSeleccionado.descripcion}
            </p>

            <p>
              <FaClock /> {servicioSeleccionado.duracion || 30} minutos
            </p>

            <button
              className="btn btn-dark btn-block"
              onClick={() => setServicioSeleccionado(null)}
            >
              Cerrar
            </button>
          </ModalBody>
        )}
      </Modal>
    </>
  );
};

export default PresentarServicios;

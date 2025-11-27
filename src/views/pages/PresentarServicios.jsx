import React, { useState } from "react";
import { Container, Row, Col, Card, CardBody, CardHeader } from "reactstrap";
import UserHeader from "components/Headers/UserHeader";
import { FaClock, FaTag, FaCut, FaUserTie } from "react-icons/fa";
import { useServicios } from "context/ServiciosContext";

const PresentarServicios = () => {
  const { servicios } = useServicios();
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

  // --------------------------------------
  // 🔥 FUNCIÓN QUE ASIGNA ÍCONO SEGÚN NOMBRE DEL SERVICIO
  // --------------------------------------
  const obtenerIconoServicio = (nombre) => {
    const n = nombre.toLowerCase();

    // Corte + Barba
    if (n.includes("corte") && n.includes("barba")) {
      return (
        <>
          <FaCut size={32} className="text-dark mr-1" />
          <FaUserTie size={28} className="text-dark" />
        </>
      );
    }

    // Solo barba
    if (n.includes("barba")) {
      return <FaUserTie size={34} className="text-dark" />;
    }

    // Por defecto corte de pelo
    return <FaCut size={32} className="text-dark" />;
  };

  return (
    <>
      <UserHeader />

      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col lg="10">
            <Card className="shadow border-0">

              {/* ENCABEZADO */}
              <CardHeader className="bg-transparent text-center">
                <h2 className="font-weight-bold mb-2">Nuestros Servicios</h2>

                <p
                  className="text-muted"
                  style={{ maxWidth: "700px", margin: "0 auto" }}
                >
                  Descubre los servicios disponibles en nuestra barbería.
                  Cada uno está diseñado para ofrecerte la mejor experiencia.
                </p>
              </CardHeader>

              {/* CONTENIDO */}
              <CardBody>
                <Row>
                  <Col lg={servicioSeleccionado ? "8" : "12"}>
                    <Row>
                      {servicios.length === 0 && (
                        <Col className="text-center text-muted">
                          No hay servicios disponibles.
                        </Col>
                      )}

                      {servicios.map((serv) => (
                        <Col key={serv._id} xs="12" sm="6" md="4" lg="3">
                          <Card
                            className="service-card shadow-sm"
                            style={{
                              border: "1px solid #00000020",
                              borderRadius: "10px",
                              cursor: "pointer",
                              transition: "0.2s",
                            }}
                            onClick={() => setServicioSeleccionado(serv)}
                          >
                            {/* ÍCONO SEGÚN EL SERVICIO */}
                            <div className="d-flex justify-content-center mt-3">
                              <div
                                style={{
                                  width: "80px",
                                  height: "80px",
                                  borderRadius: "50%",
                                  background: "#f0f0f0",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
                                }}
                              >
                                {obtenerIconoServicio(serv.nombre)}
                              </div>
                            </div>

                            <CardBody className="text-center">
                              <h5 className="font-weight-bold mb-1">
                                {serv.nombre}
                              </h5>

                              <p className="text-muted small">
                                {serv.descripcion?.slice(0, 50) ||
                                  "Servicio de barbería."}
                                ...
                              </p>

                              <div className="d-flex justify-content-center align-items-center mt-2">
                                <FaTag className="text-success mr-1" />
                                <span className="font-weight-bold">
                                  {serv.precio ? `$${serv.precio}` : "Consultar"}
                                </span>
                              </div>
                            </CardBody>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Col>

                  {/* PANEL DETALLADO */}
                  {servicioSeleccionado && (
                    <Col lg="4">
                      <Card
                        className="shadow border-0 sticky-top"
                        style={{ top: "90px" }}
                      >
                        {/* ÍCONO GRANDE */}
                        <div className="d-flex justify-content-center mt-4">
                          <div
                            style={{
                              width: "130px",
                              height: "130px",
                              borderRadius: "50%",
                              background: "#f0f0f0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
                            }}
                          >
                            {obtenerIconoServicio(servicioSeleccionado.nombre)}
                          </div>
                        </div>

                        <CardBody>
                          <h3 className="font-weight-bold mt-3">
                            {servicioSeleccionado.nombre}
                          </h3>

                          <div className="d-flex align-items-center mb-3">
                            <FaTag className="text-success mr-2" />
                            <h5 className="mb-0 font-weight-bold">
                              {servicioSeleccionado.precio
                                ? `$${servicioSeleccionado.precio}`
                                : "Consultar"}
                            </h5>
                          </div>

                          <p className="text-muted">
                            {servicioSeleccionado.descripcion ||
                              "Servicio profesional diseñado para brindarte una experiencia de calidad."}
                          </p>

                          {servicioSeleccionado.duracion && (
                            <p className="text-muted">
                              <FaClock className="mr-1" />
                              Duración: {servicioSeleccionado.duracion} min
                            </p>
                          )}

                          <button className="btn btn-primary btn-block">
                            Reservar {servicioSeleccionado.nombre}
                          </button>

                          <button
                            className="btn btn-secondary btn-block mt-2"
                            onClick={() => setServicioSeleccionado(null)}
                          >
                            Volver a la lista
                          </button>
                        </CardBody>
                      </Card>
                    </Col>
                  )}
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default PresentarServicios;

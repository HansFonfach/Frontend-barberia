import React, { useState } from "react";
import { Container, Row, Col, Card, CardBody, CardHeader } from "reactstrap";
import UserHeader from "components/Headers/UserHeader";
import { useUsuarios } from "hooks/useUsuarios";
import { FaStar } from "react-icons/fa";
import AleeImg from "assets/img/theme/alee.jpg";

const PresentarBarberos = () => {
  const { usuarios: barberos } = useUsuarios("barbero");

  const [barberoSeleccionado, setBarberoSeleccionado] = useState(null);

  return (
    <>
      <UserHeader />

      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col lg="10">
            <Card className="shadow border-0">
              {/* ENCABEZADO DE LA TARJETA */}
              <CardHeader className="bg-transparent text-center">
                <h2 className="font-weight-bold mb-2">
                  Nuestro Equipo de Barberos
                </h2>

                <p className="text-muted mb-3">
                  Conoce a los profesionales disponibles en nuestra barbería.
                </p>

                <p
                  className="text-muted"
                  style={{ maxWidth: "700px", margin: "0 auto" }}
                >
                  Estos son los barberos que forman parte de nuestro equipo.
                  Cada uno aporta talento, dedicación y un estilo único para
                  asegurarte la mejor experiencia en cada visita.
                </p>
              </CardHeader>

              {/* CUERPO PRINCIPAL */}
              <CardBody>
                <Row>
                  <Col lg={barberoSeleccionado ? "8" : "12"}>
                    <Row>
                      {barberos.length === 0 && (
                        <Col className="text-center text-muted">
                          No hay barberos disponibles.
                        </Col>
                      )}

                      {barberos.map((barbero) => (
                        <Col key={barbero._id} xs="12" sm="6" md="4" lg="3">
                          <Card
                            className="barber-card"
                            style={{
                              border: "1px solid #00000046", // borde negro marcado
                              borderRadius: "5px",
                            }}
                            onClick={() => setBarberoSeleccionado(barbero)}
                          >
                            <div className="d-flex justify-content-center mt-3">
                              <img
                                src={barbero.avatar || AleeImg}
                                alt={barbero.nombre}
                                style={{
                                  width: "120px",
                                  height: "120px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  border: "3px solid #eee",
                                  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                                }}
                              />
                            </div>

                            <CardBody className="text-center">
                              <h5 className="font-weight-bold mb-1">
                                {barbero.nombre} {barbero.apellido}
                              </h5>

                              <p className="text-muted small mb-2">
                                {barbero.especialidad || "Barbería Clásica"}
                              </p>

                              <div className="d-flex justify-content-center align-items-center">
                                <FaStar className="text-warning mr-1" />
                                <span className="font-weight-bold">
                                  {barbero.rating || "5.0"}
                                </span>
                              </div>
                            </CardBody>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Col>

                  {/* PANEL DETALLADO */}
                  {barberoSeleccionado && (
                    <Col lg="4">
                      <Card
                        className="shadow border-0 sticky-top"
                        style={{ top: "90px" }}
                      >
                        <img
                          src={barberoSeleccionado.avatar || AleeImg}
                          alt={barberoSeleccionado.nombre}
                          className="w-100 rounded-top"
                          style={{ height: "280px", objectFit: "cover" }}
                        />

                        <CardBody>
                          <h3 className="font-weight-bold">
                            {barberoSeleccionado.nombre}{" "}
                            {barberoSeleccionado.apellido}
                          </h3>

                          <p className="text-muted">
                            {barberoSeleccionado.especialidad}
                          </p>

                          <div className="d-flex align-items-center mb-3">
                            <FaStar className="text-warning mr-2" size={20} />
                            <h5 className="mb-0 font-weight-bold">
                              {barberoSeleccionado.rating || "5.0"}
                            </h5>
                          </div>

                          <hr />

                          <p className="text-muted">
                            {barberoSeleccionado.descripcion ||
                              "Barbero profesional con años de experiencia en cortes clásicos, modernos y perfilado de barba."}
                          </p>

                          <button className="btn btn-primary btn-block">
                            Reservar con {barberoSeleccionado.nombre}
                          </button>

                          <button
                            className="btn btn-secondary btn-block mt-2"
                            onClick={() => setBarberoSeleccionado(null)}
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

export default PresentarBarberos;

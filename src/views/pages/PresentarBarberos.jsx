import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Button,
} from "reactstrap";
import UserHeader from "components/Headers/UserHeader";
import { useUsuarios } from "hooks/useUsuarios";
import { FaStar } from "react-icons/fa";

import barberoDefault from "assets/img/barberos/ale.jpg";

/* Avatar con iniciales */
const AvatarBarbero = ({ nombre, apellido, foto }) => {
  const iniciales = `${nombre?.[0] || ""}${apellido?.[0] || ""}`.toUpperCase();

  return (
    <div
      className="mx-auto d-flex align-items-center justify-content-center"
      style={{
        width: 90,
        height: 90,
        borderRadius: "50%",
        overflow: "hidden",
        background: "linear-gradient(135deg,#111,#444)",
        boxShadow: "0 4px 10px rgba(0,0,0,.25)",
      }}
    >
      {foto ? (
        <img
          src={foto}
          alt={`${nombre} ${apellido}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <span
          style={{
            color: "#fff",
            fontSize: 32,
            fontWeight: "bold",
          }}
        >
          {iniciales}
        </span>
      )}
    </div>
  );
};

const PresentarBarberos = () => {
  const { usuarios: barberos } = useUsuarios("barbero");
  const [barberoSeleccionado, setBarberoSeleccionado] = useState(null);

  return (
    <>
      <UserHeader title="Nuestro Equipo" />

      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col lg="11">
            <Card className="shadow border-0">
              <CardHeader className="bg-white text-center py-4">
                <h2 className="font-weight-bold mb-2">Nuestros Barberos</h2>

                <p className="text-muted mb-0">
                  Profesionales dedicados a entregarte la mejor experiencia
                </p>
              </CardHeader>

              <CardBody>
                <Row>
                  {/* LISTADO */}
                  <Col lg={barberoSeleccionado ? 8 : 12}>
                    <Row>
                      {barberos.length === 0 && (
                        <Col className="text-center text-muted py-5">
                          No hay barberos disponibles
                        </Col>
                      )}

                      {barberos.map((b) => {
                        const activo = barberoSeleccionado?._id === b._id;

                        return (
                          <Col key={b._id} xs="12" sm="6" md="4" lg="3">
                            <Card
                              onClick={() => setBarberoSeleccionado(b)}
                              className={`mb-4 cursor-pointer transition-all ${
                                activo
                                  ? "shadow-lg border-primary"
                                  : "shadow-sm"
                              }`}
                              style={{ cursor: "pointer" }}
                            >
                              <CardBody className="text-center py-4">
                                <AvatarBarbero
                                  nombre={b.nombre}
                                  apellido={b.apellido}
                                  foto={barberoDefault}
                                />

                                <h5 className="font-weight-bold mt-3 mb-1">
                                  {b.nombre} {b.apellido}
                                </h5>

                                <Badge color="light" className="mb-2">
                                  {b.especialidad || "Barbero Profesional"}
                                </Badge>

                                <div className="d-flex justify-content-center align-items-center">
                                  <FaStar className="text-warning mr-1" />
                                  <span className="font-weight-bold">
                                    {b.rating || "5.0"}
                                  </span>
                                </div>
                              </CardBody>
                            </Card>
                          </Col>
                        );
                      })}
                    </Row>
                  </Col>

                  {/* PANEL DETALLE */}
                  {barberoSeleccionado && (
                    <Col lg="4">
                      <Card
                        className="shadow border-0 sticky-top"
                        style={{ top: 90 }}
                      >
                        <CardBody className="text-center py-4">
                          <AvatarBarbero
                            nombre={barberoSeleccionado.nombre}
                            apellido={barberoSeleccionado.apellido}
                            foto={barberoDefault}
                          />

                          <h3 className="font-weight-bold mt-3">
                            {barberoSeleccionado.nombre}{" "}
                            {barberoSeleccionado.apellido}
                          </h3>

                          <p className="text-muted mb-2">
                            {barberoSeleccionado.especialidad ||
                              "Barbero Profesional"}
                          </p>

                          <div className="d-flex justify-content-center align-items-center mb-3">
                            <FaStar className="text-warning mr-2" />
                            <strong>
                              {barberoSeleccionado.rating || "5.0"}
                            </strong>
                          </div>

                          <hr />

                          <p className="text-muted small">
                            {barberoSeleccionado.descripcion ||
                              "Especialista en cortes modernos, clásicos y perfilado de barba."}
                          </p>

                          <Button color="primary" block className="mt-3">
                            Reservar con {barberoSeleccionado.nombre}
                          </Button>

                          <Button
                            color="secondary"
                            outline
                            block
                            className="mt-2"
                            onClick={() => setBarberoSeleccionado(null)}
                          >
                            Volver
                          </Button>
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

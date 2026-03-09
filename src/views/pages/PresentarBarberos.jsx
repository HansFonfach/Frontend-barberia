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
import { FaStar, FaScissors } from "react-icons/fa6";
import { Award, Clock } from "lucide-react";

const AvatarBarbero = ({ nombre, apellido, foto }) => {
  const iniciales = `${nombre?.[0] || ""}${apellido?.[0] || ""}`.toUpperCase();

  return (
    <div
      className="mx-auto d-flex align-items-center justify-content-center"
      style={{
        width: 100,
        height: 100,
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
            objectPosition: "center top", // 👈 ancla la imagen arriba
          }}
        />
      ) : (
        <span style={{ color: "#fff", fontSize: 32, fontWeight: "bold" }}>
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
                <h2 className="font-weight-bold mb-1">
                  Nuestras Profesionales
                </h2>
                <p className="text-muted mb-0">
                  Especialistas dedicadas a entregarte la mejor experiencia
                </p>
              </CardHeader>

              <CardBody>
                <Row>
                  {/* LISTADO */}
                  <Col lg={barberoSeleccionado ? 8 : 12}>
                    <Row>
                      {barberos.length === 0 && (
                        <Col className="text-center text-muted py-5">
                          No hay profesionales disponibles
                        </Col>
                      )}

                      {barberos.map((b) => {
                        const activo = barberoSeleccionado?._id === b._id;
                        const foto = b.perfilProfesional?.fotoPerfil?.url;
                        const especialidades =
                          b.perfilProfesional?.especialidades || [];
                        const anios = b.perfilProfesional?.aniosExperiencia;

                        return (
                          <Col
                            key={b._id}
                            xs="12"
                            sm="6"
                            md="4"
                            lg={barberoSeleccionado ? "4" : "3"}
                          >
                            <Card
                              onClick={() => setBarberoSeleccionado(b)}
                              className={`mb-4 border-0 ${activo ? "shadow-lg" : "shadow-sm"}`}
                              style={{
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                outline: activo ? "2px solid #5e72e4" : "none",
                                borderRadius: 16,
                              }}
                            >
                              <CardBody className="text-center py-4">
                                <AvatarBarbero
                                  nombre={b.nombre}
                                  apellido={b.apellido}
                                  foto={foto}
                                />

                                <h5 className="font-weight-bold mt-3 mb-1">
                                  {b.nombre} {b.apellido}
                                </h5>

                                {anios && (
                                  <p className="text-muted small mb-2">
                                    <Clock size={13} className="me-1" />
                                    {anios} años de experiencia
                                  </p>
                                )}

                                {/* Especialidades (máx 2 en la card) */}
                                <div className="d-flex flex-wrap justify-content-center gap-1">
                                  {especialidades.slice(0, 2).map((esp, i) => (
                                    <Badge
                                      key={i}
                                      style={{
                                        background: "#e9ecef",
                                        color: "#495057",
                                        fontWeight: 500,
                                        fontSize: "0.7rem",
                                        padding: "4px 8px",
                                        borderRadius: 20,
                                      }}
                                    >
                                      {esp}
                                    </Badge>
                                  ))}
                                  {especialidades.length > 2 && (
                                    <Badge
                                      style={{
                                        background: "#e9ecef",
                                        color: "#495057",
                                        fontWeight: 500,
                                        fontSize: "0.7rem",
                                        padding: "4px 8px",
                                        borderRadius: 20,
                                      }}
                                    >
                                      +{especialidades.length - 2} más
                                    </Badge>
                                  )}
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
                        style={{ top: 90, borderRadius: 16 }}
                      >
                        <CardBody className="text-center py-4">
                          <AvatarBarbero
                            nombre={barberoSeleccionado.nombre}
                            apellido={barberoSeleccionado.apellido}
                            foto={
                              barberoSeleccionado.perfilProfesional?.fotoPerfil
                                ?.url
                            }
                          />

                          <h3 className="font-weight-bold mt-3 mb-0">
                            {barberoSeleccionado.nombre}{" "}
                            {barberoSeleccionado.apellido}
                          </h3>

                          {barberoSeleccionado.perfilProfesional
                            ?.aniosExperiencia && (
                            <p className="text-muted small mt-1 mb-3">
                              <Award size={14} className="me-1 text-warning" />
                              {
                                barberoSeleccionado.perfilProfesional
                                  .aniosExperiencia
                              }{" "}
                              años de experiencia
                            </p>
                          )}

                          {/* Especialidades completas */}
                          {barberoSeleccionado.perfilProfesional?.especialidades
                            ?.length > 0 && (
                            <div className="mb-3">
                              <p className="text-muted small font-weight-bold mb-2 text-left">
                                Especialidades
                              </p>
                              <div className="d-flex flex-wrap gap-1 justify-content-center">
                                {barberoSeleccionado.perfilProfesional.especialidades.map(
                                  (esp, i) => (
                                    <Badge
                                      key={i}
                                      style={{
                                        background: "#e9ecef",
                                        color: "#495057",
                                        fontWeight: 500,
                                        fontSize: "0.75rem",
                                        padding: "5px 10px",
                                        borderRadius: 20,
                                      }}
                                    >
                                      {esp}
                                    </Badge>
                                  ),
                                )}
                              </div>
                            </div>
                          )}

                          <hr />

                          {barberoSeleccionado.descripcion && (
                            <p className="text-muted small text-left">
                              {barberoSeleccionado.descripcion}
                            </p>
                          )}

                          <Button
                            color="primary"
                            block
                            className="mt-3"
                            style={{ borderRadius: 10, fontWeight: 600 }}
                          >
                            Reservar con {barberoSeleccionado.nombre}
                          </Button>

                          <Button
                            color="secondary"
                            outline
                            block
                            className="mt-2"
                            style={{ borderRadius: 10 }}
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

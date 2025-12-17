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
import {
  FaCoffee,
  FaBeer,
  FaGlassWhiskey,
  FaPercent,
  FaGift,
  FaStar,
} from "react-icons/fa";


/* -------------------------------------------------
   MOCK DE CANJES (DESPUÉS VIENE DEL BACK)
------------------------------------------------- */
const CANJES_MOCK = [
  {
    id: 1,
    nombre: "Café Gratis",
    descripcion: "Disfruta un café mientras esperas tu corte.",
    puntos: 150,
    icon: <FaCoffee size={32} />,
    tipo: "consumo",
  },
  {
    id: 2,
    nombre: "Bebida",
    descripcion: "Bebida fría a elección.",
    puntos: 200,
    icon: <FaGlassWhiskey size={32} />,
    tipo: "consumo",
  },
  {
    id: 3,
    nombre: "Cerveza",
    descripcion: "Cerveza helada post corte.",
    puntos: 300,
    icon: <FaBeer size={32} />,
    tipo: "consumo",
  },
  {
    id: 4,
    nombre: "10% de Descuento",
    descripcion: "10% de descuento en cualquier servicio.",
    puntos: 500,
    icon: <FaPercent size={32} />,
    tipo: "beneficio",
  },
  {
    id: 5,
    nombre: "Servicio Gratis",
    descripcion: "Un servicio de barbería completamente gratis.",
    puntos: 1200,
    icon: <FaGift size={32} />,
    tipo: "premium",
  },
  {
    id: 6,
    nombre: "1 Mes de Suscripción Pro",
    descripcion: "Acceso completo a beneficios Pro por 1 mes.",
    puntos: 3000,
    icon: <FaStar size={32} />,
    tipo: "premium",
  },
];

const CatalogoCanjes = () => {
  const [canjeSeleccionado, setCanjeSeleccionado] = useState(null);

  return (
    <>
      <UserHeader />

      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col lg="10">
            <Card className="shadow border-0">
              {/* HEADER */}
              <CardHeader className="bg-transparent text-center">
                <h2 className="font-weight-bold mb-2">Catálogo de Canjes 🎁</h2>
                <p
                  className="text-muted"
                  style={{ maxWidth: "720px", margin: "0 auto" }}
                >
                  Acumula puntos con tus reservas y canjéalos por beneficios
                  exclusivos. Mientras más reservas hagas, mejores premios
                  obtienes.
                </p>
              </CardHeader>

              {/* BODY */}
              <CardBody>
                <Row>
                  {/* LISTADO */}
                  <Col lg={canjeSeleccionado ? "8" : "12"}>
                    <Row>
                      {CANJES_MOCK.map((item) => (
                        <Col key={item.id} xs="12" sm="6" md="4" lg="3">
                          <Card
                            className="shadow-sm mb-4"
                            style={{
                              cursor: "pointer",
                              borderRadius: "12px",
                              transition: "all 0.25s ease",
                            }}
                            onClick={() => setCanjeSeleccionado(item)}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.transform =
                                "translateY(-4px)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.transform =
                                "translateY(0)")
                            }
                          >
                            <div className="d-flex justify-content-center mt-4">
                              <div
                                style={{
                                  width: "80px",
                                  height: "80px",
                                  borderRadius: "50%",
                                  background: "#f0f0f0",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
                                }}
                              >
                                {item.icon}
                              </div>
                            </div>

                            <CardBody className="text-center">
                              <h5 className="font-weight-bold mb-1">
                                {item.nombre}
                              </h5>

                              <p className="text-muted small">
                                {item.descripcion}
                              </p>

                              <Badge color="primary" pill className="mt-2">
                                {item.puntos} pts
                              </Badge>
                            </CardBody>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Col>

                  {/* PANEL DETALLE */}
                  {canjeSeleccionado && (
                    <Col lg="4">
                      <Card
                        className="shadow border-0 sticky-top"
                        style={{ top: "90px" }}
                      >
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
                              boxShadow: "0 5px 15px rgba(0,0,0,0.15)",
                            }}
                          >
                            {canjeSeleccionado.icon}
                          </div>
                        </div>

                        <CardBody>
                          <h3 className="font-weight-bold mt-3">
                            {canjeSeleccionado.nombre}
                          </h3>

                          <Badge color="success" pill className="mb-3">
                            {canjeSeleccionado.puntos} puntos
                          </Badge>

                          <p className="text-muted">
                            {canjeSeleccionado.descripcion}
                          </p>

                          <Button color="primary" block>
                            Canjear recompensa
                          </Button>

                          <Button
                            color="secondary"
                            outline
                            block
                            className="mt-2"
                            onClick={() => setCanjeSeleccionado(null)}
                          >
                            Volver al catálogo
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

export default CatalogoCanjes;

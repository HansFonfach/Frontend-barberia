import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Container,
  Row,
  Col,
  Spinner,
  Button,
  Progress,
  Badge,
  Alert,
} from "reactstrap";
import UserHeader from "components/Headers/UserHeader";
import { useAuth } from "context/AuthContext";
import { useEstadisticas } from "context/EstadisticasContext";
import { useLook } from "context/LookContext";
import { Sparkles, Calendar, Scissors, Star, Zap } from "lucide-react";
import { useUsuario } from "context/usuariosContext";

const UserDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { ultimaReserva, proximaReserva } = useEstadisticas();
  const { estadoLookCliente } = useLook();
  const { getVerPuntos, puntos } = useUsuario();

  const [data, setData] = useState(null);
  const [look, setLook] = useState(null);
  const [loading, setLoading] = useState(true);


  // ⭐ MOCK puntos

  const meta = 900;

  useEffect(() => {
    if (!user?.id) return;

    const cargar = async () => {
      setLoading(true);

      const [ultima, proxima, lookData] = await Promise.all([
        ultimaReserva(),
        proximaReserva(),
        estadoLookCliente(),
        getVerPuntos(), // solo dispara la carga
      ]);

      setData({ ultima, proxima });
      setLook(lookData);
      setLoading(false);
    };

    cargar();
  }, [user]);


  if (authLoading || loading) {
    return (
      <Container
        fluid
        className="d-flex justify-content-center align-items-center min-vh-100"
      >
        <Spinner color="primary" size="lg" />
      </Container>
    );
  }

  return (
    <>
      <UserHeader />

      {/* ===== Estilos + animación ===== */}
      <style>{`
        .card-hover {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .card-hover:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 25px rgba(0,0,0,0.12) !important;
        }

        .hero-animate {
          animation: heroFade 0.8s ease-out both;
        }

        @keyframes heroFade {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <Container fluid className="mt--7">
        {/* ================= HERO ================= */}
        <Row className="mb-5">
          <Col>
            <Card className="border-0 shadow-lg bg-gradient-success text-white card-hover hero-animate">
              <CardBody className="p-5">
                <div className="d-flex align-items-center mb-3">
                  <Sparkles size={32} className="text-warning mr-3" />
                  <h1 className="display-4 font-weight-bold mb-0">
                    Bienvenido, {user.nombre}
                  </h1>
                </div>

                {data.proxima ? (
                  <>
                    <p className="lead opacity-75 mb-1">
                      Tu próxima cita está confirmada
                    </p>
                    <h3 className="font-weight-bold d-flex align-items-center">
                      <Calendar className="mr-2" />
                      {data.proxima}
                    </h3>
                    <Button
                      color="warning"
                      className="rounded-pill font-weight-bold px-4 mt-3"
                      href="/admin/mis-reservas"
                    >
                      Ver detalles
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="lead opacity-75 mb-3">
                      Aún no tienes una cita agendada
                    </p>
                    <Button
                      color="warning"
                      className="rounded-pill font-weight-bold px-4"
                      href="/admin/reservar-hora"
                    >
                      Reservar ahora
                    </Button>
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* ================= ÚLTIMA VISITA ================= */}
        <Row className="mb-5">
          <Col>
            <Card className="border-0 shadow card-hover">
              <CardBody className="p-4 d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted text-uppercase">
                    Última visita
                  </small>
                  {data.ultima ? (
                    <>
                      <h3 className="font-weight-bold mb-1">{data.ultima}</h3>
                      <small className="text-muted">
                        Mantener una frecuencia regular mejora tu look
                      </small>
                    </>
                  ) : (
                    <Alert color="info" className="mb-0 mt-2">
                      Aún no tienes visitas registradas
                    </Alert>
                  )}
                </div>
                <div className="bg-light rounded-circle p-3 d-none d-md-flex">
                  <Scissors />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* ================= ESTADO DEL LOOK ================= */}
        {look && (
          <Row className="mb-5">
            {["corte", "barba"].map((tipo) => {
              const necesitaAtencion =
                look[tipo].diasDesdeUltimo > look[tipo].promedio;

              return (
                <Col lg="6" key={tipo} className="mb-4">
                  <Card className="border-0 shadow card-hover h-100">
                    <CardBody className="p-4">
                      <div className="d-flex align-items-center mb-3">
                        <div
                          className={`${
                            necesitaAtencion ? "bg-warning" : "bg-success"
                          } text-white rounded-circle p-3 mr-3`}
                        >
                          <Scissors size={20} />
                        </div>
                        <div>
                          <h4 className="mb-0 text-capitalize">Tu {tipo}</h4>
                          <small className="text-muted">Estado actual</small>
                        </div>
                      </div>

                      <Row className="mb-3">
                        <Col xs="6">
                          <div className="bg-light rounded p-3 text-center">
                            <small className="text-muted d-block">
                              Última vez
                            </small>
                            <strong>{look[tipo].diasDesdeUltimo} días</strong>
                          </div>
                        </Col>
                        <Col xs="6">
                          <div className="bg-light rounded p-3 text-center">
                            <small className="text-muted d-block">
                              Frecuencia ideal
                            </small>
                            <strong>{look[tipo].promedio} días</strong>
                          </div>
                        </Col>
                      </Row>

                      <Alert
                        color={necesitaAtencion ? "warning" : "success"}
                        className="mb-0"
                      >
                        {look[tipo].mensaje}
                      </Alert>
                    </CardBody>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}

        {/* ================= PUNTOS ================= */}
        <Row className="mb-5">
          <Col>
            <Card className="border-0 shadow card-hover">
              <CardBody className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    <Star className="text-warning mr-2" size={24} />
                    <h4 className="mb-0">Tus puntos</h4>
                  </div>
                  <Badge color="success" pill>
                    {puntos} pts
                  </Badge>
                </div>

                <Progress
                  value={(puntos / meta) * 100}
                  style={{ height: 10 }}
                  className="mb-2"
                />

                <small className="text-muted">
                  Te faltan <strong>{meta - puntos}</strong> puntos para tu
                  próximo beneficio
                </small>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* ================= RECOMENDACIÓN ================= */}
        {look && (
          <Row className="mb-4">
            <Col>
              <Card className="border-0 bg-dark text-white shadow card-hover">
                <CardBody className="p-4 d-flex">
                  <Zap className="text-warning mr-3 mt-1" />
                  <div>
                    <h5 className="mb-2">Recomendación personalizada</h5>
                    <p className="mb-0 opacity-90">
                      Basado en tu historial, te recomendamos agendar tu próximo
                      servicio pronto para mantener tu look siempre impecable.
                    </p>
                    <Button
                      color="warning"
                      size="sm"
                      className="mt-3"
                      href="/admin/reservar-hora"
                    >
                      Agendar ahora
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </>
  );
};

export default UserDashboard;

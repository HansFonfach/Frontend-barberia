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
import { Sparkles, Scissors, Star, Zap } from "lucide-react";
import { useUsuario } from "context/usuariosContext";
import { useParams } from "react-router-dom";

const UserDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { ultimaReserva, proximaReserva } = useEstadisticas();
  const { estadoLookCliente } = useLook();
  const { getVerPuntos, puntos } = useUsuario();
  const { slug } = useParams();

  const [data, setData] = useState({ ultima: null, proxima: null });
  const [look, setLook] = useState(null);
  const [loadingDatos, setLoadingDatos] = useState(true);

  const meta = 900;

  // 🔹 Redirección segura por slug
  useEffect(() => {
    if (!user?.empresa?.slug) return;
    if (slug !== user.empresa.slug) {
      window.location.replace(`/${user.empresa.slug}/dashboard`);
    }
  }, [slug, user?.empresa?.slug]);

  // 🔹 Carga de datos SOLO cuando hay user.id
  useEffect(() => {
    if (!user?.id) return;

    const cargarDatos = async () => {
      try {
        const [ultima, proxima, lookDataRaw] = await Promise.all([
          ultimaReserva().catch(() => null),
          proximaReserva().catch(() => null),
          estadoLookCliente().catch(() => null),
        ]);

        await getVerPuntos().catch(() => null);

        setData({ ultima, proxima });
        setLook(lookDataRaw || null); // ✅ directo, sin fallback que tape el 0
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingDatos(false); // ✅ siempre se ejecuta, corta el spinner
      }
    };

    cargarDatos();
  }, [user?.id]);

  // 🔄 Spinner global (solo auth)
  if (authLoading || !user || loadingDatos) {
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
        {/* ===== HERO ===== */}
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
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Última visita / Próxima cita */}
        <Row className="mb-5">
          <Col>
            <Card className="border-0 shadow card-hover">
              <CardBody className="p-4 d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted text-uppercase">
                    Próxima cita
                  </small>
                  {data.proxima ? (
                    <>
                      <h3 className="font-weight-bold mb-1">{data.proxima}</h3>
                      <small className="text-muted">
                        Tu próxima cita está confirmada
                      </small>
                    </>
                  ) : (
                    <Alert color="info" className="mb-0 mt-2">
                      Aún no tienes una cita agendada
                    </Alert>
                  )}
                </div>
                <div className="bg-light rounded-circle p-3 d-none d-md-flex">
                  <Scissors />
                </div>
              </CardBody>
            </Card>
          </Col>

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

        {/* Estado del look */}
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
                        <div className="border rounded p-3 text-center">
                          <small className="text-muted d-block">
                            Última vez
                          </small>
                          <strong>
                            {look[tipo].diasDesdeUltimo !== null
                              ? `${look[tipo].diasDesdeUltimo} días`
                              : "Sin datos"}
                          </strong>
                        </div>
                      </Col>
                      <Col xs="6">
                        <div className="border rounded p-3 text-center">
                          <small className="text-muted d-block">
                            Frecuencia ideal
                          </small>
                          <strong>
                            {look[tipo].promedio !== null &&
                            look[tipo].promedio !== 0
                              ? `${look[tipo].promedio} días`
                              : "Sin datos"}
                          </strong>
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

        {/* Puntos */}
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

    

      </Container>
    </>
  );
};

export default UserDashboard;

import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Container,
  Row,
  Col,
  Spinner,
  Progress,
  Badge,
  Alert,
} from "reactstrap";
import UserHeader from "components/Headers/UserHeader";
import { useAuth } from "context/AuthContext";
import { useEstadisticas } from "context/EstadisticasContext";
import { useLook } from "context/LookContext";
import { Sparkles, Scissors, Star, Zap, Calendar } from "lucide-react";
import { useUsuario } from "context/usuariosContext";
import { useEmpresa } from "context/EmpresaContext";
import { useParams } from "react-router-dom";

const UserDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { ultimaReserva, proximaReserva } = useEstadisticas();
  const { estadoLookCliente } = useLook();
  const { getVerPuntos, puntos, getSuscripcionActiva } = useUsuario();
  const { empresa } = useEmpresa();
  const { slug } = useParams();
  const esLumiBeauty = empresa?.slug === "lumicabeauty";

  const esBarberia = empresa?.tipo === "barberia";

  const [suscripcion, setSuscripcion] = useState(null);
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
          // ✅ Solo cargar look si es barbería
          esBarberia
            ? estadoLookCliente().catch(() => null)
            : Promise.resolve(null),
        ]);

        // ✅ Solo cargar suscripción si es barbería
        if (esBarberia) {
          const sus = await getSuscripcionActiva().catch(() => null);
          setSuscripcion(sus);
          await getVerPuntos().catch(() => null);
        }

        setData({ ultima, proxima });
        setLook(lookDataRaw || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingDatos(false);
      }
    };

    cargarDatos();
  }, [user?.id, esBarberia]);

  const diasRestantes = suscripcion
    ? Math.max(
        0,
        Math.ceil(
          (new Date(suscripcion.fechaFin) - new Date()) / (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  const serviciosRestantes = suscripcion
    ? Math.max(0, suscripcion.serviciosTotales - suscripcion.serviciosUsados)
    : null;

  // 🔄 Spinner global
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
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cita-card {
          border-radius: 16px;
          transition: transform 0.25s ease;
        }
        .cita-card:hover {
          transform: translateY(-5px);
        }
      `}</style>

      <Container fluid className="mt--7">
        <Row className="mb-5">
          <Col>
            <Card
              className="border-0 shadow-lg text-white card-hover hero-animate"
              style={
                esLumiBeauty
                  ? {
                      background:
                        "linear-gradient(135deg, #ff4da6 0%, #ff85c1 100%)",
                    }
                  : {
                      background:
                        "linear-gradient(135deg, #2dce89 0%, #2dcecc 100%)",
                    }
              }
            >
              <CardBody className="p-5">
                <div className="d-flex align-items-center mb-3">
                  <Sparkles size={32} className="text-warning mr-3" />
                  <h1 className="display-4 font-weight-bold mb-0 text-white">
                    Bienvenido, {user.nombre}
                  </h1>
                </div>
                {empresa?.nombre && (
                  <p className="mb-0 text-white">{empresa.nombre}</p>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* ===== PRÓXIMA CITA / ÚLTIMA VISITA ===== */}
        <Row className="mb-5">
          <Col lg="6" md="6" className="mb-4">
            <Card className="shadow-sm border-0 h-100 cita-card">
              <CardBody className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-uppercase text-muted mb-1">
                      📅 Próxima cita
                    </h6>
                    <h3 className="font-weight-bold mb-0">
                      {data.proxima
                        ? `${data.proxima.fecha} · ${data.proxima.hora}`
                        : "—"}
                    </h3>
                    <small className="d-block text-muted mt-1">
                      {data.proxima
                        ? "Tu próxima cita está confirmada"
                        : "No tienes reservas agendadas"}
                    </small>
                  </div>
                  <div className="bg-light rounded-circle p-3 shadow-sm">
                    <Calendar size={22} />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col lg="6" md="6" className="mb-4">
            <Card className="shadow-sm border-0 h-100 cita-card">
              <CardBody className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-uppercase text-muted mb-1">
                      📅 Última visita
                    </h6>
                    <h3 className="font-weight-bold mb-0">
                      {data.ultima
                        ? `${data.ultima.fecha} · ${data.ultima.hora}`
                        : "—"}
                    </h3>
                    <small className="d-block text-muted mt-1">
                      {data.ultima
                        ? "Mantener una frecuencia regular mejora tu look"
                        : "Aún no tienes visitas registradas"}
                    </small>
                  </div>
                  <div className="bg-light rounded-circle p-3 shadow-sm">
                    <Scissors size={22} />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* ===== ESTADO DEL LOOK — SOLO BARBERÍA ===== */}
        {esBarberia && look && (
          <Row className="mb-5">
            {["corte", "barba"].map((tipo) => {
              const necesitaAtencion =
                look[tipo]?.diasDesdeUltimo > look[tipo]?.promedio;

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
                              {look[tipo]?.diasDesdeUltimo !== null
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
                              {look[tipo]?.promedio !== null &&
                              look[tipo]?.promedio !== 0
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
                        {look[tipo]?.mensaje}
                      </Alert>
                    </CardBody>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}

        {/* ===== PUNTOS — SOLO BARBERÍA ===== */}
        {esBarberia && (
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
        )}

        {/* ===== SUSCRIPCIÓN — SOLO BARBERÍA ===== */}
        {esBarberia && suscripcion && (
          <Row className="mb-5">
            <Col>
              <Card className="border-0 shadow card-hover">
                <CardBody className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center">
                      <Zap className="text-success mr-2" size={24} />
                      <h4 className="mb-0">Tu suscripción</h4>
                    </div>
                    <Badge color="success" pill>
                      Activa
                    </Badge>
                  </div>

                  <Row>
                    <Col xs="6">
                      <div className="border rounded p-3 text-center">
                        <small className="text-muted d-block">
                          Días restantes
                        </small>
                        <strong className="h3">{diasRestantes}</strong>
                      </div>
                    </Col>
                    <Col xs="6">
                      <div className="border rounded p-3 text-center">
                        <small className="text-muted d-block">
                          Servicios incluidos
                        </small>
                        <strong className="h3">
                          {suscripcion.serviciosUsados}/
                          {suscripcion.serviciosTotales}
                        </strong>
                      </div>
                    </Col>
                  </Row>

                  <Progress
                    value={Math.min(
                      (suscripcion.serviciosUsados /
                        suscripcion.serviciosTotales) *
                        100,
                      100,
                    )}
                    color={serviciosRestantes === 0 ? "danger" : "success"}
                    style={{ height: 8 }}
                    className="mt-3 mb-2"
                  />

                  <small className="text-muted">
                    {serviciosRestantes > 0
                      ? `Te quedan ${serviciosRestantes} servicio${serviciosRestantes !== 1 ? "s" : ""} gratis`
                      : "Ya usaste todos los servicios incluidos — el próximo tiene costo normal"}
                  </small>
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}

        {/* ===== MENSAJE GENÉRICO PARA NO BARBERÍA ===== */}
        {!esBarberia && (
          <Row className="mb-5">
            <Col>
              <Card className="border-0 shadow card-hover">
                <CardBody className="p-4 text-center">
                  <Sparkles size={32} className="text-success mb-3" />
                  <h4 className="font-weight-bold mb-2">
                    ¡Todo listo para tu próxima cita!
                  </h4>
                  <p className="text-muted mb-0">
                    Reserva cuando quieras y gestiona tus citas desde el menú
                    lateral.
                  </p>
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

import React, { useEffect, useState } from "react";
import { Button, Card, CardBody, Container, Row, Col, Badge } from "reactstrap";
import UserHeader from "components/Headers/UserHeader.js";
import { useAuth } from "context/AuthContext";
import {
  Calendar,
  Clock,
  History,
  Crown,
  Sparkles,
  CalendarCheck,
  Zap,
  ArrowRight,
} from "lucide-react";
import { useEstadisticas } from "context/EstadisticasContext";

const UserDashboard = () => {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [showSurprise, setShowSurprise] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const { totalCitasEsteMes, ultimaReserva, proximaReserva } =
    useEstadisticas();
  const [citasMes, setCitasMes] = useState(0);
  const [loadingCitas, setLoadingCitas] = useState(true);
  const [statsData, setStatsData] = useState({
    citasMes: 0,
    totalReservas: 0,
    ultima: null,
  });

  useEffect(() => {
    if (!user?.id) return;

    const cargarStats = async () => {
      setLoadingCitas(true);
      try {
        const [citasMesResp, ultima, proxima] = await Promise.all([
          totalCitasEsteMes(user.id),
          ultimaReserva().catch((err) => err.message), // si falla devuelve el mensaje
          proximaReserva().catch((err) => err.message),
        ]);

        setStatsData({
          citasMes: citasMesResp?.total || 0,
          ultima,
          proxima,
        });
      } catch (err) {
        console.error(err);
        setStatsData({
          citasMes: 0,
          ultima: "Error cargando última reserva",
          proxima: "Error cargando próxima reserva",
        });
      } finally {
        setLoadingCitas(false);
      }
    };

    cargarStats();
  }, [user]);



  useEffect(() => {
    // Verificar si es tu polola cuando el usuario esté listo
    if (user?.rut === "20.307.949-4" || user?.rut === "203079494") {
      setShowSurprise(true);
    }
  }, [user]);

  // Loading principal
  if (authLoading) {
    return <div>Cargando usuario...</div>;
  }

  // Si no hay usuario después de cargar
  if (!user) {
    return <div>No se pudo cargar la información del usuario</div>;
  }

  const menuItems = [
    {
      title: "Reservar Hora",
      description: "Agenda tu próxima cita con nuestros barberos",
      icon: <Calendar size={24} />,
      color: "primary",
      badge: "Nuevo",
      href: "/admin/reservar-hora",
      gradient: "linear-gradient(135deg, #007bff 0%, #6610f2 100%)",
    },
    {
      title: "Gestionar Citas",
      description: "Modifica o cancela tus reservas existentes",
      icon: <Clock size={24} />,
      color: "warning",
      badge: "Activo",
      href: "/mis-reservas",
      gradient: "linear-gradient(135deg, #ff9f00 0%, #ffcc00 100%)",
    },
    {
      title: "Suscripción Elite",
      description: "Accede a beneficios exclusivos mensuales",
      icon: <Crown size={24} />,
      color: "success",
      badge: "Premium",
      href: "/admin/suscripcion",
      gradient: "linear-gradient(135deg, #00b09b 0%, #96c93d 100%)",
    },
  ];

  const stats = [
    {
      label: "Citas este mes",
      value: loadingCitas ? "Cargando..." : statsData.citasMes,
      icon: <CalendarCheck size={22} className="text-primary" />,
      color: "primary",
      description: "Total de citas realizadas este mes",
    },

    {
      label: "Próxima Cita",
      value: loadingCitas ? "Cargando..." : statsData.proxima,
      icon: <CalendarCheck size={22} className="text-success" />,
      description: "Tu próxima reserva agendada",
      color: "success",
    },
    {
      label: "Última Visita",
      value: loadingCitas ? "Cargando..." : statsData.ultima,
      icon: <History size={22} className="text-info" />,
      description: "Tu última vez en la barbería",
      color: "info",
    },
  ];

  return (
    <>
      <UserHeader />
      <Container className="mt--7" fluid>
        {/* Encabezado */}
        <Row className="mb-6">
          <Col xl="12">
            <Card className="shadow-lg border-0 bg-gradient-success text-white overflow-hidden">
              <CardBody className="p-5">
                <Row className="align-items-center">
                  <Col lg="8">
                    <div className="d-flex align-items-center mb-3">
                      <Sparkles size={32} className="mr-3 text-warning" />
                      <h1 className="display-4 font-weight-bold mb-0">
                        Bienvenido, {user?.nombre || "Usuario"}
                      </h1>
                    </div>
                    <p className="lead mb-0 opacity-75">
                      Tu experiencia en La Santa Barberia
                    </p>
                  </Col>
                  <Col lg="4" className="text-lg-right">
                    <div className="bg-white-10 rounded-lg p-3 d-inline-block">
                      <Zap size={40} className="text-warning" />
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Stats */}
        <Row className="mb-5">
          {stats.map((stat, index) => (
            <Col lg="4" md="6" className="mb-4" key={index}>
              <Card
                className="shadow-sm border-0 h-100 hover-zoom"
                style={{
                  borderRadius: "16px",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-5px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <CardBody className="p-4">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <h6 className="text-uppercase text-muted mb-1">
                        {stat.label}
                      </h6>
                      <h3 className="font-weight-bold mb-0">{stat.value}</h3>
                      {stat.change && (
                        <Badge color="success" className="rounded-pill mt-1">
                          {stat.change}
                        </Badge>
                      )}
                    </div>
                    <div className="bg-light rounded-circle p-3 shadow-sm">
                      {stat.icon}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Menú Principal */}
        <Row>
          <Col xl="12">
            <div className="d-flex align-items-center mb-4">
              <h2 className="text-black mb-0 mr-3">Menú Principal</h2>
              <div className="flex-grow-1">
                <hr className="bg-white opacity-50" />
              </div>
            </div>

            <Row>
              {menuItems.map((item, index) => (
                <Col xl="4" lg="6" className="mb-4" key={index}>
                  <Card
                    className="border-0 h-100 text-white shadow-lg"
                    style={{
                      background: item.gradient,
                      borderRadius: "18px",
                      cursor: "pointer",
                      transition:
                        "transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-6px)";
                      e.currentTarget.style.filter = "brightness(1.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.filter = "brightness(1)";
                    }}
                  >
                    <CardBody className="p-4">
                      <div className="d-flex align-items-start justify-content-between mb-3">
                        <div className="bg-white-20 rounded-circle p-3">
                          {item.icon}
                        </div>
                        {item.badge && (
                          <Badge
                            color="light"
                            className="rounded-pill px-3 font-weight-bold text-dark"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>

                      <h5 className="font-weight-bold mb-2 text-white">
                        {item.title}
                      </h5>
                      <p className="opacity-85 mb-4">{item.description}</p>

                      <Button
                        color="light"
                        size="sm"
                        className="rounded-pill px-4 font-weight-bold shadow-sm"
                        href={item.href}
                      >
                        Acceder <ArrowRight size={16} className="ml-2" />
                      </Button>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default UserDashboard;

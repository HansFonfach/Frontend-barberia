import React, { useEffect, useState } from "react";
import { Button, Card, CardBody, Container, Row, Col, Badge } from "reactstrap";
import UserHeader from "components/Headers/UserHeader.js";
import { useEstadisticas } from "context/EstadisticasContext";
import {
  Calendar,
  Users,
  Clock,
  Scissors,
  Settings,
  BarChart3,
  Sliders,
  ArrowRight,
  Crown,
  User,
  CreditCard,
  Zap,
  TrendingUp,
} from "lucide-react";

const formatPesos = (valor) => `$${(valor || 0).toLocaleString("es-CL")}`;

const AdminDashboard = () => {
  const {
    ingresoMensual,
    totalSuscripcionesActivas,
    totalReservasHoyBarbero,
    proximoCliente,
  } = useEstadisticas();

  const [infoIngresos, setInfoIngresos] = useState(null);
  const [proxCliente, setProxCliente] = useState({});
  const [suscripcionesActivas, setSuscripcionesActivas] = useState({});
  const [reservasHoy, setReservasHoy] = useState({});

  useEffect(() => {
    const cargarDatosDashBoard = async () => {
      try {
        const [ingreso, proximoClienteReservado, suscripciones, reservas] =
          await Promise.all([
            ingresoMensual(),
            proximoCliente(),
            totalSuscripcionesActivas(),
            totalReservasHoyBarbero(),
          ]);

        setInfoIngresos(ingreso);
        setProxCliente(proximoClienteReservado);
        setSuscripcionesActivas(suscripciones);
        setReservasHoy(reservas);
      } catch (error) {
        console.error("Error cargando datos del dashboard:", error);
      }
    };

    cargarDatosDashBoard();
  }, [
    ingresoMensual,
    proximoCliente,
    totalSuscripcionesActivas,
    totalReservasHoyBarbero,
  ]);

  const menuItems = [
    {
      title: "Reservas Cliente",
      description: "Gestiona y revisa todas las reservas de clientes",
      icon: <Calendar size={24} />,
      color: "primary",
      badge: "Principal",
      href: "/admin/reservar-hora-cliente",
      gradient: "linear-gradient(135deg, #007bff 0%, #6610f2 100%)",
    },
    {
      title: "Gestionar Clientes",
      description: "Administra la base de datos de clientes",
      icon: <Users size={24} />,
      color: "info",
      badge: "Gestión",
      href: "/admin/gestion-clientes",
      gradient: "linear-gradient(135deg, #17a2b8 0%, #0dcaf0 100%)",
    },
    {
      title: "Ver Agenda Diaria",
      description: "Revisa la agenda completa del día",
      icon: <Clock size={24} />,
      color: "success",
      badge: "Hoy",
      href: "/admin/reservas-hoy",
      gradient: "linear-gradient(135deg, #00b09b 0%, #96c93d 100%)",
    },
    {
      title: "Gestionar Barberos",
      description: "Administra el equipo de barberos",
      icon: <Scissors size={24} />,
      color: "warning",
      badge: "Staff",
      href: "/admin/gestion-barberos",
      gradient: "linear-gradient(135deg, #ff9f00 0%, #ffcc00 100%)",
    },
    {
      title: "Gestionar Servicios",
      description: "Configura servicios y precios",
      icon: <Settings size={24} />,
      color: "secondary",
      badge: "Catálogo",
      href: "/admin/gestion-servicios",
      gradient: "linear-gradient(135deg, #6c757d 0%, #adb5bd 100%)",
    },
    {
      title: "Gestionar Horarios",
      description: "Configura horarios de atención",
      icon: <Clock size={24} />,
      color: "danger",
      badge: "Horarios",
      href: "/admin/gestion-horarios",
      gradient: "linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)",
    },
    {
      title: "Panel de Control",
      description: "Configuración general del sistema",
      icon: <Sliders size={24} />,
      color: "dark",
      badge: "Admin",
      href: "/admin/panel-control",
      gradient: "linear-gradient(135deg, #343a40 0%, #000000 100%)",
    },
    {
      title: "Ver Estadísticas",
      description: "Métricas y reportes del negocio",
      icon: <BarChart3 size={24} />,
      color: "info",
      badge: "Analytics",
      href: "/admin/estadisticas",
      gradient: "linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)",
    },
  ];

  const stats = [
    {
      label: "Próximo Cliente",
      value: proxCliente?.data?.cliente?.nombreCompleto || "-",
      icon: <User size={20} />,
      extra: {
        hora: proxCliente?.data?.hora,
        fecha: proxCliente?.data?.fecha || "-",
      },
    },
    {
      label: "Reservas Hoy",
      value: reservasHoy.total,
      icon: <Calendar size={20} />,
    },
    {
      label: "Suscripciones Activas",
      value: suscripcionesActivas.total,
      icon: <Users size={20} />,
    },
  ];

  // Card especial de ingresos
  const renderCardIngresos = () => (
    <Card
      className="shadow-sm border-0 h-100"
      style={{
        borderRadius: "16px",
        transition: "transform 0.25s ease",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.transform = "translateY(-5px)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      <CardBody className="p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h6 className="text-uppercase text-muted mb-1">Ingreso del mes</h6>
            <h3 className="font-weight-bold mb-0">
              {infoIngresos ? formatPesos(infoIngresos.ingresoTotal) : "—"}
            </h3>
          </div>
          <div className="bg-light rounded-circle p-3 shadow-sm">
            <CreditCard size={20} />
          </div>
        </div>

        {/* Desglose */}
        {infoIngresos?.detalle && (
          <div
            style={{
              borderTop: "1px solid #f0f0f0",
              paddingTop: "10px",
              marginTop: "4px",
            }}
          >
            {/* Reservas completadas */}
            <div className="d-flex justify-content-between align-items-center mb-1">
              <small className="text-muted d-flex align-items-center">
                ✂️ Reservas cobradas
              </small>
              <small className="font-weight-bold text-success">
                {formatPesos(infoIngresos.detalle.ingresoReservas)}
              </small>
            </div>

            {/* Suscripciones */}
            <div className="d-flex justify-content-between align-items-center mb-1">
              <small className="text-muted d-flex align-items-center">
                ⭐ Suscripciones ({infoIngresos.detalle.suscripcionesNuevas})
              </small>
              <small className="font-weight-bold text-primary">
                {formatPesos(infoIngresos.detalle.ingresoSuscripciones)}
              </small>
            </div>

            {/* Posible ingreso */}
            <div
              className="d-flex justify-content-between align-items-center mt-2 pt-2"
              style={{ borderTop: "1px dashed #e0e0e0" }}
            >
              <small className="text-muted d-flex align-items-center">
                <TrendingUp size={12} className="mr-1 text-warning" />
                Posible ingreso
              </small>
              <small className="font-weight-bold text-warning">
                {formatPesos(infoIngresos.detalle.posibleIngreso)}
              </small>
            </div>
          </div>
        )}

        {!infoIngresos && <small className="text-muted">Cargando...</small>}
      </CardBody>
    </Card>
  );

  return (
    <>
      <UserHeader />
      <Container className="mt--7" fluid>
        {/* Encabezado */}
        <Row className="mb-6">
          <Col xl="12">
            <Card className="shadow-lg border-0 bg-gradient-primary text-white overflow-hidden">
              <CardBody className="p-5">
                <Row className="align-items-center">
                  <Col lg="8">
                    <div className="d-flex align-items-center mb-3">
                      <Crown size={32} className="mr-3 text-warning" />
                      <h1 className="display-4 font-weight-bold mb-0">
                        Panel Administración
                      </h1>
                    </div>
                    <p className="lead mb-0 opacity-75">
                      Gestión completa de La Santa Barbería
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
        <Row className="mb-5" style={{ alignItems: "flex-start" }}>
           {/* Card especial de ingresos */}
          <Col lg="3" md="6" className="mb-4">
            {renderCardIngresos()}
          </Col>
          {/* Cards normales */}
          {stats.map((stat, index) => (
            <Col lg="3" md="6" className="mb-4" key={index}>
              <Card
                className="shadow-sm border-0 h-100"
                style={{
                  borderRadius: "16px",
                  transition: "transform 0.25s ease",
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
                      <h3 className="font-weight-bold mb-0">
                        {stat.value ?? "—"}
                      </h3>

                      {stat.extra?.fecha && stat.extra?.hora && (
                        <div className="mt-1">
                          <small className="d-block text-muted">
                            📅 {stat.extra.fecha} &nbsp; 🕒 {stat.extra.hora}
                          </small>
                        </div>
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
              <h2 className="text-black mb-0 mr-3">Herramientas de Gestión</h2>
              <div className="flex-grow-1">
                <hr className="bg-white opacity-50" />
              </div>
            </div>

            <Row>
              {menuItems.map((item, index) => (
                <Col xl="3" lg="4" md="6" className="mb-4" key={index}>
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

        {/* CTA Final */}
        <Row className="mt-6">
          <Col xl="12">
            <Card className="shadow-lg border-0 bg-gradient-dark text-white">
              <CardBody className="p-5 text-center">
                <BarChart3 size={48} className="mb-3 text-warning" />
                <h3 className="font-weight-bold mb-2">
                  ¿Necesitas reportes detallados?
                </h3>
                <p className="lead opacity-75 mb-4">
                  Accede a análisis avanzados y reportes ejecutivos
                </p>
                <Button
                  color="warning"
                  size="lg"
                  className="rounded-pill px-5 font-weight-bold shadow-sm"
                  href="/admin/estadisticas"
                >
                  <BarChart3 size={18} className="mr-2" />
                  Ver Reportes Completos
                </Button>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default AdminDashboard;

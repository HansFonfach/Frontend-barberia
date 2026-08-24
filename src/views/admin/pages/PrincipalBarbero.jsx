import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Container,
  Row,
  Col,
  Badge,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
import UserHeader from "components/Headers/UserHeader.js";
import { useEstadisticas } from "context/EstadisticasContext";
import { useEstadisticasGimnasio } from "context/EstadisticasGimnasioContext";
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
  Dumbbell,
  UserPlus,
  AlertCircle,
  ClipboardList,
} from "lucide-react";
import { useEmpresa } from "context/EmpresaContext";
import { useAuth } from "context/AuthContext";
import BannerSuspension from "components/pagos/ModalSuspension";

const formatPesos = (valor) => `$${(valor || 0).toLocaleString("es-CL")}`;

const AdminDashboard = () => {
  const {
    ingresoMensual,
    totalSuscripcionesActivas,
    totalReservasHoyBarbero,
    proximoCliente,
  } = useEstadisticas();

  const [infoIngresos, setInfoIngresos] = useState(null);
  const [modalPagoPendiente, setModalPagoPendiente] = useState(false);
  const [proxCliente, setProxCliente] = useState(null);
  const [suscripcionesActivas, setSuscripcionesActivas] = useState(null);
  const [reservasHoy, setReservasHoy] = useState(null);
  const [cargandoStats, setCargandoStats] = useState({
    ingresos: true,
    proximoCliente: true,
    suscripciones: true,
    reservas: true,
  });

  const { user } = useAuth();
  const empresaSuspendida = user?.empresa?.estadoSuscripcion === "suspendido";

  const { empresa } = useEmpresa();
  const esLumiBeauty = empresa?.slug === "lumicabeauty";
  // Los botones de este dashboard hacen navegación de página completa (href,
  // no <Link>), así que el path SIEMPRE debe llevar el slug de la empresa —
  // sin él, ProtectedRoute no reconoce la ruta como admin y el usuario
  // termina rebotado de vuelta al dashboard (se sentía como un F5 "porque sí").
  const adminBase = `/${empresa?.slug || ""}/admin`;
  // FocusTrain y cualquier otro gimnasio/box: modelo de negocio distinto
  // (membresías + clases grupales, no reservas con crédito), así que este
  // mismo componente sirve un dashboard completamente distinto más abajo.
  const esGimnasio = empresa?.rubro === "gimnasio";

  // ============ Gimnasio: membresías + clases (ver más abajo) ============
  const {
    ingresosGimnasio,
    membresiasGimnasio,
    clasesHoyGimnasio,
    clientesGimnasio,
    porCobrarGimnasio,
  } = useEstadisticasGimnasio();

  const [gymIngresos, setGymIngresos] = useState(null);
  const [gymMembresias, setGymMembresias] = useState(null);
  const [gymClases, setGymClases] = useState(null);
  const [gymClientes, setGymClientes] = useState(null);
  const [gymPorCobrar, setGymPorCobrar] = useState(null);
  const [cargandoGym, setCargandoGym] = useState({
    ingresos: true,
    membresias: true,
    clases: true,
    clientes: true,
    porCobrar: true,
  });

  useEffect(() => {
    // Espera a que `empresa` esté cargada antes de decidir qué pedir: si no,
    // esGimnasio parte en false por defecto y este efecto se salta incluso
    // para un gimnasio real, mientras el de barbería sí dispara sus 4
    // llamadas de más (que nunca se usan) en ese primer instante.
    if (!empresa || !esGimnasio) return;

    const cargarDatosGimnasio = async () => {
      setCargandoGym({
        ingresos: true,
        membresias: true,
        clases: true,
        clientes: true,
        porCobrar: true,
      });

      const [ingresos, membresias, clases, clientes, porCobrar] =
        await Promise.allSettled([
          ingresosGimnasio(),
          membresiasGimnasio(),
          clasesHoyGimnasio(),
          clientesGimnasio(),
          porCobrarGimnasio(),
        ]);

      if (ingresos.status === "fulfilled") setGymIngresos(ingresos.value);
      else console.error("Error en ingresosGimnasio:", ingresos.reason);
      setCargandoGym((prev) => ({ ...prev, ingresos: false }));

      if (membresias.status === "fulfilled") setGymMembresias(membresias.value);
      else console.error("Error en membresiasGimnasio:", membresias.reason);
      setCargandoGym((prev) => ({ ...prev, membresias: false }));

      if (clases.status === "fulfilled") setGymClases(clases.value);
      else console.error("Error en clasesHoyGimnasio:", clases.reason);
      setCargandoGym((prev) => ({ ...prev, clases: false }));

      if (clientes.status === "fulfilled") setGymClientes(clientes.value);
      else console.error("Error en clientesGimnasio:", clientes.reason);
      setCargandoGym((prev) => ({ ...prev, clientes: false }));

      if (porCobrar.status === "fulfilled") setGymPorCobrar(porCobrar.value);
      else console.error("Error en porCobrarGimnasio:", porCobrar.reason);
      setCargandoGym((prev) => ({ ...prev, porCobrar: false }));
    };

    cargarDatosGimnasio();
  }, [
    empresa,
    esGimnasio,
    ingresosGimnasio,
    membresiasGimnasio,
    clasesHoyGimnasio,
    clientesGimnasio,
    porCobrarGimnasio,
  ]);

  useEffect(() => {
    // Este dashboard (barbería/salón) usa el modelo de Reserva + Suscripción,
    // que no aplica a un gimnasio — evita llamadas innecesarias. También
    // espera a que `empresa` esté cargada: si se dispara antes de saber el
    // rubro, un gimnasio real alcanza a pedir de más estos 4 datos que
    // nunca usa, antes de que el efecto de arriba tome la posta.
    if (!empresa || esGimnasio) return;

    const cargarDatosDashBoard = async () => {
      setCargandoStats({
        ingresos: true,
        proximoCliente: true,
        suscripciones: true,
        reservas: true,
      });

      try {
        const [ingreso, proximoClienteReservado, suscripciones, reservas] =
          await Promise.allSettled([
            ingresoMensual(),
            proximoCliente(),
            totalSuscripcionesActivas(),
            totalReservasHoyBarbero(),
          ]);

        if (ingreso.status === "fulfilled") {
          setInfoIngresos(ingreso.value);
          setCargandoStats((prev) => ({ ...prev, ingresos: false }));
        } else {
          console.error("Error en ingresoMensual:", ingreso.reason);
          setCargandoStats((prev) => ({ ...prev, ingresos: false }));
        }

        if (proximoClienteReservado.status === "fulfilled") {
          setProxCliente(proximoClienteReservado.value);
          setCargandoStats((prev) => ({ ...prev, proximoCliente: false }));
        } else {
          console.error(
            "Error en proximoCliente:",
            proximoClienteReservado.reason,
          );
          setCargandoStats((prev) => ({ ...prev, proximoCliente: false }));
        }

        if (suscripciones.status === "fulfilled") {
          setSuscripcionesActivas(suscripciones.value);
          setCargandoStats((prev) => ({ ...prev, suscripciones: false }));
        } else {
          console.error(
            "Error en totalSuscripcionesActivas:",
            suscripciones.reason,
          );
          setCargandoStats((prev) => ({ ...prev, suscripciones: false }));
        }

        if (reservas.status === "fulfilled") {
          setReservasHoy(reservas.value);
          setCargandoStats((prev) => ({ ...prev, reservas: false }));
        } else {
          console.error("Error en totalReservasHoyBarbero:", reservas.reason);
          setCargandoStats((prev) => ({ ...prev, reservas: false }));
        }
      } catch (error) {
        console.error("Error cargando datos del dashboard:", error);
      }
    };

    cargarDatosDashBoard();
  }, [
    empresa,
    esGimnasio,
    ingresoMensual,
    proximoCliente,
    totalSuscripcionesActivas,
    totalReservasHoyBarbero,
  ]);

  useEffect(() => {
    if (empresaSuspendida) {
      setModalPagoPendiente(true);
    }
  }, [empresaSuspendida]);

  const menuItems = [
    {
      title: "Reservas Cliente",
      description: "Gestiona y revisa todas las reservas de clientes",
      icon: <Calendar size={24} />,
      color: "primary",
      badge: "Principal",
      href: `${adminBase}/reservar-hora-cliente`,
      gradient: "linear-gradient(135deg, #007bff 0%, #6610f2 100%)",
    },
    {
      title: "Gestionar Clientes",
      description: "Administra la base de datos de clientes",
      icon: <Users size={24} />,
      color: "info",
      badge: "Gestión",
      href: `${adminBase}/gestion-clientes`,
      gradient: "linear-gradient(135deg, #17a2b8 0%, #0dcaf0 100%)",
    },
    {
      title: "Ver Agenda Diaria",
      description: "Revisa la agenda completa del día",
      icon: <Clock size={24} />,
      color: "success",
      badge: "Hoy",
      href: `${adminBase}/reservas-hoy`,
      gradient: "linear-gradient(135deg, #00b09b 0%, #96c93d 100%)",
    },
    {
      title: "Gestionar Barberos",
      description: "Administra el equipo de barberos",
      icon: <Scissors size={24} />,
      color: "warning",
      badge: "Staff",
      href: `${adminBase}/gestion-barberos`,
      gradient: "linear-gradient(135deg, #ff9f00 0%, #ffcc00 100%)",
    },
    {
      title: "Gestionar Servicios",
      description: "Configura servicios y precios",
      icon: <Settings size={24} />,
      color: "secondary",
      badge: "Catálogo",
      href: `${adminBase}/gestion-servicios`,
      gradient: "linear-gradient(135deg, #6c757d 0%, #adb5bd 100%)",
    },
    {
      title: "Gestionar Horarios",
      description: "Configura horarios de atención",
      icon: <Clock size={24} />,
      color: "danger",
      badge: "Horarios",
      href: `${adminBase}/gestion-horarios`,
      gradient: "linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)",
    },
    {
      title: "Panel de Control",
      description: "Configuración general del sistema",
      icon: <Sliders size={24} />,
      color: "dark",
      badge: "Admin",
      href: `${adminBase}/panel-control`,
      gradient: "linear-gradient(135deg, #343a40 0%, #000000 100%)",
    },
    {
      title: "Ver Estadísticas",
      description: "Métricas y reportes del negocio",
      icon: <BarChart3 size={24} />,
      color: "info",
      badge: "Analytics",
      href: `${adminBase}/estadisticas`,
      gradient: "linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)",
    },
  ];

  // Herramientas de gestión para gimnasios/boxes (misma tarjeta visual,
  // apuntando a las páginas reales del módulo de clases grupales)
  const menuItemsGimnasio = [
    {
      title: "Gestión de Clases",
      description: "Crea y edita clases con su horario semanal y cupo",
      icon: <Dumbbell size={24} />,
      badge: "Catálogo",
      href: `${adminBase}/gestion-clases`,
      gradient: "linear-gradient(135deg, #00b09b 0%, #96c93d 100%)",
    },
    {
      title: "Clases del día",
      description: "Revisa asistencia e inscritos de las sesiones de hoy",
      icon: <Clock size={24} />,
      badge: "Hoy",
      href: `${adminBase}/clases-del-dia`,
      gradient: "linear-gradient(135deg, #007bff 0%, #6610f2 100%)",
    },
    {
      title: "Gestión de Membresías",
      description: "Aprueba solicitudes y administra mensualidades activas",
      icon: <Users size={24} />,
      badge: "Membresías",
      href: `${adminBase}/membresias`,
      gradient: "linear-gradient(135deg, #ff9f00 0%, #ffcc00 100%)",
    },
    {
      title: "Planes de Membresía",
      description: "Configura los planes mensuales y sus precios",
      icon: <ClipboardList size={24} />,
      badge: "Catálogo",
      href: `${adminBase}/planes-membresia`,
      gradient: "linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)",
    },
    {
      title: "Gestión de Clientes",
      description: "Administra la base de datos de clientes",
      icon: <UserPlus size={24} />,
      badge: "Gestión",
      href: `${adminBase}/gestion-clientes`,
      gradient: "linear-gradient(135deg, #17a2b8 0%, #0dcaf0 100%)",
    },
    {
      title: "Configuración",
      description: "Datos del negocio, horarios de atención y redes sociales",
      icon: <Settings size={24} />,
      badge: "Admin",
      href: `${adminBase}/configuracion-empresa`,
      gradient: "linear-gradient(135deg, #343a40 0%, #000000 100%)",
    },
  ];

  // Componente Skeleton para cards
  const CardSkeleton = () => (
    <Card className="shadow-sm border-0 h-100" style={{ borderRadius: "16px" }}>
      <CardBody className="p-4">
        <div className="d-flex align-items-center justify-content-between">
          <div style={{ width: "70%" }}>
            <div
              className="bg-light rounded mb-2"
              style={{
                height: "14px",
                width: "60%",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            ></div>
            <div
              className="bg-light rounded"
              style={{
                height: "24px",
                width: "80%",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            ></div>
          </div>
          <div
            className="bg-light rounded-circle"
            style={{
              width: "56px",
              height: "56px",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          ></div>
        </div>
      </CardBody>
    </Card>
  );

  // Skeleton para la card de ingresos (más detallada)
  const IngresosSkeleton = () => (
    <Card className="shadow-sm border-0 h-100" style={{ borderRadius: "16px" }}>
      <CardBody className="p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div style={{ width: "60%" }}>
            <div
              className="bg-light rounded mb-2"
              style={{
                height: "14px",
                width: "70%",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            ></div>
            <div
              className="bg-light rounded"
              style={{
                height: "28px",
                width: "80%",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            ></div>
          </div>
          <div
            className="bg-light rounded-circle"
            style={{
              width: "56px",
              height: "56px",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          ></div>
        </div>
        <div className="mt-3">
          <div
            className="bg-light rounded mb-2"
            style={{
              height: "12px",
              width: "90%",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          ></div>
          <div
            className="bg-light rounded mb-2"
            style={{
              height: "12px",
              width: "85%",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          ></div>
          <div
            className="bg-light rounded"
            style={{
              height: "12px",
              width: "80%",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          ></div>
        </div>
      </CardBody>
    </Card>
  );

  const stats = [
    {
      label: "Próximo Cliente",
      value: proxCliente?.cliente?.nombreCompleto || "Sin reservas",
      icon: <User size={20} />,
      extra: proxCliente
        ? {
            hora: proxCliente.hora,
            fecha: proxCliente.fecha,
          }
        : null,
      cargando: cargandoStats.proximoCliente,
    },
    {
      label: "Reservas Hoy",
      value: reservasHoy?.total ?? 0,
      icon: <Calendar size={20} />,
      cargando: cargandoStats.reservas,
    },
    {
      label: "Suscripciones Activas",
      value: suscripcionesActivas?.total ?? 0,
      icon: <Users size={20} />,
      cargando: cargandoStats.suscripciones,
    },
  ];

  // Card especial de ingresos
  const renderCardIngresos = () => {
    if (cargandoStats.ingresos) {
      return <IngresosSkeleton />;
    }

    return (
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
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h6 className="text-uppercase text-muted mb-1">
                Ingreso del mes
              </h6>
              <h3 className="font-weight-bold mb-0">
                {infoIngresos ? formatPesos(infoIngresos.ingresoTotal) : "$0"}
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
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="text-muted d-flex align-items-center">
                  🛍️ Ingreso productos
                </small>
                <small className="font-weight-bold text-warning">
                  {formatPesos(infoIngresos.detalle.ingresoProductos)}
                </small>
              </div>
                 <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="text-muted d-flex align-items-center">
                  💰 Ingreso Extras
                </small>
                <small className="font-weight-bold text-yellow">
                  {formatPesos(infoIngresos.detalle.ingresoExtras)}
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
        </CardBody>
      </Card>
    );
  };

  // Estilos para la animación de pulso
  const pulseAnimation = `
    @keyframes pulse {
      0% {
        opacity: 1;
      }
      50% {
        opacity: 0.4;
      }
      100% {
        opacity: 1;
      }
    }
  `;

  // ============ Dashboard de gimnasio (FocusTrain y similares) ============
  if (esGimnasio) {
    const proxima = gymClases?.proxima || null;
    const sesionesHoy = gymClases?.sesiones || [];
    const porcentajeOcupacion = proxima
      ? Math.min(
          100,
          Math.round((proxima.inscritos / (proxima.cupoMaximo || 1)) * 100),
        )
      : 0;

    return (
      <>
        <BannerSuspension isOpen={empresaSuspendida} />
        <UserHeader />
        <Container className="mt--7" fluid>
          {/* Encabezado */}
          <Row className="mb-6">
            <Col xl="12">
              <Card className="shadow-lg border-0 text-white overflow-hidden bg-gradient-primary">
                <CardBody className="p-5">
                  <Row className="align-items-center">
                    <Col lg="8">
                      <div className="d-flex align-items-center mb-3">
                        <Dumbbell size={32} className="mr-3 text-warning" />
                        <h1 className="display-4 text-white font-weight-bold mb-0">
                          Panel Administración
                        </h1>
                      </div>
                      <p className="lead mb-0 opacity-75">
                        Gestión completa de {empresa?.nombre || "—"}
                      </p>
                      {!cargandoGym.ingresos &&
                        gymIngresos?.variacionPorcentaje !== null &&
                        gymIngresos?.variacionPorcentaje !== undefined && (
                          <Badge
                            color={
                              gymIngresos.variacionPorcentaje >= 0
                                ? "success"
                                : "danger"
                            }
                            className="mt-3 rounded-pill px-3 py-2"
                          >
                            {gymIngresos.variacionPorcentaje >= 0 ? "▲" : "▼"}{" "}
                            {Math.abs(gymIngresos.variacionPorcentaje)}% vs. mes
                            anterior
                          </Badge>
                        )}
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

          {/* KPIs */}
          <Row className="mb-5" style={{ alignItems: "flex-start" }}>
            <Col lg="3" md="6" className="mb-4">
              {cargandoGym.ingresos ? (
                <IngresosSkeleton />
              ) : (
                <Card
                  className="shadow-sm border-0 h-100"
                  style={{ borderRadius: "16px" }}
                >
                  <CardBody className="p-4">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div>
                        <h6 className="text-uppercase text-muted mb-1">
                          Ingreso del mes
                        </h6>
                        <h3 className="font-weight-bold mb-0">
                          {formatPesos(gymIngresos?.total)}
                        </h3>
                      </div>
                      <div className="bg-light rounded-circle p-3 shadow-sm">
                        <CreditCard size={20} />
                      </div>
                    </div>
                    {gymIngresos?.detalle && (
                      <div
                        style={{
                          borderTop: "1px solid #f0f0f0",
                          paddingTop: "10px",
                          marginTop: "4px",
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small className="text-muted">
                            🏋️ Membresías ({gymIngresos.detalle.membresiasCantidad})
                          </small>
                          <small className="font-weight-bold text-success">
                            {formatPesos(gymIngresos.detalle.membresias)}
                          </small>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small className="text-muted">
                            🎟️ Pases diarios (
                            {gymIngresos.detalle.pasesDiariosCantidad})
                          </small>
                          <small className="font-weight-bold text-primary">
                            {formatPesos(gymIngresos.detalle.pasesDiarios)}
                          </small>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">🛍️ Productos</small>
                          <small className="font-weight-bold text-warning">
                            {formatPesos(gymIngresos.detalle.productos)}
                          </small>
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>
              )}
            </Col>

            <Col lg="3" md="6" className="mb-4">
              {cargandoGym.membresias ? (
                <CardSkeleton />
              ) : (
                <Card
                  className="shadow-sm border-0 h-100"
                  style={{ borderRadius: "16px" }}
                >
                  <CardBody className="p-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div>
                        <h6 className="text-uppercase text-muted mb-1">
                          Membresías activas
                        </h6>
                        <h3 className="font-weight-bold mb-0">
                          {gymMembresias?.activas ?? 0}
                        </h3>
                      </div>
                      <div className="bg-light rounded-circle p-3 shadow-sm">
                        <Users size={20} />
                      </div>
                    </div>
                    <div
                      style={{
                        borderTop: "1px solid #f0f0f0",
                        paddingTop: "10px",
                        marginTop: "4px",
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-muted">🆕 Nuevas este mes</small>
                        <small className="font-weight-bold text-success">
                          {gymMembresias?.nuevasDelMes ?? 0}
                        </small>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-muted">
                          ⏳ Por vencer (7 días)
                        </small>
                        <small className="font-weight-bold text-warning">
                          {gymMembresias?.porVencer ?? 0}
                        </small>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          📋 Solicitudes pendientes
                        </small>
                        <small className="font-weight-bold text-primary">
                          {gymMembresias?.solicitudesPendientes ?? 0}
                        </small>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}
            </Col>

            <Col lg="3" md="6" className="mb-4">
              {cargandoGym.clientes ? (
                <CardSkeleton />
              ) : (
                <Card
                  className="shadow-sm border-0 h-100"
                  style={{ borderRadius: "16px" }}
                >
                  <CardBody className="p-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div>
                        <h6 className="text-uppercase text-muted mb-1">
                          Clientes
                        </h6>
                        <h3 className="font-weight-bold mb-0">
                          {gymClientes?.total ?? 0}
                        </h3>
                        <small className="text-success">
                          +{gymClientes?.nuevosDelMes ?? 0} este mes
                        </small>
                      </div>
                      <div className="bg-light rounded-circle p-3 shadow-sm">
                        <User size={20} />
                      </div>
                    </div>
                    <Button
                      color="primary"
                      size="sm"
                      outline
                      block
                      className="rounded-pill font-weight-bold mt-2"
                      href={`${adminBase}/gestion-clientes`}
                    >
                      <UserPlus size={14} className="mr-1" /> Registrar cliente
                    </Button>
                  </CardBody>
                </Card>
              )}
            </Col>

            <Col lg="3" md="6" className="mb-4">
              {cargandoGym.porCobrar ? (
                <CardSkeleton />
              ) : (
                <Card
                  className="shadow-sm border-0 h-100"
                  style={{ borderRadius: "16px" }}
                >
                  <CardBody className="p-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div>
                        <h6 className="text-uppercase text-muted mb-1">
                          Por cobrar
                        </h6>
                        <h3 className="font-weight-bold mb-0">
                          {formatPesos(gymPorCobrar?.total)}
                        </h3>
                        <small className="text-muted">
                          {gymPorCobrar?.cantidad ?? 0} clases pendientes de pago
                        </small>
                      </div>
                      <div className="bg-light rounded-circle p-3 shadow-sm">
                        <AlertCircle size={20} />
                      </div>
                    </div>
                    {gymPorCobrar?.solicitudesPendientes > 0 && (
                      <div
                        className="mt-2 pt-2"
                        style={{ borderTop: "1px dashed #e0e0e0" }}
                      >
                        <small className="text-warning font-weight-bold">
                          📋 {gymPorCobrar.solicitudesPendientes} solicitud
                          {gymPorCobrar.solicitudesPendientes === 1 ? "" : "es"}{" "}
                          de membresía por revisar
                        </small>
                      </div>
                    )}
                  </CardBody>
                </Card>
              )}
            </Col>
          </Row>

          {/* Hoy: próxima clase + lista compacta */}
          <Row>
            <Col xl="12">
              <div className="d-flex align-items-center mb-4">
                <h2 className="text-black mb-0 mr-3">Hoy</h2>
                <div className="flex-grow-1">
                  <hr className="bg-white opacity-50" />
                </div>
              </div>
            </Col>
          </Row>
          <Row className="mb-5">
            <Col lg="5" className="mb-4">
              {cargandoGym.clases ? (
                <CardSkeleton />
              ) : (
                <Card
                  className="shadow-sm border-0 h-100"
                  style={{ borderRadius: "16px" }}
                >
                  <CardBody className="p-4">
                    <h6 className="text-uppercase text-muted mb-3">
                      Próxima clase
                    </h6>
                    {proxima ? (
                      <>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <h4 className="font-weight-bold mb-0">
                            {proxima.nombre}
                          </h4>
                          <Badge color="primary" className="rounded-pill px-3">
                            {new Date(proxima.fecha).toLocaleTimeString("es-CL", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Badge>
                        </div>
                        {proxima.instructor?.nombre && (
                          <p className="text-muted mb-2">
                            Instructor: {proxima.instructor.nombre}{" "}
                            {proxima.instructor.apellido || ""}
                          </p>
                        )}
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small className="text-muted">
                            {proxima.inscritos}/{proxima.cupoMaximo} cupos
                            ocupados
                          </small>
                          <small className="font-weight-bold">
                            {porcentajeOcupacion}%
                          </small>
                        </div>
                        <div
                          className="progress"
                          style={{ height: "8px", borderRadius: "4px" }}
                        >
                          <div
                            className="progress-bar bg-success"
                            style={{ width: `${porcentajeOcupacion}%` }}
                          ></div>
                        </div>
                      </>
                    ) : (
                      <p className="text-muted mb-0">
                        No quedan clases programadas para hoy.
                      </p>
                    )}
                  </CardBody>
                </Card>
              )}
            </Col>

            <Col lg="7" className="mb-4">
              {cargandoGym.clases ? (
                <CardSkeleton />
              ) : (
                <Card
                  className="shadow-sm border-0 h-100"
                  style={{ borderRadius: "16px" }}
                >
                  <CardBody className="p-4">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h6 className="text-uppercase text-muted mb-0">
                        Clases de hoy
                      </h6>
                      <a
                        href={`${adminBase}/clases-del-dia`}
                        className="small font-weight-bold"
                      >
                        Ver todas →
                      </a>
                    </div>
                    {sesionesHoy.length ? (
                      sesionesHoy.slice(0, 5).map((s, i) => (
                        <div
                          key={i}
                          className="d-flex align-items-center justify-content-between py-2"
                          style={{
                            borderBottom:
                              i < Math.min(sesionesHoy.length, 5) - 1
                                ? "1px solid #f0f0f0"
                                : "none",
                          }}
                        >
                          <div>
                            <span className="font-weight-bold">{s.nombre}</span>
                            <small className="text-muted d-block">
                              {new Date(s.fecha).toLocaleTimeString("es-CL", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </small>
                          </div>
                          <Badge
                            color={s.lleno ? "danger" : "success"}
                            className="rounded-pill px-3"
                          >
                            {s.lleno ? "Lleno" : `${s.inscritos}/${s.cupoMaximo}`}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted mb-0">
                        No hay clases programadas para hoy.
                      </p>
                    )}
                  </CardBody>
                </Card>
              )}
            </Col>
          </Row>

          {/* Herramientas de gestión */}
          <Row>
            <Col xl="12">
              <div className="d-flex align-items-center mb-4">
                <h2 className="text-black mb-0 mr-3">Herramientas de Gestión</h2>
                <div className="flex-grow-1">
                  <hr className="bg-white opacity-50" />
                </div>
              </div>

              <Row>
                {menuItemsGimnasio.map((item, index) => (
                  <Col xl="4" lg="6" md="6" className="mb-4" key={index}>
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
  }

  return (
    <>
      <BannerSuspension isOpen={empresaSuspendida} />
      <UserHeader />
      <Container className="mt--7" fluid>
        {/* Encabezado */}
        <Row className="mb-6">
          <Col xl="12">
            <Card
              className={`shadow-lg border-0 text-white overflow-hidden ${
                esLumiBeauty ? "" : "bg-gradient-primary"
              }`}
              style={
                esLumiBeauty
                  ? {
                      background:
                        "linear-gradient(135deg, #ff4da6 0%, #ff85c1 100%)",
                    }
                  : {}
              }
            >
              <CardBody className="p-5">
                <Row className="align-items-center">
                  <Col lg="8">
                    <div className="d-flex align-items-center mb-3">
                      <Crown size={32} className="mr-3 text-warning" />

                      <h1 className="display-4 text-white font-weight-bold mb-0">
                        Panel Administración
                      </h1>
                    </div>
                    <p className="lead mb-0 opacity-75">
                      Gestión completa de {empresa?.nombre || "—"}
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
              {stat.cargando ? (
                <CardSkeleton />
              ) : (
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
              )}
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
                  href={`${adminBase}/estadisticas`}
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

import React, { useEffect, useState } from "react";
import { Card, CardBody, Container, Row, Col } from "reactstrap";
import UserHeader from "components/Headers/UserHeader";
import {
  DollarSign,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  TrendingUp,
  Trophy,
  AlertTriangle,
  UserX,
  BarChart3,
} from "lucide-react";
import { useEstadisticas } from "context/EstadisticasContext";

const Estadisticas = () => {
  const { DashboardResumen } = useEstadisticas();

  const [stats, setStats] = useState({
    ingresosTotales: null,
    ingresoMensual: null,
    reservasTotales: null,
    clientesTotales: null,
    reservasCompletadas: null,
    reservasCanceladas: null,
    horaMasCancelada: null,
    servicioMasPopular: null,
    ticketPromedio: null,
    tasaCancelacion: null,
    tasaAsistencia: null,
  });

  const [topClientes, setTopClientes] = useState([]);
  const [topCanceladores, setTopCanceladores] = useState([]);
  const [topNoAsistidos, setTopNoAsistidos] = useState([]);

  const formatMoney = (value) => {
    if (!value) return "$0";
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const d = await DashboardResumen(); // 1 sola llamada 🚀

        setStats({
          ingresosTotales: formatMoney(d.ingresoTotal),
          ingresoMensual: formatMoney(d.ingresoMensual?.detalle?.ingresoReservas + d.ingresoMensual?.detalle?.ingresoSuscripciones ?? 0),
          reservasTotales: d.citasMes,
          clientesTotales: d.totalClientes,
          reservasCompletadas: d.reservasCompletadas,
          reservasCanceladas: d.reservasCanceladas,
          horaMasCancelada: d.horaMasCancelada?.rango ?? "--",
          servicioMasPopular: d.servicioMasPopular?.nombre ?? "--",
          ticketPromedio:
            d.citasMes > 0
              ? formatMoney(d.ingresoTotal / d.citasMes)
              : "--",
          tasaCancelacion: d.tasaCancelacion?.porcentaje ?? "--",
          tasaAsistencia: d.tasaAsistencia?.porcentaje ?? "--",
        });

        setTopClientes(d.topAsistentes || []);
        setTopCanceladores(d.topCanceladores || []);
        setTopNoAsistidos(d.topNoAsistidos || []);
      } catch (error) {
        console.error("Error cargando estadísticas", error);
      }
    };

    cargarEstadisticas();
  }, []);

  const StatCard = ({ title, value, icon, variant = "default" }) => {
    const getVariantStyles = () => {
      switch (variant) {
        case "primary":
          return {
            bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            text: "white",
            iconBg: "rgba(255,255,255,0.2)",
          };
        case "success":
          return {
            bg: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
            text: "#1a4731",
            iconBg: "rgba(255,255,255,0.3)",
          };
        case "warning":
          return {
            bg: "linear-gradient(135deg, #fad961 0%, #f76b1c 100%)",
            text: "#5f370e",
            iconBg: "rgba(255,255,255,0.3)",
          };
        default:
          return {
            bg: "white",
            text: "#2d3748",
            iconBg: "#f1f3f5",
          };
      }
    };

    const styles = getVariantStyles();

    return (
      <Card
        className="stat-card border-0 h-100"
        style={{
          background: styles.bg,
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        <CardBody className="d-flex justify-content-between align-items-center p-3 p-md-4">
          <div>
            <p
              className="stat-label mb-1"
              style={{
                color:
                  variant === "default"
                    ? "#6c757d"
                    : "rgba(255,255,255,0.8)",
                fontSize: "0.8rem",
                fontWeight: 500,
                letterSpacing: "0.3px",
              }}
            >
              {title}
            </p>
            <h4
              className="stat-value mb-0"
              style={{
                color: styles.text,
                fontWeight: 700,
                fontSize: "clamp(1.2rem, 4vw, 1.5rem)",
              }}
            >
              {value === null ? (
                <span
                  className={
                    variant === "default" ? "text-muted" : "text-white-50"
                  }
                >
                  ...
                </span>
              ) : (
                value
              )}
            </h4>
          </div>
          <div
            className="stat-icon"
            style={{
              background: styles.iconBg,
              padding: "12px",
              borderRadius: "12px",
              color: variant === "default" ? styles.text : "white",
            }}
          >
            {icon}
          </div>
        </CardBody>
      </Card>
    );
  };

  const TopTable = ({
    titulo,
    icono,
    datos,
    columnaValor,
    labelValor,
    colorBadge = "success",
  }) => (
    <Card className="shadow-sm border-0 top-card h-100">
      <CardBody className="p-3 p-md-4">
        <div className="d-flex align-items-center mb-3 mb-md-4">
          <div className="mr-2" style={{ color: `var(--${colorBadge})` }}>
            {icono}
          </div>
          <h5
            className="mb-0 fw-bold"
            style={{ fontSize: "clamp(1rem, 3vw, 1.25rem)" }}
          >
            {titulo}
          </h5>
        </div>

        {datos.length === 0 ? (
          <div className="empty-box">Sin datos disponibles</div>
        ) : (
          datos.map((item, index) => (
            <div
              key={index}
              className="d-flex flex-wrap flex-sm-nowrap justify-content-between align-items-center mb-2 p-2 p-sm-3 top-client-row"
              style={{
                background: "#f8fafc",
                borderRadius: "10px",
                transition: "all 0.2s ease",
              }}
            >
              <div className="d-flex align-items-center w-100 w-sm-auto mb-2 mb-sm-0">
                <span
                  className="rank-badge mr-2 mr-sm-3"
                  style={{
                    minWidth: "28px",
                    fontWeight: 600,
                    color: "#94a3b8",
                  }}
                >
                  #{index + 1}
                </span>
                <div style={{ maxWidth: "200px" }}>
                  <strong style={{ fontSize: "0.9rem", display: "block" }}>
                    {item.nombre} {item.apellido}
                  </strong>
                  <span
                    className="text-muted small"
                    style={{
                      fontSize: "0.75rem",
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.email}
                  </span>
                </div>
              </div>
              <span
                className={`badge badge-${colorBadge} px-2 px-sm-3 py-1 py-sm-2 ml-auto ml-sm-0`}
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  borderRadius: "20px",
                }}
              >
                {item[columnaValor]} {labelValor}
              </span>
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );

  return (
    <>
      <UserHeader />
      <Container fluid className="mt--7 pb-5 dashboard-bg px-3 px-md-4">
        {/* Título de sección */}
        <Row className="mb-4">
          <Col xs="12">
            <div className="d-flex align-items-center mb-3">
              <BarChart3 size={24} className="text-primary mr-2" />
              <h3 className="mb-0 fw-bold">Panel de Estadísticas</h3>
            </div>
            <p className="text-muted">Resumen general del negocio</p>
          </Col>
        </Row>

        {/* ===== KPIs PRINCIPALES ===== */}
        <Row className="g-3 g-md-4 mb-4">
          <Col xs="12" sm="6" xl="3" className="mb-3 mb-md-4">
            <StatCard
              title="Ingresos Totales"
              value={stats.ingresosTotales}
              icon={<DollarSign size={20} />}
              variant="primary"
            />
          </Col>
          <Col xs="12" sm="6" xl="3" className="mb-3 mb-md-4">
            <StatCard
              title="Ingreso Mensual"
              value={stats.ingresoMensual}
              icon={<TrendingUp size={20} />}
              variant="success"
            />
          </Col>
          <Col xs="12" sm="6" xl="3" className="mb-3 mb-md-4">
            <StatCard
              title="Reservas del Mes"
              value={stats.reservasTotales}
              icon={<Calendar size={20} />}
            />
          </Col>
          <Col xs="12" sm="6" xl="3" className="mb-3 mb-md-4">
            <StatCard
              title="Clientes Totales"
              value={stats.clientesTotales}
              icon={<Users size={20} />}
            />
          </Col>
        </Row>

        {/* ===== OPERATIVO ===== */}
        <Row className="g-3 g-md-4 mb-4">
          <Col xs="12" sm="6" xl="3" className="mb-3 mb-md-4">
            <StatCard
              title="Completadas"
              value={stats.reservasCompletadas}
              icon={<CheckCircle size={20} />}
            />
          </Col>
          <Col xs="12" sm="6" xl="3" className="mb-3 mb-md-4">
            <StatCard
              title="Canceladas"
              value={stats.reservasCanceladas}
              icon={<XCircle size={20} />}
            />
          </Col>
          <Col xs="12" sm="6" xl="3" className="mb-3 mb-md-4">
            <StatCard
              title="Hora Más Cancelada"
              value={stats.horaMasCancelada}
              icon={<Clock size={20} />}
            />
          </Col>
          <Col xs="12" sm="6" xl="3" className="mb-3 mb-md-4">
            <StatCard
              title="Servicio Top"
              value={stats.servicioMasPopular}
              icon={<Star size={20} />}
            />
          </Col>
        </Row>

        {/* ===== ANÁLISIS ===== */}
        <Row className="g-3 g-md-4 mb-4">
          <Col xs="12" sm="6" xl="3" className="mb-3 mb-md-4">
            <StatCard
              title="Ticket Promedio"
              value={stats.ticketPromedio}
              icon={<DollarSign size={20} />}
              variant="primary"
            />
          </Col>
          <Col xs="12" sm="6" xl="3" className="mb-3 mb-md-4">
            <StatCard
              title="Tasa Cancelación"
              value={stats.tasaCancelacion}
              icon={<XCircle size={20} />}
              variant="warning"
            />
          </Col>
          <Col xs="12" sm="6" xl="3" className="mb-3 mb-md-4">
            <StatCard
              title="Tasa Asistencia"
              value={stats.tasaAsistencia}
              icon={<CheckCircle size={20} />}
              variant="success"
            />
          </Col>
        </Row>

        {/* ===== TOP 5 TABLAS ===== */}
        <Row className="g-3 g-md-4">
          <Col lg="4" className="mb-3 mb-md-4">
            <TopTable
              titulo="Top 5 Mejores Clientes"
              icono={<Trophy size={20} className="text-warning" />}
              datos={topClientes}
              columnaValor="totalGastadoFormateado"
              labelValor=""
              colorBadge="success"
            />
          </Col>

          <Col lg="4" className="mb-3 mb-md-4">
            <TopTable
              titulo="Top 5 Canceladores"
              icono={<AlertTriangle size={20} className="text-danger" />}
              datos={topCanceladores}
              columnaValor="totalCancelaciones"
              labelValor="cancel."
              colorBadge="danger"
            />
          </Col>

          <Col lg="4" className="mb-3 mb-md-4">
            <TopTable
              titulo="Top 5 No Asistidos"
              icono={<UserX size={20} className="text-warning" />}
              datos={topNoAsistidos}
              columnaValor="totalNoAsistidos"
              labelValor="faltas"
              colorBadge="warning"
            />
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        .dashboard-bg {
          background: #f7f9fc;
          min-height: 100vh;
        }

        .stat-card {
          transition: all 0.3s ease;
          cursor: default;
          overflow: hidden;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1) !important;
        }

        .top-card {
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .top-card:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08) !important;
        }

        .top-client-row {
          transition: all 0.2s ease;
        }

        .top-client-row:hover {
          background: #eef2f6 !important;
          transform: translateX(5px);
        }

        .empty-box {
          padding: 30px;
          text-align: center;
          color: #94a3b8;
          background: #f8fafc;
          border-radius: 12px;
          font-size: 0.9rem;
        }

        .badge {
          font-weight: 500;
          letter-spacing: 0.3px;
        }

        @media (max-width: 576px) {
          .stat-card .card-body {
            padding: 1rem !important;
          }

          .top-client-row {
            flex-direction: column;
            align-items: flex-start !important;
          }

          .top-client-row > div:first-child {
            width: 100%;
            margin-bottom: 10px;
          }

          .top-client-row .badge {
            align-self: flex-end;
            margin-top: 5px;
          }

          .empty-box {
            padding: 20px;
            font-size: 0.85rem;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .stat-card,
        .top-card {
          animation: fadeIn 0.5s ease forwards;
        }

        .row:nth-child(2) .col {
          animation-delay: 0.1s;
        }
        .row:nth-child(3) .col {
          animation-delay: 0.2s;
        }
        .row:nth-child(4) .col {
          animation-delay: 0.3s;
        }
        .row:nth-child(5) .col {
          animation-delay: 0.4s;
        }
      `}</style>
    </>
  );
};

export default Estadisticas;
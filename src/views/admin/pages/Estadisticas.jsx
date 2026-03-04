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
} from "lucide-react";
import { useEstadisticas } from "context/EstadisticasContext";

const Estadisticas = () => {
  const {
    ingresoTotal,
    ingresoMensual,
    totalCitasEsteMes,
    totalClientes,
    reservasCompletadas,
    reservasCanceladas,
    horaMasCancelada,
    servicioMasPopular,
    tasaDeCancelacion,
    tasaDeAsistencia,
    top5ClientesAsistentes, // ← nombre correcto
    top5ClientesCanceladores,
    top5ClientesNoAsistidores,
  } = useEstadisticas();

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
    }).format(value);
  };

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const [
          totalIng,
          ingMes,
          reservasMes,
          clientes,
          completadas,
          canceladas,
          servicioPopular,
          horaCancelada,
          tasaCanc,
          tasaAsis,
          top5,
          canceladores,
          noAsistidos,
        ] = await Promise.all([
          ingresoTotal(),
          ingresoMensual(),
          totalCitasEsteMes(),
          totalClientes(),
          reservasCompletadas(),
          reservasCanceladas(),
          servicioMasPopular(),
          horaMasCancelada(),
          tasaDeCancelacion(),
          tasaDeAsistencia(),
          top5ClientesAsistentes(),
          top5ClientesCanceladores(),
          top5ClientesNoAsistidores(),
        ]);

        setStats({
          ingresosTotales: formatMoney(totalIng),
          ingresoMensual: formatMoney(ingMes?.ingresoTotal ?? ingMes),
          reservasTotales: reservasMes,
          clientesTotales: clientes,
          reservasCompletadas: completadas,
          reservasCanceladas: canceladas,
          horaMasCancelada: horaCancelada ?? "--",
          servicioMasPopular:
            servicioPopular?.nombre ?? servicioPopular ?? "--",
          ticketPromedio:
            reservasMes > 0 ? formatMoney(totalIng / reservasMes) : "--",
          tasaCancelacion: tasaCanc ?? "--",
          tasaAsistencia: tasaAsis ?? "--",
        });

        setTopClientes(top5 || []);
        setTopCanceladores(canceladores || []);
        setTopNoAsistidos(noAsistidos || []);
      } catch (error) {
        console.error("Error cargando estadísticas", error);
      }
    };

    cargarEstadisticas();
  }, []);

  const StatCard = ({ title, value, icon }) => (
    <Card className="stat-card border-0 shadow-sm h-100">
      <CardBody className="d-flex justify-content-between align-items-center">
        <div>
          <p className="stat-label mb-1">{title}</p>
          <h4 className="stat-value mb-0">
            {value === null ? <span className="text-muted">...</span> : value}
          </h4>
        </div>
        <div className="stat-icon">{icon}</div>
      </CardBody>
    </Card>
  );

  const TopTable = ({
    titulo,
    icono,
    datos,
    columnaValor,
    labelValor,
    colorBadge = "success",
  }) => (
    <Card className="shadow-sm border-0 top-card h-100">
      <CardBody>
        <div className="d-flex align-items-center mb-4">
          <div className="mr-2">{icono}</div>
          <h5 className="mb-0 fw-bold">{titulo}</h5>
        </div>

        {datos.length === 0 ? (
          <div className="empty-box">Sin datos disponibles.</div>
        ) : (
          datos.map((item, index) => (
            <div
              key={index}
              className="d-flex justify-content-between align-items-center mb-3 top-client-row"
            >
              <div className="d-flex align-items-center">
                <span className="rank-badge mr-3">#{index + 1}</span>
                <div>
                  <strong>
                    {item.nombre} {item.apellido}
                  </strong>
                  <div className="text-muted small">{item.email}</div>
                </div>
              </div>
              <span className={`badge badge-${colorBadge} px-3 py-2`}>
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
      <Container fluid className="mt--7 pb-5 dashboard-bg">
        {/* ===== KPIs PRINCIPALES ===== */}
        <Row className="mb-4">
          <Col xl="3" md="6" className="mb-4">
            <StatCard
              title="Ingresos Totales"
              value={stats.ingresosTotales}
              icon={<DollarSign size={20} />}
            />
          </Col>
          <Col xl="3" md="6" className="mb-4">
            <StatCard
              title="Ingreso Mensual"
              value={stats.ingresoMensual}
              icon={<TrendingUp size={20} />}
            />
          </Col>
          <Col xl="3" md="6" className="mb-4">
            <StatCard
              title="Reservas Este Mes"
              value={stats.reservasTotales}
              icon={<Calendar size={20} />}
            />
          </Col>
          <Col xl="3" md="6" className="mb-4">
            <StatCard
              title="Clientes Totales"
              value={stats.clientesTotales}
              icon={<Users size={20} />}
            />
          </Col>
        </Row>

        {/* ===== OPERATIVO ===== */}
        <Row className="mb-4">
          <Col xl="3" md="6" className="mb-4">
            <StatCard
              title="Reservas Completadas"
              value={stats.reservasCompletadas}
              icon={<CheckCircle size={20} />}
            />
          </Col>
          <Col xl="3" md="6" className="mb-4">
            <StatCard
              title="Reservas Canceladas"
              value={stats.reservasCanceladas}
              icon={<XCircle size={20} />}
            />
          </Col>
          <Col xl="3" md="6" className="mb-4">
            <StatCard
              title="Hora Más Cancelada"
              value={stats.horaMasCancelada}
              icon={<Clock size={20} />}
            />
          </Col>
          <Col xl="3" md="6" className="mb-4">
            <StatCard
              title="Servicio Más Popular"
              value={stats.servicioMasPopular}
              icon={<Star size={20} />}
            />
          </Col>
        </Row>

        {/* ===== ANÁLISIS ===== */}
        <Row className="mb-4">
          <Col xl="3" md="6" className="mb-4">
            <StatCard
              title="Ticket Promedio"
              value={stats.ticketPromedio}
              icon={<DollarSign size={20} />}
            />
          </Col>
          <Col xl="3" md="6" className="mb-4">
            <StatCard
              title="Tasa de Cancelación"
              value={stats.tasaCancelacion}
              icon={<XCircle size={20} />}
            />
          </Col>
          <Col xl="3" md="6" className="mb-4">
            <StatCard
              title="Tasa de Asistencia"
              value={stats.tasaAsistencia}
              icon={<CheckCircle size={20} />}
            />
          </Col>
        </Row>

        {/* ===== TOP 5 TABLAS ===== */}
        <Row className="mb-4">
          {/* Top clientes por gasto */}
          <Col xl="4" className="mb-4">
            <TopTable
              titulo="Top 5 Mejores Clientes"
              icono={<Trophy size={20} className="text-warning" />}
              datos={topClientes}
              columnaValor="totalGastadoFormateado"
              labelValor=""
              colorBadge="success"
            />
          </Col>

          {/* Top canceladores */}
          <Col xl="4" className="mb-4">
            <TopTable
              titulo="Top 5 Canceladores"
              icono={<AlertTriangle size={20} className="text-danger" />}
              datos={topCanceladores}
              columnaValor="totalCancelaciones"
              labelValor="cancel."
              colorBadge="danger"
            />
          </Col>

          {/* Top no asistidos */}
          <Col xl="4" className="mb-4">
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

      <style>{`
        .dashboard-bg {
          background: #f7f8fa;
          min-height: 100vh;
        }
        .stat-card {
          border-radius: 14px;
          background: white;
          transition: 0.2s ease;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.06);
        }
        .stat-label {
          font-size: 0.85rem;
          color: #6c757d;
        }
        .stat-value {
          font-weight: 700;
          font-size: 1.4rem;
        }
        .stat-icon {
          background: #f1f3f5;
          padding: 10px;
          border-radius: 10px;
        }
        .top-card {
          border-radius: 14px;
        }
        .top-client-row {
          padding: 12px 16px;
          border-radius: 10px;
          background: #f9fafb;
          transition: 0.2s ease;
        }
        .top-client-row:hover {
          background: #eef1f4;
        }
        .empty-box {
          padding: 30px;
          text-align: center;
          color: #6c757d;
          background: #f8f9fa;
          border-radius: 10px;
        }
        .rank-badge {
          font-size: 0.75rem;
          font-weight: 700;
          color: #6c757d;
          min-width: 24px;
        }
      `}</style>
    </>
  );
};

export default Estadisticas;

import React from "react";
import {
  Card,
  CardBody,
  Container,
  Row,
  Col,
} from "reactstrap";
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
} from "lucide-react";

const Estadisticas = () => {
  // 👇 aquí luego conectas tu endpoint real
  const stats = {
    ingresosTotales: null,
    ingresoMensual: null,
    reservasTotales: null,
    clientesTotales: null,
    reservasCompletadas: null,
    reservasCanceladas: null,
    horaMasSolicitada: null,
    horaMasCancelada: null,
    servicioMasPopular: null,
    ticketPromedio: null,
    tasaCancelacion: null,
    tasaAsistencia: null,
    topClientes: [],
  };

  const StatCard = ({ title, value, icon }) => (
    <Card className="stat-card border-0 shadow-sm h-100">
      <CardBody className="d-flex justify-content-between align-items-center">
        <div>
          <p className="stat-label mb-1">{title}</p>
          <h4 className="stat-value mb-0">{value ?? "--"}</h4>
        </div>
        <div className="stat-icon">{icon}</div>
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
              title="Reservas Totales"
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
              title="Hora Más Solicitada"
              value={stats.horaMasSolicitada}
              icon={<Clock size={20} />}
            />
          </Col>
          <Col xl="3" md="6" className="mb-4">
            <StatCard
              title="Hora Más Cancelada"
              value={stats.horaMasCancelada}
              icon={<Clock size={20} />}
            />
          </Col>
        </Row>

        {/* ===== ANALISIS ===== */}
        <Row className="mb-4">
          <Col xl="3" md="6" className="mb-4">
            <StatCard
              title="Servicio Más Popular"
              value={stats.servicioMasPopular}
              icon={<Star size={20} />}
            />
          </Col>
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

        {/* ===== TOP CLIENTES ===== */}
        <Row>
          <Col xl="12">
            <Card className="shadow-sm border-0 top-card">
              <CardBody>
                <h5 className="mb-4 fw-bold">Top 5 Clientes</h5>

                {stats.topClientes.length === 0 ? (
                  <div className="empty-box">
                    Aquí aparecerán los clientes más frecuentes.
                  </div>
                ) : (
                  stats.topClientes.map((cliente, index) => (
                    <div
                      key={index}
                      className="d-flex justify-content-between align-items-center mb-3 top-client-row"
                    >
                      <div>
                        <strong>{cliente.nombre}</strong>
                        <div className="text-muted small">
                          {cliente.reservas} reservas
                        </div>
                      </div>
                      <div className="fw-bold">
                        {cliente.gasto}
                      </div>
                    </div>
                  ))
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <style>
        {`
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
        `}
      </style>
    </>
  );
};

export default Estadisticas;
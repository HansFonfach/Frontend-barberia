import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  Container,
  Row,
  Col,
  Badge,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import UserHeader from "components/Headers/UserHeader.js";
import { useAuth } from "context/AuthContext";
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Clock,
  Scissors,
  UserPlus,
  Target,
  PieChart,
  Download,
  Filter,
} from "lucide-react";

const Estadisticas = () => {
  const [periodo, setPeriodo] = useState("mes"); // mes, semana, año
  const [cargando, setCargando] = useState(true);
  const [estadisticas, setEstadisticas] = useState(null);

  // Simulación de datos reales (en tu caso vendrían de tu API)
  useEffect(() => {
    const cargarEstadisticas = async () => {
      setCargando(true);
      
      // Simulamos delay de carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos de ejemplo basados en el período seleccionado
      const datosPorPeriodo = {
        semana: {
          ingresos: 1250000,
          reservasTotales: 48,
          clientesNuevos: 12,
          servicioMasPopular: "Corte Clásico",
          reservasPorBarbero: [
            { nombre: "Juan Pérez", reservas: 15 },
            { nombre: "María García", reservas: 12 },
            { nombre: "Carlos López", reservas: 11 },
            { nombre: "Ana Martínez", reservas: 10 },
          ],
          tendenciaReservas: [10, 15, 8, 12, 18, 22, 20],
          distribucionServicios: [
            { servicio: "Corte Clásico", cantidad: 25, color: "#007bff" },
            { servicio: "Corte + Barba", cantidad: 15, color: "#28a745" },
            { servicio: "Afeitado", cantidad: 5, color: "#ffc107" },
            { servicio: "Tinte", cantidad: 3, color: "#dc3545" },
          ],
          crecimiento: 15, // %
        },
        mes: {
          ingresos: 4850000,
          reservasTotales: 192,
          clientesNuevos: 45,
          servicioMasPopular: "Corte + Barba",
          reservasPorBarbero: [
            { nombre: "Juan Pérez", reservas: 58 },
            { nombre: "María García", reservas: 52 },
            { nombre: "Carlos López", reservas: 48 },
            { nombre: "Ana Martínez", reservas: 34 },
          ],
          tendenciaReservas: [42, 48, 38, 52, 45, 50, 55, 60, 52, 48],
          distribucionServicios: [
            { servicio: "Corte Clásico", cantidad: 85, color: "#007bff" },
            { servicio: "Corte + Barba", cantidad: 65, color: "#28a745" },
            { servicio: "Afeitado", cantidad: 25, color: "#ffc107" },
            { servicio: "Tinte", cantidad: 12, color: "#dc3545" },
            { servicio: "Mascarilla", cantidad: 5, color: "#6f42c1" },
          ],
          crecimiento: 8,
        },
        año: {
          ingresos: 58200000,
          reservasTotales: 2280,
          clientesNuevos: 540,
          servicioMasPopular: "Corte Clásico",
          reservasPorBarbero: [
            { nombre: "Juan Pérez", reservas: 680 },
            { nombre: "María García", reservas: 620 },
            { nombre: "Carlos López", reservas: 580 },
            { nombre: "Ana Martínez", reservas: 400 },
          ],
          tendenciaReservas: [180, 195, 210, 190, 200, 185, 175, 195, 210, 225, 240, 255],
          distribucionServicios: [
            { servicio: "Corte Clásico", cantidad: 1020, color: "#007bff" },
            { servicio: "Corte + Barba", cantidad: 780, color: "#28a745" },
            { servicio: "Afeitado", cantidad: 300, color: "#ffc107" },
            { servicio: "Tinte", cantidad: 144, color: "#dc3545" },
            { servicio: "Mascarilla", cantidad: 36, color: "#6f42c1" },
          ],
          crecimiento: 12,
        }
      };

      setEstadisticas(datosPorPeriodo[periodo]);
      setCargando(false);
    };

    cargarEstadisticas();
  }, [periodo]);

  // Métricas principales
  const metricasPrincipales = [
    {
      label: "Ingresos Totales",
      valor: estadisticas?.ingresos,
      formato: "currency",
      icon: <DollarSign size={20} />,
      color: "success",
      descripcion: `Período: ${periodo}`
    },
    {
      label: "Reservas Totales",
      valor: estadisticas?.reservasTotales,
      formato: "number",
      icon: <Calendar size={20} />,
      color: "primary",
      descripcion: "Citas completadas"
    },
    {
      label: "Clientes Nuevos",
      valor: estadisticas?.clientesNuevos,
      formato: "number",
      icon: <UserPlus size={20} />,
      color: "info",
      descripcion: "Nuevos registros"
    },
    {
      label: "Crecimiento",
      valor: estadisticas?.crecimiento,
      formato: "percent",
      icon: <TrendingUp size={20} />,
      color: estadisticas?.crecimiento >= 0 ? "success" : "danger",
      descripcion: "vs período anterior"
    }
  ];

  const formatearNumero = (valor, formato) => {
    if (!valor) return "0";
    
    switch (formato) {
      case "currency":
        return `$${valor.toLocaleString('es-CL')}`;
      case "percent":
        return `${valor > 0 ? '+' : ''}${valor}%`;
      default:
        return valor.toLocaleString('es-CL');
    }
  };

  const exportarReporte = () => {
    // Simulación de exportación
    alert(`Exportando reporte del ${periodo}...`);
  };

  if (cargando) {
    return (
      <>
        <UserHeader />
        <Container className="mt--7" fluid>
          <Row className="justify-content-center">
            <Col lg="8" className="text-center">
              <div className="d-flex align-items-center justify-content-center py-5">
                <BarChart3 size={32} className="mr-3 text-primary" />
                <h3 className="mb-0">Cargando estadísticas...</h3>
              </div>
            </Col>
          </Row>
        </Container>
      </>
    );
  }

  return (
    <>
      <UserHeader />
      <Container className="mt--7" fluid>
        {/* Encabezado */}
        <Row className="mb-5">
          <Col xl="12">
            <Card className="shadow-lg border-0 bg-gradient-primary text-white overflow-hidden">
              <CardBody className="p-5">
                <Row className="align-items-center">
                  <Col lg="8">
                    <div className="d-flex align-items-center mb-3">
                      <BarChart3 size={32} className="mr-3 text-warning" />
                      <h1 className="display-4 font-weight-bold mb-0">
                        Panel de Estadísticas
                      </h1>
                    </div>
                    <p className="lead mb-0 opacity-75">
                      Métricas y análisis de rendimiento en tiempo real
                    </p>
                  </Col>
                  <Col lg="4" className="text-lg-right">
                    <div className="bg-white-10 rounded-lg p-3 d-inline-block">
                      <Target size={40} className="text-warning" />
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Filtros */}
        <Row className="mb-4">
          <Col lg="12">
            <Card className="shadow-sm border-0">
              <CardBody className="p-3">
                <Row className="align-items-center">
                  <Col md="6">
                    <div className="d-flex align-items-center">
                      <Filter size={20} className="mr-2 text-muted" />
                      <h6 className="mb-0 mr-3">Filtrar por período:</h6>
                      <FormGroup className="mb-0">
                        <Input
                          type="select"
                          value={periodo}
                          onChange={(e) => setPeriodo(e.target.value)}
                          style={{ maxWidth: '150px' }}
                        >
                          <option value="semana">Última Semana</option>
                          <option value="mes">Este Mes</option>
                          <option value="año">Este Año</option>
                        </Input>
                      </FormGroup>
                    </div>
                  </Col>
                  <Col md="6" className="text-right">
                    <Button
                      color="primary"
                      className="rounded-pill"
                      onClick={exportarReporte}
                    >
                      <Download size={16} className="mr-2" />
                      Exportar Reporte
                    </Button>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Métricas Principales */}
        <Row className="mb-5">
          {metricasPrincipales.map((metrica, index) => (
            <Col xl="3" lg="6" className="mb-4" key={index}>
              <Card className="shadow-sm border-0 h-100 hover-lift">
                <CardBody className="p-4">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <h6 className="text-uppercase text-muted mb-1">
                        {metrica.label}
                      </h6>
                      <h2 className="font-weight-bold mb-1 text-dark">
                        {formatearNumero(metrica.valor, metrica.formato)}
                      </h2>
                      <small className="text-muted">{metrica.descripcion}</small>
                    </div>
                    <div className={`bg-${metrica.color}-light rounded-circle p-3`}>
                      {React.cloneElement(metrica.icon, { 
                        className: `text-${metrica.color}` 
                      })}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>

        <Row>
          {/* Servicio Más Popular */}
          <Col lg="4" className="mb-4">
            <Card className="shadow-sm border-0 h-100">
              <CardBody className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <Scissors size={20} className="mr-2 text-primary" />
                  <h5 className="mb-0 font-weight-bold">Servicio Más Popular</h5>
                </div>
                <div className="text-center py-4">
                  <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: '80px', height: '80px' }}>
                    <Target size={32} className="text-white" />
                  </div>
                  <h4 className="font-weight-bold text-dark">
                    {estadisticas?.servicioMasPopular}
                  </h4>
                  <p className="text-muted mb-0">
                    Más solicitado este {periodo}
                  </p>
                </div>
              </CardBody>
            </Card>
          </Col>

          {/* Distribución de Servicios */}
          <Col lg="4" className="mb-4">
            <Card className="shadow-sm border-0 h-100">
              <CardBody className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <PieChart size={20} className="mr-2 text-info" />
                  <h5 className="mb-0 font-weight-bold">Distribución de Servicios</h5>
                </div>
                <div className="py-3">
                  {estadisticas?.distribucionServicios.map((servicio, index) => (
                    <div key={index} className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center">
                        <div 
                          className="rounded-circle mr-3"
                          style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: servicio.color
                          }}
                        />
                        <span className="font-weight-medium">{servicio.servicio}</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="font-weight-bold mr-2">{servicio.cantidad}</span>
                        <Badge color="light" className="text-dark">
                          {((servicio.cantidad / estadisticas.reservasTotales) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Col>

          {/* Top Barberos */}
          <Col lg="4" className="mb-4">
            <Card className="shadow-sm border-0 h-100">
              <CardBody className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <Users size={20} className="mr-2 text-warning" />
                  <h5 className="mb-0 font-weight-bold">Top Clientes</h5>
                </div>
                <div className="py-3">
                  {estadisticas?.reservasPorBarbero.map((barbero, index) => (
                    <div key={index} className="d-flex align-items-center justify-content-between mb-3 p-3 bg-light rounded">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mr-3"
                          style={{ width: '40px', height: '40px', fontSize: '14px', fontWeight: 'bold' }}>
                          {index + 1}
                        </div>
                        <div>
                          <h6 className="mb-0 font-weight-bold">{barbero.nombre}</h6>
                          <small className="text-muted">{barbero.reservas} reservas</small>
                        </div>
                      </div>
                      <Badge color="primary" className="rounded-pill">
                        {((barbero.reservas / estadisticas.reservasTotales) * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Gráfico de Tendencia (Simulado) */}
        <Row className="mb-4">
          <Col lg="12">
            <Card className="shadow-sm border-0">
              <CardBody className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <TrendingUp size={20} className="mr-2 text-success" />
                  <h5 className="mb-0 font-weight-bold">Tendencia de Reservas</h5>
                </div>
                <div className="bg-light rounded p-4 text-center">
                  <div className="d-flex align-items-center justify-content-center mb-3">
                    <BarChart3 size={32} className="mr-2 text-muted" />
                    <h6 className="mb-0 text-muted">
                      Gráfico de tendencia se mostraría aquí
                    </h6>
                  </div>
                  <p className="text-muted mb-0">
                    {periodo === 'semana' && 'Evolución diaria de reservas'}
                    {periodo === 'mes' && 'Evolución semanal de reservas'}
                    {periodo === 'año' && 'Evolución mensual de reservas'}
                  </p>
                  <div className="mt-3">
                    <Badge color="light" className="text-dark mr-2">
                      Máximo: {Math.max(...estadisticas.tendenciaReservas)}
                    </Badge>
                    <Badge color="light" className="text-dark">
                      Mínimo: {Math.min(...estadisticas.tendenciaReservas)}
                    </Badge>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Resumen de Rendimiento */}
        <Row>
          <Col lg="12">
            <Card className="shadow-lg border-0 bg-gradient-dark text-white">
              <CardBody className="p-5">
                <Row className="align-items-center">
                  <Col lg="8">
                    <Clock size={32} className="mb-3 text-warning" />
                    <h3 className="font-weight-bold mb-2">
                      Resumen de Rendimiento
                    </h3>
                    <p className="lead opacity-75 mb-0">
                      {estadisticas.crecimiento > 0 ? 
                        `Crecimiento positivo del ${estadisticas.crecimiento}% respecto al período anterior` :
                        `Decrecimiento del ${Math.abs(estadisticas.crecimiento)}% respecto al período anterior`
                      }
                    </p>
                  </Col>
                  <Col lg="4" className="text-right">
                    <div className="bg-white-10 rounded-lg p-4 d-inline-block">
                      <div className="text-center">
                        <h2 className="font-weight-bold text-warning mb-0">
                          {estadisticas.crecimiento > 0 ? '📈' : '📉'}
                        </h2>
                        <small className="opacity-75">
                          {estadisticas.crecimiento > 0 ? 'Tendencia Positiva' : 'Tendencia Negativa'}
                        </small>
                      </div>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <style>
        {`
          .hover-lift {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          .hover-lift:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important;
          }
          .bg-white-10 {
            background-color: rgba(255,255,255,0.1);
          }
          .bg-white-20 {
            background-color: rgba(255,255,255,0.2);
          }
        `}
      </style>
    </>
  );
};

export default Estadisticas;
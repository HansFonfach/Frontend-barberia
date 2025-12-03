import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  Container,
  Row,
  Col,
  Badge,
  Spinner,
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
  Award,
  Star,
  CalendarDays,
  TrendingDown,
  Zap,
  Sparkles,
  ArrowRight,
  UserCheck,
  CalendarCheck,
  BarChart,
  ChartBar,
} from "lucide-react";

const Estadisticas = () => {
  const { user } = useAuth();
  const [periodo, setPeriodo] = useState("mes"); // semana, mes, año
  const [cargando, setCargando] = useState(true);
  const [estadisticas, setEstadisticas] = useState(null);
  const [resumenRapido, setResumenRapido] = useState(null);

  // Simulación de datos reales con más métricas útiles
  useEffect(() => {
    const cargarEstadisticas = async () => {
      setCargando(true);
      
      // Simulamos delay de carga
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Datos de ejemplo basados en el período seleccionado
      const datosPorPeriodo = {
        semana: {
          ingresos: 1250000,
          ingresosVsAnterior: 8, // % de crecimiento
          reservasTotales: 48,
          reservasCompletadas: 42,
          reservasCanceladas: 6,
          tasaOcupacion: 78, // %
          clientesNuevos: 12,
          clientesRecurrentes: 36,
          servicioMasPopular: { nombre: "Corte Clásico", cantidad: 25 },
          horaMasSolicitada: "16:00",
          barberoMasSolicitado: { nombre: "Juan Pérez", reservas: 15 },
          topClientes: [
            { nombre: "Hans Fonfach", reservas: 5, gasto: 185000 },
            { nombre: "Alejandro Robledo", reservas: 4, gasto: 152000 },
            { nombre: "Roberto Díaz", reservas: 4, gasto: 148000 },
            { nombre: "Juanita Huerfanita", reservas: 3, gasto: 115000 },
            { nombre: "Pedro Gómez", reservas: 3, gasto: 110000 },
          ],
          distribucionServicios: [
            { servicio: "Corte Clásico", cantidad: 25, precio: 15000, color: "#007bff" },
            { servicio: "Corte + Barba", cantidad: 15, precio: 22000, color: "#28a745" },
            { servicio: "Afeitado", cantidad: 5, precio: 12000, color: "#ffc107" },
            { servicio: "Tinte", cantidad: 3, precio: 25000, color: "#dc3545" },
          ],
          tendenciaDias: [
            { dia: "Lun", reservas: 10, ingresos: 250000 },
            { dia: "Mar", reservas: 15, ingresos: 375000 },
            { dia: "Mié", reservas: 8, ingresos: 200000 },
            { dia: "Jue", reservas: 12, ingresos: 300000 },
            { dia: "Vie", reservas: 18, ingresos: 450000 },
            { dia: "Sáb", reservas: 22, ingresos: 550000 },
            { dia: "Dom", reservas: 0, ingresos: 0 },
          ],
          crecimientoReservas: 15, // %
          tiempoPromedioServicio: "45 min",
          satisfaccionClientes: 4.8, // /5
        },
        mes: {
          ingresos: 4850000,
          ingresosVsAnterior: 12,
          reservasTotales: 192,
          reservasCompletadas: 175,
          reservasCanceladas: 17,
          tasaOcupacion: 82,
          clientesNuevos: 45,
          clientesRecurrentes: 147,
          servicioMasPopular: { nombre: "Corte + Barba", cantidad: 65 },
          horaMasSolicitada: "18:00",
          barberoMasSolicitado: { nombre: "María García", reservas: 52 },
          topClientes: [
            { nombre: "Hans Fonfach", reservas: 18, gasto: 685000 },
            { nombre: "Roberto Díaz", reservas: 15, gasto: 552000 },
            { nombre: "Ana Silva", reservas: 14, gasto: 528000 },
            { nombre: "Pedro Gómez", reservas: 12, gasto: 452000 },
            { nombre: "María López", reservas: 11, gasto: 415000 },
          ],
          distribucionServicios: [
            { servicio: "Corte Clásico", cantidad: 85, precio: 15000, color: "#007bff" },
            { servicio: "Corte + Barba", cantidad: 65, precio: 22000, color: "#28a745" },
            { servicio: "Afeitado", cantidad: 25, precio: 12000, color: "#ffc107" },
            { servicio: "Tinte", cantidad: 12, precio: 25000, color: "#dc3545" },
            { servicio: "Mascarilla", cantidad: 5, precio: 8000, color: "#6f42c1" },
          ],
          tendenciaSemanas: [
            { semana: "Sem 1", reservas: 42, ingresos: 1050000 },
            { semana: "Sem 2", reservas: 48, ingresos: 1200000 },
            { semana: "Sem 3", reservas: 38, ingresos: 950000 },
            { semana: "Sem 4", reservas: 52, ingresos: 1300000 },
            { semana: "Sem 5", reservas: 45, ingresos: 1125000 },
          ],
          crecimientoReservas: 8,
          tiempoPromedioServicio: "42 min",
          satisfaccionClientes: 4.7,
        },
        año: {
          ingresos: 58200000,
          ingresosVsAnterior: 18,
          reservasTotales: 2280,
          reservasCompletadas: 2100,
          reservasCanceladas: 180,
          tasaOcupacion: 85,
          clientesNuevos: 540,
          clientesRecurrentes: 1740,
          servicioMasPopular: { nombre: "Corte Clásico", cantidad: 1020 },
          horaMasSolicitada: "19:00",
          barberoMasSolicitado: { nombre: "Juan Pérez", reservas: 680 },
          topClientes: [
            { nombre: "Hans Fonfach", reservas: 85, gasto: 3125000 },
            { nombre: "Roberto Díaz", reservas: 72, gasto: 2650000 },
            { nombre: "Ana Silva", reservas: 68, gasto: 2510000 },
            { nombre: "Pedro Gómez", reservas: 62, gasto: 2280000 },
            { nombre: "María López", reservas: 58, gasto: 2150000 },
          ],
          distribucionServicios: [
            { servicio: "Corte Clásico", cantidad: 1020, precio: 15000, color: "#007bff" },
            { servicio: "Corte + Barba", cantidad: 780, precio: 22000, color: "#28a745" },
            { servicio: "Afeitado", cantidad: 300, precio: 12000, color: "#ffc107" },
            { servicio: "Tinte", cantidad: 144, precio: 25000, color: "#dc3545" },
            { servicio: "Mascarilla", cantidad: 36, precio: 8000, color: "#6f42c1" },
          ],
          tendenciaMeses: [
            { mes: "Ene", reservas: 180, ingresos: 4500000 },
            { mes: "Feb", reservas: 195, ingresos: 4875000 },
            { mes: "Mar", reservas: 210, ingresos: 5250000 },
            { mes: "Abr", reservas: 190, ingresos: 4750000 },
            { mes: "May", reservas: 200, ingresos: 5000000 },
            { mes: "Jun", reservas: 185, ingresos: 4625000 },
            { mes: "Jul", reservas: 175, ingresos: 4375000 },
            { mes: "Ago", reservas: 195, ingresos: 4875000 },
            { mes: "Sep", reservas: 210, ingresos: 5250000 },
            { mes: "Oct", reservas: 225, ingresos: 5625000 },
            { mes: "Nov", reservas: 240, ingresos: 6000000 },
            { mes: "Dic", reservas: 255, ingresos: 6375000 },
          ],
          crecimientoReservas: 12,
          tiempoPromedioServicio: "40 min",
          satisfaccionClientes: 4.9,
        }
      };

      setEstadisticas(datosPorPeriodo[periodo]);
      
      // Resumen rápido para cards principales
      setResumenRapido({
        ingresosFormateados: formatearMoneda(datosPorPeriodo[periodo].ingresos),
        reservasHoy: periodo === "semana" ? 8 : periodo === "mes" ? 192/30 : 2280/365,
        promedioTicket: datosPorPeriodo[periodo].ingresos / datosPorPeriodo[periodo].reservasTotales,
        tasaRetencion: (datosPorPeriodo[periodo].clientesRecurrentes / 
          (datosPorPeriodo[periodo].clientesRecurrentes + datosPorPeriodo[periodo].clientesNuevos) * 100).toFixed(1)
      });
      
      setCargando(false);
    };

    cargarEstadisticas();
  }, [periodo]);

  // Formateadores
  const formatearMoneda = (valor) => {
    return `$${valor.toLocaleString('es-CL')}`;
  };

  const formatearNumero = (valor) => {
    return valor.toLocaleString('es-CL');
  };

  // Métricas principales (Cards grandes como en tu dashboard)
  const metricasPrincipales = [
    {
      label: "Ingresos Totales",
      valor: estadisticas?.ingresos,
      formato: "currency",
      icon: <DollarSign size={22} className="text-success" />,
      color: "success",
      descripcion: `Crecimiento: ${estadisticas?.ingresosVsAnterior}% vs período anterior`,
      gradient: "linear-gradient(135deg, #00b09b 0%, #96c93d 100%)",
      badge: estadisticas?.ingresosVsAnterior > 0 ? (
        <Badge color="light" className="rounded-pill text-success">
          <TrendingUp size={12} className="mr-1" /> +{estadisticas?.ingresosVsAnterior}%
        </Badge>
      ) : (
        <Badge color="light" className="rounded-pill text-danger">
          <TrendingDown size={12} className="mr-1" /> {estadisticas?.ingresosVsAnterior}%
        </Badge>
      )
    },
    {
      label: "Reservas Totales",
      valor: estadisticas?.reservasTotales,
      formato: "number",
      icon: <CalendarCheck size={22} className="text-primary" />,
      color: "primary",
      descripcion: `${estadisticas?.reservasCompletadas} completadas • ${estadisticas?.reservasCanceladas} canceladas`,
      gradient: "linear-gradient(135deg, #007bff 0%, #6610f2 100%)",
      badge: <Badge color="light" className="rounded-pill text-primary">
        {estadisticas?.tasaOcupacion}% ocupación
      </Badge>
    },
    {
      label: "Clientes",
      valor: (estadisticas?.clientesNuevos || 0) + (estadisticas?.clientesRecurrentes || 0),
      formato: "number",
      icon: <Users size={22} className="text-info" />,
      color: "info",
      descripcion: `${estadisticas?.clientesNuevos} nuevos • ${estadisticas?.clientesRecurrentes} recurrentes`,
      gradient: "linear-gradient(135deg, #17a2b8 0%, #20c997 100%)",
      badge: <Badge color="light" className="rounded-pill text-info">
        {resumenRapido?.tasaRetencion}% retención
      </Badge>
    },
    {
      label: "Satisfacción",
      valor: estadisticas?.satisfaccionClientes,
      formato: "rating",
      icon: <Star size={22} className="text-warning" />,
      color: "warning",
      descripcion: "Calificación promedio de clientes",
      gradient: "linear-gradient(135deg, #ff9f00 0%, #ffcc00 100%)",
      badge: <Badge color="light" className="rounded-pill text-warning">
        {estadisticas?.satisfaccionClientes}/5.0
      </Badge>
    }
  ];

  // Cards de información rápida
  const cardsRapidas = [
    {
      title: "Servicio Más Popular",
      value: estadisticas?.servicioMasPopular?.nombre,
      subvalue: `${estadisticas?.servicioMasPopular?.cantidad} reservas`,
      icon: <Award size={20} />,
      color: "primary",
      gradient: "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
    },
    {
      title: "Hora Más Solicitada",
      value: estadisticas?.horaMasSolicitada,
      subvalue: "Horario peak",
      icon: <Clock size={20} />,
      color: "success",
      gradient: "linear-gradient(135deg, #28a745 0%, #1e7e34 100%)",
    },
    {
      title: "Tiempo Promedio",
      value: estadisticas?.tiempoPromedioServicio,
      subvalue: "Por servicio",
      icon: <Zap size={20} />,
      color: "warning",
      gradient: "linear-gradient(135deg, #ffc107 0%, #e0a800 100%)",
    },
    {
      title: "Barbero Top",
      value: estadisticas?.barberoMasSolicitado?.nombre,
      subvalue: `${estadisticas?.barberoMasSolicitado?.reservas} reservas`,
      icon: <UserCheck size={20} />,
      color: "info",
      gradient: "linear-gradient(135deg, #17a2b8 0%, #138496 100%)",
    },
  ];

  if (cargando) {
    return (
      <>
        <UserHeader />
        <Container className="mt--7" fluid>
          <Row className="justify-content-center py-5">
            <Col lg="8" className="text-center">
              <div className="d-flex align-items-center justify-content-center py-5">
                <Spinner color="primary" className="mr-3" />
                <div>
                  <h3 className="mb-0">Cargando estadísticas...</h3>
                  <p className="text-muted mt-2">Analizando los datos más recientes</p>
                </div>
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
        <Row className="mb-6">
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
                      Métricas en tiempo real • {periodo === "semana" ? "Última semana" : 
                        periodo === "mes" ? "Este mes" : "Este año"}
                    </p>
                  </Col>
                  <Col lg="4" className="text-lg-right">
                    <div className="bg-white-20 rounded-lg p-3 d-inline-block">
                      <Sparkles size={40} className="text-warning" />
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Filtros */}
        <Row className="mb-5">
          <Col xl="12">
            <Card className="shadow-sm border-0" style={{ borderRadius: "16px" }}>
              <CardBody className="p-4">
                <Row className="align-items-center">
                  <Col md="8">
                    <div className="d-flex align-items-center">
                      <Filter size={20} className="mr-3 text-primary" />
                      <h5 className="mb-0 mr-3 font-weight-bold text-dark">
                        Período de análisis:
                      </h5>
                      <div className="btn-group" role="group">
                        {["semana", "mes", "año"].map((p) => (
                          <Button
                            key={p}
                            color={periodo === p ? "primary" : "light"}
                            className={`rounded-pill mr-2 ${periodo === p ? 'shadow-sm' : ''}`}
                            onClick={() => setPeriodo(p)}
                          >
                            {p === "semana" && "Última semana"}
                            {p === "mes" && "Este mes"}
                            {p === "año" && "Este año"}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </Col>
                  <Col md="4" className="text-right">
                    <Button
                      color="primary"
                      className="rounded-pill shadow-sm"
                      onClick={() => alert(`Exportando reporte del ${periodo}...`)}
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

        {/* Métricas Principales (Estilo Dashboard) */}
        <Row className="mb-5">
          {metricasPrincipales.map((metrica, index) => (
            <Col xl="3" lg="6" className="mb-4" key={index}>
              <Card
                className="border-0 h-100 text-white shadow-lg"
                style={{
                  background: metrica.gradient,
                  borderRadius: "18px",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <CardBody className="p-4">
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div className="bg-white-20 rounded-circle p-3">
                      {metrica.icon}
                    </div>
                    {metrica.badge}
                  </div>

                  <h5 className="font-weight-bold mb-2 text-white">
                    {metrica.label}
                  </h5>
                  
                  <h2 className="font-weight-bold mb-1 text-white">
                    {metrica.formato === "currency" && formatearMoneda(metrica.valor)}
                    {metrica.formato === "number" && formatearNumero(metrica.valor)}
                    {metrica.formato === "rating" && (
                      <>
                        {metrica.valor.toFixed(1)}
                        <small className="opacity-75">/5.0</small>
                      </>
                    )}
                  </h2>
                  
                  <p className="opacity-85 mb-0">{metrica.descripcion}</p>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Cards de Información Rápida */}
        <Row className="mb-5">
          {cardsRapidas.map((card, index) => (
            <Col lg="3" md="6" className="mb-4" key={index}>
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
                        {card.title}
                      </h6>
                      <h4 className="font-weight-bold mb-1 text-dark">
                        {card.value}
                      </h4>
                      <small className="text-muted">{card.subvalue}</small>
                    </div>
                    <div className={`bg-${card.color}-light rounded-circle p-3`}>
                      {React.cloneElement(card.icon, { 
                        className: `text-${card.color}` 
                      })}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>

        <Row>
          {/* Top 5 Clientes */}
          <Col lg="6" className="mb-4">
            <Card className="shadow-sm border-0 h-100" style={{ borderRadius: "16px" }}>
              <CardBody className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <Award size={20} className="mr-3 text-warning" />
                  <h5 className="mb-0 font-weight-bold text-dark">Top 5 Clientes</h5>
                </div>
                
                <div className="py-2 ">
                  {estadisticas?.topClientes.map((cliente, index) => (
                    <div 
                      key={index} 
                      className="d-flex align-items-center justify-content-between mb-3 p-3 border  rounded-lg"
                      style={{ transition: "background-color 0.2s ease" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    >
                      <div className="d-flex align-items-center">
                        <div className={`rounded-circle d-flex align-items-center justify-content-center mr-3
                          ${index === 0 ? 'bg-warning text-white' : 
                            index === 1 ? 'bg-dark text-white' : 
                            index === 2 ? 'bg-danger text-white' : 'bg-info text-white'}`}
                          style={{ 
                            width: '40px', 
                            height: '40px', 
                            fontSize: '16px', 
                            fontWeight: 'bold',
                            border: index > 2 ? '2px solid #dee2e6' : 'none'
                          }}>
                          {index + 1}
                        </div>
                        <div>
                          <h6 className="mb-0 font-weight-bold">{cliente.nombre}</h6>
                          <small className="text-muted">
                            {cliente.reservas} reservas • {formatearMoneda(cliente.gasto)}
                          </small>
                        </div>
                      </div>
                      <Badge color="primary" className="rounded-pill px-3">
                        {((cliente.reservas / estadisticas.reservasTotales) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Col>

          {/* Distribución de Servicios */}
          <Col lg="6" className="mb-4">
            <Card className="shadow-sm border-0 h-100" style={{ borderRadius: "16px" }}>
              <CardBody className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <PieChart size={20} className="mr-3 text-info" />
                  <h5 className="mb-0 font-weight-bold text-dark">Distribución de Servicios</h5>
                </div>
                
                <div className="py-2">
                  {estadisticas?.distribucionServicios.map((servicio, index) => {
                    const porcentaje = (servicio.cantidad / estadisticas.reservasTotales) * 100;
                    const ingresosServicio = servicio.cantidad * servicio.precio;
                    
                    return (
                      <div key={index} className="mb-4">
                        <div className="d-flex align-items-center justify-content-between mb-2">
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
                          <div className="text-right">
                            <div className="font-weight-bold">{servicio.cantidad} reservas</div>
                            <small className="text-muted">{formatearMoneda(ingresosServicio)}</small>
                          </div>
                        </div>
                        
                        <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ 
                              width: `${porcentaje}%`,
                              backgroundColor: servicio.color,
                              borderRadius: '4px'
                            }}
                          />
                        </div>
                        
                        <div className="d-flex justify-content-between mt-1">
                          <small className="text-muted">{porcentaje.toFixed(1)}% del total</small>
                          <small className="text-muted">${servicio.precio.toLocaleString('es-CL')} c/u</small>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Resumen de Rendimiento */}
        <Row className="mb-4">
          <Col lg="12">
            <Card className="shadow-lg border-0 bg-gradient-dark text-white overflow-hidden">
              <CardBody className="p-5">
                <Row className="align-items-center">
                  <Col lg="8">
                    <TrendingUp size={32} className="mb-3 text-warning" />
                    <h3 className="font-weight-bold mb-2">
                      Resumen de Rendimiento
                    </h3>
                    <p className="lead opacity-75 mb-0">
                      {estadisticas.crecimientoReservas > 0 ? (
                        <>
                          <span className="text-success">📈 Crecimiento positivo del {estadisticas.crecimientoReservas}%</span> en reservas respecto al período anterior
                        </>
                      ) : (
                        <>
                          <span className="text-danger">📉 Decrecimiento del {Math.abs(estadisticas.crecimientoReservas)}%</span> en reservas respecto al período anterior
                        </>
                      )}
                    </p>
                    <div className="mt-3">
                      <Badge color="white" className="text-dark mr-2">
                        Tasa de ocupación: {estadisticas.tasaOcupacion}%
                      </Badge>
                      <Badge color="white" className="text-dark mr-2">
                        Satisfacción: {estadisticas.satisfaccionClientes}/5
                      </Badge>
                      <Badge color="white" className="text-dark">
                        Clientes recurrentes: {estadisticas.clientesRecurrentes}
                      </Badge>
                    </div>
                  </Col>
                  <Col lg="4" className="text-right">
                    <div className="bg-white-20 rounded-lg p-4 d-inline-block">
                      <div className="text-center">
                        <h1 className="display-4 font-weight-bold text-warning mb-0">
                          {estadisticas.crecimientoReservas > 0 ? '🚀' : '📊'}
                        </h1>
                        <small className="opacity-75">
                          {estadisticas.crecimientoReservas > 0 ? 'Tendencia excelente' : 'Área de oportunidad'}
                        </small>
                      </div>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Información adicional */}
        <Row>
          <Col lg="12">
            <Card className="shadow-sm border-0" style={{ borderRadius: "16px" }}>
              <CardBody className="p-4">
                <h6 className="text-uppercase text-muted mb-4">📈 Tendencias y Análisis</h6>
                <Row>
                  <Col md="4" className="text-center mb-3">
                    <div className="p-3 bg-light rounded-lg">
                      <h3 className="text-primary mb-1">
                        {estadisticas.reservasCompletadas}
                      </h3>
                      <small className="text-muted">Reservas completadas</small>
                    </div>
                  </Col>
                  <Col md="4" className="text-center mb-3">
                    <div className="p-3 bg-light rounded-lg">
                      <h3 className="text-success mb-1">
                        {((estadisticas.reservasCompletadas / estadisticas.reservasTotales) * 100).toFixed(1)}%
                      </h3>
                      <small className="text-muted">Tasa de éxito</small>
                    </div>
                  </Col>
                  <Col md="4" className="text-center mb-3">
                    <div className="p-3 bg-light rounded-lg">
                      <h3 className="text-info mb-1">
                        {Math.round(resumenRapido.promedioTicket).toLocaleString('es-CL')}
                      </h3>
                      <small className="text-muted">Ticket promedio</small>
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
          .hover-zoom {
            transition: transform 0.25s ease, box-shadow 0.25s ease;
          }
          .hover-zoom:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
          }
          .bg-white-10 {
            background-color: rgba(255,255,255,0.1);
          }
          .bg-white-20 {
            background-color: rgba(255,255,255,0.2);
          }
          .rounded-lg {
            border-radius: 12px !important;
          }
        `}
      </style>
    </>
  );
};

export default Estadisticas;
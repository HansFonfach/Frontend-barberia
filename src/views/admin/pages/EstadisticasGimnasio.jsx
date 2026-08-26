import React, { useEffect, useState } from "react";
import { Card, CardBody, Container, Row, Col, Input, Button, Badge } from "reactstrap";
import { Line, Bar, HorizontalBar } from "react-chartjs-2";
import UserHeader from "components/Headers/UserHeader";
import {
  DollarSign,
  Users,
  UserPlus,
  Calendar,
  CalendarClock,
  CheckCircle,
  XCircle,
  Percent,
  TrendingUp,
  TrendingDown,
  Trophy,
  AlertTriangle,
  Clock,
  CreditCard,
  Activity,
  BarChart3,
  Minus,
} from "lucide-react";
import { useEstadisticasGimnasio } from "context/EstadisticasGimnasioContext";

/* =========================================================================
   Panel de estadísticas del gimnasio: selector de período + comparación
   contra el tramo anterior, indicadores principales, análisis de clientes,
   demanda (días/horarios/clases) y evolución mensual con gráficos.

   Todos los números vienen de estadisticasGimnasioController.js, que a su
   vez reutiliza la misma lógica que ya usan "Clases del día", el catálogo
   público y el resto del sistema (nada de cálculos paralelos acá).
========================================================================= */

const PRESETS = [
  { value: "este_mes", label: "Este mes" },
  { value: "mes_anterior", label: "Mes anterior" },
  { value: "ultimos_3_meses", label: "Últimos 3 meses" },
  { value: "ultimos_6_meses", label: "Últimos 6 meses" },
  { value: "este_anio", label: "Este año" },
  { value: "anio_anterior", label: "Año anterior" },
  { value: "personalizado", label: "Rango personalizado" },
];

const DIAS_SEMANA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const formatMoney = (value) => {
  if (!value) return "$0";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatFecha = (fecha) => {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
};

const diasRestantes = (fecha) => {
  if (!fecha) return null;
  const ms = new Date(fecha).getTime() - Date.now();
  return Math.max(Math.ceil(ms / (1000 * 60 * 60 * 24)), 0);
};

const formatPct = (value) =>
  value === null || value === undefined ? "Sin datos previos" : `${value > 0 ? "+" : ""}${value}%`;

const colorVariacion = (value) =>
  value === null || value === undefined ? "secondary" : value > 0 ? "success" : value < 0 ? "danger" : "secondary";

const IconoVariacion = ({ value }) => {
  if (value === null || value === undefined || value === 0) return <Minus size={14} />;
  return value > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />;
};

const COLORES = {
  primary: "#5e72e4",
  success: "#2dce89",
  info: "#11cdef",
  warning: "#fb6340",
  danger: "#f5365c",
};

const opcionesChartBase = {
  maintainAspectRatio: false,
  legend: { display: false },
  scales: {
    yAxes: [{ ticks: { beginAtZero: true } }],
  },
};

const EstadisticasGimnasio = () => {
  const { resumenPeriodoGimnasio, clientesAnalisisGimnasio, demandaGimnasio, evolucionGimnasio } =
    useEstadisticasGimnasio();

  const [periodo, setPeriodo] = useState("este_mes");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [filtroAplicado, setFiltroAplicado] = useState({ periodo: "este_mes" });

  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState(null);
  const [clientesInfo, setClientesInfo] = useState(null);
  const [demanda, setDemanda] = useState(null);
  const [evolucion, setEvolucion] = useState({ evolucion: [] });

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      const opciones =
        filtroAplicado.periodo === "personalizado"
          ? { periodo: "personalizado", desde: filtroAplicado.desde, hasta: filtroAplicado.hasta }
          : { periodo: filtroAplicado.periodo };

      const [r, c, d, e] = await Promise.all([
        resumenPeriodoGimnasio(opciones),
        clientesAnalisisGimnasio(opciones),
        demandaGimnasio(opciones),
        evolucionGimnasio(6),
      ]);

      setResumen(r);
      setClientesInfo(c);
      setDemanda(d);
      setEvolucion(e);
      setLoading(false);
    };

    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroAplicado]);

  const handlePeriodoChange = (e) => {
    const value = e.target.value;
    setPeriodo(value);
    if (value !== "personalizado") {
      setFiltroAplicado({ periodo: value });
    }
  };

  const handleAplicarPersonalizado = () => {
    if (!desde || !hasta) return;
    setFiltroAplicado({ periodo: "personalizado", desde, hasta });
  };

  const StatCard = ({ title, value, icon, variant = "default", delta }) => {
    const styles = (() => {
      switch (variant) {
        case "primary":
          return { bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", text: "white", iconBg: "rgba(255,255,255,0.2)" };
        case "success":
          return { bg: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)", text: "#1a4731", iconBg: "rgba(255,255,255,0.3)" };
        case "warning":
          return { bg: "linear-gradient(135deg, #fad961 0%, #f76b1c 100%)", text: "#5f370e", iconBg: "rgba(255,255,255,0.3)" };
        default:
          return { bg: "white", text: "#2d3748", iconBg: "#f1f3f5" };
      }
    })();

    return (
      <Card className="stat-card border-0 h-100" style={{ background: styles.bg, borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <CardBody className="d-flex justify-content-between align-items-center p-3 p-md-4">
          <div>
            <p className="mb-1" style={{ color: variant === "default" ? "#6c757d" : "rgba(255,255,255,0.8)", fontSize: "0.8rem", fontWeight: 500 }}>
              {title}
            </p>
            <h4 className="mb-1" style={{ color: styles.text, fontWeight: 700, fontSize: "clamp(1.1rem, 4vw, 1.4rem)" }}>
              {value === null || value === undefined ? <span className="text-muted">...</span> : value}
            </h4>
            {delta !== undefined && (
              <Badge color={colorVariacion(delta)} pill className="d-inline-flex align-items-center" style={{ gap: 4, fontSize: "0.7rem" }}>
                <IconoVariacion value={delta} /> {formatPct(delta)}
              </Badge>
            )}
          </div>
          <div className="stat-icon" style={{ background: styles.iconBg, padding: 12, borderRadius: 12, color: variant === "default" ? styles.text : "white" }}>
            {icon}
          </div>
        </CardBody>
      </Card>
    );
  };

  const ListaClientes = ({ titulo, icono, datos, renderBadge, colorBadge = "success", vacio = "Sin datos en este período" }) => (
    <Card className="shadow-sm border-0 h-100" style={{ borderRadius: 16 }}>
      <CardBody className="p-3 p-md-4">
        <div className="d-flex align-items-center mb-3">
          <div className="mr-2" style={{ color: `var(--${colorBadge})` }}>{icono}</div>
          <h5 className="mb-0 fw-bold" style={{ fontSize: "1rem" }}>{titulo}</h5>
        </div>

        {(!datos || datos.length === 0) && (
          <div className="text-center text-muted py-4" style={{ fontSize: "0.85rem" }}>{vacio}</div>
        )}

        {datos && datos.map((item, idx) => (
          <div
            key={item.clienteId || item._id || idx}
            className="d-flex justify-content-between align-items-center mb-2 p-2"
            style={{ background: "#f8fafc", borderRadius: 10 }}
          >
            <div style={{ maxWidth: "65%" }}>
              <strong style={{ fontSize: "0.85rem", display: "block" }}>
                {item.nombre || "—"} {item.apellido || ""}
              </strong>
              <span className="text-muted" style={{ fontSize: "0.72rem", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.email || ""}
              </span>
            </div>
            <Badge color={colorBadge} pill style={{ fontSize: "0.7rem" }}>
              {renderBadge(item)}
            </Badge>
          </div>
        ))}
      </CardBody>
    </Card>
  );

  const diasSemanaData = resumen?.asistencias?.promedioPorDia || [];
  const chartDiasSemana = {
    labels: diasSemanaData.map((d) => DIAS_SEMANA[d.dia]),
    datasets: [
      {
        label: "Asistencias",
        data: diasSemanaData.map((d) => d.totalAsistencias),
        backgroundColor: COLORES.primary,
        borderRadius: 6,
      },
    ],
  };

  const evolucionData = evolucion?.evolucion || [];
  const chartIngresos = {
    labels: evolucionData.map((e) => e.etiqueta),
    datasets: [
      {
        label: "Ingresos",
        data: evolucionData.map((e) => e.ingresos),
        borderColor: COLORES.primary,
        backgroundColor: "rgba(94,114,228,0.1)",
        fill: true,
        tension: 0.3,
        pointBackgroundColor: COLORES.primary,
      },
    ],
  };
  const chartAsistencias = {
    labels: evolucionData.map((e) => e.etiqueta),
    datasets: [
      {
        label: "Asistencias",
        data: evolucionData.map((e) => e.asistencias),
        backgroundColor: COLORES.success,
        borderRadius: 6,
      },
    ],
  };
  const chartMembresias = {
    labels: evolucionData.map((e) => e.etiqueta),
    datasets: [
      {
        label: "Membresías activas",
        data: evolucionData.map((e) => e.membresiasActivas),
        borderColor: COLORES.info,
        backgroundColor: "rgba(17,205,239,0.1)",
        fill: true,
        tension: 0.3,
        pointBackgroundColor: COLORES.info,
      },
    ],
  };
  const chartClientes = {
    labels: evolucionData.map((e) => e.etiqueta),
    datasets: [
      {
        label: "Clientes activos",
        data: evolucionData.map((e) => e.clientesActivos),
        borderColor: COLORES.warning,
        backgroundColor: "rgba(251,99,64,0.1)",
        fill: true,
        tension: 0.3,
        pointBackgroundColor: COLORES.warning,
      },
    ],
  };

  const clasesOcupacion = demanda?.clasesTop || [];
  const chartOcupacion = {
    labels: clasesOcupacion.map((c) => c.nombre),
    datasets: [
      {
        label: "% Ocupación",
        data: clasesOcupacion.map((c) => c.ocupacionPorcentaje),
        backgroundColor: COLORES.primary,
        borderRadius: 6,
      },
    ],
  };

  return (
    <>
      <UserHeader />
      <Container fluid className="mt--7 pb-5 dashboard-bg px-3 px-md-4">
        <Row className="mb-4">
          <Col xs="12">
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-3" style={{ gap: 12 }}>
              <div>
                <div className="d-flex align-items-center mb-1">
                  <BarChart3 size={24} className="text-primary mr-2" />
                  <h3 className="mb-0 fw-bold">Panel de Estadísticas</h3>
                </div>
                <p className="text-muted mb-0">Rendimiento real del gimnasio por período</p>
              </div>

              <div className="d-flex flex-wrap align-items-center" style={{ gap: 8 }}>
                <Input type="select" value={periodo} onChange={handlePeriodoChange} style={{ minWidth: 190 }}>
                  {PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </Input>
                {periodo === "personalizado" && (
                  <>
                    <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} style={{ maxWidth: 160 }} />
                    <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} style={{ maxWidth: 160 }} />
                    <Button color="primary" size="sm" onClick={handleAplicarPersonalizado}>Aplicar</Button>
                  </>
                )}
              </div>
            </div>
          </Col>
        </Row>

        {/* ===== BANNER DE COMPARACIÓN ===== */}
        {resumen?.periodo && (
          <Row className="mb-4">
            <Col xs="12">
              <Card className="border-0" style={{ borderRadius: 16, background: "linear-gradient(135deg, #1a1f36 0%, #2d3559 100%)" }}>
                <CardBody className="p-3 p-md-4">
                  <div className="d-flex flex-wrap align-items-center justify-content-between" style={{ gap: 16 }}>
                    <div className="text-white">
                      <strong>{resumen.periodo.etiqueta}</strong>
                      <span className="text-white-50"> vs {resumen.periodo.etiquetaComparacion}</span>
                    </div>
                    <div className="d-flex flex-wrap" style={{ gap: 10 }}>
                      <Badge color={colorVariacion(resumen.ingresos.variacionPorcentaje)} pill>
                        {formatPct(resumen.ingresos.variacionPorcentaje)} ingresos
                      </Badge>
                      <Badge color={colorVariacion(resumen.asistencias.variacionPorcentaje)} pill>
                        {formatPct(resumen.asistencias.variacionPorcentaje)} asistencias
                      </Badge>
                      <Badge color={colorVariacion(resumen.membresias.variacionActivas)} pill>
                        {formatPct(resumen.membresias.variacionActivas)} membresías
                      </Badge>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}

        {/* ===== KPIs PRINCIPALES ===== */}
        <Row className="g-3 g-md-4 mb-3">
          <Col xs="12" sm="6" xl="3" className="mb-3 mb-md-4">
            <StatCard title="Ingresos del período" value={resumen && formatMoney(resumen.ingresos.total)} icon={<DollarSign size={20} />} variant="primary" delta={resumen?.ingresos.variacionPorcentaje} />
          </Col>
          <Col xs="12" sm="6" xl="3" className="mb-3 mb-md-4">
            <StatCard title="Asistencias totales" value={resumen?.asistencias.total} icon={<Activity size={20} />} variant="success" delta={resumen?.asistencias.variacionPorcentaje} />
          </Col>
          <Col xs="12" sm="6" xl="3" className="mb-3 mb-md-4">
            <StatCard title="Clientes activos" value={resumen?.clientes.activos} icon={<Users size={20} />} delta={resumen?.clientes.variacionActivos} />
          </Col>
          <Col xs="12" sm="6" xl="3" className="mb-3 mb-md-4">
            <StatCard title="Membresías activas" value={resumen?.membresias.activas} icon={<CreditCard size={20} />} delta={resumen?.membresias.variacionActivas} />
          </Col>
        </Row>

        <Row className="g-3 g-md-4 mb-3">
          <Col xs="12" sm="6" xl="3" className="mb-3 mb-md-4">
            <StatCard title="Clases realizadas" value={resumen?.clases.realizadas} icon={<CheckCircle size={20} />} />
          </Col>
          <Col xs="12" sm="6" xl="3" className="mb-3 mb-md-4">
            <StatCard title="Clases programadas" value={resumen?.clases.programadas} icon={<Calendar size={20} />} />
          </Col>
          <Col xs="12" sm="6" xl="3" className="mb-3 mb-md-4">
            <StatCard title="Clases canceladas" value={resumen?.clases.canceladas} icon={<XCircle size={20} />} variant="warning" delta={resumen?.clases.variacionCanceladas} />
          </Col>
          <Col xs="12" sm="6" xl="3" className="mb-3 mb-md-4">
            <StatCard title="Tasa de ocupación" value={resumen && `${resumen.asistencias.tasaOcupacion}%`} icon={<Percent size={20} />} />
          </Col>
        </Row>

        <Row className="g-3 g-md-4 mb-4">
          <Col xs="12" sm="6" xl="3" className="mb-3 mb-md-4">
            <StatCard title="Promedio asistentes/clase" value={resumen?.asistencias.promedioPorClase} icon={<TrendingUp size={20} />} />
          </Col>
          <Col xs="12" sm="6" xl="3" className="mb-3 mb-md-4">
            <StatCard title="Clientes nuevos" value={resumen?.clientes.nuevos} icon={<UserPlus size={20} />} delta={resumen?.clientes.variacionNuevos} />
          </Col>
          <Col xs="12" sm="6" xl="3" className="mb-3 mb-md-4">
            <StatCard title="Nuevas membresías" value={resumen?.membresias.nuevas} icon={<CreditCard size={20} />} delta={resumen?.membresias.variacionNuevas} />
          </Col>
          <Col xs="12" sm="6" xl="3" className="mb-3 mb-md-4">
            <StatCard title="Membresías por vencer" value={resumen?.membresias.porVencer} icon={<CalendarClock size={20} />} variant="warning" />
          </Col>
        </Row>

        {/* ===== GRÁFICOS ===== */}
        <Row className="g-3 g-md-4 mb-4">
          <Col lg="6" className="mb-3 mb-md-4">
            <Card className="shadow-sm border-0" style={{ borderRadius: 16 }}>
              <CardBody>
                <h6 className="fw-bold mb-3">Ingresos por mes</h6>
                <div style={{ height: 220 }}>
                  <Line data={chartIngresos} options={opcionesChartBase} />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col lg="6" className="mb-3 mb-md-4">
            <Card className="shadow-sm border-0" style={{ borderRadius: 16 }}>
              <CardBody>
                <h6 className="fw-bold mb-3">Asistencias por mes</h6>
                <div style={{ height: 220 }}>
                  <Bar data={chartAsistencias} options={opcionesChartBase} />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col lg="6" className="mb-3 mb-md-4">
            <Card className="shadow-sm border-0" style={{ borderRadius: 16 }}>
              <CardBody>
                <h6 className="fw-bold mb-3">Membresías activas por mes</h6>
                <div style={{ height: 220 }}>
                  <Line data={chartMembresias} options={opcionesChartBase} />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col lg="6" className="mb-3 mb-md-4">
            <Card className="shadow-sm border-0" style={{ borderRadius: 16 }}>
              <CardBody>
                <h6 className="fw-bold mb-3">Evolución de clientes activos</h6>
                <div style={{ height: 220 }}>
                  <Line data={chartClientes} options={opcionesChartBase} />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col lg="6" className="mb-3 mb-md-4">
            <Card className="shadow-sm border-0" style={{ borderRadius: 16 }}>
              <CardBody>
                <h6 className="fw-bold mb-3">Asistencia por día de la semana</h6>
                <div style={{ height: 220 }}>
                  <Bar data={chartDiasSemana} options={opcionesChartBase} />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col lg="6" className="mb-3 mb-md-4">
            <Card className="shadow-sm border-0" style={{ borderRadius: 16 }}>
              <CardBody>
                <h6 className="fw-bold mb-3">Ocupación por clase</h6>
                <div style={{ height: 220 }}>
                  {clasesOcupacion.length > 0 ? (
                    <HorizontalBar
                      data={chartOcupacion}
                      options={{
                        maintainAspectRatio: false,
                        legend: { display: false },
                        scales: { xAxes: [{ ticks: { beginAtZero: true, max: 100 } }] },
                      }}
                    />
                  ) : (
                    <div className="text-center text-muted py-5">Sin clases realizadas en este período</div>
                  )}
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* ===== ANÁLISIS DE CLIENTES ===== */}
        <Row className="g-3 g-md-4 mb-3">
          <Col lg="4" className="mb-3 mb-md-4">
            <ListaClientes
              titulo="Top 5 clientes con mayor asistencia"
              icono={<Trophy size={20} className="text-warning" />}
              datos={clientesInfo?.topAsistentes}
              colorBadge="success"
              renderBadge={(item) => `${item.totalAsistencias} asist.`}
            />
          </Col>
          <Col lg="4" className="mb-3 mb-md-4">
            <ListaClientes
              titulo="Clientes que bajaron su asistencia"
              icono={<TrendingDown size={20} className="text-danger" />}
              datos={clientesInfo?.clientesEnCaida}
              colorBadge="danger"
              renderBadge={(item) => `${item.cambioPorcentaje}%`}
              vacio="Nadie bajó su asistencia de forma notoria"
            />
          </Col>
          <Col lg="4" className="mb-3 mb-md-4">
            <ListaClientes
              titulo="Clientes en riesgo de abandono"
              icono={<AlertTriangle size={20} className="text-danger" />}
              datos={clientesInfo?.clientesEnRiesgo}
              colorBadge="warning"
              renderBadge={(item) => `Vence ${formatFecha(item.membresiaVenceEl)}`}
              vacio="Sin membresías activas sin asistencia reciente"
            />
          </Col>
        </Row>

        <Row className="g-3 g-md-4 mb-4">
          <Col lg="4" className="mb-3 mb-md-4">
            <ListaClientes
              titulo="Próximos a vencer (7 días)"
              icono={<Clock size={20} className="text-warning" />}
              datos={clientesInfo?.clientesPorVencer}
              colorBadge="warning"
              renderBadge={(item) => `${diasRestantes(item.fechaFin)} días`}
              vacio="Nadie vence en los próximos 7 días"
            />
          </Col>
          <Col lg="4" className="mb-3 mb-md-4">
            <ListaClientes
              titulo="Clientes nuevos del período"
              icono={<UserPlus size={20} className="text-primary" />}
              datos={clientesInfo?.clientesNuevos}
              colorBadge="primary"
              renderBadge={(item) => formatFecha(item.createdAt)}
              vacio="Sin clientes nuevos en este período"
            />
          </Col>
          <Col lg="4" className="mb-3 mb-md-4">
            <Card className="shadow-sm border-0 h-100" style={{ borderRadius: 16 }}>
              <CardBody className="p-3 p-md-4 d-flex flex-column justify-content-center align-items-center text-center">
                <Trophy size={28} className="text-primary mb-2" />
                <h5 className="fw-bold mb-1">Retención de clientes</h5>
                {clientesInfo?.retencion ? (
                  <>
                    <h2 className="fw-bold mb-0">{clientesInfo.retencion.porcentaje}%</h2>
                    <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
                      de {clientesInfo.retencion.baseClientes} clientes del período anterior volvió a asistir
                    </p>
                  </>
                ) : (
                  <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
                    Aún no hay datos suficientes en el período anterior para calcular una retención confiable
                  </p>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* ===== DEMANDA: HORARIOS Y CLASES ===== */}
        <Row className="g-3 g-md-4">
          <Col lg="6" className="mb-3 mb-md-4">
            <Card className="shadow-sm border-0" style={{ borderRadius: 16 }}>
              <CardBody className="p-3 p-md-4">
                <h6 className="fw-bold mb-3">Horarios con mayor demanda</h6>
                {(!demanda?.horariosTop || demanda.horariosTop.length === 0) && (
                  <div className="text-center text-muted py-3" style={{ fontSize: "0.85rem" }}>Sin sesiones realizadas en este período</div>
                )}
                {demanda?.horariosTop?.map((h, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center mb-2 p-2" style={{ background: "#f8fafc", borderRadius: 10 }}>
                    <span style={{ fontSize: "0.85rem" }}>{h.hora} hrs</span>
                    <Badge color="success" pill>{h.asistencias} asist. · prom. {h.promedio}</Badge>
                  </div>
                ))}
              </CardBody>
            </Card>
          </Col>
          <Col lg="6" className="mb-3 mb-md-4">
            <Card className="shadow-sm border-0" style={{ borderRadius: 16 }}>
              <CardBody className="p-3 p-md-4">
                <h6 className="fw-bold mb-3">Horarios con menor demanda</h6>
                {(!demanda?.horariosBajos || demanda.horariosBajos.length === 0) && (
                  <div className="text-center text-muted py-3" style={{ fontSize: "0.85rem" }}>Sin sesiones realizadas en este período</div>
                )}
                {demanda?.horariosBajos?.map((h, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center mb-2 p-2" style={{ background: "#f8fafc", borderRadius: 10 }}>
                    <span style={{ fontSize: "0.85rem" }}>{h.hora} hrs</span>
                    <Badge color="secondary" pill>{h.asistencias} asist. · prom. {h.promedio}</Badge>
                  </div>
                ))}
              </CardBody>
            </Card>
          </Col>
          <Col lg="6" className="mb-3 mb-md-4">
            <Card className="shadow-sm border-0" style={{ borderRadius: 16 }}>
              <CardBody className="p-3 p-md-4">
                <h6 className="fw-bold mb-3">Clases con mayor demanda</h6>
                {(!demanda?.clasesTop || demanda.clasesTop.length === 0) && (
                  <div className="text-center text-muted py-3" style={{ fontSize: "0.85rem" }}>Sin clases realizadas en este período</div>
                )}
                {demanda?.clasesTop?.map((c, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center mb-2 p-2" style={{ background: "#f8fafc", borderRadius: 10 }}>
                    <span style={{ fontSize: "0.85rem" }}>{c.nombre}</span>
                    <Badge color="success" pill>{c.asistencias} asist. · {c.ocupacionPorcentaje}% ocup.</Badge>
                  </div>
                ))}
              </CardBody>
            </Card>
          </Col>
          <Col lg="6" className="mb-3 mb-md-4">
            <Card className="shadow-sm border-0" style={{ borderRadius: 16 }}>
              <CardBody className="p-3 p-md-4">
                <h6 className="fw-bold mb-3">Clases con menor demanda</h6>
                {(!demanda?.clasesBajas || demanda.clasesBajas.length === 0) && (
                  <div className="text-center text-muted py-3" style={{ fontSize: "0.85rem" }}>Sin clases realizadas en este período</div>
                )}
                {demanda?.clasesBajas?.map((c, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center mb-2 p-2" style={{ background: "#f8fafc", borderRadius: 10 }}>
                    <span style={{ fontSize: "0.85rem" }}>{c.nombre}</span>
                    <Badge color="secondary" pill>{c.asistencias} asist. · {c.ocupacionPorcentaje}% ocup.</Badge>
                  </div>
                ))}
              </CardBody>
            </Card>
          </Col>
        </Row>

        {loading && (
          <div className="text-center text-muted py-4">Cargando estadísticas...</div>
        )}
      </Container>

      <style jsx>{`
        .dashboard-bg {
          background: #f7f9fc;
          min-height: 100vh;
        }
        .stat-card {
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </>
  );
};

export default EstadisticasGimnasio;

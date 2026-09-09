// src/views/admin/pages/EstadisticasServicios.jsx
//
// Página independiente de estadísticas y reportes ENFOCADA EN SERVICIOS
// (no en profesionales — para eso está PanelEquipo.jsx). Responde qué
// servicios conviene mantener, promocionar, subir de precio o sacar del
// catálogo: ingreso/volumen líder y rezagado, tendencia vs el periodo
// anterior, evolución mensual, ticket promedio, rentabilidad por hora de
// silla ocupada y — si quien mira es admin — quién genera cuánto en cada
// servicio.
//
// La ven TANTO un profesional individual (ve solo lo suyo) COMO un admin
// de una clínica con varios profesionales (ve todo, o filtra a uno
// puntual) — mismo criterio esAdmin/filtroBarbero que el resto del panel.
//
// Mismo lenguaje visual que PanelEquipo.jsx (tarjetas blancas redondeadas,
// acento #4361ee) más un gráfico de evolución mensual (Chart.js, que ya
// está en el proyecto) usando la paleta categórica validada para daltonismo.
import React, { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import { Container, Row, Col, Input, Button, Badge } from "reactstrap";

import UserHeader from "components/Headers/UserHeader";
import { useAuth } from "context/AuthContext";
import { getEstadisticasServicios } from "api/estadisticas";
import { getServicios } from "api/servicios";
import { getBarberosDeEmpresa } from "api/usuarios";

const fmtCLP = (n) => `$${Math.round(n || 0).toLocaleString("es-CL")}`;

const fmtCLPCorto = (n) => {
  const v = Math.round(n || 0);
  if (Math.abs(v) >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (Math.abs(v) >= 1000) return `$${Math.round(v / 1000)}k`;
  return `$${v}`;
};

const aYYYYMMDD = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const primerDiaMes = () => {
  const d = new Date();
  d.setDate(1);
  return aYYYYMMDD(d);
};

const primerDiaMesPasado = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1, 1);
  return aYYYYMMDD(d);
};

const ultimoDiaMesPasado = () => {
  const d = new Date();
  d.setDate(0);
  return aYYYYMMDD(d);
};

const lunesDeEstaSemana = () => {
  const d = new Date();
  const dia = d.getDay();
  const diff = dia === 0 ? -6 : 1 - dia;
  d.setDate(d.getDate() + diff);
  return aYYYYMMDD(d);
};

const PRESETS = [
  { key: "hoy", label: "Hoy", desde: () => aYYYYMMDD(new Date()), hasta: () => aYYYYMMDD(new Date()) },
  { key: "semana", label: "Esta semana", desde: lunesDeEstaSemana, hasta: () => aYYYYMMDD(new Date()) },
  { key: "mes", label: "Este mes", desde: primerDiaMes, hasta: () => aYYYYMMDD(new Date()) },
  { key: "mesPasado", label: "Mes pasado", desde: primerDiaMesPasado, hasta: ultimoDiaMesPasado },
];

// Paleta categórica (validada para daltonismo — orden fijo, nunca se
// reasigna por ranking): se usa solo en el gráfico de evolución, donde
// cada línea SÍ necesita identidad propia. En la lista comparativa se usa
// el degradado de acento de siempre (ahí el trabajo es "comparar
// magnitud", no "distinguir series").
const PALETA_CATEGORICA = [
  "#2a78d6", // azul
  "#eb6834", // naranjo
  "#1baf7a", // aqua
  "#eda100", // amarillo
  "#e87ba4", // magenta
];

const S = {
  page: { padding: "1.5rem 0" },
  card: {
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #e9ecef",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  cardHeader: {
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid #f0f0f0",
    background: "#fff",
  },
  title: { fontSize: 18, fontWeight: 700, color: "#1a1a2e", margin: 0 },
  subtitle: { fontSize: 12.5, color: "#8898aa", margin: "4px 0 0" },
  statCard: {
    background: "#fff",
    border: "1px solid #e9ecef",
    borderRadius: 14,
    padding: "1rem 1.25rem",
    height: "100%",
  },
  statLabel: {
    fontSize: 11.5,
    color: "#8898aa",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    fontWeight: 700,
  },
  statValue: { fontSize: 20, fontWeight: 700, color: "#1a1a2e" },
  statSub: { fontSize: 11.5, color: "#8898aa", marginTop: 2 },
};

const TENDENCIA_UI = {
  subiendo: { label: "Subiendo", color: "#0ca30c", bg: "#E6F7E6" },
  bajando: { label: "Bajando", color: "#d03b3b", bg: "#FDECEC" },
  nuevo: { label: "Nuevo", color: "#4361ee", bg: "#EEF1FE" },
  sin_actividad: { label: "Sin actividad", color: "#8898aa", bg: "#f0f1f7" },
  estable: { label: "Estable", color: "#8898aa", bg: "#f0f1f7" },
};

const BadgeTendencia = ({ tendencia }) => {
  const cfg = TENDENCIA_UI[tendencia] || TENDENCIA_UI.estable;
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: cfg.color,
        background: cfg.bg,
        borderRadius: 99,
        padding: "2px 8px",
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
};

const ServicioIcono = ({ nombre, size = 46 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      overflow: "hidden",
      flexShrink: 0,
      background: "linear-gradient(135deg,#4361ee,#7209b7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <span style={{ color: "#fff", fontWeight: 700, fontSize: size * 0.4 }}>
      {(nombre?.[0] || "?").toUpperCase()}
    </span>
  </div>
);

const StatCard = ({ label, value, sub, colorValue }) => (
  <div style={S.statCard}>
    <div style={S.statLabel}>{label}</div>
    <div style={{ ...S.statValue, color: colorValue || "#1a1a2e" }}>{value}</div>
    {sub && <div style={S.statSub}>{sub}</div>}
  </div>
);

const EstadisticasServicios = () => {
  const { user } = useAuth();
  const esAdmin = user?.esAdmin === true;

  const [desde, setDesde] = useState(primerDiaMes());
  const [hasta, setHasta] = useState(aYYYYMMDD(new Date()));
  const [presetActivo, setPresetActivo] = useState("mes");
  const [servicioId, setServicioId] = useState("");
  const [profesionalId, setProfesionalId] = useState("");

  const [servicios, setServicios] = useState([]);
  const [profesionales, setProfesionales] = useState([]);

  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getServicios()
      .then((res) => setServicios(res.data || []))
      .catch((err) => console.error("Error al obtener servicios:", err));

    if (esAdmin) {
      getBarberosDeEmpresa()
        .then((res) => setProfesionales(res.data || []))
        .catch((err) => console.error("Error al obtener el equipo:", err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esAdmin]);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    getEstadisticasServicios(desde, hasta, servicioId || undefined, profesionalId || undefined)
      .then((res) => {
        if (!cancelado) setDatos(res.data?.data || null);
      })
      .catch((err) => {
        console.error("Error al obtener estadísticas de servicios:", err);
        if (!cancelado) {
          setError(
            err?.response?.data?.message ||
              "No se pudieron cargar las estadísticas de servicios",
          );
        }
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [desde, hasta, servicioId, profesionalId]);

  const aplicarPreset = (preset) => {
    setPresetActivo(preset.key);
    setDesde(preset.desde());
    setHasta(preset.hasta());
  };

  const lista = datos?.servicios || [];
  const resumen = datos?.resumen || {};
  const porProfesional = datos?.porProfesional || [];

  const maxIngreso = useMemo(() => Math.max(1, ...lista.map((s) => s.ingreso)), [lista]);

  const chartEvolucion = useMemo(() => {
    const puntos = datos?.evolucionMensual || [];
    const series = datos?.seriesEvolucion || [];
    return {
      labels: puntos.map((p) => p.mes),
      datasets: series.map((nombre, i) => {
        const color = PALETA_CATEGORICA[i % PALETA_CATEGORICA.length];
        return {
          label: nombre,
          data: puntos.map((p) => p[nombre] || 0),
          borderColor: color,
          backgroundColor: color,
          pointBackgroundColor: color,
          pointBorderColor: "#fff",
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          fill: false,
          tension: 0.3,
        };
      }),
    };
  }, [datos]);

  const opcionesEvolucion = {
    maintainAspectRatio: false,
    legend: {
      display: chartEvolucion.datasets.length > 1,
      position: "top",
      labels: { boxWidth: 10, fontSize: 11, usePointStyle: true, padding: 14 },
    },
    tooltips: {
      backgroundColor: "#1a1a2e",
      callbacks: {
        label: (item, data) => {
          const label = data.datasets[item.datasetIndex].label || "";
          return `${label}: ${fmtCLP(item.yLabel)}`;
        },
      },
    },
    scales: {
      xAxes: [
        {
          gridLines: { display: false },
          ticks: { fontColor: "#8898aa", fontSize: 11 },
        },
      ],
      yAxes: [
        {
          gridLines: { color: "#f0f1f7", drawBorder: false, zeroLineColor: "#f0f1f7" },
          ticks: {
            beginAtZero: true,
            fontColor: "#8898aa",
            fontSize: 11,
            callback: (v) => fmtCLPCorto(v),
          },
        },
      ],
    },
  };

  const variacionTexto = (v) => (v === null || v === undefined ? "" : `${v > 0 ? "+" : ""}${v}%`);
  const colorVariacion = (v) => (v > 0 ? "#0ca30c" : v < 0 ? "#d03b3b" : "#8898aa");

  return (
    <>
      <UserHeader />
      <Container className="mt--7" fluid style={S.page}>
        <Row className="justify-content-center">
          <Col xl="11" lg="12">
            {/* ── Encabezado + filtros ── */}
            <div style={{ ...S.card, marginBottom: 20 }}>
              <div style={S.cardHeader}>
                <Row className="align-items-center">
                  <Col md="4" className="mb-2 mb-md-0">
                    <h3 style={S.title}>Servicios</h3>
                    <p style={S.subtitle}>
                      Qué servicios te conviene mantener, promocionar o
                      repensar — con datos, no con intuición.
                    </p>
                  </Col>

                  <Col md="8">
                    <Row className="align-items-end">
                      <Col xs="6" md="2" className="mb-2">
                        <small className="text-muted d-block mb-1" style={{ fontWeight: 600 }}>
                          Desde
                        </small>
                        <Input
                          type="date"
                          bsSize="sm"
                          value={desde}
                          onChange={(e) => {
                            setPresetActivo(null);
                            setDesde(e.target.value);
                          }}
                        />
                      </Col>
                      <Col xs="6" md="2" className="mb-2">
                        <small className="text-muted d-block mb-1" style={{ fontWeight: 600 }}>
                          Hasta
                        </small>
                        <Input
                          type="date"
                          bsSize="sm"
                          value={hasta}
                          onChange={(e) => {
                            setPresetActivo(null);
                            setHasta(e.target.value);
                          }}
                        />
                      </Col>
                      <Col xs="12" md={esAdmin ? "4" : "8"} className="mb-2">
                        <small className="text-muted d-block mb-1" style={{ fontWeight: 600 }}>
                          Servicio
                        </small>
                        <Input
                          type="select"
                          bsSize="sm"
                          value={servicioId}
                          onChange={(e) => setServicioId(e.target.value)}
                        >
                          <option value="">Todos los servicios</option>
                          {servicios.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.nombre}
                            </option>
                          ))}
                        </Input>
                      </Col>
                      {esAdmin && (
                        <Col xs="12" md="4" className="mb-2">
                          <small className="text-muted d-block mb-1" style={{ fontWeight: 600 }}>
                            Profesional
                          </small>
                          <Input
                            type="select"
                            bsSize="sm"
                            value={profesionalId}
                            onChange={(e) => setProfesionalId(e.target.value)}
                          >
                            <option value="">Todo el equipo</option>
                            {profesionales.map((p) => (
                              <option key={p._id} value={p._id}>
                                {p.nombre} {p.apellido || ""}
                              </option>
                            ))}
                          </Input>
                        </Col>
                      )}
                    </Row>

                    <div className="d-flex flex-wrap" style={{ gap: 6 }}>
                      {PRESETS.map((p) => (
                        <Button
                          key={p.key}
                          size="sm"
                          outline={presetActivo !== p.key}
                          color="primary"
                          style={{ borderRadius: 99, fontSize: 12, padding: "3px 12px" }}
                          onClick={() => aplicarPreset(p)}
                        >
                          {p.label}
                        </Button>
                      ))}
                    </div>
                  </Col>
                </Row>
              </div>
            </div>

            {cargando ? (
              <div className="text-center py-5">
                <span className="text-muted">Cargando estadísticas de servicios...</span>
              </div>
            ) : error ? (
              <div className="text-center py-5">
                <span className="text-danger">{error}</span>
              </div>
            ) : (
              <>
                {/* ── KPIs ── */}
                <Row className="mb-4">
                  <Col xs="6" md="4" className="mb-3">
                    <StatCard
                      label="Ingreso del periodo"
                      value={fmtCLP(resumen.ingresoTotal)}
                      sub={
                        resumen.ingresoTotalAnterior
                          ? `${variacionTexto(resumen.variacionIngresoTotal)} vs. periodo anterior`
                          : "Sin datos del periodo anterior"
                      }
                      colorValue={colorVariacion(resumen.variacionIngresoTotal)}
                    />
                  </Col>
                  <Col xs="6" md="4" className="mb-3">
                    <StatCard
                      label="Ticket promedio"
                      value={fmtCLP(resumen.ticketPromedioGeneral)}
                      sub={`${resumen.ventasTotales || 0} servicios vendidos`}
                    />
                  </Col>
                  <Col xs="6" md="4" className="mb-3">
                    <StatCard
                      label="Mayor ingreso"
                      value={resumen.servicioTopIngreso?.nombre || "—"}
                      sub={resumen.servicioTopIngreso ? fmtCLP(resumen.servicioTopIngreso.ingreso) : ""}
                    />
                  </Col>
                  <Col xs="6" md="4" className="mb-3">
                    <StatCard
                      label="Más vendido"
                      value={resumen.servicioTopVolumen?.nombre || "—"}
                      sub={
                        resumen.servicioTopVolumen
                          ? `${resumen.servicioTopVolumen.cantidad} veces`
                          : ""
                      }
                    />
                  </Col>
                  <Col xs="6" md="4" className="mb-3">
                    <StatCard
                      label="Mejor rentabilidad por hora"
                      value={resumen.mejorRentabilidadHora?.nombre || "—"}
                      sub={
                        resumen.mejorRentabilidadHora
                          ? `${fmtCLP(resumen.mejorRentabilidadHora.ingresoPorHora)} / hora ocupada`
                          : ""
                      }
                    />
                  </Col>
                  <Col xs="6" md="4" className="mb-3">
                    <StatCard
                      label={resumen.mayorCaida ? "Perdiendo demanda" : "Menor ingreso"}
                      value={(resumen.mayorCaida || resumen.servicioMenorIngreso)?.nombre || "—"}
                      sub={
                        resumen.mayorCaida
                          ? `${variacionTexto(resumen.mayorCaida.variacionIngreso)} vs. periodo anterior`
                          : resumen.servicioMenorIngreso
                            ? fmtCLP(resumen.servicioMenorIngreso.ingreso)
                            : ""
                      }
                      colorValue={resumen.mayorCaida ? "#d03b3b" : undefined}
                    />
                  </Col>
                </Row>

                {resumen.serviciosSinVentas?.length > 0 && (
                  <div
                    style={{
                      ...S.card,
                      marginBottom: 20,
                      padding: "0.85rem 1.5rem",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <Badge color="warning" pill style={{ fontSize: 11 }}>
                      Sin ventas en este periodo
                    </Badge>
                    <span style={{ fontSize: 13, color: "#525f7f" }}>
                      {resumen.serviciosSinVentas.join(", ")}
                    </span>
                  </div>
                )}

                {/* ── Evolución mensual ── */}
                <div style={{ ...S.card, marginBottom: 20 }}>
                  <div style={S.cardHeader}>
                    <h4 style={{ ...S.title, fontSize: 15 }}>Evolución mensual de ingresos</h4>
                    <p style={S.subtitle}>
                      {servicioId
                        ? "Últimos 6 meses del servicio seleccionado."
                        : "Últimos 6 meses — los 5 servicios que más generan en el periodo elegido arriba."}
                    </p>
                  </div>
                  <div style={{ padding: "1rem 1.5rem", height: 300 }}>
                    <Line data={chartEvolucion} options={opcionesEvolucion} />
                  </div>
                </div>

                {/* ── Ranking de servicios ── */}
                <div style={{ ...S.card, marginBottom: porProfesional.length ? 20 : 0 }}>
                  <div style={S.cardHeader}>
                    <h4 style={{ ...S.title, fontSize: 15 }}>Por servicio</h4>
                  </div>

                  <div style={{ padding: "0.5rem 1.5rem 1.5rem" }}>
                    {lista.length === 0 ? (
                      <div className="text-center py-5">
                        <span className="text-muted">
                          Todavía no hay servicios creados. Puedes crearlos en
                          "Gestión de Servicios".
                        </span>
                      </div>
                    ) : (
                      lista.map((s) => {
                        const pctBarra = Math.max(4, (s.ingreso / maxIngreso) * 100);
                        return (
                          <div
                            key={s.servicioId}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 16,
                              padding: "14px 0",
                              borderBottom: "1px solid #f0f0f0",
                              flexWrap: "wrap",
                              opacity: s.activo ? 1 : 0.6,
                            }}
                          >
                            <ServicioIcono nombre={s.nombre} />

                            <div style={{ flex: "1 1 240px", minWidth: 200 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <span style={{ fontWeight: 700, fontSize: 14.5, color: "#1a1a2e" }}>
                                  {s.nombre}
                                </span>
                                <BadgeTendencia tendencia={s.tendencia} />
                                {!s.activo && (
                                  <span
                                    style={{
                                      fontSize: 10,
                                      fontWeight: 700,
                                      color: "#8898aa",
                                      background: "#f0f1f7",
                                      borderRadius: 99,
                                      padding: "2px 8px",
                                    }}
                                  >
                                    Inactivo
                                  </span>
                                )}
                              </div>

                              <div
                                style={{
                                  height: 8,
                                  borderRadius: 99,
                                  background: "#f0f1f7",
                                  marginTop: 8,
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    height: "100%",
                                    width: `${pctBarra}%`,
                                    borderRadius: 99,
                                    background: "linear-gradient(90deg,#4361ee,#7209b7)",
                                  }}
                                />
                              </div>

                              <div style={{ fontSize: 12, color: "#8898aa", marginTop: 6 }}>
                                {s.cantidad} venta{s.cantidad === 1 ? "" : "s"} · {s.participacion}% del
                                ingreso · {fmtCLP(s.ingresoPorHora)}/hora
                                {s.tasaFriccion > 0 && ` · ${s.tasaFriccion}% cancela o no asiste`}
                              </div>
                            </div>

                            <div style={{ textAlign: "right", minWidth: 130 }}>
                              <div style={{ fontWeight: 700, fontSize: 17, color: "#1a1a2e" }}>
                                {fmtCLP(s.ingreso)}
                              </div>
                              <div style={{ fontSize: 11.5, color: "#8898aa" }}>
                                ticket prom. {fmtCLP(s.ticketPromedio)}
                              </div>
                              {s.tendencia !== "nuevo" && s.tendencia !== "sin_actividad" && (
                                <div style={{ fontSize: 11.5, color: colorVariacion(s.variacionIngreso), fontWeight: 600 }}>
                                  {variacionTexto(s.variacionIngreso)}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* ── Cruce por profesional (solo admin) ── */}
                {esAdmin && porProfesional.length > 0 && (
                  <div style={S.card}>
                    <div style={S.cardHeader}>
                      <h4 style={{ ...S.title, fontSize: 15 }}>Por profesional y servicio</h4>
                      <p style={S.subtitle}>
                        {servicioId
                          ? "Quién genera cuánto en el servicio seleccionado."
                          : "Las combinaciones profesional + servicio que más generan en el periodo."}
                      </p>
                    </div>
                    <div style={{ padding: "0.5rem 1.5rem 1.5rem" }}>
                      {porProfesional.slice(0, 10).map((c, i) => (
                        <div
                          key={`${c.barberoId}-${c.servicioId}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                            padding: "10px 0",
                            borderBottom:
                              i === Math.min(porProfesional.length, 10) - 1
                                ? "none"
                                : "1px solid #f0f0f0",
                          }}
                        >
                          <div style={{ fontSize: 13.5, color: "#1a1a2e" }}>
                            <strong>{c.nombreBarbero}</strong>{" "}
                            <span style={{ color: "#8898aa" }}>— {c.nombreServicio}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <span style={{ fontSize: 12, color: "#8898aa" }}>{c.cantidad}x</span>
                            <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>
                              {fmtCLP(c.ingreso)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default EstadisticasServicios;

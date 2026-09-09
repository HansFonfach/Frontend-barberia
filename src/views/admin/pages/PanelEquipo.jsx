// src/views/admin/pages/PanelEquipo.jsx
//
// Panel "Equipo" — pensado para negocios con más de un profesional donde
// alguien (dueño, secretaria, administrador) necesita ver a TODO el equipo
// de un vistazo: cuánto genera cada profesional, cuántas reservas atendió,
// y saltar directo a la agenda de cualquiera de ellos. Solo lo ve quien
// tiene esAdmin === true (ruta gateada con soloAdmin en routes.js).
//
// Mismo lenguaje visual que el resto del panel admin (tarjetas blancas
// redondeadas, acento #4361ee) y la misma técnica de "colores por
// servicio/estado" ya usada en ReservasSemana.jsx.
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Input, Button } from "reactstrap";

import UserHeader from "components/Headers/UserHeader";
import { getEstadisticasEquipo } from "api/estadisticas";
import { getServicios } from "api/servicios";

const fmtCLP = (n) => `$${Math.round(n || 0).toLocaleString("es-CL")}`;

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
  d.setDate(0); // día 0 del mes actual = último día del mes anterior
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

// ─── Estilos (mismo lenguaje visual que el resto del panel admin) ────────
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
  statValue: { fontSize: 24, fontWeight: 700, color: "#1a1a2e" },
};

const AvatarIniciales = ({ nombre, apellido, foto, size = 46 }) => {
  const iniciales = `${nombre?.[0] || ""}${apellido?.[0] || ""}`.toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        flexShrink: 0,
        background: "linear-gradient(135deg,#4361ee,#3a0ca3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {foto ? (
        <img src={foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <span style={{ color: "#fff", fontWeight: 700, fontSize: size * 0.38 }}>{iniciales}</span>
      )}
    </div>
  );
};

const PanelEquipo = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [desde, setDesde] = useState(primerDiaMes());
  const [hasta, setHasta] = useState(aYYYYMMDD(new Date()));
  const [presetActivo, setPresetActivo] = useState("mes");
  const [servicioId, setServicioId] = useState("");
  const [servicios, setServicios] = useState([]);

  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getServicios()
      .then((res) => setServicios(res.data || []))
      .catch((err) => console.error("Error al obtener servicios:", err));
  }, []);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    getEstadisticasEquipo(desde, hasta, servicioId || undefined)
      .then((res) => {
        if (!cancelado) setDatos(res.data?.data || null);
      })
      .catch((err) => {
        console.error("Error al obtener el resumen del equipo:", err);
        if (!cancelado) {
          setError(
            err?.response?.data?.message ||
              "No se pudo cargar el resumen del equipo",
          );
        }
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [desde, hasta, servicioId]);

  const aplicarPreset = (preset) => {
    setPresetActivo(preset.key);
    setDesde(preset.desde());
    setHasta(preset.hasta());
  };

  const equipo = datos?.equipo || [];
  const totales = datos?.totalesEquipo || {
    ingresoTotal: 0,
    reservasCompletadas: 0,
    reservasTotales: 0,
    noAsistio: 0,
  };

  const maxIngreso = useMemo(
    () => Math.max(1, ...equipo.map((p) => p.ingresoTotal)),
    [equipo],
  );

  const irAAgenda = (barberoId) => {
    navigate(`/${slug}/admin/reservas?barberoId=${barberoId}`);
  };

  const ticketPromedioEquipo = totales.reservasCompletadas
    ? Math.round(totales.ingresoTotal / totales.reservasCompletadas)
    : 0;

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
                  <Col md="5" className="mb-2 mb-md-0">
                    <h3 style={S.title}>Equipo</h3>
                    <p style={S.subtitle}>
                      Cuánto genera y cuánto trabaja cada profesional — en el
                      periodo que elijas abajo.
                    </p>
                  </Col>

                  <Col md="7">
                    <Row className="align-items-end">
                      <Col xs="6" md="3" className="mb-2">
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
                      <Col xs="6" md="3" className="mb-2">
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
                      <Col xs="12" md="6" className="mb-2">
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

            {/* ── KPIs del equipo completo ── */}
            <Row className="mb-4">
              <Col xs="6" md="3" className="mb-3">
                <div style={S.statCard}>
                  <div style={S.statLabel}>Ingreso del equipo</div>
                  <div style={S.statValue}>{fmtCLP(totales.ingresoTotal)}</div>
                </div>
              </Col>
              <Col xs="6" md="3" className="mb-3">
                <div style={S.statCard}>
                  <div style={S.statLabel}>Reservas completadas</div>
                  <div style={S.statValue}>{totales.reservasCompletadas}</div>
                </div>
              </Col>
              <Col xs="6" md="3" className="mb-3">
                <div style={S.statCard}>
                  <div style={S.statLabel}>Ticket promedio</div>
                  <div style={S.statValue}>{fmtCLP(ticketPromedioEquipo)}</div>
                </div>
              </Col>
              <Col xs="6" md="3" className="mb-3">
                <div style={S.statCard}>
                  <div style={S.statLabel}>No asistió</div>
                  <div style={{ ...S.statValue, color: totales.noAsistio ? "#ef4444" : "#1a1a2e" }}>
                    {totales.noAsistio}
                  </div>
                </div>
              </Col>
            </Row>

            {/* ── Comparativo por profesional ── */}
            <div style={S.card}>
              <div style={S.cardHeader}>
                <h4 style={{ ...S.title, fontSize: 15 }}>Por profesional</h4>
              </div>

              <div style={{ padding: "0.5rem 1.5rem 1.5rem" }}>
                {cargando ? (
                  <div className="text-center py-5">
                    <span className="text-muted">Cargando resumen del equipo...</span>
                  </div>
                ) : error ? (
                  <div className="text-center py-5">
                    <span className="text-danger">{error}</span>
                  </div>
                ) : equipo.length === 0 ? (
                  <div className="text-center py-5">
                    <span className="text-muted">
                      No hay profesionales creados todavía. Puedes crearlos en
                      "Gestión de Profesionales".
                    </span>
                  </div>
                ) : (
                  equipo.map((p) => {
                    const pctBarra = Math.max(4, (p.ingresoTotal / maxIngreso) * 100);
                    return (
                      <div
                        key={p.barberoId}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          padding: "14px 0",
                          borderBottom: "1px solid #f0f0f0",
                          flexWrap: "wrap",
                        }}
                      >
                        <AvatarIniciales nombre={p.nombre} apellido={p.apellido} foto={p.fotoPerfil} />

                        <div style={{ flex: "1 1 220px", minWidth: 180 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontWeight: 700, fontSize: 14.5, color: "#1a1a2e" }}>
                              {p.nombre} {p.apellido}
                            </span>
                            {p.esAdmin && (
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  color: "#4361ee",
                                  background: "#EEF1FE",
                                  borderRadius: 99,
                                  padding: "2px 8px",
                                }}
                              >
                                Admin
                              </span>
                            )}
                            {p.estado === "inactivo" && (
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  color: "#ef4444",
                                  background: "#FDECEC",
                                  borderRadius: 99,
                                  padding: "2px 8px",
                                }}
                              >
                                Inactivo
                              </span>
                            )}
                          </div>

                          {/* Barra comparativa de ingreso */}
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
                            {p.reservasCompletadas} completada
                            {p.reservasCompletadas === 1 ? "" : "s"} · {p.reservasTotales} en total
                            {p.noAsistio > 0 && ` · ${p.noAsistio} no asistió`}
                          </div>
                        </div>

                        <div style={{ textAlign: "right", minWidth: 130 }}>
                          <div style={{ fontWeight: 700, fontSize: 17, color: "#1a1a2e" }}>
                            {fmtCLP(p.ingresoTotal)}
                          </div>
                          <div style={{ fontSize: 11.5, color: "#8898aa" }}>
                            ticket prom. {fmtCLP(p.ticketPromedio)}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          color="primary"
                          outline
                          style={{ borderRadius: 8, whiteSpace: "nowrap" }}
                          onClick={() => irAAgenda(p.barberoId)}
                        >
                          Ver agenda
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default PanelEquipo;

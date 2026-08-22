import React, { useContext, useEffect, useState } from "react";
import { Container, Row, Col, Input } from "reactstrap";
import UserHeader from "components/Headers/UserHeader.js";
import Swal from "sweetalert2";
import ClasesContext from "context/ClasesContext";
import InscribirClienteModal from "components/gestionClases/InscribirClienteModal";

// ─── Estilos (mismo lenguaje visual que GestionClases.jsx) ─────────────────

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
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    background: "#fff",
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    background: "#EEEDFE",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  title: { fontSize: 17, fontWeight: 600, color: "#1a1a2e", margin: 0 },
  subtitle: { fontSize: 12, color: "#8898aa", margin: 0, textTransform: "capitalize" },
  navBar: {
    padding: "1rem 1.5rem",
    borderBottom: "1px solid #f0f0f0",
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  navBtn: {
    background: "transparent",
    color: "#525f7f",
    border: "1px solid #e9ecef",
    borderRadius: 8,
    padding: "7px 14px",
    fontSize: 13,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  input: {
    padding: "6px 10px",
    border: "1px solid #e9ecef",
    borderRadius: 8,
    fontSize: 13,
    color: "#1a1a2e",
    background: "#fafafa",
    outline: "none",
  },
  statsBar: {
    padding: "0.85rem 1.5rem",
    borderBottom: "1px solid #f0f0f0",
    background: "#fafafa",
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    padding: "10px 16px",
    textAlign: "left",
    fontSize: 11,
    fontWeight: 600,
    color: "#8898aa",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    background: "#fafafa",
    borderBottom: "1px solid #f0f0f0",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "13px 16px",
    borderBottom: "1px solid #f5f5f5",
    color: "#1a1a2e",
    verticalAlign: "middle",
  },
  mobileList: { padding: "1rem" },
  mobileCard: {
    background: "#fff",
    border: "1px solid #e9ecef",
    borderRadius: 12,
    padding: "14px",
    marginBottom: 10,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  emptyState: { textAlign: "center", padding: "3.5rem 1rem" },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "#EEEDFE",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1rem",
  },
};

const pill = (bg, color) => ({
  background: bg,
  color,
  borderRadius: 99,
  padding: "3px 10px",
  fontSize: 11,
  fontWeight: 500,
  display: "inline-block",
});

const inscritoBadge = (ins) => {
  if (ins.tipoAcceso === "membresia") return pill("#EAF2FF", "#2D5FA3");
  if (ins.tipoAcceso === "prueba_gratis") return pill("#FFF3CD", "#856404");
  return pill("#F0F0F0", "#525f7f");
};

const inscritoLabel = (ins) => {
  if (ins.tipoAcceso === "membresia") return "Mensualidad";
  if (ins.tipoAcceso === "prueba_gratis") return "Prueba gratis";
  return "Pase diario";
};

const hoyISO = () => new Date().toISOString().split("T")[0];

const sumarDias = (fechaISO, dias) => {
  const [y, m, d] = fechaISO.split("-").map(Number);
  const fecha = new Date(y, m - 1, d);
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().split("T")[0];
};

const formatFechaLarga = (fechaISO) => {
  const [y, m, d] = fechaISO.split("-").map(Number);
  const fecha = new Date(y, m - 1, d);
  return fecha.toLocaleDateString("es-CL", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatHora = (fechaISOCompleta) =>
  new Date(fechaISOCompleta).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Santiago",
  });

const ClasesDelDia = () => {
  const { getSesiones, getInscritos, cancelarInscripcion } = useContext(ClasesContext);

  const [fecha, setFecha] = useState(hoyISO());
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [sesionAbierta, setSesionAbierta] = useState(null);
  const [inscritosPorSesion, setInscritosPorSesion] = useState({});

  const [modalInscribir, setModalInscribir] = useState({ abierto: false, sesion: null });

  const cargar = async (fechaBuscada) => {
    setLoading(true);
    setSesionAbierta(null);
    setInscritosPorSesion({});
    try {
      const data = await getSesiones({
        desde: fechaBuscada,
        hasta: fechaBuscada,
        incluirPasadas: "true",
      });
      setSesiones(
        data.slice().sort((a, b) => new Date(a.fecha) - new Date(b.fecha)),
      );
    } catch (error) {
      console.error("❌ Error al obtener las clases del día:", error);
      setSesiones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar(fecha);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleInscritos = async (idx, sesion) => {
    if (sesionAbierta === idx) {
      setSesionAbierta(null);
      return;
    }
    setSesionAbierta(idx);

    if (inscritosPorSesion[idx]) return;

    setInscritosPorSesion((prev) => ({
      ...prev,
      [idx]: { cargando: true, lista: [] },
    }));
    try {
      const lista = await getInscritos(sesion.claseId, sesion.fecha);
      setInscritosPorSesion((prev) => ({
        ...prev,
        [idx]: { cargando: false, lista },
      }));
    } catch (error) {
      setInscritosPorSesion((prev) => ({
        ...prev,
        [idx]: { cargando: false, lista: [], error: true },
      }));
    }
  };

  const handleCancelarInscripcion = async (inscripcion) => {
    const confirmar = await Swal.fire({
      title: "¿Cancelar inscripción?",
      text: `${inscripcion.cliente?.nombre || ""} ${inscripcion.cliente?.apellido || ""}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    });
    if (!confirmar.isConfirmed) return;

    try {
      await cancelarInscripcion(inscripcion._id);
      Swal.fire("Listo", "Inscripción cancelada", "success");
      cargar(fecha);
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo cancelar la inscripción",
        "error",
      );
    }
  };

  const totalInscritos = sesiones.reduce((acc, s) => acc + (s.inscritos || 0), 0);
  const esHoy = fecha === hoyISO();

  const renderInscritos = (info) => {
    if (info?.cargando) {
      return <div style={{ textAlign: "center", color: "#8898aa", padding: "10px 0" }}>Cargando inscritos...</div>;
    }
    if (info?.error) {
      return <div style={{ textAlign: "center", color: "#E24B4A", padding: "10px 0" }}>No se pudo cargar la lista de inscritos.</div>;
    }
    if (!info?.lista?.length) {
      return <div style={{ textAlign: "center", color: "#8898aa", padding: "10px 0" }}>Nadie inscrito todavía en esta sesión.</div>;
    }
    return (
      <ul className="list-unstyled mb-0" style={{ padding: "6px 0" }}>
        {info.lista.map((ins) => (
          <li
            key={ins._id}
            className="d-flex align-items-center flex-wrap"
            style={{ gap: 6, padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}
          >
            <span style={{ fontWeight: 600, fontSize: 13 }}>
              {ins.cliente?.nombre} {ins.cliente?.apellido}
            </span>
            <span style={{ fontSize: 11, color: "#8898aa" }}>
              ({ins.cliente?.telefono || ins.cliente?.email || "sin contacto"})
            </span>
            <span style={inscritoBadge(ins)}>{inscritoLabel(ins)}</span>
            {ins.estado === "no_asistio" && <span style={pill("#F0F0F0", "#525f7f")}>No asistió</span>}
            {ins.estado !== "cancelada" && (
              <button
                type="button"
                className="btn btn-link btn-sm text-danger p-0"
                style={{ fontSize: 12 }}
                onClick={() => handleCancelarInscripcion(ins)}
              >
                Cancelar
              </button>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <>
      <UserHeader />

      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col xl="11" style={S.page}>
            <div style={S.card}>
              {/* ── Header ── */}
              <div style={S.cardHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={S.iconWrap}>
                    <i className="fas fa-calendar-day" style={{ color: "#534AB7", fontSize: 18 }} />
                  </div>
                  <div>
                    <p style={S.title}>Clases del día</p>
                    <p style={S.subtitle}>{formatFechaLarga(fecha)}</p>
                  </div>
                </div>
              </div>

              {/* ── Navegación de fecha ── */}
              <div style={S.navBar}>
                <button style={S.navBtn} onClick={() => setFecha(sumarDias(fecha, -1))}>
                  ‹ Anterior
                </button>
                <input
                  type="date"
                  style={{ ...S.input, maxWidth: 170 }}
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
                {!esHoy && (
                  <button
                    style={{ ...S.navBtn, color: "#534AB7", borderColor: "#D9D5F5" }}
                    onClick={() => setFecha(hoyISO())}
                  >
                    Hoy
                  </button>
                )}
                <button style={S.navBtn} onClick={() => setFecha(sumarDias(fecha, 1))}>
                  Siguiente ›
                </button>
              </div>

              {/* ── Stats ── */}
              {!loading && sesiones.length > 0 && (
                <div style={S.statsBar}>
                  <span style={pill("#EEEDFE", "#534AB7")}>
                    {sesiones.length} {sesiones.length === 1 ? "clase" : "clases"}
                  </span>
                  <span style={pill("#EAF2FF", "#2D5FA3")}>{totalInscritos} inscritos en total</span>
                </div>
              )}

              {/* ── Contenido ── */}
              {loading ? (
                <div style={{ textAlign: "center", padding: "3rem" }}>
                  <div className="spinner-border text-primary" role="status" />
                </div>
              ) : sesiones.length === 0 ? (
                <div style={S.emptyState}>
                  <div style={S.emptyIcon}>
                    <i className="fas fa-calendar-day" style={{ color: "#534AB7", fontSize: 22 }} />
                  </div>
                  <p style={{ fontWeight: 600, color: "#1a1a2e", marginBottom: 4 }}>
                    No hay clases programadas este día
                  </p>
                  <p style={{ fontSize: 13, color: "#8898aa" }}>Prueba con otra fecha usando los botones de arriba.</p>
                </div>
              ) : isMobile ? (
                <div style={S.mobileList}>
                  {sesiones.map((s, i) => {
                    const abierta = sesionAbierta === i;
                    const info = inscritosPorSesion[i];
                    return (
                      <div key={i} style={S.mobileCard}>
                        <div
                          style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}
                          onClick={() => toggleInscritos(i, s)}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a2e" }}>
                              {formatHora(s.fecha)} · {s.nombre}
                            </div>
                            <div style={{ fontSize: 12, color: "#8898aa" }}>
                              {s.instructor
                                ? `${s.instructor.nombre || ""} ${s.instructor.apellido || ""}`.trim()
                                : "Sin instructor asignado"}
                            </div>
                          </div>
                          <span style={s.lleno ? pill("#FCEBEB", "#A32D2D") : pill("#E6F9F0", "#1A7A4A")}>
                            {s.lleno ? "Lleno" : "Disponible"}
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                          <span style={pill("#EAF2FF", "#2D5FA3")}>
                            {s.inscritos} / {s.cupoMaximo} cupos
                          </span>
                          <div style={{ display: "flex", gap: 8 }}>
                            {!s.lleno && (
                              <button
                                style={{
                                  background: "transparent",
                                  color: "#534AB7",
                                  border: "1px solid #D9D5F5",
                                  borderRadius: 8,
                                  padding: "5px 12px",
                                  fontSize: 12,
                                  cursor: "pointer",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setModalInscribir({ abierto: true, sesion: s });
                                }}
                              >
                                + Inscribir
                              </button>
                            )}
                            <button
                              style={{
                                background: "transparent",
                                color: "#8898aa",
                                border: "1px solid #e9ecef",
                                borderRadius: 8,
                                padding: "5px 10px",
                                fontSize: 12,
                                cursor: "pointer",
                              }}
                              onClick={() => toggleInscritos(i, s)}
                            >
                              {abierta ? "Ocultar" : "Ver inscritos"}
                            </button>
                          </div>
                        </div>

                        {abierta && (
                          <div style={{ marginTop: 10, borderTop: "1px solid #f0f0f0" }}>
                            {renderInscritos(info)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={S.tableWrap}>
                  <table style={S.table}>
                    <thead>
                      <tr>
                        <th style={S.th}>Hora</th>
                        <th style={S.th}>Clase</th>
                        <th style={S.th}>Instructor</th>
                        <th style={S.th}>Cupo</th>
                        <th style={S.th}>Estado</th>
                        <th style={S.th}></th>
                        <th style={S.th}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sesiones.map((s, i) => {
                        const abierta = sesionAbierta === i;
                        const info = inscritosPorSesion[i];
                        return (
                          <React.Fragment key={i}>
                            <tr style={{ cursor: "pointer" }} onClick={() => toggleInscritos(i, s)}>
                              <td style={S.td}>
                                <strong>{formatHora(s.fecha)}</strong>
                              </td>
                              <td style={S.td}>{s.nombre}</td>
                              <td style={S.td}>
                                {s.instructor
                                  ? `${s.instructor.nombre || ""} ${s.instructor.apellido || ""}`.trim()
                                  : "—"}
                              </td>
                              <td style={S.td}>
                                {s.inscritos} / {s.cupoMaximo}
                              </td>
                              <td style={S.td}>
                                <span style={s.lleno ? pill("#FCEBEB", "#A32D2D") : pill("#E6F9F0", "#1A7A4A")}>
                                  {s.lleno ? "Lleno" : "Disponible"}
                                </span>
                              </td>
                              <td style={S.td}>
                                {!s.lleno && (
                                  <button
                                    style={{
                                      background: "transparent",
                                      color: "#534AB7",
                                      border: "1px solid #D9D5F5",
                                      borderRadius: 8,
                                      padding: "5px 12px",
                                      fontSize: 12,
                                      cursor: "pointer",
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setModalInscribir({ abierto: true, sesion: s });
                                    }}
                                  >
                                    + Inscribir
                                  </button>
                                )}
                              </td>
                              <td style={{ ...S.td, textAlign: "right" }}>
                                <i className={`fas fa-chevron-${abierta ? "up" : "down"} text-muted`} />
                              </td>
                            </tr>
                            {abierta && (
                              <tr>
                                <td colSpan={7} style={{ background: "#fafafa", padding: "8px 16px" }}>
                                  {renderInscritos(info)}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>

      <InscribirClienteModal
        isOpen={modalInscribir.abierto}
        toggle={() => setModalInscribir({ abierto: false, sesion: null })}
        sesion={modalInscribir.sesion}
        onInscrito={() => cargar(fecha)}
      />
    </>
  );
};

export default ClasesDelDia;

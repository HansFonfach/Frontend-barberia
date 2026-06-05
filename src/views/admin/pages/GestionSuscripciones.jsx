import { useEffect, useState } from "react";
import {
  Col, Container, Row, Spinner,
} from "reactstrap";
import UserHeader from "components/Headers/UserHeader";
import { listarSuscripciones } from "api/suscripciones";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NOMBRE_PLAN = {
  creditos:                 "La Santa Navaja",
  combo_visita_corte_barba: "La Santa Dupla",
};

const formatFecha = (d) =>
  new Date(d).toLocaleDateString("es-CL", {
    day: "2-digit", month: "2-digit", year: "numeric",
    timeZone: "America/Santiago",
  });

const diasRestantes = (fechaFin) =>
  Math.ceil((new Date(fechaFin) - new Date()) / (1000 * 60 * 60 * 24));

const MESES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

const iniciales = (u) =>
  u ? `${u.nombre?.[0] || ""}${u.apellido?.[0] || ""}`.toUpperCase() : "?";

// ─── Estilos ──────────────────────────────────────────────────────────────────

const S = {
  page: { padding: "1.5rem 0" },
  card: {
    background: "#fff", borderRadius: 16,
    border: "1px solid #e9ecef",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden",
  },
  cardHeader: {
    padding: "1.25rem 1.5rem", borderBottom: "1px solid #f0f0f0",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    flexWrap: "wrap", gap: 12, background: "#fff",
  },
  iconWrap: {
    width: 42, height: 42, borderRadius: 10, background: "#EEEDFE",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  title:    { fontSize: 17, fontWeight: 600, color: "#1a1a2e", margin: 0 },
  subtitle: { fontSize: 12, color: "#8898aa", margin: 0 },
  statsGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
    gap: 10, padding: "1rem 1.5rem", borderBottom: "1px solid #f0f0f0", background: "#fafafa",
  },
  statCard: { background: "#fff", border: "1px solid #e9ecef", borderRadius: 10, padding: "10px 14px" },
  statLabel: { fontSize: 11, color: "#8898aa", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.04em" },
  statValue: { fontSize: 20, fontWeight: 600, color: "#1a1a2e", lineHeight: 1 },
  filterBar: {
    padding: "1rem 1.5rem", borderBottom: "1px solid #f0f0f0",
    display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
  },
  select: {
    padding: "6px 10px", border: "1px solid #e9ecef", borderRadius: 8,
    fontSize: 13, color: "#1a1a2e", background: "#fafafa", outline: "none", cursor: "pointer",
  },
  btnPrimary: {
    background: "#534AB7", color: "#fff", border: "none", borderRadius: 8,
    padding: "7px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer",
  },
  btnSecondary: {
    background: "transparent", color: "#8898aa", border: "1px solid #e9ecef",
    borderRadius: 8, padding: "7px 16px", fontSize: 13, cursor: "pointer",
  },
  // Tabla desktop
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600,
    color: "#8898aa", letterSpacing: "0.05em", textTransform: "uppercase",
    background: "#fafafa", borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap",
  },
  td: { padding: "13px 16px", borderBottom: "1px solid #f5f5f5", color: "#1a1a2e", verticalAlign: "middle" },
  avatar: {
    width: 34, height: 34, borderRadius: "50%", background: "#EEEDFE",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 700, color: "#534AB7", flexShrink: 0,
  },
  // Cards mobile
  mobileList: { padding: "1rem" },
  mobileCard: {
    background: "#fff", border: "1px solid #e9ecef", borderRadius: 12,
    padding: "14px", marginBottom: 10,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  mobileRow: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: 6,
  },
  mobileLabel: { fontSize: 11, color: "#8898aa", textTransform: "uppercase", letterSpacing: "0.04em" },
  mobileValue: { fontSize: 13, fontWeight: 600, color: "#1a1a2e" },
  emptyState: { textAlign: "center", padding: "3.5rem 1rem" },
  emptyIcon: {
    width: 56, height: 56, borderRadius: "50%", background: "#EEEDFE",
    display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem",
  },
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

const BarraServicios = ({ usados, total }) => {
  const pct   = total > 0 ? Math.min((usados / total) * 100, 100) : 0;
  const color = pct >= 100 ? "#E24B4A" : pct >= 60 ? "#fb6340" : "#2dce89";
  return (
    <div>
      <div style={{ fontSize: 11, color: "#8898aa", marginBottom: 3 }}>
        {usados} / {total} servicios
      </div>
      <div style={{ background: "#f0f0f0", borderRadius: 99, height: 6, width: 100 }}>
        <div style={{ width: `${pct}%`, background: color, borderRadius: 99, height: 6, transition: "width 0.3s" }} />
      </div>
    </div>
  );
};

const BadgeEstado = ({ fechaFin, activa }) => {
  const base = { padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 500 };
  if (!activa || diasRestantes(fechaFin) <= 0)
    return <span style={{ ...base, background: "#FCEBEB", color: "#A32D2D" }}>Vencida</span>;
  const dias = diasRestantes(fechaFin);
  if (dias <= 7)
    return <span style={{ ...base, background: "#FFF3CD", color: "#856404" }}>Vence en {dias}d</span>;
  return <span style={{ ...base, background: "#E6F9F0", color: "#1A7A4A" }}>Activa · {dias}d</span>;
};

const BadgePlan = ({ tipoPlan }) => {
  const esNavaja = tipoPlan === "creditos";
  return (
    <span style={{
      background: esNavaja ? "#EEEDFE" : "#E6F9F0",
      color: esNavaja ? "#534AB7" : "#1A7A4A",
      padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
    }}>
      {NOMBRE_PLAN[tipoPlan] || tipoPlan}
    </span>
  );
};

// ─── Vista desktop ────────────────────────────────────────────────────────────

const TablaDesktop = ({ suscripciones }) => (
  <div style={S.tableWrap}>
    <table style={S.table}>
      <thead>
        <tr>
          <th style={S.th}>Cliente</th>
          <th style={S.th}>Plan</th>
          <th style={S.th}>Servicios</th>
          <th style={S.th}>Inicio</th>
          <th style={S.th}>Vencimiento</th>
          <th style={S.th}>Estado</th>
        </tr>
      </thead>
      <tbody>
        {suscripciones.map((s) => (
          <tr key={s._id}>
            <td style={S.td}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={S.avatar}>{iniciales(s.usuario)}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    {s.usuario?.nombre} {s.usuario?.apellido}
                  </div>
                  <div style={{ fontSize: 11, color: "#8898aa" }}>
                    {s.usuario?.rut || s.usuario?.email}
                  </div>
                </div>
              </div>
            </td>
            <td style={S.td}><BadgePlan tipoPlan={s.tipoPlan} /></td>
            <td style={S.td}><BarraServicios usados={s.serviciosUsados} total={s.serviciosTotales} /></td>
            <td style={{ ...S.td, color: "#8898aa", fontSize: 12 }}>{formatFecha(s.fechaInicio)}</td>
            <td style={{ ...S.td, color: "#8898aa", fontSize: 12 }}>{formatFecha(s.fechaFin)}</td>
            <td style={S.td}><BadgeEstado fechaFin={s.fechaFin} activa={s.activa} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Vista mobile ─────────────────────────────────────────────────────────────

const CardsMobile = ({ suscripciones }) => (
  <div style={S.mobileList}>
    {suscripciones.map((s) => (
      <div key={s._id} style={S.mobileCard}>
        {/* Header: avatar + nombre + badge estado */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={S.avatar}>{iniciales(s.usuario)}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>
                {s.usuario?.nombre} {s.usuario?.apellido}
              </div>
              <div style={{ fontSize: 11, color: "#8898aa" }}>
                {s.usuario?.rut || s.usuario?.email}
              </div>
            </div>
          </div>
          <BadgeEstado fechaFin={s.fechaFin} activa={s.activa} />
        </div>

        {/* Plan */}
        <div style={{ marginBottom: 8 }}>
          <BadgePlan tipoPlan={s.tipoPlan} />
        </div>

        {/* Servicios */}
        <div style={{ marginBottom: 10 }}>
          <BarraServicios usados={s.serviciosUsados} total={s.serviciosTotales} />
        </div>

        {/* Fechas */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div style={{ background: "#fafafa", borderRadius: 8, padding: "8px 10px" }}>
            <div style={S.mobileLabel}>Inicio</div>
            <div style={S.mobileValue}>{formatFecha(s.fechaInicio)}</div>
          </div>
          <div style={{ background: "#fafafa", borderRadius: 8, padding: "8px 10px" }}>
            <div style={S.mobileLabel}>Vence</div>
            <div style={S.mobileValue}>{formatFecha(s.fechaFin)}</div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ─── Componente principal ─────────────────────────────────────────────────────

const GestionSuscripciones = () => {
  const ahora = new Date();
  const [suscripciones, setSuscripciones] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [mes,  setMes]  = useState(ahora.getMonth());
  const [anio, setAnio] = useState(ahora.getFullYear());
  const [soloActivas, setSoloActivas] = useState(false);
  const [isMobile, setIsMobile]       = useState(window.innerWidth < 768);

  const anios = Array.from({ length: 3 }, (_, i) => ahora.getFullYear() - i);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const cargar = async (params) => {
    setLoading(true);
    try {
      const res = await listarSuscripciones(params);
      setSuscripciones(res.data.suscripciones || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar({ mes, anio, ...(soloActivas ? { activas: true } : {}) });
  }, []);

  const handleBuscar = () =>
    cargar({ mes, anio, ...(soloActivas ? { activas: true } : {}) });

  const activas   = suscripciones.filter((s) => s.activa && diasRestantes(s.fechaFin) > 0);
  const vencidas  = suscripciones.filter((s) => !s.activa || diasRestantes(s.fechaFin) <= 0);
  const porVencer = activas.filter((s) => diasRestantes(s.fechaFin) <= 7);
  const navaja    = suscripciones.filter((s) => s.tipoPlan === "creditos").length;
  const dupla     = suscripciones.filter((s) => s.tipoPlan === "combo_visita_corte_barba").length;

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
                    <i className="ni ni-credit-card" style={{ color: "#534AB7", fontSize: 18 }} />
                  </div>
                  <div>
                    <p style={S.title}>Suscripciones</p>
                    <p style={S.subtitle}>Historial y estado de planes activos</p>
                  </div>
                </div>
              </div>

              {/* ── Stats ── */}
              <div style={S.statsGrid}>
                {[
                  { label: "Total",        value: suscripciones.length },
                  { label: "Activas",      value: activas.length },
                  { label: "Por vencer",   value: porVencer.length },
                  { label: "Vencidas",     value: vencidas.length },
                  { label: "Santa Navaja", value: navaja },
                  { label: "Santa Dupla",  value: dupla },
                ].map((s) => (
                  <div key={s.label} style={S.statCard}>
                    <div style={S.statLabel}>{s.label}</div>
                    <div style={S.statValue}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* ── Filtros ── */}
              <div style={S.filterBar}>
                <select style={S.select} value={mes} onChange={(e) => setMes(Number(e.target.value))}>
                  {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
                <select style={S.select} value={anio} onChange={(e) => setAnio(Number(e.target.value))}>
                  {anios.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#525f7f", cursor: "pointer" }}>
                  <input type="checkbox" checked={soloActivas} onChange={(e) => setSoloActivas(e.target.checked)} />
                  Solo activas
                </label>
                <button style={S.btnPrimary} onClick={handleBuscar}>Buscar</button>
                <button style={S.btnSecondary} onClick={() => {
                  setMes(ahora.getMonth());
                  setAnio(ahora.getFullYear());
                  setSoloActivas(false);
                  cargar({ mes: ahora.getMonth(), anio: ahora.getFullYear() });
                }}>
                  Este mes
                </button>
              </div>

              {/* ── Contenido ── */}
              {loading ? (
                <div style={{ textAlign: "center", padding: "3rem" }}>
                  <Spinner color="primary" />
                </div>
              ) : suscripciones.length === 0 ? (
                <div style={S.emptyState}>
                  <div style={S.emptyIcon}>
                    <i className="ni ni-credit-card" style={{ color: "#534AB7", fontSize: 24 }} />
                  </div>
                  <p style={{ fontWeight: 600, color: "#1a1a2e", marginBottom: 4 }}>
                    No hay suscripciones en este período
                  </p>
                  <p style={{ fontSize: 13, color: "#8898aa" }}>
                    Prueba con otro mes o quita el filtro de activas.
                  </p>
                </div>
              ) : isMobile ? (
                <CardsMobile suscripciones={suscripciones} />
              ) : (
                <TablaDesktop suscripciones={suscripciones} />
              )}

            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default GestionSuscripciones;
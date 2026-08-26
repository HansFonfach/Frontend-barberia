import { useContext, useEffect, useState } from "react";
import { Modal, ModalBody, ModalHeader, Form, FormGroup, Input, Button } from "reactstrap";
import { Col, Container, Row, Spinner } from "reactstrap";
import UserHeader from "components/Headers/UserHeader";
import Swal from "sweetalert2";
import PlanesMembresiaContext from "context/PlanesMembresiaContext";
import BuscadorClientePorRut from "components/gestionClases/BuscadorClientePorRut";
import {
  getListarMembresias,
  postCrearMembresia,
  patchCancelarMembresia,
} from "api/membresiasClases";
import {
  getSolicitudesMembresia,
  patchAprobarSolicitudMembresia,
  patchRechazarSolicitudMembresia,
} from "api/solicitudesMembresia";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatFecha = (d) =>
  new Date(d).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Santiago",
  });

const diasRestantes = (fechaFin) =>
  Math.ceil((new Date(fechaFin) - new Date()) / (1000 * 60 * 60 * 24));

const formatFechaHora = (d) =>
  new Date(d).toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Santiago",
  });

const iniciales = (u) =>
  u ? `${u.nombre?.[0] || ""}${u.apellido?.[0] || ""}`.toUpperCase() : "?";

const formatoPesos = (valor) => {
  if (valor === null || valor === undefined || valor === "") return "—";
  return `$${Number(valor).toLocaleString("es-CL")}`;
};

// ─── Estilos ──────────────────────────────────────────────────────────────────

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
  subtitle: { fontSize: 12, color: "#8898aa", margin: 0 },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
    gap: 10,
    padding: "1rem 1.5rem",
    borderBottom: "1px solid #f0f0f0",
    background: "#fafafa",
  },
  statCard: {
    background: "#fff",
    border: "1px solid #e9ecef",
    borderRadius: 10,
    padding: "10px 14px",
  },
  statLabel: {
    fontSize: 11,
    color: "#8898aa",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  statValue: { fontSize: 20, fontWeight: 600, color: "#1a1a2e", lineHeight: 1 },
  filterBar: {
    padding: "1rem 1.5rem",
    borderBottom: "1px solid #f0f0f0",
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  input: {
    padding: "6px 10px",
    border: "1px solid #e9ecef",
    borderRadius: 8,
    fontSize: 13,
    color: "#1a1a2e",
    background: "#fafafa",
    outline: "none",
    minWidth: 200,
  },
  btnPrimary: {
    background: "#534AB7",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "7px 16px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },
  btnSecondary: {
    background: "transparent",
    color: "#8898aa",
    border: "1px solid #e9ecef",
    borderRadius: 8,
    padding: "7px 16px",
    fontSize: 13,
    cursor: "pointer",
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
  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "#EEEDFE",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    color: "#534AB7",
    flexShrink: 0,
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
  mobileLabel: {
    fontSize: 11,
    color: "#8898aa",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  mobileValue: { fontSize: 13, fontWeight: 600, color: "#1a1a2e" },
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

// ─── Sub-componentes ──────────────────────────────────────────────────────────

const BarraClases = ({ usadas, total, tipoCiclo }) => {
  const pct = total > 0 ? Math.min((usadas / total) * 100, 100) : 0;
  const color = pct >= 100 ? "#E24B4A" : pct >= 60 ? "#fb6340" : "#2dce89";
  return (
    <div>
      <div style={{ fontSize: 11, color: "#8898aa", marginBottom: 3 }}>
        {usadas} / {total} clases{tipoCiclo === "mensual" ? " este mes" : ""}
      </div>
      <div style={{ background: "#f0f0f0", borderRadius: 99, height: 6, width: 100 }}>
        <div
          style={{
            width: `${pct}%`,
            background: color,
            borderRadius: 99,
            height: 6,
            transition: "width 0.3s",
          }}
        />
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

// ─── Fila de la tabla / card mobile ────────────────────────────────────────────

const FilaAcciones = ({ m, onCancelar }) =>
  m.activa ? (
    <button
      style={{
        background: "transparent",
        color: "#E24B4A",
        border: "1px solid #F5C2C2",
        borderRadius: 8,
        padding: "5px 12px",
        fontSize: 12,
        cursor: "pointer",
      }}
      onClick={() => onCancelar(m)}
    >
      Cancelar
    </button>
  ) : (
    <span style={{ fontSize: 12, color: "#8898aa" }}>—</span>
  );

const TablaDesktop = ({ membresias, onCancelar }) => (
  <div style={S.tableWrap}>
    <table style={S.table}>
      <thead>
        <tr>
          <th style={S.th}>Cliente</th>
          <th style={S.th}>Plan</th>
          <th style={S.th}>Clases</th>
          <th style={S.th}>Precio</th>
          <th style={S.th}>Inicio</th>
          <th style={S.th}>Vencimiento</th>
          <th style={S.th}>Estado</th>
          <th style={S.th}></th>
        </tr>
      </thead>
      <tbody>
        {membresias.map((m) => (
          <tr key={m._id}>
            <td style={S.td}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={S.avatar}>{iniciales(m.cliente)}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    {m.cliente?.nombre} {m.cliente?.apellido}
                  </div>
                  <div style={{ fontSize: 11, color: "#8898aa" }}>
                    {m.cliente?.email || m.cliente?.telefono}
                  </div>
                </div>
              </div>
            </td>
            <td style={S.td}>{m.nombrePlan}</td>
            <td style={S.td}>
              <BarraClases usadas={m.clasesUsadas} total={m.clasesIncluidas} tipoCiclo={m.tipoCiclo} />
            </td>
            <td style={S.td}>{formatoPesos(m.precio)}</td>
            <td style={{ ...S.td, color: "#8898aa", fontSize: 12 }}>{formatFecha(m.fechaInicio)}</td>
            <td style={{ ...S.td, color: "#8898aa", fontSize: 12 }}>{formatFecha(m.fechaFin)}</td>
            <td style={S.td}>
              <BadgeEstado fechaFin={m.fechaFin} activa={m.activa} />
            </td>
            <td style={S.td}>
              <FilaAcciones m={m} onCancelar={onCancelar} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const CardsMobile = ({ membresias, onCancelar }) => (
  <div style={S.mobileList}>
    {membresias.map((m) => (
      <div key={m._id} style={S.mobileCard}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={S.avatar}>{iniciales(m.cliente)}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>
                {m.cliente?.nombre} {m.cliente?.apellido}
              </div>
              <div style={{ fontSize: 11, color: "#8898aa" }}>
                {m.cliente?.email || m.cliente?.telefono}
              </div>
            </div>
          </div>
          <BadgeEstado fechaFin={m.fechaFin} activa={m.activa} />
        </div>

        <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
          {m.nombrePlan} · {formatoPesos(m.precio)}
        </div>

        <div style={{ marginBottom: 10 }}>
          <BarraClases usadas={m.clasesUsadas} total={m.clasesIncluidas} tipoCiclo={m.tipoCiclo} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
          <div style={{ background: "#fafafa", borderRadius: 8, padding: "8px 10px" }}>
            <div style={S.mobileLabel}>Inicio</div>
            <div style={S.mobileValue}>{formatFecha(m.fechaInicio)}</div>
          </div>
          <div style={{ background: "#fafafa", borderRadius: 8, padding: "8px 10px" }}>
            <div style={S.mobileLabel}>Vence</div>
            <div style={S.mobileValue}>{formatFecha(m.fechaFin)}</div>
          </div>
        </div>

        <FilaAcciones m={m} onCancelar={onCancelar} />
      </div>
    ))}
  </div>
);

// ─── Componente principal ─────────────────────────────────────────────────────

const GestionMembresias = () => {
  const { planes, getAllPlanes } = useContext(PlanesMembresiaContext);

  const [membresias, setMembresias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [soloActivas, setSoloActivas] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [solicitudes, setSolicitudes] = useState([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
  const [resolviendoId, setResolviendoId] = useState(null);
  const [estadoFiltro, setEstadoFiltro] = useState("pendiente");

  const [modal, setModal] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [planId, setPlanId] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const cargar = async (params) => {
    setLoading(true);
    try {
      const res = await getListarMembresias(params);
      setMembresias(res.data?.membresias || []);
    } catch (error) {
      console.error("❌ Error al obtener las mensualidades:", error);
    } finally {
      setLoading(false);
    }
  };

  const cargarSolicitudes = async (estado = estadoFiltro) => {
    setLoadingSolicitudes(true);
    try {
      const res = await getSolicitudesMembresia(estado);
      setSolicitudes(res.data?.solicitudes || []);
    } catch (error) {
      console.error("❌ Error al obtener las solicitudes de membresía:", error);
    } finally {
      setLoadingSolicitudes(false);
    }
  };

  useEffect(() => {
    cargar(soloActivas ? { activas: "true" } : {});
    getAllPlanes(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    cargarSolicitudes(estadoFiltro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estadoFiltro]);

  const handleAprobarSolicitud = async (sol) => {
    const confirmar = await Swal.fire({
      title: "¿Aprobar solicitud?",
      html: `${sol.cliente?.nombre || ""} ${sol.cliente?.apellido || ""} — ${sol.nombrePlan}<br/><small>Esto activará la mensualidad de inmediato.</small>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Aprobar",
      confirmButtonColor: "#2dce89",
    });
    if (!confirmar.isConfirmed) return;

    setResolviendoId(sol._id);
    try {
      await patchAprobarSolicitudMembresia(sol._id);
      Swal.fire("Listo", "Solicitud aprobada, la mensualidad quedó activa", "success");
      cargarSolicitudes();
      cargar(soloActivas ? { activas: "true" } : {});
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo aprobar la solicitud",
        "error",
      );
    } finally {
      setResolviendoId(null);
    }
  };

  const handleRechazarSolicitud = async (sol) => {
    const { value: motivo, isConfirmed } = await Swal.fire({
      title: "Rechazar solicitud",
      input: "text",
      inputLabel: "Motivo (opcional, se muestra al cliente)",
      inputPlaceholder: "Ej: no se recibió la transferencia",
      showCancelButton: true,
      confirmButtonText: "Rechazar",
      confirmButtonColor: "#E24B4A",
    });
    if (!isConfirmed) return;

    setResolviendoId(sol._id);
    try {
      await patchRechazarSolicitudMembresia(sol._id, motivo || "");
      Swal.fire("Listo", "Solicitud rechazada", "success");
      cargarSolicitudes();
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo rechazar la solicitud",
        "error",
      );
    } finally {
      setResolviendoId(null);
    }
  };

  const handleBuscar = () => cargar(soloActivas ? { activas: "true" } : {});

  const membresiasFiltradas = membresias.filter((m) => {
    const nombreCompleto = `${m.cliente?.nombre || ""} ${m.cliente?.apellido || ""} ${
      m.cliente?.email || ""
    }`.toLowerCase();
    return nombreCompleto.includes(busqueda.toLowerCase());
  });

  const activasCount = membresias.filter((m) => m.activa && diasRestantes(m.fechaFin) > 0).length;
  const vencidasCount = membresias.filter((m) => !m.activa || diasRestantes(m.fechaFin) <= 0).length;
  const porVencerCount = membresias.filter(
    (m) => m.activa && diasRestantes(m.fechaFin) > 0 && diasRestantes(m.fechaFin) <= 7,
  ).length;

  const abrirModal = () => {
    setClienteSeleccionado(null);
    setPlanId("");
    setModal(true);
  };

  const handleAsignar = async () => {
    if (!clienteSeleccionado || !planId) {
      Swal.fire("Error", "Busca un cliente por su RUT y selecciona un plan", "error");
      return;
    }
    setGuardando(true);
    try {
      await postCrearMembresia({ clienteId: clienteSeleccionado._id, planId });
      Swal.fire("Listo", "Mensualidad registrada correctamente", "success");
      setModal(false);
      cargar(soloActivas ? { activas: "true" } : {});
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo registrar la mensualidad",
        "error",
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = async (m) => {
    const confirmar = await Swal.fire({
      title: "¿Cancelar mensualidad?",
      text: `${m.cliente?.nombre || ""} ${m.cliente?.apellido || ""} — ${m.nombrePlan}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    });
    if (!confirmar.isConfirmed) return;

    try {
      await patchCancelarMembresia(m._id);
      Swal.fire("Listo", "Mensualidad cancelada", "success");
      cargar(soloActivas ? { activas: "true" } : {});
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo cancelar la mensualidad",
        "error",
      );
    }
  };

  const planesActivos = planes.filter((p) => p.activo);

  return (
    <>
      <UserHeader />

      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col xl="11" style={S.page}>
            {/* ── Panel de pagos: solicitudes de membresía por estado ── */}
            <div style={{ ...S.card, marginBottom: 24 }}>
              <div style={S.cardHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ ...S.iconWrap, background: "#FFF3CD" }}>
                    <i className="ni ni-bell-55" style={{ color: "#856404", fontSize: 18 }} />
                  </div>
                  <div>
                    <p style={S.title}>Panel de pagos</p>
                    <p style={S.subtitle}>
                      Solicitudes de membresía (checkout web y clientes logueados)
                    </p>
                  </div>
                </div>
                {solicitudes.length > 0 && (
                  <span
                    style={{
                      background: "#FFF3CD",
                      color: "#856404",
                      borderRadius: 99,
                      padding: "4px 12px",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {solicitudes.length}
                  </span>
                )}
              </div>

              {/* Tabs de estado */}
              <div style={{ ...S.filterBar, borderBottom: "1px solid #f0f0f0" }}>
                {[
                  { key: "pendiente", label: "Pendientes" },
                  { key: "aprobada", label: "Aprobadas" },
                  { key: "rechazada", label: "Rechazadas" },
                  { key: "todas", label: "Todas" },
                ].map((t) => (
                  <button
                    key={t.key}
                    style={estadoFiltro === t.key ? S.btnPrimary : S.btnSecondary}
                    onClick={() => setEstadoFiltro(t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {loadingSolicitudes ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <Spinner color="primary" />
                </div>
              ) : solicitudes.length === 0 ? (
                <div style={S.emptyState}>
                  <p style={{ fontSize: 13, color: "#8898aa" }}>
                    No hay solicitudes en este estado.
                  </p>
                </div>
              ) : (
                <div style={S.tableWrap}>
                  <table style={S.table}>
                    <thead>
                      <tr>
                        <th style={S.th}>Cliente</th>
                        <th style={S.th}>RUT</th>
                        <th style={S.th}>Plan</th>
                        <th style={S.th}>Método</th>
                        <th style={S.th}>Solicitada</th>
                        <th style={S.th}>Comprobante</th>
                        <th style={S.th}>Estado</th>
                        <th style={S.th}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {solicitudes.map((sol) => (
                        <tr key={sol._id}>
                          <td style={S.td}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={S.avatar}>{iniciales(sol.cliente)}</div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 13 }}>
                                  {sol.cliente?.nombre} {sol.cliente?.apellido}
                                </div>
                                <div style={{ fontSize: 11, color: "#8898aa" }}>
                                  {sol.cliente?.email || sol.cliente?.telefono}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ ...S.td, fontSize: 12 }}>{sol.cliente?.rut || "—"}</td>
                          <td style={S.td}>
                            {sol.nombrePlan}
                            <div style={{ fontSize: 11, color: "#8898aa" }}>
                              {formatoPesos(sol.precio)}
                            </div>
                          </td>
                          <td style={S.td}>
                            <span
                              style={{
                                padding: "3px 10px",
                                borderRadius: 99,
                                fontSize: 11,
                                fontWeight: 500,
                                background:
                                  sol.metodo === "transferencia"
                                    ? "#E6F0FF"
                                    : sol.metodo === "whatsapp"
                                      ? "#E6F9F0"
                                      : "#EAFBF1",
                                color:
                                  sol.metodo === "transferencia"
                                    ? "#2D5FA3"
                                    : sol.metodo === "whatsapp"
                                      ? "#1A7A4A"
                                      : "#1A7A4A",
                              }}
                            >
                              {sol.metodo === "transferencia"
                                ? "Transferencia"
                                : sol.metodo === "whatsapp"
                                  ? "WhatsApp"
                                  : "Efectivo"}
                            </span>
                          </td>
                          <td style={{ ...S.td, color: "#8898aa", fontSize: 12 }}>
                            {formatFechaHora(sol.createdAt)}
                          </td>
                          <td style={S.td}>
                            {sol.comprobante?.url ? (
                              <a
                                href={sol.comprobante.url}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "#534AB7", fontWeight: 500, fontSize: 12 }}
                              >
                                Ver comprobante
                              </a>
                            ) : (
                              <span style={{ fontSize: 12, color: "#8898aa" }}>—</span>
                            )}
                          </td>
                          <td style={S.td}>
                            {sol.estado === "pendiente" ? (
                              <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 500, background: "#FFF3CD", color: "#856404" }}>
                                Pendiente
                              </span>
                            ) : sol.estado === "aprobada" ? (
                              <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 500, background: "#E6F9F0", color: "#1A7A4A" }}>
                                Aprobada
                              </span>
                            ) : (
                              <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 500, background: "#FCEBEB", color: "#A32D2D" }}>
                                Rechazada
                              </span>
                            )}
                            {sol.estado !== "pendiente" && sol.fechaResolucion && (
                              <div style={{ fontSize: 10, color: "#8898aa", marginTop: 2 }}>
                                {formatFechaHora(sol.fechaResolucion)}
                              </div>
                            )}
                            {sol.estado === "rechazada" && sol.motivoRechazo && (
                              <div style={{ fontSize: 10, color: "#A32D2D", marginTop: 2, maxWidth: 160 }}>
                                {sol.motivoRechazo}
                              </div>
                            )}
                          </td>
                          <td style={S.td}>
                            {sol.estado === "pendiente" && (
                              <div style={{ display: "flex", gap: 6 }}>
                                <button
                                  style={{
                                    background: "#2dce89",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 8,
                                    padding: "5px 12px",
                                    fontSize: 12,
                                    cursor: "pointer",
                                  }}
                                  disabled={resolviendoId === sol._id}
                                  onClick={() => handleAprobarSolicitud(sol)}
                                >
                                  Aprobar
                                </button>
                                <button
                                  style={{
                                    background: "transparent",
                                    color: "#E24B4A",
                                    border: "1px solid #F5C2C2",
                                    borderRadius: 8,
                                    padding: "5px 12px",
                                    fontSize: 12,
                                    cursor: "pointer",
                                  }}
                                  disabled={resolviendoId === sol._id}
                                  onClick={() => handleRechazarSolicitud(sol)}
                                >
                                  Rechazar
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div style={S.card}>
              {/* ── Header ── */}
              <div style={S.cardHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={S.iconWrap}>
                    <i className="ni ni-credit-card" style={{ color: "#534AB7", fontSize: 18 }} />
                  </div>
                  <div>
                    <p style={S.title}>Membresías</p>
                    <p style={S.subtitle}>Mensualidades de clases y su consumo</p>
                  </div>
                </div>
                <button style={S.btnPrimary} onClick={abrirModal}>
                  + Nueva mensualidad
                </button>
              </div>

              {/* ── Stats ── */}
              <div style={S.statsGrid}>
                {[
                  { label: "Total", value: membresias.length },
                  { label: "Activas", value: activasCount },
                  { label: "Por vencer", value: porVencerCount },
                  { label: "Vencidas", value: vencidasCount },
                ].map((s) => (
                  <div key={s.label} style={S.statCard}>
                    <div style={S.statLabel}>{s.label}</div>
                    <div style={S.statValue}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* ── Filtros ── */}
              <div style={S.filterBar}>
                <input
                  style={S.input}
                  placeholder="Buscar por cliente o email..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    color: "#525f7f",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={soloActivas}
                    onChange={(e) => setSoloActivas(e.target.checked)}
                  />
                  Solo activas
                </label>
                <button style={S.btnPrimary} onClick={handleBuscar}>
                  Buscar
                </button>
                <button
                  style={S.btnSecondary}
                  onClick={() => {
                    setSoloActivas(true);
                    setBusqueda("");
                    cargar({ activas: "true" });
                  }}
                >
                  Reiniciar
                </button>
              </div>

              {/* ── Contenido ── */}
              {loading ? (
                <div style={{ textAlign: "center", padding: "3rem" }}>
                  <Spinner color="primary" />
                </div>
              ) : membresiasFiltradas.length === 0 ? (
                <div style={S.emptyState}>
                  <div style={S.emptyIcon}>
                    <i className="ni ni-credit-card" style={{ color: "#534AB7", fontSize: 24 }} />
                  </div>
                  <p style={{ fontWeight: 600, color: "#1a1a2e", marginBottom: 4 }}>
                    No hay mensualidades para mostrar
                  </p>
                  <p style={{ fontSize: 13, color: "#8898aa" }}>
                    Prueba quitando el filtro de activas o registra una nueva mensualidad.
                  </p>
                </div>
              ) : isMobile ? (
                <CardsMobile membresias={membresiasFiltradas} onCancelar={handleCancelar} />
              ) : (
                <TablaDesktop membresias={membresiasFiltradas} onCancelar={handleCancelar} />
              )}
            </div>
          </Col>
        </Row>
      </Container>

      {/* MODAL ASIGNAR MENSUALIDAD */}
      <Modal isOpen={modal} toggle={() => setModal(!modal)} centered>
        <ModalHeader toggle={() => setModal(!modal)}>Nueva mensualidad</ModalHeader>
        <ModalBody>
          <Form>
            <BuscadorClientePorRut
              clienteSeleccionado={clienteSeleccionado}
              onSeleccionar={setClienteSeleccionado}
              onLimpiarSeleccion={() => setClienteSeleccionado(null)}
            />

            <FormGroup>
              <label>Plan</label>
              <Input type="select" value={planId} onChange={(e) => setPlanId(e.target.value)}>
                <option value="">Selecciona un plan</option>
                {planesActivos.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.nombre} — {p.clasesIncluidas} clases{p.tipoCiclo === "mensual" ? "/mes" : " en total"} — {formatoPesos(p.precio)}
                  </option>
                ))}
              </Input>
              {planesActivos.length === 0 && (
                <small className="text-muted">
                  No hay planes activos. Crea uno primero en "Planes de membresía".
                </small>
              )}
            </FormGroup>

            <Button block color="primary" disabled={guardando} onClick={handleAsignar} type="button">
              {guardando ? "Guardando..." : "Registrar mensualidad"}
            </Button>
          </Form>
        </ModalBody>
      </Modal>
    </>
  );
};

export default GestionMembresias;

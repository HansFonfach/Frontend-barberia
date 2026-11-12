import React, { useCallback, useEffect, useState } from "react";
import { Col, Container, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner } from "reactstrap";
import Swal from "sweetalert2";
import UserHeader from "components/Headers/UserHeader";
import { useEmpresa } from "context/EmpresaContext";
import { obtenerTemaEmpresa } from "utils/temaEmpresa";
import {
  aprobarGiftcard,
  anularGiftcard,
  getConfigGiftcards,
  getGiftcard,
  getGiftcards,
  postGiftcard,
  putConfigGiftcards,
  rechazarGiftcard,
  reenviarGiftcard,
} from "api/giftcards";
import TarjetaGiftcard, { clp, fechaGiftcard } from "components/giftcards/TarjetaGiftcard";

/**
 * Giftcards del negocio: revisar solicitudes (comprobante → aprobar o
 * rechazar), ver las activas/usadas, vender una en el local y ajustes.
 */

const SITIO = "https://www.agendafonfach.cl";
const MORADO = "#534AB7";

const ESTADOS = {
  pendiente: { texto: "Por revisar", bg: "#FFF3CD", color: "#856404" },
  activa: { texto: "Activa", bg: "#E6F9F0", color: "#1A7A4A" },
  usada: { texto: "Usada", bg: "#E8F1FD", color: "#1D5FB8" },
  vencida: { texto: "Vencida", bg: "#f0f0f0", color: "#6b7280" },
  rechazada: { texto: "Rechazada", bg: "#FCEBEB", color: "#A32D2D" },
  anulada: { texto: "Anulada", bg: "#FCEBEB", color: "#A32D2D" },
};

const PESTANAS = [
  ["pendiente", "Por revisar"],
  ["activa", "Activas"],
  ["usada", "Usadas"],
  ["vencida", "Vencidas"],
  ["todas", "Todas"],
];

const S = {
  card: { background: "#fff", borderRadius: 16, border: "1px solid #e9ecef", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden" },
  header: { padding: "1.25rem 1.5rem", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 },
  btn: { background: MORADO, color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  btnSec: { background: "#fff", color: "#525f7f", border: "1px solid #e9ecef", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer" },
  stats: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, padding: "1rem 1.5rem", background: "#fafafa", borderBottom: "1px solid #f0f0f0" },
  stat: { background: "#fff", border: "1px solid #e9ecef", borderRadius: 10, padding: "10px 14px" },
  statLabel: { fontSize: 11, color: "#8898aa", textTransform: "uppercase", letterSpacing: "0.04em" },
  statValue: { fontSize: 20, fontWeight: 700, color: "#1a1a2e" },
  th: { padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "#8898aa", textTransform: "uppercase", letterSpacing: "0.05em", background: "#fafafa", borderBottom: "1px solid #f0f0f0", textAlign: "left", whiteSpace: "nowrap" },
  td: { padding: "12px 14px", borderBottom: "1px solid #f5f5f5", fontSize: 13, color: "#1a1a2e", verticalAlign: "middle" },
};

const Pastilla = ({ estado }) => {
  const e = ESTADOS[estado] || { texto: estado, bg: "#f0f0f0", color: "#525f7f" };
  return (
    <span style={{ background: e.bg, color: e.color, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
      {e.texto}
    </span>
  );
};

// Para lo que va dentro del html de Swal (datos escritos por clientes)
const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const valorDe = (g) => (g.tipo === "servicio" ? g.servicioNombre : clp(g.monto));
const saldoDe = (g) => (g.tipo === "monto" && g.estadoActual === "activa" && g.saldo !== g.monto ? `queda ${clp(g.saldo)}` : "");
const fechaHora = (d) =>
  new Date(d).toLocaleString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "America/Santiago" });

const copiarTexto = async (texto, aviso = "Copiado") => {
  try {
    await navigator.clipboard.writeText(texto);
    Swal.fire({ toast: true, position: "top-end", icon: "success", title: aviso, showConfirmButton: false, timer: 1400 });
  } catch {
    Swal.fire("Copia este texto", texto, "info");
  }
};

const FORM_VACIO = {
  tipo: "servicio", servicioId: "", monto: "", destinatarioNombre: "", destinatarioEmail: "", de: "", mensaje: "",
  compradorNombre: "", compradorEmail: "", compradorTelefono: "", metodo: "efectivo",
};

const GestionGiftcards = () => {
  const { empresa } = useEmpresa();
  const slug = empresa?.slug;
  const theme = obtenerTemaEmpresa(empresa, slug);

  const [pestana, setPestana] = useState("pendiente");
  const [items, setItems] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [config, setConfig] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [detalle, setDetalle] = useState(null); // { giftcard, usos }
  const [modalAjustes, setModalAjustes] = useState(false);
  const [modalNueva, setModalNueva] = useState(false);
  const [formAjustes, setFormAjustes] = useState(null);
  const [formNueva, setFormNueva] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const r = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [lista, cfg] = await Promise.all([getGiftcards(pestana), getConfigGiftcards()]);
      setItems(lista.data.items || []);
      setResumen(lista.data.resumen || null);
      setConfig(cfg.data);
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  }, [pestana]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const linkPublico = slug ? `${SITIO}/${slug}/regalar` : "";
  const cfg = config?.configuracion;

  /* ───── acciones ───── */
  const abrirDetalle = async (g) => {
    try {
      const { data } = await getGiftcard(g._id);
      setDetalle(data);
    } catch {
      Swal.fire("Error", "No se pudo abrir la giftcard", "error");
    }
  };

  const aprobar = async (g) => {
    const destinos = esc([g.comprador?.email, g.destinatario?.email].filter(Boolean).join(" y "));
    const r = await Swal.fire({
      title: `¿Te llegó la transferencia de ${clp(g.monto)}?`,
      html: `Revisa el comprobante antes de aprobar.<br/><small>Al aprobar se genera el código y se envía la giftcard${destinos ? ` a ${destinos}` : ""}.</small>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1A7A4A",
      confirmButtonText: "Sí, aprobar y enviar",
      cancelButtonText: "Cancelar",
    });
    if (!r.isConfirmed) return;
    try {
      const { data } = await aprobarGiftcard(g._id);
      Swal.fire({
        icon: "success",
        title: "Giftcard aprobada",
        html: `Código <b>${esc(data.giftcard.codigo)}</b>${data.correoEnviado ? "<br/>Se envió por correo." : "<br/><small>No se pudo enviar el correo: comparte el link desde el detalle.</small>"}`,
      });
      cargar();
    } catch (e) {
      Swal.fire("Error", e?.response?.data?.message || "No se pudo aprobar", "error");
    }
  };

  const rechazar = async (g) => {
    const r = await Swal.fire({
      title: "Rechazar solicitud",
      text: `Se le avisará por correo a ${g.comprador?.nombre || "quien la pidió"}.`,
      input: "text",
      inputPlaceholder: "Motivo (ej: no llegó la transferencia)",
      inputAttributes: { maxlength: 200 },
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Rechazar",
      cancelButtonText: "Cancelar",
    });
    if (!r.isConfirmed) return;
    try {
      await rechazarGiftcard(g._id, r.value || "");
      cargar();
    } catch (e) {
      Swal.fire("Error", e?.response?.data?.message || "No se pudo rechazar", "error");
    }
  };

  const anular = async (g) => {
    const r = await Swal.fire({
      title: "¿Anular esta giftcard?",
      text: "Dejará de servir para nuevas reservas. Las reservas ya hechas con ella se mantienen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Anular",
      cancelButtonText: "Cancelar",
    });
    if (!r.isConfirmed) return;
    try {
      await anularGiftcard(g._id);
      setDetalle(null);
      cargar();
    } catch (e) {
      Swal.fire("Error", e?.response?.data?.message || "No se pudo anular", "error");
    }
  };

  const reenviar = async (g) => {
    try {
      await reenviarGiftcard(g._id);
      Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Correo reenviado", showConfirmButton: false, timer: 1500 });
    } catch (e) {
      Swal.fire("Error", e?.response?.data?.message || "No se pudo reenviar", "error");
    }
  };

  const abrirAjustes = () => {
    setFormAjustes({ ...cfg });
    setModalAjustes(true);
  };

  const guardarAjustes = async () => {
    setGuardando(true);
    try {
      await putConfigGiftcards({
        ...formAjustes,
        montoMinimo: Number(formAjustes.montoMinimo),
        montoMaximo: Number(formAjustes.montoMaximo),
        mesesVigencia: Number(formAjustes.mesesVigencia),
      });
      setModalAjustes(false);
      cargar();
    } catch (e) {
      Swal.fire("Error", e?.response?.data?.message || "No se pudo guardar", "error");
    } finally {
      setGuardando(false);
    }
  };

  const crearNueva = async () => {
    setGuardando(true);
    try {
      const { data } = await postGiftcard({ ...formNueva, monto: Number(String(formNueva.monto).replace(/\D/g, "")) });
      setModalNueva(false);
      setFormNueva(FORM_VACIO);
      const link = `${SITIO}/${slug}/giftcard/${data.giftcard.codigo}`;
      const r = await Swal.fire({
        icon: "success",
        title: "Giftcard creada",
        html: `Código <b>${esc(data.giftcard.codigo)}</b><br/>${data.correoEnviado ? "Se envió por correo." : "Comparte el link con quien la recibe."}`,
        showCancelButton: true,
        confirmButtonText: "Copiar link",
        cancelButtonText: "Listo",
      });
      if (r.isConfirmed) copiarTexto(link, "Link copiado");
      setPestana("activa");
      cargar();
    } catch (e) {
      Swal.fire("Error", e?.response?.data?.message || "No se pudo crear la giftcard", "error");
    } finally {
      setGuardando(false);
    }
  };

  /* ───── piezas ───── */
  const accionesPendiente = (g) => (
    <div className="d-flex flex-wrap" style={{ gap: 6 }} onClick={(e) => e.stopPropagation()}>
      {g.pago?.comprobante?.url && (
        <a href={g.pago.comprobante.url} target="_blank" rel="noopener noreferrer" style={{ ...S.btnSec, textDecoration: "none" }}>
          Ver comprobante
        </a>
      )}
      <button type="button" style={{ ...S.btn, background: "#1A7A4A" }} onClick={() => aprobar(g)}>
        Aprobar
      </button>
      <button type="button" style={{ ...S.btnSec, color: "#A32D2D" }} onClick={() => rechazar(g)}>
        Rechazar
      </button>
    </div>
  );

  const vacio = (
    <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#8898aa" }}>
      <div style={{ fontSize: 36 }}>🎁</div>
      <p style={{ fontWeight: 600, color: "#1a1a2e", marginBottom: 4 }}>
        {pestana === "pendiente" ? "No hay solicitudes por revisar" : "No hay giftcards acá"}
      </p>
      <p style={{ fontSize: 13, marginBottom: 0 }}>
        {cfg?.activa ? "Comparte el link de tu página de giftcards para empezar a venderlas." : "Activa las giftcards en Ajustes para que aparezcan en tu página."}
      </p>
    </div>
  );

  const tabla = (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={S.th}>Fecha</th>
            <th style={S.th}>Para / De</th>
            <th style={S.th}>Regalo</th>
            <th style={S.th}>Compró</th>
            <th style={S.th}>Estado</th>
            <th style={S.th} />
          </tr>
        </thead>
        <tbody>
          {items.map((g) => (
            <tr key={g._id} style={{ cursor: "pointer" }} onClick={() => g.estadoActual !== "pendiente" && abrirDetalle(g)}>
              <td style={{ ...S.td, color: "#8898aa", whiteSpace: "nowrap" }}>{fechaGiftcard(g.createdAt)}</td>
              <td style={S.td}>
                <div style={{ fontWeight: 600 }}>{g.destinatario?.nombre}</div>
                <div style={{ fontSize: 11, color: "#8898aa" }}>de {g.de || g.comprador?.nombre || "—"}</div>
              </td>
              <td style={S.td}>
                <div style={{ fontWeight: 600 }}>{valorDe(g)}</div>
                <div style={{ fontSize: 11, color: "#8898aa" }}>
                  {[g.tipo === "servicio" ? clp(g.monto) : "", g.codigo, saldoDe(g)].filter(Boolean).join(" · ")}
                </div>
              </td>
              <td style={S.td}>
                <div>{g.comprador?.nombre || "—"}</div>
                <div style={{ fontSize: 11, color: "#8898aa" }}>{g.origen === "panel" ? "Venta en el local" : g.comprador?.email}</div>
              </td>
              <td style={S.td}>
                <Pastilla estado={g.estadoActual} />
              </td>
              <td style={{ ...S.td, whiteSpace: "nowrap" }}>
                {g.estadoActual === "pendiente" ? accionesPendiente(g) : <span style={{ color: MORADO, fontWeight: 600, fontSize: 12 }}>Ver ›</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const tarjetas = (
    <div style={{ padding: "1rem" }}>
      {items.map((g) => (
        <div
          key={g._id}
          onClick={() => g.estadoActual !== "pendiente" && abrirDetalle(g)}
          style={{ border: "1px solid #e9ecef", borderRadius: 12, padding: 14, marginBottom: 10, cursor: "pointer" }}
        >
          <div className="d-flex justify-content-between align-items-start" style={{ gap: 8 }}>
            <div>
              <div style={{ fontWeight: 700 }}>{valorDe(g)}</div>
              <div style={{ fontSize: 12, color: "#8898aa" }}>
                Para {g.destinatario?.nombre} · de {g.de || g.comprador?.nombre}
              </div>
            </div>
            <Pastilla estado={g.estadoActual} />
          </div>
          <div style={{ fontSize: 12, color: "#8898aa", marginTop: 6 }}>
            {fechaGiftcard(g.createdAt)} · {g.origen === "panel" ? "Venta en el local" : g.comprador?.email}
            {g.codigo ? ` · ${g.codigo}` : ""} {saldoDe(g) ? ` · ${saldoDe(g)}` : ""}
          </div>
          {g.estadoActual === "pendiente" && <div style={{ marginTop: 10 }}>{accionesPendiente(g)}</div>}
        </div>
      ))}
    </div>
  );

  const nf = formNueva;
  const setNf = (campo) => (e) => setFormNueva((f) => ({ ...f, [campo]: e.target.value }));
  const fa = formAjustes;
  const setFa = (campo, valor) => setFormAjustes((f) => ({ ...f, [campo]: valor }));
  const g = detalle?.giftcard;

  return (
    <>
      <UserHeader />
      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col xl="11" style={{ padding: "1.5rem 0" }}>
            <div style={S.card}>
              <div style={S.header}>
                <div className="d-flex align-items-center" style={{ gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                    🎁
                  </div>
                  <div>
                    <p style={{ fontSize: 17, fontWeight: 600, color: "#1a1a2e", margin: 0 }}>Giftcards</p>
                    <p style={{ fontSize: 12, color: "#8898aa", margin: 0 }}>Solicitudes, giftcards vendidas y su uso</p>
                  </div>
                </div>
                <div className="d-flex flex-wrap" style={{ gap: 8 }}>
                  <button type="button" style={S.btnSec} onClick={abrirAjustes} disabled={!cfg}>
                    ⚙️ Ajustes
                  </button>
                  <button type="button" style={S.btn} onClick={() => setModalNueva(true)} disabled={!config}>
                    + Venta en el local
                  </button>
                </div>
              </div>

              {cfg && !cfg.activa && (
                <div style={{ padding: "12px 1.5rem", background: "#FFF8E1", borderBottom: "1px solid #ffe082", fontSize: 13 }}>
                  Las giftcards están <strong>apagadas</strong>: tus clientes todavía no las ven en tu página.{" "}
                  <button type="button" className="btn btn-link btn-sm p-0" onClick={abrirAjustes}>
                    Activarlas
                  </button>
                </div>
              )}
              {cfg?.activa && (
                <div style={{ padding: "12px 1.5rem", background: "#F4F3FF", borderBottom: "1px solid #e6e3ff", fontSize: 13 }} className="d-flex flex-wrap align-items-center">
                  <span className="mr-2">Tu página de giftcards:</span>
                  <a href={linkPublico} target="_blank" rel="noopener noreferrer" className="mr-2" style={{ wordBreak: "break-all" }}>
                    {linkPublico}
                  </a>
                  <button type="button" className="btn btn-link btn-sm p-0" onClick={() => copiarTexto(linkPublico, "Link copiado")}>
                    Copiar
                  </button>
                  {!config?.transferenciaLista && (
                    <span className="text-danger ml-md-2">· Falta configurar tus datos de transferencia (Configuración → Pagos)</span>
                  )}
                </div>
              )}

              {resumen && (
                <div style={S.stats}>
                  {[
                    ["Por revisar", resumen.pendientes],
                    ["Activas", resumen.activas],
                    ["Usadas", resumen.usadas],
                    ["Vendido", clp(resumen.vendido)],
                    ["Saldo por usar", clp(resumen.saldoPorUsar)],
                  ].map(([l, v]) => (
                    <div key={l} style={S.stat}>
                      <div style={S.statLabel}>{l}</div>
                      <div style={S.statValue}>{v}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="d-flex flex-wrap" style={{ gap: 6, padding: "12px 1.5rem", borderBottom: "1px solid #f0f0f0" }}>
                {PESTANAS.map(([valor, etiqueta]) => (
                  <button
                    key={valor}
                    type="button"
                    onClick={() => setPestana(valor)}
                    style={{
                      border: "1px solid " + (pestana === valor ? MORADO : "#e9ecef"),
                      background: pestana === valor ? MORADO : "#fff",
                      color: pestana === valor ? "#fff" : "#525f7f",
                      borderRadius: 99,
                      padding: "5px 14px",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {etiqueta}
                    {valor === "pendiente" && resumen?.pendientes ? ` (${resumen.pendientes})` : ""}
                  </button>
                ))}
              </div>

              {cargando ? (
                <div style={{ textAlign: "center", padding: "3rem" }}>
                  <Spinner color="primary" />
                </div>
              ) : !items.length ? (
                vacio
              ) : isMobile ? (
                tarjetas
              ) : (
                tabla
              )}
            </div>
          </Col>
        </Row>
      </Container>

      {/* ───── Detalle ───── */}
      <Modal isOpen={!!detalle} toggle={() => setDetalle(null)} scrollable>
        <ModalHeader toggle={() => setDetalle(null)}>Giftcard {g?.codigo}</ModalHeader>
        {g && (
          <ModalBody>
            <TarjetaGiftcard
              nombreNegocio={empresa?.nombre}
              logo={empresa?.logo}
              color={theme.primary}
              colorOscuro={theme.primaryDark}
              valor={valorDe(g)}
              detalleValor={g.tipo === "monto" ? `Saldo ${clp(g.saldo)} de ${clp(g.monto)}` : ""}
              para={g.destinatario?.nombre}
              de={g.de}
              mensaje={g.mensaje}
              codigo={g.codigo}
              venceEn={g.venceEn}
              estado={g.estadoActual}
            />
            <div className="mt-3" style={{ fontSize: 13 }}>
              <div className="d-flex justify-content-between py-1 border-bottom"><span className="text-muted">Estado</span><Pastilla estado={g.estadoActual} /></div>
              <div className="d-flex justify-content-between py-1 border-bottom"><span className="text-muted">Valor pagado</span><strong>{clp(g.monto)}</strong></div>
              <div className="d-flex justify-content-between py-1 border-bottom">
                <span className="text-muted">Compró</span>
                <span className="text-right">{g.comprador?.nombre || "—"}<br /><small className="text-muted">{[g.comprador?.email, g.comprador?.telefono].filter(Boolean).join(" · ")}</small></span>
              </div>
              {g.destinatario?.email && (
                <div className="d-flex justify-content-between py-1 border-bottom"><span className="text-muted">Correo de quien la recibe</span><span>{g.destinatario.email}</span></div>
              )}
              <div className="d-flex justify-content-between py-1 border-bottom">
                <span className="text-muted">Pago</span>
                <span>
                  {g.origen === "panel" ? `Venta en el local · ${g.pago?.metodo || ""}` : "Transferencia desde la web"}
                  {g.pago?.comprobante?.url && <> · <a href={g.pago.comprobante.url} target="_blank" rel="noopener noreferrer">comprobante</a></>}
                </span>
              </div>
              {g.aprobadaEn && <div className="d-flex justify-content-between py-1 border-bottom"><span className="text-muted">Aprobada</span><span>{fechaHora(g.aprobadaEn)}</span></div>}
              {g.rechazo?.motivo && <div className="d-flex justify-content-between py-1 border-bottom"><span className="text-muted">Motivo del rechazo</span><span>{g.rechazo.motivo}</span></div>}
            </div>

            <div className="mt-3">
              <div style={{ fontSize: 11, fontWeight: 700, color: "#8898aa", textTransform: "uppercase", letterSpacing: ".05em" }}>
                Reservas con esta giftcard ({detalle.usos.length})
              </div>
              {detalle.usos.length === 0 ? (
                <div className="text-muted small py-2">Todavía no se usa.</div>
              ) : (
                detalle.usos.map((u) => (
                  <div key={u._id} className="d-flex justify-content-between py-2 border-bottom" style={{ fontSize: 13, opacity: u.cuenta ? 1 : 0.6 }}>
                    <span>
                      <strong>{fechaHora(u.fecha)}</strong> · {u.servicio}
                      <br />
                      <small className="text-muted">{[u.cliente, u.barbero && `con ${u.barbero}`].filter(Boolean).join(" · ")}{!u.cuenta ? ` · ${u.estado} (no descuenta)` : ""}</small>
                    </span>
                    <strong>{clp(u.montoAplicado)}</strong>
                  </div>
                ))
              )}
            </div>
          </ModalBody>
        )}
        {g && (
          <ModalFooter className="d-flex flex-wrap justify-content-between" style={{ gap: 8 }}>
            <div className="d-flex flex-wrap" style={{ gap: 8 }}>
              {g.codigo && (
                <button type="button" style={S.btnSec} onClick={() => copiarTexto(`${SITIO}/${slug}/giftcard/${g.codigo}`, "Link copiado")}>
                  Copiar link
                </button>
              )}
              {g.estado === "activa" && (g.comprador?.email || g.destinatario?.email) && (
                <button type="button" style={S.btnSec} onClick={() => reenviar(g)}>
                  Reenviar correo
                </button>
              )}
            </div>
            {g.estado === "activa" && (
              <button type="button" style={{ ...S.btnSec, color: "#A32D2D" }} onClick={() => anular(g)}>
                Anular
              </button>
            )}
          </ModalFooter>
        )}
      </Modal>

      {/* ───── Ajustes ───── */}
      <Modal isOpen={modalAjustes} toggle={() => setModalAjustes(false)}>
        <ModalHeader toggle={() => setModalAjustes(false)}>Ajustes de giftcards</ModalHeader>
        {fa && (
          <ModalBody>
            <div className="custom-control custom-switch mb-3">
              <input type="checkbox" className="custom-control-input" id="gc-activa" checked={!!fa.activa} onChange={(e) => setFa("activa", e.target.checked)} />
              <label className="custom-control-label" htmlFor="gc-activa">
                <strong>Vender giftcards en mi página</strong>
              </label>
            </div>
            {!config?.transferenciaLista && (
              <div className="alert alert-warning small">
                Para venderlas por la web tus clientes necesitan tus datos de transferencia: configúralos en <strong>Configuración → Pagos</strong>.
              </div>
            )}
            <Label className="d-block">¿Qué se puede regalar?</Label>
            <div className="custom-control custom-checkbox">
              <input type="checkbox" className="custom-control-input" id="gc-serv" checked={!!fa.permitirServicio} onChange={(e) => setFa("permitirServicio", e.target.checked)} />
              <label className="custom-control-label" htmlFor="gc-serv">Un servicio (ej. corte + barba)</label>
            </div>
            <div className="custom-control custom-checkbox mb-3">
              <input type="checkbox" className="custom-control-input" id="gc-monto" checked={!!fa.permitirMonto} onChange={(e) => setFa("permitirMonto", e.target.checked)} />
              <label className="custom-control-label" htmlFor="gc-monto">Un monto libre</label>
            </div>
            {fa.permitirMonto && (
              <Row>
                <Col xs="6">
                  <FormGroup>
                    <Label for="gc-min">Monto mínimo</Label>
                    <Input id="gc-min" type="number" min={1000} step={1000} value={fa.montoMinimo} onChange={(e) => setFa("montoMinimo", e.target.value)} />
                  </FormGroup>
                </Col>
                <Col xs="6">
                  <FormGroup>
                    <Label for="gc-max">Monto máximo</Label>
                    <Input id="gc-max" type="number" min={1000} step={1000} value={fa.montoMaximo} onChange={(e) => setFa("montoMaximo", e.target.value)} />
                  </FormGroup>
                </Col>
              </Row>
            )}
            <FormGroup>
              <Label for="gc-meses">Duración (meses desde que se aprueba)</Label>
              <Input id="gc-meses" type="number" min={1} max={36} value={fa.mesesVigencia} onChange={(e) => setFa("mesesVigencia", e.target.value)} />
            </FormGroup>
            <FormGroup className="mb-0">
              <Label for="gc-inst">Indicaciones para el pago (opcional)</Label>
              <Input id="gc-inst" type="textarea" rows={2} maxLength={300} value={fa.instrucciones} onChange={(e) => setFa("instrucciones", e.target.value)} placeholder="Ej: en el asunto de la transferencia pon 'Giftcard' y tu nombre" />
            </FormGroup>
          </ModalBody>
        )}
        <ModalFooter>
          <button type="button" style={S.btnSec} onClick={() => setModalAjustes(false)}>Cancelar</button>
          <button type="button" style={S.btn} onClick={guardarAjustes} disabled={guardando}>
            {guardando ? <Spinner size="sm" /> : "Guardar"}
          </button>
        </ModalFooter>
      </Modal>

      {/* ───── Venta en el local ───── */}
      <Modal isOpen={modalNueva} toggle={() => setModalNueva(false)} size="lg">
        <ModalHeader toggle={() => setModalNueva(false)}>Nueva giftcard (venta en el local)</ModalHeader>
        <ModalBody>
          <p className="text-muted small">Para cuando te la pagan en el local o por transferencia directa. Queda activa altiro.</p>
          <Row>
            <Col md="6">
              <FormGroup>
                <Label>¿Qué se regala?</Label>
                <Input type="select" value={nf.tipo} onChange={setNf("tipo")}>
                  <option value="servicio">Un servicio</option>
                  <option value="monto">Un monto</option>
                </Input>
              </FormGroup>
            </Col>
            <Col md="6">
              {nf.tipo === "servicio" ? (
                <FormGroup>
                  <Label>Servicio</Label>
                  <Input type="select" value={nf.servicioId} onChange={setNf("servicioId")}>
                    <option value="">Elige…</option>
                    {(config?.servicios || []).map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.nombre} · {clp(s.precio)}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              ) : (
                <FormGroup>
                  <Label>Monto</Label>
                  <Input inputMode="numeric" value={nf.monto} onChange={(e) => setFormNueva((f) => ({ ...f, monto: e.target.value.replace(/\D/g, "") }))} placeholder="Ej: 20000" />
                </FormGroup>
              )}
            </Col>
            <Col md="6">
              <FormGroup>
                <Label>Para (nombre) *</Label>
                <Input value={nf.destinatarioNombre} onChange={setNf("destinatarioNombre")} maxLength={80} />
              </FormGroup>
            </Col>
            <Col md="6">
              <FormGroup>
                <Label>Correo de quien la recibe (opcional)</Label>
                <Input type="email" value={nf.destinatarioEmail} onChange={setNf("destinatarioEmail")} />
              </FormGroup>
            </Col>
            <Col md="6">
              <FormGroup>
                <Label>De (firma)</Label>
                <Input value={nf.de} onChange={setNf("de")} maxLength={80} />
              </FormGroup>
            </Col>
            <Col md="6">
              <FormGroup>
                <Label>Pago</Label>
                <Input type="select" value={nf.metodo} onChange={setNf("metodo")}>
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="otro">Otro (tarjeta, etc.)</option>
                </Input>
              </FormGroup>
            </Col>
            <Col xs="12">
              <FormGroup>
                <Label>Mensaje (opcional)</Label>
                <Input type="textarea" rows={2} maxLength={300} value={nf.mensaje} onChange={setNf("mensaje")} />
              </FormGroup>
            </Col>
            <Col md="4">
              <FormGroup>
                <Label>Quién compra</Label>
                <Input value={nf.compradorNombre} onChange={setNf("compradorNombre")} maxLength={80} />
              </FormGroup>
            </Col>
            <Col md="4">
              <FormGroup>
                <Label>Su correo (opcional)</Label>
                <Input type="email" value={nf.compradorEmail} onChange={setNf("compradorEmail")} />
              </FormGroup>
            </Col>
            <Col md="4">
              <FormGroup>
                <Label>Su teléfono (opcional)</Label>
                <Input value={nf.compradorTelefono} onChange={setNf("compradorTelefono")} maxLength={30} />
              </FormGroup>
            </Col>
          </Row>
          <small className="text-muted">Si pones algún correo, se le envía la giftcard. Si no, después puedes copiar el link y mandarlo por WhatsApp.</small>
        </ModalBody>
        <ModalFooter>
          <button type="button" style={S.btnSec} onClick={() => setModalNueva(false)}>Cancelar</button>
          <button type="button" style={S.btn} onClick={crearNueva} disabled={guardando}>
            {guardando ? <Spinner size="sm" /> : "Crear giftcard"}
          </button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default GestionGiftcards;

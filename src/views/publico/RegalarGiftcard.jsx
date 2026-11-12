import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Col, Container, FormGroup, Input, Label, Row, Spinner } from "reactstrap";
import { useEmpresa } from "context/EmpresaContext";
import { obtenerTemaEmpresa, estiloBotonTema } from "utils/temaEmpresa";
import { getGiftcardsPublico, postSolicitudGiftcard } from "api/giftcards";
import TarjetaGiftcard, { clp } from "components/giftcards/TarjetaGiftcard";

/**
 * Página pública "Regala un servicio": el cliente arma la giftcard, transfiere
 * y sube el comprobante. El negocio la aprueba desde el panel y recién ahí se
 * envía por correo.
 */

const SUGERIDOS = [10000, 15000, 20000, 30000, 50000];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Seccion = ({ numero, titulo, color, children }) => (
  <div className="bg-white rounded shadow-sm p-3 p-md-4 mb-3" style={{ borderRadius: 16 }}>
    <div className="d-flex align-items-center mb-3" style={{ gap: 10 }}>
      <span
        style={{
          width: 28, height: 28, borderRadius: "50%", background: color, color: "#fff",
          display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14,
        }}
      >
        {numero}
      </span>
      <h2 className="h5 mb-0" style={{ fontWeight: 700 }}>{titulo}</h2>
    </div>
    {children}
  </div>
);

const FilaCopiable = ({ etiqueta, valor }) => {
  const [copiado, setCopiado] = useState(false);
  if (!valor) return null;
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      /* sin portapapeles: no pasa nada */
    }
  };
  return (
    <div className="d-flex justify-content-between align-items-center py-1 border-bottom" style={{ gap: 8, fontSize: 14 }}>
      <span className="text-muted">{etiqueta}</span>
      <span className="d-flex align-items-center" style={{ gap: 6, minWidth: 0 }}>
        <strong style={{ wordBreak: "break-all", textAlign: "right" }}>{valor}</strong>
        <button type="button" onClick={copiar} className="btn btn-link btn-sm p-0" style={{ fontSize: 12, whiteSpace: "nowrap" }}>
          {copiado ? "¡Copiado!" : "Copiar"}
        </button>
      </span>
    </div>
  );
};

const RegalarGiftcard = () => {
  const { slug } = useParams();
  const { empresa } = useEmpresa();
  const theme = obtenerTemaEmpresa(empresa, slug);

  const [config, setConfig] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [tipo, setTipo] = useState("servicio");
  const [servicioId, setServicioId] = useState("");
  const [monto, setMonto] = useState("");
  const [form, setForm] = useState({
    destinatarioNombre: "", destinatarioEmail: "", de: "", mensaje: "",
    compradorNombre: "", compradorEmail: "", compradorTelefono: "",
  });
  const [comprobante, setComprobante] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [listo, setListo] = useState(false);

  useEffect(() => {
    let vigente = true;
    getGiftcardsPublico(slug)
      .then(({ data }) => {
        if (!vigente) return;
        setConfig(data);
        if (data.activa && !data.permitirServicio) setTipo("monto");
      })
      .catch(() => vigente && setConfig({ activa: false }))
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [slug]);

  const servicio = config?.servicios?.find((s) => String(s._id) === String(servicioId));
  const montoNumero = Number(String(monto).replace(/\D/g, "")) || 0;
  const total = tipo === "servicio" ? servicio?.precio || 0 : montoNumero;
  const sugeridos = useMemo(
    () => SUGERIDOS.filter((m) => config && m >= config.montoMinimo && m <= config.montoMaximo),
    [config],
  );
  const t = config?.transferencia || {};
  const transferenciaLista = !!(t.banco && t.numeroCuenta && t.titular);

  const cambiar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const validar = () => {
    if (tipo === "servicio" && !servicio) return "Elige el servicio que quieres regalar";
    if (tipo === "monto" && (montoNumero < config.montoMinimo || montoNumero > config.montoMaximo)) {
      return `El monto debe estar entre ${clp(config.montoMinimo)} y ${clp(config.montoMaximo)}`;
    }
    if (!form.destinatarioNombre.trim()) return "Escribe para quién es la giftcard";
    if (form.destinatarioEmail && !EMAIL_RE.test(form.destinatarioEmail.trim())) return "El correo de quien la recibe no es válido";
    if (!form.compradorNombre.trim()) return "Escribe tu nombre";
    if (!EMAIL_RE.test(form.compradorEmail.trim())) return "Escribe tu correo: ahí te llega la giftcard";
    if (!comprobante) return "Sube el comprobante de la transferencia";
    if (comprobante.size > 8 * 1024 * 1024) return "El comprobante no puede pesar más de 8 MB";
    return "";
  };

  const enviar = async (e) => {
    e.preventDefault();
    const problema = validar();
    setError(problema);
    if (problema) return;
    const fd = new FormData();
    fd.append("tipo", tipo);
    if (tipo === "servicio") fd.append("servicioId", servicioId);
    else fd.append("monto", String(montoNumero));
    Object.entries(form).forEach(([k, v]) => fd.append(k, v.trim()));
    fd.append("comprobante", comprobante);
    setEnviando(true);
    try {
      await postSolicitudGiftcard(slug, fd);
      setListo(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo enviar la solicitud. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  const nombreNegocio = empresa?.nombre || "";
  const valorTarjeta = tipo === "servicio" ? servicio?.nombre : montoNumero ? clp(montoNumero) : "";
  const tarjeta = (
    <TarjetaGiftcard
      vistaPrevia
      nombreNegocio={nombreNegocio}
      logo={empresa?.logo}
      color={theme.primary}
      colorOscuro={theme.primaryDark}
      valor={valorTarjeta}
      para={form.destinatarioNombre}
      de={form.de || form.compradorNombre}
      mensaje={form.mensaje}
    />
  );

  const fondo = { minHeight: "100vh", background: theme.softBg || "#f6f7f9" };
  const encabezado = (
    <div className="d-flex align-items-center justify-content-between mb-4" style={{ gap: 10 }}>
      <Link to={`/${slug}`} className="text-muted small">← Volver a {nombreNegocio || "la página"}</Link>
      <span className="small text-muted">🎁 Giftcards</span>
    </div>
  );

  if (cargando) {
    return (
      <div style={fondo} className="d-flex align-items-center justify-content-center">
        <Spinner style={{ color: theme.primary }} />
      </div>
    );
  }

  if (!config?.activa) {
    return (
      <div style={fondo} className="py-5">
        <Container style={{ maxWidth: 560 }}>
          {encabezado}
          <div className="bg-white rounded shadow-sm p-4 text-center">
            <div style={{ fontSize: 44 }}>🎁</div>
            <h1 className="h4">Giftcards no disponibles</h1>
            <p className="text-muted mb-0">{nombreNegocio || "Este negocio"} no está vendiendo giftcards por ahora.</p>
          </div>
        </Container>
      </div>
    );
  }

  if (listo) {
    return (
      <div style={fondo} className="py-5">
        <Container style={{ maxWidth: 560 }}>
          {encabezado}
          <div className="bg-white rounded shadow-sm p-4 text-center">
            <div style={{ fontSize: 44 }}>✅</div>
            <h1 className="h4">¡Solicitud enviada!</h1>
            <p className="text-muted">
              Cuando {nombreNegocio} confirme tu transferencia, te enviaremos la giftcard a <strong>{form.compradorEmail}</strong>
              {form.destinatarioEmail ? <> y también a <strong>{form.destinatarioEmail}</strong></> : null}.
            </p>
            <div className="my-4">{tarjeta}</div>
            <Link to={`/${slug}`} className="btn" style={estiloBotonTema(theme, true)}>
              Volver a {nombreNegocio}
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div style={fondo} className="py-4 py-md-5">
      <Container style={{ maxWidth: 1040 }}>
        {encabezado}
        <div className="mb-4">
          <h1 style={{ fontWeight: 800, fontSize: "2rem", color: theme.textDark }}>Regala {nombreNegocio}</h1>
          <p className="text-muted mb-0">
            Arma tu giftcard, transfiere y sube el comprobante. Cuando el local confirme el pago, la giftcard llega por correo
            {config.mesesVigencia ? ` y dura ${config.mesesVigencia} ${config.mesesVigencia === 1 ? "mes" : "meses"}` : ""}.
          </p>
        </div>

        <Row>
          <Col lg="5" className="order-lg-2 mb-4">
            <div style={{ position: "sticky", top: 20 }}>
              {tarjeta}
              <p className="text-center text-muted small mt-2 mb-0">Así se verá tu giftcard</p>
            </div>
          </Col>

          <Col lg="7" className="order-lg-1">
            <form onSubmit={enviar} noValidate>
              <Seccion numero={1} titulo="¿Qué quieres regalar?" color={theme.primary}>
                {config.permitirServicio && config.permitirMonto && (
                  <div className="d-flex mb-3" style={{ gap: 8 }}>
                    {[
                      ["servicio", "Un servicio"],
                      ["monto", "Un monto"],
                    ].map(([valor, etiqueta]) => (
                      <button
                        key={valor}
                        type="button"
                        className="btn btn-sm flex-fill"
                        style={{ ...estiloBotonTema(theme, tipo === valor), borderRadius: 10, padding: "8px 0" }}
                        onClick={() => setTipo(valor)}
                      >
                        {etiqueta}
                      </button>
                    ))}
                  </div>
                )}

                {tipo === "servicio" ? (
                  config.servicios.length ? (
                    <div className="d-flex flex-column" style={{ gap: 8 }}>
                      {config.servicios.map((s) => {
                        const activo = String(s._id) === String(servicioId);
                        return (
                          <button
                            key={s._id}
                            type="button"
                            onClick={() => setServicioId(s._id)}
                            className="d-flex justify-content-between align-items-center text-left"
                            style={{
                              border: `1.5px solid ${activo ? theme.primary : "#e5e7eb"}`,
                              background: activo ? theme.primaryLight : "#fff",
                              borderRadius: 12,
                              padding: "10px 14px",
                              cursor: "pointer",
                            }}
                          >
                            <span style={{ fontWeight: 600, color: "#1f2937" }}>{s.nombre}</span>
                            <span style={{ fontWeight: 700, color: theme.primary }}>{clp(s.precio)}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted mb-0">Por ahora no hay servicios para regalar.</p>
                  )
                ) : (
                  <>
                    <div className="d-flex flex-wrap mb-2" style={{ gap: 8 }}>
                      {sugeridos.map((m) => (
                        <button
                          key={m}
                          type="button"
                          className="btn btn-sm"
                          style={{ ...estiloBotonTema(theme, montoNumero === m), borderRadius: 999, padding: "6px 14px" }}
                          onClick={() => setMonto(String(m))}
                        >
                          {clp(m)}
                        </button>
                      ))}
                    </div>
                    <Label className="small text-muted mb-1" for="gc-monto">Otro monto</Label>
                    <Input
                      id="gc-monto"
                      inputMode="numeric"
                      placeholder={`Entre ${clp(config.montoMinimo)} y ${clp(config.montoMaximo)}`}
                      value={montoNumero ? montoNumero.toLocaleString("es-CL") : ""}
                      onChange={(e) => setMonto(e.target.value.replace(/\D/g, ""))}
                    />
                  </>
                )}
              </Seccion>

              <Seccion numero={2} titulo="¿Para quién es?" color={theme.primary}>
                <Row>
                  <Col sm="6">
                    <FormGroup>
                      <Label for="gc-para">Nombre *</Label>
                      <Input id="gc-para" value={form.destinatarioNombre} onChange={cambiar("destinatarioNombre")} maxLength={80} />
                    </FormGroup>
                  </Col>
                  <Col sm="6">
                    <FormGroup>
                      <Label for="gc-para-email">Su correo (opcional)</Label>
                      <Input id="gc-para-email" type="email" value={form.destinatarioEmail} onChange={cambiar("destinatarioEmail")} placeholder="Se la enviamos también" />
                    </FormGroup>
                  </Col>
                  <Col sm="6">
                    <FormGroup>
                      <Label for="gc-de">Firma (De)</Label>
                      <Input id="gc-de" value={form.de} onChange={cambiar("de")} maxLength={80} placeholder={form.compradorNombre || "Tu nombre"} />
                    </FormGroup>
                  </Col>
                  <Col xs="12">
                    <FormGroup className="mb-0">
                      <Label for="gc-mensaje">Mensaje (opcional)</Label>
                      <Input id="gc-mensaje" type="textarea" rows={3} maxLength={300} value={form.mensaje} onChange={cambiar("mensaje")} placeholder="¡Feliz Navidad! 🎄" />
                      <small className="text-muted">{form.mensaje.length}/300</small>
                    </FormGroup>
                  </Col>
                </Row>
              </Seccion>

              <Seccion numero={3} titulo="Tus datos" color={theme.primary}>
                <Row>
                  <Col sm="6">
                    <FormGroup>
                      <Label for="gc-nombre">Tu nombre *</Label>
                      <Input id="gc-nombre" value={form.compradorNombre} onChange={cambiar("compradorNombre")} maxLength={80} />
                    </FormGroup>
                  </Col>
                  <Col sm="6">
                    <FormGroup>
                      <Label for="gc-email">Tu correo *</Label>
                      <Input id="gc-email" type="email" value={form.compradorEmail} onChange={cambiar("compradorEmail")} placeholder="Acá te llega la giftcard" />
                    </FormGroup>
                  </Col>
                  <Col sm="6">
                    <FormGroup className="mb-0">
                      <Label for="gc-telefono">Teléfono (opcional)</Label>
                      <Input id="gc-telefono" value={form.compradorTelefono} onChange={cambiar("compradorTelefono")} maxLength={30} />
                    </FormGroup>
                  </Col>
                </Row>
              </Seccion>

              <Seccion numero={4} titulo="Paga por transferencia" color={theme.primary}>
                <div className="d-flex justify-content-between align-items-baseline mb-2">
                  <span className="text-muted">Total a transferir</span>
                  <strong style={{ fontSize: 22, color: theme.primary }}>{total ? clp(total) : "—"}</strong>
                </div>
                {transferenciaLista ? (
                  <div className="mb-3">
                    <FilaCopiable etiqueta="Banco" valor={t.banco} />
                    <FilaCopiable etiqueta="Tipo de cuenta" valor={t.tipoCuenta} />
                    <FilaCopiable etiqueta="N° de cuenta" valor={t.numeroCuenta} />
                    <FilaCopiable etiqueta="Titular" valor={t.titular} />
                    <FilaCopiable etiqueta="RUT" valor={t.rut} />
                    <FilaCopiable etiqueta="Correo" valor={t.correo} />
                  </div>
                ) : (
                  <div className="alert alert-warning small">
                    {nombreNegocio} todavía no publica sus datos de transferencia. Escríbele directamente para comprar tu giftcard.
                  </div>
                )}
                {config.instrucciones && <p className="small text-muted">{config.instrucciones}</p>}

                <Label for="gc-comprobante">Comprobante de la transferencia *</Label>
                <Input
                  id="gc-comprobante"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setComprobante(e.target.files?.[0] || null)}
                />
                <small className="text-muted">Foto o PDF, hasta 8 MB.</small>
              </Seccion>

              {error && <div className="alert alert-danger">{error}</div>}

              <Button
                type="submit"
                block
                size="lg"
                disabled={enviando || !transferenciaLista}
                style={{ ...estiloBotonTema(theme, true), borderRadius: 12 }}
              >
                {enviando ? <Spinner size="sm" /> : `Enviar solicitud${total ? ` · ${clp(total)}` : ""}`}
              </Button>
              <p className="text-center text-muted small mt-2">
                La giftcard se envía cuando {nombreNegocio} confirma el pago.
              </p>
            </form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default RegalarGiftcard;

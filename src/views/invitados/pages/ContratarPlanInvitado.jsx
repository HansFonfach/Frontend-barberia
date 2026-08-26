import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  CardBody,
  Row,
  Col,
  Button,
  Input,
  FormGroup,
  Label,
  Spinner,
} from "reactstrap";
import { Dumbbell, Landmark, Banknote, UploadCloud, CheckCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import Swal from "sweetalert2";

import AuthFooter from "components/Footers/AuthFooter";
import { useEmpresa } from "context/EmpresaContext";
import { useRutValidator } from "hooks/useRutValidador";
import { getPlanesPublicos } from "api/planesMembresia";
import { getUsuarioByRutPublico } from "api/usuarios";
import { postCrearSolicitudMembresiaPublica } from "api/solicitudesMembresia";

const formatoPesos = (valor) => `$${Number(valor || 0).toLocaleString("es-CL")}`;

/**
 * Checkout público de un plan de membresía, SIN crear cuenta: el visitante
 * elige un plan, ingresa sus datos, elige método de pago (transferencia,
 * efectivo o avisar por WhatsApp) y — si aplica — sube el comprobante.
 *
 * La membresía NUNCA se activa desde acá: esto solo crea una
 * SolicitudMembresiaClase "pendiente", exactamente la misma que ya usa el
 * cliente logueado desde "Mi plan" (mismo backend, mismas reglas
 * antiduplicado). El gimnasio la revisa y aprueba desde su panel de pagos.
 */
const ContratarPlanInvitado = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { empresa } = useEmpresa();

  const [planes, setPlanes] = useState([]);
  const [cargandoPlanes, setCargandoPlanes] = useState(true);
  const [planId, setPlanId] = useState(searchParams.get("plan") || null);

  const { rut, handleRutChange, error: rutError } = useRutValidator();
  const [buscandoRut, setBuscandoRut] = useState(false);
  const [encontrado, setEncontrado] = useState(false);

  const [datos, setDatos] = useState({ nombre: "", apellido: "", telefono: "", email: "" });
  const [metodo, setMetodo] = useState("transferencia");
  const [comprobanteFile, setComprobanteFile] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const cargar = async () => {
      setCargandoPlanes(true);
      try {
        const res = await getPlanesPublicos(slug);
        setPlanes(res.data?.planes || []);
      } catch (error) {
        console.error("Error al cargar planes:", error);
        setPlanes([]);
      } finally {
        setCargandoPlanes(false);
      }
    };
    cargar();
  }, [slug]);

  // Autofill best-effort por RUT (mismo patrón que la clase de prueba
  // gratis): solo completa nombre/apellido, nunca nada sensible.
  useEffect(() => {
    setEncontrado(false);
    if (rutError || rut.length < 8) return;

    let activo = true;
    const buscar = async () => {
      setBuscandoRut(true);
      try {
        const usuario = await getUsuarioByRutPublico(slug, rut);
        if (!activo || !usuario) return;
        setDatos((prev) => ({
          ...prev,
          nombre: usuario.nombre || prev.nombre,
          apellido: usuario.apellido || prev.apellido,
        }));
        setEncontrado(true);
      } catch (_) {
        // RUT no encontrado: completa sus datos a mano, sin problema.
      } finally {
        if (activo) setBuscandoRut(false);
      }
    };
    buscar();
    return () => {
      activo = false;
    };
  }, [rut, rutError, slug]);

  const planSeleccionado = useMemo(
    () => planes.find((p) => p._id === planId) || null,
    [planes, planId],
  );

  const datosTransferencia = empresa?.pagos?.transferencia || {};
  const tieneDatosTransferencia = Boolean(
    datosTransferencia.numeroCuenta || datosTransferencia.rut,
  );

  const telefonoEmpresa = (empresa?.telefono || "").replace(/\D/g, "");
  const mensajeWhatsapp = encodeURIComponent(
    `Hola! Quiero contratar el plan ${planSeleccionado?.nombre || ""} en ${empresa?.nombre || "el gimnasio"}. Mi RUT es ${rut || "___"}. Te mando el comprobante por acá.`,
  );
  const linkWhatsapp = telefonoEmpresa
    ? `https://wa.me/${telefonoEmpresa}?text=${mensajeWhatsapp}`
    : null;

  const datosContactoCompletos =
    datos.nombre.trim() &&
    datos.apellido.trim() &&
    rut &&
    !rutError &&
    datos.telefono.trim().length >= 8 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email.trim());

  const puedeEnviar =
    planSeleccionado &&
    datosContactoCompletos &&
    (metodo !== "transferencia" || comprobanteFile);

  const handleEnviar = async () => {
    if (!puedeEnviar) return;

    const formData = new FormData();
    formData.append("nombre", datos.nombre.trim());
    formData.append("apellido", datos.apellido.trim());
    formData.append("rut", rut);
    formData.append("email", datos.email.trim());
    formData.append("telefono", datos.telefono.trim());
    formData.append("planId", planSeleccionado._id);
    formData.append("metodo", metodo);
    if (comprobanteFile) formData.append("comprobante", comprobanteFile);

    setEnviando(true);
    try {
      await postCrearSolicitudMembresiaPublica(slug, formData);
      setEnviado(true);
    } catch (error) {
      Swal.fire(
        "No se pudo enviar",
        error.response?.data?.message || "Ocurrió un problema al enviar tu solicitud",
        "error",
      );
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <Container className="mt-7 mb-5 text-center" style={{ maxWidth: 560 }}>
        <Card className="shadow-lg border-0 p-4">
          <CardBody>
            <CheckCircle size={48} className="text-success mb-3" />
            <h3 className="font-weight-bold">¡Solicitud enviada!</h3>
            <p className="text-muted">
              Recibimos tu solicitud del plan <strong>{planSeleccionado?.nombre}</strong>.{" "}
              {metodo === "whatsapp"
                ? "No olvides mandar tu comprobante por WhatsApp si aún no lo hiciste."
                : "El gimnasio la revisará y te avisaremos por correo apenas quede activa."}
            </p>
            <Button color="success" className="mt-3" onClick={() => navigate(`/${slug}`)}>
              Volver al inicio
            </Button>
          </CardBody>
        </Card>
      </Container>
    );
  }

  return (
    <div style={{ backgroundColor: "#FFFFFF", overflowX: "hidden" }}>
      <div
        className="position-relative py-6"
        style={{
          background: "linear-gradient(150deg, #172b4d 0%, #1a174d 100%)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg="8">
              <h1 className="display-4 font-weight-bold mb-2" style={{ color: "#fff" }}>
                <Dumbbell size={32} className="mr-2 mb-1" />
                Contratar plan
              </h1>
              <p className="lead" style={{ color: "rgba(255,255,255,0.9)" }}>
                {empresa?.nombre ? `${empresa.nombre} · ` : ""}Sin crear cuenta. Elige tu plan,
                completa tus datos y listo.
              </p>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="mt-5 mb-5" style={{ maxWidth: 900 }}>
        <Card className="shadow-lg border-0">
          <CardBody className="p-4">
            {/* ── Paso 1: plan ── */}
            <h5 className="font-weight-bold mb-3">1. Elige tu plan</h5>
            {cargandoPlanes ? (
              <div className="text-center py-4">
                <Spinner color="success" />
              </div>
            ) : planes.length === 0 ? (
              <p className="text-muted">Todavía no hay planes publicados.</p>
            ) : (
              <Row className="mb-4">
                {planes.map((plan) => (
                  <Col key={plan._id} md="4" className="mb-3">
                    <Card
                      onClick={() => setPlanId(plan._id)}
                      className="h-100 mb-0"
                      style={{
                        cursor: "pointer",
                        borderRadius: 14,
                        border:
                          planId === plan._id ? "2px solid #2dce89" : "1.5px solid #e9ecef",
                        background: planId === plan._id ? "#E6F9F0" : "#fff",
                      }}
                    >
                      <CardBody className="p-3 text-center">
                        <div className="font-weight-bold">{plan.nombre}</div>
                        <div className="h4 font-weight-bold my-1">
                          {formatoPesos(plan.precio)}
                        </div>
                        <small className="text-muted d-block">
                          {plan.clasesIncluidas} clases{plan.tipoCiclo === "mensual" ? "/mes" : " en total"} · {plan.duracionDias} días
                        </small>
                      </CardBody>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}

            {planSeleccionado && (
              <>
                <hr />
                {/* ── Paso 2: datos ── */}
                <h5 className="font-weight-bold mb-3">2. Tus datos</h5>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label className="small font-weight-bold">RUT</Label>
                      <Input
                        className={rutError ? "is-invalid" : ""}
                        placeholder="RUT (sin puntos ni guión)"
                        value={rut}
                        maxLength={12}
                        onChange={handleRutChange}
                        autoComplete="off"
                      />
                      {rutError && <div className="invalid-feedback d-block">{rutError}</div>}
                      {buscandoRut && (
                        <small className="text-muted d-block mt-1">🔍 Buscando tus datos...</small>
                      )}
                      {encontrado && !buscandoRut && (
                        <small className="text-success d-block mt-1">
                          ✓ Te encontramos, completamos tu nombre
                        </small>
                      )}
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label className="small font-weight-bold">Teléfono</Label>
                      <Input
                        placeholder="9XXXXXXXX"
                        inputMode="numeric"
                        value={datos.telefono}
                        onChange={(e) =>
                          setDatos({
                            ...datos,
                            telefono: e.target.value.replace(/\D/g, "").slice(0, 9),
                          })
                        }
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label className="small font-weight-bold">Nombre</Label>
                      <Input
                        value={datos.nombre}
                        onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label className="small font-weight-bold">Apellido</Label>
                      <Input
                        value={datos.apellido}
                        onChange={(e) => setDatos({ ...datos, apellido: e.target.value })}
                      />
                    </FormGroup>
                  </Col>
                  <Col md="12">
                    <FormGroup>
                      <Label className="small font-weight-bold">Correo electrónico</Label>
                      <Input
                        type="email"
                        value={datos.email}
                        onChange={(e) => setDatos({ ...datos, email: e.target.value })}
                      />
                      <small className="text-muted">
                        Te avisaremos aquí cuando tu plan quede activo.
                      </small>
                    </FormGroup>
                  </Col>
                </Row>

                <hr />

                {/* ── Paso 3: método de pago ── */}
                <h5 className="font-weight-bold mb-3">3. ¿Cómo vas a pagar?</h5>
                <div className="d-flex mb-3" style={{ gap: 10, flexWrap: "wrap" }}>
                  {[
                    { key: "transferencia", label: "Transferencia", icon: <Landmark size={18} /> },
                    { key: "efectivo", label: "Efectivo", icon: <Banknote size={18} /> },
                    { key: "whatsapp", label: "Avisar por WhatsApp", icon: <FaWhatsapp size={18} /> },
                  ].map((op) => (
                    <div
                      key={op.key}
                      onClick={() => setMetodo(op.key)}
                      className="d-flex align-items-center"
                      style={{
                        flex: "1 1 160px",
                        gap: 8,
                        padding: "12px 14px",
                        borderRadius: 12,
                        cursor: "pointer",
                        border: metodo === op.key ? "2px solid #2dce89" : "2px solid #e9ecef",
                        background: metodo === op.key ? "#E6F9F0" : "#fff",
                        fontWeight: metodo === op.key ? 700 : 400,
                        color: metodo === op.key ? "#1A7A4A" : "#525f7f",
                      }}
                    >
                      {op.icon} {op.label}
                    </div>
                  ))}
                </div>

                {metodo === "transferencia" &&
                  (tieneDatosTransferencia ? (
                    <>
                      <div className="p-3 mb-3" style={{ background: "#fafafa", borderRadius: 12, fontSize: 13 }}>
                        {[
                          ["Banco", datosTransferencia.banco],
                          ["Tipo de cuenta", datosTransferencia.tipoCuenta],
                          ["N° de cuenta", datosTransferencia.numeroCuenta],
                          ["Titular", datosTransferencia.titular],
                          ["RUT", datosTransferencia.rut],
                          ["Correo", datosTransferencia.correo],
                        ]
                          .filter(([, v]) => v)
                          .map(([label, value]) => (
                            <div
                              key={label}
                              className="d-flex justify-content-between py-1"
                              style={{ borderBottom: "1px solid #eee" }}
                            >
                              <span className="text-muted">{label}</span>
                              <strong>{value}</strong>
                            </div>
                          ))}
                      </div>
                      <FormGroup>
                        <Label className="small font-weight-bold">Comprobante de transferencia</Label>
                        <Input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => setComprobanteFile(e.target.files?.[0] || null)}
                        />
                        <small className="text-muted">
                          <UploadCloud size={12} className="mr-1" />
                          Sube una foto o PDF una vez hecha la transferencia
                        </small>
                      </FormGroup>
                    </>
                  ) : (
                    <p className="text-warning small">
                      El gimnasio todavía no configuró sus datos de transferencia. Elige "Avisar
                      por WhatsApp" para coordinar el pago.
                    </p>
                  ))}

                {metodo === "efectivo" && (
                  <p className="text-muted small">
                    Paga <strong>{formatoPesos(planSeleccionado.precio)}</strong> en efectivo
                    directamente en el local. Cuando envíes esta solicitud, el gimnasio activará
                    tu plan al recibir el pago.
                  </p>
                )}

                {metodo === "whatsapp" && (
                  <div>
                    <p className="text-muted small mb-2">
                      Envía tu comprobante por WhatsApp y avísale al gimnasio. Igual queda
                      registrada tu solicitud en el sistema, así no se pierde el seguimiento.
                    </p>
                    {linkWhatsapp && (
                      <a
                        href={linkWhatsapp}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-success mb-2"
                      >
                        <FaWhatsapp className="mr-2" /> Abrir WhatsApp
                      </a>
                    )}
                    <FormGroup>
                      <Label className="small font-weight-bold">
                        Comprobante (opcional, si prefieres subirlo aquí)
                      </Label>
                      <Input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setComprobanteFile(e.target.files?.[0] || null)}
                      />
                    </FormGroup>
                  </div>
                )}

                <Button
                  block
                  color="success"
                  size="lg"
                  className="font-weight-bold mt-3"
                  disabled={!puedeEnviar || enviando}
                  onClick={handleEnviar}
                >
                  {enviando ? "Enviando..." : "Enviar solicitud"}
                </Button>
                <small className="text-muted text-center d-block mt-2">
                  Esto no activa tu plan de inmediato: el gimnasio revisará tu solicitud y te
                  avisará por correo.
                </small>
              </>
            )}
          </CardBody>
        </Card>
      </Container>

      <AuthFooter />
    </div>
  );
};

export default ContratarPlanInvitado;

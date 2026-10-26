import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge, Button, Card, CardBody, CardHeader, Col, Container, FormGroup, Input, Label, Progress, Row, Spinner } from "reactstrap";
import Swal from "sweetalert2";
import { Send } from "lucide-react";
import EncabezadoReservasMesa from "components/reservasMesa/EncabezadoReservasMesa";
import { useEmpresa } from "context/EmpresaContext";
import { getCampanasMesa, postCampanaMesa, postPruebaCampanaMesa } from "api/reservasMesa";
import { fechaHora, mensajeError } from "utils/reservasMesa";

const ESTADOS = {
  enviando: { label: "Enviando", color: "info" },
  enviada: { label: "Enviada", color: "success" },
  con_errores: { label: "Enviada con errores", color: "warning" },
  interrumpida: { label: "Interrumpida", color: "danger" },
};

/** Escribir y enviar una promoción por correo a los clientes que aceptaron. */
const PromocionesReservasMesa = () => {
  const { slug } = useParams();
  const { empresa } = useEmpresa();
  const [form, setForm] = useState({ asunto: "", mensaje: "" });
  const [datos, setDatos] = useState({ campanas: [], destinatarios: 0, maximo: 0 });
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const cargar = useCallback(async (silencioso = false) => {
    if (!silencioso) setCargando(true);
    try {
      const { data } = await getCampanasMesa();
      setDatos(data);
    } catch (e) {
      if (!silencioso) Swal.fire("Error", mensajeError(e), "error");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Mientras una promoción se está enviando, se actualiza el avance
  const hayEnvio = datos.campanas.some((c) => c.estado === "enviando");
  useEffect(() => {
    if (!hayEnvio) return undefined;
    const t = setInterval(() => cargar(true), 5000);
    return () => clearInterval(t);
  }, [hayEnvio, cargar]);

  const set = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));
  const listo = form.asunto.trim().length >= 3 && form.mensaje.trim().length >= 10;

  const prueba = async () => {
    const r = await Swal.fire({
      title: "Enviarme una prueba",
      input: "email",
      inputLabel: "¿A qué correo?",
      inputValue: empresa?.correo || "",
      showCancelButton: true,
      confirmButtonText: "Enviar prueba",
      cancelButtonText: "Volver",
      validationMessage: "Ingresa un correo válido",
    });
    if (!r.isConfirmed) return;
    try {
      const { data } = await postPruebaCampanaMesa({ ...form, email: r.value });
      Swal.fire({ icon: "success", title: data.message, timer: 2200, showConfirmButton: false });
    } catch (e) {
      Swal.fire("No se pudo", mensajeError(e), "error");
    }
  };

  const enviar = async () => {
    const r = await Swal.fire({
      title: `¿Enviar a ${datos.destinatarios} cliente${datos.destinatarios === 1 ? "" : "s"}?`,
      text: "Se envía por correo solo a quienes aceptaron recibir promociones. No se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, enviar",
      cancelButtonText: "Volver",
    });
    if (!r.isConfirmed) return;
    setEnviando(true);
    try {
      await postCampanaMesa(form);
      setForm({ asunto: "", mensaje: "" });
      await cargar(true);
      Swal.fire({
        icon: "success",
        title: "Enviando promoción",
        text: "Los correos salen de a poco. Puedes ver el avance abajo.",
        timer: 2600,
        showConfirmButton: false,
      });
    } catch (e) {
      Swal.fire("No se pudo enviar", mensajeError(e), "error");
    } finally {
      setEnviando(false);
    }
  };

  const nombrePrueba = "Camila";

  return (
    <>
      <EncabezadoReservasMesa titulo="Promociones" subtitulo="Envía novedades por correo a los clientes que aceptaron recibirlas" />
      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col xl="10">
            <Row>
              <Col lg="7" className="mb-4">
                <Card className="shadow h-100">
                  <CardHeader>
                    <h3 className="mb-0">Nueva promoción</h3>
                    <small className="text-muted">
                      {cargando ? (
                        "Contando destinatarios..."
                      ) : (
                        <>
                          Llegará a <strong>{datos.destinatarios}</strong> cliente{datos.destinatarios === 1 ? "" : "s"} con correo que
                          aceptaron promociones. <Link to={`/${slug}/admin/reservas-mesa-clientes`}>Ver clientes</Link>
                        </>
                      )}
                    </small>
                  </CardHeader>
                  <CardBody>
                    {hayEnvio && (
                      <div className="alert alert-info">Hay una promoción enviándose. Podrás enviar otra cuando termine.</div>
                    )}
                    <FormGroup>
                      <Label for="pr-asunto">Asunto</Label>
                      <Input
                        id="pr-asunto"
                        value={form.asunto}
                        maxLength={120}
                        placeholder="Ej: Este viernes, 2x1 en coctelería de autor"
                        onChange={(e) => set("asunto", e.target.value)}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label for="pr-mensaje">Mensaje</Label>
                      <Input
                        id="pr-mensaje"
                        type="textarea"
                        rows="8"
                        maxLength={3000}
                        value={form.mensaje}
                        placeholder="Escribe la promoción. Puedes usar varias líneas."
                        onChange={(e) => set("mensaje", e.target.value)}
                      />
                      <small className="text-muted">
                        El correo incluye un botón para reservar y el link para darse de baja. {form.mensaje.length}/3000
                      </small>
                    </FormGroup>
                    <div className="d-flex flex-wrap" style={{ gap: 8 }}>
                      <Button outline color="primary" className="m-0" disabled={!listo} onClick={prueba}>
                        Enviarme una prueba
                      </Button>
                      <Button color="primary" className="m-0" disabled={!listo || enviando || hayEnvio || !datos.destinatarios} onClick={enviar}>
                        <Send size={16} style={{ verticalAlign: "-3px" }} />{" "}
                        {enviando ? "Enviando..." : `Enviar a ${datos.destinatarios} cliente${datos.destinatarios === 1 ? "" : "s"}`}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </Col>

              <Col lg="5" className="mb-4">
                <Card className="shadow h-100">
                  <CardHeader>
                    <h4 className="mb-0">Así se verá</h4>
                  </CardHeader>
                  <CardBody>
                    <div className="border rounded overflow-hidden" style={{ fontSize: 14 }}>
                      <div style={{ background: "#1a1a1a", color: "#fff", padding: "12px 16px", fontWeight: 700 }}>
                        {empresa?.nombre || "Tu local"}
                      </div>
                      <div style={{ padding: 16 }}>
                        <div className="small text-muted mb-2">
                          Asunto: <strong>{form.asunto || "…"}</strong>
                        </div>
                        <p className="mb-2">Hola {nombrePrueba},</p>
                        <div style={{ whiteSpace: "pre-line", minHeight: 60 }} className={form.mensaje ? "" : "text-muted"}>
                          {form.mensaje || "Tu mensaje aparecerá aquí."}
                        </div>
                        <span
                          className="d-inline-block mt-3"
                          style={{ background: "#1a1a1a", color: "#fff", borderRadius: 6, padding: "8px 16px", fontWeight: 700 }}
                        >
                          Reservar mesa
                        </span>
                        <div className="small text-muted mt-3 pt-2 border-top">
                          Recibes este correo porque aceptaste recibir promociones de {empresa?.nombre || "el local"}.{" "}
                          <u>Dejar de recibir promociones</u>.
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Card className="shadow">
              <CardHeader>
                <h4 className="mb-0">Promociones enviadas</h4>
              </CardHeader>
              <CardBody>
                {cargando ? (
                  <div className="text-center py-3">
                    <Spinner />
                  </div>
                ) : datos.campanas.length === 0 ? (
                  <p className="text-muted mb-0">Todavía no has enviado promociones.</p>
                ) : (
                  datos.campanas.map((c) => {
                    const e = ESTADOS[c.estado] || ESTADOS.enviada;
                    const hechos = c.enviados + c.fallidos;
                    return (
                      <div key={c._id} className="border-bottom py-3">
                        <div className="d-flex flex-wrap justify-content-between align-items-start" style={{ gap: 8 }}>
                          <div style={{ minWidth: 0 }}>
                            <strong style={{ wordBreak: "break-word" }}>{c.asunto}</strong>
                            <div className="small text-muted">
                              {fechaHora(c.createdAt)} · {c.creadoPor?.nombre}
                            </div>
                          </div>
                          <Badge color={e.color} pill>
                            {e.label}
                          </Badge>
                        </div>
                        <div className="small mt-2">
                          {c.enviados} de {c.destinatarios} enviados
                          {c.fallidos > 0 && <span className="text-danger"> · {c.fallidos} no se pudieron enviar</span>}
                        </div>
                        {c.estado === "enviando" && (
                          <Progress className="mt-2" style={{ height: 6 }} value={c.destinatarios ? (hechos / c.destinatarios) * 100 : 0} />
                        )}
                      </div>
                    );
                  })
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default PromocionesReservasMesa;

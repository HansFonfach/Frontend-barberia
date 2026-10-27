import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Card, CardBody, CardHeader, Col, Container, FormGroup, Input, Label, Row, Spinner } from "reactstrap";
import Swal from "sweetalert2";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import EncabezadoReservasMesa from "components/reservasMesa/EncabezadoReservasMesa";
import { useConfiguracionReservasMesa } from "hooks/useReservasMesa";
import { DIAS_SEMANA, mensajeError } from "utils/reservasMesa";

// Lunes primero, domingo al final
const ORDEN_DIAS = [1, 2, 3, 4, 5, 6, 0];

const vacio = (v) => v === "" || v === null || v === undefined;

// Qué falta, calculado con lo que está en pantalla (no con lo último
// guardado), para que el aviso cambie mientras se completa el formulario.
// Es la misma lista que valida el backend (services/reservasMesa/reglas.js).
const faltantesFormulario = (f) => {
  const falta = [];
  if (!f.sectores.some((s) => s.activo && Number(s.capacidad) > 0 && s.nombre?.trim())) {
    falta.push("al menos un sector activo con nombre y capacidad");
  }
  if (!f.horario.some((d) => d.abierto && d.desde && d.hasta)) falta.push("el horario de al menos un día");
  if (vacio(f.intervaloMinutos)) falta.push("horas ofrecidas cada");
  if (vacio(f.duracionMinutos)) falta.push("duración de la reserva");
  if (vacio(f.anticipacionMinimaMinutos)) falta.push("anticipación mínima");
  if (vacio(f.anticipacionMaximaDias)) falta.push("anticipación máxima");
  if (vacio(f.maxPersonasPorReserva)) falta.push("máximo de personas por reserva");
  if (vacio(f.toleranciaMinutos)) falta.push("tolerancia de atraso");
  return falta;
};

const faltantesWebFormulario = (f) => {
  const falta = [];
  if (vacio(f.maxPersonasWeb)) falta.push("máximo de personas por reserva web");
  if (!f.sectores.some((s) => s.activo && s.reservableOnline)) falta.push("un sector activo que se pueda reservar por la web");
  return falta;
};

const numero = (v) => (v === "" || v === null || v === undefined ? "" : v);
const aNumero = (v) => (v === "" ? null : Number(v));

const Interruptor = ({ id, checked, onChange, children }) => (
  <div className="custom-control custom-switch mb-2">
    <input id={id} type="checkbox" className="custom-control-input" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
    <label className="custom-control-label" htmlFor={id}>
      {children}
    </label>
  </div>
);

const Seccion = ({ titulo, ayuda, children }) => (
  <Card className="shadow-sm mb-4">
    <CardHeader className="py-3">
      <h4 className="mb-0">{titulo}</h4>
      {ayuda && <small className="text-muted">{ayuda}</small>}
    </CardHeader>
    <CardBody>{children}</CardBody>
  </Card>
);

/** Configuración del módulo. Nada viene precargado: todo lo define el local. */
// Cada ajuste vive en su propia pantalla del menú (seccion); sin seccion se
// muestran todos juntos. Todas guardan la misma configuración completa.
const SECCIONES = {
  sectores: {
    titulo: "Sectores",
    subtitulo: "Espacios del local y cuántas personas se pueden reservar en cada uno",
  },
  horarios: {
    titulo: "Horarios y reglas",
    subtitulo: "Días y horas en que se reciben llegadas, duración de la reserva y límites",
  },
  web: {
    titulo: "Reservas web y avisos",
    subtitulo: "Página pública de reservas, cancelación por link y recordatorios por correo",
  },
  permisos: {
    titulo: "Permisos del equipo",
    subtitulo: "Qué puede hacer el personal que no es administrador",
  },
};

const ConfiguracionReservasMesa = ({ seccion }) => {
  const ver = (s) => !seccion || seccion === s;
  const textos = SECCIONES[seccion] || {
    titulo: "Ajustes de reservas",
    subtitulo: "Sectores, horarios, reglas, página web y permisos",
  };
  const { slug } = useParams();
  const { configuracion, cargando, error, guardar } = useConfiguracionReservasMesa();
  const [form, setForm] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (configuracion) setForm(JSON.parse(JSON.stringify(configuracion)));
  }, [configuracion]);

  if (cargando || !form) {
    return (
      <>
        <EncabezadoReservasMesa titulo={textos.titulo} subtitulo={textos.subtitulo} />
        <Container className="mt--7 text-center" fluid>
          {error ? <div className="alert alert-danger">{error}</div> : <Spinner className="text-white" />}
        </Container>
      </>
    );
  }

  const set = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));
  const setAnidado = (grupo, campo, valor) => setForm((f) => ({ ...f, [grupo]: { ...f[grupo], [campo]: valor } }));
  const setWhatsapp = (grupo, campo, valor) =>
    setForm((f) => ({
      ...f,
      whatsapp: { ...f.whatsapp, [grupo]: { ...(f.whatsapp?.[grupo] || {}), [campo]: valor } },
    }));
  const telefonosWhatsapp = form.whatsapp?.avisoLocal?.telefonos;

  const setSector = (i, campo, valor) =>
    setForm((f) => ({ ...f, sectores: f.sectores.map((s, j) => (j === i ? { ...s, [campo]: valor } : s)) }));
  const agregarSector = () =>
    setForm((f) => ({ ...f, sectores: [...f.sectores, { nombre: "", capacidad: "", activo: true, reservableOnline: true }] }));
  const quitarSector = (i) => setForm((f) => ({ ...f, sectores: f.sectores.filter((_, j) => j !== i) }));
  const moverSector = (i, d) =>
    setForm((f) => {
      const s = [...f.sectores];
      const j = i + d;
      if (j < 0 || j >= s.length) return f;
      [s[i], s[j]] = [s[j], s[i]];
      return { ...f, sectores: s };
    });

  const dia = (n) => form.horario.find((h) => h.dia === n) || { dia: n, abierto: false, desde: null, hasta: null };
  const setDia = (n, campo, valor) =>
    setForm((f) => {
      const existe = f.horario.some((h) => h.dia === n);
      const horario = existe
        ? f.horario.map((h) => (h.dia === n ? { ...h, [campo]: valor } : h))
        : [...f.horario, { dia: n, abierto: false, desde: null, hasta: null, [campo]: valor }];
      return { ...f, horario };
    });

  const enviar = async () => {
    setGuardando(true);
    try {
      const cuerpo = {
        ...form,
        sectores: form.sectores.map((s) => ({ ...s, capacidad: aNumero(s.capacidad) })),
      };
      const r = await guardar(cuerpo);
      Swal.fire({
        icon: "success",
        title: "Configuración guardada",
        text: r.faltantes?.length ? `Aún falta: ${r.faltantes.join(", ")}.` : "Ya se pueden registrar reservas.",
      });
    } catch (e) {
      Swal.fire("No se pudo guardar", mensajeError(e), "error");
    } finally {
      setGuardando(false);
    }
  };

  const linkPublico = `${window.location.origin}/${slug}/reservar-mesa`;
  const faltantes = faltantesFormulario(form);
  const faltantesWeb = faltantesWebFormulario(form);

  return (
    <>
      <EncabezadoReservasMesa titulo={textos.titulo} subtitulo={textos.subtitulo} />
      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col xl="9">
            <Card className="shadow mb-4">
              <CardBody className="d-flex flex-wrap justify-content-between align-items-center" style={{ gap: 12 }}>
                <div>
                  <h3 className="mb-0">{seccion ? "Estado de las reservas" : textos.titulo}</h3>
                  {faltantes.length ? (
                    <small className="text-warning">Falta completar: {faltantes.join(", ")}</small>
                  ) : (
                    <small className="text-success">Lista para recibir reservas</small>
                  )}
                </div>
                <Button color="primary" className="m-0" disabled={guardando} onClick={enviar}>
                  {guardando ? "Guardando..." : "Guardar"}
                </Button>
              </CardBody>
            </Card>

            {ver("sectores") && (
            <Seccion
              titulo="Sectores"
              ayuda="Capacidad = personas que se pueden reservar al mismo tiempo. Si quieres dejar lugar para quien llega sin reserva, pon un número menor que la capacidad real."
            >
              {form.sectores.length === 0 && <p className="text-muted">Todavía no hay sectores.</p>}
              {form.sectores.map((s, i) => (
                <div key={s._id || `nuevo-${i}`} className="border rounded p-3 mb-2">
                  <Row className="align-items-end">
                    <Col xs="12" md="5" className="mb-2">
                      <Label className="small">Nombre</Label>
                      <Input value={s.nombre} maxLength={40} placeholder="Ej: Terraza" onChange={(e) => setSector(i, "nombre", e.target.value)} />
                    </Col>
                    <Col xs="6" md="3" className="mb-2">
                      <Label className="small">Capacidad (personas)</Label>
                      <Input type="number" min="1" value={numero(s.capacidad)} onChange={(e) => setSector(i, "capacidad", e.target.value)} />
                    </Col>
                    <Col xs="6" md="4" className="mb-2 d-flex justify-content-end" style={{ gap: 6 }}>
                      <Button size="sm" outline className="m-0" onClick={() => moverSector(i, -1)} disabled={i === 0} aria-label="Subir">
                        <ArrowUp size={14} />
                      </Button>
                      <Button size="sm" outline className="m-0" onClick={() => moverSector(i, 1)} disabled={i === form.sectores.length - 1} aria-label="Bajar">
                        <ArrowDown size={14} />
                      </Button>
                      <Button size="sm" outline color="danger" className="m-0" onClick={() => quitarSector(i)} aria-label="Quitar">
                        <Trash2 size={14} />
                      </Button>
                    </Col>
                  </Row>
                  <div className="d-flex flex-wrap" style={{ columnGap: 24 }}>
                    <Interruptor id={`s-activo-${i}`} checked={s.activo} onChange={(v) => setSector(i, "activo", v)}>
                      Activo
                    </Interruptor>
                    <Interruptor id={`s-web-${i}`} checked={s.reservableOnline} onChange={(v) => setSector(i, "reservableOnline", v)}>
                      Se puede reservar por la web
                    </Interruptor>
                  </div>
                </div>
              ))}
              <Button size="sm" outline color="primary" className="m-0" onClick={agregarSector}>
                <Plus size={14} style={{ verticalAlign: "-2px" }} /> Agregar sector
              </Button>
            </Seccion>
            )}

            {ver("horarios") && (
            <Seccion
              titulo="Horario de llegadas"
              ayuda="Primera y última hora a la que puede llegar una reserva. La reserva puede terminar después (según su duración)."
            >
              {ORDEN_DIAS.map((n) => {
                const d = dia(n);
                return (
                  <Row key={n} className="align-items-center border-bottom py-2 mx-0">
                    <Col xs="12" sm="4" className="px-0">
                      <Interruptor id={`dia-${n}`} checked={d.abierto} onChange={(v) => setDia(n, "abierto", v)}>
                        {DIAS_SEMANA[n]}
                      </Interruptor>
                    </Col>
                    {d.abierto ? (
                      <>
                        <Col xs="6" sm="4" className="pl-0">
                          <Input type="time" bsSize="sm" step="900" value={d.desde || ""} onChange={(e) => setDia(n, "desde", e.target.value)} />
                        </Col>
                        <Col xs="6" sm="4" className="pr-0">
                          <Input type="time" bsSize="sm" step="900" value={d.hasta || ""} onChange={(e) => setDia(n, "hasta", e.target.value)} />
                        </Col>
                      </>
                    ) : (
                      <Col xs="12" sm="8" className="text-muted small px-0">
                        No se reciben reservas
                      </Col>
                    )}
                  </Row>
                );
              })}
            </Seccion>
            )}

            {ver("horarios") && (
            <Seccion titulo="Reglas de reserva">
              <Row>
                <Col md="6">
                  <FormGroup>
                    <Label>Horas ofrecidas cada</Label>
                    <Input type="select" value={numero(form.intervaloMinutos)} onChange={(e) => set("intervaloMinutos", aNumero(e.target.value))}>
                      <option value="">Elegir</option>
                      <option value="15">15 minutos</option>
                      <option value="30">30 minutos</option>
                      <option value="60">60 minutos</option>
                    </Input>
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Label>Duración de la reserva (minutos)</Label>
                    <Input type="number" min="15" step="15" value={numero(form.duracionMinutos)} onChange={(e) => set("duracionMinutos", aNumero(e.target.value))} />
                    <small className="text-muted">Cuánto tiempo se guarda el lugar. Múltiplo de 15.</small>
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Label>Anticipación mínima por la web (minutos)</Label>
                    <Input type="number" min="0" value={numero(form.anticipacionMinimaMinutos)} onChange={(e) => set("anticipacionMinimaMinutos", aNumero(e.target.value))} />
                    <small className="text-muted">El panel puede registrar llegadas inmediatas.</small>
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Label>Anticipación máxima (días)</Label>
                    <Input type="number" min="1" value={numero(form.anticipacionMaximaDias)} onChange={(e) => set("anticipacionMaximaDias", aNumero(e.target.value))} />
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Label>Máximo de personas por reserva</Label>
                    <Input type="number" min="1" value={numero(form.maxPersonasPorReserva)} onChange={(e) => set("maxPersonasPorReserva", aNumero(e.target.value))} />
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Label>Tolerancia de atraso (minutos)</Label>
                    <Input type="number" min="0" value={numero(form.toleranciaMinutos)} onChange={(e) => set("toleranciaMinutos", aNumero(e.target.value))} />
                    <small className="text-muted">Después de esto la reserva aparece como atrasada.</small>
                  </FormGroup>
                </Col>
              </Row>
            </Seccion>
            )}

            {ver("web") && (
            <Seccion titulo="Reservas por la web">
              <Interruptor id="web-activa" checked={form.reservasWebActivas} onChange={(v) => set("reservasWebActivas", v)}>
                Recibir reservas desde la página pública
              </Interruptor>
              {form.reservasWebActivas && faltantes.length + faltantesWeb.length > 0 && (
                <div className="small text-warning mb-2">
                  Para recibir reservas web falta: {[...faltantes, ...faltantesWeb].join(", ")}.
                </div>
              )}
              <div className="small mb-3">
                Link para compartir:{" "}
                <a href={linkPublico} target="_blank" rel="noreferrer">
                  {linkPublico}
                </a>
              </div>
              <Row>
                <Col md="6">
                  <FormGroup>
                    <Label>Máximo de personas por reserva web</Label>
                    <Input type="number" min="1" value={numero(form.maxPersonasWeb)} onChange={(e) => set("maxPersonasWeb", aNumero(e.target.value))} />
                    <small className="text-muted">Los grupos más grandes ven tu teléfono para contactarte.</small>
                  </FormGroup>
                </Col>
                <Col md="6" className="pt-md-4">
                  <Interruptor id="web-auto" checked={form.confirmacionAutomaticaWeb} onChange={(v) => set("confirmacionAutomaticaWeb", v)}>
                    Confirmar automáticamente (si no, quedan pendientes hasta que las confirmes)
                  </Interruptor>
                  <Interruptor id="web-cupos" checked={!!form.mostrarCuposWeb} onChange={(v) => set("mostrarCuposWeb", v)}>
                    Mostrar a los clientes cuántos lugares quedan (ej: "Terraza · quedan 12")
                  </Interruptor>
                  <Interruptor
                    id="web-espera"
                    checked={!!form.listaEspera?.activa}
                    onChange={(v) => set("listaEspera", { ...(form.listaEspera || {}), activa: v })}
                  >
                    Lista de espera: si no queda lugar, el cliente deja su correo y se le avisa si se libera
                  </Interruptor>
                </Col>
              </Row>
              <Row>
                <Col md="6">
                  <FormGroup>
                    <Label for="cfg-wa-consultas">WhatsApp para consultas (opcional)</Label>
                    <Input
                      id="cfg-wa-consultas"
                      value={form.contactoWeb?.whatsapp || ""}
                      maxLength={25}
                      placeholder="+56 9 1234 5678"
                      onChange={(e) => set("contactoWeb", { ...(form.contactoWeb || {}), whatsapp: e.target.value })}
                    />
                    <small className="text-muted">
                      Para el botón "Escribir por WhatsApp" cuando no queda lugar. Si lo dejas vacío, se usa el teléfono de la
                      empresa (si es celular).
                    </small>
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Label for="cfg-msg-sinlugar">Mensaje cuando no queda lugar en línea (opcional)</Label>
                    <Input
                      id="cfg-msg-sinlugar"
                      type="textarea"
                      rows="3"
                      maxLength={300}
                      value={form.contactoWeb?.mensajeSinLugar || ""}
                      placeholder="Ej: Solo una parte de nuestras mesas se reserva en línea; el resto es por orden de llegada. ¡Igual puede haber lugar en el local!"
                      onChange={(e) => set("contactoWeb", { ...(form.contactoWeb || {}), mensajeSinLugar: e.target.value })}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <FormGroup>
                <Label for="cfg-msg-publico">Información para quien reserva (opcional)</Label>
                <Input
                  id="cfg-msg-publico"
                  type="textarea"
                  rows="3"
                  maxLength={600}
                  value={form.mensajePublico}
                  placeholder="Ej: Todos deben presentar carnet."
                  onChange={(e) => set("mensajePublico", e.target.value)}
                />
                <small className="text-muted">Aparece arriba del formulario, al confirmar la reserva y en los correos. Puedes usar varias líneas.</small>
              </FormGroup>
              <FormGroup>
                <Label for="cfg-msg-cumple">Información para cumpleaños (opcional)</Label>
                <Input
                  id="cfg-msg-cumple"
                  type="textarea"
                  rows="3"
                  maxLength={300}
                  value={form.mensajeCumpleanos}
                  placeholder="Ej: lo que ofrece el local o lo que pueden traer"
                  onChange={(e) => set("mensajeCumpleanos", e.target.value)}
                />
                <small className="text-muted">Aparece cuando el cliente marca que celebra un cumpleaños, al confirmar y en sus correos.</small>
              </FormGroup>

              <hr className="my-3" />
              <Interruptor id="cancel-web" checked={form.cancelacionWeb?.permitida} onChange={(v) => setAnidado("cancelacionWeb", "permitida", v)}>
                El cliente puede cancelar con el link de su correo
              </Interruptor>
              {form.cancelacionWeb?.permitida && (
                <FormGroup style={{ maxWidth: 320 }}>
                  <Label>Hasta cuántas horas antes</Label>
                  <Input type="number" min="0" value={numero(form.cancelacionWeb.horasLimite)} onChange={(e) => setAnidado("cancelacionWeb", "horasLimite", aNumero(e.target.value))} />
                </FormGroup>
              )}

              <Interruptor id="recordatorio" checked={form.recordatorio?.activo} onChange={(v) => setAnidado("recordatorio", "activo", v)}>
                Enviar recordatorio por correo
              </Interruptor>
              {form.recordatorio?.activo && (
                <FormGroup style={{ maxWidth: 320 }}>
                  <Label>Cuántas horas antes</Label>
                  <Input type="number" min="1" max="72" value={numero(form.recordatorio.horasAntes)} onChange={(e) => setAnidado("recordatorio", "horasAntes", aNumero(e.target.value))} />
                </FormGroup>
              )}

              <hr className="my-3" />
              <h4 className="mb-1">WhatsApp</h4>
              <p className="small text-muted">
                Usa las plantillas <code>nueva_reserva_mesa</code> y <code>recordatorio_reserva_mesa</code> de tu cuenta de
                WhatsApp Business. Si aún no están aprobadas por Meta, los mensajes no saldrán.
              </p>
              <Interruptor id="wa-aviso" checked={!!form.whatsapp?.avisoLocal?.activo} onChange={(v) => setWhatsapp("avisoLocal", "activo", v)}>
                Avisarme por WhatsApp cada reserva nueva hecha en la web
              </Interruptor>
              {form.whatsapp?.avisoLocal?.activo && (
                <FormGroup style={{ maxWidth: 420 }}>
                  <Label for="wa-telefonos">Números que reciben el aviso</Label>
                  <Input
                    id="wa-telefonos"
                    value={Array.isArray(telefonosWhatsapp) ? telefonosWhatsapp.join(", ") : telefonosWhatsapp || ""}
                    placeholder="+56 9 1234 5678"
                    onChange={(e) => setWhatsapp("avisoLocal", "telefonos", e.target.value)}
                  />
                  <small className="text-muted">Hasta 3, separados por coma.</small>
                </FormGroup>
              )}
              <Interruptor id="wa-confirmacion" checked={!!form.whatsapp?.confirmacion?.activo} onChange={(v) => setWhatsapp("confirmacion", "activo", v)}>
                Pedir al cliente por WhatsApp que confirme si viene
              </Interruptor>
              {form.whatsapp?.confirmacion?.activo && (
                <FormGroup style={{ maxWidth: 320 }}>
                  <Label for="wa-horas">Cuántas horas antes</Label>
                  <Input
                    id="wa-horas"
                    type="number"
                    min="1"
                    max="24"
                    value={numero(form.whatsapp.confirmacion.horasAntes)}
                    onChange={(e) => setWhatsapp("confirmacion", "horasAntes", aNumero(e.target.value))}
                  />
                  <small className="text-muted">
                    Solo a reservas confirmadas. Si el cliente responde "No podré ir", la reserva se cancela sola y la mesa
                    queda libre.
                  </small>
                </FormGroup>
              )}
            </Seccion>
            )}

            {ver("permisos") && (
            <Seccion titulo="Permisos del personal" ayuda="El administrador siempre puede todo. El resto del equipo puede ver, registrar, editar y marcar llegadas.">
              <Interruptor id="perm-cancelar" checked={form.permisosPersonal?.cancelar} onChange={(v) => setAnidado("permisosPersonal", "cancelar", v)}>
                El personal puede cancelar reservas
              </Interruptor>
              <Interruptor id="perm-sobrecupo" checked={form.permisosPersonal?.forzarSobrecupo} onChange={(v) => setAnidado("permisosPersonal", "forzarSobrecupo", v)}>
                El personal puede registrar con sobrecupo
              </Interruptor>
            </Seccion>
            )}

            <div className="text-right mb-5">
              <Button color="primary" disabled={guardando} onClick={enviar}>
                {guardando ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ConfiguracionReservasMesa;

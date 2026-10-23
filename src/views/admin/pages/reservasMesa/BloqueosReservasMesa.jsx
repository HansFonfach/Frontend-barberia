import React, { useCallback, useEffect, useState } from "react";
import { Badge, Button, Card, CardBody, CardHeader, Col, Container, FormGroup, Input, Label, Row, Spinner } from "reactstrap";
import Swal from "sweetalert2";
import EncabezadoReservasMesa from "components/reservasMesa/EncabezadoReservasMesa";
import ModalAfectadasBloqueo from "components/reservasMesa/ModalAfectadasBloqueo";
import { useConfiguracionReservasMesa } from "hooks/useReservasMesa";
import {
  deleteBloqueoReservasMesa,
  getAfectadasBloqueoMesa,
  getBloqueosReservasMesa,
  postBloqueoReservasMesa,
} from "api/reservasMesa";
import { capitalizar, fechaLarga, hoyChile, mensajeError } from "utils/reservasMesa";

const TIPOS = [
  {
    value: "orden_llegada",
    titulo: "Solo por orden de llegada",
    detalle: "El local atiende, pero sin reservas. La página de reservas lo anuncia (ej: Día de la Madre).",
    color: "#9a6a2c",
    badge: "Orden de llegada",
  },
  {
    value: "sin_reservas",
    titulo: "No recibir reservas",
    detalle: "Para cierres, eventos privados o un sector que no se usa (ej: terraza con lluvia).",
    color: "#f5365c",
    badge: "Sin reservas",
  },
];
const tipoDe = (valor) => TIPOS.find((t) => t.value === valor) || TIPOS[1];

const VACIO = () => ({
  fecha: hoyChile(),
  tipo: "sin_reservas",
  sectorId: "",
  tramo: false,
  horaDesde: "",
  horaHasta: "",
  motivo: "",
});

/** Días o tramos sin reservas: fechas de alta demanda, cierres, terraza con lluvia. */
const BloqueosReservasMesa = () => {
  const { configuracion } = useConfiguracionReservasMesa();
  const [bloqueos, setBloqueos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [form, setForm] = useState(VACIO);
  const [guardando, setGuardando] = useState(false);
  // Reservas ya tomadas dentro de un bloqueo (al crearlo o al revisarlo después)
  const [revision, setRevision] = useState(null); // { bloqueo, afectadas }

  const sectores = configuracion?.sectores || [];
  const nombreSector = (id) => sectores.find((s) => String(s._id) === String(id))?.nombre || "Sector";

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const { data } = await getBloqueosReservasMesa();
      setBloqueos(data);
    } catch (e) {
      Swal.fire("Error", mensajeError(e), "error");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const set = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  const crear = async () => {
    setGuardando(true);
    try {
      const { data } = await postBloqueoReservasMesa({
        fecha: form.fecha,
        tipo: form.tipo,
        sectorId: form.sectorId || null,
        horaDesde: form.tramo ? form.horaDesde : null,
        horaHasta: form.tramo && form.horaHasta ? form.horaHasta : null,
        motivo: form.motivo,
      });
      setForm(VACIO());
      await cargar();

      if (data.afectadas?.length) {
        setRevision({ bloqueo: data.bloqueo, afectadas: data.afectadas });
      } else {
        Swal.fire({ icon: "success", title: "Bloqueo creado", timer: 1500, showConfirmButton: false });
      }
    } catch (e) {
      Swal.fire("No se pudo crear", mensajeError(e), "error");
    } finally {
      setGuardando(false);
    }
  };

  const revisar = async (b) => {
    try {
      const { data } = await getAfectadasBloqueoMesa(b._id);
      setRevision(data);
    } catch (e) {
      Swal.fire("Error", mensajeError(e), "error");
    }
  };

  const eliminar = async (b) => {
    const r = await Swal.fire({
      title: "¿Quitar este bloqueo?",
      text: "Se vuelven a aceptar reservas en ese horario.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Quitar",
      cancelButtonText: "Volver",
    });
    if (!r.isConfirmed) return;
    try {
      await deleteBloqueoReservasMesa(b._id);
      await cargar();
    } catch (e) {
      Swal.fire("No se pudo quitar", mensajeError(e), "error");
    }
  };

  const ordenLlegada = form.tipo === "orden_llegada";

  return (
    <>
      <EncabezadoReservasMesa
        titulo="Bloqueos y fechas especiales"
        subtitulo="Días, sectores o tramos de horas en que no se reciben reservas"
      />
      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col xl="9">
            <Card className="shadow mb-4">
              <CardHeader>
                <h3 className="mb-0">Bloquear reservas</h3>
                <small className="text-muted">
                  Las reservas ya tomadas no se cancelan solas: al crear el bloqueo te mostramos cuáles son para que decidas.
                </small>
              </CardHeader>
              <CardBody>
                <Label className="d-block">¿Qué pasa ese día?</Label>
                <Row className="mb-2">
                  {TIPOS.map((t) => {
                    const activo = form.tipo === t.value;
                    return (
                      <Col xs="12" md="6" key={t.value} className="mb-2">
                        <button
                          type="button"
                          onClick={() => set("tipo", t.value)}
                          aria-pressed={activo}
                          className="w-100 h-100 text-left rounded p-3"
                          style={{
                            background: activo ? `${t.color}0d` : "#fff",
                            border: `2px solid ${activo ? t.color : "#e9ecef"}`,
                            boxShadow: activo ? `0 0 0 3px ${t.color}22` : "none",
                          }}
                        >
                          <strong style={{ color: activo ? t.color : "#32325d" }}>{t.titulo}</strong>
                          <div className="small text-muted mt-1">{t.detalle}</div>
                        </button>
                      </Col>
                    );
                  })}
                </Row>
                <Row>
                  <Col xs="12" md="4">
                    <FormGroup>
                      <Label for="bl-fecha">Fecha</Label>
                      <Input id="bl-fecha" type="date" min={hoyChile()} value={form.fecha} onChange={(e) => set("fecha", e.target.value)} />
                    </FormGroup>
                  </Col>
                  <Col xs="12" md="4">
                    <FormGroup>
                      <Label for="bl-sector">Sector</Label>
                      <Input id="bl-sector" type="select" value={form.sectorId} onChange={(e) => set("sectorId", e.target.value)}>
                        <option value="">Todo el local</option>
                        {sectores.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.nombre}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col xs="12" md="4">
                    <FormGroup>
                      <Label for="bl-motivo">{ordenLlegada ? "Nombre del día (opcional)" : "Motivo (opcional)"}</Label>
                      <Input
                        id="bl-motivo"
                        value={form.motivo}
                        maxLength={200}
                        placeholder={ordenLlegada ? "Ej: Día de la Madre" : "Ej: lluvia, evento privado"}
                        onChange={(e) => set("motivo", e.target.value)}
                      />
                      <small className="text-muted">Los clientes lo ven al intentar reservar.</small>
                    </FormGroup>
                  </Col>
                </Row>
                <div className="custom-control custom-switch mb-2">
                  <input id="bl-tramo" type="checkbox" className="custom-control-input" checked={form.tramo} onChange={(e) => set("tramo", e.target.checked)} />
                  <label className="custom-control-label" htmlFor="bl-tramo">
                    Solo un tramo de horas{ordenLlegada ? " (ej: desde las 20:00 solo por orden de llegada)" : ""}
                  </label>
                </div>
                {form.tramo && (
                  <Row>
                    <Col xs="6" md="3">
                      <FormGroup>
                        <Label for="bl-desde">Desde</Label>
                        <Input id="bl-desde" type="time" step="900" value={form.horaDesde} onChange={(e) => set("horaDesde", e.target.value)} />
                      </FormGroup>
                    </Col>
                    <Col xs="6" md="3">
                      <FormGroup>
                        <Label for="bl-hasta">{ordenLlegada ? "Hasta (opcional)" : "Hasta"}</Label>
                        <Input id="bl-hasta" type="time" step="900" value={form.horaHasta} onChange={(e) => set("horaHasta", e.target.value)} />
                      </FormGroup>
                    </Col>
                    <Col xs="12" md="6" className="d-flex align-items-center">
                      <small className="text-muted mb-3">
                        {ordenLlegada ? "Si lo dejas vacío, dura hasta el cierre. " : ""}A la hora "hasta" ya se vuelve a
                        recibir reservas.
                      </small>
                    </Col>
                  </Row>
                )}
                {ordenLlegada && form.sectorId && (
                  <div className="alert alert-light border small">
                    Ojo: con un sector elegido, solo ese sector queda sin reservas y el resto se sigue reservando
                    normal. El aviso "solo por orden de llegada" en la página de reservas aparece cuando el bloqueo es
                    de todo el local.
                  </div>
                )}
                <Button
                  className="m-0"
                  style={{ background: tipoDe(form.tipo).color, borderColor: tipoDe(form.tipo).color, color: "#fff" }}
                  disabled={guardando || !form.fecha}
                  onClick={crear}
                >
                  {guardando ? "Creando..." : "Crear bloqueo"}
                </Button>
              </CardBody>
            </Card>

            <Card className="shadow">
              <CardHeader>
                <h4 className="mb-0">Próximos bloqueos</h4>
              </CardHeader>
              <CardBody>
                {cargando ? (
                  <div className="text-center py-3">
                    <Spinner />
                  </div>
                ) : bloqueos.length === 0 ? (
                  <p className="text-muted mb-0">No hay bloqueos programados.</p>
                ) : (
                  bloqueos.map((b) => {
                    const t = tipoDe(b.tipo);
                    return (
                      <div key={b._id} className="d-flex flex-wrap justify-content-between align-items-center border-bottom py-2" style={{ gap: 12 }}>
                        <div style={{ minWidth: 0, flex: "1 1 260px" }}>
                          <strong>{capitalizar(fechaLarga(b.fecha))}</strong>{" "}
                          <Badge pill style={{ background: `${t.color}1f`, color: t.color }}>
                            {t.badge}
                          </Badge>
                          <div className="small text-muted">
                            {b.sector ? nombreSector(b.sector) : "Todo el local"} ·{" "}
                            {!b.horaDesde ? "Día completo" : b.horaHasta === "23:59" ? `Desde las ${b.horaDesde}` : `${b.horaDesde} a ${b.horaHasta}`}
                            {b.motivo ? ` · ${b.motivo}` : ""}
                          </div>
                          {b.afectadas > 0 && (
                            <div className="small mt-1" style={{ color: "#c25e00" }}>
                              {b.afectadas} reserva(s) tomada(s) siguen vigentes ese día
                            </div>
                          )}
                        </div>
                        <div className="d-flex" style={{ gap: 8 }}>
                          {b.afectadas > 0 && (
                            <Button size="sm" color="warning" outline className="m-0" onClick={() => revisar(b)}>
                              Revisar reservas
                            </Button>
                          )}
                          <Button size="sm" outline color="danger" className="m-0" onClick={() => eliminar(b)}>
                            Quitar
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <ModalAfectadasBloqueo
        isOpen={!!revision}
        toggle={() => setRevision(null)}
        bloqueo={revision?.bloqueo}
        afectadas={revision?.afectadas || []}
        onCambio={cargar}
      />
    </>
  );
};

export default BloqueosReservasMesa;

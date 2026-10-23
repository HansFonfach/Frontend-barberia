import React, { useCallback, useEffect, useState } from "react";
import { Button, Card, CardBody, CardHeader, Col, Container, FormGroup, Input, Label, Row, Spinner } from "reactstrap";
import Swal from "sweetalert2";
import EncabezadoReservasMesa from "components/reservasMesa/EncabezadoReservasMesa";
import { useConfiguracionReservasMesa } from "hooks/useReservasMesa";
import { deleteBloqueoReservasMesa, getBloqueosReservasMesa, postBloqueoReservasMesa } from "api/reservasMesa";
import { capitalizar, fechaLarga, hoyChile, mensajeError } from "utils/reservasMesa";

const VACIO = () => ({ fecha: hoyChile(), sectorId: "", tramo: false, horaDesde: "", horaHasta: "", motivo: "" });

const escapar = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/** Días o tramos sin reservas: terraza con lluvia, evento privado, cierre. */
const BloqueosReservasMesa = () => {
  const { configuracion } = useConfiguracionReservasMesa();
  const [bloqueos, setBloqueos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [form, setForm] = useState(VACIO);
  const [guardando, setGuardando] = useState(false);

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
        sectorId: form.sectorId || null,
        horaDesde: form.tramo ? form.horaDesde : null,
        horaHasta: form.tramo ? form.horaHasta : null,
        motivo: form.motivo,
      });
      setForm(VACIO());
      await cargar();

      if (data.afectadas?.length) {
        const lista = data.afectadas
          .map((r) => `<li>${escapar(r.hora)} · ${escapar(r.cliente.nombre)} · ${r.personas} pers. · ${escapar(r.sector.nombre)} · ${escapar(r.cliente.telefono)}</li>`)
          .join("");
        Swal.fire({
          icon: "warning",
          title: `Bloqueo creado · ${data.afectadas.length} reserva(s) afectada(s)`,
          html: `<p>Estas reservas ya estaban tomadas y <strong>no se cancelaron</strong>. Muévelas de sector o avísales:</p><ul style="text-align:left">${lista}</ul>`,
        });
      } else {
        Swal.fire({ icon: "success", title: "Bloqueo creado", timer: 1500, showConfirmButton: false });
      }
    } catch (e) {
      Swal.fire("No se pudo crear", mensajeError(e), "error");
    } finally {
      setGuardando(false);
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

  return (
    <>
      <EncabezadoReservasMesa titulo="Bloqueos" subtitulo="Días, sectores o tramos de horas en que no se reciben reservas" />
      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col xl="9">
            <Card className="shadow mb-4">
              <CardHeader>
                <h3 className="mb-0">Bloquear reservas</h3>
                <small className="text-muted">Un día completo, un sector o un tramo de horas. Las reservas ya tomadas no se cancelan solas.</small>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col xs="12" md="4">
                    <FormGroup>
                      <Label>Fecha</Label>
                      <Input type="date" min={hoyChile()} value={form.fecha} onChange={(e) => set("fecha", e.target.value)} />
                    </FormGroup>
                  </Col>
                  <Col xs="12" md="4">
                    <FormGroup>
                      <Label>Sector</Label>
                      <Input type="select" value={form.sectorId} onChange={(e) => set("sectorId", e.target.value)}>
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
                      <Label>Motivo (opcional)</Label>
                      <Input value={form.motivo} maxLength={200} placeholder="Ej: lluvia, evento privado" onChange={(e) => set("motivo", e.target.value)} />
                    </FormGroup>
                  </Col>
                </Row>
                <div className="custom-control custom-switch mb-2">
                  <input id="bl-tramo" type="checkbox" className="custom-control-input" checked={form.tramo} onChange={(e) => set("tramo", e.target.checked)} />
                  <label className="custom-control-label" htmlFor="bl-tramo">
                    Solo un tramo de horas
                  </label>
                </div>
                {form.tramo && (
                  <Row>
                    <Col xs="6" md="3">
                      <FormGroup>
                        <Label>Desde</Label>
                        <Input type="time" step="900" value={form.horaDesde} onChange={(e) => set("horaDesde", e.target.value)} />
                      </FormGroup>
                    </Col>
                    <Col xs="6" md="3">
                      <FormGroup>
                        <Label>Hasta</Label>
                        <Input type="time" step="900" value={form.horaHasta} onChange={(e) => set("horaHasta", e.target.value)} />
                      </FormGroup>
                    </Col>
                  </Row>
                )}
                <Button color="danger" className="m-0" disabled={guardando || !form.fecha} onClick={crear}>
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
                  bloqueos.map((b) => (
                    <div key={b._id} className="d-flex justify-content-between align-items-center border-bottom py-2" style={{ gap: 12 }}>
                      <div style={{ minWidth: 0 }}>
                        <strong>{capitalizar(fechaLarga(b.fecha))}</strong>
                        <div className="small text-muted">
                          {b.sector ? nombreSector(b.sector) : "Todo el local"} ·{" "}
                          {b.horaDesde ? `${b.horaDesde} a ${b.horaHasta}` : "Día completo"}
                          {b.motivo ? ` · ${b.motivo}` : ""}
                        </div>
                      </div>
                      <Button size="sm" outline color="danger" className="m-0" onClick={() => eliminar(b)}>
                        Quitar
                      </Button>
                    </div>
                  ))
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default BloqueosReservasMesa;

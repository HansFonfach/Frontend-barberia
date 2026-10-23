import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Col,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Spinner,
} from "reactstrap";
import Swal from "sweetalert2";
import SelectorHoraSector from "./SelectorHoraSector";
import { getDisponibilidadMesa, postReservaMesa, patchReservaMesa } from "api/reservasMesa";
import { ORIGENES_MESA, hoyChile, mensajeError, nuevaClave } from "utils/reservasMesa";

const VACIO = {
  fecha: "",
  personas: 2,
  hora: "",
  sectorId: "",
  nombre: "",
  telefono: "",
  email: "",
  origen: "telefono",
  cumpleanos: { es: false, festejado: "", detalle: "" },
  comentarios: "",
};

const desdeReserva = (r) => ({
  fecha: r.fecha,
  personas: r.personas,
  hora: r.hora,
  sectorId: String(r.sector.id),
  nombre: r.cliente.nombre,
  telefono: r.cliente.telefono,
  email: r.cliente.email || "",
  origen: r.origen,
  cumpleanos: {
    es: !!r.cumpleanos?.es,
    festejado: r.cumpleanos?.festejado || "",
    detalle: r.cumpleanos?.detalle || "",
  },
  comentarios: r.comentarios || "",
});

const escapar = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/**
 * Crear o editar una reserva desde el panel. Pensado para usarse mientras se
 * habla por teléfono: fecha y personas primero, después se toca una hora
 * con lugar, y al final los datos del cliente.
 */
const FormReservaMesa = ({ isOpen, toggle, reserva = null, fechaInicial, onGuardada, enPagina = false }) => {
  // En página ("Nueva reserva" del menú) el formulario está siempre abierto
  const abierto = enPagina || isOpen;
  const editando = !!reserva;
  const [form, setForm] = useState(VACIO);
  const [horas, setHoras] = useState([]);
  const [faltantes, setFaltantes] = useState([]);
  const [cargandoHoras, setCargandoHoras] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [clave, setClave] = useState(nuevaClave());

  useEffect(() => {
    if (!abierto) return;
    setForm(reserva ? desdeReserva(reserva) : { ...VACIO, fecha: fechaInicial || hoyChile() });
    setClave(nuevaClave());
  }, [abierto, reserva, fechaInicial]);

  // Disponibilidad al cambiar fecha o personas
  useEffect(() => {
    if (!abierto || !form.fecha || !(Number(form.personas) >= 1)) return;
    let vigente = true;
    setCargandoHoras(true);
    const t = setTimeout(async () => {
      try {
        const { data } = await getDisponibilidadMesa({
          fecha: form.fecha,
          personas: Number(form.personas),
          excluir: reserva?._id,
        });
        if (!vigente) return;
        setHoras(data.horas || []);
        setFaltantes(data.faltantes || []);
      } catch (e) {
        if (vigente) setHoras([]);
      } finally {
        if (vigente) setCargandoHoras(false);
      }
    }, 250);
    return () => {
      vigente = false;
      clearTimeout(t);
    };
  }, [abierto, form.fecha, form.personas, reserva?._id]);

  const set = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));
  const setCumple = (campo, valor) =>
    setForm((f) => ({ ...f, cumpleanos: { ...f.cumpleanos, [campo]: valor } }));

  // Al editar una reserva en curso, su hora puede no estar en la lista
  // (ya pasó); se muestra igual para dejar claro que no cambia.
  const horaActualFueraDeLista = useMemo(
    () => editando && form.hora && !horas.some((h) => h.hora === form.hora),
    [editando, form.hora, horas],
  );

  const enviar = async (extra = {}) => {
    if (!form.hora || !form.sectorId) {
      return Swal.fire("Falta la hora", "Elige una hora y un sector con lugar.", "warning");
    }
    const cuerpo = {
      fecha: form.fecha,
      hora: form.hora,
      personas: Number(form.personas),
      sectorId: form.sectorId,
      nombre: form.nombre,
      telefono: form.telefono,
      email: form.email,
      origen: form.origen,
      cumpleanos: form.cumpleanos,
      comentarios: form.comentarios,
      ...(editando ? {} : { claveIdempotencia: clave }),
      ...extra,
    };

    setGuardando(true);
    try {
      const { data } = editando
        ? await patchReservaMesa(reserva._id, cuerpo)
        : await postReservaMesa(cuerpo);
      onGuardada?.(data);
      toggle();
      Swal.fire({
        icon: "success",
        title: editando ? "Reserva actualizada" : `Reserva registrada · ${data.codigo}`,
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (e) {
      const d = e?.response?.data || {};
      if (d.code === "POSIBLE_DUPLICADO") {
        const lista = (d.duplicados || [])
          .map((x) => `<li>${escapar(x.cliente?.nombre)} · ${escapar(x.hora)} · ${x.personas} pers. · ${escapar(x.sector?.nombre)} (#${escapar(x.codigo)})</li>`)
          .join("");
        const r = await Swal.fire({
          icon: "question",
          title: "¿Es una reserva distinta?",
          html: `<p>${escapar(d.message)}</p><ul style="text-align:left">${lista}</ul>`,
          showCancelButton: true,
          confirmButtonText: "Sí, registrar igual",
          cancelButtonText: "Volver",
        });
        if (r.isConfirmed) return enviar({ ...extra, confirmarDuplicado: true });
      } else if (d.code === "SIN_CUPO") {
        const alt = (d.alternativas || []).map((a) => `<li>${escapar(a.hora)} · ${escapar(a.sector)}</li>`).join("");
        const r = await Swal.fire({
          icon: "warning",
          title: "Sin lugar",
          html: `<p>${escapar(d.message)}</p>${alt ? `<p class="mb-1">Con lugar:</p><ul style="text-align:left">${alt}</ul>` : ""}`,
          showDenyButton: !!d.puedeForzar,
          denyButtonText: "Registrar con sobrecupo",
          confirmButtonText: "Elegir otra hora",
        });
        if (r.isDenied) return enviar({ ...extra, forzarSobrecupo: true });
      } else {
        Swal.fire("No se pudo guardar", mensajeError(e), "error");
      }
    } finally {
      setGuardando(false);
    }
  };

  const titulo = editando ? `Editar reserva #${reserva.codigo}` : "Nueva reserva";

  const pie = (
    <>
      <Button color="secondary" outline disabled={guardando} onClick={toggle}>
        Cancelar
      </Button>
      <Button color="primary" disabled={guardando} onClick={() => enviar()}>
        {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Registrar reserva"}
      </Button>
    </>
  );

  const cuerpo = (
      <>
        <Row>
          <Col xs="7" md="4">
            <FormGroup>
              <Label>Fecha</Label>
              <Input type="date" value={form.fecha} onChange={(e) => set("fecha", e.target.value)} />
            </FormGroup>
          </Col>
          <Col xs="5" md="3">
            <FormGroup>
              <Label>Personas</Label>
              <Input
                type="number"
                min="1"
                value={form.personas}
                onChange={(e) => set("personas", e.target.value)}
              />
            </FormGroup>
          </Col>
        </Row>

        <Label className="d-flex align-items-center" style={{ gap: 8 }}>
          Hora de llegada y sector {cargandoHoras && <Spinner size="sm" />}
        </Label>
        {faltantes.length > 0 ? (
          <div className="alert alert-warning py-2">
            Falta configurar: {faltantes.join(", ")}.
          </div>
        ) : !cargandoHoras && horas.length === 0 ? (
          <div className="text-muted small mb-3">Ese día no se reciben reservas o ya no quedan horas.</div>
        ) : (
          <div className="mb-3">
            <SelectorHoraSector
              horas={horas}
              valor={{ hora: form.hora, sectorId: form.sectorId }}
              onChange={({ hora, sectorId }) => setForm((f) => ({ ...f, hora, sectorId }))}
              mostrarCupos
            />
          </div>
        )}
        {horaActualFueraDeLista && (
          <div className="small text-muted mb-3">
            Hora actual: <strong>{form.hora}</strong> (se mantiene si no eliges otra).
          </div>
        )}

        <Row>
          <Col md="6">
            <FormGroup>
              <Label>Nombre</Label>
              <Input value={form.nombre} maxLength={80} onChange={(e) => set("nombre", e.target.value)} />
            </FormGroup>
          </Col>
          <Col md="6">
            <FormGroup>
              <Label>Teléfono</Label>
              <Input
                type="tel"
                value={form.telefono}
                maxLength={25}
                placeholder="+56 9 ..."
                onChange={(e) => set("telefono", e.target.value)}
              />
            </FormGroup>
          </Col>
          <Col md="6">
            <FormGroup>
              <Label>Correo (opcional)</Label>
              <Input
                type="email"
                value={form.email}
                maxLength={120}
                onChange={(e) => set("email", e.target.value)}
              />
              <small className="text-muted">Si lo ingresas, le llega la confirmación.</small>
            </FormGroup>
          </Col>
          <Col md="6">
            <FormGroup>
              <Label>¿Cómo reservó?</Label>
              <Input
                type="select"
                value={form.origen}
                disabled={form.origen === "web"}
                onChange={(e) => set("origen", e.target.value)}
              >
                {form.origen === "web" && <option value="web">Web</option>}
                {ORIGENES_MESA.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Input>
            </FormGroup>
          </Col>
        </Row>

        <div className="custom-control custom-switch mb-2">
          <input
            id="rm-cumple"
            type="checkbox"
            className="custom-control-input"
            checked={form.cumpleanos.es}
            onChange={(e) => setCumple("es", e.target.checked)}
          />
          <label className="custom-control-label" htmlFor="rm-cumple">
            Es un cumpleaños
          </label>
        </div>
        {form.cumpleanos.es && (
          <Row>
            <Col md="5">
              <FormGroup>
                <Label>¿De quién?</Label>
                <Input
                  value={form.cumpleanos.festejado}
                  maxLength={80}
                  onChange={(e) => setCumple("festejado", e.target.value)}
                />
              </FormGroup>
            </Col>
            <Col md="7">
              <FormGroup>
                <Label>Detalle (torta, decoración...)</Label>
                <Input
                  value={form.cumpleanos.detalle}
                  maxLength={300}
                  onChange={(e) => setCumple("detalle", e.target.value)}
                />
              </FormGroup>
            </Col>
          </Row>
        )}

        <FormGroup>
          <Label>Comentarios (opcional)</Label>
          <Input
            type="textarea"
            rows="2"
            maxLength={500}
            value={form.comentarios}
            placeholder="Silla de bebé, accesibilidad, preferencia de mesa..."
            onChange={(e) => set("comentarios", e.target.value)}
          />
        </FormGroup>
      </>
  );

  if (enPagina) {
    return (
      <Card className="shadow border-0">
        <CardBody className="p-4">{cuerpo}</CardBody>
        <CardFooter className="d-flex justify-content-end bg-white" style={{ gap: 8 }}>
          {pie}
        </CardFooter>
      </Card>
    );
  }

  return (
    <Modal isOpen={abierto} toggle={() => !guardando && toggle()} size="lg" scrollable>
      <ModalHeader toggle={() => !guardando && toggle()}>{titulo}</ModalHeader>
      <ModalBody>{cuerpo}</ModalBody>
      <ModalFooter>{pie}</ModalFooter>
    </Modal>
  );
};

export default FormReservaMesa;

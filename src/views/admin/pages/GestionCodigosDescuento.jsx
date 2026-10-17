import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Table,
} from "reactstrap";
import Swal from "sweetalert2";
import UserHeader from "components/Headers/UserHeader.js";
import { getServicios } from "api/servicios";
import {
  getCodigosDescuento,
  postCodigoDescuento,
  patchCodigoDescuento,
  deleteCodigoDescuento,
} from "api/codigosDescuento";

const ZONA = "America/Santiago";

const FORM_VACIO = {
  _id: null,
  codigo: "",
  descripcion: "",
  tipo: "porcentaje",
  valor: "",
  servicios: [],
  fechaInicio: "",
  fechaFin: "",
  cupos: "",
  maxUsosPorCliente: "",
  activo: true,
};

const ESTADOS = {
  vigente: { color: "success", texto: "Vigente" },
  pausado: { color: "secondary", texto: "Pausado" },
  programado: { color: "info", texto: "Programado" },
  vencido: { color: "danger", texto: "Vencido" },
  agotado: { color: "warning", texto: "Sin cupos" },
};

const pesos = (n) => `$${Number(n || 0).toLocaleString("es-CL")}`;

// Date (ISO del servidor) → "YYYY-MM-DD" del día de Chile, para <input type="date">
const aInputDia = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-CA", { timeZone: ZONA }) : "";

// "YYYY-MM-DD" → "DD-MM-YYYY"
const verDia = (iso) => {
  const d = aInputDia(iso);
  if (!d) return "";
  const [y, m, dia] = d.split("-");
  return `${dia}-${m}-${y}`;
};

const GestionCodigosDescuento = () => {
  const [codigos, setCodigos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);

  const editando = !!form._id;

  const cargar = useCallback(async () => {
    try {
      const [resCodigos, resServicios] = await Promise.all([
        getCodigosDescuento(),
        getServicios(),
      ]);
      setCodigos(resCodigos.data || []);
      const lista = Array.isArray(resServicios.data)
        ? resServicios.data
        : resServicios.data?.servicios || [];
      setServicios(lista.filter((s) => s.activo !== false));
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudieron cargar los códigos",
        "error",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const nombresServicios = useMemo(() => {
    const m = new Map();
    servicios.forEach((s) => m.set(String(s._id), s.nombre));
    return m;
  }, [servicios]);

  const set = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  const abrirNuevo = () => {
    setForm(FORM_VACIO);
    setModal(true);
  };

  const abrirEditar = (c) => {
    setForm({
      _id: c._id,
      codigo: c.codigo,
      descripcion: c.descripcion || "",
      tipo: c.tipo,
      valor: String(c.valor),
      servicios: (c.servicios || []).map((s) => String(s._id || s)),
      fechaInicio: aInputDia(c.fechaInicio),
      fechaFin: aInputDia(c.fechaFin),
      cupos: c.cupos != null ? String(c.cupos) : "",
      maxUsosPorCliente:
        c.maxUsosPorCliente != null ? String(c.maxUsosPorCliente) : "",
      activo: c.activo !== false,
    });
    setModal(true);
  };

  const toggleServicio = (id) =>
    setForm((f) => ({
      ...f,
      servicios: f.servicios.includes(id)
        ? f.servicios.filter((s) => s !== id)
        : [...f.servicios, id],
    }));

  const todosSeleccionados =
    servicios.length > 0 && form.servicios.length === servicios.length;

  const toggleTodos = () =>
    setForm((f) => ({
      ...f,
      servicios: todosSeleccionados ? [] : servicios.map((s) => String(s._id)),
    }));

  const guardar = async () => {
    const codigo = form.codigo.trim().toUpperCase().replace(/\s+/g, "");
    if (!editando && !/^[A-Z0-9_-]{3,20}$/.test(codigo)) {
      return Swal.fire(
        "Revisa el código",
        "Debe tener entre 3 y 20 caracteres: letras, números, guion o guion bajo, sin espacios.",
        "warning",
      );
    }
    const valor = Number(form.valor);
    if (!Number.isInteger(valor) || valor < 1) {
      return Swal.fire("Revisa el descuento", "Ingresa un valor mayor a 0.", "warning");
    }
    if (form.tipo === "porcentaje" && valor > 100) {
      return Swal.fire("Revisa el descuento", "El porcentaje no puede pasar de 100.", "warning");
    }
    if (form.servicios.length === 0) {
      return Swal.fire("Falta algo", "Elige al menos un servicio para el código.", "warning");
    }
    if (form.fechaInicio && form.fechaFin && form.fechaFin < form.fechaInicio) {
      return Swal.fire("Revisa las fechas", "La fecha de término no puede ser anterior al inicio.", "warning");
    }

    const payload = {
      descripcion: form.descripcion,
      tipo: form.tipo,
      valor,
      servicios: form.servicios,
      fechaInicio: form.fechaInicio || null,
      fechaFin: form.fechaFin || null,
      cupos: form.cupos === "" ? null : Number(form.cupos),
      maxUsosPorCliente:
        form.maxUsosPorCliente === "" ? null : Number(form.maxUsosPorCliente),
      activo: form.activo,
    };

    setGuardando(true);
    try {
      if (editando) {
        await patchCodigoDescuento(form._id, payload);
      } else {
        await postCodigoDescuento({ ...payload, codigo });
      }
      setModal(false);
      await cargar();
      Swal.fire("Listo", editando ? "Código actualizado" : "Código creado", "success");
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo guardar el código",
        "error",
      );
    } finally {
      setGuardando(false);
    }
  };

  const alternarActivo = async (c) => {
    try {
      await patchCodigoDescuento(c._id, { activo: !c.activo });
      await cargar();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "No se pudo cambiar el estado", "error");
    }
  };

  const eliminar = async (c) => {
    const r = await Swal.fire({
      title: `¿Eliminar ${c.codigo}?`,
      text:
        c.usos > 0
          ? "Las reservas que ya lo usaron conservan su descuento."
          : "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!r.isConfirmed) return;
    try {
      await deleteCodigoDescuento(c._id);
      await cargar();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "No se pudo eliminar", "error");
    }
  };

  const vistaVigencia = (c) => {
    const ini = verDia(c.fechaInicio);
    const fin = verDia(c.fechaFin);
    if (!ini && !fin) return <span className="text-muted">Sin fecha límite</span>;
    if (ini && fin) return `${ini} → ${fin}`;
    if (ini) return `Desde ${ini}`;
    return `Hasta ${fin}`;
  };

  return (
    <>
      <UserHeader />
      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col xl="11">
            <Card className="shadow">
              <CardHeader>
                <Row className="align-items-center">
                  <Col xs="12" md>
                    <h3 className="mb-0">Códigos de descuento</h3>
                    <small className="text-muted">
                      Crea códigos (ej. DIADELPROFE) para que tus clientes los ingresen al reservar.
                    </small>
                  </Col>
                  <Col xs="12" md="auto" className="mt-3 mt-md-0">
                    <Button
                      color="primary"
                      className="btn-block d-md-inline-block"
                      onClick={abrirNuevo}
                    >
                      + Nuevo código
                    </Button>
                  </Col>
                </Row>
              </CardHeader>

              <CardBody className="p-0">
                {cargando ? (
                  <div className="text-center py-5">
                    <div className="spinner-border" />
                  </div>
                ) : codigos.length === 0 ? (
                  <div className="text-center text-muted py-5 px-3">
                    Todavía no tienes códigos. Crea el primero con “Nuevo código”.
                  </div>
                ) : (
                  <>
                  {/* Escritorio: tabla */}
                  <div className="table-responsive d-none d-md-block">
                    <Table className="align-items-center mb-0" hover>
                      <thead className="thead-light">
                        <tr>
                          <th>Código</th>
                          <th>Descuento</th>
                          <th>Servicios</th>
                          <th>Vigencia</th>
                          <th>Usos</th>
                          <th>Estado</th>
                          <th className="text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {codigos.map((c) => {
                          const estado = ESTADOS[c.estadoVigencia] || ESTADOS.vigente;
                          const nombres = (c.servicios || []).map(
                            (s) => s.nombre || nombresServicios.get(String(s._id || s)) || "—",
                          );
                          return (
                            <tr key={c._id}>
                              <td>
                                <strong>{c.codigo}</strong>
                                {c.descripcion && (
                                  <div className="small text-muted">{c.descripcion}</div>
                                )}
                              </td>
                              <td>
                                {c.tipo === "porcentaje" ? `${c.valor}%` : pesos(c.valor)}
                              </td>
                              <td style={{ maxWidth: 220 }}>
                                <span className="small">
                                  {nombres.slice(0, 2).join(", ")}
                                  {nombres.length > 2 && ` +${nombres.length - 2} más`}
                                </span>
                              </td>
                              <td className="small">{vistaVigencia(c)}</td>
                              <td className="small">
                                <strong>
                                  {c.usos}
                                  {c.cupos != null ? ` / ${c.cupos}` : ""}
                                </strong>{" "}
                                {c.cupos != null ? "cupos" : "usos"}
                                {c.usos > 0 && (
                                  <div className="text-muted">
                                    {pesos(c.ahorroTotal)} descontados
                                  </div>
                                )}
                                {c.maxUsosPorCliente != null && (
                                  <div className="text-muted">
                                    máx. {c.maxUsosPorCliente} por cliente
                                  </div>
                                )}
                              </td>
                              <td>
                                <Badge color={estado.color} pill>
                                  {estado.texto}
                                </Badge>
                              </td>
                              <td className="text-right" style={{ whiteSpace: "nowrap" }}>
                                <Button
                                  size="sm"
                                  outline
                                  color={c.activo ? "warning" : "success"}
                                  className="mr-1"
                                  onClick={() => alternarActivo(c)}
                                >
                                  {c.activo ? "Pausar" : "Activar"}
                                </Button>
                                <Button
                                  size="sm"
                                  outline
                                  color="primary"
                                  className="mr-1"
                                  onClick={() => abrirEditar(c)}
                                >
                                  Editar
                                </Button>
                                <Button
                                  size="sm"
                                  outline
                                  color="danger"
                                  onClick={() => eliminar(c)}
                                >
                                  Eliminar
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>

                  {/* Celular: una tarjeta por código */}
                  <div className="d-md-none">
                    {codigos.map((c) => {
                      const estado = ESTADOS[c.estadoVigencia] || ESTADOS.vigente;
                      const nombres = (c.servicios || []).map(
                        (sv) => sv.nombre || nombresServicios.get(String(sv._id || sv)) || "—",
                      );
                      return (
                        <div key={c._id} className="p-3 border-bottom">
                          <div
                            className="d-flex justify-content-between align-items-start"
                            style={{ gap: 8 }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <strong style={{ fontSize: "1.05rem", wordBreak: "break-all" }}>
                                {c.codigo}
                              </strong>
                              {c.descripcion && (
                                <div className="small text-muted">{c.descripcion}</div>
                              )}
                            </div>
                            <Badge color={estado.color} pill style={{ flexShrink: 0 }}>
                              {estado.texto}
                            </Badge>
                          </div>

                          <div className="mt-2" style={{ fontSize: "1.4rem", fontWeight: 700 }}>
                            {c.tipo === "porcentaje" ? `${c.valor}%` : pesos(c.valor)}{" "}
                            <span
                              className="text-muted"
                              style={{ fontSize: "0.8rem", fontWeight: 400 }}
                            >
                              de descuento
                            </span>
                          </div>

                          <div className="small mt-2">
                            <span className="text-muted">Servicios: </span>
                            {nombres.join(", ")}
                          </div>
                          <div className="small mt-1">
                            <span className="text-muted">Vigencia: </span>
                            {vistaVigencia(c)}
                          </div>
                          <div className="small mt-1">
                            <span className="text-muted">Usos: </span>
                            <strong>
                              {c.usos}
                              {c.cupos != null ? ` / ${c.cupos}` : ""}
                            </strong>
                            {c.cupos != null ? " cupos" : ""}
                            {c.usos > 0 && ` · ${pesos(c.ahorroTotal)} descontados`}
                            {c.maxUsosPorCliente != null &&
                              ` · máx. ${c.maxUsosPorCliente} por cliente`}
                          </div>

                          <div className="d-flex mt-3" style={{ gap: 8 }}>
                            <Button
                              size="sm"
                              outline
                              color={c.activo ? "warning" : "success"}
                              className="flex-fill m-0"
                              onClick={() => alternarActivo(c)}
                            >
                              {c.activo ? "Pausar" : "Activar"}
                            </Button>
                            <Button
                              size="sm"
                              outline
                              color="primary"
                              className="flex-fill m-0"
                              onClick={() => abrirEditar(c)}
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              outline
                              color="danger"
                              className="flex-fill m-0"
                              onClick={() => eliminar(c)}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal isOpen={modal} toggle={() => !guardando && setModal(false)} size="lg">
        <ModalHeader toggle={() => !guardando && setModal(false)}>
          {editando ? `Editar ${form.codigo}` : "Nuevo código de descuento"}
        </ModalHeader>
        <ModalBody>
          <Form onSubmit={(e) => e.preventDefault()}>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label>Código</Label>
                  <Input
                    value={form.codigo}
                    disabled={editando}
                    maxLength={20}
                    placeholder="Ej: DIADELPROFE"
                    onChange={(e) =>
                      set("codigo", e.target.value.toUpperCase().replace(/\s+/g, ""))
                    }
                  />
                  <small className="text-muted">
                    {editando
                      ? "El nombre del código no se puede cambiar."
                      : "Es lo que escribirá el cliente. Sin espacios."}
                  </small>
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label>Descripción (opcional)</Label>
                  <Input
                    value={form.descripcion}
                    maxLength={200}
                    placeholder="Ej: Promo Día del Profesor"
                    onChange={(e) => set("descripcion", e.target.value)}
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md="6">
                <FormGroup>
                  <Label>Tipo de descuento</Label>
                  <Input
                    type="select"
                    value={form.tipo}
                    onChange={(e) => set("tipo", e.target.value)}
                  >
                    <option value="porcentaje">Porcentaje (%)</option>
                    <option value="monto">Monto fijo ($)</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label>{form.tipo === "porcentaje" ? "Porcentaje" : "Monto a descontar"}</Label>
                  <Input
                    type="number"
                    min="1"
                    max={form.tipo === "porcentaje" ? 100 : undefined}
                    value={form.valor}
                    placeholder={form.tipo === "porcentaje" ? "Ej: 20" : "Ej: 3000"}
                    onChange={(e) => set("valor", e.target.value)}
                  />
                </FormGroup>
              </Col>
            </Row>

            <FormGroup>
              <Label className="d-flex justify-content-between align-items-center">
                <span>Servicios donde aplica</span>
                <Button size="sm" color="link" className="p-0" onClick={toggleTodos}>
                  {todosSeleccionados ? "Quitar todos" : "Seleccionar todos"}
                </Button>
              </Label>
              <div
                className="border rounded p-2"
                style={{ maxHeight: 180, overflowY: "auto" }}
              >
                {servicios.length === 0 ? (
                  <span className="text-muted small">No hay servicios activos.</span>
                ) : (
                  servicios.map((s) => {
                    const id = String(s._id);
                    return (
                      <div key={id} className="custom-control custom-checkbox mb-1">
                        <input
                          className="custom-control-input"
                          id={`cd-serv-${id}`}
                          type="checkbox"
                          checked={form.servicios.includes(id)}
                          onChange={() => toggleServicio(id)}
                        />
                        <label className="custom-control-label" htmlFor={`cd-serv-${id}`}>
                          {s.nombre}{" "}
                          <span className="text-muted small">({pesos(s.precio)})</span>
                        </label>
                      </div>
                    );
                  })
                )}
              </div>
            </FormGroup>

            <h6 className="text-uppercase text-muted mt-4 mb-2">
              Cuándo caduca (vence con lo primero que se cumpla)
            </h6>
            <Row>
              <Col md="3">
                <FormGroup>
                  <Label>Desde (opcional)</Label>
                  <Input
                    type="date"
                    value={form.fechaInicio}
                    onChange={(e) => set("fechaInicio", e.target.value)}
                  />
                </FormGroup>
              </Col>
              <Col md="3">
                <FormGroup>
                  <Label>Hasta (opcional)</Label>
                  <Input
                    type="date"
                    value={form.fechaFin}
                    onChange={(e) => set("fechaFin", e.target.value)}
                  />
                </FormGroup>
              </Col>
              <Col md="3">
                <FormGroup>
                  <Label>Cupos totales</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.cupos}
                    placeholder="Sin límite"
                    onChange={(e) => set("cupos", e.target.value)}
                  />
                </FormGroup>
              </Col>
              <Col md="3">
                <FormGroup>
                  <Label>Máx. por cliente</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.maxUsosPorCliente}
                    placeholder="Sin límite"
                    onChange={(e) => set("maxUsosPorCliente", e.target.value)}
                  />
                </FormGroup>
              </Col>
            </Row>
            <small className="text-muted d-block mb-2">
              Las fechas son el período en que el cliente puede <strong>usar</strong> el código al
              reservar. Un cupo se libera si la reserva se cancela. El código no se combina con
              servicios que ya tengan una promoción activa.
            </small>

            <div className="custom-control custom-switch mt-3">
              <input
                className="custom-control-input"
                id="cd-activo"
                type="checkbox"
                checked={form.activo}
                onChange={(e) => set("activo", e.target.checked)}
              />
              <label className="custom-control-label" htmlFor="cd-activo">
                Código activo
              </label>
            </div>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline disabled={guardando} onClick={() => setModal(false)}>
            Cancelar
          </Button>
          <Button color="primary" disabled={guardando} onClick={guardar}>
            {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear código"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default GestionCodigosDescuento;

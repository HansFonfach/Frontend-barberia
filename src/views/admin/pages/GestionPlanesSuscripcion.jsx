import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Row,
  Col,
  Table,
  Modal,
  ModalBody,
  ModalHeader,
  Form,
  FormGroup,
  Input,
  Badge,
} from "reactstrap";
import UserHeader from "components/Headers/UserHeader.js";
import Swal from "sweetalert2";
import PlanesSuscripcionContext from "context/PlanesSuscripcionContext";
import { useServicios } from "context/ServiciosContext";

const FORM_VACIO = {
  _id: null,
  nombre: "",
  descripcion: "",
  precio: "",
  duracionDias: "30",
  cicloDias: "30",
  cantidadPorCiclo: "2",
  serviciosPermitidos: [],
  diasVisibilidadCalendario: "40",
};

const formatoPesos = (valor) => {
  if (valor === null || valor === undefined || valor === "") return "—";
  return `$${Number(valor).toLocaleString("es-CL")}`;
};

const resumenServicios = (plan) => {
  if (!plan.serviciosPermitidos?.length) return "Cualquier servicio";
  return plan.serviciosPermitidos.map((s) => s.nombre).join(", ");
};

const resumenCiclo = (plan) => {
  const esMultiCiclo = plan.cicloDias < plan.duracionDias;
  if (!esMultiCiclo) {
    return `${plan.cantidadPorCiclo} servicio${plan.cantidadPorCiclo === 1 ? "" : "s"} en ${plan.duracionDias} días`;
  }
  return `${plan.cantidadPorCiclo} servicio${plan.cantidadPorCiclo === 1 ? "" : "s"} cada ${plan.cicloDias} días, por ${plan.duracionDias} días en total`;
};

const GestionPlanesSuscripcion = () => {
  const {
    planes,
    loadingPlanes,
    getAllPlanes,
    crearPlan,
    actualizarPlan,
    toggleActivoPlan,
    eliminarPlan,
  } = useContext(PlanesSuscripcionContext);
  const { servicios } = useServicios();

  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState(FORM_VACIO);

  useEffect(() => {
    getAllPlanes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => setModal(!modal);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleToggleServicio = (servicioId) => {
    setForm((prev) => {
      const yaEsta = prev.serviciosPermitidos.includes(servicioId);
      return {
        ...prev,
        serviciosPermitidos: yaEsta
          ? prev.serviciosPermitidos.filter((id) => id !== servicioId)
          : [...prev.serviciosPermitidos, servicioId],
      };
    });
  };

  const handleNuevo = () => {
    setEditando(false);
    setForm(FORM_VACIO);
    setModal(true);
  };

  const handleEditar = (plan) => {
    setEditando(true);
    setForm({
      _id: plan._id,
      nombre: plan.nombre || "",
      descripcion: plan.descripcion || "",
      precio: plan.precio ?? "",
      duracionDias: plan.duracionDias ?? "30",
      cicloDias: plan.cicloDias ?? "30",
      cantidadPorCiclo: plan.cantidadPorCiclo ?? "2",
      serviciosPermitidos: (plan.serviciosPermitidos || []).map((s) => s._id),
      diasVisibilidadCalendario: plan.diasVisibilidadCalendario ?? "40",
    });
    setModal(true);
  };

  const handleGuardar = async () => {
    if (!form.nombre.trim()) {
      Swal.fire("Error", "El nombre del plan es obligatorio", "error");
      return;
    }
    if (form.precio === "" || Number(form.precio) < 0) {
      Swal.fire("Error", "Ingresa un precio válido", "error");
      return;
    }
    if (!form.duracionDias || Number(form.duracionDias) <= 0) {
      Swal.fire("Error", "La duración del plan debe ser mayor a 0 días", "error");
      return;
    }
    if (!form.cicloDias || Number(form.cicloDias) <= 0) {
      Swal.fire("Error", "Los días por ciclo deben ser mayores a 0", "error");
      return;
    }
    if (Number(form.cicloDias) > Number(form.duracionDias)) {
      Swal.fire(
        "Error",
        "Los días por ciclo no pueden ser más que la duración total del plan",
        "error",
      );
      return;
    }
    if (!form.cantidadPorCiclo || Number(form.cantidadPorCiclo) <= 0) {
      Swal.fire(
        "Error",
        "La cantidad de servicios por ciclo debe ser mayor a 0",
        "error",
      );
      return;
    }

    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      precio: Number(form.precio),
      duracionDias: Number(form.duracionDias),
      cicloDias: Number(form.cicloDias),
      cantidadPorCiclo: Number(form.cantidadPorCiclo),
      serviciosPermitidos: form.serviciosPermitidos,
      diasVisibilidadCalendario: Number(form.diasVisibilidadCalendario) || 30,
    };

    try {
      if (editando) {
        await actualizarPlan(form._id, payload);
      } else {
        await crearPlan(payload);
      }
      Swal.fire("Listo", "Plan guardado correctamente", "success");
      setModal(false);
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo guardar el plan",
        "error",
      );
    }
  };

  const handleToggleActivo = async (plan) => {
    try {
      await toggleActivoPlan(plan._id);
    } catch (error) {
      Swal.fire("Error", "No se pudo cambiar el estado del plan", "error");
    }
  };

  const handleEliminar = async (plan) => {
    const confirmar = await Swal.fire({
      title: "¿Eliminar plan?",
      text: plan.nombre,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    });

    if (confirmar.isConfirmed) {
      try {
        const res = await eliminarPlan(plan._id);
        Swal.fire("Listo", res?.message || "Plan eliminado", "success");
      } catch (error) {
        Swal.fire("Error", "No se pudo eliminar el plan", "error");
      }
    }
  };

  const planesFiltrados = planes.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const sinPlanes = planesFiltrados.length === 0;

  return (
    <>
      <UserHeader />

      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col xl="10">
            <Card className="shadow">
              <CardHeader>
                <Row>
                  <Col>
                    <h3>Planes de suscripción</h3>
                    <small className="text-muted">
                      Crea y edita los planes que tus clientes pueden
                      contratar (créditos, servicios incluidos, precio y
                      duración)
                    </small>
                  </Col>
                  <Col className="text-right">
                    <Button color="primary" size="sm" onClick={handleNuevo}>
                      + Nuevo plan
                    </Button>
                  </Col>
                </Row>
              </CardHeader>

              <CardBody>
                <Row className="mb-3">
                  <Col md="6">
                    <Input
                      placeholder="Buscar plan..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                    />
                  </Col>
                  <Col className="text-right d-none d-md-block">
                    <Badge color="primary">
                      {planesFiltrados.length} planes
                    </Badge>
                  </Col>
                </Row>

                {loadingPlanes && (
                  <div className="text-center py-5 text-muted">
                    Cargando...
                  </div>
                )}

                {!loadingPlanes && sinPlanes && (
                  <div className="text-center py-5 text-muted">
                    <i className="fas fa-id-card" style={{ fontSize: 40 }} />
                    <h4 className="mt-3">No hay planes creados aún</h4>
                    <p className="mb-3">
                      Crea tu primer plan, por ejemplo "2 cortes al mes".
                    </p>
                    <Button color="primary" size="sm" onClick={handleNuevo}>
                      + Crear plan
                    </Button>
                  </div>
                )}

                {/* MOBILE */}
                {!loadingPlanes && !sinPlanes && (
                  <div className="d-block d-md-none">
                    {planesFiltrados.map((p) => (
                      <Card key={p._id} className="mb-3 shadow-sm">
                        <CardBody>
                          <div className="d-flex justify-content-between align-items-start">
                            <h5 className="mb-1">{p.nombre}</h5>
                            <Badge color={p.activo ? "success" : "secondary"}>
                              {p.activo ? "Activo" : "Inactivo"}
                            </Badge>
                          </div>
                          <p className="text-muted small mb-2">
                            {resumenCiclo(p)}
                          </p>
                          <p className="text-muted small mb-2">
                            Servicios: {resumenServicios(p)}
                          </p>
                          <p className="mb-2">
                            <strong>{formatoPesos(p.precio)}</strong>
                          </p>
                          <p className="text-muted small mb-2">
                            Calendario: {p.diasVisibilidadCalendario} días de
                            anticipación
                          </p>
                          <div className="d-flex flex-wrap" style={{ gap: 8 }}>
                            <Button
                              size="sm"
                              color="primary"
                              onClick={() => handleEditar(p)}
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              color={p.activo ? "secondary" : "success"}
                              outline
                              onClick={() => handleToggleActivo(p)}
                            >
                              {p.activo ? "Desactivar" : "Activar"}
                            </Button>
                            <Button
                              size="sm"
                              color="danger"
                              onClick={() => handleEliminar(p)}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                )}

                {/* DESKTOP */}
                {!loadingPlanes && !sinPlanes && (
                  <div className="d-none d-md-block">
                    <Table responsive>
                      <thead>
                        <tr>
                          <th>Plan</th>
                          <th>Servicios / ciclo</th>
                          <th>Precio</th>
                          <th>Calendario</th>
                          <th>Estado</th>
                          <th className="text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {planesFiltrados.map((p) => (
                          <tr key={p._id}>
                            <td>
                              {p.nombre}
                              <div className="text-muted small">
                                {resumenServicios(p)}
                              </div>
                            </td>
                            <td>{resumenCiclo(p)}</td>
                            <td>{formatoPesos(p.precio)}</td>
                            <td>{p.diasVisibilidadCalendario} días</td>
                            <td>
                              <Badge
                                color={p.activo ? "success" : "secondary"}
                              >
                                {p.activo ? "Activo" : "Inactivo"}
                              </Badge>
                            </td>
                            <td className="text-right">
                              <Button
                                size="sm"
                                color="primary"
                                className="mr-2"
                                onClick={() => handleEditar(p)}
                              >
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                color={p.activo ? "secondary" : "success"}
                                outline
                                className="mr-2"
                                onClick={() => handleToggleActivo(p)}
                              >
                                {p.activo ? "Desactivar" : "Activar"}
                              </Button>
                              <Button
                                size="sm"
                                color="danger"
                                onClick={() => handleEliminar(p)}
                              >
                                Eliminar
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* MODAL CREAR/EDITAR */}
      <Modal isOpen={modal} toggle={toggle} centered size="lg">
        <ModalHeader toggle={toggle}>
          {editando ? "Editar plan" : "Nuevo plan"}
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <label>Nombre del plan</label>
              <Input
                name="nombre"
                placeholder="Ej: La Santa Navaja"
                value={form.nombre}
                onChange={handleChange}
              />
            </FormGroup>

            <FormGroup>
              <label>Descripción (opcional)</label>
              <Input
                name="descripcion"
                placeholder="Ej: 2 servicios al mes"
                value={form.descripcion}
                onChange={handleChange}
              />
            </FormGroup>

            <Row>
              <Col md="6">
                <FormGroup>
                  <label>Precio ($)</label>
                  <Input
                    type="number"
                    name="precio"
                    value={form.precio}
                    onChange={handleChange}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label>Días de anticipación en el calendario</label>
                  <Input
                    type="number"
                    name="diasVisibilidadCalendario"
                    value={form.diasVisibilidadCalendario}
                    onChange={handleChange}
                  />
                  <small className="text-muted">
                    Con cuántos días de anticipación puede reservar un
                    suscriptor de este plan
                  </small>
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md="4">
                <FormGroup>
                  <label>Duración total (días)</label>
                  <Input
                    type="number"
                    name="duracionDias"
                    value={form.duracionDias}
                    onChange={handleChange}
                  />
                  <small className="text-muted">30 = un mes, 365 = un año</small>
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <label>Días por ciclo</label>
                  <Input
                    type="number"
                    name="cicloDias"
                    value={form.cicloDias}
                    onChange={handleChange}
                  />
                  <small className="text-muted">
                    Cada cuánto se resetea la cuota (igual a la duración si el
                    plan no se renueva por ciclos)
                  </small>
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <label>Servicios por ciclo</label>
                  <Input
                    type="number"
                    name="cantidadPorCiclo"
                    value={form.cantidadPorCiclo}
                    onChange={handleChange}
                  />
                </FormGroup>
              </Col>
            </Row>

            {Number(form.cicloDias) > 0 &&
              Number(form.duracionDias) > 0 &&
              Number(form.cicloDias) < Number(form.duracionDias) && (
                <p className="text-info small">
                  Este plan se renueva cada {form.cicloDias} días: lo que no
                  se use en un ciclo no se acumula para el siguiente.
                </p>
              )}

            <FormGroup>
              <label>Servicios permitidos</label>
              <div
                className="border rounded p-2"
                style={{ maxHeight: 160, overflowY: "auto" }}
              >
                {servicios.length === 0 && (
                  <small className="text-muted">
                    No hay servicios creados todavía.
                  </small>
                )}
                {servicios.map((s) => (
                  <div key={s._id} className="custom-control custom-checkbox">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id={`servicio-${s._id}`}
                      checked={form.serviciosPermitidos.includes(s._id)}
                      onChange={() => handleToggleServicio(s._id)}
                    />
                    <label
                      className="custom-control-label"
                      htmlFor={`servicio-${s._id}`}
                    >
                      {s.nombre}
                    </label>
                  </div>
                ))}
              </div>
              <small className="text-muted">
                Deja todo sin marcar para permitir cualquier servicio
              </small>
            </FormGroup>

            <Button block color="primary" onClick={handleGuardar} type="button">
              Guardar
            </Button>
          </Form>
        </ModalBody>
      </Modal>
    </>
  );
};

export default GestionPlanesSuscripcion;

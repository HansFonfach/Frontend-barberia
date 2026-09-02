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
import PlanesMembresiaContext from "context/PlanesMembresiaContext";

const FORM_VACIO = {
  _id: null,
  nombre: "",
  clasesIncluidas: "8",
  precio: "",
  duracionDias: "30",
  // "mensual" por defecto para planes nuevos: es lo que casi siempre se
  // quiere (ej. "12 clases al mes durante 6 meses"). Los planes ya creados
  // antes de este campo siguen funcionando como "total" (ver handleEditar).
  tipoCiclo: "mensual",
};

const etiquetaCiclo = (tipoCiclo, clasesIncluidas) =>
  tipoCiclo === "mensual"
    ? `${clasesIncluidas} clases/mes`
    : `${clasesIncluidas} clases en total`;

const formatoPesos = (valor) => {
  if (valor === null || valor === undefined || valor === "") return "—";
  return `$${Number(valor).toLocaleString("es-CL")}`;
};

const GestionPlanesMembresia = () => {
  const {
    planes,
    loadingPlanes,
    getAllPlanes,
    crearPlan,
    actualizarPlan,
    toggleActivoPlan,
    eliminarPlan,
  } = useContext(PlanesMembresiaContext);

  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    getAllPlanes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => setModal(!modal);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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
      clasesIncluidas: plan.clasesIncluidas ?? "8",
      precio: plan.precio ?? "",
      duracionDias: plan.duracionDias ?? "30",
      // Planes creados antes de este campo no traen tipoCiclo — se
      // muestran/editan como "total", que es como funcionaban en la
      // práctica (para no cambiarles el comportamiento por sorpresa).
      tipoCiclo: plan.tipoCiclo || "total",
    });
    setModal(true);
  };

  const handleGuardar = async () => {
    if (!form.nombre.trim()) {
      Swal.fire("Error", "El nombre del plan es obligatorio", "error");
      return;
    }
    if (!form.clasesIncluidas || Number(form.clasesIncluidas) <= 0) {
      Swal.fire(
        "Error",
        "La cantidad de clases incluidas debe ser mayor a 0",
        "error",
      );
      return;
    }
    if (form.precio === "" || Number(form.precio) < 0) {
      Swal.fire("Error", "Ingresa un precio válido", "error");
      return;
    }
    if (!form.duracionDias || Number(form.duracionDias) <= 0) {
      Swal.fire(
        "Error",
        "La duración del plan (días) debe ser mayor a 0",
        "error",
      );
      return;
    }
    if (guardando) return; // ya hay un guardado en curso, ignora el reintento

    const payload = {
      nombre: form.nombre.trim(),
      clasesIncluidas: Number(form.clasesIncluidas),
      precio: Number(form.precio),
      duracionDias: Number(form.duracionDias),
      tipoCiclo: form.tipoCiclo === "mensual" ? "mensual" : "total",
    };

    setGuardando(true);
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
    } finally {
      setGuardando(false);
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
                    <h3>Planes de membresía</h3>
                    <small className="text-muted">
                      Define los planes mensuales: cuántas clases incluye cada
                      uno y su precio
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
                      Crea tu primer plan mensual, por ejemplo "Plan 8 clases".
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
                          <div className="mb-2">
                            <Badge color="info" pill className="mr-2">
                              {etiquetaCiclo(p.tipoCiclo, p.clasesIncluidas)}
                            </Badge>
                            <Badge color="warning" pill>
                              {p.duracionDias} días
                            </Badge>
                          </div>
                          <p className="mb-2">
                            <strong>{formatoPesos(p.precio)}</strong>
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
                          <th>Clases</th>
                          <th>Precio</th>
                          <th>Duración</th>
                          <th>Estado</th>
                          <th className="text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {planesFiltrados.map((p) => (
                          <tr key={p._id}>
                            <td>{p.nombre}</td>
                            <td>{etiquetaCiclo(p.tipoCiclo, p.clasesIncluidas)}</td>
                            <td>{formatoPesos(p.precio)}</td>
                            <td>{p.duracionDias} días</td>
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
      <Modal isOpen={modal} toggle={toggle} centered>
        <ModalHeader toggle={toggle}>
          {editando ? "Editar plan" : "Nuevo plan"}
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <label>Nombre del plan</label>
              <Input
                name="nombre"
                placeholder="Ej: Plan 8 clases"
                value={form.nombre}
                onChange={handleChange}
              />
            </FormGroup>

            <FormGroup>
              <label>¿Cómo se cuenta el cupo de clases?</label>
              <Input
                type="select"
                name="tipoCiclo"
                value={form.tipoCiclo}
                onChange={handleChange}
              >
                <option value="mensual">Por mes (se renueva cada 30 días)</option>
                <option value="total">Total para todo el período (no se renueva)</option>
              </Input>
              <small className="text-muted">
                {form.tipoCiclo === "mensual"
                  ? "Ej: plan de 6 meses con 12 clases/mes → el cliente puede usar hasta 12 clases cada mes, y se renuevan solas mes a mes hasta que termine el plan."
                  : "El cliente tiene ese cupo de clases una sola vez para usar en cualquier momento dentro de la duración del plan (no se renueva)."}
              </small>
            </FormGroup>

            <Row>
              <Col md="6">
                <FormGroup>
                  <label>
                    {form.tipoCiclo === "mensual" ? "Clases incluidas al mes" : "Clases incluidas (total)"}
                  </label>
                  <Input
                    type="number"
                    name="clasesIncluidas"
                    value={form.clasesIncluidas}
                    onChange={handleChange}
                  />
                </FormGroup>
              </Col>
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
            </Row>

            <FormGroup>
              <label>Duración total del plan (días)</label>
              <Input
                type="number"
                name="duracionDias"
                value={form.duracionDias}
                onChange={handleChange}
              />
              <small className="text-muted">
                {form.tipoCiclo === "mensual"
                  ? "Cuántos días dura el plan completo (ej. 90 = trimestral, 180 = semestral, 365 = anual). El cupo de arriba se renueva cada 30 días dentro de este total."
                  : "Normalmente 30 días (un mes calendario), pero puede ser cualquier duración."}
              </small>
            </FormGroup>

            <Button
              block
              color="primary"
              onClick={handleGuardar}
              type="button"
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Guardar"}
            </Button>
          </Form>
        </ModalBody>
      </Modal>
    </>
  );
};

export default GestionPlanesMembresia;

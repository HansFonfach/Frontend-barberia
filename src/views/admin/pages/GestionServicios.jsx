import React, { useContext, useState } from "react";
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
  Form,
  FormGroup,
  Input,
  Badge,
} from "reactstrap";
import UserHeader from "components/Headers/UserHeader.js";
import ServiciosContext from "context/ServiciosContext";
import Swal from "sweetalert2";

const GestionServicios = () => {
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState({
    _id: null,
    nombre: "",
    precio: "",
    descripcion: "",
  });

  const { servicios, crearServicio, deleteServicio, updateServicio } =
    useContext(ServiciosContext);

  const toggle = () => setModal(!modal);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleNuevo = () => {
    setEditando(false);
    setForm({
      _id: null,
      nombre: "",
      precio: "",
      descripcion: "",
    });
    setModal(true);
  };

  const handleEditar = (servicio) => {
    setEditando(true);
    setForm(servicio);
    setModal(true);
  };

  const handleGuardar = async () => {
    if (!form.nombre.trim()) {
      Swal.fire("Error", "El nombre del servicio es obligatorio", "error");
      return;
    }

    if (!form.precio || parseFloat(form.precio) <= 0) {
      Swal.fire("Error", "El precio debe ser mayor a 0", "error");
      return;
    }

    try {
      if (editando) {
        await updateServicio(form._id, {
          nombre: form.nombre.trim(),
          precio: parseFloat(form.precio),
          descripcion: form.descripcion.trim(),
        });
      } else {
        await crearServicio(
          form.nombre.trim(),
          parseFloat(form.precio),
          form.descripcion.trim()
        );
      }

      Swal.fire("Listo", "Servicio guardado", "success");
      setModal(false);
    } catch (error) {
      Swal.fire("Error", "No se pudo guardar", "error");
    }
  };

  const handleEliminar = async (servicio) => {
    const confirmar = await Swal.fire({
      title: "¿Eliminar servicio?",
      text: servicio.nombre,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    });

    if (confirmar.isConfirmed) {
      await deleteServicio(servicio._id);
      Swal.fire("Eliminado", "Servicio eliminado", "success");
    }
  };

  const serviciosFiltrados = servicios.filter(
    (s) =>
      s.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  const sinServicios = serviciosFiltrados.length === 0;

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
                    <h3>Gestión de Servicios</h3>
                    <small className="text-muted">
                      Administra los servicios
                    </small>
                  </Col>

                  <Col className="text-right">
                    <Button color="primary" size="sm" onClick={handleNuevo}>
                      + Nuevo
                    </Button>
                  </Col>
                </Row>
              </CardHeader>

              <CardBody>
                {/* BUSCADOR */}
                <Row className="mb-3">
                  <Col md="6">
                    <Input
                      placeholder="Buscar..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                    />
                  </Col>

                  <Col className="text-right d-none d-md-block">
                    <Badge color="primary">
                      {serviciosFiltrados.length} servicios
                    </Badge>
                  </Col>
                </Row>

                {/* ESTADO VACÍO */}
                {sinServicios && (
                  <div className="text-center py-5 text-muted">
                    <i className="ni ni-box-2" style={{ fontSize: 40 }} />
                    <h4 className="mt-3">No hay servicios aún</h4>
                    <p className="mb-3">
                      Crea tu primer servicio para poder asignarlo a las
                      reservas.
                    </p>
                    <Button color="primary" size="sm" onClick={handleNuevo}>
                      + Crear servicio
                    </Button>
                  </div>
                )}

                {/* MOBILE */}
                {!sinServicios && (
                  <div className="d-block d-md-none">
                    {serviciosFiltrados.map((s) => (
                      <Card key={s._id} className="mb-3 shadow-sm">
                        <CardBody>
                          <h5>{s.nombre}</h5>

                          <p className="text-muted small mb-2">
                            {s.descripcion}
                          </p>

                          <Badge color="success" pill>
                            ${s.precio}
                          </Badge>

                          <div className="mt-3 d-flex justify-content-between">
                            <Button
                              size="sm"
                              color="primary"
                              onClick={() => handleEditar(s)}
                            >
                              Editar
                            </Button>

                            <Button
                              size="sm"
                              color="danger"
                              onClick={() => handleEliminar(s)}
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
                {!sinServicios && (
                  <div className="d-none d-md-block">
                    <Table responsive>
                      <thead>
                        <tr>
                          <th>Servicio</th>
                          <th>Precio</th>
                          <th className="text-right">Acciones</th>
                        </tr>
                      </thead>

                      <tbody>
                        {serviciosFiltrados.map((s) => (
                          <tr key={s._id}>
                            <td>{s.nombre}</td>
                            <td>${s.precio}</td>
                            <td className="text-right">
                              <Button
                                size="sm"
                                color="primary"
                                className="mr-2"
                                onClick={() => handleEditar(s)}
                              >
                                Editar
                              </Button>

                              <Button
                                size="sm"
                                color="danger"
                                onClick={() => handleEliminar(s)}
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

      {/* MODAL */}
      <Modal isOpen={modal} toggle={toggle} centered>
        <ModalBody>
          <Form>
            <FormGroup>
              <label>Nombre</label>
              <Input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
              />
            </FormGroup>

            <FormGroup>
              <label>Precio</label>
              <Input
                type="number"
                name="precio"
                value={form.precio}
                onChange={handleChange}
              />
            </FormGroup>

            <FormGroup>
              <label>Descripción</label>
              <Input
                type="textarea"
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
              />
            </FormGroup>

            <Button block color="primary" onClick={handleGuardar}>
              Guardar
            </Button>
          </Form>
        </ModalBody>
      </Modal>
    </>
  );
};

export default GestionServicios;

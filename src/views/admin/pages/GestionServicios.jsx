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
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from "reactstrap";
import UserHeader from "components/Headers/UserHeader.js";
import ServiciosContext from "context/ServiciosContext";
import Swal from "sweetalert2";

const GestionServicios = () => {
  const [servicios2, setServicios] = useState([]);

  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState({
    id: null,
    nombre: "",
    precio: "",
    duracion: "",
    descripcion: "",
  });

  const { servicios, crearServicio, deleteServicio } =
    useContext(ServiciosContext);

  const toggle = () => setModal(!modal);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleNuevo = () => {
    setEditando(false);
    setForm({
      id: null,
      nombre: "",
      precio: "",
      duracion: "",
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
    if (!form.nombre || !form.precio || !form.duracion || !form.descripcion) {
      alert("Por favor, completa los campos obligatorios");
      return;
    }

    try {
      if (editando) {
        // Aquí podrías implementar actualizarServicio()
      } else {
        await crearServicio(
          form.nombre,
          form.precio,
          form.duracion,
          form.descripcion
        );
      }
      setModal(false);
    } catch (error) {
      console.error("Error al guardar servicio:", error);
    }
  };

  const handleEliminar = async (servicio) => {
    const confirmar = await Swal.fire({
      title: "¿Eliminar servicio?",
      text: `Se eliminará el servicio "${servicio.nombre}". Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmar.isConfirmed) return;

    try {
      await deleteServicio(servicio._id);

      Swal.fire({
        title: "Eliminado",
        text: "El servicio fue eliminado correctamente.",
        icon: "success",
        timer: 1500,
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text:
          error?.response?.data?.message || "No se pudo eliminar el servicio.",
        icon: "error",
      });
    }
  };

  // Filtrar servicios por búsqueda
  const serviciosFiltrados = servicios.filter(
    (servicio) =>
      servicio.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      servicio.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      <UserHeader />
      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col className="mb-5" xl="10">
            {/* Card Principal */}
            <Card className="bg-secondary shadow">
              <CardHeader className="bg-white border-0">
                <Row className="align-items-center">
                  <Col xs="8">
                    <h3 className="mb-0 text-default">
                      <i className="ni ni-scissors text-primary mr-2"></i>
                      Gestión de Servicios
                    </h3>
                    <p className="text-sm text-muted mb-0 mt-1">
                      Administra los servicios de tu barbería
                    </p>
                  </Col>
                  <Col className="text-right" xs="4">
                    <Button
                      color="primary"
                      size="sm"
                      onClick={handleNuevo}
                      className="btn-icon"
                    >
                      <span className="btn-inner--icon">
                        <i className="ni ni-fat-add"></i>
                      </span>
                      <span className="btn-inner--text">Nuevo Servicio</span>
                    </Button>
                  </Col>
                </Row>
              </CardHeader>

              <CardBody>
                {/* Barra de búsqueda y estadísticas */}
                <Row className="mb-4">
                  <Col lg="6">
                    <InputGroup className="input-group-alternative">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="ni ni-zoom-split-in"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        placeholder="Buscar servicios..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="form-control-alternative"
                      />
                    </InputGroup>
                  </Col>
                  <Col
                    lg="6"
                    className="d-flex align-items-center justify-content-end"
                  >
                    <Badge color="primary" className="badge-dot mr-2">
                      <i className="bg-primary"></i>
                    </Badge>
                    <span className="text-sm text-muted">
                      {serviciosFiltrados.length} servicios encontrados
                    </span>
                  </Col>
                </Row>

                {serviciosFiltrados.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="icon icon-shape icon-shape-primary icon-lg rounded-circle mb-4">
                      <i className="ni ni-scissors"></i>
                    </div>
                    <h4 className="display-4 mb-2">No hay servicios</h4>
                    <p className="lead text-muted mb-4">
                      {busqueda
                        ? "No se encontraron servicios con tu búsqueda"
                        : "Comienza agregando tu primer servicio"}
                    </p>
                    <Button
                      color="primary"
                      onClick={handleNuevo}
                      className="mt-2"
                    >
                      <i className="ni ni-fat-add mr-2"></i>
                      Agregar primer servicio
                    </Button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table
                      className="align-items-center table-flush"
                      responsive
                    >
                      <thead className="thead-light">
                        <tr>
                          <th scope="col" className="sort" data-sort="name">
                            Servicio
                          </th>
                          <th scope="col" className="sort" data-sort="price">
                            Precio
                          </th>
                          <th scope="col" className="sort" data-sort="duration">
                            Duración
                          </th>

                          <th scope="col" className="sort">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="list">
                        {serviciosFiltrados.map((servicio) => (
                          <tr key={servicio._id}>
                            <th scope="row">
                              <div className="media align-items-center">
                                <div className="media-body">
                                  <span className="name mb-0 text-sm">
                                    {servicio.nombre}
                                  </span>
                                </div>
                              </div>
                            </th>
                            <td className="budget">
                              <span className="text-success font-weight-600">
                                ${servicio.precio.toLocaleString()}
                              </span>
                            </td>
                            <td>
                              <Badge color="default" className="badge-dot">
                                <i className="bg-info"></i>
                              </Badge>
                              <span className="text-sm ml-2">
                                {servicio.duracion} min
                              </span>
                            </td>

                            <td className="text-right">
                              <div className="d-flex align-items-center justify-content">
                                <Button
                                  color="primary"
                                  size="sm"
                                  className="btn-icon-only mr-2"
                                  onClick={() => handleEditar(servicio)}
                                >
                                  <span className="btn-inner--icon">
                                    <i className="ni ni-ruler-pencil"></i>
                                  </span>
                                </Button>
                                <Button
                                  color="danger"
                                  size="sm"
                                  className="btn-icon-only"
                                  onClick={() => handleEliminar(servicio)}
                                >
                                  <span className="btn-inner--icon">
                                    <i className="ni ni-fat-remove"></i>
                                  </span>
                                </Button>
                              </div>
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

      {/* Modal de Argon */}
      <Modal
        isOpen={modal}
        toggle={toggle}
        className="modal-dialog-centered"
        modalClassName="bd-example-modal-lg"
      >
        <div className="modal-header">
          <h6 className="modal-title" id="modal-title-default">
            <i
              className={`ni ${
                editando ? "ni-ruler-pencil" : "ni-fat-add"
              } text-primary mr-2`}
            ></i>
            {editando ? "Editar Servicio" : "Nuevo Servicio"}
          </h6>
          <button
            aria-label="Close"
            className="close"
            data-dismiss="modal"
            type="button"
            onClick={toggle}
          >
            <span aria-hidden={true}>×</span>
          </button>
        </div>
        <ModalBody>
          <Form>
            <Row>
              <Col md="12">
                <FormGroup>
                  <label className="form-control-label" htmlFor="nombre">
                    Nombre del servicio *
                  </label>
                  <Input
                    className="form-control-alternative"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Ej: Corte de pelo clásico"
                    type="text"
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <FormGroup>
                  <label className="form-control-label" htmlFor="precio">
                    Precio *
                  </label>
                  <InputGroup className="input-group-alternative">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>$</InputGroupText>
                    </InputGroupAddon>
                    <Input
                      className="form-control-alternative"
                      type="number"
                      name="precio"
                      value={form.precio}
                      onChange={handleChange}
                      placeholder="7000"
                    />
                  </InputGroup>
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-control-label" htmlFor="duracion">
                    Duración (minutos) *
                  </label>
                  <InputGroup className="input-group-alternative">
                    <Input
                      className="form-control-alternative"
                      type="number"
                      name="duracion"
                      value={form.duracion}
                      onChange={handleChange}
                      placeholder="30"
                    />
                    <InputGroupAddon addonType="append">
                      <InputGroupText>min</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="12">
                <FormGroup>
                  <label className="form-control-label" htmlFor="descripcion">
                    Descripción
                  </label>
                  <Input
                    type="textarea"
                    className="form-control-alternative"
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    placeholder="Escribe una descripción del servicio..."
                    rows="4"
                  />
                </FormGroup>
              </Col>
            </Row>
          </Form>
        </ModalBody>
        <div className="modal-footer">
          <Button
            color="link"
            className="ml-auto"
            data-dismiss="modal"
            onClick={toggle}
          >
            Cancelar
          </Button>
          <Button color="primary" onClick={handleGuardar}>
            <i
              className={`ni ${editando ? "ni-check-bold" : "ni-fat-add"} mr-2`}
            ></i>
            {editando ? "Guardar Cambios" : "Crear Servicio"}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default GestionServicios;

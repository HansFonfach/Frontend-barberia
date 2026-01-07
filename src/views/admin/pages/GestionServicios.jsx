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
        Swal.fire("Éxito", "Servicio actualizado correctamente", "success");
      } else {
        await crearServicio(
          form.nombre.trim(),
          parseFloat(form.precio),
          form.descripcion.trim()
        );
        Swal.fire("Éxito", "Servicio creado correctamente", "success");
      }

      setModal(false);
      setEditando(false);
    } catch (error) {
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Error al guardar el servicio",
        "error"
      );
    }
  };

  const handleEliminar = async (servicio) => {
    const confirmar = await Swal.fire({
      title: "¿Eliminar servicio?",
      text: `Se eliminará "${servicio.nombre}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmar.isConfirmed) return;

    await deleteServicio(servicio._id);
    Swal.fire("Eliminado", "Servicio eliminado correctamente", "success");
  };

  // 🔹 Función para truncar texto
  const truncateText = (text, max = 60) => {
    if (!text) return "";
    return text.length > max ? text.substring(0, max) + "..." : text;
  };

  const serviciosFiltrados = servicios.filter(
    (s) =>
      s.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      <UserHeader />

      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col xl="10">
            <Card className="shadow bg-secondary">
              <CardHeader className="bg-white border-0 pb-3">
                <Row className="align-items-center">
                  <Col>
                    <h3 className="mb-0">
                      <i className="ni ni-settings text-primary mr-2" />
                      Gestión de Servicios
                    </h3>
                    <small className="text-muted">
                      Administra los servicios de tu barbería
                    </small>
                  </Col>
                  <Col className="text-right">
                    <Button color="primary" size="sm" onClick={handleNuevo}>
                      <i className="ni ni-fat-add mr-2" />
                      Nuevo Servicio
                    </Button>
                  </Col>
                </Row>
              </CardHeader>

              <CardBody>
                <Row className="mb-4">
                  <Col md="6">
                    <InputGroup className="input-group-alternative">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="ni ni-zoom-split-in" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        placeholder="Buscar servicios..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                      />
                    </InputGroup>
                  </Col>
                  <Col
                    md="6"
                    className="d-flex align-items-center justify-content-end"
                  >
                    <Badge color="primary" pill>
                      {serviciosFiltrados.length} servicios
                    </Badge>
                  </Col>
                </Row>

                {/* TABLA COMPACTA */}
                <Table responsive size="sm" className="align-items-center table-compact">
                  <thead className="thead-light">
                    <tr>
                      <th style={{ width: "55%" }}>Servicio</th>
                      <th style={{ width: "20%" }}>Precio</th>
                      <th style={{ width: "25%" }} className="text-right">
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {serviciosFiltrados.map((servicio) => (
                      <tr key={servicio._id}>
                        <td className="py-2">
                          <div className="font-weight-bold">
                            {servicio.nombre}
                          </div>
                          {servicio.descripcion && (
                            <div className="text-xs text-muted">
                              {truncateText(servicio.descripcion, 18)}
                            </div>
                          )}
                        </td>

                        <td className="py-2 font-weight-bold">
                          ${servicio.precio.toLocaleString()}
                        </td>

                        <td className="py-2 text-right">
                          <Button
                            size="sm"
                            color="primary"
                            className="mr-1"
                            onClick={() => handleEditar(servicio)}
                          >
                            <i className="ni ni-ruler-pencil" />
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            onClick={() => handleEliminar(servicio)}
                          >
                            <i className="ni ni-fat-remove" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* MODAL */}
      <Modal isOpen={modal} toggle={toggle} centered>
        <div className="modal-header">
          <h5 className="modal-title">
            {editando ? "Editar Servicio" : "Nuevo Servicio"}
          </h5>
          <button className="close" onClick={toggle}>
            ×
          </button>
        </div>

        <ModalBody>
          <Form>
            <FormGroup>
              <label>Nombre *</label>
              <Input name="nombre" value={form.nombre} onChange={handleChange} />
            </FormGroup>

            <FormGroup>
              <label>Precio *</label>
              <InputGroup>
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>$</InputGroupText>
                </InputGroupAddon>
                <Input
                  type="number"
                  name="precio"
                  value={form.precio}
                  onChange={handleChange}
                />
              </InputGroup>
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
          </Form>
        </ModalBody>

        <div className="modal-footer">
          <Button color="link" onClick={toggle}>
            Cancelar
          </Button>
          <Button color="primary" onClick={handleGuardar}>
            Guardar
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default GestionServicios;

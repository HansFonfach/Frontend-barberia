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
  Form,
  FormGroup,
  Input,
  Badge,
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";
import UserHeader from "components/Headers/UserHeader.js";
import Swal from "sweetalert2";
import { crearCategoria } from "api/categoria";
import { listarCategoriasPublico } from "api/categoria";

import { useParams } from "react-router-dom";

const ITEMS_POR_PAGE = 5;

const GestionCategorias = () => {
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [categorias, setCategorias] = useState([]);

  const [pagina, setPagina] = useState(1);
  const { slug } = useParams();

  const [form, setForm] = useState({
    _id: null,
    nombre: "",
    orden: 0,
  });

  useEffect(() => {
    const cargarCategorias = async () => {
      const res = await listarCategoriasPublico(slug);
      setCategorias(res);
    };

    if (slug) cargarCategorias();
  }, [slug]);



  const toggle = () => setModal(!modal);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleNuevo = () => {
    setEditando(false);
    setForm({
      _id: null,
      nombre: "",
      orden: 0,
    });
    setModal(true);
  };

  const handleEditar = (categoria) => {
    setEditando(true);
    setForm(categoria);
    setModal(true);
  };

  const handleGuardar = async () => {
    if (!form.nombre.trim()) {
      Swal.fire("Error", "El nombre es obligatorio", "error");
      return;
    }

    try {
      if (editando) {
        //await updateCategoria(form._id, {
        //  nombre: form.nombre.trim(),
        //   orden: Number(form.orden),
        // });
      } else {
        await crearCategoria({
          nombre: form.nombre.trim(),
          orden: Number(form.orden),
        });
      }

      Swal.fire("Listo", "Categoría guardada", "success");
      setModal(false);
    } catch (error) {
      Swal.fire("Error", "No se pudo guardar", "error");
    }
  };

  const handleEliminar = async (cat) => {
    const confirmar = await Swal.fire({
      title: "¿Eliminar categoría?",
      text: cat.nombre,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    });

    if (confirmar.isConfirmed) {
      //await deleteCategoria(cat._id);
      Swal.fire("Eliminada", "Categoría eliminada", "success");
    }
  };

  const categoriasFiltradas = categorias.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );

  // PAGINACIÓN
  const totalPages = Math.ceil(categoriasFiltradas.length / ITEMS_POR_PAGE);

  const inicio = (pagina - 1) * ITEMS_POR_PAGE;
  const categoriasPaginadas = categoriasFiltradas.slice(
    inicio,
    inicio + ITEMS_POR_PAGE,
  );

  const sinCategorias = categoriasFiltradas.length === 0;

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
                    <h3>Gestión de Categorías</h3>
                    <small className="text-muted">
                      Organiza tus servicios por categorías
                    </small>
                  </Col>

                  <Col className="text-right">
                    <Button color="primary" size="sm" onClick={handleNuevo}>
                      + Nueva
                    </Button>
                  </Col>
                </Row>
              </CardHeader>

              <CardBody>
                {/* BUSCADOR */}
                <Row className="mb-3">
                  <Col md="6">
                    <Input
                      placeholder="Buscar categoría..."
                      value={busqueda}
                      onChange={(e) => {
                        setBusqueda(e.target.value);
                        setPagina(1);
                      }}
                    />
                  </Col>

                  <Col className="text-right d-none d-md-block">
                    <Badge color="primary">
                      {categoriasFiltradas.length} categorías
                    </Badge>
                  </Col>
                </Row>

                {/* VACÍO */}
                {sinCategorias && (
                  <div className="text-center py-5 text-muted">
                    <i className="ni ni-folder-17" style={{ fontSize: 40 }} />
                    <h4 className="mt-3">No hay categorías aún</h4>
                    <p>Crea tu primera categoría para organizar servicios.</p>
                    <Button color="primary" onClick={handleNuevo}>
                      + Crear categoría
                    </Button>
                  </div>
                )}

                {/* MOBILE */}
                {!sinCategorias && (
                  <div className="d-block d-md-none">
                    {categoriasPaginadas.map((c) => (
                      <Card key={c._id} className="mb-3 shadow-sm">
                        <CardBody>
                          <h5>{c.nombre}</h5>

                          <Badge color="info">Orden: {c.orden}</Badge>

                          <div className="mt-3 d-flex justify-content-between">
                            <Button
                              size="sm"
                              color="primary"
                              onClick={() => handleEditar(c)}
                            >
                              Editar
                            </Button>

                            <Button
                              size="sm"
                              color="danger"
                              onClick={() => handleEliminar(c)}
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
                {!sinCategorias && (
                  <div className="d-none d-md-block">
                    <Table responsive>
                      <thead>
                        <tr>
                          <th>Categoría</th>
                          <th>Orden</th>
                          <th className="text-right">Acciones</th>
                        </tr>
                      </thead>

                      <tbody>
                        {categoriasPaginadas.map((c) => (
                          <tr key={c._id}>
                            <td>{c.nombre}</td>
                            <td>{c.orden}</td>
                            <td className="text-right">
                              <Button
                                size="sm"
                                color="primary"
                                className="mr-2"
                                onClick={() => handleEditar(c)}
                              >
                                Editar
                              </Button>

                              <Button
                                size="sm"
                                color="danger"
                                onClick={() => handleEliminar(c)}
                              >
                                Eliminar
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>

                    {/* PAGINACIÓN */}
                    <Pagination className="justify-content-center mt-3">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <PaginationItem key={i} active={pagina === i + 1}>
                          <PaginationLink onClick={() => setPagina(i + 1)}>
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                    </Pagination>
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
              <label>Orden</label>
              <Input
                type="number"
                name="orden"
                value={form.orden}
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

export default GestionCategorias;

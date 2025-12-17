import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Row,
  Col,
  Button,
  Input,
  Badge,
  Table,
  Form,
  FormGroup,
  Label,
  Pagination,
  PaginationItem,
  PaginationLink,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { Plus, Edit, Trash2, Gift, Search, Filter } from "react-feather";
import UserHeader from "components/Headers/UserHeader";
import { useCanje } from "context/CanjeContext";
import Swal from "sweetalert2";

// 🔹 Categorías con colores
const categorias = [
  { id: "descuento", label: "Descuento", color: "success" },
  { id: "producto", label: "Producto", color: "success" },
  { id: "servicio", label: "Servicio", color: "success" },
  { id: "otro", label: "Otro", color: "success" },
];

const GestionCanjesPro = () => {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: "nombre",
    direction: "asc",
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { crearCanje, actualizarCanje, listarCanjes, canjes, loading, error } =
    useCanje();

  useEffect(() => {
    listarCanjes();
  }, [listarCanjes]);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    puntos: "",
    categoria: "descuento",
    stock: "",
    activo: true,
  });

  // 🔹 Filtros y búsqueda
  const filteredCanjes = useMemo(() => {
    return canjes.filter((canje) => {
      const matchesSearch =
        canje.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        canje.descripcion.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        !selectedCategory || canje.categoria === selectedCategory;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && canje.activo) ||
        (statusFilter === "inactive" && !canje.activo);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [canjes, searchTerm, selectedCategory, statusFilter]);

  // 🔹 Ordenamiento
  const sortedCanjes = useMemo(() => {
    const sortableItems = [...filteredCanjes];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredCanjes, sortConfig]);

  // 🔹 Paginación
  const totalPages = Math.ceil(sortedCanjes.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedCanjes.slice(indexOfFirstItem, indexOfLastItem);

  // 🔹 Configuración de ordenamiento
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // 🔹 Reset y manejo de formulario
  const resetForm = () => {
    setForm({
      nombre: "",
      descripcion: "",
      puntos: "",
      categoria: "descuento",
      stock: "",
      activo: true,
    });
    setEditId(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      puntos: Number(form.puntos),
      stock: Number(form.stock),
    };

    try {
      if (editId) {
        await actualizarCanje(editId, payload);
      } else {
        await crearCanje(payload);
      }

      Swal.fire({
        icon: "success",
        title: editId ? "Canje actualizado" : "Canje ingresado",
        text: editId
          ? "El canje fue actualizado exitosamente"
          : "El canje fue creado exitosamente",
      });

      resetForm();
    } catch (error) {
      console.error("Error al guardar canje", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: editId
          ? "No se pudo actualizar el canje"
          : "No se pudo crear el canje",
      });
    }
  };

  const handleEdit = (canje) => {
    setForm({
      ...canje,
      puntos: canje.puntos.toString(),
      stock: canje.stock.toString(),
    });
    setEditId(canje.id);
    setShowForm(true);
  };

  const handleDelete = async (id, nombre) => {
    const result = await Swal.fire({
      title: "¿Eliminar canje?",
      text: `¿Estás seguro de eliminar "${nombre}"? Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        // Aquí llamarías a tu función de eliminar del context
        // await eliminarCanje(id);
        Swal.fire("Eliminado!", "El canje ha sido eliminado.", "success");
      } catch (error) {
        Swal.fire("Error", "No se pudo eliminar el canje.", "error");
      }
    }
  };

  // 🔹 Renderizar paginación
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i} active={i === currentPage}>
          <PaginationLink onClick={() => setCurrentPage(i)}>{i}</PaginationLink>
        </PaginationItem>
      );
    }

    return (
      <Pagination className="justify-content-center mb-0">
        <PaginationItem disabled={currentPage === 1}>
          <PaginationLink first onClick={() => setCurrentPage(1)} />
        </PaginationItem>
        <PaginationItem disabled={currentPage === 1}>
          <PaginationLink
            previous
            onClick={() => setCurrentPage(currentPage - 1)}
          />
        </PaginationItem>

        {pages}

        <PaginationItem disabled={currentPage === totalPages}>
          <PaginationLink
            next
            onClick={() => setCurrentPage(currentPage + 1)}
          />
        </PaginationItem>
        <PaginationItem disabled={currentPage === totalPages}>
          <PaginationLink last onClick={() => setCurrentPage(totalPages)} />
        </PaginationItem>
      </Pagination>
    );
  };

  // 🔹 Obtener color de categoría
  const getCategoryColor = (categoriaId) => {
    const categoria = categorias.find((c) => c.id === categoriaId);
    return categoria ? categoria.color : "secondary";
  };

  // 🔹 Obtener label de categoría
  const getCategoryLabel = (categoriaId) => {
    const categoria = categorias.find((c) => c.id === categoriaId);
    return categoria ? categoria.label : categoriaId;
  };

  return (
    <>
      <UserHeader />
      <div className="container-fluid mt--7">
        {/* HEADER */}
        <Row className="mb-4">
          <Col>
            <Card className="shadow border-0">
              <CardBody className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="icon icon-shape bg-gradient-primary text-white rounded-circle shadow mr-3">
                    <Gift size={20} />
                  </div>
                  <div>
                    <h2 className="mb-0">Gestión de Canjes</h2>
                    <p className="text-muted mb-0">
                      Administración de premios por puntos
                    </p>
                  </div>
                </div>
                <Button color="primary" onClick={() => setShowForm(true)}>
                  <Plus size={16} className="mr-2" /> Nuevo canje
                </Button>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* FILTROS Y BÚSQUEDA */}
        <Row className="mb-4">
          <Col>
            <Card className="shadow border-0">
              <CardBody>
                <Row>
                  <Col md="4">
                    <FormGroup>
                      <Label className="form-control-label">Buscar</Label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <Search size={16} />
                          </span>
                        </div>
                        <Input
                          type="text"
                          placeholder="Buscar por nombre o descripción..."
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                          }}
                        />
                      </div>
                    </FormGroup>
                  </Col>
                  <Col md="3">
                    <FormGroup>
                      <Label className="form-control-label">Categoría</Label>
                      <Input
                        type="select"
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="">Todas las categorías</option>
                        {categorias.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md="3">
                    <FormGroup>
                      <Label className="form-control-label">Estado</Label>
                      <Input
                        type="select"
                        value={statusFilter}
                        onChange={(e) => {
                          setStatusFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="all">Todos</option>
                        <option value="active">Activos</option>
                        <option value="inactive">Inactivos</option>
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md="2">
                    <FormGroup>
                      <Label className="form-control-label">
                        Items por página
                      </Label>
                      <Input
                        type="select"
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          {/* FORM (drawer style) */}
          {showForm && (
            <Col lg="4">
              <Card className="shadow border-0 mb-4">
                <CardHeader className="bg-white d-flex justify-content-between align-items-center">
                  <h4 className="mb-0">
                    {editId ? "✏️ Editar canje" : "🎁 Nuevo canje"}
                  </h4>
                  <Button close onClick={resetForm} />
                </CardHeader>
                <CardBody>
                  <Form onSubmit={handleSubmit}>
                    <FormGroup>
                      <Label className="form-control-label">Nombre *</Label>
                      <Input
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        required
                        placeholder="Ej: Descuento 20% en tienda"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label className="form-control-label">
                        Descripción *
                      </Label>
                      <Input
                        type="textarea"
                        rows="3"
                        name="descripcion"
                        value={form.descripcion}
                        onChange={handleChange}
                        required
                        placeholder="Describe el premio o beneficio..."
                      />
                    </FormGroup>

                    <Row>
                      <Col md="6">
                        <FormGroup>
                          <Label className="form-control-label">Puntos *</Label>
                          <Input
                            type="number"
                            name="puntos"
                            value={form.puntos}
                            onChange={handleChange}
                            required
                            min="0"
                          />
                        </FormGroup>
                      </Col>
                      <Col md="6">
                        <FormGroup>
                          <Label className="form-control-label">Stock *</Label>
                          <Input
                            type="number"
                            name="stock"
                            value={form.stock}
                            onChange={handleChange}
                            required
                            min="0"
                          />
                        </FormGroup>
                      </Col>
                    </Row>

                    <FormGroup>
                      <Label className="form-control-label">Categoría</Label>
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        {categorias.map((c) => (
                          <Button
                            key={c.id}
                            color={form.categoria === c.id ? c.color : "light"}
                            size="sm"
                            onClick={() =>
                              setForm({ ...form, categoria: c.id })
                            }
                            outline={form.categoria !== c.id}
                          >
                            {c.label}
                          </Button>
                        ))}
                      </div>
                    </FormGroup>

                    <FormGroup check className="mb-4">
                      <Label check>
                        <Input
                          type="checkbox"
                          name="activo"
                          checked={form.activo}
                          onChange={handleChange}
                        />
                        <span className="ml-2 font-weight-bold">Activo</span>
                      </Label>
                      <small className="form-text text-muted d-block">
                        Los canjes inactivos no serán visibles para los usuarios
                      </small>
                    </FormGroup>

                    <div className="d-flex justify-content-end">
                      <Button
                        color="secondary"
                        className="mr-2"
                        onClick={resetForm}
                      >
                        Cancelar
                      </Button>
                      <Button color="primary" type="submit">
                        {editId ? "Actualizar" : "Crear"} canje
                      </Button>
                    </div>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          )}

          {/* TABLE */}
          <Col lg={showForm ? "8" : "12"}>
            <Card className="shadow border-0">
              <CardHeader className="bg-white d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="mb-0">Canjes disponibles</h4>
                  <small className="text-muted">
                    Mostrando {currentItems.length} de {filteredCanjes.length}{" "}
                    canjes
                  </small>
                </div>
                <Dropdown
                  isOpen={dropdownOpen}
                  toggle={() => setDropdownOpen(!dropdownOpen)}
                >
                  <DropdownToggle caret color="light">
                    <Filter size={14} className="mr-2" />
                    Ordenar
                  </DropdownToggle>
                  <DropdownMenu right>
                    <DropdownItem onClick={() => requestSort("nombre")}>
                      Nombre{" "}
                      {sortConfig.key === "nombre" &&
                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </DropdownItem>
                    <DropdownItem onClick={() => requestSort("puntos")}>
                      Puntos{" "}
                      {sortConfig.key === "puntos" &&
                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </DropdownItem>
                    <DropdownItem onClick={() => requestSort("stock")}>
                      Stock{" "}
                      {sortConfig.key === "stock" &&
                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </CardHeader>
              <CardBody className="p-0">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="sr-only">Cargando...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <Table hover className="align-items-center">
                        <thead className="thead-light">
                          <tr>
                            <th style={{ width: "25%" }}>
                              <Button
                                color="link"
                                className="p-0"
                                onClick={() => requestSort("nombre")}
                              >
                                Nombre
                                {sortConfig.key === "nombre" && (
                                  <span className="ml-1">
                                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                                  </span>
                                )}
                              </Button>
                            </th>
                            <th style={{ width: "10%" }}>
                              <Button
                                color="link"
                                className="p-0"
                                onClick={() => requestSort("puntos")}
                              >
                                Puntos
                                {sortConfig.key === "puntos" && (
                                  <span className="ml-1">
                                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                                  </span>
                                )}
                              </Button>
                            </th>
                            <th style={{ width: "15%" }}>Categoría</th>
                            <th style={{ width: "10%" }}>
                              <Button
                                color="link"
                                className="p-0"
                                onClick={() => requestSort("stock")}
                              >
                                Stock
                                {sortConfig.key === "stock" && (
                                  <span className="ml-1">
                                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                                  </span>
                                )}
                              </Button>
                            </th>
                            <th style={{ width: "15%" }}>Estado</th>
                            <th style={{ width: "25%" }} className="text-right">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.length > 0 ? (
                            currentItems.map((canje) => (
                              <tr key={canje.id}>
                                <td>
                                  <div className="d-flex align-items-start">
                                    <div className="mr-3">
                                      <div className="icon icon-shape bg-gradient-info text-white rounded-circle">
                                        <Gift size={14} />
                                      </div>
                                    </div>
                                    <div>
                                      <strong className="mb-1 d-block">
                                        {canje.nombre}
                                      </strong>
                                      <small
                                        className="text-muted text-truncate d-block"
                                        style={{ maxWidth: "300px" }}
                                      >
                                        {canje.descripcion}
                                      </small>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <Badge
                                    color="primary"
                                    pill
                                    className="px-3 py-2"
                                  >
                                    <strong>
                                      {canje.puntos.toLocaleString()}
                                    </strong>
                                  </Badge>
                                </td>
                                <td>
                                  <Badge
                                    color={getCategoryColor(canje.categoria)}
                                    pill
                                    className="px-3"
                                  >
                                    {getCategoryLabel(canje.categoria)}
                                  </Badge>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="mr-2">
                                      <strong>{canje.stock}</strong>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <Badge
                                    color={
                                      canje.activo ? "success" : "danger"
                                    }
                                    pill
                                    className="px-3 py-2"
                                  >
                                    {canje.activo ? "🟢 Activo" : "⚫ Inactivo"}
                                  </Badge>
                                </td>
                                <td className="text-right">
                                  <Button
                                    size="sm"
                                    color="info"
                                    onClick={() => handleEdit(canje)}
                                    className="mr-2"
                                  >
                                    <Edit size={14} className="mr-1" /> Editar
                                  </Button>
                                  <Button
                                    size="sm"
                                    color="outline-danger"
                                    onClick={() =>
                                      handleDelete(canje.id, canje.nombre)
                                    }
                                  >
                                    <Trash2 size={14} className="mr-1" />{" "}
                                    Eliminar
                                  </Button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="text-center py-5">
                                <Gift size={48} className="text-muted mb-3" />
                                <h5>No se encontraron canjes</h5>
                                <p className="text-muted">
                                  {searchTerm ||
                                  selectedCategory ||
                                  statusFilter !== "all"
                                    ? "Prueba con otros filtros de búsqueda"
                                    : "No hay canjes registrados. ¡Crea el primero!"}
                                </p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </div>

                    {/* PAGINACIÓN */}
                    {totalPages > 1 && (
                      <CardFooter className="bg-white">
                        <Row className="align-items-center">
                          <Col
                            sm="4"
                            className="text-sm-left text-center mb-2 mb-sm-0"
                          >
                            <small className="text-muted">
                              Mostrando {indexOfFirstItem + 1} a{" "}
                              {Math.min(indexOfLastItem, sortedCanjes.length)}{" "}
                              de {sortedCanjes.length} resultados
                            </small>
                          </Col>
                          <Col sm="8" className="text-sm-right text-center">
                            {renderPagination()}
                          </Col>
                        </Row>
                      </CardFooter>
                    )}
                  </>
                )}
              </CardBody>
              {!loading && currentItems.length > 0 && totalPages <= 1 && (
                <CardFooter className="bg-transparent">
                  <small className="text-muted">
                    Total: {sortedCanjes.length} canje
                    {sortedCanjes.length !== 1 ? "s" : ""}
                  </small>
                </CardFooter>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default GestionCanjesPro;

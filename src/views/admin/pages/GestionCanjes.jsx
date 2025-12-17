import React, { useState } from "react";
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
} from "reactstrap";
import { Plus, Edit, Trash2, Gift } from "react-feather";
import UserHeader from "components/Headers/UserHeader";

// 🔹 Creative Tim Pro–style constants
const categorias = [
  { id: "descuento", label: "Descuento" },
  { id: "producto", label: "Producto" },
  { id: "servicio", label: "Servicio" },
  { id: "otro", label: "Otro" },
];

const mockCanjes = [
  {
    id: 1,
    nombre: "Corte Premium Gratis",
    descripcion: "Corte profesional con barbero senior",
    puntos: 500,
    categoria: "servicio",
    stock: 10,
    activo: true,
  },
  {
    id: 2,
    nombre: "20% Descuento",
    descripcion: "Aplicable a cualquier servicio",
    puntos: 300,
    categoria: "descuento",
    stock: 5,
    activo: true,
  },
];

const GestionCanjesPro = () => {
  const [canjes, setCanjes] = useState(mockCanjes);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    puntos: "",
    categoria: "descuento",
    stock: "",
    activo: true,
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editId) {
      setCanjes(
        canjes.map((c) =>
          c.id === editId
            ? { ...c, ...form, puntos: Number(form.puntos), stock: Number(form.stock) }
            : c
        )
      );
    } else {
      setCanjes([
        ...canjes,
        {
          id: Date.now(),
          ...form,
          puntos: Number(form.puntos),
          stock: Number(form.stock),
        },
      ]);
    }

    resetForm();
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

  const handleDelete = (id) => {
    if (window.confirm("¿Eliminar este canje?")) {
      setCanjes(canjes.filter((c) => c.id !== id));
    }
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
                  <div className="icon icon-shape bg-primary text-white rounded-circle shadow mr-3">
                    <Gift size={20} />
                  </div>
                  <div>
                    <h2 className="mb-0">Canjes</h2>
                    <p className="text-muted mb-0">Administración de premios por puntos</p>
                  </div>
                </div>
                <Button color="primary" onClick={() => setShowForm(true)}>
                  <Plus size={16} className="mr-2" /> Nuevo canje
                </Button>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          {/* FORM (drawer style) */}
          {showForm && (
            <Col lg="4">
              <Card className="shadow border-0 mb-4">
                <CardHeader className="bg-white">
                  <h4 className="mb-0">{editId ? "Editar canje" : "Nuevo canje"}</h4>
                </CardHeader>
                <CardBody>
                  <Form onSubmit={handleSubmit}>
                    <FormGroup>
                      <Label>Nombre</Label>
                      <Input name="nombre" value={form.nombre} onChange={handleChange} required />
                    </FormGroup>

                    <FormGroup>
                      <Label>Descripción</Label>
                      <Input type="textarea" rows="3" name="descripcion" value={form.descripcion} onChange={handleChange} required />
                    </FormGroup>

                    <Row>
                      <Col md="6">
                        <FormGroup>
                          <Label>Puntos</Label>
                          <Input type="number" name="puntos" value={form.puntos} onChange={handleChange} required />
                        </FormGroup>
                      </Col>
                      <Col md="6">
                        <FormGroup>
                          <Label>Stock</Label>
                          <Input type="number" name="stock" value={form.stock} onChange={handleChange} required />
                        </FormGroup>
                      </Col>
                    </Row>

                    <FormGroup>
                      <Label>Categoría</Label>
                      <Input type="select" name="categoria" value={form.categoria} onChange={handleChange}>
                        {categorias.map((c) => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </Input>
                    </FormGroup>

                    <FormGroup check className="mb-4">
                      <Label check>
                        <Input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} />
                        <span className="ml-2">Activo</span>
                      </Label>
                    </FormGroup>

                    <div className="d-flex justify-content-end">
                      <Button color="secondary" className="mr-2" onClick={resetForm}>Cancelar</Button>
                      <Button color="primary" type="submit">Guardar</Button>
                    </div>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          )}

          {/* TABLE */}
          <Col lg={showForm ? "8" : "12"}>
            <Card className="shadow border-0">
              <CardHeader className="bg-white">
                <h4 className="mb-0">Listado de canjes</h4>
              </CardHeader>
              <CardBody className="p-0">
                <Table responsive hover className="align-items-center mb-0">
                  <thead className="thead-light">
                    <tr>
                      <th>Nombre</th>
                      <th>Puntos</th>
                      <th>Categoría</th>
                      <th>Stock</th>
                      <th>Estado</th>
                      <th className="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {canjes.map((canje) => (
                      <tr key={canje.id}>
                        <td>
                          <strong>{canje.nombre}</strong>
                          <div className="text-muted small">{canje.descripcion}</div>
                        </td>
                        <td>
                          <Badge color="info" pill>{canje.puntos}</Badge>
                        </td>
                        <td>
                          <Badge color="light" pill>{canje.categoria}</Badge>
                        </td>
                        <td>{canje.stock}</td>
                        <td>
                          <Badge color={canje.activo ? "success" : "secondary"} pill>
                            {canje.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </td>
                        <td className="text-right">
                          <Button size="sm" color="link" onClick={() => handleEdit(canje)}>
                            <Edit size={16} />
                          </Button>
                          <Button size="sm" color="link" onClick={() => handleDelete(canje.id)}>
                            <Trash2 size={16} className="text-danger" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
              <CardFooter className="bg-transparent">
                <small className="text-muted">Total: {canjes.length} canjes</small>
              </CardFooter>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default GestionCanjesPro;
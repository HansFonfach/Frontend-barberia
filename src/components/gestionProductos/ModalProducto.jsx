import React, { useEffect, useState } from "react";

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  Badge,
} from "reactstrap";

const ModalProducto = ({
  isOpen,
  toggle,
  producto,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    nombre: "",
    precio: "",
    descripcion: "",
    categoria: "",
    stock: "",
    imagen: "",
    activo: true,
  });

  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre || "",
        precio: producto.precio || "",
        descripcion: producto.descripcion || "",
        categoria: producto.categoria || "",
        stock: producto.stock || "",
        imagen: producto.imagen || "",
        activo: producto.activo ?? true,
      });
    } else {
      setFormData({
        nombre: "",
        precio: "",
        descripcion: "",
        categoria: "",
        stock: "",
        imagen: "",
        activo: true,
      });
    }
  }, [producto, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="lg">
      <ModalHeader toggle={toggle}>
        {producto ? "Editar Producto" : "Nuevo Producto"}
      </ModalHeader>

      <Form onSubmit={handleSubmit}>
        <ModalBody>
          <Row>
            <Col md="8">
              <FormGroup>
                <Label>Nombre</Label>

                <Input
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Nombre del producto"
                />
              </FormGroup>
            </Col>

            <Col md="4">
              <FormGroup>
                <Label>Precio</Label>

                <Input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  placeholder="10000"
                />
              </FormGroup>
            </Col>
          </Row>

          <Row>
            <Col md="6">
              <FormGroup>
                <Label>Categoría</Label>

                <Input
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  placeholder="Hidratación"
                />
              </FormGroup>
            </Col>

            <Col md="6">
              <FormGroup>
                <Label>Stock</Label>

                <Input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="10"
                />
              </FormGroup>
            </Col>
          </Row>

          <FormGroup>
            <Label>Imagen URL</Label>

            <Input
              name="imagen"
              value={formData.imagen}
              onChange={handleChange}
              placeholder="https://..."
            />
          </FormGroup>

          <FormGroup>
            <Label>Descripción</Label>

            <Input
              type="textarea"
              rows="4"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Descripción del producto"
            />
          </FormGroup>

          <div className="d-flex align-items-center justify-content-between bg-light rounded p-3">
            <div>
              <h5 className="mb-1">Estado del producto</h5>
              <small className="text-muted">
                Define si el producto estará disponible.
              </small>
            </div>

            <Badge color={formData.activo ? "success" : "secondary"} pill>
              {formData.activo ? "Activo" : "Inactivo"}
            </Badge>
          </div>

          <div className="custom-control custom-switch mt-3">
            <input
              type="checkbox"
              className="custom-control-input"
              id="activo"
              name="activo"
              checked={formData.activo}
              onChange={handleChange}
            />

            <label className="custom-control-label" htmlFor="activo">
              Producto activo
            </label>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button color="secondary" onClick={toggle}>
            Cancelar
          </Button>

          <Button color="primary" type="submit">
            {producto ? "Guardar cambios" : "Crear producto"}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default ModalProducto;

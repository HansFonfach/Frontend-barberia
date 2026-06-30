import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
} from "reactstrap";
import { FiEdit2 } from "react-icons/fi";
import { useUsuario } from "context/usuariosContext";
import { updateUsuarioDesdeAdmin } from "api/usuarios";
import Swal from "sweetalert2";

const UsuarioModal = ({
  isOpen,
  toggle,
  usuario,
  onSave,
  tipoUsuario = "usuario",
}) => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre || "",
        apellido: usuario.apellido || "",
        email: usuario.email || "",
        telefono: usuario.telefono || "",
      });
      setError(null);
    }
  }, [usuario, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // ✅ FORMA SIMPLE Y LIMPIA

      const res = await updateUsuarioDesdeAdmin(usuario._id, formData);
      Swal.fire({
        icon: "success",
        title: "¡Cliente actualizado!",
        text: `Los datos del cliente han sido modificados correctamente`,
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (error) {
      setError(error.message || "Error al actualizar el usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      className="modal-dialog-centered"
      size="md"
    >
      <div className="modal-header">
        <h6 className="modal-title">
          <FiEdit2 className="text-primary mr-2" />
          Editar {tipoUsuario === "barbero" ? "Profesional" : "Usuario"}
        </h6>
        <button type="button" className="close" onClick={toggle}>
          <span aria-hidden={true}>×</span>
        </button>
      </div>

      <Form onSubmit={handleSubmit}>
        <ModalBody>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 16px",
            }}
          >
            <FormGroup>
              <Label>Nombre</Label>
              <Input
                name="nombre"
                type="text"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Nombre"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Apellido</Label>
              <Input
                name="apellido"
                type="text"
                value={formData.apellido}
                onChange={handleChange}
                placeholder="Apellido"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Teléfono</Label>
              <Input
                name="telefono"
                type="text"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Teléfono"
              />
            </FormGroup>
          </div>
        </ModalBody>

        <div className="modal-footer">
          <Button color="link" onClick={toggle} disabled={loading}>
            Cancelar
          </Button>
          <Button color="primary" type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UsuarioModal;

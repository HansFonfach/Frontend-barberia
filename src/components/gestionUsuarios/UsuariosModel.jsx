import React from "react";
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

const UsuarioModal = ({
  isOpen,
  toggle,
  usuario,
  onSave,
  onFieldChange,
  tipoUsuario = "usuario", // 'cliente' o 'barbero'
  camposAdicionales = [], // [{name: 'telefono', label: 'Teléfono', type: 'text'}]
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
  };

  const camposBase = [
    { name: "nombre", label: "Nombre", type: "text" },
    { name: "apellido", label: "Apellido", type: "text" },
    { name: "email", label: "Email", type: "email" },
  ];

  const todosLosCampos = [...camposBase, ...camposAdicionales];

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="modal-dialog-centered">
      <div className="modal-header">
        <h6 className="modal-title">
          <FiEdit2 className="text-primary mr-2" />
          Editar {tipoUsuario.charAt(0).toUpperCase() + tipoUsuario.slice(1)}
        </h6>
        <button type="button" className="close" onClick={toggle}>
          <span aria-hidden={true}>×</span>
        </button>
      </div>

      <Form onSubmit={handleSubmit}>
        <ModalBody>
          {todosLosCampos.map((campo) => (
            <FormGroup key={campo.name}>
              <Label>{campo.label} *</Label>
              <Input
                name={campo.name}
                type={campo.type || "text"}
                value={usuario?.[campo.name] || ""}
                onChange={onFieldChange}
                placeholder={campo.placeholder || campo.label}
              />
            </FormGroup>
          ))}
        </ModalBody>

        <div className="modal-footer">
          <Button color="link" onClick={toggle}>
            Cancelar
          </Button>
          <Button color="primary" type="submit">
            Guardar Cambios
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UsuarioModal;

import React, { useState } from "react";
import {
  Modal,
  ModalBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Badge,
} from "reactstrap";
import { FiEdit2, FiPlus, FiX } from "react-icons/fi";

// Resuelve "perfilProfesional.especialidades" → obj.perfilProfesional.especialidades
const getValor = (obj, path) =>
  path.split(".").reduce((acc, key) => acc?.[key] ?? "", obj);

const UsuarioModal = ({
  isOpen,
  toggle,
  usuario,
  onSave,
  onFieldChange,
  tipoUsuario = "usuario",
  camposAdicionales = [],
}) => {
  const [espInput, setEspInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
  };

  const camposBase = [
    { name: "nombre", label: "Nombre", type: "text" },
    { name: "apellido", label: "Apellido", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "telefono", label: "Teléfono", type: "text" },
  ];

  const todosLosCampos = [...camposBase, ...camposAdicionales];

  // ── helpers chips especialidades ──
  const agregarEsp = (fieldName) => {
    const val = espInput.trim();
    if (!val) return;
    const actuales = getValor(usuario, fieldName);
    const arr = Array.isArray(actuales) ? actuales : [];
    if (!arr.includes(val)) {
      onFieldChange({ target: { name: fieldName, value: [...arr, val] } });
    }
    setEspInput("");
  };

  const quitarEsp = (fieldName, esp) => {
    const actuales = getValor(usuario, fieldName);
    const arr = Array.isArray(actuales) ? actuales : [];
    onFieldChange({
      target: { name: fieldName, value: arr.filter((e) => e !== esp) },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      className="modal-dialog-centered"
      size="lg"
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 16px",
            }}
          >
            {todosLosCampos.map((campo) => {
              // ── Chips de especialidades ──
              if (campo.type === "especialidades") {
                const arr = getValor(usuario, campo.name);
                const lista = Array.isArray(arr) ? arr : [];
                return (
                  <FormGroup key={campo.name} style={{ gridColumn: "1 / -1" }}>
                    <Label>{campo.label}</Label>
                    <div className="d-flex" style={{ gap: 8 }}>
                      <Input
                        value={espInput}
                        onChange={(e) => setEspInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), agregarEsp(campo.name))
                        }
                        placeholder="Ej: Degradado, Barba..."
                      />
                      <Button
                        type="button"
                        color="secondary"
                        onClick={() => agregarEsp(campo.name)}
                      >
                        <FiPlus />
                      </Button>
                    </div>
                    <div className="mt-2 d-flex flex-wrap" style={{ gap: 6 }}>
                      {lista.map((esp) => (
                        <Badge
                          key={esp}
                          color="dark"
                          pill
                          className="d-flex align-items-center px-3 py-2"
                          style={{ fontSize: 13, gap: 6 }}
                        >
                          {esp}
                          <FiX
                            style={{ cursor: "pointer", marginLeft: 4 }}
                            onClick={() => quitarEsp(campo.name, esp)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </FormGroup>
                );
              }

              // ── Textarea ──
              if (campo.type === "textarea") {
                return (
                  <FormGroup key={campo.name} style={{ gridColumn: "1 / -1" }}>
                    <Label>{campo.label}</Label>
                    <Input
                      type="textarea"
                      name={campo.name}
                      rows={3}
                      value={getValor(usuario, campo.name)}
                      onChange={onFieldChange}
                      placeholder={campo.placeholder || campo.label}
                    />
                  </FormGroup>
                );
              }

              if (campo.type === "foto") {
                const fotoActual = getValor(
                  usuario,
                  "perfilProfesional.fotoPerfil.url",
                );
                return (
                  <FormGroup key={campo.name} style={{ gridColumn: "1 / -1" }}>
                    <Label>{campo.label}</Label>
                    <div
                      className="d-flex align-items-center"
                      style={{ gap: 16 }}
                    >
                      {/* Preview */}
                      <div
                        style={{
                          width: 72,
                          height: 72,
                          borderRadius: "50%",
                          overflow: "hidden",
                          background: "#f0f0f0",
                          flexShrink: 0,
                          border: "2px dashed #dee2e6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {campo.preview || fotoActual ? (
                          <img
                            src={campo.preview || fotoActual}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              objectPosition: "center top",
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: 24 }}>📷</span>
                        )}
                      </div>
                      {/* Input */}
                      <div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={campo.onFotoChange}
                          style={{ borderRadius: 8 }}
                        />
                        <small className="text-muted">
                          JPG, PNG. Recomendado: foto de cara
                        </small>
                      </div>
                    </div>
                  </FormGroup>
                );
              }

              // ── Input normal ──
              return (
                <FormGroup key={campo.name}>
                  <Label>{campo.label}</Label>
                  <Input
                    name={campo.name}
                    type={campo.type || "text"}
                    value={getValor(usuario, campo.name)}
                    onChange={onFieldChange}
                    placeholder={campo.placeholder || campo.label}
                  />
                </FormGroup>
              );
            })}
          </div>
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

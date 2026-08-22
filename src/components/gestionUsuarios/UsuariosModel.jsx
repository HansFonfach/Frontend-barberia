import React, { useState, useEffect } from "react";
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
import { updateUsuarioDesdeAdmin } from "api/usuarios";
import Swal from "sweetalert2";

/**
 * Modal de edición compartido entre "Gestión de Clientes" y "Gestión de
 * Profesionales". Antes solo editaba nombre/apellido/email/teléfono (ignoraba
 * por completo `camposAdicionales`, `onFieldChange` y `onSave`, que ya venían
 * bien armados desde GestionBarberos.jsx pero nunca se usaban) — por eso al
 * editar un profesional no se podían tocar años de experiencia, especialidades
 * ni la foto: solo quedaban disponibles al crearlo.
 *
 * Para "barbero" ahora sí usamos ese camino ya construido: los campos leen y
 * escriben directo sobre `usuario` (el estado que vive en el hook useUsuarios)
 * vía `onFieldChange`, y el guardado real lo hace `onSave` (que en
 * GestionBarberos.jsx dispara handleGuardar → PUT /usuarios/:id, el endpoint
 * completo que sí soporta perfilProfesional + foto).
 *
 * Para "cliente" se deja intacto el comportamiento anterior (estado local +
 * updateUsuarioDesdeAdmin) para no arriesgar nada que ya funcionaba ahí.
 */
const UsuarioModal = ({
  isOpen,
  toggle,
  usuario,
  onSave,
  onFieldChange,
  tipoUsuario = "usuario",
  camposAdicionales,
  fullscreen,
}) => {
  const esProfesional = tipoUsuario === "barbero";

  // Estado local, solo se usa en el camino "cliente" (comportamiento previo)
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
  });
  const [especialidadInput, setEspecialidadInput] = useState("");
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
      setEspecialidadInput("");
      setError(null);
    }
  }, [usuario, isOpen]);

  const handleChangeLocal = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const listaEspecialidades = usuario?.perfilProfesional?.especialidades || [];

  const agregarEspecialidad = () => {
    const val = especialidadInput.trim();
    if (!val || listaEspecialidades.includes(val)) {
      setEspecialidadInput("");
      return;
    }
    onFieldChange({
      target: {
        name: "perfilProfesional.especialidades",
        value: [...listaEspecialidades, val],
      },
    });
    setEspecialidadInput("");
  };

  const quitarEspecialidad = (esp) => {
    onFieldChange({
      target: {
        name: "perfilProfesional.especialidades",
        value: listaEspecialidades.filter((e) => e !== esp),
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (esProfesional) {
        // handleGuardar (hook) ya valida, guarda, cierra el modal y refresca
        // la lista; y handleGuardarConAlerta (GestionBarberos.jsx) ya muestra
        // el Swal de éxito. Acá solo hace falta dispararlo y mostrar el error
        // si algo falla, porque nadie más lo está atrapando.
        await onSave();
      } else {
        await updateUsuarioDesdeAdmin(usuario._id, formData);
        Swal.fire({
          icon: "success",
          title: "¡Cliente actualizado!",
          text: "Los datos del cliente han sido modificados correctamente",
          timer: 2500,
          showConfirmButton: false,
        });
        // Ojo: acá NO se llama a onSave() — en este modo "cliente" apunta a
        // handleGuardarConAlerta del hook, que vuelve a guardar leyendo el
        // `usuarioEdit` del hook (nunca actualizado por este modal, que usa
        // su propio estado local). Llamarlo pisaría esta edición recién
        // guardada con los datos viejos.
        toggle();
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Error al actualizar el usuario",
      );
    } finally {
      setLoading(false);
    }
  };

  const renderCampoAdicional = (campo) => {
    if (campo.type === "foto") {
      const fotoActual =
        campo.preview || usuario?.perfilProfesional?.fotoPerfil?.url;
      return (
        <FormGroup key={campo.name}>
          <Label>{campo.label}</Label>
          <div className="d-flex align-items-center" style={{ gap: 16 }}>
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
              {fotoActual ? (
                <img
                  src={fotoActual}
                  alt="Foto de perfil"
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

    if (campo.type === "especialidades") {
      return (
        <FormGroup key={campo.name}>
          <Label>{campo.label}</Label>
          <div className="d-flex" style={{ gap: 8 }}>
            <Input
              value={especialidadInput}
              onChange={(e) => setEspecialidadInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (e.preventDefault(), agregarEspecialidad())
              }
              placeholder="Ej: Degradado, Barba..."
            />
            <Button type="button" color="secondary" onClick={agregarEspecialidad}>
              <FiPlus />
            </Button>
          </div>
          <div className="mt-2 d-flex flex-wrap" style={{ gap: 6 }}>
            {listaEspecialidades.map((esp) => (
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
                  onClick={() => quitarEspecialidad(esp)}
                />
              </Badge>
            ))}
          </div>
        </FormGroup>
      );
    }

    // number / textarea / text — soporta nombres anidados tipo
    // "perfilProfesional.aniosExperiencia"
    const [parent, child] = campo.name.includes(".")
      ? campo.name.split(".")
      : [null, campo.name];
    const valor = parent
      ? (usuario?.[parent]?.[child] ?? "")
      : (usuario?.[campo.name] ?? "");

    return (
      <FormGroup key={campo.name}>
        <Label>{campo.label}</Label>
        <Input
          type={
            campo.type === "number"
              ? "number"
              : campo.type === "textarea"
                ? "textarea"
                : "text"
          }
          rows={campo.type === "textarea" ? 3 : undefined}
          name={campo.name}
          value={valor}
          onChange={onFieldChange}
        />
      </FormGroup>
    );
  };

  const tituloTipo =
    tipoUsuario === "barbero"
      ? "Profesional"
      : tipoUsuario === "cliente"
        ? "Cliente"
        : "Usuario";

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      className="modal-dialog-centered"
      size={esProfesional ? "lg" : "md"}
      fullscreen={fullscreen}
    >
      <div className="modal-header">
        <h6 className="modal-title">
          <FiEdit2 className="text-primary mr-2" />
          Editar {tituloTipo}
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
                value={esProfesional ? usuario?.nombre || "" : formData.nombre}
                onChange={esProfesional ? onFieldChange : handleChangeLocal}
                placeholder="Nombre"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Apellido</Label>
              <Input
                name="apellido"
                type="text"
                value={
                  esProfesional ? usuario?.apellido || "" : formData.apellido
                }
                onChange={esProfesional ? onFieldChange : handleChangeLocal}
                placeholder="Apellido"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                value={esProfesional ? usuario?.email || "" : formData.email}
                onChange={esProfesional ? onFieldChange : handleChangeLocal}
                placeholder="Email"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Teléfono</Label>
              <Input
                name="telefono"
                type="text"
                value={
                  esProfesional ? usuario?.telefono || "" : formData.telefono
                }
                onChange={esProfesional ? onFieldChange : handleChangeLocal}
                placeholder="Teléfono"
              />
            </FormGroup>
          </div>

          {esProfesional &&
            Array.isArray(camposAdicionales) &&
            camposAdicionales.length > 0 && (
              <>
                <hr />
                {camposAdicionales.map(renderCampoAdicional)}
              </>
            )}
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

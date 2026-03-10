import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import { FiPlus, FiEdit2 } from "react-icons/fi";
import { Power } from "lucide-react";
import Swal from "sweetalert2";

import UserHeader from "components/Headers/UserHeader";
import SearchBar from "components/gestionUsuarios/BarraBusqueda";
import Pagination from "components/gestionUsuarios/Paginacion";
import UserModal from "components/gestionUsuarios/UsuariosModel";

import { useUsuarios } from "hooks/useUsuarios";
import { usePagination } from "hooks/usePagination";
import { useCrearBarbero } from "hooks/barberos/useCrearBarbero";

const AvatarBarbero = ({ nombre, apellido, foto }) => {
  const iniciales = `${nombre?.[0] || ""}${apellido?.[0] || ""}`.toUpperCase();

  return (
    <div
      className="mx-auto d-flex align-items-center justify-content-center"
      style={{
        width: 90,
        height: 90,
        borderRadius: "50%",
        overflow: "hidden",
        background: "linear-gradient(135deg,#111,#444)",
        boxShadow: "0 4px 10px rgba(0,0,0,.25)",
      }}
    >
      {foto ? (
        <img
          src={foto}
          alt={`${nombre} ${apellido}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
          }}
        />
      ) : (
        <span style={{ color: "#fff", fontSize: 28, fontWeight: "bold" }}>
          {iniciales}
        </span>
      )}
    </div>
  );
};

const GestionBarberos = () => {
  const {
    usuarios,
    busqueda,
    modal,
    usuarioEdit,
    setBusqueda,
    setUsuarioEdit,
    handleEditar,
    handleGuardar,
    toggleModal,
    handleCambiarEstado,
  } = useUsuarios("barbero");

  const { paginaActual, totalPaginas, itemsPaginados, cambiarPagina } =
    usePagination(usuarios, 8);

  const {
    modalCrear,
    formCrear,
    toggleCrear,
    handleCrearChange,
    handleCrearBarbero,
    rut,
    rutError,
    handleRutChange,
    fotoPreview,
    handleFotoChange,
  } = useCrearBarbero();

  const handleAccion = async (accionId, usuario) => {
    try {
      if (accionId === "editar") {
        handleEditar(usuario);
      }

      if (accionId === "estado") {
        const activar = usuario.estado === "inactivo";

        const confirm = await Swal.fire({
          title: activar
            ? "¿Reactivar profesional?"
            : "¿Inactivar profesional?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: activar ? "Sí, reactivar" : "Sí, inactivar",
          cancelButtonText: "Cancelar",
        });

        if (confirm.isConfirmed) {
          await handleCambiarEstado(
            usuario._id,
            activar ? "activo" : "inactivo",
          );

          Swal.fire(
            "Listo",
            activar ? "Profesional reactivado" : "Profesional inactivado",
            "success",
          );
        }
      }
    } catch (error) {
      Swal.fire("Error", error.message || "Ocurrió un error", "error");
    }
  };

  const handleChange = (e) => {
    setUsuarioEdit({ ...usuarioEdit, [e.target.name]: e.target.value });
  };

  const handleGuardarConAlerta = async () => {
    await handleGuardar();
    Swal.fire("Listo", "Datos actualizados", "success");
  };

  return (
    <>
      <UserHeader />

      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col lg="11">
            <Card className="shadow border-0">
              <CardHeader className="bg-white">
                <Row className="align-items-center">
                  <Col md="6">
                    <h3 className="mb-0">Gestión de Profesionales</h3>
                  </Col>

                  <Col md="6" className="text-right">
                    <Button color="primary" onClick={toggleCrear}>
                      <FiPlus className="mr-1" />
                      Crear Profesional
                    </Button>
                  </Col>
                </Row>
              </CardHeader>

              <CardBody>
                <SearchBar
                  busqueda={busqueda}
                  onBusquedaChange={setBusqueda}
                  placeholder="Buscar profesional..."
                  totalResultados={usuarios.length}
                />

                <Row className="mt-4">
                  {itemsPaginados.map((b) => {
                    const activo = b.estado === "activo";
                    const foto = b.perfilProfesional?.fotoPerfil?.url;

                    return (
                      <Col key={b._id} xs="12" sm="6" md="4" lg="3">
                        <Card
                          className="mb-4 border-0 shadow-sm"
                          style={{
                            borderRadius: 16,
                            transition: "all .2s ease",
                          }}
                        >
                          <CardBody className="text-center py-4">
                            <AvatarBarbero
                              nombre={b.nombre}
                              apellido={b.apellido}
                              foto={foto}
                            />

                            <h5 className="mt-3 mb-1 font-weight-bold">
                              {b.nombre} {b.apellido}
                            </h5>

                            <p className="text-muted small mb-1">{b.email}</p>

                            <Badge
                              color={activo ? "success" : "danger"}
                              className="mb-3"
                            >
                              {activo ? "Activo" : "Inactivo"}
                            </Badge>

                            <Row>
                              <Col xs="6" className="pr-1">
                                <Button
                                  size="sm"
                                  color="primary"
                                  block
                                  onClick={() => handleAccion("editar", b)}
                                >
                                  <FiEdit2 size={14} /> Editar
                                </Button>
                              </Col>

                              <Col xs="6" className="pl-1">
                                <Button
                                  size="sm"
                                  color={activo ? "danger" : "success"}
                                  block
                                  onClick={() => handleAccion("estado", b)}
                                >
                                  <Power size={14} />
                                </Button>
                              </Col>
                            </Row>
                          </CardBody>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>

                {totalPaginas > 1 && (
                  <Pagination
                    paginaActual={paginaActual}
                    totalPaginas={totalPaginas}
                    onPaginaChange={cambiarPagina}
                  />
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <UserModal
        isOpen={modal}
        toggle={toggleModal}
        usuario={usuarioEdit}
        onSave={handleGuardarConAlerta}
        onFieldChange={handleChange}
        tipoUsuario="barbero"
      />

      <Modal isOpen={modalCrear} toggle={toggleCrear} centered size="lg">
        <ModalHeader toggle={toggleCrear}>Crear Profesional</ModalHeader>

        <ModalBody>
          <Form>
            <Row>
              <Col sm={6}>
                <FormGroup>
                  <Label>RUT *</Label>
                  <Input
                    value={rut}
                    onChange={handleRutChange}
                    className={rutError ? "is-invalid" : ""}
                  />
                  {rutError && (
                    <small className="text-danger">{rutError}</small>
                  )}
                </FormGroup>
              </Col>

              {["nombre", "apellido", "telefono", "email"].map((name) => (
                <Col sm={6} key={name}>
                  <FormGroup>
                    <Label>
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Label>
                    <Input
                      name={name}
                      value={formCrear[name]}
                      onChange={handleCrearChange}
                    />
                  </FormGroup>
                </Col>
              ))}

              <Col sm={6}>
                <FormGroup>
                  <Label>Contraseña</Label>
                  <Input
                    type="password"
                    name="password"
                    value={formCrear.password}
                    onChange={handleCrearChange}
                  />
                </FormGroup>
              </Col>

              <Col sm={6}>
                <FormGroup>
                  <Label>Confirmar Contraseña</Label>
                  <Input
                    type="password"
                    name="confirmaPassword"
                    value={formCrear.confirmaPassword}
                    onChange={handleCrearChange}
                  />
                </FormGroup>
              </Col>

              <Col sm={12}>
                <FormGroup>
                  <Label>Foto de perfil</Label>
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
                      {fotoPreview ? (
                        <img
                          src={fotoPreview}
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
                        onChange={handleFotoChange}
                        style={{ borderRadius: 8 }}
                      />
                      <small className="text-muted">
                        JPG, PNG. Recomendado: foto de cara
                      </small>
                    </div>
                  </div>
                </FormGroup>
              </Col>
            </Row>

            <div className="text-right mt-3">
              <Button color="primary" onClick={handleCrearBarbero}>
                Crear
              </Button>
            </div>
          </Form>
        </ModalBody>
      </Modal>
    </>
  );
};

export default GestionBarberos;

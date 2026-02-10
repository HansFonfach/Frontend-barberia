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
import { FiPlus } from "react-icons/fi";
import Swal from "sweetalert2";

import UserHeader from "components/Headers/UserHeader";
import SearchBar from "components/gestionUsuarios/BarraBusqueda";
import UserTable, {
  AccionIcons,
} from "components/gestionUsuarios/TablaUsuarios";
import Pagination from "components/gestionUsuarios/Paginacion";
import UserModal from "components/gestionUsuarios/UsuariosModel";
import { useUsuarios } from "hooks/useUsuarios";
import { usePagination } from "hooks/usePagination";
import { useCrearBarbero } from "hooks/barberos/useCrearBarbero";

const GestionBarberos = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
    handleCambiarEstado, // ✅ correcto
  } = useUsuarios("barbero");

  const { paginaActual, totalPaginas, itemsPaginados, cambiarPagina } =
    usePagination(usuarios, 6);

  const {
    modalCrear,
    formCrear,
    toggleCrear,
    handleCrearChange,
    handleCrearBarbero,
    rut,
    rutError,
    handleRutChange,
  } = useCrearBarbero();

  const columnas = [
    { key: "nombre", label: "Nombre" },
    { key: "apellido", label: "Apellido" },
    { key: "rut", label: "RUT" },
    { key: "email", label: "Email" },
    {
      key: "estado",
      label: "Estado",
      render: (value) => {
        const activo = value === "activo";
        return (
          <Badge
            color={activo ? "success" : "danger"}
            className="py-2 px-3"
            style={{ borderRadius: "20px", fontWeight: "500" }}
          >
            {activo ? "Activo" : "Inactivo"}
          </Badge>
        );
      },
    },
  ];

  const acciones = [
    {
      id: "editar",
      icon: AccionIcons.EDITAR,
      color: "primary",
      title: "Editar datos",
    },
    {
      id: "estado",
      icon: AccionIcons.ELIMINAR,
      color: "warning",
      title: "Activar / Inactivar",
    },
  ];

  const handleAccion = async (accionId, usuario) => {
    try {
      if (accionId === "editar") {
        handleEditar(usuario);
      }

      if (accionId === "estado") {
        const activar = usuario.estado === "inactivo";

        const confirm = await Swal.fire({
          title: activar ? "¿Reactivar usuario?" : "¿Inactivar usuario?",
          text: activar
            ? "El usuario podrá volver a acceder al sistema"
            : "El usuario no podrá acceder al sistema",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: activar ? "Sí, reactivar" : "Sí, inactivar",
          cancelButtonText: "Cancelar",
        });

        if (confirm.isConfirmed) {
          await handleCambiarEstado(
            usuario._id,
            activar ? "activo" : "inactivo"
          );

          Swal.fire(
            "Listo",
            activar ? "Usuario reactivado" : "Usuario inactivado",
            "success"
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
          <Col xl="10">
            <Card className="bg-secondary shadow border-0">
              <CardHeader className="bg-white border-0">
                <Row className="align-items-center">
                  <Col xs="8">
                    <h3 className="mb-0">Gestión de Barberos</h3>
                  </Col>
                  <Col xs="4" className="text-right">
                    <Button color="primary" onClick={toggleCrear} size="sm">
                      <FiPlus className="mr-1" />
                      Crear
                    </Button>
                  </Col>
                </Row>
              </CardHeader>

              <CardBody>
                <SearchBar
                  busqueda={busqueda}
                  onBusquedaChange={setBusqueda}
                  placeholder="Buscar barberos..."
                  totalResultados={usuarios.length}
                />

                {isMobile ? (
                  <Row className="mt-3">
                    {itemsPaginados.map((u) => {
                      const activo = u.estado === "activo";

                      return (
                        <Col xs="12" key={u._id} className="mb-3">
                          <Card className="shadow-sm">
                            <CardBody className="p-3">
                              <Row className="align-items-center">
                                <Col xs="8">
                                  <h6 className="mb-1 font-weight-bold">
                                    {u.nombre} {u.apellido}
                                  </h6>
                                  <small className="text-muted d-block">
                                    {u.email}
                                  </small>
                                  <small className="text-muted">
                                    RUT: {u.rut}
                                  </small>
                                </Col>
                                <Col xs="4" className="text-right">
                                  <Badge
                                    color={activo ? "success" : "danger"}
                                    className="py-1 px-2"
                                  >
                                    {activo ? "Activo" : "Inactivo"}
                                  </Badge>
                                </Col>
                              </Row>

                              <hr className="my-2" />

                              <Row>
                                <Col xs="6" className="pr-1">
                                  <Button
                                    size="sm"
                                    color="primary"
                                    block
                                    onClick={() => handleAccion("editar", u)}
                                  >
                                    Editar
                                  </Button>
                                </Col>
                                <Col xs="6" className="pl-1">
                                  <Button
                                    size="sm"
                                    color={activo ? "danger" : "success"}
                                    block
                                    onClick={() => handleAccion("estado", u)}
                                  >
                                    {activo ? "Inactivar" : "Reactivar"}
                                  </Button>
                                </Col>
                              </Row>
                            </CardBody>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                ) : (
                  <UserTable
                    usuarios={itemsPaginados}
                    columns={columnas}
                    acciones={acciones}
                    onAccion={handleAccion}
                  />
                )}

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
        <ModalHeader toggle={toggleCrear}>Crear Barbero</ModalHeader>
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
                    <Label>{name}</Label>
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

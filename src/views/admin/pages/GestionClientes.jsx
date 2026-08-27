import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Spinner,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import Swal from "sweetalert2";

import UserHeader from "components/Headers/UserHeader";
import SearchBar from "components/gestionUsuarios/BarraBusqueda";
import UserTable, {
  AccionIcons,
} from "components/gestionUsuarios/TablaUsuarios";
import Pagination from "components/gestionUsuarios/Paginacion";
import GestionUsuariosModal from "components/gestionUsuarios/GestionUsuarioModal";
import UserModal from "components/gestionUsuarios/UsuariosModel";
import ClienteDetallesModal from "components/gestionUsuarios/ClienteDetallesModal";

import { useUsuarios } from "hooks/useUsuarios";
import { usePagination } from "hooks/usePagination";
import { usePlanesSuscripcion } from "context/PlanesSuscripcionContext";
import { useCrearCliente } from "hooks/useCrearCliente";
import { useEmpresa } from "context/EmpresaContext";
import PlanesMembresiaContext from "context/PlanesMembresiaContext";
import {
  postCrearMembresia,
  getEstadoMembresiaCliente,
  getListarMembresias,
} from "api/membresiasClases";

// Importar iconos actualizados
import { FiEye, FiEdit, FiUser, FiUsers, FiPlus } from "react-icons/fi";

const GestionClientes = () => {
  const {
    usuarios,
    busqueda,
    modal,
    usuarioEdit,
    modalGestion,
    loading,
    setBusqueda,
    setUsuarioEdit,
    handleEditar,
    handleGuardar,
    handleSuscribir,
    handleEliminarUsuario,
    toggleModal,
    toggleModalGestion,
    getAllUsers,
  } = useUsuarios("cliente");

  const { planes, loadingPlanes, getAllPlanes: getAllPlanesSuscripcion } = usePlanesSuscripcion();

  const {
    modalCrear,
    formCrear,
    toggleCrear,
    handleCrearChange,
    handleCrearCliente,
    rut,
    rutError,
    handleRutChange,
  } = useCrearCliente();

  const handleCrearClienteConRefresco = async () => {
    const ok = await handleCrearCliente();
    if (ok) getAllUsers();
  };

  const { empresa } = useEmpresa();
  // RUT y teléfono son opcionales SOLO para el gimnasio (ver useCrearCliente,
  // que ya relaja la validación); acá solo ajustamos qué campos se marcan
  // como obligatorios en la UI.
  const esGimnasio = empresa?.rubro === "gimnasio";

  // Membresía de clases (gimnasio) del cliente que se está viendo — se
  // reutiliza el mismo endpoint/estado que ya usa "Mi plan" del cliente,
  // no se duplica el cálculo de clases usadas/restantes.
  const { planes: planesMembresiaGimnasio, getAllPlanes: getAllPlanesMembresiaGimnasio } =
    useContext(PlanesMembresiaContext);
  const [membresiaCliente, setMembresiaCliente] = useState(null);
  const [cargandoMembresiaCliente, setCargandoMembresiaCliente] = useState(false);
  const [guardandoMembresiaCliente, setGuardandoMembresiaCliente] = useState(false);

  // Membresías activas de TODA la empresa, para pintar la columna
  // "Membresía" de la tabla sin hacer una consulta por cada cliente listado
  // (mismo endpoint que ya usa el panel de Membresías con activas:"true").
  const [membresiasActivasPorCliente, setMembresiasActivasPorCliente] = useState(new Map());

  const cargarMembresiasActivas = async () => {
    try {
      const res = await getListarMembresias({ activas: "true" });
      const mapa = new Map(
        (res.data?.membresias || [])
          .filter((m) => m.cliente?._id)
          .map((m) => [m.cliente._id, m]),
      );
      setMembresiasActivasPorCliente(mapa);
    } catch (error) {
      console.error("Error al obtener las membresías activas:", error);
    }
  };

  useEffect(() => {
    if (esGimnasio) {
      getAllPlanesMembresiaGimnasio(false);
      cargarMembresiasActivas();
    } else {
      // Antes esto dependía de que el admin ya hubiera visitado "Planes de
      // suscripción" en algún momento de la sesión (PlanesSuscripcionContext
      // no trae fetch propio al montar) — si entraba directo a "Clientes"
      // (típico en el celular, sesión recién abierta) el selector de planes
      // al suscribir quedaba vacío aunque sí hubiera planes creados.
      getAllPlanesSuscripcion(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esGimnasio]);

  // Estados para el nuevo modal de detalles
  const [modalDetalles, setModalDetalles] = useState(false);
  const [vistaMobile, setVistaMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setVistaMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleModalDetalles = () => {
    setModalDetalles(!modalDetalles);
  };

  const { paginaActual, totalPaginas, itemsPaginados, cambiarPagina } =
    usePagination(usuarios, vistaMobile ? 3 : 5); // Menos items en móvil

  // Columnas para desktop
  const columnasDesktop = [
    { key: "nombre", label: "Nombre" },
    { key: "apellido", label: "Apellido" },
    { key: "telefono", label: "Teléfono" },
    esGimnasio
      ? {
          key: "membresia",
          label: "Membresía",
          render: (_, usuario) => {
            const activa = membresiasActivasPorCliente.has(usuario._id);
            return activa ? (
              <Badge color="success" pill className="px-3">
                Activa
              </Badge>
            ) : (
              <Badge color="secondary" pill className="px-3">
                Sin membresía
              </Badge>
            );
          },
        }
      : {
          key: "suscripcion",
          label: "Suscripción",
          render: (_, usuario) => {
            const s = usuario.suscripcion;
            if (s && s.activa) {
              return (
                <Badge color="success" pill className="px-3">
                  Activa
                </Badge>
              );
            }
            return (
              <Badge color="danger" pill className="px-3">
                Inactiva
              </Badge>
            );
          },
        },
  ];

  // Columnas simplificadas para móvil
  const columnasMobile = [
    {
      key: "nombre",
      label: "Cliente",
      render: (_, usuario) => (
        <div className="d-flex align-items-center">
          <div className="mr-2">
            <span className="avatar avatar-sm rounded-circle bg-gradient-primary">
              <FiUser size={14} className="text-white" />
            </span>
          </div>
          <div>
            <div className="font-weight-bold">
              {usuario.nombre} {usuario.apellido}
            </div>
            <small className="text-muted">{usuario.telefono}</small>
          </div>
          {esGimnasio && (
            <Badge
              color={membresiasActivasPorCliente.has(usuario._id) ? "success" : "secondary"}
              pill
              className="ml-auto"
              style={{ fontSize: "10px" }}
            >
              {membresiasActivasPorCliente.has(usuario._id) ? "Activa" : "Sin membresía"}
            </Badge>
          )}
        </div>
      ),
    },
  ];

  const acciones = [
    {
      id: "ver",
      icon: <FiEye size={vistaMobile ? 14 : 16} />,
      color: "info",
      title: "Ver detalles",
      className: vistaMobile ? "btn-sm btn-outline-info" : "btn-outline-info",
    },
    {
      id: "editar",
      icon: <FiEdit size={vistaMobile ? 14 : 16} />,
      color: "warning",
      title: "Editar",
      className: vistaMobile
        ? "btn-sm btn-outline-warning"
        : "btn-outline-warning",
    },
  ];

  const cargarMembresiaCliente = async (usuarioId) => {
    setCargandoMembresiaCliente(true);
    try {
      const res = await getEstadoMembresiaCliente(usuarioId);
      setMembresiaCliente(res.data);
    } catch (error) {
      console.error("Error al obtener la membresía del cliente:", error);
      setMembresiaCliente(null);
    } finally {
      setCargandoMembresiaCliente(false);
    }
  };

  const handleAccion = async (accionId, usuario) => {
    switch (accionId) {
      case "ver":
        setUsuarioEdit(usuario);
        toggleModalDetalles();
        if (esGimnasio) {
          setMembresiaCliente(null);
          cargarMembresiaCliente(usuario._id);
        }
        break;
      case "editar":
        handleEditar(usuario);
        break;
      default:
        break;
    }
  };

  const handleAsignarMembresiaGimnasio = async (planId) => {
    if (!usuarioEdit) return;
    setGuardandoMembresiaCliente(true);
    try {
      await postCrearMembresia({ clienteId: usuarioEdit._id, planId });
      Swal.fire({
        icon: "success",
        title: "¡Membresía asignada!",
        showConfirmButton: false,
        timer: 1500,
        toast: vistaMobile,
        position: vistaMobile ? "top-end" : "center",
      });
      cargarMembresiaCliente(usuarioEdit._id);
      cargarMembresiasActivas();
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo asignar la membresía",
        "error",
      );
    } finally {
      setGuardandoMembresiaCliente(false);
    }
  };

  const handleGuardarConAlerta = async () => {
    try {
      await handleGuardar();
      Swal.fire({
        icon: "success",
        title: "¡Guardado!",
        text: "Datos del cliente actualizados",
        showConfirmButton: false,
        timer: 1500,
        toast: vistaMobile,
        position: vistaMobile ? "top-end" : "center",
      });
      getAllUsers();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
        toast: vistaMobile,
        position: vistaMobile ? "top-end" : "center",
      });
    }
  };

  const [loadingSuscripcion, setLoadingSuscripcion] = useState(false);

  const handleSuscribirModal = async (planId) => {
    setLoadingSuscripcion(true);
    Swal.fire({
      title: "Activando suscripción...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      await handleSuscribir(usuarioEdit._id, "suscribir", planId);
      Swal.fire({
        icon: "success",
        title: "¡Suscripción activada!",
        showConfirmButton: false,
        timer: 1500,
        toast: vistaMobile,
        position: vistaMobile ? "top-end" : "center",
      });
      toggleModalDetalles();
      getAllUsers();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al activar",
        text: error?.response?.data?.message || "Ocurrió un error inesperado",
        confirmButtonText: "Cerrar",
      });
    } finally {
      setLoadingSuscripcion(false);
    }
  };

  const handleCancelarSuscripcionModal = async () => {
    setLoadingSuscripcion(true);
    Swal.fire({
      title: "Desactivando suscripción...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    await handleSuscribir(usuarioEdit._id, "cancelar");
    setLoadingSuscripcion(false);

    Swal.fire({
      icon: "info",
      title: "Suscripción cancelada",
      showConfirmButton: false,
      timer: 1500,
      toast: vistaMobile,
      position: vistaMobile ? "top-end" : "center",
    });
    toggleModalDetalles();
    getAllUsers();
  };

  const handleEliminarModal = async () => {
    const confirm = await Swal.fire({
      title: "¿Eliminar cliente?",
      text: `${usuarioEdit?.nombre} ${usuarioEdit?.apellido} será eliminado permanentemente`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      ...(vistaMobile && {
        toast: true,
        position: "top",
        timer: undefined,
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: "Eliminar",
        cancelButtonText: "No",
      }),
    });

    if (!confirm.isConfirmed) return;

    await handleEliminarUsuario(usuarioEdit._id);
    Swal.fire({
      icon: "success",
      title: "Eliminado",
      text: "El cliente ha sido eliminado",
      showConfirmButton: false,
      timer: 1500,
      toast: vistaMobile,
      position: vistaMobile ? "top-end" : "center",
    });
    toggleModalDetalles();
    getAllUsers();
  };

  // Renderizado de contador de resultados
  const renderResultados = () => (
    <div className="d-flex justify-content-between align-items-center mt-3 mt-md-0">
      <small className="text-muted">
        <FiUsers size={14} className="mr-1" />
        {usuarios.length} {usuarios.length === 1 ? "cliente" : "clientes"}{" "}
        encontrados
      </small>
      {vistaMobile && usuarios.length > 0 && (
        <small className="text-muted">
          Pág. {paginaActual} de {totalPaginas}
        </small>
      )}
    </div>
  );

  if (loading) {
    return (
      <>
        <UserHeader />
        <Container className="mt--7" fluid>
          <Row className="justify-content-center">
            <Col xl="10">
              <Card className="bg-secondary shadow">
                <CardBody className="text-center py-5">
                  <Spinner color="primary" />
                  <p className="mt-3 text-muted">Cargando clientes...</p>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </>
    );
  }

  return (
    <>
      <UserHeader />
      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col xl="10" lg="12" md="12">
            <Card className="bg-secondary shadow">
              <CardHeader className="bg-white border-0 py-3">
                <Row className="align-items-center">
                  <Col xs="12" md="5" className="mb-2 mb-md-0">
                    <h3 className="mb-0 text-default d-flex align-items-center">
                      <FiUsers className="mr-2 text-primary" size={24} />
                      Gestión de Clientes
                    </h3>
                  </Col>
                  <Col xs="12" md="4" className="mb-2 mb-md-0">
                    <SearchBar
                      busqueda={busqueda}
                      onBusquedaChange={setBusqueda}
                      placeholder="Buscar por nombre, apellido o teléfono..."
                      totalResultados={usuarios.length}
                      compact={vistaMobile}
                    />
                  </Col>
                  <Col xs="12" md="3" className="text-md-right">
                    <Button
                      color="primary"
                      block={vistaMobile}
                      onClick={toggleCrear}
                    >
                      <FiPlus className="mr-1" /> Crear Cliente
                    </Button>
                  </Col>
                </Row>
                {renderResultados()}
              </CardHeader>

              <CardBody className={vistaMobile ? "px-2 py-3" : ""}>
                {usuarios.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="bg-light rounded-circle d-inline-flex p-3 mb-3">
                      <FiUsers size={32} className="text-muted" />
                    </div>
                    <h5 className="text-muted">No hay clientes</h5>
                    <p className="text-muted mb-0">
                      {busqueda
                        ? "No se encontraron resultados para tu búsqueda"
                        : "Los clientes aparecerán aquí cuando se registren"}
                    </p>
                    {busqueda && (
                      <Button
                        color="link"
                        className="mt-3"
                        onClick={() => setBusqueda("")}
                      >
                        Limpiar búsqueda
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <UserTable
                      usuarios={itemsPaginados}
                      columns={vistaMobile ? columnasMobile : columnasDesktop}
                      acciones={acciones}
                      onAccion={handleAccion}
                      compact={vistaMobile}
                    />

                    {!vistaMobile && (
                      <Pagination
                        paginaActual={paginaActual}
                        totalPaginas={totalPaginas}
                        onPaginaChange={cambiarPagina}
                      />
                    )}

                    {vistaMobile && totalPaginas > 1 && (
                      <div className="d-flex justify-content-center mt-3">
                        <Pagination
                          paginaActual={paginaActual}
                          totalPaginas={totalPaginas}
                          onPaginaChange={cambiarPagina}
                          size="sm"
                        />
                      </div>
                    )}
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* MODAL DETALLES DEL CLIENTE - Adaptado para móvil */}
      <ClienteDetallesModal
        isOpen={modalDetalles}
        toggle={toggleModalDetalles}
        usuario={usuarioEdit}
        planes={planes}
        cargandoPlanes={loadingPlanes}
        onEditar={() => {
          toggleModalDetalles();
          handleEditar(usuarioEdit);
        }}
        onSuscribir={handleSuscribirModal}
        onCancelarSuscripcion={handleCancelarSuscripcionModal}
        onEliminar={handleEliminarModal}
        fullscreen={vistaMobile}
        esGimnasio={esGimnasio}
        membresiaGimnasio={membresiaCliente}
        cargandoMembresiaGimnasio={cargandoMembresiaCliente}
        planesMembresiaGimnasio={planesMembresiaGimnasio}
        guardandoMembresiaGimnasio={guardandoMembresiaCliente}
        onAsignarMembresiaGimnasio={handleAsignarMembresiaGimnasio}
      />

      {/* MODAL EDITAR - Adaptado para móvil */}
      <UserModal
        isOpen={modal}
        toggle={toggleModal}
        usuario={usuarioEdit}
        onSave={handleGuardarConAlerta}
        tipoUsuario="cliente"
        fullscreen={vistaMobile}
      />

      {/* MODAL CREAR CLIENTE - mismo patrón que "Crear Profesional" en
          GestionBarberos.jsx, sin foto/especialidades porque un cliente
          no las usa */}
      <Modal
        isOpen={modalCrear}
        toggle={toggleCrear}
        centered
        size="lg"
        fullscreen={vistaMobile}
      >
        <ModalHeader toggle={toggleCrear}>Crear Cliente</ModalHeader>
        <ModalBody>
          <Form>
            <Row>
              <Col sm={6}>
                <FormGroup>
                  <Label>RUT {esGimnasio ? "(opcional)" : "*"}</Label>
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

              {["nombre", "apellido", "telefono", "email"].map((name) => {
                const opcional = esGimnasio && name === "telefono";
                const label = name.charAt(0).toUpperCase() + name.slice(1);
                return (
                  <Col sm={6} key={name}>
                    <FormGroup>
                      <Label>
                        {label} {opcional ? "(opcional)" : name === "telefono" ? "*" : ""}
                      </Label>
                      <Input
                        name={name}
                        value={formCrear[name]}
                        onChange={handleCrearChange}
                      />
                    </FormGroup>
                  </Col>
                );
              })}

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
              <Button color="primary" onClick={handleCrearClienteConRefresco}>
                Crear
              </Button>
            </div>
          </Form>
        </ModalBody>
      </Modal>

      <style jsx>{`
        @media (max-width: 768px) {
          .card-body {
            padding: 1rem !important;
          }

          .table-responsive {
            margin: 0 -0.5rem;
          }

          /* Mejorar scroll en móvil */
          .table-responsive::-webkit-scrollbar {
            height: 3px;
          }

          .table-responsive::-webkit-scrollbar-thumb {
            background-color: #adb5bd;
            border-radius: 3px;
          }
        }
      `}</style>
    </>
  );
};

export default GestionClientes;

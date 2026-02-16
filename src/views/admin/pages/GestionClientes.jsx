import React, { useState, useEffect } from "react";
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
} from "reactstrap";
import Swal from "sweetalert2";

import UserHeader from "components/Headers/UserHeader";
import SearchBar from "components/gestionUsuarios/BarraBusqueda";
import UserTable, { AccionIcons } from "components/gestionUsuarios/TablaUsuarios";
import Pagination from "components/gestionUsuarios/Paginacion";
import GestionUsuariosModal from "components/gestionUsuarios/GestionUsuarioModal";
import UserModal from "components/gestionUsuarios/UsuariosModel";
import ClienteDetallesModal from "components/gestionUsuarios/ClienteDetallesModal";

import { useUsuarios } from "hooks/useUsuarios";
import { usePagination } from "hooks/usePagination";

// Importar iconos actualizados
import { FiEye, FiEdit, FiUser, FiUsers } from "react-icons/fi";

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
    getAllUsers
  } = useUsuarios("cliente");

  // Estados para el nuevo modal de detalles
  const [modalDetalles, setModalDetalles] = useState(false);
  const [vistaMobile, setVistaMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setVistaMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
    {
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
        return <Badge color="danger" pill className="px-3">Inactiva</Badge>;
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
      className: vistaMobile ? "btn-sm btn-outline-info" : "btn-outline-info"
    },
    {
      id: "editar",
      icon: <FiEdit size={vistaMobile ? 14 : 16} />,
      color: "warning",
      title: "Editar",
      className: vistaMobile ? "btn-sm btn-outline-warning" : "btn-outline-warning"
    }
  ];

  const handleAccion = async (accionId, usuario) => {
    switch (accionId) {
      case "ver":
        setUsuarioEdit(usuario);
        toggleModalDetalles();
        break;
      case "editar":
        handleEditar(usuario);
        break;
      default:
        break;
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
        position: vistaMobile ? 'top-end' : 'center'
      });
      getAllUsers();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
        toast: vistaMobile,
        position: vistaMobile ? 'top-end' : 'center'
      });
    }
  };

  const handleSuscribirModal = async () => {
    await handleSuscribir(usuarioEdit._id, "suscribir");
    Swal.fire({
      icon: "success",
      title: "¡Suscripción activada!",
      showConfirmButton: false,
      timer: 1500,
      toast: vistaMobile,
      position: vistaMobile ? 'top-end' : 'center'
    });
    toggleModalDetalles();
    getAllUsers();
  };

  const handleCancelarSuscripcionModal = async () => {
    await handleSuscribir(usuarioEdit._id, "cancelar");
    Swal.fire({
      icon: "info",
      title: "Suscripción cancelada",
      showConfirmButton: false,
      timer: 1500,
      toast: vistaMobile,
      position: vistaMobile ? 'top-end' : 'center'
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
        position: 'top',
        timer: undefined,
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: "Eliminar",
        cancelButtonText: "No"
      })
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
      position: vistaMobile ? 'top-end' : 'center'
    });
    toggleModalDetalles();
    getAllUsers();
  };

  // Renderizado de contador de resultados
  const renderResultados = () => (
    <div className="d-flex justify-content-between align-items-center mt-3 mt-md-0">
      <small className="text-muted">
        <FiUsers size={14} className="mr-1" />
        {usuarios.length} {usuarios.length === 1 ? 'cliente' : 'clientes'} encontrados
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
                  <Col xs="12" md="6" className="mb-2 mb-md-0">
                    <h3 className="mb-0 text-default d-flex align-items-center">
                      <FiUsers className="mr-2 text-primary" size={24} />
                      Gestión de Clientes
                    </h3>
                  </Col>
                  <Col xs="12" md="6">
                    <SearchBar
                      busqueda={busqueda}
                      onBusquedaChange={setBusqueda}
                      placeholder="Buscar por nombre, apellido o teléfono..."
                      totalResultados={usuarios.length}
                      compact={vistaMobile}
                    />
                  </Col>
                </Row>
                {renderResultados()}
              </CardHeader>

              <CardBody className={vistaMobile ? 'px-2 py-3' : ''}>
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
        onEditar={() => {
          toggleModalDetalles();
          handleEditar(usuarioEdit);
        }}
        onSuscribir={handleSuscribirModal}
        onCancelarSuscripcion={handleCancelarSuscripcionModal}
        onEliminar={handleEliminarModal}
        fullscreen={vistaMobile}
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
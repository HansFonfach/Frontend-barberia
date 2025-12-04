import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Badge,
} from "reactstrap";
import Swal from "sweetalert2";

import UserHeader from "components/Headers/UserHeader";
import SearchBar from "components/gestionUsuarios/BarraBusqueda";
import UserTable, { AccionIcons } from "components/gestionUsuarios/TablaUsuarios";
import Pagination from "components/gestionUsuarios/Paginacion";
import GestionUsuariosModal from "components/gestionUsuarios/GestionUsuarioModal";
import UserModal from "components/gestionUsuarios/UsuariosModel";
import ClienteDetallesModal from "components/gestionUsuarios/ClienteDetallesModal"; // Nuevo modal

import { useUsuarios } from "hooks/useUsuarios";
import { usePagination } from "hooks/usePagination";

// Importar iconos actualizados
import { FiEye, FiEdit } from "react-icons/fi";

const GestionClientes = () => {
  const {
    usuarios,
    busqueda,
    modal,
    usuarioEdit,
    modalGestion,
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

  const toggleModalDetalles = () => {
    setModalDetalles(!modalDetalles);
  };

  const { paginaActual, totalPaginas, itemsPaginados, cambiarPagina } =
    usePagination(usuarios, 5);

  const columnas = [
    { key: "nombre", label: "Nombre" },
    { key: "apellido", label: "Apellido" },
    { key: "telefono", label: "Teléfono" },

  ];

  // Solo 2 acciones en la tabla - más simple y moderno
  const acciones = [
    {
      id: "ver",
      icon: <FiEye size={16} />,
      color: "info",
      title: "Ver detalles y gestionar",
      className: "btn-outline-info"
    },
    {
      id: "editar",
      icon: <FiEdit size={16} />,
      color: "warning",
      title: "Editar información",
      className: "btn-outline-warning"
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
    }
  };

  const handleGuardarConAlerta = async () => {
    try {
      await handleGuardar();
      Swal.fire({
        icon: "success",
        title: "Guardado",
        text: "Datos del cliente actualizados",
        showConfirmButton: false,
        timer: 1500
      });
      getAllUsers();
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const handleSuscribirModal = async () => {
    await handleSuscribir(usuarioEdit._id, "suscribir");
    Swal.fire({
      icon: "success",
      title: "Suscripción activada",
      showConfirmButton: false,
      timer: 1500
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
      timer: 1500
    });
    toggleModalDetalles();
    getAllUsers();
  };

  const handleEliminarModal = async () => {
    const confirm = await Swal.fire({
      title: "¿Eliminar cliente?",
      text: `${usuarioEdit.nombre} ${usuarioEdit.apellido} será eliminado permanentemente`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (!confirm.isConfirmed) return;

    await handleEliminarUsuario(usuarioEdit._id);
    Swal.fire({
      icon: "success",
      title: "Eliminado",
      text: "El cliente ha sido eliminado",
      showConfirmButton: false,
      timer: 1500
    });
    toggleModalDetalles();
    getAllUsers();
  };

  return (
    <>
      <UserHeader />
      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col xl="10">
            <Card className="bg-secondary shadow">
              <CardHeader className="bg-white border-0">
                <h3 className="mb-0 text-default">Gestión de Clientes</h3>
              </CardHeader>

              <CardBody>
                <SearchBar
                  busqueda={busqueda}
                  onBusquedaChange={setBusqueda}
                  placeholder="Buscar clientes..."
                  totalResultados={usuarios.length}
                />

                <UserTable
                  usuarios={itemsPaginados}
                  columns={columnas}
                  acciones={acciones}
                  onAccion={handleAccion}
                />

                <Pagination
                  paginaActual={paginaActual}
                  totalPaginas={totalPaginas}
                  onPaginaChange={cambiarPagina}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* MODAL DETALLES DEL CLIENTE (NUEVO) */}
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
      />

      {/* MODAL EDITAR (MANTENIDO) */}
      <UserModal
        isOpen={modal}
        toggle={toggleModal}
        usuario={usuarioEdit}
        onSave={handleGuardarConAlerta}
        tipoUsuario="cliente"
      />
    </>
  );
};

export default GestionClientes;
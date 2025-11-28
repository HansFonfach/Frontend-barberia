import React from "react";
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

import { useUsuarios } from "hooks/useUsuarios";
import { usePagination } from "hooks/usePagination";

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
    getAllUsers   // ← EL NOMBRE CORRECTO
  } = useUsuarios("cliente");

  const { paginaActual, totalPaginas, itemsPaginados, cambiarPagina } =
    usePagination(usuarios, 5);

  const columnas = [
    { key: "nombre", label: "Nombre" },
    { key: "apellido", label: "Apellido" },
    { key: "rut", label: "RUT" },
    { key: "email", label: "Email" },
    { key: "telefono", label: "Teléfono" },
    {
      key: "suscripcion",
      label: "Suscripción",
      render: (_, usuario) => {
        const s = usuario.suscripcion;

        if (s && s.activa) {
          return (
            <Badge color="success">
              Activa 
            </Badge>
          );
        }
        return <Badge color="danger">Inactivo</Badge>;
      },
    },
  ];

  const acciones = [
    {
      id: "gestionar",
      icon: AccionIcons.EDITAR,
      color: "info",
      title: "Gestionar usuario",
    },
    {
      id: "editar",
      icon: AccionIcons.EDITAR,
      color: "warning",
      title: "Editar información",
    }
  ];

  const handleAccion = async (accionId, usuario) => {
    switch (accionId) {
      case "gestionar":
        setUsuarioEdit(usuario);
        toggleModalGestion();
        break;

      case "editar":
        handleEditar(usuario);
        break;
    }
  };

  const handleGuardarConAlerta = async () => {
    try {
      await handleGuardar();
      Swal.fire("Guardado", "Datos del cliente actualizados", "success");
      getAllUsers();   // ← CORREGIDO
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const handleSuscribirModal = async () => {
    await handleSuscribir(usuarioEdit._id, "suscribir");
    Swal.fire("Suscripción activada", "", "success");
    toggleModalGestion();
    getAllUsers();   // ← CORREGIDO
  };

  const handleCancelarSuscripcionModal = async () => {
    await handleSuscribir(usuarioEdit._id, "cancelar");
    Swal.fire("Suscripción cancelada", "", "info");
    toggleModalGestion();
    getAllUsers();   // ← CORREGIDO
  };

  const handleEliminarModal = async () => {
    const confirm = await Swal.fire({
      title: "¿Eliminar usuario?",
      text: "No podrás deshacer esto",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Eliminar",
    });

    if (!confirm.isConfirmed) return;

    await handleEliminarUsuario(usuarioEdit._id);
    Swal.fire("Eliminado", "", "success");
    toggleModalGestion();
    getAllUsers();   // ← CORREGIDO
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

      {/* MODAL GESTION */}
      <GestionUsuariosModal
        isOpen={modalGestion}
        toggle={toggleModalGestion}
        usuario={usuarioEdit}
        onSuscribir={handleSuscribirModal}
        onCancelarSuscripcion={handleCancelarSuscripcionModal}
        onEliminar={handleEliminarModal}
      />

      {/* MODAL EDITAR */}
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

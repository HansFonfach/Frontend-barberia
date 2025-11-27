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
import { FiScissors } from "react-icons/fi";
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
    handleTransformarRol,
  } = useUsuarios("barbero");

  const { paginaActual, totalPaginas, itemsPaginados, cambiarPagina } =
    usePagination(usuarios, 6);

  const columnas = [
    { key: "nombre", label: "Nombre" },
    { key: "apellido", label: "Apellido" },
    { key: "rut", label: "RUT" },
    { key: "email", label: "Email" },
    {
      key: "estado",
      label: "Estado",
      render: (value) => (
        <Badge color={value ? "success" : "danger"}>
          {value ? "Activo" : "Inactivo"}
        </Badge>
      ),
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
      id: "eliminar",
      icon: AccionIcons.ELIMINAR,
      color: "danger",
      title: "Eliminar barbero",
    },
  ];

  const handleAccion = async (accionId, barbero) => {
    try {
      switch (accionId) {
        case "editar":
          handleEditar(barbero);
          break;

        case "eliminar":
          const result = await Swal.fire({
            title: "¿Eliminar barbero?",
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            confirmButtonColor: "#d33",
          });

          if (result.isConfirmed) {
            Swal.fire("Eliminado", "El barbero ha sido eliminado.", "success");
            handleTransformarRol(barbero._id, "cliente");
          }
          break;
      }
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const handleChange = (e) => {
    setUsuarioEdit({ ...usuarioEdit, [e.target.name]: e.target.value });
  };

  const handleGuardarConAlerta = async () => {
    try {
      await handleGuardar();
      Swal.fire("Guardado", "Datos del barbero actualizados", "success");
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  return (
    <>
      <UserHeader />
      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col xl="10">
            <Card className="bg-secondary shadow">
              <CardHeader className="bg-white border-0">
                <Row className="align-items-center">
                  <Col xs="8">
                    <h3 className="mb-0 text-default">
                      <FiScissors className="text-primary mr-2" />
                      Gestión de Barberos
                    </h3>
                    <p className="text-sm text-muted mb-0 mt-1">
                      Administra los barberos registrados en tu barbería
                    </p>
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

                <UserTable
                  usuarios={itemsPaginados}
                  columns={columnas}
                  acciones={acciones}
                  onAccion={handleAccion}
                  emptyMessage={
                    busqueda
                      ? "No se encontraron barberos con tu búsqueda"
                      : "Aún no tienes barberos registrados"
                  }
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

      <UserModal
        isOpen={modal}
        toggle={toggleModal}
        usuario={usuarioEdit}
        onSave={handleGuardarConAlerta}
        onFieldChange={handleChange}
        tipoUsuario="barbero"
      />
    </>
  );
};

export default GestionBarberos;

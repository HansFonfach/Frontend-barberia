import React from 'react';
import { Container, Row, Col, Card, CardBody, CardHeader, Badge } from 'reactstrap';
import { FiUserCheck } from 'react-icons/fi';
import Swal from 'sweetalert2';

import UserHeader from 'components/Headers/UserHeader';
import SearchBar from 'components/gestionUsuarios/BarraBusqueda';
import UserTable, { AccionIcons } from 'components/gestionUsuarios/TablaUsuarios';
import Pagination from 'components/gestionUsuarios/Paginacion';
import UserModal from 'components/gestionUsuarios/UsuariosModel';
import { useUsuarios } from 'hooks/useUsuarios';
import { usePagination } from 'hooks/usePagination';

const GestionClientes = () => {
  const {
    usuarios,
    busqueda,
    modal,
    usuarioEdit,
    setBusqueda,
    setUsuarioEdit,
    handleEditar,
    handleGuardar,
    handleSuscribir,
    handleTransformarRol,
    toggleModal,
  } = useUsuarios('cliente');

  const { paginaActual, totalPaginas, itemsPaginados, cambiarPagina } = 
    usePagination(usuarios, 5);

  const columnas = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'apellido', label: 'Apellido' },
    { key: 'rut', label: 'RUT' },
    { key: 'email', label: 'Email' },
    { key: 'telefono', label: 'Teléfono' },
    { 
      key: 'suscrito', 
      label: 'Suscripción',
      render: (value) => (
        <Badge color={value ? 'success' : 'danger'}>
          {value ? 'Activo' : 'Inactivo'}
        </Badge>
      )
    },
  ];

  const acciones = [
    { id: 'suscribir', icon: AccionIcons.SUSCRIBIR, color: 'success', title: 'Activar/desactivar suscripción' },
    { id: 'editar', icon: AccionIcons.EDITAR, color: 'primary', title: 'Editar datos' },
    { id: 'transformar', icon: AccionIcons.TRANSFORMAR, color: 'warning', title: 'Transformar a Barbero' },
    { id: 'eliminar', icon: AccionIcons.ELIMINAR, color: 'danger', title: 'Eliminar cliente' },
  ];

  const handleAccion = async (accionId, cliente) => {
    try {
      switch (accionId) {
        case 'editar':
          handleEditar(cliente);
          break;

        case 'suscribir':
          const resultado = await handleSuscribir(cliente._id);
          Swal.fire({
            icon: 'success',
            title: resultado.suscrito ? 'Cliente suscrito' : 'Suscripción cancelada',
            timer: 1500,
            showConfirmButton: false,
          });
          break;

        case 'transformar':
          const result = await Swal.fire({
            title: '¿Convertir a barbero?',
            text: `Convierte a ${cliente.nombre} ${cliente.apellido} en barbero.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, convertir',
          });

          if (result.isConfirmed) {
            await handleTransformarRol(cliente._id, 'barbero');
            Swal.fire({
              icon: 'success',
              title: 'Usuario convertido',
              text: `${cliente.nombre} ahora es barbero.`,
              timer: 1600,
              showConfirmButton: false,
            });
          }
          break;

        case 'eliminar':
          const eliminarResult = await Swal.fire({
            title: '¿Eliminar cliente?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            confirmButtonColor: '#d33',
          });

          if (eliminarResult.isConfirmed) {
            Swal.fire('Eliminado', 'El cliente ha sido eliminado.', 'success');
          }
          break;
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const handleChange = (e) => {
    setUsuarioEdit({ ...usuarioEdit, [e.target.name]: e.target.value });
  };

  const handleGuardarConAlerta = async () => {
    try {
      await handleGuardar();
      Swal.fire('Guardado', 'Datos del cliente actualizados', 'success');
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
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
                      <FiUserCheck className="text-primary mr-2" />
                      Gestión de Clientes
                    </h3>
                    <p className="text-sm text-muted mb-0 mt-1">
                      Administra los clientes registrados en tu barbería
                    </p>
                  </Col>
                </Row>
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
                  emptyMessage={busqueda ? "No se encontraron clientes con tu búsqueda" : "Aún no tienes clientes registrados"}
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
        tipoUsuario="cliente"
        camposAdicionales={[
          { name: 'telefono', label: 'Teléfono', type: 'text', placeholder: 'Teléfono del cliente' }
        ]}
      />
    </>
  );
};

export default GestionClientes;
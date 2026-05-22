import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
} from "reactstrap";

import Swal from "sweetalert2";

import { FiPackage, FiPlus, FiEdit, FiTrash2, FiEye } from "react-icons/fi";

import UserHeader from "components/Headers/UserHeader";

import TablaProductos from "components/gestionProductos/TablaProductos";
import BarraBusquedaProductos from "components/gestionProductos/BarraBusquedaProductos";
import ModalProducto from "components/gestionProductos/ModalProducto";
import PaginacionProductos from "components/gestionProductos/PaginacionProductos";

const GestionProductos = () => {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState(false);
  const [productoEdit, setProductoEdit] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [vistaMobile, setVistaMobile] = useState(false);

  const ITEMS_POR_PAGINA = vistaMobile ? 5 : 10;

  useEffect(() => {
    const checkMobile = () => {
      setVistaMobile(window.innerWidth < 768);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleModal = () => {
    setModal(!modal);
  };

  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const totalPaginas = Math.ceil(productosFiltrados.length / ITEMS_POR_PAGINA);

  const indexInicio = (paginaActual - 1) * ITEMS_POR_PAGINA;

  const productosPaginados = productosFiltrados.slice(
    indexInicio,
    indexInicio + ITEMS_POR_PAGINA,
  );

  const handleCrear = () => {
    setProductoEdit(null);
    toggleModal();
  };

  const handleEditar = (producto) => {
    setProductoEdit(producto);
    toggleModal();
  };

  const handleEliminar = async (producto) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar producto?",
      text: producto.nombre,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });

    if (!confirm.isConfirmed) return;

    Swal.fire({
      icon: "success",
      title: "Producto eliminado",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleGuardar = async () => {
    Swal.fire({
      icon: "success",
      title: productoEdit ? "Producto actualizado" : "Producto creado",
      timer: 1500,
      showConfirmButton: false,
    });

    toggleModal();
  };

  const columnas = [
    {
      key: "producto",
      label: "Producto",
      render: (_, producto) => (
        <div className="d-flex align-items-center">
          <div className="avatar avatar-sm rounded-circle bg-gradient-primary mr-3 d-flex align-items-center justify-content-center">
            <FiPackage className="text-white" />
          </div>

          <div>
            <div className="font-weight-bold text-sm">{producto.nombre}</div>

            <small className="text-muted">
              {producto.categoria || "Sin categoría"}
            </small>
          </div>
        </div>
      ),
    },

    {
      key: "precio",
      label: "Precio",
      render: (_, producto) => (
        <span className="font-weight-bold text-success">
          ${producto.precio?.toLocaleString("es-CL")}
        </span>
      ),
    },

    {
      key: "stock",
      label: "Stock",
      render: (_, producto) => {
        if (producto.stock === null) {
          return <Badge color="info">Sin control</Badge>;
        }

        return producto.stock > 0 ? (
          <Badge color="success">{producto.stock}</Badge>
        ) : (
          <Badge color="danger">Sin stock</Badge>
        );
      },
    },

    {
      key: "activo",
      label: "Estado",
      render: (_, producto) => (
        <Badge color={producto.activo ? "success" : "secondary"}>
          {producto.activo ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
  ];

  const acciones = [
    {
      id: "ver",
      icon: <FiEye size={16} />,
      color: "info",
      className: "btn-outline-info",
    },

    {
      id: "editar",
      icon: <FiEdit size={16} />,
      color: "warning",
      className: "btn-outline-warning",
    },

    {
      id: "eliminar",
      icon: <FiTrash2 size={16} />,
      color: "danger",
      className: "btn-outline-danger",
    },
  ];

  const handleAccion = (accion, producto) => {
    switch (accion) {
      case "editar":
        handleEditar(producto);
        break;

      case "eliminar":
        handleEliminar(producto);
        break;

      default:
        break;
    }
  };

  return (
    <>
      <UserHeader />

      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col xl="11">
            <Card className="shadow bg-secondary border-0">
              <CardHeader className="bg-white border-0 py-4">
                <Row className="align-items-center">
                  <Col lg="6" xs="12" className="mb-3 mb-lg-0">
                    <div className="d-flex align-items-center">
                      <div className="icon icon-shape bg-gradient-primary text-white rounded-circle shadow mr-3">
                        <FiPackage size={20} />
                      </div>

                      <div>
                        <h3 className="mb-0">Gestión de Productos</h3>

                        <small className="text-muted">
                          Administra productos y ventas
                        </small>
                      </div>
                    </div>
                  </Col>

                  <Col lg="6" xs="12">
                    <div className="d-flex flex-column flex-md-row gap-2 justify-content-md-end">
                      <div className="flex-grow-1 mr-md-2 mb-2 mb-md-0">
                        <BarraBusquedaProductos
                          busqueda={busqueda}
                          setBusqueda={setBusqueda}
                        />
                      </div>

                      <Button
                        color="primary"
                        onClick={handleCrear}
                        className="d-flex align-items-center justify-content-center"
                      >
                        <FiPlus className="mr-2" />
                        Nuevo Producto
                      </Button>
                    </div>
                  </Col>
                </Row>
              </CardHeader>

              <CardBody>
                {productosFiltrados.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="icon icon-shape bg-gradient-secondary text-white rounded-circle shadow mx-auto mb-4">
                      <FiPackage size={28} />
                    </div>

                    <h4 className="text-muted">No hay productos registrados</h4>

                    <p className="text-muted mb-4">
                      Crea tu primer producto para comenzar.
                    </p>

                    <Button color="primary" onClick={handleCrear}>
                      <FiPlus className="mr-2" />
                      Crear Producto
                    </Button>
                  </div>
                ) : (
                  <>
                    <TablaProductos
                      productos={productosPaginados}
                      columnas={columnas}
                      acciones={acciones}
                      onAccion={handleAccion}
                    />

                    <div className="d-flex justify-content-between align-items-center mt-4 flex-column flex-md-row">
                      <small className="text-muted mb-3 mb-md-0">
                        Mostrando {productosPaginados.length} de{" "}
                        {productosFiltrados.length} productos
                      </small>

                      <PaginacionProductos
                        paginaActual={paginaActual}
                        totalPaginas={totalPaginas}
                        onPaginaChange={setPaginaActual}
                      />
                    </div>
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <ModalProducto
        isOpen={modal}
        toggle={toggleModal}
        producto={productoEdit}
        onSave={handleGuardar}
      />
    </>
  );
};

export default GestionProductos;

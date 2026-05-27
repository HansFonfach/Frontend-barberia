import React, { useEffect, useMemo, useState } from "react";

import {
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
  Input,
  Button,
  Badge,
} from "reactstrap";

import { useProducto } from "context/ProductoContext";

const ReservaProductosSection = ({
  productosSeleccionados,
  setProductosSeleccionados,
  observacionReserva,
  setObservacionReserva,
  reservaSeleccionada,
}) => {
  const { productos, listarProductos, loading } = useProducto();

  const [productoSeleccionado, setProductoSeleccionado] = useState("");

  const [cantidadProducto, setCantidadProducto] = useState(1);

  /* =========================
      LOAD PRODUCTOS
  ========================= */

  useEffect(() => {
    listarProductos();
  }, []);

  useEffect(() => {
    if (reservaSeleccionada?.productos?.length > 0) {
      const productosIniciales = reservaSeleccionada.productos.map((p) => ({
        _id: p.producto,
        nombre: p.nombre,
        precio: p.precio,
        categoria: p.categoria,
        cantidad: p.cantidad,
      }));
      setProductosSeleccionados(productosIniciales);
    } else {
      setProductosSeleccionados([]);
    }
  }, [reservaSeleccionada]);

  /* =========================
      AGREGAR PRODUCTO
  ========================= */

  const agregarProducto = () => {
    if (!productoSeleccionado) return;

    const producto = productos.find((p) => p._id === productoSeleccionado);

    if (!producto) return;

    const existe = productosSeleccionados.find((p) => p._id === producto._id);

    if (existe) {
      setProductosSeleccionados((prev) =>
        prev.map((p) =>
          p._id === producto._id
            ? {
                ...p,
                cantidad: p.cantidad + Number(cantidadProducto),
              }
            : p,
        ),
      );
    } else {
      setProductosSeleccionados((prev) => [
        ...prev,
        {
          ...producto,
          cantidad: Number(cantidadProducto),
        },
      ]);
    }

    setProductoSeleccionado("");
    setCantidadProducto(1);
  };

  /* =========================
      ELIMINAR PRODUCTO
  ========================= */

  const eliminarProducto = (_id) => {
    setProductosSeleccionados((prev) => prev.filter((p) => p._id !== _id));
  };

  /* =========================
      CAMBIAR CANTIDAD
  ========================= */

  const cambiarCantidad = (_id, cantidad) => {
    if (cantidad < 1) return;

    setProductosSeleccionados((prev) =>
      prev.map((p) =>
        p._id === _id
          ? {
              ...p,
              cantidad: Number(cantidad),
            }
          : p,
      ),
    );
  };

  /* =========================
      TOTALES
  ========================= */

  const totalProductos = useMemo(() => {
    return productosSeleccionados.reduce(
      (acc, p) => acc + p.precio * p.cantidad,
      0,
    );
  }, [productosSeleccionados]);

  const totalServicio = reservaSeleccionada?.servicio?.precio || 0;

  const totalGeneral = totalServicio + totalProductos;

  /* =========================
      RENDER
  ========================= */

  return (
    <Card className="shadow-sm mt-4 border-0">
      {/* HEADER */}
      <CardHeader className="bg-white border-0">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h5 className="mb-0">
              <i className="ni ni-shop text-primary mr-2"></i>
              Productos Vendidos
            </h5>

            <small className="text-muted">Agrega productos a la reserva</small>
          </div>

          <Badge color="primary" pill>
            {productosSeleccionados.length} productos
          </Badge>
        </div>
      </CardHeader>

      {/* BODY */}
      <CardBody>
        {/* FORM */}
        <Row className="align-items-end">
          {/* PRODUCTO */}
          <Col md="6" className="mb-2">
            <label className="form-control-label text-muted">Producto</label>

            <Input
              type="select"
              value={productoSeleccionado}
              onChange={(e) => setProductoSeleccionado(e.target.value)}
            >
              <option value="">Seleccionar producto</option>

              {productos
                .filter(
                  (producto) => producto.activo !== false && producto.stock > 0,
                )
                .map((producto) => (
                  <option key={producto._id} value={producto._id}>
                    {producto.nombre}
                    {" • $"}
                    {Number(producto.precio).toLocaleString("es-CL")}
                    {" • Stock: "}
                    {producto.stock}
                  </option>
                ))}
            </Input>
          </Col>

          {/* CANTIDAD */}
          <Col md="2" className="mb-2">
            <label className="form-control-label text-muted">Cantidad</label>

            <Input
              type="number"
              min="1"
              value={cantidadProducto}
              onChange={(e) => setCantidadProducto(e.target.value)}
            />
          </Col>

          {/* BUTTON */}
          <Col md="4" className="mb-2">
            <Button
              color="primary"
              block
              disabled={!productoSeleccionado}
              onClick={agregarProducto}
            >
              <i className="ni ni-fat-add mr-1"></i>
              Agregar Producto
            </Button>
          </Col>
        </Row>

        {/* LISTADO */}
        <div className="mt-4">
          {productosSeleccionados.length === 0 ? (
            <div className="text-center py-5 border rounded bg-light">
              <i
                className="ni ni-box-2 text-muted"
                style={{
                  fontSize: "2.5rem",
                }}
              ></i>

              <p className="text-muted mt-3 mb-0">No hay productos agregados</p>
            </div>
          ) : (
            <div
              style={{
                maxHeight: "350px",
                overflowY: "auto",
              }}
            >
              {productosSeleccionados.map((producto) => {
                const subtotal = producto.precio * producto.cantidad;

                return (
                  <div
                    key={producto._id}
                    className="border rounded p-3 mb-3 bg-white shadow-sm"
                  >
                    <div className="d-flex justify-content-between flex-wrap">
                      {/* INFO */}
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center">
                          <i className="ni ni-shop text-primary mr-2"></i>

                          <strong>{producto.nombre}</strong>
                        </div>

                        <small className="text-muted d-block mt-2">
                          Precio:
                          {" $"}
                          {Number(producto.precio).toLocaleString("es-CL")}
                        </small>

                        <div className="mt-2">
                          <small className="text-muted d-block mb-1">
                            Cantidad
                          </small>

                          <Input
                            type="number"
                            min="1"
                            style={{
                              width: "100px",
                            }}
                            value={producto.cantidad}
                            onChange={(e) =>
                              cambiarCantidad(producto._id, e.target.value)
                            }
                          />
                        </div>
                      </div>

                      {/* TOTAL */}
                      <div className="text-right d-flex flex-column justify-content-between">
                        <div>
                          <small className="text-muted d-block">Subtotal</small>

                          <h5 className="text-primary mb-0">
                            ${Number(subtotal).toLocaleString("es-CL")}
                          </h5>
                        </div>

                        <Button
                          color="danger"
                          size="sm"
                          className="mt-3"
                          onClick={() => eliminarProducto(producto._id)}
                        >
                          <i className="ni ni-fat-remove"></i>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* OBSERVACIONES */}
        <div className="mt-4">
          <label className="form-control-label">
            Observaciones de la Reserva
          </label>

          <Input
            type="textarea"
            rows="4"
            placeholder="Ejemplo: cliente pidió rebajar laterales más que de costumbre..."
            value={observacionReserva}
            onChange={(e) => setObservacionReserva(e.target.value)}
          />
        </div>

        {/* TOTALES */}
        <div className="bg-secondary rounded p-4 mt-4">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Servicio</span>

            <strong>${Number(totalServicio).toLocaleString("es-CL")}</strong>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Productos</span>

            <strong>${Number(totalProductos).toLocaleString("es-CL")}</strong>
          </div>

          <hr />

          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 font-weight-bold">Total General</h5>

            <h3 className="text-primary mb-0 font-weight-bold">
              ${Number(totalGeneral).toLocaleString("es-CL")}
            </h3>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ReservaProductosSection;

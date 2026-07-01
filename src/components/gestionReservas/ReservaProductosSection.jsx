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
  extrasSeleccionados,
  setExtrasSeleccionados,
  observacionReserva,
  setObservacionReserva,
  reservaSeleccionada,
}) => {
  const { productos, listarProductos, loading } = useProducto();

  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidadProducto, setCantidadProducto] = useState(1);
  const [nuevoExtra, setNuevoExtra] = useState({
    nombre: "",
    precio: "",
    cantidad: 1,
  });

  useEffect(() => {
    listarProductos();
  }, []);

  // cargar productos existentes
  useEffect(() => {
    if (reservaSeleccionada?.productos?.length > 0) {
      setProductosSeleccionados(
        reservaSeleccionada.productos.map((p) => ({
          _id: p.producto,
          nombre: p.nombre,
          precio: p.precio,
          categoria: p.categoria,
          cantidad: p.cantidad,
        })),
      );
    } else {
      setProductosSeleccionados([]);
    }
  }, [reservaSeleccionada]);

  // cargar extras existentes
  useEffect(() => {
    if (reservaSeleccionada?.extras?.length > 0) {
      setExtrasSeleccionados(
        reservaSeleccionada.extras.map((e) => ({
          id: Math.random().toString(36).substr(2, 9),
          nombre: e.nombre,
          precio: e.precio,
          cantidad: e.cantidad,
        })),
      );
    } else {
      setExtrasSeleccionados([]);
    }
  }, [reservaSeleccionada]);

  /* ── PRODUCTOS ── */
  const agregarProducto = () => {
    if (!productoSeleccionado) return;
    const producto = productos.find((p) => p._id === productoSeleccionado);
    if (!producto) return;

    const existe = productosSeleccionados.find((p) => p._id === producto._id);
    if (existe) {
      setProductosSeleccionados((prev) =>
        prev.map((p) =>
          p._id === producto._id
            ? { ...p, cantidad: p.cantidad + Number(cantidadProducto) }
            : p,
        ),
      );
    } else {
      setProductosSeleccionados((prev) => [
        ...prev,
        { ...producto, cantidad: Number(cantidadProducto) },
      ]);
    }
    setProductoSeleccionado("");
    setCantidadProducto(1);
  };

  const eliminarProducto = (_id) => {
    setProductosSeleccionados((prev) => prev.filter((p) => p._id !== _id));
  };

  const cambiarCantidad = (_id, cantidad) => {
    if (cantidad < 1) return;
    setProductosSeleccionados((prev) =>
      prev.map((p) =>
        p._id === _id ? { ...p, cantidad: Number(cantidad) } : p,
      ),
    );
  };

  /* ── EXTRAS ── */
  const agregarExtra = () => {
    if (!nuevoExtra.nombre || !nuevoExtra.precio) return;
    setExtrasSeleccionados((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        nombre: nuevoExtra.nombre,
        precio: Number(nuevoExtra.precio),
        cantidad: Number(nuevoExtra.cantidad) || 1,
      },
    ]);
    setNuevoExtra({ nombre: "", precio: "", cantidad: 1 });
  };

  const eliminarExtra = (id) => {
    setExtrasSeleccionados((prev) => prev.filter((e) => e.id !== id));
  };

  /* ── TOTALES ── */
  const totalProductos = useMemo(
    () =>
      productosSeleccionados.reduce((acc, p) => acc + p.precio * p.cantidad, 0),
    [productosSeleccionados],
  );

  const totalExtras = useMemo(
    () =>
      extrasSeleccionados.reduce((acc, e) => acc + e.precio * e.cantidad, 0),
    [extrasSeleccionados],
  );

  const totalServicio =
    reservaSeleccionada?.servicioSnapshot?.precio ||
    reservaSeleccionada?.servicio?.precio ||
    0;

  const totalGeneral = totalServicio + totalProductos + totalExtras;

  return (
    <Card className="shadow-sm mt-4 border-0">
      {/* HEADER */}
      <CardHeader className="bg-white border-0">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h5 className="mb-0">
              <i className="ni ni-shop text-primary mr-2"></i>
              Productos y Extras
            </h5>
            <small className="text-muted">
              Agrega productos y servicios adicionales
            </small>
          </div>
          <Badge color="primary" pill>
            {productosSeleccionados.length} productos
          </Badge>
        </div>
      </CardHeader>

      <CardBody>
        {/* ── SECCIÓN PRODUCTOS ── */}
        <Row className="align-items-end">
          <Col md="6" className="mb-2">
            <label className="form-control-label text-muted">Producto</label>
            <Input
              type="select"
              value={productoSeleccionado}
              onChange={(e) => setProductoSeleccionado(e.target.value)}
            >
              <option value="">Seleccionar producto</option>
              {productos
                .filter((p) => p.activo !== false && p.stock > 0)
                .map((producto) => (
                  <option key={producto._id} value={producto._id}>
                    {producto.nombre} • $
                    {Number(producto.precio).toLocaleString("es-CL")} • Stock:{" "}
                    {producto.stock}
                  </option>
                ))}
            </Input>
          </Col>

          <Col md="2" className="mb-2">
            <label className="form-control-label text-muted">Cantidad</label>
            <Input
              type="number"
              min="1"
              value={cantidadProducto}
              onChange={(e) => setCantidadProducto(e.target.value)}
            />
          </Col>

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

        {/* LISTADO PRODUCTOS */}
        <div className="mt-4">
          {productosSeleccionados.length === 0 ? (
            <div className="text-center py-5 border rounded bg-light">
              <i
                className="ni ni-box-2 text-muted"
                style={{ fontSize: "2.5rem" }}
              ></i>
              <p className="text-muted mt-3 mb-0">No hay productos agregados</p>
            </div>
          ) : (
            <div style={{ maxHeight: "350px", overflowY: "auto" }}>
              {productosSeleccionados.map((producto) => {
                const subtotal = producto.precio * producto.cantidad;
                return (
                  <div
                    key={producto._id}
                    className="border rounded p-3 mb-3 bg-white shadow-sm"
                  >
                    <div className="d-flex justify-content-between flex-wrap">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center">
                          <i className="ni ni-shop text-primary mr-2"></i>
                          <strong>{producto.nombre}</strong>
                        </div>
                        <small className="text-muted d-block mt-2">
                          Precio: $
                          {Number(producto.precio).toLocaleString("es-CL")}
                        </small>
                        <div className="mt-2">
                          <small className="text-muted d-block mb-1">
                            Cantidad
                          </small>
                          <Input
                            type="number"
                            min="1"
                            style={{ width: "100px" }}
                            value={producto.cantidad}
                            onChange={(e) =>
                              cambiarCantidad(producto._id, e.target.value)
                            }
                          />
                        </div>
                      </div>
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

        {/* ── SECCIÓN EXTRAS ── */}
        <hr className="mt-4" />
        <h6 className="text-muted mt-4 mb-3">
          <i className="ni ni-tag text-warning mr-2"></i>
          Servicios Adicionales / Extras
        </h6>

        <Row className="align-items-end">
          <Col md="5" className="mb-2">
            <label className="form-control-label text-muted">Descripción</label>
            <Input
              type="text"
              placeholder="Ej: Diseño de uñas, Degradado..."
              value={nuevoExtra.nombre}
              onChange={(e) =>
                setNuevoExtra((prev) => ({ ...prev, nombre: e.target.value }))
              }
            />
          </Col>

          <Col md="3" className="mb-2">
            <label className="form-control-label text-muted">Precio</label>
            <Input
              type="number"
              min="0"
              placeholder="$0"
              value={nuevoExtra.precio}
              onChange={(e) =>
                setNuevoExtra((prev) => ({ ...prev, precio: e.target.value }))
              }
            />
          </Col>

          <Col md="4" className="mb-2">
            <Button
              color="warning"
              block
              disabled={!nuevoExtra.nombre || !nuevoExtra.precio}
              onClick={agregarExtra}
            >
              <i className="ni ni-fat-add mr-1"></i>
              Agregar Extra
            </Button>
          </Col>
        </Row>

        {extrasSeleccionados.length > 0 && (
          <div className="mt-3">
            {extrasSeleccionados.map((extra) => (
              <div
                key={extra.id}
                className="border rounded p-3 mb-2 bg-white shadow-sm"
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <i className="ni ni-tag text-warning mr-2"></i>
                    <strong>{extra.nombre}</strong>
                    <small className="text-muted ml-2">
                      ${Number(extra.precio).toLocaleString("es-CL")}
                    </small>
                  </div>
                  <div className="d-flex align-items-center">
                    <h5 className="text-warning mb-0 mr-3">
                      $
                      {Number(extra.precio * extra.cantidad).toLocaleString(
                        "es-CL",
                      )}
                    </h5>
                    <Button
                      color="danger"
                      size="sm"
                      onClick={() => eliminarExtra(extra.id)}
                    >
                      <i className="ni ni-fat-remove"></i>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── OBSERVACIONES ── */}
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

        {/* ── TOTALES ── */}
        <div className="bg-secondary rounded p-4 mt-4">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Servicio</span>
            <strong>${Number(totalServicio).toLocaleString("es-CL")}</strong>
          </div>

          {totalExtras > 0 && (
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Extras</span>
              <strong>${Number(totalExtras).toLocaleString("es-CL")}</strong>
            </div>
          )}

          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Productos</span>
            <strong>${Number(totalProductos).toLocaleString("es-CL")}</strong>
          </div>

          <hr />

          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0 font-weight-bold">Total General</h5>
            <h3 className="text-primary mb-0 font-weight-bold">
              ${Number(totalGeneral).toLocaleString("es-CL")}
            </h3>
          </div>

          {reservaSeleccionada?.abono?.estado === "pagado" && (
            <>
              <hr />

              <div className="d-flex justify-content-between mb-2">
                <span className="text-success">
                  <i className="ni ni-check-bold mr-1"></i>
                  Abonado
                </span>
                <strong className="text-success">
                  $
                  {Number(reservaSeleccionada.abono.monto || 0).toLocaleString(
                    "es-CL",
                  )}
                </strong>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">Pendiente</span>
                <h4 className="mb-0 font-weight-bold">
                  $
                  {Number(
                    totalGeneral - (reservaSeleccionada.abono.monto || 0) > 0
                      ? totalGeneral - (reservaSeleccionada.abono.monto || 0)
                      : 0,
                  ).toLocaleString("es-CL")}
                </h4>
              </div>
            </>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default ReservaProductosSection;

import { useEffect, useState } from "react";
import {
  Badge, Button, Card, CardBody, CardHeader,
  Col, Container, Form, FormGroup, Input, Label,
  Modal, ModalBody, ModalFooter, ModalHeader,
  Row, Spinner, Table,
} from "reactstrap";
import { useVentaDirecta } from "context/VentaDirectaContext";
import { useProducto } from "context/ProductoContext";
import Swal from "sweetalert2";
import UserHeader from "components/Headers/UserHeader";

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatPeso = (n) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(n ?? 0);

const formatFecha = (d) =>
  new Date(d).toLocaleDateString("es-CL", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const METODOS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "debito", label: "Débito" },
  { value: "credito", label: "Crédito" },
  { value: "otro", label: "Otro" },
];

// ─── Componente principal ────────────────────────────────────────────────────

const VentasDirectas = () => {
  const { ventas, loading, crearVenta, anularVenta, listarVentas } = useVentaDirecta();
  const { productos, listarProductos } = useProducto();

  const [modalVenta, setModalVenta]     = useState(false);
  const [modalAnular, setModalAnular]   = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [motivoAnulacion, setMotivoAnulacion]     = useState("");

  // Form nueva venta
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad]     = useState(1);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [observacion, setObservacion] = useState("");

  useEffect(() => {
    listarVentas();
    listarProductos();
  }, []);

  // ── Agregar producto al carrito ──
  const agregarProducto = () => {
    if (!productoId) return;
    const prod = productos.find((p) => p._id === productoId);
    if (!prod) return;

    const existe = productosSeleccionados.find((p) => p.producto === productoId);
    if (existe) {
      setProductosSeleccionados((prev) =>
        prev.map((p) =>
          p.producto === productoId
            ? { ...p, cantidad: p.cantidad + Number(cantidad) }
            : p
        )
      );
    } else {
      setProductosSeleccionados((prev) => [
        ...prev,
        { producto: prod._id, nombre: prod.nombre, precio: prod.precio, cantidad: Number(cantidad) },
      ]);
    }
    setProductoId("");
    setCantidad(1);
  };

  const quitarProducto = (id) =>
    setProductosSeleccionados((prev) => prev.filter((p) => p.producto !== id));

  const totalVenta = productosSeleccionados.reduce(
    (acc, p) => acc + p.precio * p.cantidad, 0
  );

  const limpiarForm = () => {
    setProductosSeleccionados([]);
    setProductoId("");
    setCantidad(1);
    setMetodoPago("efectivo");
    setObservacion("");
  };

  // ── Registrar venta ──
  const handleCrearVenta = async () => {
    if (productosSeleccionados.length === 0) {
      Swal.fire("Atención", "Agrega al menos un producto al carrito.", "warning");
      return;
    }
    try {
      await crearVenta({
        productos: productosSeleccionados.map((p) => ({
          producto: p.producto,
          cantidad: p.cantidad,
        })),
        metodoPago,
        observacion,
      });
      Swal.fire({ icon: "success", title: "¡Venta registrada!", timer: 1500, showConfirmButton: false });
      setModalVenta(false);
      limpiarForm();
    } catch (error) {
      Swal.fire("Error", error?.response?.data?.message || "No se pudo registrar la venta.", "error");
    }
  };

  // ── Anular venta ──
  const handleAnular = async () => {
    try {
      await anularVenta(ventaSeleccionada._id, motivoAnulacion);
      Swal.fire({ icon: "success", title: "Venta anulada", text: "Stock restaurado.", timer: 1500, showConfirmButton: false });
      setModalAnular(false);
      setMotivoAnulacion("");
      setVentaSeleccionada(null);
    } catch (error) {
      Swal.fire("Error", error?.response?.data?.message || "No se pudo anular la venta.", "error");
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      <UserHeader />

      <Container className="mt--7" fluid>
        <Row>
          <Col>
            <Card className="shadow">
              <CardHeader className="border-0 d-flex align-items-center justify-content-between flex-wrap gap-2">
                <h3 className="mb-0">Historial de ventas directas</h3>
                <Button color="primary" size="sm" onClick={() => setModalVenta(true)}>
                  <i className="ni ni-bag-17 mr-2" />
                  Nueva venta
                </Button>
              </CardHeader>

              <CardBody className="p-0">
                {ventas.length === 0 && !loading ? (
                  <div className="text-center py-5 text-muted">
                    <i className="ni ni-bag-17 fa-2x mb-3 d-block" />
                    <p>Aún no hay ventas registradas.</p>
                    <Button color="primary" size="sm" onClick={() => setModalVenta(true)}>
                      Nueva venta
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Versión Desktop (oculta en mobile) */}
                    <div className="d-none d-md-block">
                      <Table className="align-items-center table-flush" responsive>
                        <thead className="thead-light">
                          <tr>
                            <th>Fecha</th>
                            <th>Productos</th>
                            <th>Método de pago</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th />
                          </tr>
                        </thead>
                        <tbody>
                          {loading ? (
                            <tr>
                              <td colSpan={6} className="text-center py-4">
                                <Spinner size="sm" color="primary" />
                              </td>
                            </tr>
                          ) : (
                            ventas.map((v) => (
                              <tr key={v._id}>
                                <td className="text-nowrap">{formatFecha(v.fecha)}</td>
                                <td>
                                  {v.productos.map((p) => (
                                    <div key={p._id} className="text-sm">
                                      {p.nombre}{" "}
                                      <span className="text-muted">x{p.cantidad}</span>
                                    </div>
                                  ))}
                                </td>
                                <td className="text-capitalize">{v.metodoPago}</td>
                                <td className="font-weight-bold">{formatPeso(v.totalFinal)}</td>
                                <td>
                                  {v.anulada
                                    ? <Badge color="danger">Anulada</Badge>
                                    : <Badge color="success">Completada</Badge>
                                  }
                                </td>
                                <td className="text-right">
                                  {!v.anulada && (
                                    <Button
                                      size="sm" color="danger" outline
                                      onClick={() => { setVentaSeleccionada(v); setModalAnular(true); }}
                                    >
                                      Anular
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </Table>
                    </div>

                    {/* Versión Mobile (solo fecha, productos, total, anular) */}
                    <div className="d-block d-md-none">
                      {loading ? (
                        <div className="text-center py-4">
                          <Spinner size="sm" color="primary" />
                        </div>
                      ) : (
                        ventas.map((v) => (
                          <div key={v._id} className="border-bottom p-3">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <small className="text-muted">{formatFecha(v.fecha)}</small>
                                <div className="mt-1">
                                  {v.productos.map((p) => (
                                    <div key={p._id} className="text-sm">
                                      <span className="font-weight-bold">{p.nombre}</span>{" "}
                                      <span className="text-muted">x{p.cantidad}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-weight-bold">{formatPeso(v.totalFinal)}</div>
                                <div className="mt-1">
                                  {v.anulada
                                    ? <Badge color="danger">Anulada</Badge>
                                    : !v.anulada && (
                                        <Button
                                          size="sm" color="danger" outline
                                          onClick={() => { setVentaSeleccionada(v); setModalAnular(true); }}
                                        >
                                          Anular
                                        </Button>
                                      )
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* ── Modal: Nueva venta ── */}
      <Modal isOpen={modalVenta} toggle={() => { setModalVenta(false); limpiarForm(); }} size="lg">
        <ModalHeader toggle={() => { setModalVenta(false); limpiarForm(); }}>
          Registrar venta directa
        </ModalHeader>
        <ModalBody>
          <Form>
            {/* Selector de producto */}
            <Row>
              <Col xs={12} sm={6}>
                <FormGroup>
                  <Label>Producto</Label>
                  <Input type="select" value={productoId} onChange={(e) => setProductoId(e.target.value)}>
                    <option value="">Selecciona un producto...</option>
                    {productos.filter((p) => p.activo).map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.nombre} — {formatPeso(p.precio)}
                        {p.stock !== null ? ` (stock: ${p.stock})` : ""}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
              <Col xs={6} sm={3}>
                <FormGroup>
                  <Label>Cantidad</Label>
                  <Input
                    type="number" min={1} value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                  />
                </FormGroup>
              </Col>
              <Col xs={6} sm={3} className="d-flex align-items-end">
                <FormGroup className="w-100">
                  <Button color="primary" outline block onClick={agregarProducto} disabled={!productoId}>
                    <i className="ni ni-fat-add mr-1" /> Agregar
                  </Button>
                </FormGroup>
              </Col>
            </Row>

            {/* Carrito */}
            {productosSeleccionados.length > 0 && (
              <Card className="bg-secondary mb-3">
                <CardBody className="p-3">
                  {productosSeleccionados.map((p) => (
                    <div key={p.producto} className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                      <div className="flex-grow-1">
                        <span className="font-weight-bold">{p.nombre}</span>
                        <span className="text-muted d-block d-sm-inline ml-sm-2">
                          x{p.cantidad} = {formatPeso(p.precio * p.cantidad)}
                        </span>
                      </div>
                      <Button size="sm" color="danger" outline onClick={() => quitarProducto(p.producto)}>
                        <i className="ni ni-fat-remove" />
                      </Button>
                    </div>
                  ))}
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between font-weight-bold">
                    <span>Total</span>
                    <span>{formatPeso(totalVenta)}</span>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Método de pago y observación */}
            <Row>
              <Col xs={12} md={6}>
                <FormGroup>
                  <Label>Método de pago</Label>
                  <Input type="select" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                    {METODOS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </Input>
                </FormGroup>
              </Col>
              <Col xs={12} md={6}>
                <FormGroup>
                  <Label>Observación (opcional)</Label>
                  <Input
                    type="textarea" rows={2} value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                    placeholder="Ej: cliente frecuente, descuento acordado..."
                  />
                </FormGroup>
              </Col>
            </Row>
          </Form>
        </ModalBody>
        <ModalFooter className="flex-wrap gap-2">
          <Button color="secondary" onClick={() => { setModalVenta(false); limpiarForm(); }}>
            Cancelar
          </Button>
          <Button
            color="primary"
            onClick={handleCrearVenta}
            disabled={loading || productosSeleccionados.length === 0}
          >
            {loading ? <Spinner size="sm" /> : "Registrar venta"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── Modal: Anular venta ── */}
      <Modal isOpen={modalAnular} toggle={() => setModalAnular(false)}>
        <ModalHeader toggle={() => setModalAnular(false)}>Anular venta</ModalHeader>
        <ModalBody>
          <p className="text-muted mb-3">
            ¿Seguro que quieres anular esta venta? El stock de los productos será restaurado.
          </p>
          <FormGroup>
            <Label>Motivo de anulación (opcional)</Label>
            <Input
              type="textarea" rows={3} value={motivoAnulacion}
              onChange={(e) => setMotivoAnulacion(e.target.value)}
              placeholder="Ej: error de registro, cliente devolvió el producto..."
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter className="flex-wrap gap-2">
          <Button color="secondary" onClick={() => setModalAnular(false)}>Cancelar</Button>
          <Button color="danger" onClick={handleAnular} disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Sí, anular"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default VentasDirectas;
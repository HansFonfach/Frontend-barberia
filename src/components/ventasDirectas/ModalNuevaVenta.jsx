import { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  Card,
  CardBody,
} from "reactstrap";
import Swal from "sweetalert2";
import { axiosPrivate } from "api/axiosPrivate";
import { useVentaDirecta } from "context/VentaDirectaContext";
import { useProducto } from "context/ProductoContext";
import { FiSearch, FiUserCheck, FiX } from "react-icons/fi";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatPeso = (n) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(
    n ?? 0,
  );

const hoy = () => new Date().toISOString().slice(0, 10);

const METODOS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "debito", label: "Débito" },
  { value: "credito", label: "Crédito" },
  { value: "otro", label: "Otro" },
];

// ─── Componente ───────────────────────────────────────────────────────────────

const ModalNuevaVenta = ({ isOpen, toggle, onVentaCreada }) => {
  const { crearVenta, loading } = useVentaDirecta();
  const { productos } = useProducto();

  // Cliente
  const [buscarCliente, setBuscarCliente] = useState(false);
  const [rut, setRut] = useState("");
  const [buscandoRut, setBuscandoRut] = useState(false);
  const [cliente, setCliente] = useState(null);
  const [errorRut, setErrorRut] = useState("");

  // Productos
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState(1);

  // Venta
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [observacion, setObservacion] = useState("");
  const [fecha, setFecha] = useState(hoy());

  // ── Buscar cliente por RUT ──
  const handleBuscarRut = async () => {
    if (!rut.trim()) return;
    setBuscandoRut(true);
    setErrorRut("");
    setCliente(null);
    try {
      const res = await axiosPrivate.get(`/usuarios/rut/${rut.trim()}`);
      if (res.data.success) {
        setCliente(res.data);
      }
    } catch (err) {
      setErrorRut(
        err?.response?.status === 404
          ? "No se encontró ningún cliente con ese RUT."
          : "Error al buscar el cliente.",
      );
    } finally {
      setBuscandoRut(false);
    }
  };

  const limpiarCliente = () => {
    setCliente(null);
    setRut("");
    setErrorRut("");
  };

  // ── Carrito ──
  const agregarProducto = () => {
    if (!productoId) return;
    const prod = productos.find((p) => p._id === productoId);
    if (!prod) return;

    const existe = productosSeleccionados.find(
      (p) => p.producto === productoId,
    );
    if (existe) {
      setProductosSeleccionados((prev) =>
        prev.map((p) =>
          p.producto === productoId
            ? { ...p, cantidad: p.cantidad + Number(cantidad) }
            : p,
        ),
      );
    } else {
      setProductosSeleccionados((prev) => [
        ...prev,
        {
          producto: prod._id,
          nombre: prod.nombre,
          precio: prod.precio,
          cantidad: Number(cantidad),
        },
      ]);
    }
    setProductoId("");
    setCantidad(1);
  };

  const quitarProducto = (id) =>
    setProductosSeleccionados((prev) => prev.filter((p) => p.producto !== id));

  const total = productosSeleccionados.reduce(
    (acc, p) => acc + p.precio * p.cantidad,
    0,
  );

  // ── Limpiar y cerrar ──
  const handleClose = () => {
    setProductosSeleccionados([]);
    setProductoId("");
    setCantidad(1);
    setMetodoPago("efectivo");
    setObservacion("");
    setFecha(hoy());
    limpiarCliente();
    setBuscarCliente(false);
    toggle();
  };

  // ── Registrar ──
  const handleSubmit = async () => {
    if (productosSeleccionados.length === 0) {
      Swal.fire(
        "Atención",
        "Agrega al menos un producto al carrito.",
        "warning",
      );
      return;
    }

    const fechaFinal = fecha
      ? `${fecha}T${new Date().toLocaleString("sv", { timeZone: "America/Santiago" }).slice(11)}`
      : new Date().toISOString();

    try {
      await crearVenta({
        productos: productosSeleccionados.map((p) => ({
          producto: p.producto,
          cantidad: p.cantidad,
        })),
        metodoPago,
        observacion,
        fecha: fechaFinal,
        ...(cliente ? { clienteId: cliente._id } : {}),
      });
      Swal.fire({
        icon: "success",
        title: "¡Venta registrada!",
        timer: 1500,
        showConfirmButton: false,
      });
      onVentaCreada?.();
      handleClose();
    } catch (error) {
      Swal.fire(
        "Error",
        error?.response?.data?.message || "No se pudo registrar la venta.",
        "error",
      );
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose} size="lg">
      <ModalHeader toggle={handleClose}>Registrar venta directa</ModalHeader>

      <ModalBody>
        {/* ── Fecha ── */}
        <Row className="mb-3">
          <Col md={4}>
            <FormGroup className="mb-0">
              <Label className="form-control-label">Fecha de la venta</Label>
              <Input
                type="date"
                value={fecha}
                max={hoy()}
                onChange={(e) => setFecha(e.target.value)}
              />
            </FormGroup>
          </Col>
        </Row>

        {/* ── Cliente (opcional) ── */}
        <div
          className="p-3 mb-3 rounded"
          style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}
        >
          <div className="d-flex align-items-center justify-content-between mb-2">
            <Label className="form-control-label mb-0">
              Cliente{" "}
              <span className="text-muted font-weight-normal">(opcional)</span>
            </Label>
            <div className="custom-control custom-switch">
              <input
                type="checkbox"
                className="custom-control-input"
                id="switchCliente"
                checked={buscarCliente}
                onChange={(e) => {
                  setBuscarCliente(e.target.checked);
                  if (!e.target.checked) limpiarCliente();
                }}
              />
              <label className="custom-control-label" htmlFor="switchCliente">
                Es cliente registrado
              </label>
            </div>
          </div>

          {buscarCliente && (
            <>
              {/* Buscador RUT */}
              {!cliente && (
                <Row>
                  <Col md={7}>
                    <FormGroup className="mb-0">
                      <div className="input-group">
                        <Input
                          placeholder="Ingresa el RUT del cliente"
                          value={rut}
                          onChange={(e) => setRut(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleBuscarRut()
                          }
                          invalid={!!errorRut}
                        />
                        <div className="input-group-append">
                          <Button
                            color="primary"
                            onClick={handleBuscarRut}
                            disabled={buscandoRut || !rut.trim()}
                          >
                            {buscandoRut ? (
                              <Spinner size="sm" />
                            ) : (
                              <FiSearch size={14} />
                            )}
                          </Button>
                        </div>
                      </div>
                      {errorRut && (
                        <small className="text-danger mt-1 d-block">
                          {errorRut}
                        </small>
                      )}
                    </FormGroup>
                  </Col>
                </Row>
              )}

              {/* Cliente encontrado */}
              {cliente && (
                <div
                  className="d-flex align-items-center justify-content-between p-2 rounded"
                  style={{ background: "#e8f5e9", border: "1px solid #c8e6c9" }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <FiUserCheck size={18} color="#2e7d32" className="mr-2" />
                    <div>
                      <span className="font-weight-bold text-sm">
                        {cliente.nombre} {cliente.apellido}
                      </span>
                      <span className="text-muted text-sm ml-2">
                        · {cliente.rut}
                      </span>
                      <span className="text-muted text-sm ml-2">
                        · {cliente.email}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    color="link"
                    className="p-0 text-muted"
                    onClick={limpiarCliente}
                  >
                    <FiX size={16} />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Selector de producto ── */}
        <Row className="align-items-end mb-1">
          <Col md={6}>
            <FormGroup className="mb-0">
              <Label className="form-control-label">Producto</Label>
              <Input
                type="select"
                value={productoId}
                onChange={(e) => setProductoId(e.target.value)}
              >
                <option value="">Selecciona un producto...</option>
                {productos
                  .filter((p) => p.activo)
                  .map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.nombre} — {formatPeso(p.precio)}
                      {p.stock !== null ? ` (stock: ${p.stock})` : ""}
                    </option>
                  ))}
              </Input>
            </FormGroup>
          </Col>
          <Col md={3}>
            <FormGroup className="mb-0">
              <Label className="form-control-label">Cantidad</Label>
              <Input
                type="number"
                min={1}
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
              />
            </FormGroup>
          </Col>
          <Col md={3}>
            <Button
              color="primary"
              outline
              block
              onClick={agregarProducto}
              disabled={!productoId}
            >
              <i className="ni ni-fat-add mr-1" /> Agregar
            </Button>
          </Col>
        </Row>

        {/* ── Carrito ── */}
        {productosSeleccionados.length > 0 && (
          <Card className="bg-secondary mt-3 mb-3">
            <CardBody className="p-3">
              {productosSeleccionados.map((p) => (
                <div
                  key={p.producto}
                  className="d-flex justify-content-between align-items-center mb-2"
                >
                  <div>
                    <span className="font-weight-bold">{p.nombre}</span>
                    <span className="text-muted ml-2 text-sm">
                      x{p.cantidad} = {formatPeso(p.precio * p.cantidad)}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    color="danger"
                    outline
                    onClick={() => quitarProducto(p.producto)}
                  >
                    <i className="ni ni-fat-remove" />
                  </Button>
                </div>
              ))}
              <hr className="my-2" />
              <div className="d-flex justify-content-between font-weight-bold">
                <span>Total</span>
                <span>{formatPeso(total)}</span>
              </div>
            </CardBody>
          </Card>
        )}

        {/* ── Método de pago y observación ── */}
        <Row>
          <Col md={6}>
            <FormGroup>
              <Label className="form-control-label">Método de pago</Label>
              <Input
                type="select"
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
              >
                {METODOS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </Input>
            </FormGroup>
          </Col>
          <Col md={6}>
            <FormGroup>
              <Label className="form-control-label">
                Observación (opcional)
              </Label>
              <Input
                type="textarea"
                rows={2}
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Ej: cliente frecuente, descuento acordado..."
              />
            </FormGroup>
          </Col>
        </Row>
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button
          color="primary"
          onClick={handleSubmit}
          disabled={loading || productosSeleccionados.length === 0}
        >
          {loading ? <Spinner size="sm" /> : "Registrar venta"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalNuevaVenta;

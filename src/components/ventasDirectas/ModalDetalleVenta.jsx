import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  Button, Badge, Row, Col,
} from "reactstrap";

const formatPeso = (n) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(n ?? 0);

const formatFecha = (d) =>
  new Date(d).toLocaleDateString("es-CL", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "America/Santiago",
  });

const Fila = ({ label, value }) => (
  <div className="d-flex justify-content-between align-items-start py-2"
    style={{ borderBottom: "1px solid #f5f5f5" }}>
    <span className="text-muted text-sm">{label}</span>
    <span className="font-weight-bold text-sm text-right">{value}</span>
  </div>
);

const ModalDetalleVenta = ({ isOpen, toggle, venta, onAnular }) => {
  if (!venta) return null;

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Detalle de venta</ModalHeader>

      <ModalBody>
        {/* Estado */}
        <div className="text-center mb-4">
          {venta.anulada
            ? <Badge color="danger" pill style={{ fontSize: 13, padding: "6px 16px" }}>Anulada</Badge>
            : <Badge color="success" pill style={{ fontSize: 13, padding: "6px 16px" }}>Completada</Badge>
          }
          {venta.anulada && venta.motivoAnulacion && (
            <p className="text-muted text-sm mt-2 mb-0">"{venta.motivoAnulacion}"</p>
          )}
        </div>

        {/* Info general */}
        <div className="mb-4 px-1">
          <Fila label="Fecha de venta"  value={formatFecha(venta.fecha)} />
          <Fila label="Método de pago"  value={<span className="text-capitalize">{venta.metodoPago}</span>} />
          <Fila label="Vendedor"        value={venta.vendedor?.nombre || "—"} />
          {venta.cliente && (
            <>
              <Fila label="Cliente"     value={`${venta.cliente.nombre} ${venta.cliente.apellido || ""}`} />
              <Fila label="RUT"         value={venta.cliente.rut || "—"} />
            </>
          )}
          {venta.observacion && (
            <Fila label="Observación"   value={venta.observacion} />
          )}
        </div>

        {/* Productos */}
        <h6 className="text-uppercase text-muted text-sm font-weight-bold mb-2">Productos</h6>
        <div
          className="rounded p-3 mb-3"
          style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}
        >
          {venta.productos.map((p) => (
            <div key={p._id}
              className="d-flex justify-content-between align-items-center mb-2"
            >
              <div>
                <span className="font-weight-bold text-sm">{p.nombre}</span>
                {p.categoria && (
                  <span className="text-muted text-sm ml-2">· {p.categoria}</span>
                )}
              </div>
              <div className="text-right">
                <span className="text-muted text-sm">x{p.cantidad}</span>
                <span className="font-weight-bold text-sm ml-2">{formatPeso(p.subtotal)}</span>
              </div>
            </div>
          ))}
          <hr className="my-2" />
          <div className="d-flex justify-content-between font-weight-bold">
            <span>Total</span>
            <span style={{ fontSize: 16 }}>{formatPeso(venta.totalFinal)}</span>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" onClick={toggle}>Cerrar</Button>
        {!venta.anulada && (
          <Button color="danger" outline onClick={() => { toggle(); onAnular?.(venta); }}>
            Anular venta
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default ModalDetalleVenta;
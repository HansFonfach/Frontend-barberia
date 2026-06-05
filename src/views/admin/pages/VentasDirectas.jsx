import { useEffect, useState } from "react";
import {
  Badge, Button, Card, CardBody, CardHeader,
  Col, Container, Input, InputGroup, InputGroupText,
  Row, Spinner, Table,
} from "reactstrap";
import { useVentaDirecta } from "context/VentaDirectaContext";
import { useProducto } from "context/ProductoContext";
import UserHeader from "components/Headers/UserHeader";
import ModalNuevaVenta   from "components/ventasDirectas/ModalNuevaVenta";
import ModalDetalleVenta from "components/ventasDirectas/ModalDetalleVenta";
import ModalAnularVenta  from "components/ventasDirectas/ModalAnularVenta";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatPeso = (n) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(n ?? 0);

const formatFecha = (d) =>
  new Date(d).toLocaleDateString("es-CL", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "America/Santiago",
  });

const hoy = () => new Date().toISOString().slice(0, 10);

// ─── Componente ───────────────────────────────────────────────────────────────

const VentasDirectas = () => {
  const { ventas, loading, listarVentas } = useVentaDirecta();
  const { listarProductos } = useProducto();

  const [modalNueva,   setModalNueva]   = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalAnular,  setModalAnular]  = useState(false);
  const [ventaActiva,  setVentaActiva]  = useState(null);

  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");

  useEffect(() => {
    listarVentas();
    listarProductos();
  }, []);

  const handleBuscar = () => {
    listarVentas({
      ...(filtroDesde && { desde: filtroDesde }),
      ...(filtroHasta && { hasta: filtroHasta }),
    });
  };

  const handleLimpiar = () => {
    setFiltroDesde("");
    setFiltroHasta("");
    listarVentas();
  };

  const abrirDetalle = (venta) => {
    setVentaActiva(venta);
    setModalDetalle(true);
  };

  const abrirAnular = (venta) => {
    setVentaActiva(venta);
    setModalAnular(true);
  };

  // Stats rápidas
  const ventasActivas = ventas.filter((v) => !v.anulada);
  const totalIngresos = ventasActivas.reduce((acc, v) => acc + v.totalFinal, 0);

  return (
    <>
      <UserHeader />

      <Container className="mt--7" fluid>
        <Row>
          <Col>
            <Card className="shadow">

              {/* ── Header ── */}
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <Col>
                    <h3 className="mb-0">Ventas directas</h3>
                  </Col>
                  <Col className="text-right">
                    <Button color="primary" size="sm" onClick={() => setModalNueva(true)}>
                      <i className="ni ni-bag-17 mr-2" />
                      Nueva venta
                    </Button>
                  </Col>
                </Row>

                {/* Stats */}
                <Row className="mt-3">
                  {[
                    { label: "Total ventas",  value: ventas.length },
                    { label: "Completadas",   value: ventasActivas.length },
                    { label: "Anuladas",      value: ventas.filter((v) => v.anulada).length },
                    { label: "Ingresos",      value: formatPeso(totalIngresos) },
                  ].map((s) => (
                    <Col key={s.label} xs={6} md={3} className="mb-2 mb-md-0">
                      <div
                        className="rounded p-3"
                        style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}
                      >
                        <p className="text-muted text-xs mb-1 text-uppercase font-weight-bold">
                          {s.label}
                        </p>
                        <p className="mb-0 font-weight-bold h4">{s.value}</p>
                      </div>
                    </Col>
                  ))}
                </Row>

                {/* Filtros */}
                <Row className="mt-3 align-items-end">
                  <Col xs={12} md={4} className="mb-2 mb-md-0">
                    <small className="text-muted font-weight-bold d-block mb-1">DESDE</small>
                    <Input
                      type="date" bsSize="sm"
                      value={filtroDesde} max={filtroHasta || hoy()}
                      onChange={(e) => setFiltroDesde(e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={4} className="mb-2 mb-md-0">
                    <small className="text-muted font-weight-bold d-block mb-1">HASTA</small>
                    <Input
                      type="date" bsSize="sm"
                      value={filtroHasta} min={filtroDesde} max={hoy()}
                      onChange={(e) => setFiltroHasta(e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={4}>
                    <div className="d-flex gap-2" style={{ gap: 8 }}>
                      <Button color="primary" size="sm" onClick={handleBuscar} disabled={!filtroDesde && !filtroHasta}>
                        <i className="ni ni-zoom-split-in mr-1" /> Buscar
                      </Button>
                      {(filtroDesde || filtroHasta) && (
                        <Button color="secondary" size="sm" onClick={handleLimpiar}>
                          Limpiar
                        </Button>
                      )}
                    </div>
                  </Col>
                </Row>
              </CardHeader>

              {/* ── Tabla ── */}
              <CardBody className="p-0">
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                  </div>
                ) : ventas.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="ni ni-bag-17 fa-2x mb-3 d-block" />
                    <p className="mb-3">No hay ventas registradas.</p>
                    <Button color="primary" size="sm" onClick={() => setModalNueva(true)}>
                      Nueva venta
                    </Button>
                  </div>
                ) : (
                  <Table className="align-items-center table-flush" responsive>
                    <thead className="thead-light">
                      <tr>
                        <th>Fecha</th>
                        <th>Productos</th>
                        <th>Método</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th className="text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ventas.map((v) => (
                        <tr key={v._id}>
                          <td className="text-nowrap text-sm text-muted">
                            {formatFecha(v.fecha)}
                          </td>
                          <td>
                            {v.productos.map((p) => (
                              <div key={p._id} className="text-sm">
                                <span className="font-weight-bold">{p.nombre}</span>{" "}
                                <span className="text-muted">x{p.cantidad}</span>
                              </div>
                            ))}
                          </td>
                          <td className="text-capitalize text-sm">{v.metodoPago}</td>
                          <td className="font-weight-bold">{formatPeso(v.totalFinal)}</td>
                          <td>
                            {v.anulada
                              ? <Badge color="danger">Anulada</Badge>
                              : <Badge color="success">Completada</Badge>
                            }
                          </td>
                          <td className="text-right">
                            <Button
                              size="sm" color="primary" outline className="mr-1"
                              onClick={() => abrirDetalle(v)}
                            >
                              Ver
                            </Button>
                            {!v.anulada && (
                              <Button
                                size="sm" color="danger" outline
                                onClick={() => abrirAnular(v)}
                              >
                                Anular
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* ── Modales ── */}
      <ModalNuevaVenta
        isOpen={modalNueva}
        toggle={() => setModalNueva(false)}
        onVentaCreada={() => listarVentas()}
      />

      <ModalDetalleVenta
        isOpen={modalDetalle}
        toggle={() => setModalDetalle(false)}
        venta={ventaActiva}
        onAnular={(v) => abrirAnular(v)}
      />

      <ModalAnularVenta
        isOpen={modalAnular}
        toggle={() => setModalAnular(false)}
        venta={ventaActiva}
        onAnulada={() => listarVentas()}
      />
    </>
  );
};

export default VentasDirectas;
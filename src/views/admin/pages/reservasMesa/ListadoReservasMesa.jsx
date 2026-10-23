import React, { useCallback, useState } from "react";
import { Button, Card, CardBody, CardHeader, Col, Container, Input, Row, Spinner, Table } from "reactstrap";
import EncabezadoReservasMesa from "components/reservasMesa/EncabezadoReservasMesa";
import BadgeEstadoReservaMesa from "components/reservasMesa/BadgeEstadoReservaMesa";
import DetalleReservaMesa from "components/reservasMesa/DetalleReservaMesa";
import FormReservaMesa from "components/reservasMesa/FormReservaMesa";
import { useConfiguracionReservasMesa, useListadoReservasMesa } from "hooks/useReservasMesa";
import { ESTADOS_MESA, ETIQUETA_ORIGEN, fechaCorta, hoyChile, sumarDias } from "utils/reservasMesa";

const FILTROS_INICIALES = () => ({
  desde: hoyChile(),
  hasta: sumarDias(hoyChile(), 30),
  estado: "",
  sector: "",
  origen: "",
  cumpleanos: "",
  q: "",
  pagina: 1,
  porPagina: 25,
});

/** Todas las reservas, con filtros. Tabla en escritorio, tarjetas en celular. */
const ListadoReservasMesa = () => {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [texto, setTexto] = useState("");
  const [detalleId, setDetalleId] = useState(null);
  const [editando, setEditando] = useState(null);

  const config = useConfiguracionReservasMesa();
  const { items, total, pagina, paginas, cargando, error, recargar } = useListadoReservasMesa(filtros);

  const set = (campo, valor) => setFiltros((f) => ({ ...f, [campo]: valor, pagina: 1 }));
  const buscar = (e) => {
    e?.preventDefault();
    set("q", texto.trim());
  };
  const cerrarDetalle = useCallback(() => setDetalleId(null), []);
  const sectores = config.configuracion?.sectores || [];

  return (
    <>
      <EncabezadoReservasMesa
        titulo="Historial y búsqueda"
        subtitulo="Encuentra cualquier reserva por nombre, teléfono, código, fecha o estado"
      />
      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col xl="11">
            <Card className="shadow">
              <CardHeader>
                <h3 className="mb-0">Reservas</h3>
                <small className="text-muted">{total} resultado{total === 1 ? "" : "s"}</small>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col xs="6" md="2" className="mb-2">
                    <small className="text-muted">Desde</small>
                    <Input type="date" bsSize="sm" value={filtros.desde} onChange={(e) => set("desde", e.target.value)} />
                  </Col>
                  <Col xs="6" md="2" className="mb-2">
                    <small className="text-muted">Hasta</small>
                    <Input type="date" bsSize="sm" value={filtros.hasta} onChange={(e) => set("hasta", e.target.value)} />
                  </Col>
                  <Col xs="6" md="2" className="mb-2">
                    <small className="text-muted">Estado</small>
                    <Input type="select" bsSize="sm" value={filtros.estado} onChange={(e) => set("estado", e.target.value)}>
                      <option value="">Todos</option>
                      {Object.entries(ESTADOS_MESA).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label}
                        </option>
                      ))}
                    </Input>
                  </Col>
                  <Col xs="6" md="2" className="mb-2">
                    <small className="text-muted">Sector</small>
                    <Input type="select" bsSize="sm" value={filtros.sector} onChange={(e) => set("sector", e.target.value)}>
                      <option value="">Todos</option>
                      {sectores.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.nombre}
                        </option>
                      ))}
                    </Input>
                  </Col>
                  <Col xs="6" md="2" className="mb-2">
                    <small className="text-muted">Origen</small>
                    <Input type="select" bsSize="sm" value={filtros.origen} onChange={(e) => set("origen", e.target.value)}>
                      <option value="">Todos</option>
                      {Object.entries(ETIQUETA_ORIGEN).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </Input>
                  </Col>
                  <Col xs="6" md="2" className="mb-2">
                    <small className="text-muted">Cumpleaños</small>
                    <Input type="select" bsSize="sm" value={filtros.cumpleanos} onChange={(e) => set("cumpleanos", e.target.value)}>
                      <option value="">Todas</option>
                      <option value="si">Solo cumpleaños</option>
                    </Input>
                  </Col>
                </Row>
                <form onSubmit={buscar} className="d-flex mb-3" style={{ gap: 8 }}>
                  <Input
                    bsSize="sm"
                    placeholder="Nombre, teléfono o código"
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                  />
                  <Button size="sm" color="primary" className="m-0" type="submit">
                    Buscar
                  </Button>
                  <Button
                    size="sm"
                    outline
                    className="m-0"
                    type="button"
                    onClick={() => {
                      setTexto("");
                      setFiltros(FILTROS_INICIALES());
                    }}
                  >
                    Limpiar
                  </Button>
                </form>

                {cargando ? (
                  <div className="text-center py-4">
                    <Spinner />
                  </div>
                ) : error ? (
                  <div className="alert alert-danger">{error}</div>
                ) : items.length === 0 ? (
                  <div className="text-center text-muted py-4">No hay reservas con estos filtros.</div>
                ) : (
                  <>
                    {/* Escritorio */}
                    <div className="table-responsive d-none d-md-block">
                      <Table className="align-items-center mb-0" hover>
                        <thead className="thead-light">
                          <tr>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Cliente</th>
                            <th>Personas</th>
                            <th>Sector</th>
                            <th>Estado</th>
                            <th>Origen</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((r) => (
                            <tr key={r._id} style={{ cursor: "pointer" }} onClick={() => setDetalleId(r._id)}>
                              <td>{fechaCorta(r.fecha)}</td>
                              <td>{r.hora}</td>
                              <td>
                                <strong>{r.cliente.nombre}</strong>
                                {r.cumpleanos?.es && " 🎂"}
                                <div className="small text-muted">
                                  {r.cliente.telefono} · #{r.codigo}
                                </div>
                              </td>
                              <td>{r.personas}</td>
                              <td>{r.sector.nombre}</td>
                              <td>
                                <BadgeEstadoReservaMesa estado={r.estado} />
                              </td>
                              <td className="small">{ETIQUETA_ORIGEN[r.origen] || r.origen}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>

                    {/* Celular */}
                    <div className="d-md-none">
                      {items.map((r) => (
                        <button
                          key={r._id}
                          type="button"
                          className="w-100 text-left border rounded p-3 mb-2 bg-white"
                          onClick={() => setDetalleId(r._id)}
                        >
                          <div className="d-flex justify-content-between align-items-start" style={{ gap: 8 }}>
                            <div style={{ minWidth: 0 }}>
                              <strong style={{ wordBreak: "break-word" }}>
                                {r.cliente.nombre}
                                {r.cumpleanos?.es && " 🎂"}
                              </strong>
                              <div className="small text-muted">
                                {fechaCorta(r.fecha)} · {r.hora} · {r.personas} pers. · {r.sector.nombre}
                              </div>
                            </div>
                            <BadgeEstadoReservaMesa estado={r.estado} />
                          </div>
                        </button>
                      ))}
                    </div>

                    {paginas > 1 && (
                      <div className="d-flex justify-content-center align-items-center mt-3" style={{ gap: 8 }}>
                        <Button size="sm" outline className="m-0" disabled={pagina <= 1} onClick={() => setFiltros((f) => ({ ...f, pagina: f.pagina - 1 }))}>
                          Anterior
                        </Button>
                        <span className="small">
                          Página {pagina} de {paginas}
                        </span>
                        <Button size="sm" outline className="m-0" disabled={pagina >= paginas} onClick={() => setFiltros((f) => ({ ...f, pagina: f.pagina + 1 }))}>
                          Siguiente
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <DetalleReservaMesa
        reservaId={detalleId}
        isOpen={!!detalleId}
        toggle={cerrarDetalle}
        puedeCancelar={config.permisos?.cancelar}
        onCambio={recargar}
        onEditar={(r) => {
          setDetalleId(null);
          setEditando(r);
        }}
      />
      <FormReservaMesa
        isOpen={!!editando}
        toggle={() => setEditando(null)}
        reserva={editando}
        onGuardada={recargar}
      />
    </>
  );
};

export default ListadoReservasMesa;

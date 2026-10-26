import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge, Button, Card, CardBody, CardHeader, Col, Container, Input, Row, Spinner, Table } from "reactstrap";
import Swal from "sweetalert2";
import { Download, Mail, Send } from "lucide-react";
import EncabezadoReservasMesa from "components/reservasMesa/EncabezadoReservasMesa";
import { exportarClientesMesa, getClientesMesa, patchPromocionesClienteMesa } from "api/reservasMesa";
import { fechaCorta, mensajeError, telLink } from "utils/reservasMesa";

const FILTROS = [
  { value: "", label: "Todos" },
  { value: "si", label: "Aceptan promociones" },
  { value: "no", label: "Sin permiso" },
];

const Indicador = ({ valor, label, color = "#32325d" }) => (
  <Col xs="4" className="mb-3">
    <Card className="shadow-sm border-0 h-100">
      <CardBody className="py-3 px-3">
        <div style={{ fontSize: "1.6rem", fontWeight: 700, color, lineHeight: 1.1 }}>{valor ?? "–"}</div>
        <div className="text-muted small">{label}</div>
      </CardBody>
    </Card>
  </Col>
);

const BadgePromo = ({ c }) =>
  c.promociones.acepta ? (
    <Badge color="success" pill>
      Acepta promociones
    </Badge>
  ) : (
    <Badge pill style={{ background: c.promociones.bajaEn ? "#fde8ec" : "#eef0f4", color: c.promociones.bajaEn ? "#c2185b" : "#525f7f" }}>
      {c.promociones.bajaEn ? "Se dio de baja" : "Sin permiso"}
    </Badge>
  );

/** Todos los que han reservado, con sus visitas y el permiso para promociones. */
const ClientesReservasMesa = () => {
  const { slug } = useParams();
  const [filtros, setFiltros] = useState({ q: "", promo: "", pagina: 1 });
  const [texto, setTexto] = useState("");
  const [datos, setDatos] = useState({ items: [], total: 0, paginas: 1, resumen: null });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [exportando, setExportando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const { data } = await getClientesMesa(filtros);
      setDatos(data);
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setCargando(false);
    }
  }, [filtros]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const buscar = (e) => {
    e?.preventDefault();
    setFiltros((f) => ({ ...f, q: texto.trim(), pagina: 1 }));
  };

  const cambiarPermiso = async (c) => {
    const acepta = !c.promociones.acepta;
    const r = await Swal.fire({
      title: acepta ? "¿El cliente aceptó recibir promociones?" : "¿Quitar el permiso de promociones?",
      text: acepta
        ? "Márcalo solo si el cliente te lo confirmó (por ejemplo, por teléfono o WhatsApp)."
        : "Ya no recibirá promociones por correo.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: acepta ? "Sí, aceptó" : "Quitar permiso",
      cancelButtonText: "Volver",
    });
    if (!r.isConfirmed) return;
    try {
      await patchPromocionesClienteMesa(c.telefonoNormalizado, acepta);
      await cargar();
    } catch (e) {
      Swal.fire("No se pudo", mensajeError(e), "error");
    }
  };

  const exportar = async () => {
    setExportando(true);
    try {
      const { data } = await exportarClientesMesa({ q: filtros.q, promo: filtros.promo });
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "clientes-reservas.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      Swal.fire("No se pudo descargar", mensajeError(e), "error");
    } finally {
      setExportando(false);
    }
  };

  const { items, total, pagina, paginas, resumen } = datos;

  return (
    <>
      <EncabezadoReservasMesa titulo="Clientes" subtitulo="Quiénes han reservado, cuántas veces vinieron y quiénes aceptan promociones" />
      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col xl="11">
            <Card className="shadow mb-4">
              <CardBody className="d-flex flex-wrap align-items-center justify-content-between" style={{ gap: 12 }}>
                <div>
                  <h3 className="mb-0">Base de clientes</h3>
                  <div className="text-muted small">Se arma sola con cada reserva (web o panel).</div>
                </div>
                <div className="d-flex flex-wrap" style={{ gap: 8 }}>
                  <Button outline color="primary" className="m-0" onClick={exportar} disabled={exportando}>
                    <Download size={16} style={{ verticalAlign: "-3px" }} /> {exportando ? "Descargando..." : "Descargar Excel"}
                  </Button>
                  <Link to={`/${slug}/admin/reservas-mesa-promociones`} className="btn btn-primary m-0">
                    <Send size={16} style={{ verticalAlign: "-3px" }} /> Enviar promoción
                  </Link>
                </div>
              </CardBody>
            </Card>

            <Row>
              <Indicador valor={resumen?.clientes} label="Clientes" />
              <Indicador valor={resumen?.suscritos} label="Aceptan promociones" color="#2dce89" />
              <Indicador valor={resumen?.destinatarios} label="Con correo para promos" color="#5e72e4" />
            </Row>

            <Card className="shadow">
              <CardHeader>
                <form onSubmit={buscar} className="d-flex flex-wrap" style={{ gap: 8 }}>
                  <Input
                    bsSize="sm"
                    placeholder="Buscar nombre, teléfono o correo"
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    style={{ flex: "1 1 220px", minWidth: 0 }}
                  />
                  <Input
                    type="select"
                    bsSize="sm"
                    value={filtros.promo}
                    onChange={(e) => setFiltros((f) => ({ ...f, promo: e.target.value, pagina: 1 }))}
                    style={{ flex: "0 0 190px" }}
                    aria-label="Filtrar por permiso de promociones"
                  >
                    {FILTROS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </Input>
                  <Button size="sm" color="primary" className="m-0" type="submit">
                    Buscar
                  </Button>
                </form>
                <small className="text-muted d-block mt-2">
                  {total} cliente{total === 1 ? "" : "s"}
                </small>
              </CardHeader>
              <CardBody>
                {cargando ? (
                  <div className="text-center py-4">
                    <Spinner />
                  </div>
                ) : error ? (
                  <div className="alert alert-danger">{error}</div>
                ) : items.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    {filtros.q || filtros.promo ? "Ningún cliente con estos filtros." : "Aún no hay clientes. Aparecen solos al registrar reservas."}
                  </div>
                ) : (
                  <>
                    {/* Escritorio */}
                    <div className="table-responsive d-none d-md-block">
                      <Table className="align-items-center mb-0" hover>
                        <thead className="thead-light">
                          <tr>
                            <th>Cliente</th>
                            <th>Correo</th>
                            <th className="text-center">Reservas</th>
                            <th className="text-center">Vino</th>
                            <th className="text-center">No asistió</th>
                            <th>Última reserva</th>
                            <th>Promociones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((c) => (
                            <tr key={c.telefonoNormalizado}>
                              <td>
                                <strong>{c.nombre}</strong>
                                {c.cumpleanos > 0 && " 🎂"}
                                <div className="small">
                                  <a href={telLink(c.telefono)}>{c.telefono}</a>
                                </div>
                              </td>
                              <td className="small">{c.email || <span className="text-muted">Sin correo</span>}</td>
                              <td className="text-center">{c.reservas}</td>
                              <td className="text-center">{c.visitas}</td>
                              <td className="text-center" style={{ color: c.noAsistio ? "#f5365c" : undefined }}>
                                {c.noAsistio}
                              </td>
                              <td className="small">{fechaCorta(c.ultima)}</td>
                              <td>
                                <BadgePromo c={c} />
                                <div>
                                  <Button size="sm" color="link" className="p-0 m-0 small" onClick={() => cambiarPermiso(c)}>
                                    {c.promociones.acepta ? "Quitar permiso" : "Marcar que acepta"}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>

                    {/* Celular */}
                    <div className="d-md-none">
                      {items.map((c) => (
                        <div key={c.telefonoNormalizado} className="border rounded p-3 mb-2 bg-white">
                          <div className="d-flex justify-content-between align-items-start" style={{ gap: 8 }}>
                            <div style={{ minWidth: 0 }}>
                              <strong style={{ wordBreak: "break-word" }}>
                                {c.nombre}
                                {c.cumpleanos > 0 && " 🎂"}
                              </strong>
                              <div className="small">
                                <a href={telLink(c.telefono)}>{c.telefono}</a>
                              </div>
                              {c.email && (
                                <div className="small text-muted" style={{ wordBreak: "break-all" }}>
                                  <Mail size={12} style={{ verticalAlign: "-1px" }} /> {c.email}
                                </div>
                              )}
                            </div>
                            <BadgePromo c={c} />
                          </div>
                          <div className="small text-muted mt-2">
                            {c.reservas} reserva{c.reservas === 1 ? "" : "s"} · vino {c.visitas}
                            {c.noAsistio > 0 && <span style={{ color: "#f5365c" }}> · no asistió {c.noAsistio}</span>} · última{" "}
                            {fechaCorta(c.ultima)}
                          </div>
                          <Button size="sm" color="link" className="p-0 mt-1" onClick={() => cambiarPermiso(c)}>
                            {c.promociones.acepta ? "Quitar permiso de promociones" : "Marcar que acepta promociones"}
                          </Button>
                        </div>
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
    </>
  );
};

export default ClientesReservasMesa;

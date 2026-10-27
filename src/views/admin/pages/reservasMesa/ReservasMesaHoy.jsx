import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Button, Card, CardBody, Col, Container, Input, Row, Spinner } from "reactstrap";
import Swal from "sweetalert2";
import { BellRing, ChevronLeft, ChevronRight, PauseCircle, PlayCircle, Plus } from "lucide-react";
import EncabezadoReservasMesa from "components/reservasMesa/EncabezadoReservasMesa";
import TarjetaReservaMesa from "components/reservasMesa/TarjetaReservaMesa";
import FormReservaMesa from "components/reservasMesa/FormReservaMesa";
import DetalleReservaMesa from "components/reservasMesa/DetalleReservaMesa";
import { useConfiguracionReservasMesa, useReservasMesaDia } from "hooks/useReservasMesa";
import {
  deleteBloqueoReservasMesa,
  deleteListaEsperaMesa,
  getBloqueosReservasMesa,
  getListaEsperaMesa,
  postBloqueoReservasMesa,
} from "api/reservasMesa";
import { capitalizar, fechaHora, fechaLarga, hoyChile, mensajeError, sumarDias } from "utils/reservasMesa";

const FILTROS = [
  { key: "todas", label: "Todas", estados: null },
  { key: "por_llegar", label: "Por llegar", estados: ["pendiente", "confirmada"] },
  { key: "en_local", label: "En el local", estados: ["llego"] },
  { key: "cerradas", label: "Cerradas", estados: ["completada", "cancelada", "no_asistio"] },
];

const Indicador = ({ valor, label, color = "#32325d" }) => (
  <Col xs="6" md className="mb-3">
    <Card className="shadow-sm border-0 h-100">
      <CardBody className="py-3 px-3">
        <div style={{ fontSize: "1.6rem", fontWeight: 700, color, lineHeight: 1.1 }}>{valor}</div>
        <div className="text-muted small">{label}</div>
      </CardBody>
    </Card>
  </Col>
);

/** Vista del día: lo que se usa en el local durante el servicio. */
const ReservasMesaHoy = () => {
  const { slug } = useParams();
  const [params] = useSearchParams();
  // La Agenda abre un día puntual con ?fecha=YYYY-MM-DD
  const [fecha, setFecha] = useState(() => {
    const f = params.get("fecha");
    return /^\d{4}-\d{2}-\d{2}$/.test(f || "") ? f : hoyChile();
  });
  const [filtro, setFiltro] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [detalleId, setDetalleId] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  const config = useConfiguracionReservasMesa();
  const { reservas, resumen, cargando, error, recargar, cambiarEstado } = useReservasMesaDia(fecha);

  // Lista de espera del día (gente que no encontró lugar y pidió aviso)
  const [espera, setEspera] = useState([]);
  const cargarEspera = useCallback(() => {
    getListaEsperaMesa(fecha)
      .then(({ data }) => setEspera(data))
      .catch(() => setEspera([]));
  }, [fecha]);
  useEffect(() => {
    cargarEspera();
  }, [cargarEspera, reservas]);
  const quitarEspera = async (item) => {
    const r = await Swal.fire({
      title: `¿Quitar a ${item.nombre} de la lista de espera?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Quitar",
      cancelButtonText: "Volver",
    });
    if (!r.isConfirmed) return;
    try {
      await deleteListaEsperaMesa(item._id);
      cargarEspera();
    } catch (e) {
      Swal.fire("No se pudo", mensajeError(e), "error");
    }
  };
  const esHoy = fecha === hoyChile();

  const visibles = useMemo(() => {
    const f = FILTROS.find((x) => x.key === filtro);
    const q = busqueda.trim().toLowerCase();
    const qTel = q.replace(/\D/g, "");
    return reservas.filter((r) => {
      if (f?.estados && !f.estados.includes(r.estado)) return false;
      if (!q) return true;
      return (
        r.cliente.nombre.toLowerCase().includes(q) ||
        r.codigo.toLowerCase().includes(q) ||
        (qTel.length >= 3 && r.cliente.telefono.replace(/\D/g, "").includes(qTel))
      );
    });
  }, [reservas, filtro, busqueda]);

  const accion = async (reserva, a) => {
    let detalle = "";
    if (a.pideMotivo) {
      const r = await Swal.fire({
        title: "¿Por qué se corrige?",
        input: "text",
        inputPlaceholder: "Ej: llegó tarde",
        showCancelButton: true,
        inputValidator: (v) => (!v?.trim() ? "Escribe un motivo" : undefined),
      });
      if (!r.isConfirmed) return;
      detalle = r.value;
    }
    setOcupado(true);
    try {
      await cambiarEstado(reserva._id, { estado: a.hacia, detalle });
    } catch (e) {
      Swal.fire("No se pudo", mensajeError(e), "error");
    } finally {
      setOcupado(false);
    }
  };

  const abrirNueva = () => {
    setEditando(null);
    setFormAbierto(true);
  };
  const cerrarDetalle = useCallback(() => setDetalleId(null), []);

  const faltaConfigurar = !config.cargando && config.faltantes?.length > 0;

  // Pausar reservas del día (por ejemplo, el local se llenó con gente sin reserva).
  // Por dentro es un bloqueo del día; "Reanudar" lo quita.
  const [bloqueosDia, setBloqueosDia] = useState([]);
  const sectores = config.configuracion?.sectores || [];
  const nombreSector = (id) => sectores.find((s) => String(s._id) === String(id))?.nombre || "Sector";
  const cargarBloqueos = useCallback(() => {
    getBloqueosReservasMesa(fecha)
      .then(({ data }) => setBloqueosDia(data.filter((b) => b.fecha === fecha)))
      .catch(() => setBloqueosDia([]));
  }, [fecha]);
  useEffect(() => {
    cargarBloqueos();
  }, [cargarBloqueos]);
  const pausadoTodo = bloqueosDia.some((b) => !b.sector && !b.horaDesde);

  const pausar = async () => {
    const opciones = { "": "Todo el local" };
    sectores.filter((s) => s.activo).forEach((s) => (opciones[s._id] = `Solo ${s.nombre}`));
    const r = await Swal.fire({
      title: `¿Pausar las reservas ${esHoy ? "de hoy" : `del ${fechaLarga(fecha)}`}?`,
      html:
        "No se aceptan reservas nuevas (web ni panel) hasta que las reanudes. Las reservas ya tomadas se mantienen.",
      input: "select",
      inputOptions: opciones,
      inputValue: "",
      showCancelButton: true,
      confirmButtonText: "Pausar reservas",
      cancelButtonText: "Volver",
    });
    if (!r.isConfirmed) return;
    try {
      await postBloqueoReservasMesa({
        fecha,
        tipo: "sin_reservas",
        sectorId: r.value || null,
        motivo: esHoy ? "Por hoy no quedan mesas para reservar en línea" : "No quedan mesas para reservar en línea",
      });
      cargarBloqueos();
      Swal.fire({ icon: "success", title: "Reservas pausadas", timer: 1500, showConfirmButton: false });
    } catch (e) {
      Swal.fire("No se pudo pausar", mensajeError(e), "error");
    }
  };

  const reanudar = async (b) => {
    try {
      await deleteBloqueoReservasMesa(b._id);
      cargarBloqueos();
    } catch (e) {
      Swal.fire("No se pudo reanudar", mensajeError(e), "error");
    }
  };

  return (
    <>
      <EncabezadoReservasMesa
        titulo={esHoy ? "Servicio de hoy" : "Reservas del día"}
        subtitulo={capitalizar(fechaLarga(fecha))}
      />
      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col xl="10">
            <Card className="shadow mb-4">
              <CardBody>
                <div className="d-flex flex-wrap align-items-center justify-content-between" style={{ gap: 12 }}>
                  <div>
                    <h3 className="mb-0">{esHoy ? "Hoy" : capitalizar(fechaLarga(fecha))}</h3>
                    <div className="text-muted small">Marca llegadas, confirma y registra reservas</div>
                  </div>
                  <div className="d-flex flex-wrap" style={{ gap: 8 }}>
                    {config.esAdmin && fecha >= hoyChile() && !pausadoTodo && !faltaConfigurar && (
                      <Button outline color="warning" className="m-0" onClick={pausar}>
                        <PauseCircle size={16} style={{ verticalAlign: "-3px" }} /> Pausar reservas
                      </Button>
                    )}
                    <Button color="primary" className="m-0" onClick={abrirNueva} disabled={faltaConfigurar}>
                      <Plus size={16} style={{ verticalAlign: "-3px" }} /> Nueva reserva
                    </Button>
                  </div>
                </div>

                <div className="d-flex align-items-center mt-3" style={{ gap: 8 }}>
                  <Button outline size="sm" className="m-0" onClick={() => setFecha((f) => sumarDias(f, -1))} aria-label="Día anterior">
                    <ChevronLeft size={16} />
                  </Button>
                  <Input
                    type="date"
                    bsSize="sm"
                    value={fecha}
                    onChange={(e) => e.target.value && setFecha(e.target.value)}
                    style={{ maxWidth: 170 }}
                  />
                  <Button outline size="sm" className="m-0" onClick={() => setFecha((f) => sumarDias(f, 1))} aria-label="Día siguiente">
                    <ChevronRight size={16} />
                  </Button>
                  {!esHoy && (
                    <Button color="link" size="sm" className="m-0" onClick={() => setFecha(hoyChile())}>
                      Ir a hoy
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>

            {bloqueosDia.length > 0 && (
              <div className="alert mb-4" style={{ background: "#fff3e0", color: "#8a4b00", border: "1px solid #ffd8a8" }}>
                <div className="font-weight-bold mb-1">
                  <PauseCircle size={16} style={{ verticalAlign: "-3px" }} /> Reservas pausadas {esHoy ? "hoy" : "este día"}
                </div>
                {bloqueosDia.map((b) => (
                  <div key={b._id} className="d-flex flex-wrap align-items-center justify-content-between" style={{ gap: 8 }}>
                    <span className="small">
                      {b.sector ? nombreSector(b.sector) : "Todo el local"}
                      {b.horaDesde ? ` · ${b.horaDesde} a ${b.horaHasta}` : ""}
                      {b.motivo ? ` · ${b.motivo}` : ""}
                    </span>
                    {config.esAdmin && (
                      <Button size="sm" color="success" className="m-0" onClick={() => reanudar(b)}>
                        <PlayCircle size={14} style={{ verticalAlign: "-2px" }} /> Reanudar
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {faltaConfigurar && (
              <div className="alert alert-warning">
                Antes de recibir reservas falta configurar: {config.faltantes.join(", ")}.{" "}
                {config.esAdmin ? (
                  <Link to={`/${slug}/admin/reservas-mesa-sectores`} className="alert-link">
                    Ir a los ajustes
                  </Link>
                ) : (
                  "Pídele al administrador que lo complete."
                )}
              </div>
            )}

            {resumen && (
              <Row>
                <Indicador valor={resumen.reservas} label="Reservas" />
                <Indicador valor={resumen.personasEsperadas} label="Personas esperadas" />
                <Indicador valor={resumen.personasLlegaron} label="Personas llegaron" color="#2dce89" />
                {resumen.porConfirmar > 0 && (
                  <Indicador valor={resumen.porConfirmar} label="Por confirmar" color="#fb6340" />
                )}
                {resumen.cumpleanos > 0 && <Indicador valor={resumen.cumpleanos} label="Cumpleaños" color="#f5365c" />}
              </Row>
            )}

            {resumen?.ocupacionAhora?.length > 0 && (
              <Card className="shadow-sm border-0 mb-4">
                <CardBody>
                  <div className="text-muted small mb-2">Ocupación reservada ahora</div>
                  {resumen.ocupacionAhora.map((s) => {
                    const pct = Math.min(100, Math.round((s.personas / s.capacidad) * 100));
                    return (
                      <div key={s.id} className="mb-2">
                        <div className="d-flex justify-content-between small">
                          <strong>{s.nombre}</strong>
                          <span>
                            {s.personas} / {s.capacidad} personas
                          </span>
                        </div>
                        <div className="progress" style={{ height: 8 }}>
                          <div
                            className={`progress-bar ${pct >= 100 ? "bg-danger" : pct >= 80 ? "bg-warning" : "bg-success"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardBody>
              </Card>
            )}

            {espera.length > 0 && (
              <Card className="shadow-sm border-0 mb-4">
                <CardBody>
                  <div className="d-flex align-items-center mb-2" style={{ gap: 8 }}>
                    <BellRing size={16} />
                    <strong>Lista de espera</strong>
                    <span className="text-muted small">
                      · {espera.filter((x) => x.estado === "esperando").length} esperando lugar
                    </span>
                  </div>
                  {espera.map((x) => (
                    <div key={x._id} className="d-flex flex-wrap justify-content-between align-items-center border-top py-2" style={{ gap: 8 }}>
                      <div style={{ minWidth: 0 }}>
                        <strong>{x.nombre}</strong> · {x.personas} pers.{" "}
                        <a href={`mailto:${x.email}`} className="small" style={{ wordBreak: "break-all" }}>
                          {x.email}
                        </a>
                      </div>
                      <div className="d-flex align-items-center" style={{ gap: 8 }}>
                        {x.estado === "avisado" ? (
                          <span className="badge badge-pill" style={{ background: "#e6f7ef", color: "#1a7f52" }}>
                            Avisado {fechaHora(x.avisadoEn)}
                          </span>
                        ) : (
                          <span className="badge badge-pill" style={{ background: "#fff3e0", color: "#c25e00" }}>
                            Esperando
                          </span>
                        )}
                        {config.esAdmin && (
                          <Button size="sm" color="link" className="p-0 m-0" onClick={() => quitarEspera(x)}>
                            Quitar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="small text-muted mt-1">
                    Cuando se libera lugar para su grupo, el sistema les avisa solo por correo.
                  </div>
                </CardBody>
              </Card>
            )}

            <Card className="shadow">
              <CardBody>
                <div className="d-flex flex-wrap align-items-center mb-3" style={{ gap: 8 }}>
                  {FILTROS.map((f) => (
                    <Button
                      key={f.key}
                      size="sm"
                      className="m-0"
                      color={filtro === f.key ? "primary" : "secondary"}
                      outline={filtro !== f.key}
                      onClick={() => setFiltro(f.key)}
                    >
                      {f.label}
                    </Button>
                  ))}
                  <Input
                    bsSize="sm"
                    placeholder="Buscar nombre, teléfono o código"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{ flex: "1 1 200px", minWidth: 0 }}
                  />
                </div>

                {cargando ? (
                  <div className="text-center py-4">
                    <Spinner />
                  </div>
                ) : error ? (
                  <div className="alert alert-danger">
                    {error}{" "}
                    <Button size="sm" color="link" className="p-0" onClick={() => recargar()}>
                      Reintentar
                    </Button>
                  </div>
                ) : visibles.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    {reservas.length === 0 ? "No hay reservas para este día." : "Ninguna reserva con este filtro."}
                  </div>
                ) : (
                  visibles.map((r) => (
                    <TarjetaReservaMesa
                      key={r._id}
                      reserva={r}
                      ocupado={ocupado}
                      onAccion={accion}
                      onAbrir={(x) => setDetalleId(x._id)}
                    />
                  ))
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <FormReservaMesa
        isOpen={formAbierto}
        toggle={() => setFormAbierto(false)}
        reserva={editando}
        fechaInicial={fecha}
        onGuardada={(r) => {
          if (r?.fecha && r.fecha !== fecha) setFecha(r.fecha);
          else recargar({ silencioso: true });
        }}
      />

      <DetalleReservaMesa
        reservaId={detalleId}
        isOpen={!!detalleId}
        toggle={cerrarDetalle}
        puedeCancelar={config.permisos?.cancelar}
        onCambio={() => recargar({ silencioso: true })}
        onEditar={(r) => {
          setDetalleId(null);
          setEditando(r);
          setFormAbierto(true);
        }}
      />
    </>
  );
};

export default ReservasMesaHoy;

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, CardBody, Col, Container, Row, Spinner } from "reactstrap";
import { ChevronLeft, ChevronRight } from "lucide-react";
import EncabezadoReservasMesa from "components/reservasMesa/EncabezadoReservasMesa";
import { useConfiguracionReservasMesa } from "hooks/useReservasMesa";
import { getCalendarioReservasMesa } from "api/reservasMesa";
import { hoyChile, mensajeError } from "utils/reservasMesa";

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const CABECERA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const pad = (n) => String(n).padStart(2, "0");
const diasDelMes = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate(); // m: 1-12
const diaSemana = (y, m, d) => new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay(); // 0 = domingo

/** Vista mensual: cuántas reservas y personas hay cada día. Un clic abre ese día. */
const AgendaReservasMesa = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const hoy = hoyChile();
  const [mes, setMes] = useState(hoy.slice(0, 7)); // "YYYY-MM"
  const [datos, setDatos] = useState({ dias: [], bloqueos: [] });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const { configuracion } = useConfiguracionReservasMesa();

  const [y, m] = mes.split("-").map(Number);
  const total = diasDelMes(y, m);
  const desde = `${mes}-01`;
  const hasta = `${mes}-${pad(total)}`;

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setError("");
    getCalendarioReservasMesa(desde, hasta)
      .then(({ data }) => vigente && setDatos(data))
      .catch((e) => vigente && setError(mensajeError(e, "No se pudo cargar la agenda")))
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [desde, hasta]);

  const porFecha = useMemo(() => new Map(datos.dias.map((d) => [d.fecha, d])), [datos]);
  const bloqueadas = useMemo(() => new Set(datos.bloqueos.map((b) => b.fecha)), [datos]);
  const diasAbiertos = useMemo(
    () => new Set((configuracion?.horario || []).filter((h) => h.abierto).map((h) => h.dia)),
    [configuracion],
  );

  const totales = datos.dias.reduce(
    (t, d) => ({ reservas: t.reservas + d.reservas, personas: t.personas + d.personas }),
    { reservas: 0, personas: 0 },
  );

  // Celdas: huecos antes del día 1 (semana parte el lunes) + días del mes
  const offset = (diaSemana(y, m, 1) + 6) % 7;
  const celdas = [...Array(offset).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];

  const moverMes = (delta) => {
    const f = new Date(Date.UTC(y, m - 1 + delta, 1));
    setMes(`${f.getUTCFullYear()}-${pad(f.getUTCMonth() + 1)}`);
  };

  return (
    <>
      <EncabezadoReservasMesa titulo="Agenda" subtitulo="Reservas de cada día del mes. Toca un día para verlo en detalle." />
      <Container className="mt--7 mb-5" fluid>
        <style>{`
          .ag-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 8px; }
          .ag-cab { text-align: center; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: #8898aa; padding-bottom: 4px; }
          .ag-dia { min-height: 108px; border: 1px solid #e9ecef; border-radius: 12px; padding: 10px; background: #fff; text-align: left;
                    display: flex; flex-direction: column; gap: 4px; cursor: pointer; transition: box-shadow .15s, border-color .15s; width: 100%; }
          .ag-dia:hover { border-color: #c9954c; box-shadow: 0 6px 18px -8px rgba(0,0,0,.25); }
          .ag-dia.cerrado { background: #f8f9fa; color: #adb5bd; }
          .ag-dia.hoy { border: 2px solid #c9954c; }
          .ag-num { font-weight: 700; font-size: 15px; color: #32325d; }
          .ag-dia.cerrado .ag-num { color: #adb5bd; }
          .ag-res { font-size: 13px; color: #32325d; line-height: 1.2; }
          .ag-res strong { font-size: 18px; }
          .ag-chip { font-size: 11px; border-radius: 999px; padding: 1px 8px; display: inline-block; }
          @media (max-width: 767px) {
            .ag-grid { gap: 4px; }
            .ag-dia { min-height: 64px; padding: 6px; border-radius: 8px; }
            .ag-res span, .ag-chip.texto, .ag-chip .texto { display: none; }
            .ag-res strong { font-size: 15px; }
            .ag-num { font-size: 12px; }
          }
        `}</style>
        <Row className="justify-content-center">
          <Col xl="11">
            <Card className="shadow border-0">
              <CardBody>
                <div className="d-flex flex-wrap align-items-center justify-content-between mb-4" style={{ gap: 12 }}>
                  <div className="d-flex align-items-center" style={{ gap: 8 }}>
                    <Button outline size="sm" className="m-0" onClick={() => moverMes(-1)} aria-label="Mes anterior">
                      <ChevronLeft size={16} />
                    </Button>
                    <h3 className="mb-0" style={{ minWidth: 170, textAlign: "center" }}>
                      {MESES[m - 1]} {y}
                    </h3>
                    <Button outline size="sm" className="m-0" onClick={() => moverMes(1)} aria-label="Mes siguiente">
                      <ChevronRight size={16} />
                    </Button>
                    {mes !== hoy.slice(0, 7) && (
                      <Button color="link" size="sm" className="m-0" onClick={() => setMes(hoy.slice(0, 7))}>
                        Este mes
                      </Button>
                    )}
                  </div>
                  <div className="text-muted small">
                    {totales.reservas} reservas · {totales.personas} personas en el mes
                  </div>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}
                {cargando ? (
                  <div className="text-center py-5">
                    <Spinner />
                  </div>
                ) : (
                  <div className="ag-grid">
                    {CABECERA.map((c) => (
                      <div key={c} className="ag-cab">
                        {c}
                      </div>
                    ))}
                    {celdas.map((d, i) => {
                      if (!d) return <div key={`v-${i}`} />;
                      const fecha = `${mes}-${pad(d)}`;
                      const info = porFecha.get(fecha);
                      const cerrado = diasAbiertos.size > 0 && !diasAbiertos.has(diaSemana(y, m, d));
                      const bloqueado = bloqueadas.has(fecha);
                      return (
                        <button
                          key={fecha}
                          type="button"
                          className={`ag-dia${cerrado ? " cerrado" : ""}${fecha === hoy ? " hoy" : ""}`}
                          onClick={() => navigate(`/${slug}/admin/reservas-mesa-hoy?fecha=${fecha}`)}
                        >
                          <span className="ag-num">{d}</span>
                          {info ? (
                            <span className="ag-res">
                              <strong>{info.reservas}</strong> <span>reserva{info.reservas === 1 ? "" : "s"}</span>
                              <br />
                              <span>{info.personas} personas</span>
                            </span>
                          ) : (
                            cerrado && <span className="ag-chip texto">Cerrado</span>
                          )}
                          <span className="d-flex flex-wrap" style={{ gap: 3 }}>
                            {info?.pendientes > 0 && (
                              <span className="ag-chip" style={{ background: "#fff3e0", color: "#c25e00" }}>
                                {info.pendientes} <span className="texto">por confirmar</span>
                              </span>
                            )}
                            {info?.cumpleanos > 0 && (
                              <span className="ag-chip" style={{ background: "#fde8ec", color: "#c2185b" }}>
                                🎂 {info.cumpleanos}
                              </span>
                            )}
                            {bloqueado && (
                              <span className="ag-chip" style={{ background: "#f1f3f5", color: "#495057" }}>
                                ⛔ <span className="texto">Bloqueo</span>
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default AgendaReservasMesa;

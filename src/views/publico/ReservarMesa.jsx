import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Card, CardBody, Col, Container, FormGroup, Input, Label, Row, Spinner } from "reactstrap";
import { CalendarCheck, Info, Phone } from "lucide-react";
import { useEmpresa } from "context/EmpresaContext";
import { construirTema } from "utils/temaEmpresa";
import { cargarFuentesRestaurante, marcaDe } from "utils/marcasRestaurante";
import SelectorHoraSector from "components/reservasMesa/SelectorHoraSector";
import {
  getInfoReservaMesaPublica,
  getDisponibilidadMesaPublica,
  postReservaMesaPublica,
} from "api/reservasMesa";
import { DIAS_SEMANA, capitalizar, fechaLarga, nuevaClave, telLink } from "utils/reservasMesa";

// Con identidad propia (utils/marcasRestaurante.js) la página toma sus colores:
// fondo oscuro de la marca y botones en un tono cobre que se lee bien sobre blanco.
const temaDeMarca = (base, marca) =>
  marca
    ? {
        ...base,
        primary: "#9a6a2c",
        primaryLight: "#f6ecdd",
        textDark: "#2a1f16",
        textMuted: marca.colores.textoSuave,
        softBg: marca.colores.fondo,
        heroBg: `linear-gradient(180deg, rgba(17,13,10,0.55), ${marca.colores.fondo}), url(${marca.fondoHero}) center/cover`,
      }
    : base;

const diaDe = (fecha) => {
  const [y, m, d] = fecha.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
};

const DISP_VACIA = { horas: [], cargando: false, grupoGrande: false, cerrado: false, avisos: [], diaEspecial: null };

/** Etiqueta corta de un día especial: "Solo por orden de llegada", "Sin reservas"... */
const etiquetaEspecial = (d) =>
  d.tipo === "orden_llegada"
    ? d.diaCompleto
      ? "Solo por orden de llegada"
      : d.horaHasta === "23:59"
        ? `Solo por orden de llegada desde las ${d.horaDesde}`
        : `Solo por orden de llegada entre las ${d.horaDesde} y las ${d.horaHasta}`
    : "Sin reservas";

const Paso = ({ n, titulo, color, children }) => (
  <div className="mb-4">
    <div className="d-flex align-items-center mb-2" style={{ gap: 10 }}>
      <span
        className="d-inline-flex align-items-center justify-content-center rounded-circle text-white"
        style={{ width: 26, height: 26, background: color, fontSize: 13, fontWeight: 700, flexShrink: 0 }}
      >
        {n}
      </span>
      <strong>{titulo}</strong>
    </div>
    {children}
  </div>
);

/** Página pública para reservar mesa, sin crear cuenta. */
const ReservarMesa = () => {
  const { slug } = useParams();
  const { empresa } = useEmpresa();
  const marca = marcaDe(empresa);
  const theme = temaDeMarca(construirTema(empresa?.colores), marca);

  useEffect(() => {
    if (marca) cargarFuentesRestaurante();
  }, [marca]);

  const [info, setInfo] = useState(null);
  const [cargandoInfo, setCargandoInfo] = useState(true);
  const [noDisponible, setNoDisponible] = useState(false);

  const [personas, setPersonas] = useState("");
  const [fecha, setFecha] = useState("");
  const [disp, setDisp] = useState(DISP_VACIA);
  const [eleccion, setEleccion] = useState({ hora: "", sectorId: "" });
  const [datos, setDatos] = useState({ nombre: "", telefono: "", email: "", comentarios: "", sitioWeb: "" });
  const [cumple, setCumple] = useState({ es: false, festejado: "", detalle: "" });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [alternativas, setAlternativas] = useState([]);
  const [confirmada, setConfirmada] = useState(null);
  const [clave] = useState(nuevaClave);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let vigente = true;
    getInfoReservaMesaPublica(slug)
      .then(({ data }) => {
        if (!vigente) return;
        setInfo(data);
        setNoDisponible(!data.activa);
      })
      .catch(() => vigente && setNoDisponible(true))
      .finally(() => vigente && setCargandoInfo(false));
    return () => {
      vigente = false;
    };
  }, [slug]);

  const n = Number(personas);
  const diaCerrado = useMemo(
    () => !!(fecha && info?.diasAbiertos && !info.diasAbiertos.includes(diaDe(fecha))),
    [fecha, info],
  );
  // Día completo sin reservas o solo por orden de llegada (se sabe sin esperar la API)
  const especial = useMemo(
    () => (info?.diasEspeciales || []).find((d) => d.fecha === fecha && d.diaCompleto) || disp.diaEspecial || null,
    [info, fecha, disp.diaEspecial],
  );

  // Cambiar fecha o personas reinicia la elección
  useEffect(() => {
    setEleccion({ hora: "", sectorId: "" });
    setAlternativas([]);
    setError("");
  }, [fecha, n]);

  // Horas disponibles (también se recarga si alguien tomó el lugar recién)
  useEffect(() => {
    if (!fecha || !(n >= 1) || diaCerrado) {
      setDisp({ ...DISP_VACIA, cerrado: diaCerrado });
      return;
    }
    let vigente = true;
    setDisp((d) => ({ ...d, cargando: true }));
    getDisponibilidadMesaPublica(slug, { fecha, personas: n })
      .then(({ data }) => {
        if (vigente) {
          setDisp({
            horas: data.horas || [],
            cargando: false,
            grupoGrande: !!data.grupoGrande,
            cerrado: !!data.cerrado,
            avisos: data.avisos || [],
            diaEspecial: data.diaEspecial || null,
          });
        }
      })
      .catch(() => vigente && setDisp(DISP_VACIA));
    return () => {
      vigente = false;
    };
  }, [slug, fecha, n, diaCerrado, recarga]);

  const setDato = (campo, valor) => setDatos((d) => ({ ...d, [campo]: valor }));

  const listo =
    eleccion.hora && eleccion.sectorId && datos.nombre.trim().length >= 2 && datos.telefono.trim() && datos.email.trim();

  const reservar = async () => {
    setEnviando(true);
    setError("");
    setAlternativas([]);
    try {
      const { data } = await postReservaMesaPublica(slug, {
        fecha,
        hora: eleccion.hora,
        personas: n,
        sectorId: eleccion.sectorId,
        nombre: datos.nombre,
        telefono: datos.telefono,
        email: datos.email,
        comentarios: datos.comentarios,
        cumpleanos: cumple,
        claveIdempotencia: clave,
        sitioWeb: datos.sitioWeb,
      });
      setConfirmada(data);
      window.scrollTo(0, 0);
    } catch (e) {
      const d = e?.response?.data || {};
      setError(d.message || "No pudimos completar la reserva. Intenta de nuevo.");
      setAlternativas(d.alternativas || []);
      if (d.code === "SIN_CUPO") setRecarga((x) => x + 1);
    } finally {
      setEnviando(false);
    }
  };

  const nombreLocal = info?.empresa?.nombre || empresa?.nombre || "";
  const telefono = info?.empresa?.telefono || empresa?.telefono || "";

  const contenedor = (contenido) => (
    <div style={{ minHeight: "100vh", background: theme.softBg || "#f6f9fc" }}>
      <div style={{ background: theme.heroBg, color: "#fff" }} className={marca ? "pt-5 pb-6" : "py-5"}>
        <Container className="text-center">
          {marca ? (
            <>
              <Link to={`/${slug}`}>
                <img
                  src={marca.logo}
                  alt={nombreLocal}
                  style={{ width: 96, height: 84, objectFit: "cover", borderRadius: 16, boxShadow: "0 18px 40px -12px rgba(0,0,0,.8)" }}
                />
              </Link>
              <h1
                className="text-white mt-3 mb-1"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "2.6rem", fontWeight: 600 }}
              >
                Reserva tu mesa
              </h1>
              <div style={{ color: marca.colores.acentoClaro, letterSpacing: "0.2em", textTransform: "uppercase", fontSize: "0.8rem" }}>
                {nombreLocal}
                {marca.ciudad ? ` · ${marca.ciudad}` : ""}
              </div>
            </>
          ) : (
            <>
              <CalendarCheck size={32} />
              <h1 className="h2 text-white mt-2 mb-1">Reserva tu mesa</h1>
              <div style={{ opacity: 0.85 }}>{nombreLocal}</div>
            </>
          )}
        </Container>
      </div>
      <Container style={{ maxWidth: 720, marginTop: -32 }} className="pb-5">
        <Card className="shadow border-0">
          <CardBody className="p-4">{contenido}</CardBody>
        </Card>
        <div className="text-center mt-3">
          <Link to={`/${slug}`} style={{ color: theme.textMuted }}>
            Volver a {nombreLocal || "inicio"}
          </Link>
        </div>
      </Container>
    </div>
  );

  if (cargandoInfo) {
    return contenedor(
      <div className="text-center py-4">
        <Spinner style={{ color: theme.primary }} />
      </div>,
    );
  }

  if (noDisponible) {
    return contenedor(
      <div className="text-center py-3">
        <p className="mb-3">Por ahora no se puede reservar en línea.</p>
        {telefono && (
          <a href={telLink(telefono)} className="btn" style={{ background: theme.primary, color: "#fff" }}>
            <Phone size={16} style={{ verticalAlign: "-3px" }} /> Llamar al {telefono}
          </a>
        )}
      </div>,
    );
  }

  if (confirmada) {
    const pendiente = confirmada.estado === "pendiente";
    return contenedor(
      <div className="text-center py-2">
        <div style={{ fontSize: 48 }}>{pendiente ? "📩" : "✅"}</div>
        <h2 className="h3">{pendiente ? "¡Solicitud recibida!" : "¡Reserva confirmada!"}</h2>
        <p className="text-muted">
          {pendiente
            ? "El local la revisará y te avisaremos por correo cuando quede confirmada."
            : "Te enviamos la confirmación por correo."}
        </p>
        <div className="border rounded p-3 text-left mx-auto" style={{ maxWidth: 380 }}>
          <div>
            <strong>Código:</strong> <span style={{ letterSpacing: 1 }}>{confirmada.codigo}</span>
          </div>
          <div>
            <strong>Fecha:</strong> {capitalizar(fechaLarga(confirmada.fecha))}
          </div>
          <div>
            <strong>Hora:</strong> {confirmada.hora}
          </div>
          <div>
            <strong>Personas:</strong> {confirmada.personas}
          </div>
          <div>
            <strong>Sector:</strong> {confirmada.sector}
          </div>
        </div>
        {(info?.mensajePublico || (cumple.es && info?.mensajeCumpleanos)) && (
          <div className="rounded p-3 mt-3 text-left mx-auto small" style={{ maxWidth: 380, background: theme.primaryLight, color: theme.textDark, whiteSpace: "pre-line" }}>
            {info.mensajePublico && <div>{info.mensajePublico}</div>}
            {cumple.es && info.mensajeCumpleanos && <div className={info.mensajePublico ? "mt-2" : ""}>🎂 {info.mensajeCumpleanos}</div>}
          </div>
        )}
        {info?.toleranciaMinutos > 0 && !pendiente && (
          <p className="small text-muted mt-3">
            Guardamos tu lugar hasta {info.toleranciaMinutos} minutos después de la hora.
          </p>
        )}
      </div>,
    );
  }

  return contenedor(
    <>
      {info?.mensajePublico && (
        <div className="alert mb-4" style={{ background: theme.primaryLight, color: theme.textDark, whiteSpace: "pre-line" }}>
          <Info size={16} style={{ verticalAlign: "-3px", marginRight: 6 }} />
          {info.mensajePublico}
        </div>
      )}

      <Paso n={1} titulo="¿Cuántos son y qué día?" color={theme.primary}>
        <Row>
          <Col xs="5">
            <Input
              type="number"
              min="1"
              aria-label="Cantidad de personas"
              placeholder="Personas"
              value={personas}
              onChange={(e) => setPersonas(e.target.value)}
            />
          </Col>
          <Col xs="7">
            <Input type="date" aria-label="Fecha" min={info?.hoy} max={info?.hasta} value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </Col>
        </Row>
        {info?.diasAbiertos && (
          <small className="text-muted d-block mt-1">
            Recibimos reservas los {info.diasAbiertos.map((d) => DIAS_SEMANA[d].toLowerCase()).join(", ")}.
          </small>
        )}
        {info?.diasEspeciales?.length > 0 && (
          <div className="mt-3 rounded px-3 py-2" style={{ background: theme.primaryLight, color: theme.textDark }}>
            <div className="small font-weight-bold mb-1">Fechas especiales</div>
            {info.diasEspeciales.slice(0, 6).map((d) => (
              <div key={`${d.fecha}-${d.horaDesde || ""}`} className="small">
                <strong>{capitalizar(fechaLarga(d.fecha))}</strong>
                {d.motivo ? ` · ${d.motivo}` : ""} · {etiquetaEspecial(d)}
              </div>
            ))}
          </div>
        )}
      </Paso>

      {fecha && (n >= 1 || especial) && (
        <Paso n={2} titulo="Elige hora y sector" color={theme.primary}>
          {especial ? (
            <div className="rounded p-3 text-center" style={{ border: `1px solid ${theme.primary}55`, background: theme.primaryLight, color: theme.textDark }}>
              <div className="font-weight-bold mb-1">{especial.motivo || capitalizar(fechaLarga(fecha))}</div>
              <div className="small">
                {especial.tipo === "orden_llegada"
                  ? "Ese día atendemos solo por orden de llegada, sin reservas. No hace falta reservar: ¡te esperamos!"
                  : "Ese día no recibimos reservas. Prueba otra fecha."}
              </div>
            </div>
          ) : disp.cargando ? (
            <Spinner size="sm" style={{ color: theme.primary }} />
          ) : disp.grupoGrande || n > (info?.maxPersonas || Infinity) ? (
            <div className="alert alert-light border">
              Para grupos de más de {info?.maxPersonas} personas, contáctanos directamente
              {telefono ? (
                <>
                  : <a href={telLink(telefono)}>{telefono}</a>
                </>
              ) : (
                "."
              )}
            </div>
          ) : disp.cerrado || diaCerrado ? (
            <p className="text-muted mb-0">Ese día no recibimos reservas. Prueba otra fecha.</p>
          ) : disp.horas.length === 0 ? (
            <p className="text-muted mb-0">No quedan horas disponibles para ese día y ese grupo. Prueba otra fecha.</p>
          ) : (
            <>
              {disp.avisos.map((a) => (
                <div key={a} className="small rounded px-3 py-2 mb-2" style={{ background: theme.primaryLight, color: theme.textDark }}>
                  {a}
                </div>
              ))}
              {info?.mostrarCupos && (
                <div className="small text-muted mb-2">Cada sector muestra cuántos lugares quedan para esa hora.</div>
              )}
              <SelectorHoraSector
                horas={disp.horas}
                valor={eleccion}
                onChange={setEleccion}
                mostrarLibres={!!info?.mostrarCupos}
                colorPrimario={theme.primary}
              />
            </>
          )}
        </Paso>
      )}

      {eleccion.hora && !especial && (
        <Paso n={3} titulo="Tus datos" color={theme.primary}>
          <Row>
            <Col md="6">
              <FormGroup>
                <Label for="rm-nombre">Nombre</Label>
                <Input id="rm-nombre" value={datos.nombre} maxLength={80} autoComplete="name" onChange={(e) => setDato("nombre", e.target.value)} />
              </FormGroup>
            </Col>
            <Col md="6">
              <FormGroup>
                <Label for="rm-telefono">Teléfono</Label>
                <Input id="rm-telefono" type="tel" value={datos.telefono} maxLength={25} autoComplete="tel" placeholder="+56 9 ..." onChange={(e) => setDato("telefono", e.target.value)} />
              </FormGroup>
            </Col>
            <Col md="12">
              <FormGroup>
                <Label for="rm-email">Correo</Label>
                <Input id="rm-email" type="email" value={datos.email} maxLength={120} autoComplete="email" onChange={(e) => setDato("email", e.target.value)} />
                <small className="text-muted">Te enviaremos la confirmación aquí.</small>
              </FormGroup>
            </Col>
          </Row>

          <div className="custom-control custom-checkbox mb-2">
            <input id="pub-cumple" type="checkbox" className="custom-control-input" checked={cumple.es} onChange={(e) => setCumple((c) => ({ ...c, es: e.target.checked }))} />
            <label className="custom-control-label" htmlFor="pub-cumple">
              Vamos a celebrar un cumpleaños 🎂
            </label>
          </div>
          {cumple.es && (
            <>
              {info?.mensajeCumpleanos && (
                <div className="rounded px-3 py-2 mb-3 small" style={{ background: theme.primaryLight, color: theme.textDark, whiteSpace: "pre-line" }}>
                  🎂 {info.mensajeCumpleanos}
                </div>
              )}
              <Row>
                <Col md="5">
                  <FormGroup>
                    <Label for="rm-festejado">¿De quién?</Label>
                    <Input id="rm-festejado" value={cumple.festejado} maxLength={80} onChange={(e) => setCumple((c) => ({ ...c, festejado: e.target.value }))} />
                  </FormGroup>
                </Col>
                <Col md="7">
                  <FormGroup>
                    <Label for="rm-detalle">Algo que debamos saber (opcional)</Label>
                    <Input id="rm-detalle" value={cumple.detalle} maxLength={300} onChange={(e) => setCumple((c) => ({ ...c, detalle: e.target.value }))} />
                  </FormGroup>
                </Col>
              </Row>
            </>
          )}

          <FormGroup>
            <Label for="rm-comentarios">Comentarios (opcional)</Label>
            <Input id="rm-comentarios" type="textarea" rows="2" maxLength={500} value={datos.comentarios} placeholder="Silla de bebé, accesibilidad..." onChange={(e) => setDato("comentarios", e.target.value)} />
          </FormGroup>

          {/* Campo trampa para bots: invisible para personas */}
          <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
            <label htmlFor="sitioWeb">No llenar</label>
            <input id="sitioWeb" tabIndex={-1} autoComplete="off" value={datos.sitioWeb} onChange={(e) => setDato("sitioWeb", e.target.value)} />
          </div>

          {error && (
            <div className="alert alert-warning">
              {error}
              {alternativas.length > 0 && (
                <div className="mt-2">
                  Con lugar:{" "}
                  {alternativas.map((a) => (
                    <Button
                      key={`${a.hora}-${a.sectorId}`}
                      size="sm"
                      color="light"
                      className="m-1"
                      onClick={() => setEleccion({ hora: a.hora, sectorId: a.sectorId })}
                    >
                      {a.hora} · {a.sector}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          <Button
            block
            size="lg"
            disabled={!listo || enviando}
            onClick={reservar}
            style={{ background: theme.primary, borderColor: theme.primary, color: "#fff" }}
          >
            {enviando ? "Reservando..." : info?.confirmacionAutomatica ? "Confirmar reserva" : "Enviar solicitud"}
          </Button>
          {info?.cancelacion?.permitida && (
            <small className="text-muted d-block text-center mt-2">
              Podrás cancelar desde el link del correo hasta {info.cancelacion.horasLimite} hora(s) antes.
            </small>
          )}
        </Paso>
      )}
    </>,
  );
};

export default ReservarMesa;

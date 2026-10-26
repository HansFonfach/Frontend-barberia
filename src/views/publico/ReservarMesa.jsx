import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Card, CardBody, Col, Container, FormGroup, Input, Label, Row, Spinner } from "reactstrap";
import { CalendarCheck, Check, ChevronLeft, Info, MessageCircle, Phone } from "lucide-react";
import { useEmpresa } from "context/EmpresaContext";
import { construirTema } from "utils/temaEmpresa";
import { cargarFuentesRestaurante, marcaDe } from "utils/marcasRestaurante";
import SelectorHoraSector from "components/reservasMesa/SelectorHoraSector";
import {
  getInfoReservaMesaPublica,
  getDisponibilidadMesaPublica,
  postReservaMesaPublica,
} from "api/reservasMesa";
import { DIAS_SEMANA, capitalizar, fechaLarga, nuevaClave, sumarDias, telLink, whatsappLink } from "utils/reservasMesa";

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

const DISP_VACIA = { horas: [], cargando: false, grupoGrande: false, cerrado: false, avisos: [], diaEspecial: null, hayLugar: false };

/** Etiqueta corta de un día especial: "Solo por orden de llegada", "Sin reservas"... */
const etiquetaEspecial = (d) =>
  d.tipo === "orden_llegada"
    ? d.diaCompleto
      ? "Solo por orden de llegada"
      : d.horaHasta === "23:59"
        ? `Solo por orden de llegada desde las ${d.horaDesde}`
        : `Solo por orden de llegada entre las ${d.horaDesde} y las ${d.horaHasta}`
    : "Sin reservas";

const PASOS = ["Personas y día", "Hora", "Tus datos", "Confirmar"];
const MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
// Celular chileno (+56 9 XXXX XXXX): se puede ofrecer WhatsApp; a un fijo no.
const esCelularChile = (tel) => {
  const d = String(tel || "").replace(/\D/g, "");
  return /^(56)?9\d{8}$/.test(d);
};
const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || "").trim());

/** "2026-10-30" → { dia: "Vie", num: 30, mes: "oct" } */
const partesFecha = (fecha) => {
  const [, m, d] = fecha.split("-").map(Number);
  return { dia: DIAS_SEMANA[diaDe(fecha)].slice(0, 3), num: d, mes: MESES_CORTOS[m - 1] };
};

/** Indicador de pasos: los ya hechos se pueden tocar para volver. */
const Pasos = ({ paso, color, onIr }) => (
  <ol className="d-flex list-unstyled mb-4 p-0" style={{ gap: 6 }} aria-label="Pasos de la reserva">
    {PASOS.map((titulo, i) => {
      const n = i + 1;
      const hecho = n < paso;
      const actual = n === paso;
      return (
        <li key={titulo} style={{ flex: 1, minWidth: 0 }} aria-current={actual ? "step" : undefined}>
          <button
            type="button"
            disabled={!hecho}
            onClick={() => onIr(n)}
            className="w-100 border-0 bg-transparent p-0 text-center"
            style={{ cursor: hecho ? "pointer" : "default" }}
          >
            <div style={{ height: 4, borderRadius: 4, background: hecho || actual ? color : "#e4e7ec", marginBottom: 8 }} />
            <div className="d-flex align-items-center justify-content-center" style={{ gap: 6 }}>
              <span
                className="d-inline-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: 22,
                  height: 22,
                  flexShrink: 0,
                  fontSize: 12,
                  fontWeight: 700,
                  background: hecho || actual ? color : "#e4e7ec",
                  color: hecho || actual ? "#fff" : "#8a94a6",
                }}
              >
                {hecho ? <Check size={13} /> : n}
              </span>
              <span
                className="d-none d-sm-inline text-truncate"
                style={{ fontSize: 13, fontWeight: actual ? 700 : 500, color: actual ? "#2a1f16" : "#8a94a6" }}
              >
                {titulo}
              </span>
            </div>
          </button>
        </li>
      );
    })}
  </ol>
);

/** Botón tipo "ficha" para elegir personas o día. */
const Ficha = ({ activo, deshabilitado, color, onClick, children, titulo }) => (
  <button
    type="button"
    title={titulo}
    disabled={deshabilitado}
    onClick={onClick}
    aria-pressed={activo}
    style={{
      border: `1.5px solid ${activo ? color : "#dfe3ea"}`,
      background: activo ? color : deshabilitado ? "#f6f7f9" : "#fff",
      color: activo ? "#fff" : deshabilitado ? "#adb5bd" : "#2a1f16",
      borderRadius: 12,
      padding: "8px 4px",
      lineHeight: 1.15,
      cursor: deshabilitado ? "not-allowed" : "pointer",
      width: "100%",
      transition: "all .15s ease",
    }}
  >
    {children}
  </button>
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
  const [promos, setPromos] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [alternativas, setAlternativas] = useState([]);
  const [confirmada, setConfirmada] = useState(null);
  const [clave] = useState(nuevaClave);
  const [recarga, setRecarga] = useState(0);
  const [paso, setPaso] = useState(1);
  const [otraCantidad, setOtraCantidad] = useState(false);

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
            hayLugar: data.hayLugar !== false && (data.horas || []).length > 0,
            maxLibre: data.maxLibre,
          });
        }
      })
      .catch(() => vigente && setDisp(DISP_VACIA));
    return () => {
      vigente = false;
    };
  }, [slug, fecha, n, diaCerrado, recarga]);

  const setDato = (campo, valor) => setDatos((d) => ({ ...d, [campo]: valor }));

  const ir = (n) => {
    setPaso(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Próximos días en que se recibe reservas (fichas del paso 1)
  const proximosDias = useMemo(() => {
    if (!info?.hoy || !info?.diasAbiertos) return [];
    const dias = [];
    for (let i = 0, f = info.hoy; dias.length < 6 && i < 60 && f <= info.hasta; i += 1, f = sumarDias(info.hoy, i)) {
      if (info.diasAbiertos.includes(diaDe(f))) dias.push(f);
    }
    return dias;
  }, [info]);
  const especialDe = (f) => (info?.diasEspeciales || []).find((d) => d.fecha === f && d.diaCompleto);

  const maxPersonas = info?.maxPersonas || 0;
  const grupoGrande = n > maxPersonas && maxPersonas > 0;
  const sectorElegido = (info?.sectores || []).find((x) => String(x.id) === String(eleccion.sectorId));

  // Sectores con lugar, pero no suficiente para el grupo (ej: quedan 15 y son 16):
  // se muestran en gris y se invita a contactar al local.
  const hayInsuficientes = disp.horas.some((h) => h.sectores.some((x) => !x.disponible));
  const maxInsuficiente = info?.mostrarCupos
    ? Math.max(0, ...disp.horas.flatMap((h) => h.sectores.filter((x) => !x.disponible).map((x) => x.libre || 0)))
    : 0;

  const paso1Listo = n >= 1 && !grupoGrande && fecha && !diaCerrado && !especial;
  const paso2Listo = paso1Listo && eleccion.hora && eleccion.sectorId;
  const paso3Listo =
    datos.nombre.trim().length >= 2 && datos.telefono.replace(/\D/g, "").length >= 8 && emailValido(datos.email);
  const listo = paso2Listo && paso3Listo;

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
        aceptaPromociones: promos,
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
      // Si el problema es de fecha u hora, se vuelve al paso que corresponde
      if (["DIA_CERRADO", "BLOQUEADO", "MUY_PRONTO", "MUY_LEJOS", "HORA_FUERA_DE_HORARIO"].includes(d.code)) {
        setRecarga((x) => x + 1);
        setPaso(2);
      }
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

  const resumenArriba = paso > 1 && (
    <div
      className="d-flex flex-wrap align-items-center justify-content-between rounded px-3 py-2 mb-3 small"
      style={{ background: theme.primaryLight, color: theme.textDark, gap: 8 }}
    >
      <span>
        <strong>
          {n} persona{n === 1 ? "" : "s"}
        </strong>{" "}
        · {capitalizar(fechaLarga(fecha))}
        {paso > 2 && eleccion.hora && (
          <>
            {" "}
            · {eleccion.hora} · {sectorElegido?.nombre}
          </>
        )}
      </span>
      <button type="button" className="border-0 bg-transparent p-0" style={{ color: theme.primary, fontWeight: 600 }} onClick={() => ir(1)}>
        Cambiar
      </button>
    </div>
  );

  const botones = ({ siguiente, habilitado, texto = "Continuar", onSiguiente }) => (
    <div className="d-flex align-items-center mt-4" style={{ gap: 10 }}>
      {paso > 1 && (
        <Button outline className="m-0" style={{ borderColor: "#dfe3ea", color: theme.textDark }} onClick={() => ir(paso - 1)}>
          <ChevronLeft size={16} style={{ verticalAlign: "-3px" }} /> Atrás
        </Button>
      )}
      <Button
        size="lg"
        className="m-0 flex-grow-1"
        disabled={!habilitado}
        onClick={onSiguiente || (() => ir(siguiente))}
        style={{ background: theme.primary, borderColor: theme.primary, color: "#fff" }}
      >
        {texto}
      </Button>
    </div>
  );

  const textoContacto = `Hola, quería reservar para ${n} persona${n === 1 ? "" : "s"} el ${fechaLarga(fecha)}${
    eleccion.hora ? ` a las ${eleccion.hora}` : ""
  }. ¿Tienen espacio?`;
  const contactoLocal = (titulo, detalle) => (
    <div className="rounded p-3 mt-3" style={{ border: "1px dashed #d8c3a5", background: "#fffaf3", color: theme.textDark }}>
      <div className="font-weight-bold small mb-1">{titulo}</div>
      <div className="small mb-2">{detalle}</div>
      {telefono ? (
        <div className="d-flex flex-wrap" style={{ gap: 8 }}>
          {esCelularChile(telefono) && (
            <a
              className="btn btn-sm m-0"
              style={{ background: "#25d366", color: "#fff" }}
              href={whatsappLink(telefono, textoContacto)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={14} style={{ verticalAlign: "-2px" }} /> Escribir por WhatsApp
            </a>
          )}
          <a className="btn btn-sm btn-outline-secondary m-0" href={telLink(telefono)}>
            <Phone size={14} style={{ verticalAlign: "-2px" }} /> Llamar al {telefono}
          </a>
        </div>
      ) : (
        <div className="small text-muted">Contáctanos directamente en el local.</div>
      )}
    </div>
  );

  const avisoDiaEspecial = (d) => (
    <div className="rounded p-3 text-center mt-3" style={{ border: `1px solid ${theme.primary}55`, background: theme.primaryLight, color: theme.textDark }}>
      <div className="font-weight-bold mb-1">{d.motivo || capitalizar(fechaLarga(d.fecha))}</div>
      <div className="small">
        {d.tipo === "orden_llegada"
          ? "Ese día atendemos solo por orden de llegada, sin reservas. No hace falta reservar: ¡te esperamos!"
          : "Ese día no recibimos reservas. Prueba otra fecha."}
      </div>
    </div>
  );

  return contenedor(
    <>
      <Pasos paso={paso} color={theme.primary} onIr={ir} />

      {/* ── Paso 1: personas y día ── */}
      {paso === 1 && (
        <>
          {info?.mensajePublico && (
            <div className="alert mb-4" style={{ background: theme.primaryLight, color: theme.textDark, whiteSpace: "pre-line" }}>
              <Info size={16} style={{ verticalAlign: "-3px", marginRight: 6 }} />
              {info.mensajePublico}
            </div>
          )}

          <h2 className="h5 mb-3">¿Cuántos son?</h2>
          <div className="d-grid mb-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(52px, 1fr))", gap: 8 }}>
            {Array.from({ length: Math.min(8, maxPersonas || 8) }, (_, i) => i + 1).map((k) => (
              <Ficha
                key={k}
                activo={!otraCantidad && n === k}
                color={theme.primary}
                onClick={() => {
                  setOtraCantidad(false);
                  setPersonas(String(k));
                }}
              >
                <strong style={{ fontSize: 17 }}>{k}</strong>
              </Ficha>
            ))}
            <Ficha
              activo={otraCantidad}
              color={theme.primary}
              onClick={() => {
                setOtraCantidad(true);
                setPersonas("");
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600 }}>Más</span>
            </Ficha>
          </div>
          {otraCantidad && (
            <Input
              type="number"
              min="1"
              autoFocus
              aria-label="Cantidad de personas"
              placeholder="¿Cuántas personas?"
              value={personas}
              onChange={(e) => setPersonas(e.target.value)}
              style={{ maxWidth: 220 }}
              className="mb-2"
            />
          )}
          {grupoGrande && (
            <div className="alert alert-light border small">
              Para grupos de más de {maxPersonas} personas, contáctanos directamente
              {telefono ? (
                <>
                  : <a href={telLink(telefono)}>{telefono}</a>
                </>
              ) : (
                "."
              )}
            </div>
          )}

          <h2 className="h5 mt-4 mb-3">¿Qué día?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(76px, 1fr))", gap: 8 }}>
            {proximosDias.map((f) => {
              const p = partesFecha(f);
              const esp = especialDe(f);
              return (
                <Ficha
                  key={f}
                  activo={fecha === f}
                  color={theme.primary}
                  titulo={esp ? esp.mensaje : undefined}
                  onClick={() => setFecha(f)}
                >
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", opacity: 0.8 }}>
                    {f === info.hoy ? "Hoy" : f === sumarDias(info.hoy, 1) ? "Mañana" : p.dia}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{p.num}</div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>{esp ? "sin reservas" : p.mes}</div>
                </Ficha>
              );
            })}
          </div>
          <div className="d-flex align-items-center mt-3" style={{ gap: 10 }}>
            <span className="small text-muted">Otra fecha:</span>
            <Input
              type="date"
              aria-label="Fecha"
              min={info?.hoy}
              max={info?.hasta}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              style={{ maxWidth: 190 }}
              bsSize="sm"
            />
          </div>
          {info?.diasAbiertos && (
            <small className="text-muted d-block mt-2">
              Recibimos reservas los {info.diasAbiertos.map((d) => DIAS_SEMANA[d].toLowerCase()).join(", ")}.
            </small>
          )}
          {fecha && diaCerrado && <div className="alert alert-light border small mt-3 mb-0">Ese día no recibimos reservas. Prueba otra fecha.</div>}
          {fecha && especial && avisoDiaEspecial(especial)}
          {info?.diasEspeciales?.length > 0 && !especial && (
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

          {botones({ siguiente: 2, habilitado: paso1Listo, texto: "Ver horas disponibles" })}
        </>
      )}

      {/* ── Paso 2: hora y sector ── */}
      {paso === 2 && (
        <>
          {resumenArriba}
          <h2 className="h5 mb-3">Elige hora de llegada y sector</h2>
          {disp.cargando ? (
            <div className="text-center py-4">
              <Spinner style={{ color: theme.primary }} />
            </div>
          ) : especial ? (
            avisoDiaEspecial(especial)
          ) : disp.grupoGrande ? (
            <div className="alert alert-light border small">
              Para grupos de más de {maxPersonas} personas, contáctanos directamente
              {telefono ? (
                <>
                  : <a href={telLink(telefono)}>{telefono}</a>
                </>
              ) : (
                "."
              )}
            </div>
          ) : disp.cerrado ? (
            <div className="alert alert-light border small mb-0">Ese día no recibimos reservas. Prueba otra fecha.</div>
          ) : !disp.hayLugar ? (
            <>
              {disp.horas.length > 0 && (
                <SelectorHoraSector
                  horas={disp.horas}
                  valor={eleccion}
                  onChange={setEleccion}
                  mostrarLibres={!!info?.mostrarCupos}
                  etiquetaSinLugar={`sin lugar para ${n}`}
                  colorPrimario={theme.primary}
                />
              )}
              {contactoLocal(
                `Ese día ya no queda lugar para ${n} persona${n === 1 ? "" : "s"} en línea`,
                info?.mostrarCupos && disp.maxLibre > 0
                  ? `Quedan lugares para ${disp.maxLibre} persona${disp.maxLibre === 1 ? "" : "s"}. Si les falta poco, escríbenos y vemos si podemos hacerles espacio, o prueba otra fecha.`
                  : "Escríbenos y vemos si podemos hacerles espacio, o prueba otra fecha.",
              )}
            </>
          ) : (
            <>
              {disp.avisos.map((a) => (
                <div key={a} className="small rounded px-3 py-2 mb-2" style={{ background: theme.primaryLight, color: theme.textDark }}>
                  {a}
                </div>
              ))}
              {info?.mostrarCupos && <div className="small text-muted mb-2">Cada sector muestra cuántos lugares quedan para esa hora.</div>}
              <SelectorHoraSector
                horas={disp.horas}
                valor={eleccion}
                onChange={setEleccion}
                mostrarLibres={!!info?.mostrarCupos}
                etiquetaSinLugar={`sin lugar para ${n}`}
                colorPrimario={theme.primary}
              />
              {hayInsuficientes &&
                contactoLocal(
                  "¿Quieres un sector o una hora que aparece en gris?",
                  maxInsuficiente > 0
                    ? `Ahí no alcanza para ${n} en línea, pero si les falta poco (por ejemplo, quedan ${maxInsuficiente} y son ${n}), escríbenos y vemos si podemos hacerles espacio.`
                    : `Ahí no alcanza para ${n} en línea. Escríbenos y vemos si podemos hacerles espacio.`,
                )}
            </>
          )}
          {botones({ siguiente: 3, habilitado: paso2Listo })}
        </>
      )}

      {/* ── Paso 3: datos ── */}
      {paso === 3 && (
        <>
          {resumenArriba}
          <h2 className="h5 mb-3">Tus datos</h2>
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
                <Input
                  id="rm-email"
                  type="email"
                  value={datos.email}
                  maxLength={120}
                  autoComplete="email"
                  invalid={!!datos.email && !emailValido(datos.email)}
                  onChange={(e) => setDato("email", e.target.value)}
                />
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

          <div className="custom-control custom-checkbox mb-3">
            <input id="pub-promos" type="checkbox" className="custom-control-input" checked={promos} onChange={(e) => setPromos(e.target.checked)} />
            <label className="custom-control-label" htmlFor="pub-promos">
              Quiero recibir promociones y novedades de {nombreLocal || "este local"} por correo
              <small className="d-block text-muted">Opcional. Puedes darte de baja cuando quieras desde el mismo correo.</small>
            </label>
          </div>

          {/* Campo trampa para bots: invisible para personas */}
          <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
            <label htmlFor="sitioWeb">No llenar</label>
            <input id="sitioWeb" tabIndex={-1} autoComplete="off" value={datos.sitioWeb} onChange={(e) => setDato("sitioWeb", e.target.value)} />
          </div>

          {botones({ siguiente: 4, habilitado: paso3Listo, texto: "Revisar reserva" })}
        </>
      )}

      {/* ── Paso 4: confirmar ── */}
      {paso === 4 && (
        <>
          <h2 className="h5 mb-3">Revisa tu reserva</h2>
          <div className="border rounded mb-3" style={{ overflow: "hidden" }}>
            {[
              ["Día", capitalizar(fechaLarga(fecha)), 1],
              ["Personas", `${n} persona${n === 1 ? "" : "s"}`, 1],
              ["Hora de llegada", eleccion.hora, 2],
              ["Sector", sectorElegido?.nombre || "", 2],
              ["A nombre de", datos.nombre, 3],
              ["Contacto", `${datos.telefono} · ${datos.email}`, 3],
              ...(cumple.es ? [["Cumpleaños", `🎂 ${cumple.festejado || "Sí"}${cumple.detalle ? ` · ${cumple.detalle}` : ""}`, 3]] : []),
              ...(datos.comentarios ? [["Comentarios", datos.comentarios, 3]] : []),
            ].map(([etiqueta, valor, volverA], i) => (
              <div
                key={etiqueta}
                className="d-flex justify-content-between align-items-start px-3 py-2"
                style={{ gap: 12, borderTop: i ? "1px solid #eef0f4" : "none" }}
              >
                <div style={{ minWidth: 0 }}>
                  <div className="small text-muted">{etiqueta}</div>
                  <div style={{ fontWeight: 600, wordBreak: "break-word" }}>{valor}</div>
                </div>
                <button type="button" className="border-0 bg-transparent p-0 small" style={{ color: theme.primary, fontWeight: 600, flexShrink: 0 }} onClick={() => ir(volverA)}>
                  Cambiar
                </button>
              </div>
            ))}
          </div>

          {(info?.mensajePublico || (cumple.es && info?.mensajeCumpleanos)) && (
            <div className="rounded p-3 mb-3 small" style={{ background: theme.primaryLight, color: theme.textDark, whiteSpace: "pre-line" }}>
              {info.mensajePublico && (
                <div>
                  <Info size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
                  {info.mensajePublico}
                </div>
              )}
              {cumple.es && info.mensajeCumpleanos && <div className={info.mensajePublico ? "mt-2" : ""}>🎂 {info.mensajeCumpleanos}</div>}
            </div>
          )}
          {info?.toleranciaMinutos > 0 && (
            <p className="small text-muted mb-3">Guardamos tu lugar hasta {info.toleranciaMinutos} minutos después de la hora de llegada.</p>
          )}

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
                      onClick={() => {
                        setEleccion({ hora: a.hora, sectorId: a.sectorId });
                        setError("");
                        setAlternativas([]);
                      }}
                    >
                      {a.hora} · {a.sector}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          {botones({
            habilitado: listo && !enviando,
            texto: enviando ? "Reservando..." : info?.confirmacionAutomatica ? "Confirmar reserva" : "Enviar solicitud",
            onSiguiente: reservar,
          })}
          {info?.cancelacion?.permitida && (
            <small className="text-muted d-block text-center mt-2">
              Podrás cancelar desde el link del correo hasta {info.cancelacion.horasLimite} hora(s) antes.
            </small>
          )}
        </>
      )}
    </>,
  );
};

export default ReservarMesa;

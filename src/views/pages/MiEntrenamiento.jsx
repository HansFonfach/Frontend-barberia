import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Badge,
  Spinner,
  Alert,
  FormGroup,
  Label,
  Input,
  Button,
} from "reactstrap";
import {
  Dumbbell,
  Flame,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Trash2,
  CalendarClock,
  ScrollText,
  Plus,
} from "lucide-react";
import Swal from "sweetalert2";
import UserHeader from "components/Headers/UserHeader.js";
import { useEntrenamientoPersonal } from "context/EntrenamientoPersonalContext";
import BitacoraCorporal from "components/gimnasio/BitacoraCorporal";

/**
 * "Mi entrenamiento": bitácora libre de entrenamiento/deporte de uso
 * personal (modulos.entrenamientoPersonal) — sin horarios ni cupos, cada
 * quien anota lo que hizo cuando quiere. Pensada para el dueño de la
 * empresa (uso personal) y sus amigos invitados, no para clientes de un
 * gimnasio real con clases agendadas (eso es "Mi progreso").
 *
 * Todo lo que se muestra (racha, hitos, sugerencia del día, aviso de
 * constancia) sale de los registros reales — nada se inventa. Las
 * rutinas armadas de antemano viven en "Mi rutina" (MiRutina.jsx) y las
 * ideas de comida en "Plan alimenticio" (PlanAlimenticio.jsx) — separadas
 * para no llenar una sola página con todo.
 */

const HITOS_ICONOS = {
  10: "🥉",
  25: "🥈",
  50: "🥇",
  100: "🏆",
  200: "⭐",
  365: "🔥",
  500: "👑",
};

const ICONOS_TIPO = {
  pecho: "💪",
  espalda: "🏋️",
  piernas: "🦵",
  hombros: "🤸",
  brazos: "💪",
  core: "🔥",
  cardio: "🏃",
  futbol: "⚽",
  otro: "✨",
};

const TIPOS_ACTIVIDAD = [
  { key: "pecho", label: "Pecho" },
  { key: "espalda", label: "Espalda" },
  { key: "piernas", label: "Piernas" },
  { key: "hombros", label: "Hombros" },
  { key: "brazos", label: "Brazos" },
  { key: "core", label: "Core" },
  { key: "cardio", label: "Cardio" },
  { key: "futbol", label: "Fútbol" },
  { key: "otro", label: "Otro" },
];

const colorVariacion = (v) =>
  v === null || v === undefined ? "secondary" : v > 0 ? "success" : v < 0 ? "danger" : "secondary";

const IconoVariacion = ({ v }) => {
  if (v === null || v === undefined || v === 0) return <Minus size={14} />;
  return v > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />;
};

const hoyISO = () => new Date().toISOString().slice(0, 10);

const formatFecha = (fecha) =>
  new Date(fecha).toLocaleDateString("es-CL", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

const VENTANAS_HISTORIAL = [
  { dias: 7, label: "Última semana" },
  { dias: 30, label: "Último mes" },
  { dias: 90, label: "Últimos 3 meses" },
];

/* =======================================================
   Widget de sugerencia del día
======================================================= */
const SugerenciaHoy = ({ sugerencia }) => {
  if (!sugerencia) return null;
  const esDescanso = sugerencia.tipo === "descanso";
  return (
    <Card
      className="border-0 shadow-sm mb-4"
      style={{
        borderRadius: 16,
        background: esDescanso
          ? "linear-gradient(135deg, #2dce89 0%, #2dcecc 100%)"
          : "linear-gradient(135deg, #5e72e4 0%, #825ee4 100%)",
      }}
    >
      <CardBody className="p-4 text-center text-white">
        <div style={{ fontSize: 40 }}>
          {esDescanso ? "🧘" : ICONOS_TIPO[sugerencia.grupo] || "💪"}
        </div>
        <h2 className="font-weight-bold text-white mb-1">
          {esDescanso ? "Hoy toca descansar" : `Hoy te toca ${sugerencia.nombreGrupo}`}
        </h2>
        <p className="mb-0" style={{ opacity: 0.9 }}>
          {sugerencia.mensaje}
        </p>
      </CardBody>
    </Card>
  );
};

const FILA_EJERCICIO_VACIA = { nombre: "", pesoKg: "", series: "", repeticiones: "" };

/* =======================================================
   Formulario rápido para registrar una actividad
======================================================= */
const RegistrarActividadForm = ({ sugerencia, catalogo, onRegistrado }) => {
  const { crearRegistroEntrenamiento } = useEntrenamientoPersonal();
  const [tipoActividad, setTipoActividad] = useState("");
  const [duracionMinutos, setDuracionMinutos] = useState("");
  const [notas, setNotas] = useState("");
  const [fecha, setFecha] = useState(hoyISO());
  const [ejercicios, setEjercicios] = useState([]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (sugerencia?.tipo === "grupo" && !tipoActividad) {
      setTipoActividad(sugerencia.grupo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sugerencia]);

  const agregarFilaEjercicio = () => setEjercicios((f) => [...f, { ...FILA_EJERCICIO_VACIA }]);
  const quitarFilaEjercicio = (idx) => setEjercicios((f) => f.filter((_, i) => i !== idx));
  const cambiarFilaEjercicio = (idx, campo, valor) =>
    setEjercicios((f) => f.map((fila, i) => (i === idx ? { ...fila, [campo]: valor } : fila)));

  const handleGuardar = async () => {
    if (!tipoActividad) {
      return Swal.fire("Falta info", "Elige qué entrenaste (o jugaste)", "warning");
    }
    setGuardando(true);
    try {
      const ejerciciosLimpios = ejercicios
        .filter((e) => e.nombre.trim())
        .map((e) => ({
          nombre: e.nombre.trim(),
          pesoKg: e.pesoKg === "" ? null : Number(e.pesoKg),
          series: e.series === "" ? null : Number(e.series),
          repeticiones: e.repeticiones === "" ? null : Number(e.repeticiones),
        }));

      await crearRegistroEntrenamiento({
        fecha: new Date(`${fecha}T12:00:00`).toISOString(),
        tipoActividad,
        duracionMinutos: duracionMinutos === "" ? null : Number(duracionMinutos),
        notas,
        ejercicios: ejerciciosLimpios,
      });
      setDuracionMinutos("");
      setNotas("");
      setFecha(hoyISO());
      setEjercicios([]);
      onRegistrado && onRegistrado();
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo guardar el registro",
        "error",
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <datalist id="catalogo-ejercicios">
        {(catalogo || []).map((nombre) => (
          <option key={nombre} value={nombre} />
        ))}
      </datalist>

      <Row>
        <Col md="4">
          <FormGroup>
            <Label className="small font-weight-bold">¿Qué hiciste?</Label>
            <Input
              type="select"
              value={tipoActividad}
              onChange={(e) => setTipoActividad(e.target.value)}
            >
              <option value="">Selecciona...</option>
              {TIPOS_ACTIVIDAD.map((t) => (
                <option key={t.key} value={t.key}>
                  {ICONOS_TIPO[t.key]} {t.label}
                </option>
              ))}
            </Input>
          </FormGroup>
        </Col>
        <Col md="3" xs="6">
          <FormGroup>
            <Label className="small font-weight-bold">Fecha</Label>
            <Input type="date" value={fecha} max={hoyISO()} onChange={(e) => setFecha(e.target.value)} />
          </FormGroup>
        </Col>
        <Col md="2" xs="6">
          <FormGroup>
            <Label className="small font-weight-bold">Minutos</Label>
            <Input
              type="number"
              min="0"
              value={duracionMinutos}
              onChange={(e) => setDuracionMinutos(e.target.value)}
              placeholder="Ej: 60"
            />
          </FormGroup>
        </Col>
        <Col md="3">
          <FormGroup>
            <Label className="small font-weight-bold">Notas (opcional)</Label>
            <Input
              type="text"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej: me sentí bien hoy"
            />
          </FormGroup>
        </Col>
      </Row>

      {/* ── Detalle por máquina/ejercicio (opcional) ── */}
      <div className="mt-2 mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Label className="small font-weight-bold mb-0">
            Máquinas/ejercicios usados (opcional)
          </Label>
          <Button size="sm" color="link" className="p-0" onClick={agregarFilaEjercicio}>
            <Plus size={14} /> Agregar
          </Button>
        </div>

        {ejercicios.length === 0 ? (
          <p className="text-muted small mb-0">
            Si quieres, anota qué máquina/ejercicio usaste y con cuánto peso — así
            más adelante te avisamos si es buen momento para subirlo.
          </p>
        ) : (
          ejercicios.map((fila, idx) => (
            <Row key={idx} className="align-items-end mb-2">
              <Col xs="12" sm="5">
                <Input
                  type="text"
                  list="catalogo-ejercicios"
                  placeholder="Ej: Prensa de piernas"
                  value={fila.nombre}
                  onChange={(e) => cambiarFilaEjercicio(idx, "nombre", e.target.value)}
                />
              </Col>
              <Col xs="4" sm="2">
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="Kg"
                  value={fila.pesoKg}
                  onChange={(e) => cambiarFilaEjercicio(idx, "pesoKg", e.target.value)}
                />
              </Col>
              <Col xs="4" sm="2">
                <Input
                  type="number"
                  min="0"
                  placeholder="Series"
                  value={fila.series}
                  onChange={(e) => cambiarFilaEjercicio(idx, "series", e.target.value)}
                />
              </Col>
              <Col xs="3" sm="2">
                <Input
                  type="number"
                  min="0"
                  placeholder="Reps"
                  value={fila.repeticiones}
                  onChange={(e) => cambiarFilaEjercicio(idx, "repeticiones", e.target.value)}
                />
              </Col>
              <Col xs="1">
                <Button
                  size="sm"
                  color="link"
                  className="text-danger p-0"
                  onClick={() => quitarFilaEjercicio(idx)}
                >
                  <Trash2 size={14} />
                </Button>
              </Col>
            </Row>
          ))
        )}
      </div>

      <Button
        block
        color="success"
        disabled={guardando}
        onClick={handleGuardar}
        className="font-weight-bold"
      >
        {guardando ? "Guardando..." : "Registrar actividad"}
      </Button>
    </>
  );
};

/* =======================================================
   Historial de actividad: diario/semanal/mensual según la ventana
   elegida. Agrupado por semana calendario para que sea fácil ver de un
   vistazo cuántos días entrenaste cada semana.
======================================================= */
const HistorialActividad = () => {
  const { misRegistrosEntrenamiento, eliminarRegistroEntrenamiento } = useEntrenamientoPersonal();
  const [dias, setDias] = useState(30);
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargar = async (d) => {
    setCargando(true);
    const data = await misRegistrosEntrenamiento(d);
    setRegistros(data);
    setCargando(false);
  };

  useEffect(() => {
    cargar(dias);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dias]);

  const handleEliminar = async (registro) => {
    const confirmacion = await Swal.fire({
      title: "¿Eliminar este registro?",
      text: `${ICONOS_TIPO[registro.tipoActividad] || ""} ${registro.tipoActividad} — ${formatFecha(registro.fecha)}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#f5365c",
    });
    if (!confirmacion.isConfirmed) return;
    try {
      await eliminarRegistroEntrenamiento(registro._id);
      cargar(dias);
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo eliminar el registro",
        "error",
      );
    }
  };

  // Agrupa por semana calendario (lunes-domingo), más reciente primero.
  const grupos = [];
  const ordenados = [...registros].reverse(); // más reciente primero
  for (const r of ordenados) {
    const inicioSemana = new Date(r.fecha);
    const dia = inicioSemana.getDay(); // 0=domingo
    const offset = dia === 0 ? 6 : dia - 1; // lunes como inicio
    inicioSemana.setDate(inicioSemana.getDate() - offset);
    const claveSemana = inicioSemana.toISOString().slice(0, 10);

    let grupo = grupos.find((g) => g.clave === claveSemana);
    if (!grupo) {
      grupo = { clave: claveSemana, inicio: inicioSemana, registros: [] };
      grupos.push(grupo);
    }
    grupo.registros.push(r);
  }

  return (
    <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
      <CardBody className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap" style={{ gap: 8 }}>
          <div className="d-flex align-items-center">
            <ScrollText size={20} className="text-primary mr-2" />
            <h4 className="mb-0">Historial de actividad</h4>
          </div>
          <Input
            type="select"
            style={{ width: "auto" }}
            value={dias}
            onChange={(e) => setDias(Number(e.target.value))}
          >
            {VENTANAS_HISTORIAL.map((v) => (
              <option key={v.dias} value={v.dias}>
                {v.label}
              </option>
            ))}
          </Input>
        </div>

        {cargando ? (
          <div className="text-center py-4">
            <Spinner color="primary" size="sm" />
          </div>
        ) : registros.length === 0 ? (
          <p className="text-muted small mb-0">
            No tienes actividades registradas en este período.
          </p>
        ) : (
          <>
            <p className="text-muted small mb-3">
              {registros.length} actividad{registros.length !== 1 ? "es" : ""} en este período,
              agrupadas por semana.
            </p>
            {grupos.map((g) => (
              <div key={g.clave} className="mb-3">
                <p className="text-muted small font-weight-bold mb-2" style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Semana del {g.inicio.toLocaleDateString("es-CL", { day: "2-digit", month: "short" })} · {g.registros.length} actividad{g.registros.length !== 1 ? "es" : ""}
                </p>
                <div className="d-flex flex-wrap" style={{ gap: 8 }}>
                  {g.registros.map((r) => (
                    <Badge
                      key={r._id}
                      pill
                      color="light"
                      className="d-flex align-items-center border"
                      style={{ padding: "8px 12px", fontSize: 13 }}
                    >
                      {ICONOS_TIPO[r.tipoActividad]}{" "}
                      <span className="mx-1">
                        {formatFecha(r.fecha)} · {r.tipoActividad}
                        {r.duracionMinutos ? ` · ${r.duracionMinutos} min` : ""}
                        {r.ejercicios?.length
                          ? ` · ${r.ejercicios
                              .map((e) => `${e.nombre}${e.pesoKg != null ? ` ${e.pesoKg}kg` : ""}`)
                              .join(", ")}`
                          : ""}
                      </span>
                      <Trash2
                        size={13}
                        className="text-danger ml-1"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleEliminar(r)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </CardBody>
    </Card>
  );
};

const MiEntrenamiento = () => {
  const { miProgresoEntrenamiento, eliminarRegistroEntrenamiento, catalogoEjercicios } =
    useEntrenamientoPersonal();

  const [progreso, setProgreso] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [catalogo, setCatalogo] = useState([]);

  const cargarProgreso = async () => {
    setCargando(true);
    const data = await miProgresoEntrenamiento();
    setProgreso(data);
    setCargando(false);
  };

  useEffect(() => {
    cargarProgreso();
    catalogoEjercicios().then(setCatalogo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEliminarRegistro = async (registro) => {
    const confirmacion = await Swal.fire({
      title: "¿Eliminar este registro?",
      text: `${ICONOS_TIPO[registro.tipoActividad] || ""} ${registro.tipoActividad}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#f5365c",
    });
    if (!confirmacion.isConfirmed) return;
    try {
      await eliminarRegistroEntrenamiento(registro._id);
      cargarProgreso();
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo eliminar el registro",
        "error",
      );
    }
  };

  return (
    <>
      <UserHeader />
      <Container className="mt--7 mb-5" fluid>
        <Row className="justify-content-center">
          <Col xl="10" lg="11">
            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
              <CardBody className="text-center py-5">
                <div className="bg-primary rounded-circle d-inline-flex p-3 mb-3 shadow-sm">
                  <Dumbbell size={28} className="text-white" />
                </div>
                <h1 className="font-weight-bold display-4">Mi entrenamiento</h1>
                <p className="text-muted lead mb-0">
                  Gimnasio, fútbol o lo que hagas — tu registro libre, sin horarios
                </p>
              </CardBody>
            </Card>

            {cargando ? (
              <div className="text-center py-5">
                <Spinner color="primary" />
              </div>
            ) : (
              <>
                {progreso.avisoConstancia && (
                  <Alert color="warning" className="d-flex align-items-center" style={{ borderRadius: 12 }}>
                    <CalendarClock size={20} className="mr-2 flex-shrink-0" />
                    Llevas {progreso.diasSinActividad} días sin registrar actividad — ¡dale, aunque sea algo corto hoy!
                  </Alert>
                )}

                <SugerenciaHoy sugerencia={progreso.sugerencia} />

                {/* ===== RACHA + RESUMEN MENSUAL ===== */}
                <Row className="mb-4">
                  <Col md="6" className="mb-4 mb-md-0">
                    <Card className="border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
                      <CardBody className="p-4 text-center">
                        <Flame size={32} className="text-warning mb-2" />
                        {progreso.rachaSemanas > 0 ? (
                          <>
                            <h2 className="font-weight-bold mb-0">
                              {progreso.rachaSemanas} semana
                              {progreso.rachaSemanas !== 1 ? "s" : ""} seguida
                              {progreso.rachaSemanas !== 1 ? "s" : ""}
                            </h2>
                            <p className="text-muted small mb-0">
                              con actividad al menos 1 vez por semana
                            </p>
                          </>
                        ) : (
                          <>
                            <h2 className="font-weight-bold mb-0 text-muted">Sin racha activa</h2>
                            <p className="text-muted small mb-0">
                              registra algo esta semana para empezar una
                            </p>
                          </>
                        )}
                      </CardBody>
                    </Card>
                  </Col>

                  <Col md="6">
                    <Card className="border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
                      <CardBody className="p-4 text-center">
                        <p className="text-muted small mb-1">Actividades este mes</p>
                        <h2 className="font-weight-bold mb-1">{progreso.esteMes}</h2>
                        <Badge color={colorVariacion(progreso.variacionMes)} pill>
                          <IconoVariacion v={progreso.variacionMes} />{" "}
                          {progreso.variacionMes === null
                            ? "Sin mes anterior para comparar"
                            : `${progreso.variacionMes > 0 ? "+" : ""}${progreso.variacionMes}% vs. mes anterior (${progreso.mesAnterior})`}
                        </Badge>
                        {progreso.minutosEsteMes > 0 && (
                          <p className="text-muted small mt-2 mb-0">
                            {progreso.minutosEsteMes} minutos acumulados este mes
                          </p>
                        )}
                      </CardBody>
                    </Card>
                  </Col>
                </Row>

                {/* ===== HITOS ===== */}
                <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
                  <CardBody className="p-4">
                    <div className="d-flex align-items-center mb-3">
                      <Trophy size={20} className="text-warning mr-2" />
                      <h4 className="mb-0">Hitos</h4>
                    </div>

                    {progreso.totalHistorico === 0 ? (
                      <p className="text-muted small mb-0">
                        Todavía no tienes actividades registradas. Cuando registres la
                        primera, tus hitos van a ir apareciendo acá.
                      </p>
                    ) : (
                      <>
                        <div className="d-flex flex-wrap" style={{ gap: 12 }}>
                          {progreso.hitos.map((h) => (
                            <div
                              key={h.valor}
                              className="text-center"
                              style={{
                                minWidth: 84,
                                padding: "10px 6px",
                                borderRadius: 12,
                                border: h.alcanzado ? "2px solid #5e72e4" : "2px solid #e9ecef",
                                background: h.alcanzado ? "#EDEFFD" : "#fafafa",
                                opacity: h.alcanzado ? 1 : 0.6,
                              }}
                            >
                              <div style={{ fontSize: 22 }}>{HITOS_ICONOS[h.valor] || "🎯"}</div>
                              <strong style={{ fontSize: 13 }}>{h.valor}</strong>
                            </div>
                          ))}
                        </div>
                        <p className="text-muted small mt-3 mb-0">
                          Llevas <strong>{progreso.totalHistorico}</strong> actividades en
                          total.{" "}
                          {progreso.proximoHito
                            ? `Te faltan ${progreso.faltanParaProximoHito} para llegar a ${progreso.proximoHito}.`
                            : "¡Ya alcanzaste todos los hitos disponibles!"}
                        </p>
                      </>
                    )}
                  </CardBody>
                </Card>

                {/* ===== SUGERENCIAS DE PESO POR EJERCICIO ===== */}
                {progreso.sugerenciasPeso?.length > 0 && (
                  <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
                    <CardBody className="p-4">
                      <div className="d-flex align-items-center mb-2">
                        <TrendingUp size={20} className="text-success mr-2" />
                        <h4 className="mb-0">Momento de subir peso</h4>
                      </div>
                      <p className="text-muted small mb-3">
                        Basado en lo que llevas registrando — es solo una idea, no una
                        regla. Si estás en un período de bajar grasa, es normal que la
                        fuerza avance más lento o se estanque un poco; súbelo solo si te
                        sientes cómodo.
                      </p>
                      {progreso.sugerenciasPeso.map((s) => (
                        <Alert key={s.nombre} color="success" style={{ borderRadius: 12 }} className="mb-2">
                          {s.mensaje}
                        </Alert>
                      ))}
                    </CardBody>
                  </Card>
                )}

                {/* ===== REGISTRAR ACTIVIDAD ===== */}
                <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
                  <CardBody className="p-4">
                    <h4 className="mb-3">Registrar actividad</h4>
                    <RegistrarActividadForm
                      sugerencia={progreso.sugerencia}
                      catalogo={catalogo}
                      onRegistrado={() => {
                        cargarProgreso();
                        catalogoEjercicios().then(setCatalogo);
                      }}
                    />

                    {progreso.registrosHoy.length > 0 && (
                      <div className="mt-4">
                        <p className="text-muted small mb-2">Hoy ya registraste:</p>
                        <div className="d-flex flex-wrap" style={{ gap: 8 }}>
                          {progreso.registrosHoy.map((r) => (
                            <Badge
                              key={r._id}
                              pill
                              color="light"
                              className="d-flex align-items-center border"
                              style={{ padding: "8px 12px", fontSize: 13 }}
                            >
                              {ICONOS_TIPO[r.tipoActividad]}{" "}
                              <span className="mx-1">
                                {r.tipoActividad}
                                {r.duracionMinutos ? ` · ${r.duracionMinutos} min` : ""}
                              </span>
                              <Trash2
                                size={13}
                                className="text-danger ml-1"
                                style={{ cursor: "pointer" }}
                                onClick={() => handleEliminarRegistro(r)}
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>

                {/* ===== HISTORIAL (diario/semanal/mensual) ===== */}
                <HistorialActividad />

                {/* ===== BITÁCORA (compartida con Mi progreso) ===== */}
                <BitacoraCorporal />
              </>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default MiEntrenamiento;

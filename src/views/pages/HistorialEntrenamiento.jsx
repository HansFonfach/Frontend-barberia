import React, { useState } from "react";
import { Container, Row, Col, Card, CardBody, Badge, Spinner, Button } from "reactstrap";
import { History, ChevronLeft, TrendingUp, TrendingDown, Minus, CalendarClock } from "lucide-react";
import UserHeader from "components/Headers/UserHeader.js";
import { useEntrenamientoPersonal } from "context/EntrenamientoPersonalContext";

/**
 * "Historial": a diferencia de "Mi entrenamiento" (todos los registros
 * mezclados, agrupados por semana), acá se elige un grupo puntual (ej:
 * Pecho) y se ve (a) la progresión de peso por ejercicio dentro de ese
 * grupo — para responder "¿cuánto he ido subiendo en la Prensa de
 * piernas?" — y (b) el historial de sesiones completas de ese grupo, de
 * más reciente a más antigua. Es el mismo RegistroEntrenamiento que ya
 * usa "Mi entrenamiento", solo que mirado de otra forma — no se guarda
 * ningún dato nuevo acá.
 */

const ICONOS_GRUPO = {
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

const GRUPOS = [
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

const formatFecha = (fecha) =>
  new Date(fecha).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });

const IconoDelta = ({ v }) => {
  if (v === null || v === undefined || v === 0) return <Minus size={13} />;
  return v > 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />;
};

/* =======================================================
   Progresión de un ejercicio: línea de tiempo de pesos dentro del grupo
   elegido. El delta es un dato puro (sin colorear verde/rojo, mismo
   criterio que la comparativa de bitácora) — subir o bajar de peso no es
   "bueno" ni "malo" en sí mismo, cada quien sabe su objetivo.
======================================================= */
const ProgresionEjercicio = ({ ejercicio }) => (
  <Card className="border shadow-none mb-3" style={{ borderRadius: 12 }}>
    <CardBody className="p-3">
      <div className="d-flex justify-content-between align-items-center flex-wrap" style={{ gap: 8 }}>
        <strong>{ejercicio.nombre}</strong>
        {ejercicio.deltaKg != null && (
          <Badge color="light" pill className="border d-flex align-items-center" style={{ gap: 4 }}>
            <IconoDelta v={ejercicio.deltaKg} />
            {ejercicio.deltaKg > 0 ? "+" : ""}
            {ejercicio.deltaKg}kg desde el primer registro
          </Badge>
        )}
      </div>
      <div className="d-flex flex-wrap align-items-center mt-2" style={{ gap: 6 }}>
        {ejercicio.historial.map((h, i) => (
          <React.Fragment key={i}>
            <Badge color="secondary" pill style={{ fontWeight: 400 }}>
              {formatFecha(h.fecha)} · {h.pesoKg}kg
              {h.series != null ? ` · ${h.series}x${h.repeticiones ?? "?"}` : ""}
            </Badge>
            {i < ejercicio.historial.length - 1 && <span className="text-muted small">→</span>}
          </React.Fragment>
        ))}
      </div>
    </CardBody>
  </Card>
);

/* =======================================================
   Una sesión del historial del grupo elegido.
======================================================= */
const SesionHistorial = ({ registro }) => (
  <Card className="border shadow-none mb-2" style={{ borderRadius: 12 }}>
    <CardBody className="p-3">
      <div className="d-flex align-items-center" style={{ gap: 6 }}>
        <CalendarClock size={14} className="text-muted" />
        <strong style={{ fontSize: 14 }}>{formatFecha(registro.fecha)}</strong>
        {registro.duracionMinutos ? (
          <span className="text-muted small">· {registro.duracionMinutos} min</span>
        ) : null}
      </div>
      {registro.ejercicios?.length > 0 ? (
        <ul className="small text-muted mt-2 mb-0 pl-3">
          {registro.ejercicios.map((e, i) => (
            <li key={i}>
              {e.nombre}
              {e.pesoKg != null ? ` — ${e.pesoKg}kg` : ""}
              {e.series != null ? ` · ${e.series}x${e.repeticiones ?? "?"}` : ""}
            </li>
          ))}
        </ul>
      ) : (
        <p className="small text-muted mt-2 mb-0">Sin detalle de ejercicios.</p>
      )}
      {registro.notas && <p className="small text-muted mt-2 mb-0">📝 {registro.notas}</p>}
    </CardBody>
  </Card>
);

const HistorialEntrenamiento = () => {
  const { historialPorGrupo } = useEntrenamientoPersonal();
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [historial, setHistorial] = useState(null);
  const [cargando, setCargando] = useState(false);

  const elegirGrupo = async (grupo) => {
    setGrupoSeleccionado(grupo);
    setCargando(true);
    const data = await historialPorGrupo(grupo);
    setHistorial(data);
    setCargando(false);
  };

  const volver = () => {
    setGrupoSeleccionado(null);
    setHistorial(null);
  };

  return (
    <>
      <UserHeader />
      <Container className="mt--7 mb-5" fluid>
        <Row className="justify-content-center">
          <Col xl="10" lg="11">
            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
              <CardBody className="text-center py-5">
                <div className="bg-warning rounded-circle d-inline-flex p-3 mb-3 shadow-sm">
                  <History size={28} className="text-white" />
                </div>
                <h1 className="font-weight-bold display-4">Historial</h1>
                <p className="text-muted lead mb-0">
                  Elige un grupo para ver tu progreso máquina por máquina
                </p>
              </CardBody>
            </Card>

            {!grupoSeleccionado ? (
              <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
                <CardBody className="p-4">
                  <Row>
                    {GRUPOS.map((g) => (
                      <Col xs="6" md="4" key={g.key} className="mb-3">
                        <Button
                          block
                          outline
                          color="secondary"
                          className="py-3"
                          style={{ borderRadius: 12 }}
                          onClick={() => elegirGrupo(g.key)}
                        >
                          <div style={{ fontSize: 24 }}>{ICONOS_GRUPO[g.key]}</div>
                          {g.label}
                        </Button>
                      </Col>
                    ))}
                  </Row>
                </CardBody>
              </Card>
            ) : (
              <>
                <Button color="link" className="pl-0 mb-2 text-muted" onClick={volver}>
                  <ChevronLeft size={16} /> Elegir otro grupo
                </Button>

                {cargando ? (
                  <div className="text-center py-5">
                    <Spinner color="warning" />
                  </div>
                ) : (
                  <>
                    <h3 className="mb-3">
                      {ICONOS_GRUPO[grupoSeleccionado]} {historial?.nombreGrupo}
                    </h3>

                    <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
                      <CardBody className="p-4">
                        <h4 className="mb-3">Progresión por ejercicio</h4>
                        {!historial?.progresionPorEjercicio || historial.progresionPorEjercicio.length === 0 ? (
                          <p className="text-muted small mb-0">
                            Todavía no hay suficientes registros con peso anotado para{" "}
                            {historial?.nombreGrupo?.toLowerCase()} — anota el peso al registrar en "Mi
                            entrenamiento" para ver la progresión acá.
                          </p>
                        ) : (
                          historial.progresionPorEjercicio.map((ej, i) => (
                            <ProgresionEjercicio key={i} ejercicio={ej} />
                          ))
                        )}
                      </CardBody>
                    </Card>

                    <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
                      <CardBody className="p-4">
                        <h4 className="mb-3">
                          Historial de sesiones{" "}
                          <span className="text-muted small font-weight-normal">
                            ({historial?.registros?.length || 0})
                          </span>
                        </h4>
                        {!historial?.registros || historial.registros.length === 0 ? (
                          <p className="text-muted small mb-0">
                            Todavía no tienes registros de {historial?.nombreGrupo?.toLowerCase()}.
                          </p>
                        ) : (
                          historial.registros.map((r) => <SesionHistorial key={r._id} registro={r} />)
                        )}
                      </CardBody>
                    </Card>
                  </>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default HistorialEntrenamiento;

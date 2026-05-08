// src/views/admin/pages/GestionHorarios.jsx
import React, { useState, useMemo } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Badge,
  Spinner,
  Alert,
} from "reactstrap";
import { PlusCircle, Calendar, Clock } from "lucide-react";

import UserHeader from "components/Headers/UserHeader";
import { useAuth } from "context/AuthContext";
import { useHorario } from "context/HorarioContext";
import { useGestionHorariosAdmin } from "hooks/useGestionHorariosAdmin";

const GestionHorarios = () => {
  const { user, isAuthenticated } = useAuth();
  const barbero = user?.id || user?._id;

  const { agregarHoraExtraDiaria, cancelarHoraExtraDiaria, toggleHoraPorDia } =
    useHorario();

  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [nuevaHora, setNuevaHora] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  const {
    todasLasHoras,
    horasExtra,
    horasCanceladas,
    cargando,
    error,
    refetch,
    infoFeriado,
    horasAdmin,
  } = useGestionHorariosAdmin(barbero, fechaSeleccionada);

  // Verificar si es hoy
  const esHoy = useMemo(() => {
    const hoy = new Date().toISOString().split("T")[0];
    return fechaSeleccionada === hoy;
  }, [fechaSeleccionada]);

  // Filtrar horas pasadas (solo si es hoy)
  const filtrarHorasFuturas = (horas) => {
    if (!esHoy) return horas;

    const ahora = new Date();
    const horaActual = ahora.getHours();
    const minutoActual = ahora.getMinutes();

    return horas.filter((item) => {
      const [hora, minuto] = item.hora.split(":").map(Number);
      if (hora > horaActual) return true;
      if (hora === horaActual && minuto >= minutoActual - 30) return true;
      return false;
    });
  };

  // Agrupar bloques consecutivos de la misma reserva
  const agruparBloques = (horas) => {
    if (!horas || horas.length === 0) return [];

    const grupos = [];
    let grupoActual = null;

    for (let i = 0; i < horas.length; i++) {
      const actual = horas[i];

      if (grupoActual === null) {
        grupoActual = { ...actual, horas: [actual.hora] };
      } else {
        const horaAnteriorNum = parseInt(
          grupoActual.horas[grupoActual.horas.length - 1].split(":")[0],
        );
        const horaActualNum = parseInt(actual.hora.split(":")[0]);

        const esMismaReserva =
          actual.estado === "reservada" &&
          grupoActual.estado === "reservada" &&
          actual.reserva?._id === grupoActual.reserva?._id;

        if (esMismaReserva && horaActualNum - horaAnteriorNum === 1) {
          grupoActual.horas.push(actual.hora);
        } else {
          grupos.push(grupoActual);
          grupoActual = { ...actual, horas: [actual.hora] };
        }
      }
    }

    if (grupoActual) grupos.push(grupoActual);
    return grupos;
  };

  const horasCanceladasSet = useMemo(
    () => new Set(horasCanceladas),
    [horasCanceladas],
  );
  const horasExtraSet = useMemo(
    () => new Set(horasExtra.map((h) => h.hora)),
    [horasExtra],
  );

  // Horas filtradas y agrupadas
  const horasAgrupadas = useMemo(() => {
    const horasFiltradas = filtrarHorasFuturas(horasAdmin);
    return agruparBloques(horasFiltradas);
  }, [horasAdmin, esHoy]);

  const onToggleHora = async (hora) => {
    try {
      setMensajeError("");
      const esBloqueada = horasCanceladasSet.has(hora);

      if (infoFeriado) {
        if (esBloqueada) {
          await agregarHoraExtraDiaria(barbero, fechaSeleccionada, hora);
          setMensaje(`Hora ${hora} habilitada para el feriado`);
        } else {
          await cancelarHoraExtraDiaria(barbero, fechaSeleccionada, hora);
          setMensaje(`Hora ${hora} bloqueada nuevamente`);
        }
      } else {
        await toggleHoraPorDia(hora, fechaSeleccionada, barbero);
        setMensaje(`Hora ${hora} ${esBloqueada ? "reactivada" : "cancelada"}`);
      }

      await refetch();
    } catch (err) {
      setMensajeError(`Error al actualizar hora ${hora}`);
    }
  };

  const onAgregarHoraExtra = async () => {
    if (!nuevaHora) {
      setMensajeError("Selecciona una hora");
      return;
    }

    if (horasExtraSet.has(nuevaHora)) {
      setMensajeError(`La hora ${nuevaHora} ya está agregada como extra`);
      return;
    }

    try {
      setMensajeError("");
      await agregarHoraExtraDiaria(barbero, fechaSeleccionada, nuevaHora);
      setNuevaHora("");
      setMensaje(`Hora extra ${nuevaHora} agregada correctamente`);
      await refetch();
    } catch (err) {
      setMensajeError(`Error al agregar hora extra ${nuevaHora}`);
      console.error(err);
    }
  };

  const onEliminarHoraExtra = async (hora) => {
    try {
      setMensajeError("");
      await cancelarHoraExtraDiaria(barbero, fechaSeleccionada, hora);
      setMensaje(`Hora extra ${hora} eliminada correctamente`);
      await refetch();
    } catch (err) {
      setMensajeError(`Error al eliminar hora extra ${hora}`);
      console.error(err);
    }
  };

  if (!isAuthenticated) {
    return (
      <Container className="mt--7 mb-5 text-center">
        <Spinner />
      </Container>
    );
  }

  return (
    <>
      <UserHeader />
      <Container className="mt--7 mb-5" style={{ maxWidth: "1000px" }}>
        <Card>
          <CardHeader className="bg-gradient-primary text-white d-flex align-items-center">
            <Calendar className="me-2" size={20} />
            <h5 className="mb-0 text-white">Gestión de Horarios</h5>
          </CardHeader>

          <CardBody>
            {mensaje && (
              <Alert color="success" toggle={() => setMensaje("")}>
                {mensaje}
              </Alert>
            )}

            {mensajeError && (
              <Alert color="danger" toggle={() => setMensajeError("")}>
                {mensajeError}
              </Alert>
            )}

            {error && <Alert color="danger">{error}</Alert>}

            <FormGroup>
              <Label for="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
              />
            </FormGroup>

            {cargando ? (
              <div className="text-center p-5">
                <Spinner />
              </div>
            ) : (
              <>
                {infoFeriado && (
                  <Alert color="warning" className="d-flex align-items-center">
                    <Calendar size={16} className="me-2" />
                    <div>
                      <strong>Feriado: {infoFeriado.nombre}</strong>
                      <br />
                      <small>
                        Las horas aparecen bloqueadas. Activa las que quieras
                        habilitar.
                      </small>
                    </div>
                  </Alert>
                )}

                <Row className="g-2 mt-1">
                  {horasAgrupadas.map((grupo) => {
                    const rangoHoras =
                      grupo.horas.length > 1
                        ? `${grupo.horas[0]} - ${grupo.horas[grupo.horas.length - 1]}`
                        : grupo.horas[0];

                    const getColor = () => {
                      switch (grupo.estado) {
                        case "disponible":
                          return "success";
                        case "reservada":
                          return "warning";
                        case "bloqueada":
                        case "cancelada":
                          return "danger";
                        case "extra":
                          return "info";
                        default:
                          return "light";
                      }
                    };

                    return (
                      <Col md="6" key={grupo.horas[0]}>
                        <div
                          className="border rounded p-2 bg-white shadow-sm"
                          style={{
                            minHeight: "70px",
                            backgroundColor:
                              grupo.estado === "reservada"
                                ? "#fff9e6"
                                : "white",
                            borderLeft:
                              grupo.estado === "reservada"
                                ? "3px solid #ffc107"
                                : "none",
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center h-100">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center gap-2 flex-wrap">
                                <span className="fw-bold">{rangoHoras}</span>
                                <Badge color={getColor()} pill>
                                  {grupo.estado === "reservada" &&
                                  grupo.horas.length > 1
                                    ? `${grupo.horas.length}h`
                                    : grupo.estado === "reservada"
                                      ? "Reserva"
                                      : grupo.estado}
                                </Badge>
                              </div>

                              {grupo.estado === "reservada" && (
                                <small className="text-muted d-block mt-1">
                                  👤 {grupo.reserva?.cliente?.nombre} — ✂️{" "}
                                  {grupo.reserva?.servicio}
                                </small>
                              )}
                            </div>

                            <div>
                              {(grupo.estado === "disponible" ||
                                grupo.estado === "cancelada" ||
                                grupo.estado === "bloqueada") && (
                                <Button
                                  size="sm"
                                  color={
                                    grupo.estado === "disponible"
                                      ? "danger"
                                      : "success"
                                  }
                                  onClick={() => onToggleHora(grupo.hora)}
                                >
                                  {grupo.estado === "disponible"
                                    ? "Bloquear"
                                    : "Habilitar"}
                                </Button>
                              )}

                              {grupo.estado === "extra" && (
                                <Button
                                  size="sm"
                                  color="danger"
                                  onClick={() =>
                                    onEliminarHoraExtra(grupo.hora)
                                  }
                                >
                                  Eliminar
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Col>
                    );
                  })}
                </Row>

                {/* Sección para agregar horas extra */}
                <Card className="mt-4 border-info">
                  <CardBody>
                    <h6 className="mb-3 text-info d-flex align-items-center">
                      <Clock size={16} className="me-2" />
                      Agregar Hora Extra
                    </h6>
                    <Row>
                      <Col md="5">
                        <Input
                          type="time"
                          value={nuevaHora}
                          onChange={(e) => setNuevaHora(e.target.value)}
                          placeholder="Seleccionar hora"
                        />
                      </Col>
                      <Col md="7">
                        <Button
                          onClick={onAgregarHoraExtra}
                          color="info"
                          disabled={!nuevaHora}
                        >
                          <PlusCircle size={14} className="me-2" />
                          Agregar Hora Extra
                        </Button>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>

                {/* Leyenda de estados */}
                <Row className="mt-4">
                  <Col>
                    <div className="d-flex gap-3 flex-wrap">
                      <small className="text-muted">✅ Disponible</small>
                      <small className="text-muted">❌ Bloqueada</small>
                      <small className="text-muted">⭐ Extra</small>
                      <small className="text-muted">📅 Reservada</small>
                    </div>
                  </Col>
                </Row>
              </>
            )}
          </CardBody>
        </Card>
      </Container>
    </>
  );
};

export default GestionHorarios;

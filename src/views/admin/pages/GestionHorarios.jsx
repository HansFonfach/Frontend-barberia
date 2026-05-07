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
import { PlusCircle, Trash2, RefreshCw, Calendar, Clock } from "lucide-react";

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
    horasAdmin, // ← NUEVO
  } = useGestionHorariosAdmin(barbero, fechaSeleccionada);

  // Crear un Set de horas canceladas para búsqueda rápida
  const horasCanceladasSet = useMemo(() => {
    return new Set(horasCanceladas);
  }, [horasCanceladas]);

  // Crear un Set de horas extra para búsqueda rápida
  const horasExtraSet = useMemo(() => {
    return new Set(horasExtra.map((h) => h.hora));
  }, [horasExtra]);

  const horasSinDuplicados = useMemo(() => {
    const vistas = new Set();
    return todasLasHoras.filter(({ hora }) => {
      if (vistas.has(hora)) return false;
      vistas.add(hora);
      return true;
    });
  }, [todasLasHoras]);

  const obtenerEstadoHora = (hora) => {
    if (horasCanceladasSet.has(hora)) return "cancelada";
    if (horasExtraSet.has(hora)) return "extra";
    return "disponible";
  };

  const onToggleHora = async (hora) => {
    try {
      setMensajeError("");
      const esBloqueada = horasCanceladasSet.has(hora);

      if (infoFeriado) {
        // En feriado: habilitar = agregar hora extra, deshabilitar = eliminarla
        if (esBloqueada) {
          await agregarHoraExtraDiaria(barbero, fechaSeleccionada, hora);
          setMensaje(`Hora ${hora} habilitada para el feriado`);
        } else {
          await cancelarHoraExtraDiaria(barbero, fechaSeleccionada, hora);
          setMensaje(`Hora ${hora} bloqueada nuevamente`);
        }
      } else {
        // Día normal: toggle de bloqueo
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

    // Verificar si ya existe como hora extra
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
                  {horasAdmin.map((h) => {
                    const getColor = () => {
                      switch (h.estado) {
                        case "disponible":
                          return "success";

                        case "reservada":
                          return "warning";

                        case "bloqueada":
                        case "cancelada":
                          return "danger";

                        case "extra":
                          return "info";

                        case "colacion":
                          return "secondary";

                        default:
                          return "light";
                      }
                    };

                    return (
                      <Col md="6" key={h.hora}>
                        <div
                          className="border rounded d-flex justify-content-between align-items-center px-3 py-2 bg-white shadow-sm"
                          style={{
                            minHeight: "58px",
                          }}
                        >
                          {/* IZQUIERDA */}
                          <div className="d-flex flex-column">
                            <div className="d-flex align-items-center gap-2">
                              <span className="fw-bold">{h.hora}</span>

                              <Badge color={getColor()} pill>
                                {h.estado}
                              </Badge>
                            </div>

                            {h.estado === "reservada" && (
                              <small className="text-muted mt-1">
                                👤 {h.reserva?.cliente?.nombre} — ✂️{" "}
                                {h.reserva?.servicio}
                              </small>
                            )}
                          </div>

                          {/* DERECHA */}
                          <div>
                            {(h.estado === "disponible" ||
                              h.estado === "cancelada" ||
                              h.estado === "bloqueada") && (
                              <Button
                                size="sm"
                                color={
                                  h.estado === "disponible"
                                    ? "danger"
                                    : "success"
                                }
                                onClick={() => onToggleHora(h.hora)}
                              >
                                {h.estado === "disponible"
                                  ? "Bloquear"
                                  : "Habilitar"}
                              </Button>
                            )}

                            {h.estado === "extra" && (
                              <Button
                                size="sm"
                                color="danger"
                                onClick={() => onEliminarHoraExtra(h.hora)}
                              >
                                Eliminar
                              </Button>
                            )}
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
                    <small className="text-muted me-3">
                      <Badge color="success" pill className="me-1">
                        ●
                      </Badge>{" "}
                      Disponible
                    </small>
                    <small className="text-muted me-3">
                      <Badge color="danger" pill className="me-1">
                        ●
                      </Badge>{" "}
                      Cancelada
                    </small>
                    <small className="text-muted">
                      <Badge color="info" pill className="me-1">
                        ●
                      </Badge>{" "}
                      Extra
                    </small>
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

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
  } = useGestionHorariosAdmin(barbero, fechaSeleccionada);

  // Crear un Set de horas canceladas para búsqueda rápida
  const horasCanceladasSet = useMemo(() => {
    return new Set(horasCanceladas);
  }, [horasCanceladas]);

  // Crear un Set de horas extra para búsqueda rápida
  const horasExtraSet = useMemo(() => {
    return new Set(horasExtra.map(h => h.hora));
  }, [horasExtra]);

  const obtenerEstadoHora = (hora) => {
    if (horasCanceladasSet.has(hora)) return "cancelada";
    if (horasExtraSet.has(hora)) return "extra";
    return "disponible";
  };

  const onToggleHora = async (hora) => {
    try {
      setMensajeError("");
      await toggleHoraPorDia(hora, fechaSeleccionada, barbero);
      setMensaje(`Hora ${hora} ${horasCanceladasSet.has(hora) ? 'reactivada' : 'cancelada'} correctamente`);
      await refetch();
    } catch (err) {
      setMensajeError(`Error al actualizar hora ${hora}`);
      console.error(err);
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
            <h5 className="mb-0">Gestión de Horarios</h5>
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
                {todasLasHoras.length === 0 ? (
                  <Alert color="warning" className="mt-3">
                    No hay horarios configurados para este día
                  </Alert>
                ) : (
                  <table className="table table-bordered text-center mt-3">
                    <thead className="bg-light">
                      <tr>
                        <th>Hora</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todasLasHoras.map(({ hora }) => {
                        const estado = obtenerEstadoHora(hora);
                        const esExtra = estado === "extra";

                        return (
                          <tr key={hora}>
                            <td className="fw-bold">{hora}</td>
                            <td>
                              {estado === "disponible" && (
                                <Badge color="success" pill>Disponible</Badge>
                              )}
                              {estado === "cancelada" && (
                                <Badge color="danger" pill>Cancelada</Badge>
                              )}
                              {estado === "extra" && (
                                <Badge color="info" pill>Extra</Badge>
                              )}
                            </td>
                            <td>
                              {esExtra ? (
                                <Button
                                  size="sm"
                                  color="warning"
                                  onClick={() => onEliminarHoraExtra(hora)}
                                  title="Eliminar hora extra"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  color={estado === "cancelada" ? "success" : "danger"}
                                  onClick={() => onToggleHora(hora)}
                                  title={estado === "cancelada" ? "Reactivar hora" : "Cancelar hora"}
                                >
                                  <RefreshCw size={14} />
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}

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
                      <Badge color="success" pill className="me-1">●</Badge> Disponible
                    </small>
                    <small className="text-muted me-3">
                      <Badge color="danger" pill className="me-1">●</Badge> Cancelada
                    </small>
                    <small className="text-muted">
                      <Badge color="info" pill className="me-1">●</Badge> Extra
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
// src/views/admin/pages/GestionHorarios.jsx
import React, { useState } from "react";
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
import {
  PlusCircle,
  Trash2,
  RefreshCw,
  Calendar,
} from "lucide-react";

import UserHeader from "components/Headers/UserHeader";
import { useAuth } from "context/AuthContext";
import { useHorario } from "context/HorarioContext";
import { useGestionHorariosAdmin } from "hooks/useGestionHorariosAdmin";

const GestionHorarios = () => {
  const { user, isAuthenticated } = useAuth();
  const barbero = user?.id || user?._id;

  const {
    agregarHoraExtraDiaria,
    cancelarHoraExtraDiaria,
    toggleHoraPorDia,
  } = useHorario();

  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [nuevaHora, setNuevaHora] = useState("");
  const [mensaje, setMensaje] = useState("");

  const {
    todasLasHoras,     // [{ hora: "09:00", disponible: true }]
    horasExtra,        // [{ hora: "19:00", disponible: true }]
    horasCanceladas,   // ["10:00", "11:00"]
    cargando,
    error,
  } = useGestionHorariosAdmin(barbero, fechaSeleccionada);

  if (!isAuthenticated || !user) {
    return (
      <Container className="mt-5 text-center">
        <Spinner size="sm" className="me-2" />
        Cargando usuario...
      </Container>
    );
  }

  // 🔹 Unificar horas base + extras (objetos)
  const horariosDelDia = [...todasLasHoras, ...horasExtra].sort((a, b) =>
    a.hora.localeCompare(b.hora)
  );

  // 🔹 Estado de cada hora
  const obtenerEstadoHora = (bloque) => {
    if (horasExtra.some((h) => h.hora === bloque.hora)) return "extra";
    if (horasCanceladas.includes(bloque.hora)) return "cancelada";
    return bloque.disponible ? "disponible" : "cancelada";
  };

  // 🔹 Toggle cancelar / reactivar
  const onToggleHora = async (hora) => {
    try {
      await toggleHoraPorDia(hora, fechaSeleccionada, barbero);
      setMensaje(`Hora ${hora} actualizada correctamente`);
    } catch (err) {
      console.error(err);
      setMensaje("Error al actualizar la hora");
    }
  };

  // 🔹 Agregar hora extra
  const onAgregarHoraExtra = async () => {
    if (!nuevaHora) return;

    try {
      await agregarHoraExtraDiaria(barbero, fechaSeleccionada, nuevaHora);
      setNuevaHora("");
      setMensaje(`Hora extra ${nuevaHora} agregada`);
    } catch (err) {
      console.error(err);
      setMensaje("Error al agregar hora extra");
    }
  };

  // 🔹 Eliminar hora extra
  const onEliminarHoraExtra = async (hora) => {
    try {
      await cancelarHoraExtraDiaria(barbero, fechaSeleccionada, hora);
      setMensaje(`Hora extra ${hora} eliminada`);
    } catch (err) {
      console.error(err);
      setMensaje("Error al eliminar hora extra");
    }
  };

  return (
    <>
      <UserHeader />

      <Container className="mt--7 mb-5" style={{ maxWidth: "1000px" }}>
        <Card className="shadow border-0">
          <CardHeader className="bg-gradient-primary text-white d-flex align-items-center">
            <Calendar className="me-2" />
            <div>
              <h3 className="mb-0">Gestión de Horarios</h3>
              <small>Administración diaria del horario</small>
            </div>
          </CardHeader>

          <CardBody>
            {mensaje && <Alert color="info">{mensaje}</Alert>}
            {error && <Alert color="danger">{error}</Alert>}

            {/* Fecha */}
            <FormGroup>
              <Label>Seleccionar fecha</Label>
              <Input
                type="date"
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
              />
            </FormGroup>

            {/* Tabla */}
            {cargando ? (
              <div className="text-center py-4">
                <Spinner color="primary" />
              </div>
            ) : (
              <div className="table-responsive mt-4">
                <table className="table table-bordered text-center align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Hora</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {horariosDelDia.length === 0 && (
                      <tr>
                        <td colSpan="3" className="text-muted">
                          No hay horarios configurados
                        </td>
                      </tr>
                    )}

                    {horariosDelDia.map((bloque) => {
                      const estado = obtenerEstadoHora(bloque);

                      return (
                        <tr key={bloque.hora}>
                          <td className="fw-bold">{bloque.hora}</td>

                          <td>
                            {estado === "disponible" && (
                              <Badge color="success">Disponible</Badge>
                            )}
                            {estado === "cancelada" && (
                              <Badge color="danger">Cancelada</Badge>
                            )}
                            {estado === "extra" && (
                              <Badge color="info">Extra</Badge>
                            )}
                          </td>

                          <td>
                            {estado === "extra" ? (
                              <Button
                                size="sm"
                                color="warning"
                                onClick={() =>
                                  onEliminarHoraExtra(bloque.hora)
                                }
                              >
                                <Trash2 size={16} className="me-1" />
                                Eliminar
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                color={
                                  estado === "cancelada"
                                    ? "secondary"
                                    : "danger"
                                }
                                onClick={() =>
                                  onToggleHora(bloque.hora)
                                }
                              >
                                <RefreshCw size={16} className="me-1" />
                                {estado === "cancelada"
                                  ? "Reactivar"
                                  : "Cancelar"}
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Agregar hora extra */}
            <Card className="mt-4 border-info">
              <CardBody>
                <h6 className="text-info">Agregar hora extra</h6>
                <Row className="align-items-end">
                  <Col md="4">
                    <Input
                      type="time"
                      value={nuevaHora}
                      onChange={(e) => setNuevaHora(e.target.value)}
                    />
                  </Col>
                  <Col md="3">
                    <Button color="info" onClick={onAgregarHoraExtra}>
                      <PlusCircle size={16} className="me-1" />
                      Agregar
                    </Button>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </CardBody>
        </Card>
      </Container>
    </>
  );
};

export default GestionHorarios;

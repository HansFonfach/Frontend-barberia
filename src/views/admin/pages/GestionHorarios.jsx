// src/views/admin/pages/GestionHorarios.jsx
import React, { useState, useEffect } from "react";
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
import { Check, PlusCircle, Trash2, RefreshCw, Calendar } from "lucide-react";
import UserHeader from "components/Headers/UserHeader.js";
import { useHorasDisponibles } from "hooks/useHorasDisponibles";
import { useAuth } from "context/AuthContext";
import { useHorario } from "context/HorarioContext";

const GestionHorarios = () => {
  // --- Estado ---
  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [horariosPorFecha, setHorariosPorFecha] = useState({});
  const [nuevaHora, setNuevaHora] = useState("");
  const [mensaje, setMensaje] = useState("");

  const { getHorasDisponiblesBarbero } = useHorario();
  const { user, isAuthenticated } = useAuth();
  const barbero = user?.id || user?._id;

  const {
    cancelarHoraPorDia,
    agregarHoraExtraDiaria,
    obtenerExcepcionesPorDia,
    revertirHoraPorDia,
    cancelarHoraExtraDiaria
  } = useHorario();

  // --- Hook de horas disponibles ---
  const {
    horas: horasDisponibles,
    todasLasHoras,
    horasBloqueadas,
    horasExtra,
    mensaje: mensajeHoras,
    cargando: cargandoHoras,
  } = useHorasDisponibles(
    barbero,
    fechaSeleccionada,
    getHorasDisponiblesBarbero
  );

  // --- Efectos para sincronización ---
  useEffect(() => {
    if (!barbero || !fechaSeleccionada) return;

    // Cargar excepciones del día
    const cargarExcepciones = async () => {
      try {
        const excepciones = await obtenerExcepcionesPorDia(
          barbero,
          fechaSeleccionada
        );
        console.log("📅 Excepciones cargadas:", excepciones);

        setHorariosPorFecha((prev) => ({
          ...prev,
          [fechaSeleccionada]: {
            extra: excepciones
              .filter((e) => e.tipo === "extra")
              .map((e) => e.horaInicio),
            canceladas: excepciones
              .filter((e) => e.tipo === "bloqueo")
              .map((e) => e.horaInicio),
          },
        }));
      } catch (err) {
        console.error("❌ Error al cargar excepciones:", err);
        setMensaje("Error al cargar las excepciones del día");
      }
    };

    cargarExcepciones();
  }, [barbero, fechaSeleccionada, obtenerExcepcionesPorDia]);

  // Sincronizar con datos del hook
  useEffect(() => {
    if (horasBloqueadas.length > 0 || horasExtra.length > 0) {
      console.log("🔄 Sincronizando con datos del hook:", {
        horasBloqueadas,
        horasExtra
      });

      setHorariosPorFecha((prev) => ({
        ...prev,
        [fechaSeleccionada]: {
          ...(prev[fechaSeleccionada] || {}),
          canceladas: horasBloqueadas,
          extra: horasExtra,
        },
      }));
    }
  }, [horasBloqueadas, horasExtra, fechaSeleccionada]);

  // --- Funciones principales ---
  const obtenerHorariosDelDia = () => {
    if (!todasLasHoras || todasLasHoras.length === 0) {
      return [];
    }

    const fechaData = horariosPorFecha[fechaSeleccionada] || {
      extra: [],
      canceladas: [],
    };

    // Combinar todas las horas base + horas extra
    let horariosCombinados = [...todasLasHoras, ...fechaData.extra];
    
    // Eliminar duplicados y ordenar
    const horariosUnicos = Array.from(new Set(horariosCombinados)).sort((a, b) => {
      const [hA, mA] = a.split(":").map(Number);
      const [hB, mB] = b.split(":").map(Number);
      return hA - hB || mA - mB;
    });

    return horariosUnicos;
  };

  const toggleHoraCancelada = async (hora) => {
    if (!barbero || !fechaSeleccionada) return;

    const fechaData = horariosPorFecha[fechaSeleccionada] || {
      extra: [],
      canceladas: [],
    };
    const esCancelada = fechaData.canceladas.includes(hora);

    try {
      if (esCancelada) {
        // Revertir cancelación
        await revertirHoraPorDia(hora, fechaSeleccionada, barbero);
        setMensaje(`✅ Hora ${hora} reactivada correctamente`);
      } else {
        // Cancelar hora
        await cancelarHoraPorDia(hora, fechaSeleccionada, barbero);
        setMensaje(`✅ Hora ${hora} cancelada correctamente`);
      }

      // Actualizar estado local
      setHorariosPorFecha((prev) => {
        const fechaActual = prev[fechaSeleccionada] || { extra: [], canceladas: [] };
        const nuevasCanceladas = esCancelada
          ? fechaActual.canceladas.filter((h) => h !== hora)
          : [...fechaActual.canceladas, hora];

        return {
          ...prev,
          [fechaSeleccionada]: {
            ...fechaActual,
            canceladas: nuevasCanceladas,
          },
        };
      });

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMensaje(""), 3000);
    } catch (err) {
      console.error("❌ Error al modificar hora:", err);
      setMensaje("❌ Error al modificar la hora");
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const agregarHoraExtra = async () => {
    if (!nuevaHora || !barbero || !fechaSeleccionada) {
      setMensaje("❌ Debe ingresar una hora válida");
      setTimeout(() => setMensaje(""), 3000);
      return;
    }

    try {
      await agregarHoraExtraDiaria(barbero, fechaSeleccionada, nuevaHora);
      
      setHorariosPorFecha((prev) => {
        const fechaActual = prev[fechaSeleccionada] || { extra: [], canceladas: [] };
        
        // Evitar duplicados
        if (fechaActual.extra.includes(nuevaHora)) {
          setMensaje("⚠️ Esta hora extra ya existe");
          return prev;
        }

        return {
          ...prev,
          [fechaSeleccionada]: {
            ...fechaActual,
            extra: [...fechaActual.extra, nuevaHora],
          },
        };
      });

      setMensaje(`✅ Hora extra ${nuevaHora} agregada correctamente`);
      setNuevaHora("");
      setTimeout(() => setMensaje(""), 3000);
    } catch (err) {
      console.error("❌ Error al agregar hora extra:", err);
      setMensaje("❌ Error al agregar hora extra");
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const eliminarHoraExtra = async (hora) => {
    if (!barbero || !fechaSeleccionada) return;

    try {
      await cancelarHoraExtraDiaria(barbero, fechaSeleccionada, hora);
      
      setHorariosPorFecha((prev) => {
        const fechaActual = prev[fechaSeleccionada] || { extra: [], canceladas: [] };
        return {
          ...prev,
          [fechaSeleccionada]: {
            ...fechaActual,
            extra: fechaActual.extra.filter((h) => h !== hora),
          },
        };
      });

      setMensaje(`✅ Hora extra ${hora} eliminada correctamente`);
      setTimeout(() => setMensaje(""), 3000);
    } catch (err) {
      console.error("❌ Error al eliminar hora extra:", err);
      setMensaje("❌ Error al eliminar hora extra");
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const obtenerEstadoHora = (hora) => {
    const fechaData = horariosPorFecha[fechaSeleccionada] || {
      extra: [],
      canceladas: [],
    };

    if (fechaData.extra.includes(hora)) {
      return "extra";
    } else if (fechaData.canceladas.includes(hora)) {
      return "cancelada";
    } else {
      return "disponible";
    }
  };

  // --- Render ---
  if (!isAuthenticated || !user) {
    return (
      <Container className="mt-5 text-center">
        <Spinner size="sm" className="me-2" /> Cargando usuario...
      </Container>
    );
  }

  const horariosDelDia = obtenerHorariosDelDia();
  const fechaData = horariosPorFecha[fechaSeleccionada] || {
    extra: [],
    canceladas: [],
  };

  return (
    <>
      <UserHeader />
      <Container className="mt--7 mb-5" style={{ maxWidth: "1000px" }}>
        <Card className="shadow-sm border-0">
          <CardHeader className="bg-gradient-primary text-white d-flex align-items-center">
            <Calendar size={24} className="me-2" />
            <div>
              <h3 className="mb-0">📅 Gestión de Horarios</h3>
              <small className="opacity-80">
                Gestiona horas extras y cancelaciones por día
              </small>
            </div>
          </CardHeader>
          
          <CardBody>
            {/* Mensajes */}
            {mensaje && (
              <Alert 
                color={mensaje.includes("❌") ? "danger" : mensaje.includes("⚠️") ? "warning" : "success"} 
                className="mb-3"
              >
                {mensaje}
              </Alert>
            )}

            {/* Selección de fecha */}
            <FormGroup>
              <Label for="fecha" className="font-weight-bold">
                📅 Seleccionar Fecha:
              </Label>
              <Input
                id="fecha"
                type="date"
                value={fechaSeleccionada}
                onChange={(e) => {
                  console.log("📅 Cambiando fecha a:", e.target.value);
                  setFechaSeleccionada(e.target.value);
                  setMensaje("");
                }}
                className="border-primary"
              />
            </FormGroup>

            {/* Información de carga */}
            {cargandoHoras && (
              <div className="text-center py-4">
                <Spinner color="primary" className="me-2" />
                <span>Cargando horarios...</span>
              </div>
            )}

            {/* Tabla de horarios */}
            {!cargandoHoras && (
              <div className="table-responsive mt-4">
                <table className="table table-bordered table-hover text-center">
                  <thead className="thead-dark">
                    <tr>
                      <th width="25%">Hora</th>
                      <th width="25%">Estado</th>
                      <th width="50%">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {horariosDelDia.length > 0 ? (
                      horariosDelDia.map((hora) => {
                        const estado = obtenerEstadoHora(hora);
                        
                        return (
                          <tr key={hora} className="align-middle">
                            <td className="font-weight-bold">{hora}</td>
                            <td>
                              {estado === "cancelada" ? (
                                <Badge color="danger" className="px-3 py-2">
                                  ❌ Cancelada
                                </Badge>
                              ) : estado === "extra" ? (
                                <Badge color="info" className="px-3 py-2">
                                  ⭐ Extra
                                </Badge>
                              ) : (
                                <Badge color="success" className="px-3 py-2">
                                  ✅ Disponible
                                </Badge>
                              )}
                            </td>
                            <td>
                              {estado === "extra" ? (
                                <Button
                                  color="warning"
                                  size="sm"
                                  onClick={() => eliminarHoraExtra(hora)}
                                  className="d-inline-flex align-items-center"
                                >
                                  <Trash2 size={16} className="me-1" />
                                  Eliminar Extra
                                </Button>
                              ) : (
                                <Button
                                  color={estado === "cancelada" ? "secondary" : "danger"}
                                  size="sm"
                                  onClick={() => toggleHoraCancelada(hora)}
                                  className="d-inline-flex align-items-center"
                                >
                                  {estado === "cancelada" ? (
                                    <>
                                      <RefreshCw size={16} className="me-1" />
                                      Reactivar
                                    </>
                                  ) : (
                                    <>
                                      <Trash2 size={16} className="me-1" />
                                      Cancelar
                                    </>
                                  )}
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-muted py-5">
                          {mensajeHoras || "No hay horarios disponibles para esta fecha"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Agregar hora extra */}
            <Card className="mt-4 border-info">
              <CardBody>
                <h6 className="text-info d-flex align-items-center">
                  <PlusCircle size={18} className="me-2" />
                  Agregar Hora Extra
                </h6>
                <Row className="align-items-end">
                  <Col md="4">
                    <FormGroup>
                      <Label className="small">Nueva hora:</Label>
                      <Input
                        type="time"
                        value={nuevaHora}
                        onChange={(e) => setNuevaHora(e.target.value)}
                        className="border-info"
                      />
                    </FormGroup>
                  </Col>
                  <Col md="3">
                    <Button 
                      color="info" 
                      onClick={agregarHoraExtra}
                      className="d-inline-flex align-items-center"
                      disabled={!nuevaHora}
                    >
                      <PlusCircle size={16} className="me-1" />
                      Agregar
                    </Button>
                  </Col>
                  <Col md="5">
                    <small className="text-muted">
                      Agrega horas fuera del horario regular
                    </small>
                  </Col>
                </Row>
              </CardBody>
            </Card>

            {/* Resumen del día */}
            <Card className="mt-4 border-success">
              <CardBody>
                <h6 className="text-success d-flex align-items-center">
                  <Check size={18} className="me-2" />
                  Resumen - {fechaSeleccionada}
                </h6>
                <Row className="mt-3">
                  <Col md="4">
                    <div className="text-center">
                      <div className="h4 text-primary mb-1">{todasLasHoras?.length || 0}</div>
                      <small className="text-muted">Horas Base</small>
                    </div>
                  </Col>
                  <Col md="4">
                    <div className="text-center">
                      <div className="h4 text-info mb-1">{fechaData.extra.length}</div>
                      <small className="text-muted">Horas Extra</small>
                    </div>
                  </Col>
                  <Col md="4">
                    <div className="text-center">
                      <div className="h4 text-danger mb-1">{fechaData.canceladas.length}</div>
                      <small className="text-muted">Horas Canceladas</small>
                    </div>
                  </Col>
                </Row>
                
                {/* Detalles */}
                <div className="mt-3 small">
                  <div><strong>Horas base:</strong> {todasLasHoras?.join(", ") || "No hay horas base"}</div>
                  <div><strong>Horas extra:</strong> {fechaData.extra.length > 0 ? fechaData.extra.join(", ") : "Ninguna"}</div>
                  <div><strong>Horas canceladas:</strong> {fechaData.canceladas.length > 0 ? fechaData.canceladas.join(", ") : "Ninguna"}</div>
                </div>
              </CardBody>
            </Card>
          </CardBody>
        </Card>
      </Container>
    </>
  );
};

export default GestionHorarios;
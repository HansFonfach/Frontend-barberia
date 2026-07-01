// src/views/admin/pages/GestionServiciosPorHora.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Button, Card, CardBody, CardHeader, Container,
  Row, Col, Input, Spinner, Badge,
} from "reactstrap";
import { Save, Clock, User, Info, Lock, Unlock } from "lucide-react";
import Swal from "sweetalert2";
import UserHeader from "components/Headers/UserHeader";
import { useUsuario } from "context/usuariosContext";
import { useHorario } from "context/HorarioContext";
import { getServiciosBarbero, patchHorasPermitidasBatch } from "api/servicios";

const sumarMinutos = (horaStr, minutos) => {
  const [h, m] = horaStr.split(":").map(Number);
  const total = h * 60 + m + minutos;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

const enColacion = (hora, colacionInicio, colacionFin) => {
  if (!colacionInicio || !colacionFin) return false;
  return hora >= colacionInicio && hora < colacionFin;
};

const generarSlotsDelDia = (dia) => {
  const slots = [];
  let actual = dia.horaInicio;
  while (actual < dia.horaFin) {
    if (!enColacion(actual, dia.colacionInicio, dia.colacionFin)) {
      slots.push(actual);
    }
    actual = sumarMinutos(actual, dia.duracionBloque || 30);
  }
  return slots;
};

const GestionServiciosPorHora = () => {
  const { barberos } = useUsuario();
  const { obtenerHorarioBarbero } = useHorario();

  const [barberoSeleccionado, setBarberoSeleccionado] = useState("");
  const [servicios, setServicios] = useState([]);
  const [diasHorario, setDiasHorario] = useState([]);
  // { [servicioId]: Set(horas) }
  const [matriz, setMatriz] = useState({});
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!barberoSeleccionado) {
      setServicios([]);
      setDiasHorario([]);
      setMatriz({});
      return;
    }
    setCargando(true);
    Promise.all([
      getServiciosBarbero(barberoSeleccionado),
      obtenerHorarioBarbero(barberoSeleccionado),
    ])
      .then(([resServicios, dias]) => {
        const listaServicios = resServicios.data || [];
        setServicios(listaServicios);
        setDiasHorario(dias || []);

        const inicial = {};
        listaServicios.forEach((s) => {
          inicial[s.servicioId] = new Set(s.horasPermitidas || []);
        });
        setMatriz(inicial);
      })
      .catch(() => {
        setServicios([]);
        setDiasHorario([]);
        setMatriz({});
      })
      .finally(() => setCargando(false));
  }, [barberoSeleccionado]);

  // Unión de horas distintas entre todos los días activos, sin repetir
  const horasUnicas = useMemo(() => {
    const set = new Set();
    diasHorario.forEach((dia) => {
      generarSlotsDelDia(dia).forEach((h) => set.add(h));
    });
    return Array.from(set).sort();
  }, [diasHorario]);

  const toggleHora = (servicioId, hora) => {
    setMatriz((prev) => {
      const actual = new Set(prev[servicioId] || []);
      if (actual.has(hora)) actual.delete(hora);
      else actual.add(hora);
      return { ...prev, [servicioId]: actual };
    });
  };

  const guardarTodo = async () => {
    try {
      setGuardando(true);
      const actualizaciones = servicios.map((s) => ({
        servicioId: s.servicioId,
        horasPermitidas: Array.from(matriz[s.servicioId] || []),
      }));
      await patchHorasPermitidasBatch(barberoSeleccionado, actualizaciones);
      Swal.fire("Éxito", "Horas permitidas actualizadas", "success");
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Error al guardar",
        "error",
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <UserHeader title="Servicios por Horario" />
      <Container className="mt--7 mb-5" fluid>
        <Row className="justify-content-center">
          <Col lg="9">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-white border-0 py-3">
                <Row className="align-items-center">
                  <Col md="6">
                    <h3 className="mb-0 d-flex align-items-center">
                      <Clock className="text-primary mr-2" size={20} />
                      Servicios disponibles por hora
                    </h3>
                  </Col>
                  <Col md="6" className="mt-3 mt-md-0">
                    <div className="d-flex align-items-center justify-content-md-end">
                      <User size={16} className="text-muted mr-2" />
                      <Input
                        type="select"
                        style={{ maxWidth: "280px" }}
                        value={barberoSeleccionado}
                        onChange={(e) => setBarberoSeleccionado(e.target.value)}
                      >
                        <option value="">Seleccionar profesional...</option>
                        {barberos.map((b) => (
                          <option key={b._id} value={b._id}>
                            {b.nombre} {b.apellido}
                          </option>
                        ))}
                      </Input>
                    </div>
                  </Col>
                </Row>
              </CardHeader>

              <CardBody>
                {!barberoSeleccionado ? (
                  <div className="text-center py-5">
                    <Clock size={48} className="text-muted mb-3 opacity-5" />
                    <h4 className="text-muted">
                      Selecciona un profesional para configurar sus servicios
                    </h4>
                  </div>
                ) : cargando ? (
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                  </div>
                ) : servicios.length === 0 ? (
                  <p className="text-muted text-center py-4">
                    Este profesional no tiene servicios asignados.
                  </p>
                ) : horasUnicas.length === 0 ? (
                  <p className="text-muted text-center py-4">
                    Este profesional no tiene jornada configurada todavía.
                  </p>
                ) : (
                  <>
                    {servicios.map((s) => {
                      const horasServicio = matriz[s.servicioId] || new Set();
                      const tieneRestriccion = horasServicio.size > 0;

                      return (
                        <div
                          key={s.servicioId}
                          className="mb-3 p-3 rounded"
                          style={{ border: "1px solid #dee2e6", background: "#fafbff" }}
                        >
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <div className="d-flex align-items-center" style={{ gap: "8px" }}>
                              <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                                {s.nombre}
                              </span>
                              <small className="text-muted">{s.duracion} min</small>
                            </div>
                            {tieneRestriccion ? (
                              <Badge color="warning" className="d-flex align-items-center" style={{ gap: "4px" }}>
                                <Lock size={10} /> Horas restringidas
                              </Badge>
                            ) : (
                              <Badge color="success" className="d-flex align-items-center" style={{ gap: "4px" }}>
                                <Unlock size={10} /> Disponible siempre
                              </Badge>
                            )}
                          </div>

                          <small className="text-muted d-block mb-2">
                            {tieneRestriccion
                              ? "Solo las horas en verde permiten agendar este servicio."
                              : "Disponible en cualquier hora. Haz clic en una para restringir."}
                          </small>

                          <div className="d-flex flex-wrap" style={{ gap: "6px" }}>
                            {horasUnicas.map((hora) => {
                              const activa = horasServicio.has(hora);
                              return (
                                <span
                                  key={hora}
                                  onClick={() => toggleHora(s.servicioId, hora)}
                                  style={{
                                    cursor: "pointer",
                                    fontSize: "0.8rem",
                                    padding: "6px 14px",
                                    borderRadius: "20px",
                                    border: activa ? "2px solid #2dce89" : "1px solid #dee2e6",
                                    background: activa ? "#e6faf3" : "#f8f9fa",
                                    color: activa ? "#1a7a50" : "#6c757d",
                                    fontWeight: activa ? 600 : 400,
                                    userSelect: "none",
                                  }}
                                >
                                  {activa ? "✓ " : ""}{hora}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

                    <div className="d-flex align-items-center mt-2 mb-3" style={{ gap: "6px" }}>
                      <Info size={14} className="text-muted" />
                      <small className="text-muted">
                        Sin marcas en un servicio = disponible en cualquier hora.
                      </small>
                    </div>

                    <div className="text-center pt-3 border-top">
                      <Button color="primary" size="lg" onClick={guardarTodo} disabled={guardando}>
                        {guardando ? (
                          <Spinner size="sm" />
                        ) : (
                          <>
                            <Save size={16} className="mr-2" /> Guardar todo
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default GestionServiciosPorHora;
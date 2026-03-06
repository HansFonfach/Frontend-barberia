import React, { useEffect, useState } from "react";
import {
  Button, Card, CardBody, CardHeader, Container,
  Row, Col, Input, Spinner, CustomInput,
} from "reactstrap";
import { Save, Clock, Calendar, Coffee, User, Anchor } from "lucide-react";
import UserHeader from "components/Headers/UserHeader";
import Swal from "sweetalert2";
import { useUsuario } from "context/usuariosContext";
import { useHorario } from "context/HorarioContext";
import { useAuth } from "context/AuthContext";
import ModalBloquesAncla from "./ModalBloquesAncla";

const diasSemana = [
  { nombre: "Lunes", valor: 1 },
  { nombre: "Martes", valor: 2 },
  { nombre: "Miércoles", valor: 3 },
  { nombre: "Jueves", valor: 4 },
  { nombre: "Viernes", valor: 5 },
  { nombre: "Sábado", valor: 6 },
  { nombre: "Domingo", valor: 0 },
];

const horarioInicial = diasSemana.reduce((acc, dia) => {
  acc[dia.valor] = {
    activo: false,
    horaInicio: "09:00",
    horaFin: "19:00",
    colacionInicio: "14:00",
    colacionFin: "15:00",
    duracionBloque: 60,
    horasAncla: [],
  };
  return acc;
}, {});

const GestionHorariosBase = () => {
  const [barberoSeleccionado, setBarberoSeleccionado] = useState("");
  const [horarios, setHorarios] = useState(horarioInicial);
  const [diasOriginales, setDiasOriginales] = useState([]);
  const [cargando, setCargando] = useState(false);

  // Modal de bloques
  const [modalAncla, setModalAncla] = useState({ abierto: false, dia: null, diaNombre: "" });
  const [nuevaAncla, setNuevaAncla] = useState("");

  const { barberos } = useUsuario();
  const { crearHorarioBarbero, obtenerHorarioBarbero, eliminarHorarioDia } = useHorario();
  const { user } = useAuth();

  const usaHorasAncla = user?.empresa?.configuracion?.usaHorasAncla === true;

  const handleChange = (dia, campo, valor) => {
    setHorarios((prev) => ({ ...prev, [dia]: { ...prev[dia], [campo]: valor } }));
  };

  // ── Modal bloques ──
  const abrirModalAncla = (diaValor, diaNombre) => {
    setNuevaAncla("");
    setModalAncla({ abierto: true, dia: diaValor, diaNombre });
  };

  const cerrarModalAncla = () => {
    setModalAncla({ abierto: false, dia: null, diaNombre: "" });
    setNuevaAncla("");
  };

  const agregarAncla = () => {
    const { dia } = modalAncla;
    if (!nuevaAncla) return;
    const yaExiste = horarios[dia].horasAncla.some((a) => a.hora === nuevaAncla);
    if (yaExiste) { Swal.fire("Atención", "Esa hora ya existe", "warning"); return; }
    const sorted = [...horarios[dia].horasAncla, { hora: nuevaAncla, serviciosPermitidos: [] }]
      .sort((a, b) => a.hora.localeCompare(b.hora));
    setHorarios((prev) => ({ ...prev, [dia]: { ...prev[dia], horasAncla: sorted } }));
    setNuevaAncla("");
  };

  const eliminarAncla = (hora) => {
    const { dia } = modalAncla;
    setHorarios((prev) => ({
      ...prev,
      [dia]: { ...prev[dia], horasAncla: prev[dia].horasAncla.filter((a) => a.hora !== hora) },
    }));
  };

  const toggleServicioPermitido = (hora, servicioId) => {
    const { dia } = modalAncla;
    setHorarios((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        horasAncla: prev[dia].horasAncla.map((a) => {
          if (a.hora !== hora) return a;
          const yaEsta = a.serviciosPermitidos.includes(servicioId);
          return {
            ...a,
            serviciosPermitidos: yaEsta
              ? a.serviciosPermitidos.filter((id) => id !== servicioId)
              : [...a.serviciosPermitidos, servicioId],
          };
        }),
      },
    }));
  };

  // ── Guardar ──
  const guardarHorario = async () => {
    if (!barberoSeleccionado) { Swal.fire("Atención", "Debes seleccionar un profesional", "warning"); return; }
    try {
      setCargando(true);
      for (const [diaSemana, config] of Object.entries(horarios)) {
        const diaNum = Number(diaSemana);
        if (config.activo) {
          await crearHorarioBarbero({
            barbero: barberoSeleccionado,
            diaSemana: diaNum,
            horaInicio: config.horaInicio,
            horaFin: config.horaFin,
            colacionInicio: config.colacionInicio || null,
            colacionFin: config.colacionFin || null,
            duracionBloque: Number(config.duracionBloque),
            ...(usaHorasAncla && { horasAncla: config.horasAncla }),
          });
        } else if (diasOriginales.includes(diaNum)) {
          await eliminarHorarioDia(barberoSeleccionado, diaNum);
        }
      }
      Swal.fire("Éxito", "Horarios guardados correctamente", "success");
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Error al guardar", "error");
    } finally {
      setCargando(false);
    }
  };

  // ── Cargar horarios ──
  useEffect(() => {
    if (!barberoSeleccionado) return;
    const cargar = async () => {
      try {
        const data = await obtenerHorarioBarbero(barberoSeleccionado);
        const nuevos = { ...horarioInicial };
        data.forEach((h) => {
          nuevos[h.diaSemana] = {
            activo: true,
            horaInicio: h.horaInicio,
            horaFin: h.horaFin,
            colacionInicio: h.colacionInicio || "14:00",
            colacionFin: h.colacionFin || "15:00",
            duracionBloque: h.duracionBloque,
            horasAncla: (h.horasAncla || []).map((a) => {
              if (typeof a === "string") return { hora: a, serviciosPermitidos: [] };
              if (a.servicioExclusivo) return { hora: a.hora, serviciosPermitidos: [a.servicioExclusivo] };
              return { hora: a.hora, serviciosPermitidos: a.serviciosPermitidos || [] };
            }),
          };
        });
        setDiasOriginales(data.map((h) => h.diaSemana));
        setHorarios(nuevos);
      } catch (err) {
        console.error(err);
        setDiasOriginales([]);
        setHorarios({ ...horarioInicial });
      }
    };
    cargar();
  }, [barberoSeleccionado]);

  return (
    <>
      <UserHeader title="Configuración de Jornadas" />
      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col lg="10">
            <Card className="shadow-lg border-0 bg-secondary">
              <CardHeader className="bg-white border-0 py-3">
                <Row className="align-items-center">
                  <Col xs="12" md="6">
                    <h3 className="mb-0 d-flex align-items-center">
                      <Calendar className="text-primary mr-2" size={20} />
                      Horarios del Personal
                    </h3>
                  </Col>
                  <Col xs="12" md="6" className="mt-3 mt-md-0">
                    <div className="d-flex align-items-center justify-content-md-end">
                      <User size={16} className="text-muted mr-2" />
                      <Input
                        type="select"
                        className="form-control-alternative border-primary"
                        value={barberoSeleccionado}
                        onChange={(e) => setBarberoSeleccionado(e.target.value)}
                      >
                        <option value="">Seleccionar profesional...</option>
                        {barberos.map((b) => (
                          <option key={b._id} value={b._id}>{b.nombre} {b.apellido}</option>
                        ))}
                      </Input>
                    </div>
                  </Col>
                </Row>
              </CardHeader>

              <CardBody className="px-lg-4 py-lg-4">
                {!barberoSeleccionado ? (
                  <div className="text-center py-5">
                    <Clock size={48} className="text-muted mb-3 opacity-5" />
                    <h4 className="text-muted">Selecciona un profesional para editar su jornada</h4>
                  </div>
                ) : (
                  <>
                    {diasSemana.map((dia) => {
                      const data = horarios[dia.valor];
                      const estaActivo = data?.activo || false;
                      const tieneAnclas = data?.horasAncla?.length > 0;

                      return (
                        <Card key={dia.valor} className="mb-3 border-0 shadow-sm">
                          <CardBody className="p-3">
                            <Row className="align-items-center">

                              {/* Nombre día + toggle */}
                              <Col xs="12" lg="2" className="mb-3 mb-lg-0">
                                <div className="d-flex align-items-center">
                                  <CustomInput
                                    type="switch"
                                    id={`switch-${dia.valor}`}
                                    checked={estaActivo}
                                    onChange={(e) => handleChange(dia.valor, "activo", e.target.checked)}
                                    className="mr-2"
                                  />
                                  <h4 className="mb-0 text-primary font-weight-bold">{dia.nombre}</h4>
                                </div>
                              </Col>

                              {/* Campos horario */}
                              <Col xs="12" lg="10">
                                <Row className="form-row align-items-end">
                                  <Col xs="6" md="2">
                                    <label className="text-xs font-weight-bold text-uppercase">Apertura</label>
                                    <Input type="time" disabled={!estaActivo} value={data.horaInicio}
                                      onChange={(e) => handleChange(dia.valor, "horaInicio", e.target.value)} />
                                  </Col>
                                  <Col xs="6" md="2">
                                    <label className="text-xs font-weight-bold text-uppercase">Cierre</label>
                                    <Input type="time" disabled={!estaActivo} value={data.horaFin}
                                      onChange={(e) => handleChange(dia.valor, "horaFin", e.target.value)} />
                                  </Col>
                                  <Col xs="6" md="2">
                                    <label className="text-xs font-weight-bold text-uppercase">
                                      <Coffee size={10} /> Colación In.
                                    </label>
                                    <Input type="time" disabled={!estaActivo} value={data.colacionInicio}
                                      onChange={(e) => handleChange(dia.valor, "colacionInicio", e.target.value)} />
                                  </Col>
                                  <Col xs="6" md="2">
                                    <label className="text-xs font-weight-bold text-uppercase">
                                      <Coffee size={10} /> Colación Fin
                                    </label>
                                    <Input type="time" disabled={!estaActivo} value={data.colacionFin}
                                      onChange={(e) => handleChange(dia.valor, "colacionFin", e.target.value)} />
                                  </Col>
                                  <Col xs="6" md="2">
                                    <label className="text-xs font-weight-bold text-uppercase text-primary">
                                      Intervalo (min)
                                    </label>
                                    <Input type="number" disabled={!estaActivo} value={data.duracionBloque}
                                      onChange={(e) => handleChange(dia.valor, "duracionBloque", e.target.value)} />
                                  </Col>

                                  {/* Botón bloques — solo si usa anclas y día activo */}
                                  {usaHorasAncla && estaActivo && (
                                    <Col xs="6" md="2">
                                      <label className="text-xs font-weight-bold text-uppercase text-primary d-block">
                                        Bloques
                                      </label>
                                      <Button
                                        color={tieneAnclas ? "primary" : "secondary"}
                                        size="sm"
                                        outline={!tieneAnclas}
                                        onClick={() => abrirModalAncla(dia.valor, dia.nombre)}
                                        style={{ whiteSpace: "nowrap" }}
                                      >
                                        <Anchor size={13} className="mr-1" />
                                        {tieneAnclas ? `${data.horasAncla.length} bloques` : "Configurar"}
                                      </Button>
                                    </Col>
                                  )}
                                </Row>
                              </Col>
                            </Row>
                          </CardBody>
                        </Card>
                      );
                    })}

                    <div className="mt-4 text-center border-top pt-4">
                      <Button color="primary" size="lg" className="px-5 shadow"
                        onClick={guardarHorario} disabled={cargando}>
                        {cargando ? <Spinner size="sm" /> : (
                          <><Save className="mr-2" size={18} />Guardar Cambios de Jornada</>
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

      {/* Modal de bloques */}
      {modalAncla.dia !== null && (
        <ModalBloquesAncla
          isOpen={modalAncla.abierto}
          toggle={cerrarModalAncla}
          diaNombre={modalAncla.diaNombre}
          horasAncla={horarios[modalAncla.dia]?.horasAncla || []}
          nuevaAncla={nuevaAncla}
          onChangeNuevaAncla={setNuevaAncla}
          onAgregarAncla={agregarAncla}
          onEliminarAncla={eliminarAncla}
          onToggleServicio={toggleServicioPermitido}
        />
      )}
    </>
  );
};

export default GestionHorariosBase;

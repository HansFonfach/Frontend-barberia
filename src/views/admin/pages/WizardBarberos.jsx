import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Row,
  Col,
  Input,
  Spinner,
  CustomInput,
} from "reactstrap";
import { Save, Clock, Calendar, Coffee, User } from "lucide-react";
import UserHeader from "components/Headers/UserHeader";
import Swal from "sweetalert2";
import { useUsuario } from "context/usuariosContext";
import { useHorario } from "context/HorarioContext";

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
  };
  return acc;
}, {});

const GestionHorariosBase = () => {
  const [barberoSeleccionado, setBarberoSeleccionado] = useState("");
  const [horarios, setHorarios] = useState(horarioInicial);
  const [diasOriginales, setDiasOriginales] = useState([]);
  const [cargando, setCargando] = useState(false);

  const { barberos } = useUsuario();
  const { crearHorarioBarbero, obtenerHorarioBarbero, eliminarHorarioDia } =
    useHorario();

  const handleChange = (dia, campo, valor) => {
    setHorarios((prev) => ({
      ...prev,
      [dia]: { ...prev[dia], [campo]: valor },
    }));
  };

  const guardarHorario = async () => {
    if (!barberoSeleccionado) {
      Swal.fire("Atención", "Debes seleccionar un barbero", "warning");
      return;
    }

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
          });
        } else if (diasOriginales.includes(Number(diaSemana))) {
          await eliminarHorarioDia(barberoSeleccionado, Number(diaSemana));
        }
      }
    

      Swal.fire("Éxito", "Horarios guardados correctamente", "success");
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Error al guardar horarios",
        "error",
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!barberoSeleccionado) return;

    const cargarHorario = async () => {
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

    cargarHorario();
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
                        className="form-control-alternative border-primary w-100 w-md-75"
                        value={barberoSeleccionado}
                        onChange={(e) => setBarberoSeleccionado(e.target.value)}
                      >
                        <option value="">Seleccionar Barbero...</option>
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

              <CardBody className="px-lg-4 py-lg-4">
                {!barberoSeleccionado ? (
                  <div className="text-center py-5">
                    <Clock size={48} className="text-muted mb-3 opacity-5" />
                    <h4 className="text-muted italic">
                      Selecciona un barbero para editar su jornada
                    </h4>
                  </div>
                ) : (
                  <>
                    {diasSemana.map((dia) => {
                      const data = horarios[dia.valor];
                      const estaActivo = data?.activo || false;

                      return (
                        <Card
                          key={dia.valor}
                          className="mb-3 border-0 shadow-sm"
                        >
                          <CardBody className="p-3">
                            <Row className="align-items-center">
                              <Col xs="12" lg="2" className="mb-3 mb-lg-0">
                                <div className="d-flex align-items-center">
                                  <CustomInput
                                    type="switch"
                                    id={`switch-${dia.valor}`}
                                    checked={estaActivo}
                                    onChange={(e) =>
                                      handleChange(
                                        dia.valor,
                                        "activo",
                                        e.target.checked,
                                      )
                                    }
                                    className="mr-2"
                                  />
                                  <h4 className="mb-0 text-primary font-weight-bold">
                                    {dia.nombre}
                                  </h4>
                                </div>
                              </Col>

                              <Col xs="12" lg="10">
                                <Row className="form-row">
                                  <Col xs="6" md="2">
                                    <label className="text-xs font-weight-bold text-uppercase">
                                      Apertura
                                    </label>
                                    <Input
                                      type="time"
                                      disabled={!estaActivo}
                                      value={data.horaInicio}
                                      onChange={(e) =>
                                        handleChange(
                                          dia.valor,
                                          "horaInicio",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </Col>

                                  <Col xs="6" md="2">
                                    <label className="text-xs font-weight-bold text-uppercase">
                                      Cierre
                                    </label>
                                    <Input
                                      type="time"
                                      disabled={!estaActivo}
                                      value={data.horaFin}
                                      onChange={(e) =>
                                        handleChange(
                                          dia.valor,
                                          "horaFin",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </Col>

                                  <Col xs="6" md="2">
                                    <label className="text-xs font-weight-bold text-uppercase">
                                      <Coffee size={10} /> Colación In.
                                    </label>
                                    <Input
                                      type="time"
                                      disabled={!estaActivo}
                                      value={data.colacionInicio}
                                      onChange={(e) =>
                                        handleChange(
                                          dia.valor,
                                          "colacionInicio",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </Col>

                                  <Col xs="6" md="2">
                                    <label className="text-xs font-weight-bold text-uppercase">
                                      <Coffee size={10} /> Colación Fin
                                    </label>
                                    <Input
                                      type="time"
                                      disabled={!estaActivo}
                                      value={data.colacionFin}
                                      onChange={(e) =>
                                        handleChange(
                                          dia.valor,
                                          "colacionFin",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </Col>

                                  <Col xs="12" md="2">
                                    <label className="text-xs font-weight-bold text-uppercase text-primary">
                                      Bloque (min)
                                    </label>
                                    <Input
                                      type="number"
                                      disabled={!estaActivo}
                                      value={data.duracionBloque}
                                      onChange={(e) =>
                                        handleChange(
                                          dia.valor,
                                          "duracionBloque",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </Col>
                                </Row>
                              </Col>
                            </Row>
                          </CardBody>
                        </Card>
                      );
                    })}

                    <div className="mt-4 text-center border-top pt-4">
                      <Button
                        color="primary"
                        size="lg"
                        className="px-5 shadow"
                        onClick={guardarHorario}
                        disabled={cargando}
                      >
                        {cargando ? (
                          <Spinner size="sm" />
                        ) : (
                          <>
                            <Save className="mr-2" size={18} />
                            Guardar Cambios de Jornada
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

export default GestionHorariosBase;

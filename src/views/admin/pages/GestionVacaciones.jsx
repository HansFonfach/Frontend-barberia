import React, { useState, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  Container,
  Card,
  CardBody,
  CardHeader,
  Row,
  Col,
  Button,
  Badge,
  Alert,
  Spinner,
  Input,
  FormGroup,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { Palmtree, Trash2, User, AlertTriangle } from "lucide-react";
import UserHeader from "components/Headers/UserHeader";
import { useUsuario } from "context/usuariosContext";
import { useHorario } from "context/HorarioContext";
import Swal from "sweetalert2";
import dayjs from "dayjs";

const GestionVacaciones = () => {
  const { barberos } = useUsuario();
  const { crearVacaciones, eliminarVacaciones, obtenerVacacionesBarbero } =
    useHorario();

  const [barberoId, setBarberoId] = useState("");
  const [rangos, setRangos] = useState([]);
  const [seleccion, setSeleccion] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [modalConfirm, setModalConfirm] = useState(false);
  const [advertencia, setAdvertencia] = useState(null);

  const barberoSeleccionado = barberos.find((b) => b._id === barberoId);

  const cargarVacaciones = useCallback(async () => {
    if (!barberoId) return;

    setCargando(true);

    try {
      const data = await obtenerVacacionesBarbero(barberoId);
      setRangos(data.rangos || []);
    } catch {
      setError("Error al cargar vacaciones");
    } finally {
      setCargando(false);
    }
  }, [barberoId]);

  useEffect(() => {
    cargarVacaciones();
    setSeleccion(null);
    setMotivo("");
    setMensaje("");
    setError("");
  }, [cargarVacaciones]);

  const fechasBloqueadas = new Set(
    rangos.flatMap(({ fechaInicio, fechaFin }) => {
      const dias = [];
      let cursor = dayjs(fechaInicio);
      const fin = dayjs(fechaFin);

      while (cursor.isBefore(fin, "day") || cursor.isSame(fin, "day")) {
        dias.push(cursor.format("YYYY-MM-DD"));
        cursor = cursor.add(1, "day");
      }

      return dias;
    })
  );

  const tileClassName = ({ date }) => {
    const str = dayjs(date).format("YYYY-MM-DD");

    if (fechasBloqueadas.has(str)) return "dia-vacaciones";

    if (seleccion && seleccion.length === 2) {
      const [ini, fin] = seleccion;

      const d = dayjs(date);
      const inicio = dayjs(ini);
      const finD = dayjs(fin);

      if (
        (d.isAfter(inicio, "day") || d.isSame(inicio, "day")) &&
        (d.isBefore(finD, "day") || d.isSame(finD, "day"))
      ) {
        return "dia-seleccionado";
      }
    }

    return null;
  };

  const tileDisabled = ({ date }) => {
    const str = dayjs(date).format("YYYY-MM-DD");

    return (
      date < new Date(new Date().setHours(0, 0, 0, 0)) ||
      fechasBloqueadas.has(str)
    );
  };

  const onSeleccionarRango = (value) => {
    if (Array.isArray(value)) {
      setSeleccion(value);
      setAdvertencia(null);
    }
  };

  const onConfirmarBloqueo = async () => {
    if (!seleccion || !barberoId) return;

    setGuardando(true);
    setError("");

    const fechaInicio = dayjs(seleccion[0]).format("YYYY-MM-DD");
    const fechaFin = dayjs(seleccion[1]).format("YYYY-MM-DD");

    try {
      const res = await crearVacaciones(
        barberoId,
        fechaInicio,
        fechaFin,
        motivo
      );

      if (res.advertencia) {
        setAdvertencia(res);
      }

      setMensaje(`✅ ${res.diasBloqueados} día(s) bloqueado(s) correctamente`);

      setSeleccion(null);
      setMotivo("");
      setModalConfirm(false);

      await cargarVacaciones();
    } catch {
      setError("Error al crear el bloqueo de vacaciones");
    } finally {
      setGuardando(false);
    }
  };

  const onEliminarRango = async (rango) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar vacaciones?",
      text: `Del ${rango.fechaInicio} al ${rango.fechaFin}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
     await eliminarVacaciones(rango._id)

      setMensaje("✅ Vacaciones eliminadas correctamente");

      await cargarVacaciones();
    } catch {
      setError("Error al eliminar vacaciones");
    }
  };

  return (
    <>
      <UserHeader />

      <style>{`
        .dia-vacaciones {
          background: #f5365c !important;
          color: white !important;
          border-radius: 6px;
        }

        .dia-seleccionado {
          background: #5e72e4 !important;
          color: white !important;
          border-radius: 6px;
        }

        .react-calendar {
          width: 100% !important;
          border: none !important;
          font-family: inherit !important;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          padding: 16px;
        }

        .react-calendar__tile {
          border-radius: 8px;
          padding: 12px 4px;
          font-size: 0.9rem;
          transition: all 0.15s ease;
        }

        .react-calendar__tile:hover {
          background: #eef2ff;
          transform: scale(1.05);
        }

        .react-calendar__tile--active {
          background: #5e72e4 !important;
          color: white !important;
        }

        .react-calendar__navigation button {
          font-weight: 600;
          font-size: 1rem;
        }
      `}</style>

      <Container className="mt--7 mb-5" fluid>
        <Row className="justify-content-center">
          <Col xl="10" lg="12">
            <Card className="shadow mb-4">
              <CardHeader className="bg-gradient-danger text-white d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <Palmtree size={22} className="me-2" />
                  <h5 className="mb-0">Gestión de Vacaciones</h5>
                </div>

                {barberoSeleccionado && (
                  <Badge color="light" className="text-danger px-3 py-2">
                    <User size={14} className="me-1" />
                    {barberoSeleccionado.nombre}{" "}
                    {barberoSeleccionado.apellido}
                  </Badge>
                )}
              </CardHeader>

              <CardBody>
                {mensaje && (
                  <Alert color="success" toggle={() => setMensaje("")}>
                    {mensaje}
                  </Alert>
                )}

                {error && (
                  <Alert color="danger" toggle={() => setError("")}>
                    {error}
                  </Alert>
                )}

                {advertencia?.reservasExistentes?.length > 0 && (
                  <Alert color="warning">
                    <AlertTriangle size={16} className="me-2" />
                    <strong>Atención:</strong> {advertencia.advertencia}

                    <ul className="mt-2 mb-0 small">
                      {advertencia.reservasExistentes.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </Alert>
                )}

                <FormGroup>
                  <Label className="font-weight-bold">
                    Seleccionar Profesional
                  </Label>

                  <Input
                    type="select"
                    value={barberoId}
                    onChange={(e) => setBarberoId(e.target.value)}
                  >
                    <option value="">-- Elige un profesional --</option>

                    {barberos.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.nombre} {b.apellido}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </CardBody>
            </Card>

            {barberoId && (
              <Row>
                <Col lg="8" className="mb-4">
                  <Card className="shadow h-100">
                    <CardHeader className="bg-white border-bottom-0 pt-4 pb-0">
                      <h6 className="text-muted mb-0">
                        Selecciona un rango de fechas para bloquear
                      </h6>

                      <small className="text-muted">
                        Haz clic en el día de inicio y luego en el día de fin
                      </small>
                    </CardHeader>

                    <CardBody>
                      {cargando ? (
                        <div className="text-center py-5">
                          <Spinner color="danger" />
                        </div>
                      ) : (
                        <Calendar
                          selectRange
                          onChange={onSeleccionarRango}
                          value={seleccion}
                          tileClassName={tileClassName}
                          tileDisabled={tileDisabled}
                          locale="es-CL"
                          minDate={new Date()}
                        />
                      )}

                      {seleccion && seleccion.length === 2 && (
                        <div className="mt-4">
                          <div className="mb-3 text-center">
                            <Badge color="primary" pill className="px-4 py-2">
                              {dayjs(seleccion[0]).format("DD MMM")} →{" "}
                              {dayjs(seleccion[1]).format("DD MMM")}
                            </Badge>
                          </div>

                          <FormGroup>
                            <Label className="font-weight-bold small">
                              Motivo (opcional)
                            </Label>

                            <Input
                              type="text"
                              placeholder="Ej: Vacaciones de verano"
                              value={motivo}
                              onChange={(e) => setMotivo(e.target.value)}
                            />
                          </FormGroup>

                          <Button
                            color="danger"
                            block
                            onClick={() => setModalConfirm(true)}
                          >
                            Bloquear período
                          </Button>

                          <Button
                            color="link"
                            block
                            className="text-muted mt-1"
                            onClick={() => setSeleccion(null)}
                          >
                            Cancelar selección
                          </Button>
                        </div>
                      )}

                      <div className="mt-4 d-flex gap-3 flex-wrap">
                        <Badge color="danger" pill>
                          Bloqueado
                        </Badge>

                        <Badge color="primary" pill>
                          Seleccionado
                        </Badge>
                      </div>
                    </CardBody>
                  </Card>
                </Col>

                <Col lg="4" className="mb-4">
                  <Card className="shadow h-100">
                    <CardHeader className="bg-white border-bottom-0 pt-4 pb-0">
                      <h6 className="text-muted mb-0">Períodos bloqueados</h6>
                    </CardHeader>

                    <CardBody>
                      {rangos.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                          <Palmtree size={36} className="mb-2 opacity-50" />

                          <p className="small">
                            No hay vacaciones registradas
                          </p>
                        </div>
                      ) : (
                        rangos.map((rango, i) => (
                          <div
                            key={i}
                            className="d-flex align-items-center justify-content-between p-3 mb-3 rounded shadow-sm"
                            style={{
                              background: "#fff5f5",
                              border: "1px solid #ffd6d6",
                            }}
                          >
                            <div className="d-flex gap-2">
                              <Palmtree
                                size={18}
                                className="text-danger mt-1"
                              />

                              <div>
                                <div className="font-weight-bold text-danger small">
                                  {dayjs(rango.fechaInicio).format(
                                    "DD/MM/YYYY"
                                  )}{" "}
                                  →{" "}
                                  {dayjs(rango.fechaFin).format("DD/MM/YYYY")}
                                </div>

                                {rango.motivo && (
                                  <small className="text-muted">
                                    {rango.motivo}
                                  </small>
                                )}

                                <div>
                                  <Badge
                                    color="danger"
                                    pill
                                    className="mt-1"
                                    style={{ fontSize: "0.65rem" }}
                                  >
                                    {dayjs(rango.fechaFin).diff(
                                      dayjs(rango.fechaInicio),
                                      "day"
                                    ) + 1}{" "}
                                    día(s)
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <Button
                              size="sm"
                              color="danger"
                              outline
                              onClick={() => onEliminarRango(rango)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        ))
                      )}
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            )}
          </Col>
        </Row>
      </Container>

      <Modal isOpen={modalConfirm} toggle={() => setModalConfirm(false)} centered>
        <ModalHeader toggle={() => setModalConfirm(false)}>
          Confirmar bloqueo de vacaciones
        </ModalHeader>

        <ModalBody>
          <p>
            ¿Estás seguro de bloquear al profesional{" "}
            <strong>{barberoSeleccionado?.nombre}</strong> durante:
          </p>

          {seleccion && (
            <div className="text-center py-3">
              <Badge
                color="danger"
                className="px-4 py-2"
                style={{ fontSize: "1rem" }}
              >
                {dayjs(seleccion[0]).format("DD/MM/YYYY")} →{" "}
                {dayjs(seleccion[1]).format("DD/MM/YYYY")}
              </Badge>

              <div className="mt-2 text-muted small">
                {dayjs(seleccion[1]).diff(dayjs(seleccion[0]), "day") + 1} días
                en total
              </div>
            </div>
          )}

          <Alert color="warning" className="mt-3 small">
            <AlertTriangle size={14} className="me-1" />
            Si hay reservas en estos días, deberás gestionarlas manualmente.
          </Alert>
        </ModalBody>

        <ModalFooter>
          <Button
            color="secondary"
            outline
            onClick={() => setModalConfirm(false)}
          >
            Cancelar
          </Button>

          <Button
            color="danger"
            onClick={onConfirmarBloqueo}
            disabled={guardando}
          >
            {guardando ? <Spinner size="sm" /> : "Confirmar bloqueo"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default GestionVacaciones;
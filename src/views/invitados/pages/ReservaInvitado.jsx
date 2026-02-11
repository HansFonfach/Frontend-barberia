import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Card,
  CardBody,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Input,
  Badge,
  Row,
  Col,
} from "reactstrap";
import {
  Scissors,
  Clock,
  User,
  Calendar,
  CheckCircle,
  Info,
  ChevronRight,
} from "lucide-react";

// Componentes compartidos
import StepIndicator from "components/reserva/StepIndicator";
import ServicioSelector from "components/reserva/ServicioSelector";
import BarberoSelector from "components/reserva/BarberoSelector";
import WeekSelector from "components/reserva/WeekSelector";
import HorasDisponibles from "components/reserva/HorasDisponibles";
import ResumenReserva from "components/reserva/ResumenReserva";

// Context / hooks
import { useServicios } from "context/ServiciosContext";
import { useReservaInvitado } from "hooks/useReservaInvitado";

const ReservarHoraInvitado = () => {
  const { serviciosBarberos, cargarServiciosBarbero } = useServicios();
  const {
    fecha,
    barbero,
    hora,
    servicio,
    pasoActual,
    reservando,
    loadingServicios,
    weekStart,
    weekDays,
    loadingWeek,
    servicios = [],
    barberos = [],
    horasDisponibles,
    mensajeHoras,
    cargandoHoras,
    horasDataCompleta,
    invitado,
    setInvitado,
    handleSelectDay,
    prevWeek,
    nextWeek,
    handleSeleccionarServicio,
    handleSeleccionarBarbero,
    setHora,
    reservarComoInvitado,
  } = useReservaInvitado();

  const [modalInvitado, setModalInvitado] = useState(false);
  const toggleModalInvitado = () => setModalInvitado(!modalInvitado);

  const invitadoValido =
    invitado.nombre &&
    invitado.apellido &&
    invitado.rut &&
    invitado.telefono &&
    invitado.email;

  // Cargar servicios por barbero
  useEffect(() => {
    if (!servicio || !Array.isArray(barberos)) return;

    barberos.forEach((b) => {
      if (!serviciosBarberos[b._id]) {
        cargarServiciosBarbero(b._id);
      }
    });
  }, [servicio, barberos, serviciosBarberos, cargarServiciosBarbero]);

  const servicioSeleccionado = useMemo(() => {
    if (!servicio || !Array.isArray(servicios)) return null;
    const servicioInfo = servicios.find(
      (s) =>
        String(s._id) === String(servicio) || String(s.id) === String(servicio),
    );
    if (!servicioInfo) return null;
    let duracion = servicioInfo.duracion || 60;
    if (barbero) {
      const serviciosDelBarbero = serviciosBarberos[barbero] || [];
      const sb = serviciosDelBarbero.find(
        (s) => String(s.servicioId) === String(servicio),
      );
      if (sb?.duracion) duracion = sb.duracion;
    }
    return { ...servicioInfo, duracion };
  }, [servicio, barbero, servicios, serviciosBarberos]);

  const barberoSeleccionado = useMemo(() => {
    if (!barbero || !Array.isArray(barberos)) return null;
    return barberos.find((b) => b._id === barbero) || null;
  }, [barbero, barberos]);

  const barberosFiltrados = servicio
    ? barberos.filter((b) => {
        const serviciosB = serviciosBarberos[b._id] || [];
        return serviciosB.some(
          (s) => String(s.servicioId?._id || s.servicioId) === String(servicio),
        );
      })
    : [];

  // Calcular progreso para el indicador visual
  const progresoPasos = useMemo(() => {
    let pasosCompletados = 0;
    if (servicio) pasosCompletados++;
    if (barbero) pasosCompletados++;
    if (fecha) pasosCompletados++;
    if (hora) pasosCompletados++;
    return (pasosCompletados / 4) * 100;
  }, [servicio, barbero, fecha, hora]);

  if (loadingServicios) {
    return (
      <Container className="mt-7 py-5 text-center">
        <div
          className="spinner-border text-success mb-3"
          style={{ width: "3rem", height: "3rem" }}
        />
        <h5 className="text-dark mt-3">Cargando disponibilidad</h5>
        <p className="text-muted">
          Estamos preparando las mejores opciones para ti...
        </p>
      </Container>
    );
  }

  return (
    <Container className="mt-5 mb-5" style={{ maxWidth: "1200px" }}>
      {/* BARRA DE PROGRESO VISUAL */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="small text-muted">Progreso de tu reserva</span>
          <span className="small fw-bold text-success">
            {Math.round(progresoPasos)}%
          </span>
        </div>
        <div
          className="progress"
          style={{ height: "6px", borderRadius: "3px" }}
        >
          <div
            className="progress-bar bg-success"
            style={{ width: `${progresoPasos}%` }}
          />
        </div>
      </div>

      <StepIndicator pasoActual={pasoActual} />

      <Card className="shadow-lg rounded-4 border-0 bg-white overflow-hidden">
        {/* HEADER CON GRADIENTE SUTIL */}
        <div className="bg-success bg-gradient p-4 text-white position-relative">
          <div className="d-flex align-items-center">
            <div>
              <h1 className="h3 mb-1 fw-bold text-white">Reserva tu hora</h1>
              <p className="mb-0 opacity-40">
                <Calendar
                  size={16}
                  className="me-1"
                  style={{ marginTop: "-3px" }}
                />
                Sin cuenta, sin complicaciones
              </p>
            </div>
          </div>
          
        </div>

        <CardBody className="p-4 p-lg-5">
          <Row>
            {/* COLUMNA DE SELECCIÓN */}
            <Col lg={7} md={12} className="pe-lg-4 border-end-lg">
              {/* SERVIDOR DE PROGRESO DE PASOS */}
              <div className="mb-4">
                <h6 className="text-uppercase small fw-bold text-success mb-3">
                  <CheckCircle size={14} className="me-1" />
                  Personaliza tu servicio
                </h6>
              </div>

              <ServicioSelector
                servicios={servicios}
                servicio={servicio}
                onSeleccionarServicio={handleSeleccionarServicio}
              />

              {servicio && (
                <>
                  <div className="d-flex align-items-center mt-4 mb-3">
                    <div className="bg-success-light rounded-circle p-1 me-2">
                      <User size={14} className="text-success" />
                    </div>
                    <h6 className="mb-0 text-muted small fw-bold text-uppercase tracking-wide">
                      Elige tu barbero
                    </h6>
                    {barberoSeleccionado && (
                      <Badge
                        color="success"
                        pill
                        className="ms-2 bg-opacity-25 text-success"
                      >
                        Seleccionado
                      </Badge>
                    )}
                  </div>
                  <BarberoSelector
                    barberos={barberosFiltrados}
                    barbero={barbero}
                    onSeleccionarBarbero={handleSeleccionarBarbero}
                  />
                </>
              )}

              {servicio && barbero && (
                <>
                  <div className="d-flex align-items-center mt-5 mb-3">
                    <div className="bg-success-light rounded-circle p-1 me-2">
                      <Calendar size={14} className="text-success" />
                    </div>
                    <h6 className="mb-0 text-muted small fw-bold text-uppercase tracking-wide">
                      Fecha disponible
                    </h6>
                  </div>
                  <WeekSelector
                    weekStart={weekStart}
                    weekDays={weekDays}
                    loadingWeek={loadingWeek}
                    fecha={fecha}
                    onSelectDay={handleSelectDay}
                    onPrevWeek={prevWeek}
                    onNextWeek={nextWeek}
                    barberoId={barbero}
                    barberoInfo={barberoSeleccionado}
                  />
                </>
              )}

              {fecha && barbero && servicio && (
                <>
                  <div className="d-flex align-items-center mt-5 mb-3">
                    <div className="bg-success-light rounded-circle p-1 me-2">
                      <Clock size={14} className="text-success" />
                    </div>
                    <h6 className="mb-0 text-muted small fw-bold text-uppercase tracking-wide">
                      Horarios disponibles
                    </h6>
                    {servicioSeleccionado?.duracion && (
                      <Badge color="light" pill className="ms-2 text-muted">
                        {servicioSeleccionado.duracion} min
                      </Badge>
                    )}
                  </div>
                  <HorasDisponibles
                    horasDisponibles={horasDisponibles}
                    mensajeHoras={mensajeHoras}
                    cargandoHoras={cargandoHoras}
                    duracionSeleccionado={servicioSeleccionado?.duracion}
                    hora={hora}
                    onSeleccionarHora={setHora}
                    horasDataCompleta={horasDataCompleta}
                    fecha={fecha}
                    barberoId={barbero}
                  />
                </>
              )}

              {/* MENSAJE DE AYUDA */}
              {(!servicio || !barbero || !fecha || !hora) && (
                <div className="mt-5 p-3 bg-white rounded-3 d-flex align-items-start">
                  <Info
                    size={18}
                    className="text-success me-2 flex-shrink-0 mt-1"
                  />
                  <p className="small text-muted mb-0">
                    {!servicio && "Selecciona un servicio para comenzar"}
                    {servicio &&
                      !barbero &&
                      "Elige tu barbero preferido para ver su disponibilidad"}
                    {servicio &&
                      barbero &&
                      !fecha &&
                      "Elige una fecha disponible"}
                    {servicio &&
                      barbero &&
                      fecha &&
                      !hora &&
                      "Selecciona la hora que mejor te acomode"}
                  </p>
                </div>
              )}
            </Col>

            {/* COLUMNA DE RESUMEN - MÁS DESTACADA */}
            <Col lg={5} md={12} className="ps-lg-4">
              <div className="sticky-top" style={{ top: "20px", zIndex: 1 }}>
                <div className="bg-white p-4 rounded-4 border">
                  <div className="d-flex align-items-center mb-4">
                    <h5 className="mb-0 fw-bold">Resumen de tu reserva</h5>
                  </div>

                  <ResumenReserva
                    rut={invitado.rut}
                    usuarioEncontrado={invitado}
                    servicioSeleccionado={servicioSeleccionado}
                    barberoSeleccionado={barberoSeleccionado}
                    fecha={fecha}
                    hora={hora}
                    reservando={reservando}
                    cargandoHoras={cargandoHoras}
                    onReservar={toggleModalInvitado}
                    habilitado={
                      servicio && barbero && fecha && hora && !reservando
                    }
                    mostrarInfo={!hora}
                  />

                  {/* BOTÓN DE RESERVA DESTACADO */}
                </div>

                {/* BADGES DE CONFIABILIDAD */}
                <div className="d-flex justify-content-center gap-3 mt-4">
                  <div className="d-flex align-items-center">
                    <CheckCircle size={14} className="text-success me-1" />
                    <span className="small text-muted">Sin registro</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <CheckCircle size={14} className="text-success me-1" />
                    <span className="small text-muted">Cancelación gratis</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <CheckCircle size={14} className="text-success me-1" />
                    <span className="small text-muted">Pago en local</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* MODAL DE DATOS - MEJORADO */}
      <Modal
        isOpen={modalInvitado}
        toggle={toggleModalInvitado}
        centered
        className="rounded-4"
      >
        <ModalHeader
          toggle={toggleModalInvitado}
          className="border-0 pb-0 pt-4"
        >
          <div className="d-flex align-items-center">
            <div>
              <h5 className="mb-0 p-2 me-2">Tus datos personales</h5>
              <p className="text-muted small mb-0 p-2 me-2">
                Completa la información para confirmar
              </p>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="pt-2 pb-4 px-4 ">
          <div className="border-1 mb-3 p-3  rounded-3   bg-info">
            <div className="d-flex justify-content-between  align-items-center mb-2">
              <span className="small fw-bold text-white">Resumen rápido</span>
            </div>
            <div className="small ">
              {servicioSeleccionado?.nombre && (
                <div className="d-flex justify-content-between  ">
                  <span className="text-white">Servicio:</span>
                  <span className="text-white">
                    {servicioSeleccionado.nombre}
                  </span>
                </div>
              )}
              {barberoSeleccionado?.nombre && (
                <div className="d-flex justify-content-between">
                  <span className="text-white">Barbero:</span>
                  <span className="fw-medium text-white">
                    {barberoSeleccionado.nombre}
                  </span>
                </div>
              )}
              {fecha && hora && (
                <div className="d-flex justify-content-between">
                  <span className="text-white">Fecha y hora:</span>
                  <span className="text-white">
                    {new Date(fecha).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    - {hora}
                  </span>
                </div>
              )}
            </div>
          </div>
          <Input
            className="mb-2 p-3 border-3  rounded-3"
            placeholder="RUT"
            value={invitado.rut}
            onChange={(e) => setInvitado({ ...invitado, rut: e.target.value })}
          />

          <Input
            className="mb-2 p-3 border-3  rounded-3 "
            placeholder="Nombre"
            value={invitado.nombre}
            onChange={(e) =>
              setInvitado({ ...invitado, nombre: e.target.value })
            }
          />
          <Input
            className="mb-2 p-3 border-3  rounded-3"
            placeholder="Apellido"
            value={invitado.apellido}
            onChange={(e) =>
              setInvitado({ ...invitado, apellido: e.target.value })
            }
          />

          <Input
            className="mb-2 p-3 border-3  rounded-3"
            placeholder="Teléfono"
            value={invitado.telefono}
            onChange={(e) =>
              setInvitado({ ...invitado, telefono: e.target.value })
            }
          />
          <Input
            className="mb-2 p-3 border-3  rounded-3"
            placeholder="Email"
            type="email"
            value={invitado.email}
            onChange={(e) =>
              setInvitado({ ...invitado, email: e.target.value })
            }
          />

          <Button
            color="success"
            size="lg"
            className="w-100 mt-4 rounded-3 fw-bold"
            disabled={!invitadoValido || reservando}
            onClick={() => {
              reservarComoInvitado();
              toggleModalInvitado();
            }}
          >
            {reservando ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Reservando...
              </>
            ) : (
              "Confirmar reserva"
            )}
          </Button>

          <p className="text-center text-muted small mt-3 mb-0">
            Al reservar confirmas que aceptas nuestros términos y condiciones
          </p>
        </ModalBody>
      </Modal>
    </Container>
  );
};

export default ReservarHoraInvitado;

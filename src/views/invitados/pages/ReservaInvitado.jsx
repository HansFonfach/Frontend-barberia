// src/views/invitados/pages/ReservaInvitado.jsx
import React, { useState, useMemo, useEffect } from "react";
import {
  Container,
  Card,
  CardBody,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Input,
  Row,
  Col,
} from "reactstrap";
import { Info } from "lucide-react";
import { FaPhone } from "react-icons/fa";
import { useParams } from "react-router-dom";

import StepIndicator from "components/reserva/StepIndicator";
import ServicioSelector from "components/reserva/ServicioSelector";
import BarberoSelector from "components/reserva/BarberoSelector";
import WeekSelector from "components/reserva/WeekSelector";
import HorasDisponibles from "components/reserva/HorasDisponibles";
import ResumenReserva from "components/reserva/ResumenReserva";

import { useReservaInvitado } from "hooks/useReservaInvitado";
import AuthFooter from "components/Footers/AuthFooter";
import logo from "assets/img/logo4.png";
import { useRutValidator } from "hooks/useRutValidador";

const ReservarHoraInvitado = () => {
  const { slug } = useParams();

  const {
    servicios,
    barberosFiltrados,
    servicio,
    barbero,
    fecha,
    hora,
    weekStart,
    weekDays,
    loadingWeek,
    horasDisponibles,
    cargandoHoras,
    mensajeHoras,
    horasDataCompleta,
    duracionServicio,
    invitado,
    setInvitado,
    loadingServicios,
    reservando,
    pasoActual,
    handleSeleccionarServicio,
    handleSeleccionarBarbero,
    handleSelectDay,
    prevWeek,
    nextWeek,
    setHora,
    reservarComoInvitado,
  } = useReservaInvitado(slug);

  const {
    rut: rutInvitado,
    handleRutChange,
    error: rutError,
  } = useRutValidator();

  useEffect(() => {
    setInvitado((prev) => ({ ...prev, rut: rutInvitado }));
  }, [rutInvitado]);

  const [modalInvitado, setModalInvitado] = useState(false);
  const toggleModalInvitado = () => setModalInvitado(!modalInvitado);

  const invitadoValido =
    invitado.nombre &&
    invitado.apellido &&
    rutInvitado &&
    !rutError &&
    invitado.telefono?.length === 8 &&
    invitado.email;

  const servicioSeleccionado = useMemo(() => {
    if (!servicio) return null;
    return servicios.find((s) => String(s._id) === String(servicio)) || null;
  }, [servicio, servicios]);

  const barberoSeleccionado = useMemo(() => {
    if (!barbero) return null;
    return barberosFiltrados.find((b) => b._id === barbero) || null;
  }, [barbero, barberosFiltrados]);

  const progresoPasos = useMemo(() => {
    let pasos = 0;
    if (servicio) pasos++;
    if (barbero) pasos++;
    if (fecha) pasos++;
    if (hora) pasos++;
    return (pasos / 4) * 100;
  }, [servicio, barbero, fecha, hora]);

  if (loadingServicios) {
    return (
      <Container className="mt-7 py-5 text-center">
        <div className="spinner-border text-success mb-3" />
        <h5>Cargando disponibilidad</h5>
      </Container>
    );
  }

  return (
    <div className="bg-white">
      {/* HERO - Estilo moderno oscuro */}
      <div
        className="position-relative bg-darker py-7 py-lg-8"
        style={{
          background: "linear-gradient(150deg, #172b4d 0%, #1a174d 100%)",
          minHeight: "40vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg="8">
              <img
                src={logo}
                alt="Logo"
                className="img-fluid mb-4 floating"
                style={{
                  width: "150px",
                  filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.3))",
                }}
              />
              <h1 className="display-2 text-white font-weight-bold mb-2">
                Reserva tu hora
              </h1>
              <p className="lead text-light mb-5">
                Sin cuenta, sin complicaciones. Completa los pasos y asegura tu
                cita.
              </p>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Contenido principal */}
      <Container className="mt-5 mb-5" style={{ maxWidth: "1200px" }}>
        {/* PROGRESO */}
        <div className="mb-4">
          <div className="d-flex justify-content-between">
            <span className="small text-muted">Progreso</span>
            <span className="small fw-bold text-success">
              {Math.round(progresoPasos)}%
            </span>
          </div>
          <div className="progress" style={{ height: 6 }}>
            <div
              className="progress-bar bg-success"
              style={{ width: `${progresoPasos}%` }}
            />
          </div>
        </div>

        <StepIndicator pasoActual={pasoActual} />

        <Card className="shadow-lg border-0">
          <div className="bg-success p-4 text-white">
            <h3 className="mb-1">Reserva tu hora</h3>
            <small>Sin cuenta, sin complicaciones</small>
          </div>

          <CardBody className="p-4">
            <Row>
              <Col lg={7}>
                <ServicioSelector
                  servicios={servicios}
                  servicio={servicio}
                  onSeleccionarServicio={handleSeleccionarServicio}
                />

                {servicio && (
                  <BarberoSelector
                    barberos={barberosFiltrados}
                    barbero={barbero}
                    onSeleccionarBarbero={handleSeleccionarBarbero}
                  />
                )}

                {servicio && barbero && (
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
                )}

                {servicio && barbero && fecha && (
                  <HorasDisponibles
                    horasDisponibles={horasDisponibles}
                    mensajeHoras={mensajeHoras}
                    cargandoHoras={cargandoHoras}
                    hora={hora}
                    onSeleccionarHora={setHora}
                    fecha={fecha}
                    barberoId={barbero}
                    duracionSeleccionado={duracionServicio}
                    horasDataCompleta={horasDataCompleta}
                    esInvitado={true}
                  />
                )}

                {(!servicio || !barbero || !fecha || !hora) && (
                  <div className="mt-4 d-flex">
                    <Info className="me-2 text-success" />
                    <small className="text-muted">
                      Sigue los pasos para completar tu reserva
                    </small>
                  </div>
                )}
              </Col>

              <Col lg={5}>
                <ResumenReserva
                  servicioSeleccionado={servicioSeleccionado}
                  barberoSeleccionado={barberoSeleccionado}
                  fecha={fecha}
                  hora={hora}
                  reservando={reservando}
                  onReservar={toggleModalInvitado}
                  habilitado={servicio && barbero && fecha && hora}
                />
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* MODAL INVITADO */}
        <Modal isOpen={modalInvitado} toggle={toggleModalInvitado} centered>
          <ModalHeader toggle={toggleModalInvitado}>
            Datos del cliente
          </ModalHeader>
          <ModalBody>
            {/* RUT */}
            <Input
              className={`mb-2 ${rutError ? "is-invalid" : ""}`}
              placeholder="Ingrese RUT sin puntos ni guión"
              value={rutInvitado}
              maxLength={12}
              onChange={handleRutChange} // ← ya no necesitas setInvitado aquí
            />
            {rutError && (
              <div className="invalid-feedback d-block mb-2">{rutError}</div>
            )}

            {/* Nombre */}
            <Input
              className="mb-2"
              placeholder="Nombre"
              value={invitado.nombre}
              onChange={(e) =>
                setInvitado({ ...invitado, nombre: e.target.value })
              }
            />

            {/* Apellido */}
            <Input
              className="mb-2"
              placeholder="Apellido"
              value={invitado.apellido}
              onChange={(e) =>
                setInvitado({ ...invitado, apellido: e.target.value })
              }
            />

            {/* Teléfono */}
            <div className="mb-2">
              <div
                className="d-flex align-items-center rounded input-group-alternative"
                style={{
                  border: "1px solid #cad1d7",
                  backgroundColor: "#fff",
                  transition: "all 0.15s ease",
                }}
              >
                {/* Prefijo */}
                <div
                  className="d-flex align-items-center px-3 py-2"
                  style={{
                    backgroundColor: "#f7fafc",
                    borderRight: "1px solid #cad1d7",
                    whiteSpace: "nowrap",
                  }}
                >
                  <FaPhone size={13} className="text-success me-2" />
                  <span
                    className="text-muted fw-bold"
                    style={{ fontSize: "0.85rem" }}
                  >
                    +569
                  </span>
                </div>

                {/* Input estilo Argon */}
                <input
                  placeholder="Ingrese teléfono"
                  type="text"
                  value={invitado.telefono}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "");
                    if (value.length > 8) value = value.slice(0, 8);
                    setInvitado({ ...invitado, telefono: value });
                  }}
                  className="form-control"
                  style={{
                    border: "none",
                    boxShadow: "none",
                    backgroundColor: "transparent",
                    padding: "0.65rem 0.75rem",
                    fontSize: "0.875rem",
                  }}
                />

                {/* Indicador */}
                {invitado.telefono && (
                  <div className="px-2">
                    {invitado.telefono.length === 8 ? (
                      <span className="text-success fw-bold">✓</span>
                    ) : (
                      <span className="text-muted small">
                        {invitado.telefono.length}/8
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Error */}
              {invitado.telefono && invitado.telefono.length !== 8 && (
                <small className="text-danger ms-1">
                  El teléfono debe tener 8 dígitos
                </small>
              )}
            </div>

            {/* Email */}
            <Input
              className="mb-3"
              placeholder="Email"
              type="email"
              value={invitado.email}
              onChange={(e) =>
                setInvitado({ ...invitado, email: e.target.value })
              }
            />

            <Button
              color="success"
              block
              disabled={!invitadoValido || reservando}
              onClick={() => {
                reservarComoInvitado();
                toggleModalInvitado();
              }}
            >
              {reservando ? "Reservando..." : "Confirmar reserva"}
            </Button>
          </ModalBody>
        </Modal>
      </Container>

      <AuthFooter />
    </div>
  );
};

export default ReservarHoraInvitado;

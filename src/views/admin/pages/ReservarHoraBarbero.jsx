// src/views/admin/pages/ReservarHoraBarbero.jsx
import React from "react";
import {
  Container,
  Card,
  CardBody,
  Modal,
  ModalHeader,
  ModalBody,
  Input,
  Button,
} from "reactstrap";
import { CalendarCheck, Scissors, UserPlus } from "lucide-react";
import { FaPhone } from "react-icons/fa";
import Swal from "sweetalert2";
import UserHeader from "components/Headers/UserHeader.js";

// Hooks y Context
import { useReservaBarbero } from "../../../hooks/useReservaBarbero";
import { useHorario } from "context/HorarioContext";

// Componentes
import StepIndicator from "../../../components/reserva/StepIndicator";
import RutInput from "../../../components/reserva/RutInput";
import ServicioSelector from "../../../components/reserva/ServicioSelector";
import BarberoSelector from "../../../components/reserva/BarberoSelector";
import WeekSelector from "../../../components/reserva/WeekSelector";
import HorasDisponibles from "../../../components/reserva/HorasDisponibles";
import ResumenReserva from "../../../components/reserva/ResumenReserva";
import ModalHorasBase from "../../../components/reserva/ModalHorasBase";

const ReservarHoraBarbero = () => {
  const {
    fecha,
    barbero,
    hora,
    servicio,
    pasoActual,
    reservando,
    weekStart,
    weekDays,
    loadingWeek,
    servicios,

    // RUT / Usuario
    rut,
    handleRutChange,
    error,
    handleLimpiarRut,
    buscandoUsuario,
    usuarioEncontrado,
    errorBusqueda,
    cleanRut,

    // Datos
    barberos,
    horasDisponibles,
    mensajeHoras,
    cargandoHoras,

    // ✅ NUEVO: Invitado
    modoInvitado,
    modalInvitado,
    setModalInvitado,
    invitado,
    setInvitado,
    invitadoValido,
    handleConfirmarInvitado,

    // Handlers
    handleSelectDay,
    prevWeek,
    nextWeek,
    handleReservar,
    handleSeleccionarServicio,
    handleSeleccionarBarbero,
    setHora,
  } = useReservaBarbero();

  const servicioSeleccionado = servicios.find((s) => s._id === servicio);
  const duracionSeleccionado = servicioSeleccionado?.duracion || 60;
  const barberoSeleccionado = barberos.find((b) => b._id === barbero);

  // ✅ Cliente listo = usuario encontrado O modo invitado con datos completos
  const clienteListo = usuarioEncontrado || modoInvitado;

  // --- Modal waitlist ---
  const [modalNotificacionOpen, setModalNotificacionOpen] =
    React.useState(false);
  const [selectedDiaForWaitlist, setSelectedDiaForWaitlist] =
    React.useState(null);
  const [horasBase, setHorasBase] = React.useState([]);
  const [loadingHorasBase, setLoadingHorasBase] = React.useState(false);
  const [horasSeleccionadas, setHorasSeleccionadas] = React.useState([]);

  const { obtenerHorarioBasePorDia } = useHorario();

  const handleOpenWaitlist = React.useCallback(
    (data) => {
      if (!barbero) {
        Swal.fire("Error", "Debes seleccionar un barbero primero", "error");
        return;
      }
      const fechaSeleccionada = data?.fecha;
      if (!fechaSeleccionada) {
        Swal.fire("Error", "No se especificó fecha", "error");
        return;
      }
      setSelectedDiaForWaitlist(fechaSeleccionada);
      setModalNotificacionOpen(true);
    },
    [barbero],
  );

  React.useEffect(() => {
    if (!modalNotificacionOpen || !selectedDiaForWaitlist || !barbero) return;

    const fetchHoras = async () => {
      setLoadingHorasBase(true);
      setHorasBase([]);
      try {
        const resultado = await obtenerHorarioBasePorDia(
          barbero,
          selectedDiaForWaitlist,
        );
        const bloques = Array.isArray(resultado) ? resultado : [];
        const horasProcesadas = [];

        bloques.forEach((bloque) => {
          if (!bloque?.horaInicio || !bloque?.horaFin) return;
          const [hI, mI] = bloque.horaInicio.split(":").map(Number);
          const [hF, mF] = bloque.horaFin.split(":").map(Number);
          const start = hI * 60 + mI;
          const end = hF * 60 + mF;
          for (let min = start; min < end; min += 30) {
            const h = Math.floor(min / 60);
            const m = min % 60;
            horasProcesadas.push(
              `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
            );
          }
        });

        setHorasBase([...new Set(horasProcesadas)]);
      } catch (err) {
        console.error(err);
        setHorasBase([]);
      } finally {
        setLoadingHorasBase(false);
      }
    };

    fetchHoras();
  }, [modalNotificacionOpen, selectedDiaForWaitlist, barbero]);

  const toggleHoraSeleccionada = (h) => {
    setHorasSeleccionadas((prev) =>
      prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h],
    );
  };

  const guardarWaitlist = () => {
    if (!horasSeleccionadas.length) {
      Swal.fire("Atención", "Selecciona al menos una hora", "warning");
      return;
    }
    Swal.fire({ title: "¡Solicitud guardada!", icon: "success", timer: 2500 });
    cerrarModal();
  };

  const cerrarModal = () => {
    setModalNotificacionOpen(false);
    setSelectedDiaForWaitlist(null);
    setHorasSeleccionadas([]);
    setHorasBase([]);
  };

  return (
    <>
      <UserHeader />

      <Container className="mt--7 mb-5" style={{ maxWidth: "1200px" }}>
        <StepIndicator pasoActual={pasoActual} />

        <Card className="shadow-lg border-0">
          <CardBody className="p-4">
            <div className="text-center mb-4">
              <div className="bg-success rounded-circle d-inline-flex p-2 mb-3">
                <CalendarCheck size={28} className="text-white" />
              </div>
              <h2 className="h3 mb-1">Reserva de Hora para Cliente</h2>
              <p className="text-muted mb-0">
                RUT del Cliente → Servicio → Profesional → Día → Hora
              </p>
            </div>

            <div className="row">
              <div className="col-lg-7 pr-lg-4">
                {/* RUT */}
                <RutInput
                  rut={rut}
                  handleRutChange={handleRutChange}
                  errorRut={error}
                  handleLimpiarRut={handleLimpiarRut}
                  buscandoUsuario={buscandoUsuario}
                  usuarioEncontrado={usuarioEncontrado}
                  errorBusqueda={errorBusqueda}
                />

                {/* ✅ BANNER MODO INVITADO */}
                {modoInvitado && !usuarioEncontrado && (
                  <div
                    className="d-flex align-items-center justify-content-between p-3 mb-3 rounded"
                    style={{
                      backgroundColor: "#fff8e1",
                      border: "1px solid #ffe082",
                    }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <UserPlus size={18} className="text-warning" />
                      <div>
                        <p
                          className="mb-0 fw-bold"
                          style={{ fontSize: "0.9rem" }}
                        >
                          Cliente no registrado
                        </p>
                        <p
                          className="mb-0 text-muted"
                          style={{ fontSize: "0.8rem" }}
                        >
                          {invitadoValido
                            ? `${invitado.nombre} ${invitado.apellido} — Datos completos ✓`
                            : "Completa los datos para reservar como invitado"}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      color="warning"
                      outline
                      onClick={() => setModalInvitado(true)}
                    >
                      {invitadoValido ? "Editar datos" : "Ingresar datos"}
                    </Button>
                  </div>
                )}

                {/* Selectores — visibles si hay cliente listo */}
                {clienteListo && (
                  <>
                    <ServicioSelector
                      servicios={servicios}
                      servicio={servicio}
                      onSeleccionarServicio={handleSeleccionarServicio}
                    />

                    {servicio && (
                      <BarberoSelector
                        barberos={barberos}
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
                        onWaitlist={handleOpenWaitlist}
                        barberoId={barbero}
                      />
                    )}

                    {fecha && servicio && barbero && (
                      <HorasDisponibles
                        horasDisponibles={horasDisponibles}
                        mensajeHoras={mensajeHoras}
                        cargandoHoras={cargandoHoras}
                        duracionSeleccionado={duracionSeleccionado}
                        hora={hora}
                        onSeleccionarHora={setHora}
                      />
                    )}
                  </>
                )}
              </div>

              <div className="col-lg-5 pl-lg-4">
                <ResumenReserva
                  usuarioEncontrado={
                    // ✅ Si es invitado, pasamos un objeto con sus datos para el resumen
                    usuarioEncontrado ||
                    (modoInvitado && invitadoValido
                      ? {
                          nombre: invitado.nombre,
                          apellido: invitado.apellido,
                          rut,
                        }
                      : null)
                  }
                  rut={rut}
                  servicioSeleccionado={servicioSeleccionado}
                  barberoSeleccionado={barberoSeleccionado}
                  fecha={fecha}
                  hora={hora}
                  reservando={reservando}
                  cargandoHoras={cargandoHoras}
                  onReservar={handleReservar}
                  habilitado={
                    !!(
                      clienteListo &&
                      // Si es invitado, los datos deben estar completos
                      (!modoInvitado || invitadoValido) &&
                      servicio &&
                      barbero &&
                      fecha &&
                      hora &&
                      !reservando &&
                      !cargandoHoras
                    )
                  }
                  mostrarInfo={!hora}
                />
              </div>
            </div>
          </CardBody>
        </Card>
      </Container>

      {/* ✅ MODAL DATOS INVITADO */}
      <Modal
        isOpen={modalInvitado}
        toggle={() => setModalInvitado(false)}
        centered
      >
        <ModalHeader toggle={() => setModalInvitado(false)}>
          <UserPlus size={18} className="me-2" />
          Datos del cliente invitado
        </ModalHeader>
        <ModalBody>
          <p className="text-muted small mb-3">
            El RUT <strong>{rut}</strong> no está registrado. Ingresa los datos
            para continuar con la reserva.
          </p>

          <Input
            className="mb-2"
            placeholder="Nombre"
            value={invitado.nombre}
            onChange={(e) =>
              setInvitado({ ...invitado, nombre: e.target.value })
            }
          />

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
              className="d-flex align-items-center rounded"
              style={{ border: "1px solid #cad1d7", backgroundColor: "#fff" }}
            >
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
              <input
                placeholder="Teléfono (8 dígitos)"
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
                }}
              />
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
            {invitado.telefono && invitado.telefono.length !== 8 && (
              <small className="text-danger ms-1">
                El teléfono debe tener 8 dígitos
              </small>
            )}
          </div>

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
            disabled={!invitadoValido}
            onClick={handleConfirmarInvitado}
          >
            Confirmar y reservar
          </Button>
        </ModalBody>
      </Modal>

      {/* Modal waitlist — sin cambios */}
      <ModalHorasBase
        isOpen={modalNotificacionOpen}
        toggle={cerrarModal}
        dia={selectedDiaForWaitlist}
        horasBase={horasBase}
        loading={loadingHorasBase}
        horasSeleccionadas={horasSeleccionadas}
        toggleHora={toggleHoraSeleccionada}
        onGuardar={guardarWaitlist}
        barberoSeleccionado={barberoSeleccionado}
      />
    </>
  );
};

export default ReservarHoraBarbero;

// src/views/admin/pages/ReservarHoraBarbero.jsx
import React from "react";
import { Container, Card, CardBody } from "reactstrap";
import { Scissors } from "lucide-react";
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
    cleanRut, // 👈 Ahora disponible

    // Datos
    barberos,
    horasDisponibles,
    mensajeHoras,
    cargandoHoras,

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

  // Estado modal waitlist
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
    [barbero]
  );

  React.useEffect(() => {
    if (!modalNotificacionOpen || !selectedDiaForWaitlist || !barbero) return;

    const fetchHoras = async () => {
      setLoadingHorasBase(true);
      setHorasBase([]);

      try {
        const resultado = await obtenerHorarioBasePorDia(
          barbero,
          selectedDiaForWaitlist
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
              `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
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
      prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]
    );
  };

  const guardarWaitlist = () => {
    if (!horasSeleccionadas.length) {
      Swal.fire("Atención", "Selecciona al menos una hora", "warning");
      return;
    }

    Swal.fire({
      title: "¡Solicitud guardada!",
      icon: "success",
      timer: 2500,
    });

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
        {/* Botón de debug (opcional - elimina cuando funcione) */}

        <StepIndicator pasoActual={pasoActual} />

        <Card className="shadow-lg border-0">
          <CardBody className="p-4">
            <div className="text-center mb-4">
              <div className="bg-success rounded-circle d-inline-flex p-2 mb-3">
                <Scissors size={28} className="text-white" />
              </div>
              <h2 className="h3 mb-1">Reserva de Hora para Cliente</h2>
              <p className="text-muted mb-0">
                RUT del Cliente → Servicio → Barbero → Día → Hora
              </p>
            </div>

            <div className="row">
              <div className="col-lg-7 pr-lg-4">
                {/* Siempre mostrar el RUT input para barbero */}
                <RutInput
                  rut={rut}
                  handleRutChange={handleRutChange}
                  errorRut={error}
                  handleLimpiarRut={handleLimpiarRut}
                  buscandoUsuario={buscandoUsuario}
                  usuarioEncontrado={usuarioEncontrado}
                  errorBusqueda={errorBusqueda}
                />

                {/* Solo mostrar los siguientes pasos si hay usuario encontrado */}
                {usuarioEncontrado && (
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
                  usuarioEncontrado={usuarioEncontrado}
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
                      usuarioEncontrado &&
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

// src/views/admin/pages/ReservarHora.jsx
import React from "react";
import { Container, Card, CardBody } from "reactstrap";
import { Scissors } from "lucide-react";
import Swal from "sweetalert2";
import UserHeader from "components/Headers/UserHeader.js";
import { useAuth } from "context/AuthContext";

// Componentes
import StepIndicator from "../../components/reserva/StepIndicator";
import ServicioSelector from "../../components/reserva/ServicioSelector";
import BarberoSelector from "../../components/reserva/BarberoSelector";
import WeekSelector from "../../components/reserva/WeekSelector";
import HorasDisponibles from "../../components/reserva/HorasDisponibles";
import ResumenReserva from "../../components/reserva/ResumenReserva";
import ModalHorasBase from "../../components/reserva/ModalHorasBase";

// Context
import { useHorario } from "context/HorarioContext";
import { useNotificacion } from "context/NotificacionesContext";
import { useServicios } from "context/ServiciosContext";
import { useReservaCliente } from "hooks/useReservaCliente";

const ReservarHora = () => {
  const { user } = useAuth();
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

    servicios,
    barberos,

    horasDisponibles,
    mensajeHoras,
    cargandoHoras,
    duracionServicio,
    horasDataCompleta,

    handleSelectDay,
    prevWeek,
    nextWeek,
    handleReservar,
    handleSeleccionarServicio,
    handleSeleccionarBarbero,
    setHora,
  } = useReservaCliente();

  // ────────────────────────────────
  // Cargar servicios de cada barbero cuando se seleccione un servicio
  // ────────────────────────────────
  React.useEffect(() => {
    if (!servicio) return;

    barberos.forEach((b) => {
      if (!serviciosBarberos[b._id]) {
        cargarServiciosBarbero(b._id);
      }
    });
  }, [servicio, barberos, serviciosBarberos, cargarServiciosBarbero]);

  // ────────────────────────────────
  // Filtrar barberos según servicio seleccionado
  // ────────────────────────────────
  const servicioSeleccionado = React.useMemo(() => {
    if (!servicio) return null;

    // Servicio general (precio + nombre)
    const servicioInfo = servicios.find(
      (s) =>
        String(s._id) === String(servicio) || String(s.id) === String(servicio)
    );

    if (!servicioInfo) return null;

    // Duración depende del barbero
    let duracion = servicioInfo.duracion || 60;

    if (barbero) {
      const serviciosDelBarbero = serviciosBarberos[barbero] || [];
      const sb = serviciosDelBarbero.find(
        (s) => String(s.servicioId) === String(servicio)
      );

      if (sb?.duracion) {
        duracion = sb.duracion;
      }
    }

    return {
      id: servicioInfo._id,
      nombre: servicioInfo.nombre,
      descripcion: servicioInfo.descripcion,
      duracion,
      precio: servicioInfo.precio, // ✅ AHORA SÍ
    };
  }, [servicio, barbero, servicios, serviciosBarberos]);

  const barberoSeleccionado = barberos.find((b) => b._id === barbero);

  const barberosFiltrados = servicio
    ? barberos.filter((b) => {
        const serviciosB = serviciosBarberos[b._id] || [];
        return serviciosB.some((s) => {
          const servicioId = s.servicioId?._id || s.servicioId;
          return String(servicioId) === String(servicio);
        });
      })
    : [];
  // ────────────────────────────────
  // Estado modal waitlist
  // ────────────────────────────────
  const [modalNotificacionOpen, setModalNotificacionOpen] =
    React.useState(false);
  const [selectedDiaForWaitlist, setSelectedDiaForWaitlist] =
    React.useState(null);
  const [horasBase, setHorasBase] = React.useState([]);
  const [loadingHorasBase, setLoadingHorasBase] = React.useState(false);
  const [horasSeleccionadas, setHorasSeleccionadas] = React.useState([]);

  const { obtenerHorarioBasePorDia } = useHorario();
  const { crearNotificacion } = useNotificacion();

  // ────────────────────────────────
  // Abrir waitlist
  // ────────────────────────────────
  const handleOpenWaitlist = React.useCallback(
    (data) => {
      if (!barbero) {
        Swal.fire("Error", "Debes seleccionar un barbero primero", "error");
        return;
      }
      if (!data?.fecha) {
        Swal.fire("Error", "No se especificó una fecha", "error");
        return;
      }

      setSelectedDiaForWaitlist(data.fecha);
      setHorasSeleccionadas([]);
      setModalNotificacionOpen(true);
    },
    [barbero]
  );

  // ────────────────────────────────
  // Cargar horas para waitlist
  // ────────────────────────────────
  React.useEffect(() => {
    if (!modalNotificacionOpen || !selectedDiaForWaitlist || !barbero) return;

    const fetchHoras = async () => {
      setLoadingHorasBase(true);
      setHorasBase([]);

      try {
        const res = await obtenerHorarioBasePorDia(
          barbero,
          selectedDiaForWaitlist
        );

        if (Array.isArray(res?.horasDisponibles))
          setHorasBase(res.horasDisponibles);
        else if (Array.isArray(res)) setHorasBase(res);
        else setHorasBase([]);
      } catch (error) {
        console.error("❌ Error cargando horas base:", error);
        Swal.fire(
          "Error",
          "No se pudieron cargar los horarios disponibles",
          "error"
        );
        setHorasBase([]);
      } finally {
        setLoadingHorasBase(false);
      }
    };

    fetchHoras();
  }, [
    modalNotificacionOpen,
    selectedDiaForWaitlist,
    barbero,
    obtenerHorarioBasePorDia,
  ]);

  // ────────────────────────────────
  // Toggle hora seleccionada
  // ────────────────────────────────
  const toggleHoraSeleccionada = (h) => {
    setHorasSeleccionadas((prev) =>
      prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]
    );
  };

  // ────────────────────────────────
  // Guardar waitlist
  // ────────────────────────────────
  const guardarWaitlist = async () => {
    if (!barbero || !selectedDiaForWaitlist) {
      Swal.fire("Error", "Falta información", "error");
      return;
    }

    if (horasSeleccionadas.length === 0) {
      Swal.fire("Atención", "Selecciona al menos una hora", "warning");
      return;
    }

    await crearNotificacion({
      fecha: selectedDiaForWaitlist,
      horas: horasSeleccionadas,
      barberoId: barbero,
      usuarioId: user.id,
    });

    Swal.fire({
      title: "¡Solicitud guardada!",
      html: `Te notificaremos si se libera alguna de las <b>${
        horasSeleccionadas.length
      }</b> hora(s):<br><small>${horasSeleccionadas.join(", ")}</small>`,
      icon: "success",
      timer: 3000,
    });

    cerrarModal();
  };

  const cerrarModal = () => {
    setModalNotificacionOpen(false);
    setSelectedDiaForWaitlist(null);
    setHorasSeleccionadas([]);
    setHorasBase([]);
  };

  // ────────────────────────────────
  // Render
  // ────────────────────────────────
  if (loadingServicios) {
    return (
      <Container className="mt-7 py-5 text-center">
        <div className="spinner-border text-success" />
        <p className="mt-3 text-muted">Cargando disponibilidad...</p>
      </Container>
    );
  }

  return (
    <>
      <UserHeader />
      <Container className="mt--7 mb-5" style={{ maxWidth: "1200px" }}>
        <StepIndicator pasoActual={pasoActual} />

        <Card className="shadow-lg rounded-3 border-0 bg-white">
          <CardBody className="p-4">
            <div className="text-center mb-4">
              <div className="bg-success rounded-circle d-inline-flex p-2 mb-3 shadow">
                <Scissors size={28} className="text-white" />
              </div>
              <h2 className="h3 font-weight-bold text-dark mb-1">
                Reserva Tu Hora
              </h2>
              <p className="text-muted mb-0">
                Sigue los pasos: servicio → barbero → día → hora
              </p>
            </div>

            <div className="row">
              <div className="col-lg-7 col-md-12 pr-lg-4">
                {/* Selector de servicio */}
                <ServicioSelector
                  servicios={servicios}
                  servicio={servicio}
                  onSeleccionarServicio={handleSeleccionarServicio}
                />

                {/* Selector de barbero filtrado por servicio */}
                {servicio && (
                  <BarberoSelector
                    barberos={barberosFiltrados}
                    barbero={barbero}
                    onSeleccionarBarbero={handleSeleccionarBarbero}
                  />
                )}

                {/* Selector de semana */}
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
                    barberoInfo={barberoSeleccionado}
                  />
                )}

                {/* Horas disponibles según duración del servicio */}
                {fecha && barbero && servicio && (
                  <HorasDisponibles
                    horasDisponibles={horasDisponibles}
                    mensajeHoras={mensajeHoras}
                    cargandoHoras={cargandoHoras}
                    duracionSeleccionado={servicioSeleccionado?.duracion || 30}
                    hora={hora}
                    onSeleccionarHora={setHora}
                    horasDataCompleta={horasDataCompleta}
                  />
                )}
              </div>

              <div className="col-lg-5 col-md-12 pl-lg-4">
                <ResumenReserva
                  usuarioEncontrado={user}
                  rut={user?.rut}
                  servicioSeleccionado={servicioSeleccionado}
                  barberoSeleccionado={barberoSeleccionado}
                  fecha={fecha}
                  hora={hora}
                  reservando={reservando}
                  cargandoHoras={cargandoHoras}
                  onReservar={handleReservar}
                  habilitado={
                    !!(
                      user?.rut &&
                      servicio &&
                      barbero &&
                      fecha &&
                      hora &&
                      !cargandoHoras &&
                      !reservando
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

export default ReservarHora;

// src/views/admin/pages/ReservarHora.jsx
import React from "react";
import { Container, Card, CardBody } from "reactstrap";
import { Scissors } from "lucide-react";
import Swal from "sweetalert2";
import UserHeader from "components/Headers/UserHeader.js";
import { useAuth } from "context/AuthContext";

// Componentes
import { useReservaBarbero } from "../../hooks/useReservaBarbero";
import StepIndicator from "../../components/reserva/StepIndicator";
import ServicioSelector from "../../components/reserva/ServicioSelector";
import BarberoSelector from "../../components/reserva/BarberoSelector";
import WeekSelector from "../../components/reserva/WeekSelector";
import HorasDisponibles from "../../components/reserva/HorasDisponibles";
import ResumenReserva from "../../components/reserva/ResumenReserva";
import ModalHorasBase from "../../components/reserva/ModalHorasBase";

// Context
import { useHorario } from "context/HorarioContext";

const ReservarHora = () => {
  const { user } = useAuth();

  const {
    // Estado
    fecha,
    barbero,
    hora,
    servicio,
    pasoActual,
    reservando,

    // Semana
    weekStart,
    weekDays,
    loadingWeek,

    // Hooks
    servicios,

    // Barberos
    barberos,

    // Horas disponibles
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

  // ────────────────────────────────
  // Estado modal de notificación
  // ────────────────────────────────
  const [modalNotificacionOpen, setModalNotificacionOpen] = React.useState(false);
  const [selectedDiaForWaitlist, setSelectedDiaForWaitlist] = React.useState(null);
  const [horasBase, setHorasBase] = React.useState([]);
  const [loadingHorasBase, setLoadingHorasBase] = React.useState(false);
  const [horasSeleccionadas, setHorasSeleccionadas] = React.useState([]);

  const { obtenerHorarioBasePorDia } = useHorario();

  // Datos derivados
  const servicioSeleccionado = servicios.find((s) => s._id === servicio);
  const duracionSeleccionado = servicioSeleccionado?.duracion || 60;
  const barberoSeleccionado = barberos.find((b) => b._id === barbero);

  // ────────────────────────────────
  // Abrir modal para waitlist
  // ────────────────────────────────
  const handleOpenWaitlist = React.useCallback((data) => {
    console.log("📢 handleOpenWaitlist llamado con:", data);
    console.log("📢 Barbero actual del estado:", barbero);

    // Usar SIEMPRE el barbero del estado
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
  }, [barbero]);

  // ────────────────────────────────
  // Effect para cargar horas cuando el modal se abre
  // ────────────────────────────────
  React.useEffect(() => {
    if (modalNotificacionOpen && selectedDiaForWaitlist && barbero) {
      const fetchHoras = async () => {
        setLoadingHorasBase(true);
        setHorasBase([]);

        try {
          console.log("📡 Obteniendo bloques para:", barbero, selectedDiaForWaitlist);
          
          const resultado = await obtenerHorarioBasePorDia(barbero, selectedDiaForWaitlist);
          console.log("📡 Resultado completo:", resultado);

          const bloques = Array.isArray(resultado) ? resultado : [];
          const horasProcesadas = [];

          if (bloques.length === 0) {
            console.log("⚠️ No hay bloques para esta fecha");
          } else {
            bloques.forEach((bloque, index) => {
              console.log(`📦 Bloque ${index + 1}:`, bloque);

              if (bloque && bloque.horaInicio && bloque.horaFin) {
                try {
                  const horaInicioStr = bloque.horaInicio.toString().trim();
                  const horaFinStr = bloque.horaFin.toString().trim();

                  const inicioMatch = horaInicioStr.match(/^(\d{1,2}):(\d{2})$/);
                  const finMatch = horaFinStr.match(/^(\d{1,2}):(\d{2})$/);

                  if (inicioMatch && finMatch) {
                    const hStart = parseInt(inicioMatch[1], 10);
                    const mStart = parseInt(inicioMatch[2], 10);
                    const hEnd = parseInt(finMatch[1], 10);
                    const mEnd = parseInt(finMatch[2], 10);

                    console.log(`⏰ Bloque ${index + 1}: ${hStart}:${mStart} a ${hEnd}:${mEnd}`);

                    const startMin = hStart * 60 + mStart;
                    const endMin = hEnd * 60 + mEnd;

                    // ✅ CORRECCIÓN: Manejar cuando horaInicio === horaFin
                    if (hStart === hEnd && mStart === mEnd) {
                      // Solo una hora
                      horasProcesadas.push(`${String(hStart).padStart(2, "0")}:${String(mStart).padStart(2, "0")}`);
                    } else if (startMin < endMin) {
                      // Rango de horas
                      for (let min = startMin; min < endMin; min += 30) {
                        const h = Math.floor(min / 60);
                        const m = min % 60;
                        const horaStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
                        horasProcesadas.push(horaStr);
                      }
                    } else {
                      console.warn(`⚠️ Hora inicio mayor que hora fin en bloque ${index + 1}`);
                    }
                  }
                } catch (error) {
                  console.error(`❌ Error procesando bloque ${index + 1}:`, error);
                }
              }
            });
          }

          // Eliminar duplicados y ordenar
          const horasUnicas = [...new Set(horasProcesadas)].sort((a, b) => {
            const [h1, m1] = a.split(":").map(Number);
            const [h2, m2] = b.split(":").map(Number);
            return h1 * 60 + m1 - (h2 * 60 + m2);
          });

          console.log("✅ Horas finales:", horasUnicas);
          setHorasBase(horasUnicas);

        } catch (err) {
          console.error("❌ Error:", err);
          Swal.fire("Error", "No se pudieron cargar los horarios base", "error");
          setHorasBase([]);
        } finally {
          setLoadingHorasBase(false);
        }
      };

      fetchHoras();
    }
  }, [modalNotificacionOpen, selectedDiaForWaitlist, barbero, obtenerHorarioBasePorDia]);

  // ────────────────────────────────
  // Toggle hora seleccionada
  // ────────────────────────────────
  const toggleHoraSeleccionada = (h) => {
    setHorasSeleccionadas((prev) =>
      prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]
    );
  };

  // ────────────────────────────────
  // Guardar Waitlist
  // ────────────────────────────────
  const guardarWaitlist = () => {
    if (!barbero || !selectedDiaForWaitlist) {
      Swal.fire("Error", "Falta información", "error");
      return;
    }

    if (horasSeleccionadas.length === 0) {
      Swal.fire("Atención", "Selecciona al menos una hora", "warning");
      return;
    }

    console.log("💾 Guardando waitlist:", {
      barberoId: barbero,
      fecha: selectedDiaForWaitlist,
      horas: horasSeleccionadas,
      usuarioId: user?._id
    });

    // Aquí iría tu llamada a la API para guardar la waitlist
    Swal.fire({
      title: "¡Solicitud guardada!",
      html: `Te notificaremos si se libera alguna de las <b>${horasSeleccionadas.length}</b> hora(s) seleccionada(s):<br><small>${horasSeleccionadas.join(", ")}</small>`,
      icon: "success",
      timer: 3000
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
              {/* Columna izquierda */}
              <div className="col-lg-7 col-md-12 pr-lg-4">
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
                    barberoInfo={barberoSeleccionado}
                  />
                )}

                {fecha && barbero && servicio && (
                  <HorasDisponibles
                    horasDisponibles={horasDisponibles}
                    mensajeHoras={mensajeHoras}
                    cargandoHoras={cargandoHoras}
                    duracionSeleccionado={duracionSeleccionado}
                    hora={hora}
                    onSeleccionarHora={setHora}
                  />
                )}
              </div>

              {/* Columna derecha: resumen */}
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

      {/* ──────────────────────────────── */}
      {/* MODAL HORAS BASE */}
      {/* ──────────────────────────────── */}
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
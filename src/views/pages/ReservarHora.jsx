// src/views/admin/pages/ReservarHoraBarbero.jsx
import React from "react";
import { Container, Card, CardBody } from "reactstrap";
import { Scissors } from "lucide-react";
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

const ReservarHora = () => {
  const { user } = useAuth(); // ✅ Primero obtenemos el usuario logeado

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

  // Datos derivados
  const servicioSeleccionado = servicios.find((s) => s._id === servicio);
  const duracionSeleccionado = servicioSeleccionado?.duracion || 60;
  const barberoSeleccionado = barberos.find((b) => b._id === barbero);

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
                  rut={user?.rut} // ✅ rut viene directamente del usuario logeado
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
    </>
  );
};

export default ReservarHora;

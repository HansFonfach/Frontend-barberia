// src/views/admin/pages/ReservarHora.jsx
import React from "react";
import { Container, Card, CardBody } from "reactstrap";
import { Scissors } from "lucide-react";
import UserHeader from "components/Headers/UserHeader.js";
import { useAuth } from "context/AuthContext";

// Componentes
import StepIndicator from "../../components/reserva/StepIndicator";
import ServicioSelector from "../../components/reserva/ServicioSelector";
import BarberoSelector from "../../components/reserva/BarberoSelector";
import WeekSelector from "../../components/reserva/WeekSelector";
import HorasDisponibles from "../../components/reserva/HorasDisponibles";
import ResumenReserva from "../../components/reserva/ResumenReserva";

// Context / hooks
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
  // Cargar servicios por barbero
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
  // Servicio seleccionado (con duración dinámica)
  // ────────────────────────────────
  const servicioSeleccionado = React.useMemo(() => {
    if (!servicio) return null;

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

    return {
      id: servicioInfo._id,
      nombre: servicioInfo.nombre,
      descripcion: servicioInfo.descripcion,
      duracion,
      precio: servicioInfo.precio,
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
                Servicio → Barbero → Día → Hora
              </p>
            </div>

            <div className="row">
              <div className="col-lg-7 col-md-12 pr-lg-4">
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

                {fecha && barbero && servicio && (
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
    </>
  );
};

export default ReservarHora;

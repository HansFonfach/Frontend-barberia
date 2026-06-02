import React from "react";
import { Modal, Button, Input, Badge } from "reactstrap";
import Swal from "sweetalert2";

const ReagendarModal = ({
  modal,
  setModal,
  reservaSeleccionada,
  nuevaFecha,
  setNuevaFecha,
  horasDisponibles,
  setHorasDisponibles,
  horaSeleccionada,
  setHoraSeleccionada,
  loadingHoras,
  setLoadingHoras,
  getHorasDisponiblesBarbero,
  reagendarReserva,
}) => {
  const handleFechaReagendar = async (fecha) => {
    setNuevaFecha(fecha);
    setHoraSeleccionada(null);
    if (!fecha || !reservaSeleccionada) return;

    const barberoId =
      reservaSeleccionada?.barbero?._id || reservaSeleccionada?.barbero;
    const servicioId =
      reservaSeleccionada?.servicio?._id || reservaSeleccionada?.servicio;

    console.log("Pidiendo horas con:", { barberoId, servicioId, fecha }); // ← agrega

    try {
      setLoadingHoras(true);
      const response = await getHorasDisponiblesBarbero(
        barberoId,
        fecha,
        servicioId,
      );
      console.log("Horas recibidas:", response?.horas); // ← agrega
      setHorasDisponibles(response?.horas || []);
    } catch (error) {
      setHorasDisponibles([]);
    } finally {
      setLoadingHoras(false);
    }
  };

  const handleConfirmarReagendar = async () => {
    if (!horaSeleccionada || !nuevaFecha) return;

    const result = await reagendarReserva(
      reservaSeleccionada._id,
      nuevaFecha,
      horaSeleccionada,
    );

    if (!result) return;

    setModal(false);

    Swal.fire({
      icon: "success",
      title: "¡Reagendado!",
      text: `Reserva reagendada para el ${nuevaFecha} a las ${horaSeleccionada}`,
      timer: 2500,
      showConfirmButton: false,
    });
  };

  return (
    <Modal
      isOpen={modal}
      toggle={() => setModal(false)}
      className="modal-dialog-centered"
    >
      <div className="modal-content">
        {/* HEADER */}
        <div className="modal-header bg-gradient-primary">
          <h5 className="modal-title text-white">
            <i className="ni ni-calendar-grid-58 mr-2"></i>
            Reagendar reserva
          </h5>

          <button className="close text-white" onClick={() => setModal(false)}>
            <span>&times;</span>
          </button>
        </div>

        {/* BODY */}
        <div className="modal-body">
          {/* INFO RESERVA */}
          <div
            className="bg-secondary rounded p-3 mb-4"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <small className="text-muted d-block">Cliente</small>

              <strong>
                {reservaSeleccionada?.cliente?.nombre}{" "}
                {reservaSeleccionada?.cliente?.apellido}
              </strong>
            </div>

            <div>
              <small className="text-muted d-block">Servicio</small>

              <strong>{reservaSeleccionada?.servicio?.nombre}</strong>
            </div>

            <div>
              <small className="text-muted d-block">Hora actual</small>

              <Badge color="info" pill>
                {reservaSeleccionada &&
                  new Date(reservaSeleccionada.fecha).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </Badge>
            </div>
          </div>

          {/* FECHA */}
          <div className="mb-4">
            <label
              className="form-control-label text-muted"
              style={{ fontSize: "13px" }}
            >
              Nueva fecha
            </label>

            <Input
              type="date"
              value={nuevaFecha}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => handleFechaReagendar(e.target.value)}
            />
          </div>

          {/* HORAS */}
          {nuevaFecha && (
            <div>
              <label
                className="form-control-label text-muted"
                style={{ fontSize: "13px" }}
              >
                Hora disponible
              </label>

              {loadingHoras ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-primary" />
                </div>
              ) : horasDisponibles.length === 0 ? (
                <p className="text-muted text-sm text-center py-2">
                  No hay horas disponibles
                </p>
              ) : (
                <div className="d-flex flex-wrap" style={{ gap: "8px" }}>
                  {horasDisponibles.map((h) => (
                    <Button
                      key={h.hora}
                      size="sm"
                      color={
                        horaSeleccionada === h.hora ? "primary" : "secondary"
                      }
                      disabled={h.estado !== "disponible"}
                      onClick={() => setHoraSeleccionada(h.hora)}
                      style={{
                        minWidth: "70px",
                        opacity: h.estado !== "disponible" ? 0.4 : 1,
                      }}
                    >
                      {h.hora}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="modal-footer">
          <Button color="secondary" onClick={() => setModal(false)}>
            Cancelar
          </Button>

          <Button
            color="primary"
            disabled={!horaSeleccionada || !nuevaFecha}
            onClick={handleConfirmarReagendar}
          >
            <i className="ni ni-check-bold mr-1"></i>
            Confirmar reagendo
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReagendarModal;

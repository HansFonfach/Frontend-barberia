// components/reserva/HorasDisponibles.jsx
import React from "react";
import { FormGroup, Label, Row, Col, Button, Spinner, Alert } from "reactstrap";

const HorasDisponibles = ({
  horasDisponibles = [],
  mensajeHoras,
  cargandoHoras,
  hora,
  onSeleccionarHora,
  horasDataCompleta,
  duracionSeleccionado,
}) => {
  // 👉 ÚNICA fuente de verdad para la duración
  const duracionReal = Number(
    horasDataCompleta?.duracionServicio || duracionSeleccionado || 0
  );

  // Función para calcular hora de fin correctamente
  const calcularHoraFin = (horaInicio) => {
    if (!duracionReal) return "";

    const [horas, minutos] = horaInicio.split(":").map(Number);
    const totalMinutos = horas * 60 + minutos + duracionReal;

    const finHoras = Math.floor(totalMinutos / 60);
    const finMinutos = totalMinutos % 60;

    return `${finHoras.toString().padStart(2, "0")}:${finMinutos
      .toString()
      .padStart(2, "0")}`;
  };

  const tieneInfoAdicional =
    horasDataCompleta && horasDataCompleta.barbero;

  return (
    <FormGroup className="mb-4">
      <Label className="font-weight-bold d-flex align-items-center ">
        <span className="mr-2 bg">⏰</span>
        Horas disponibles
        {tieneInfoAdicional && (
          <span className="ml-2 text-muted small">
            ({duracionReal} min con {horasDataCompleta.barbero})
          </span>
        )}
      </Label>



      {/* Cargando */}
      {cargandoHoras && (
        <div className="text-center py-3">
          <Spinner size="sm" className="mr-2" />
          Cargando horarios...
        </div>
      )}

      {/* Sin horarios */}
      {!cargandoHoras && horasDisponibles.length === 0 && (
        <Alert color="warning" className="text-center">
          <div className="py-2">
            <i className="fas fa-clock mr-2"></i>
            {mensajeHoras || "No hay horarios disponibles para esta fecha."}

            {horasDataCompleta?.esFeriado && (
              <div className="mt-1 small">
                Feriado: {horasDataCompleta.nombreFeriado}
              </div>
            )}
          </div>
        </Alert>
      )}

      {/* Horarios */}
      {!cargandoHoras && horasDisponibles.length > 0 && (
        <div className="mt-2">
          <Row className="g-2">
            {horasDisponibles.map((h) => (
              <Col key={h} xs="6" sm="4" lg="3" className="mb-2">
                <Button
                  block
                  color={hora === h ? "success" : "outline-success"}
                  onClick={() => onSeleccionarHora(h)}
                  className="position-relative"
                >
                  <div className="font-weight-bold">{h}</div>
                 

                  {hora === h && (
                    <div className="position-absolute top-0 end-0 mt-1 me-1">
                      <i className="fas fa-check-circle small"></i>
                    </div>
                  )}
                </Button>
              </Col>
            ))}
          </Row>

          {/* Hora seleccionada */}
          {hora && (
            <div className="mt-3 p-2 bg-success text-white rounded">
              <div className="d-flex align-items-center">
                <i className="fas fa-check-circle mr-2"></i>
                <div>
                  <strong>Hora seleccionada: {hora}</strong>
                  <div className="small text-yellow">
                    {hora} - {calcularHoraFin(hora)} ({duracionReal} min)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info adicional */}
          {horasDataCompleta && (
            <div className="mt-3 text-muted small">
              {horasDataCompleta.horasBloqueadas?.length > 0 && (
                <div className="mb-1">
                  <i className="fas fa-ban mr-1"></i>
                  Horas bloqueadas:{" "}
                  {horasDataCompleta.horasBloqueadas.join(", ")}
                </div>
              )}

              {horasDataCompleta.horasExtra?.length > 0 && (
                <div>
                  <i className="fas fa-plus-circle mr-1"></i>
                  Horas extra:{" "}
                  {horasDataCompleta.horasExtra.join(", ")}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </FormGroup>
  );
};

export default HorasDisponibles;

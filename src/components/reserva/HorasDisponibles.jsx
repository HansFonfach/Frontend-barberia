import React from "react";
import { FormGroup, Label, Row, Col, Button, Spinner, Alert, Badge, Tooltip } from "reactstrap";
import { Bell, Clock } from "lucide-react";

const HorasDisponibles = ({
  horasDisponibles = [],
  mensajeHoras,
  cargandoHoras,
  hora: horaSeleccionada,
  onSeleccionarHora,
  horasDataCompleta,
  duracionSeleccionado,
}) => {
  const duracionReal = Number(
    horasDataCompleta?.duracionServicio || duracionSeleccionado || 0
  );

  const calcularHoraFin = (horaInicio) => {
    if (!duracionReal) return "";
    const [h, m] = horaInicio.split(":").map(Number);
    const total = h * 60 + m + duracionReal;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(
      total % 60
    ).padStart(2, "0")}`;
  };

  const handleNotify = (e, h) => {
    e.stopPropagation(); // Evita que se dispare el click del botón
    alert(`Te avisaremos si la hora ${h} se libera.`);
    // Aquí iría tu lógica de backend para la suscripción
  };

  return (
    <FormGroup className="mb-4">
      <Label className="font-weight-bold d-flex align-items-center mb-3">
        <Clock size={18} className="mr-2 text-primary" /> 
        <span style={{fontSize: '1.1rem'}}>Horas disponibles</span>
      </Label>

      {/* Cargando */}
      {cargandoHoras && (
        <div className="text-center py-4">
          <Spinner color="primary" size="sm" className="mr-2" />
          <span className="text-muted">Buscando horarios...</span>
        </div>
      )}

      {/* Sin horas */}
      {!cargandoHoras && horasDisponibles.length === 0 && (
        <Alert color="light" className="text-center border-dashed">
          {mensajeHoras || "No hay horarios disponibles para esta fecha."}
        </Alert>
      )}

      {/* Grid de Horas */}
      {!cargandoHoras && horasDisponibles.length > 0 && (
        <>
          <Row className="px-2">
            {horasDisponibles.map(({ hora: h, estado }) => {
              const isSelected = horaSeleccionada === h;
              const isDisponible = estado === "disponible";

              return (
                <Col key={h} xs="4" sm="3" md="2" className="p-1">
                  <div className="position-relative">
                    <Button
                      block
                      outline={!isSelected}
                      color={isDisponible ? (isSelected ? "success" : "success") : "light"}
                      onClick={() => isDisponible && onSeleccionarHora(h)}
                      className={`py-2 border-2 ${!isDisponible ? 'text-muted' : ''}`}
                      style={{
                        cursor: isDisponible ? "pointer" : "default",
                        opacity: isDisponible ? 1 : 0.6,
                        fontWeight: isSelected ? "bold" : "500",
                        fontSize: "0.9rem",
                        borderRadius: "8px",
                        borderStyle: isDisponible ? "solid" : "dashed"
                      }}
                    >
                      {h}
                    </Button>

                    {/* Campanita para horas ocupadas */}
                    {!isDisponible && (
                      <button
                        onClick={(e) => handleNotify(e, h)}
                        title="Avísame si se libera"
                        style={{
                          position: "absolute",
                          top: "-5px",
                          right: "-5px",
                          backgroundColor: "#FFC107",
                          border: "2px solid white",
                          borderRadius: "50%",
                          width: "24px",
                          height: "24px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 0,
                          cursor: "pointer",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          zIndex: 2
                        }}
                      >
                        <Bell size={12} fill="#212529" color="#212529" />
                      </button>
                    )}
                  </div>
                </Col>
              );
            })}
          </Row>

          {/* Leyenda Simple */}
          <div className="d-flex justify-content-center mt-3 gap-3">
             <small className="text-muted mx-2">● Disponible</small>
             <small className="text-muted mx-2">○ Ocupado (Avísame)</small>
          </div>

          {/* Card de Confirmación de Selección */}
          {horaSeleccionada && (
            <div 
              className="mt-4 p-3 rounded-lg border-left-success"
              style={{
                backgroundColor: "#e8f5e9",
                borderLeft: "5px solid #28a745",
                borderRadius: "8px"
              }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-success font-weight-bold d-block">Reserva seleccionada</span>
                  <span className="h5 mb-0">{horaSeleccionada} – {calcularHoraFin(horaSeleccionada)}</span>
                </div>
                <Badge color="success" pill className="px-3 py-2">
                  {duracionReal} min
                </Badge>
              </div>
            </div>
          )}
        </>
      )}
    </FormGroup>
  );
};

export default HorasDisponibles;
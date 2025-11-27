import React from "react";
import { FormGroup, Label, Row, Col, Button, Spinner, Alert } from "reactstrap";

const HorasDisponibles = ({
  horasDisponibles,
  mensajeHoras,
  cargandoHoras,
  duracionSeleccionado,
  hora,
  onSeleccionarHora,
}) => {
  // Encontrar slots consecutivos (para 2 hrs)
  const findConsecutiveStarts = (horas = []) => {
    const setHoras = new Set(horas);
    const starts = [];
    for (let h of horas) {
      const [hh, mm] = h.split(":").map(Number);
      const next = `${String(hh + 1).padStart(2, "0")}:${String(mm).padStart(
        2,
        "0"
      )}`;
      if (setHoras.has(next)) starts.push(h);
    }
    return starts;
  };

  const getSlotsForDuration = (horasArray, serviceDuracion) => {
    if (!horasArray || horasArray.length === 0) return [];

    const sorted = [...horasArray].sort((a, b) => {
      const [hA, mA] = a.split(":").map(Number);
      const [hB, mB] = b.split(":").map(Number);
      return hA - hB || mA - mB;
    });

    if (serviceDuracion === 60) {
      return sorted.map((h) => ({ start: h, label: h }));
    } else if (serviceDuracion === 120) {
      const starts = findConsecutiveStarts(sorted);
      return starts.map((h) => {
        const [hh, mm] = h.split(":").map(Number);
        const next = `${String(hh + 1).padStart(2, "0")}:${String(mm).padStart(
          2,
          "0"
        )}`;
        return { start: h, label: `${h} - ${next}` };
      });
    }

    return sorted.map((h) => ({ start: h, label: h }));
  };

  const slotsDisponibles = getSlotsForDuration(
    horasDisponibles,
    duracionSeleccionado
  );

  return (
    <FormGroup className="mb-3">
      <Label className="font-weight-bold">⏰ Horas disponibles</Label>

      <Row className="g-2">
        {cargandoHoras && (
          <Col>
            <Spinner size="sm" className="mr-2" /> Cargando horarios...
          </Col>
        )}

        {!cargandoHoras && horasDisponibles.length === 0 && (
          <Col>
            <Alert color="warning" className="text-center">
              {mensajeHoras || "No hay horarios disponibles para esta fecha."}
            </Alert>
          </Col>
        )}

        {!cargandoHoras && horasDisponibles.length > 0 && (
          <>
            {slotsDisponibles.length === 0 ? (
              <Col>
                <Alert color="info" className="text-center">
                  No hay bloques de {duracionSeleccionado} min disponibles para
                  este día.
                </Alert>
              </Col>
            ) : (
              slotsDisponibles.map((slot) => (
                <Col key={slot.start} xs="6" sm="4" lg="3" className="mb-2">
                  <Button
                    block
                    color={hora === slot.start ? "success" : "outline-success"}
                    onClick={() => onSeleccionarHora(slot.start)}
                  >
                    {slot.label}
                  </Button>
                </Col>
              ))
            )}
          </>
        )}
      </Row>
    </FormGroup>
  );
};

export default HorasDisponibles;

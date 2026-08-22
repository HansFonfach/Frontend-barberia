import React from "react";
import { FormGroup, Label, Badge } from "reactstrap";

const hoyISO = () => new Date().toISOString().split("T")[0];

const parseLocalDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/**
 * Paso 2 del wizard "Agendar clase": elegir el día, con el mismo look de
 * tira de días que usa WeekSelector en "Reservar hora" (tarjetas con
 * día/número/mes y cuántos cupos hay ese día para la clase elegida).
 */
const DiaClaseSelector = ({ dias, diaSeleccionado, onSelectDay, claseNombre }) => {
  const hoy = hoyISO();

  if (!dias || dias.length === 0) {
    return (
      <FormGroup className="mb-4">
        <Label className="font-weight-bold">📅 Selecciona día</Label>
        <div className="alert alert-info text-center py-3">
          No hay sesiones programadas de esta clase en los próximos 14 días.
        </div>
      </FormGroup>
    );
  }

  return (
    <FormGroup className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Label className="font-weight-bold mb-0 h5">📅 Selecciona día</Label>
        {claseNombre && (
          <Badge color="info" pill className="px-3 py-1">
            {claseNombre}
          </Badge>
        )}
      </div>

      <div className="flex-grow-1" style={{ overflowX: "auto", paddingBottom: 4 }}>
        <div style={{ display: "flex", gap: "10px" }}>
          {dias.map((dia) => {
            const isSelected = dia.iso === diaSeleccionado;
            const isToday = dia.iso === hoy;
            const cuposTotales = dia.sesiones.reduce(
              (acc, s) => acc + (s.cuposDisponibles || 0),
              0,
            );
            const diaLleno = cuposTotales === 0;
            const fecha = parseLocalDate(dia.iso);

            return (
              <div
                key={dia.iso}
                onClick={() => onSelectDay(dia.iso)}
                style={{
                  padding: "12px 8px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  minWidth: "85px",
                  flex: "0 0 auto",
                  backgroundColor: isSelected
                    ? "#09cf62"
                    : diaLleno
                      ? "#f8f9fa"
                      : "#ffffff",
                  color: isSelected ? "#fff" : diaLleno ? "#6c757d" : "#212529",
                  border: isSelected
                    ? "2px solid #28a745"
                    : "1px solid #dee2e6",
                  textAlign: "center",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: 600 }}>
                  {fecha.toLocaleDateString("es-CL", { weekday: "short" })}
                </div>
                <div style={{ fontSize: "20px", fontWeight: 700 }}>
                  {fecha.getDate()}
                </div>
                <div style={{ fontSize: "11px", opacity: 0.8 }}>
                  {fecha.toLocaleDateString("es-CL", { month: "short" })}
                </div>
                <div style={{ marginTop: "4px", fontSize: "11px" }}>
                  {diaLleno ? (
                    <span>Sin cupo</span>
                  ) : (
                    <strong>{cuposTotales} cupos</strong>
                  )}
                </div>
                {isToday && (
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      marginTop: "4px",
                      color: isSelected ? "#fff" : "#28a745",
                    }}
                  >
                    Hoy
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </FormGroup>
  );
};

export default DiaClaseSelector;

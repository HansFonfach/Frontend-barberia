// src/views/admin/pages/components/SelectorSemanal.jsx
import React from "react";
import { FormGroup, Label, Button, Spinner } from "reactstrap";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS_TO_SHOW = 7;

const WeekSelector = ({
  weekStart,
  weekDays,
  loadingWeek,
  fecha,
  onSelectDay,
  onPrevWeek,
  onNextWeek,
}) => {
  const formatDayLabel = (d) => {
    return d.toLocaleDateString("es-CL", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const isoDate = (d) => d.toISOString().split("T")[0];

  return (
    <FormGroup className="mb-3">
      <Label className="font-weight-bold">📅 Selecciona día</Label>

      <div className="d-flex align-items-center mb-2">
        <Button
          color="link"
          onClick={onPrevWeek}
          className="me-2 p-1"
          style={{ borderRadius: "8px" }}
        >
          <ChevronLeft size={20} />
        </Button>

        <div className="flex-grow-1 overflow-auto">
          <div
            style={{
              display: "flex",
              gap: "8px",
              justifyContent: "space-between",
            }}
          >
            {loadingWeek ? (
              <div className="d-flex align-items-center justify-content-center w-100 py-3">
                <Spinner size="sm" className="me-2" />
                Cargando semana...
              </div>
            ) : (
              weekDays.map((d) => {
                const isToday = isoDate(new Date()) === d.iso;
                const isSelected = d.iso === fecha;

                return (
                  <div
                    key={d.iso}
                    onClick={() => d.available && onSelectDay(d.iso)}
                    style={{
                      flex: "1",
                      minWidth: "70px",
                      padding: "10px 6px",
                      borderRadius: "10px",
                      boxShadow: isSelected
                        ? "0 4px 12px rgba(8, 238, 161, 0.25)"
                        : "0 1px 4px rgba(0,0,0,0.08)",
                      backgroundColor: isSelected
                        ? "rgba(9, 207, 98, 1)" // color success de Bootstrap
                        : d.available
                        ? "#ffffff"
                        : "#f8f9fa",
                      color: isSelected
                        ? "#ffffff"
                        : d.available
                        ? "#212529"
                        : "#6c757d",
                      border: isSelected
                        ? "2px solid #28a745"
                        : d.available
                        ? "1px solid #e9ecef"
                        : "1px solid #dee2e6",
                      cursor: d.available ? "pointer" : "not-allowed",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                      transform: isSelected ? "scale(1.02)" : "none",
                      opacity: d.available ? 1 : 0.7,
                    }}
                    className="hover-lift"
                  >
                    {/* Día de la semana */}
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        marginBottom: "2px",
                      }}
                    >
                      {new Date(d.date).toLocaleDateString("es-CL", {
                        weekday: "short",
                      })}
                    </div>

                    {/* Número del día */}
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "700",
                        marginBottom: "2px",
                      }}
                    >
                      {new Date(d.date).getDate()}
                    </div>

                    {/* Mes */}
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: "500",
                        opacity: 0.8,
                      }}
                    >
                      {new Date(d.date).toLocaleDateString("es-CL", {
                        month: "short",
                      })}
                    </div>

                    {/* Indicador de disponibilidad */}
                    <div style={{ marginTop: "6px" }}>
                      {d.available ? (
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: isSelected ? "#fff" : "#28a745",
                            opacity: isSelected ? 0.9 : 1,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: "#6c757d",
                            opacity: 0.5,
                          }}
                        />
                      )}
                    </div>

                    {/* Indicador "Hoy" */}
                    {isToday && (
                      <div
                        style={{
                          fontSize: "9px",
                          fontWeight: "600",
                          marginTop: "4px",
                          color: isSelected ? "#fff" : "#28a745",
                        }}
                      >
                        Hoy
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <Button
          color="link"
          onClick={onNextWeek}
          className="ms-2 p-1"
          style={{ borderRadius: "8px" }}
        >
          <ChevronRight size={20} />
        </Button>
      </div>

      <small className="text-muted">
        Mostrando {DAYS_TO_SHOW} días desde{" "}
        {formatDayLabel(new Date(weekStart))}
      </small>

      <style>
        {`
          .hover-lift:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
        `}
      </style>
    </FormGroup>
  );
};

export default WeekSelector;

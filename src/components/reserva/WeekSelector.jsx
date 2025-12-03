// src/components/reserva/WeekSelector.jsx
import React from "react";
import { FormGroup, Label, Button, Spinner } from "reactstrap";
import { ChevronLeft, ChevronRight, Bell } from "lucide-react";

const DAYS_TO_SHOW = 7;

const formatDayLabel = (d) =>
  d.toLocaleDateString("es-CL", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

const isoDate = (d) => d.toISOString().split("T")[0];

const WeekSelector = ({
  weekStart,
  weekDays,
  loadingWeek,
  fecha,
  onSelectDay,
  onPrevWeek,
  onNextWeek,
  onWaitlist,
  barberoId, // ← NUEVO PROP: ID del barbero seleccionado
}) => {
  const handleWaitlistRequest = async (d) => {
    console.log("🔔 Click en campanita");
    console.log("🔔 barberoId prop:", barberoId); // ¿Es undefined?

    if (onWaitlist) {
      onWaitlist({
        fecha: d.iso,
        barberoId: barberoId, // ← ¿Esto es undefined?
      });
    }
  };

  const parseLocalDate = (str) => {
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d); // <-- sin UTC
  };

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
                const diaDisponible = d.available;

                return (
                  <div
                    key={d.iso}
                    style={{
                      position: "relative",
                      flex: "1",
                      minWidth: "70px",
                    }}
                  >
                    {/* Campanita para días NO disponibles */}
                    {!diaDisponible && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWaitlistRequest(d);
                        }}
                        style={{
                          position: "absolute",
                          top: "-6px",
                          right: "-6px",
                          backgroundColor: "#ffc107",
                          padding: "4px",
                          borderRadius: "50%",
                          cursor: "pointer",
                          zIndex: 20,
                          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                          transition: "transform 0.2s ease",
                        }}
                        className="hover-scale"
                        title="Avisarme si se libera alguna hora"
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.transform = "scale(1.1)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.transform = "scale(1)")
                        }
                      >
                        <Bell size={14} color="#212529" />
                      </div>
                    )}

                    {/* Tarjeta del día */}
                    <div
                      onClick={() => {
                        if (diaDisponible) {
                          onSelectDay(d.iso);
                        } else {
                          handleWaitlistRequest(d);
                        }
                      }}
                      style={{
                        padding: "10px 6px",
                        borderRadius: "10px",
                        boxShadow: isSelected
                          ? "0 4px 12px rgba(8, 238, 161, 0.25)"
                          : "0 1px 4px rgba(0,0,0,0.08)",
                        backgroundColor: isSelected
                          ? "rgba(9, 207, 98, 1)"
                          : diaDisponible
                          ? "#ffffff"
                          : "#f8f9fa",
                        color: isSelected
                          ? "#ffffff"
                          : diaDisponible
                          ? "#212529"
                          : "#6c757d",
                        border: isSelected
                          ? "2px solid #28a745"
                          : diaDisponible
                          ? "1px solid #e9ecef"
                          : "1px solid #dee2e6",
                        cursor: diaDisponible ? "pointer" : "not-allowed",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s ease",
                        transform: isSelected ? "scale(1.02)" : "none",
                        opacity: diaDisponible ? 1 : 0.7,
                      }}
                      className={diaDisponible ? "hover-lift" : ""}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          marginBottom: "2px",
                        }}
                      >
                        {parseLocalDate(d.iso).toLocaleDateString("es-CL", {
                          weekday: "short",
                        })}
                      </div>

                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "700",
                          marginBottom: "2px",
                        }}
                      >
                        {parseLocalDate(d.iso).getDate()}
                      </div>

                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: "500",
                          opacity: 0.8,
                        }}
                      >
                        {parseLocalDate(d.iso).toLocaleDateString("es-CL", {
                          month: "short",
                        })}
                      </div>

                      <div style={{ marginTop: "6px" }}>
                        {diaDisponible ? (
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

      <style>{`
          .hover-lift:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
          }
          .hover-scale:hover {
            transform: scale(1.1);
          }
          .hover-scale {
            transition: transform 0.2s ease;
          }
        `}</style>
    </FormGroup>
  );
};

export default WeekSelector;

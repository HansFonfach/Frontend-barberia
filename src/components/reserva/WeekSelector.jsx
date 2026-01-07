// src/components/reserva/WeekSelector.jsx
import React from "react";
import { FormGroup, Label, Button, Spinner, Badge } from "reactstrap";
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
  barberoId, // Recibe barberoId
  barberoInfo, // Recibe info del barbero (opcional)
}) => {
  console.log("📅 WeekSelector - Props recibidos:", {
    weekDaysCount: weekDays?.length || 0,
    loadingWeek,
    fechaSeleccionada: fecha,
    barberoId,
    barberoInfo: barberoInfo?.nombre || "No info",
    weekDays: weekDays?.map(d => ({
      fecha: d.iso,
      disponible: d.available,
      mensaje: d.mensaje,
      horasCount: d.horasDisponibles?.length || 0
    })) || []
  });

  const handleWaitlistRequest = async (d) => {
    console.log("🔔 Click en campanita - Datos:", {
      fecha: d.iso,
      barberoId,
      barberoInfo
    });

    if (!barberoId) {
      console.error("❌ Error: barberoId es undefined");
      return;
    }

    if (onWaitlist) {
      onWaitlist({
        fecha: d.iso,
        barberoId: barberoId,
      });
    }
  };

  const parseLocalDate = (str) => {
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  // Si no hay barbero seleccionado, mostrar mensaje
  if (!barberoId) {
    return (
      <FormGroup className="mb-4">
        <Label className="font-weight-bold">📅 Selecciona día</Label>
        <div className="alert alert-warning text-center py-3">
          <i className="fas fa-user-clock me-2"></i>
          <strong>Selecciona un barbero primero</strong>
          <p className="mb-0 small mt-1">
            Elige un barbero para ver los días disponibles
          </p>
        </div>
      </FormGroup>
    );
  }

  // Si está cargando
  if (loadingWeek) {
    return (
      <FormGroup className="mb-4">
        <Label className="font-weight-bold">📅 Disponibilidad de la semana</Label>
        <div className="d-flex align-items-center justify-content-center py-4 bg-light rounded">
          <Spinner size="sm" className="me-2" />
          <span>Cargando disponibilidad...</span>
        </div>
      </FormGroup>
    );
  }

  // Si no hay datos de semana
  if (!weekDays || weekDays.length === 0) {
    return (
      <FormGroup className="mb-4">
        <Label className="font-weight-bold">📅 Disponibilidad de la semana</Label>
        <div className="alert alert-info text-center py-3">
          <i className="fas fa-calendar me-2"></i>
          <strong>No hay datos de disponibilidad</strong>
          <p className="mb-0 small mt-1">
            Selecciona un servicio para ver los días disponibles
          </p>
        </div>
      </FormGroup>
    );
  }

  return (
    <FormGroup className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Label className="font-weight-bold mb-0 h5">📅 Disponibilidad de la semana</Label>
        {barberoInfo && (
          <Badge color="info" pill className="px-3 py-1">
            {barberoInfo.nombre}
          </Badge>
        )}
      </div>

      <div className="d-flex align-items-center mb-3">
        <Button
          color="outline-primary"
          onClick={onPrevWeek}
          className="me-2 p-2"
          style={{ borderRadius: "8px" }}
          size="sm"
        >
          <ChevronLeft size={18} />
        </Button>

        <div className="flex-grow-1 overflow-auto">
          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "space-between",
            }}
          >
            {weekDays.map((d) => {
              const isToday = isoDate(new Date()) === d.iso;
              const isSelected = d.iso === fecha;
              const diaDisponible = d.available;
              const horasDisponibles = d.horasDisponibles || [];
              const esFeriado = d.esFeriado;

              return (
                <div
                  key={d.iso}
                  style={{
                    position: "relative",
                    flex: "1",
                    minWidth: "85px", // Un poco más ancho
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
                        top: "-8px",
                        right: "-8px",
                        backgroundColor: "#ffc107",
                        padding: "6px",
                        borderRadius: "50%",
                        cursor: "pointer",
                        zIndex: 20,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                        transition: "all 0.2s ease",
                      }}
                      className="hover-scale"
                      title="Avisarme si se libera alguna hora"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.1)";
                        e.currentTarget.style.backgroundColor = "#e0a800";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.backgroundColor = "#ffc107";
                      }}
                    >
                      <Bell size={16} color="#212529" />
                    </div>
                  )}

                  {/* Indicador de feriado */}
                  {esFeriado && diaDisponible && (
                    <div
                      style={{
                        position: "absolute",
                        top: "-8px",
                        left: "-8px",
                        backgroundColor: "#f39c12",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        zIndex: 10,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      }}
                    >
                      <span className="small" style={{ fontSize: "10px", fontWeight: "bold", color: "white" }}>
                        🎉
                      </span>
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
                      padding: "12px 8px",
                      borderRadius: "12px",
                      boxShadow: isSelected
                        ? "0 6px 16px rgba(8, 238, 161, 0.3)"
                        : diaDisponible
                        ? "0 2px 6px rgba(0,0,0,0.08)"
                        : "0 1px 3px rgba(0,0,0,0.05)",
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
                      transform: isSelected ? "scale(1.03)" : "none",
                      opacity: diaDisponible ? 1 : 0.7,
                      height: "100%",
                    }}
                    className={diaDisponible ? "hover-lift" : ""}
                  >
                    {/* Día de la semana */}
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        marginBottom: "4px",
                        opacity: 0.9,
                      }}
                    >
                      {parseLocalDate(d.iso).toLocaleDateString("es-CL", {
                        weekday: "short",
                      })}
                    </div>

                    {/* Número del día */}
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: "700",
                        marginBottom: "2px",
                        lineHeight: "1",
                      }}
                    >
                      {parseLocalDate(d.iso).getDate()}
                    </div>

                    {/* Mes */}
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: "500",
                        opacity: 0.8,
                        marginBottom: "6px",
                      }}
                    >
                      {parseLocalDate(d.iso).toLocaleDateString("es-CL", {
                        month: "short",
                      })}
                    </div>

                    {/* Indicador de disponibilidad */}
                    <div style={{ marginBottom: "4px" }}>
                      {diaDisponible ? (
                        <div className="d-flex align-items-center">
                          <div
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              backgroundColor: isSelected ? "#fff" : "#28a745",
                              marginRight: "4px",
                            }}
                          />
                          <span style={{ fontSize: "11px", fontWeight: "600" }}>
                            {horasDisponibles.length} hrs
                          </span>
                        </div>
                      ) : (
                        <div
                          style={{
                            fontSize: "10px",
                            fontWeight: "600",
                            color: "#6c757d",
                          }}
                        >
                          {d.mensaje || "No disp."}
                        </div>
                      )}
                    </div>

                    {/* Indicador "Hoy" */}
                    {isToday && (
                      <div
                        style={{
                          fontSize: "10px",
                          fontWeight: "700",
                          marginTop: "4px",
                          color: isSelected ? "#fff" : "#28a745",
                          backgroundColor: isSelected ? "rgba(255,255,255,0.2)" : "rgba(40,167,69,0.1)",
                          padding: "2px 6px",
                          borderRadius: "10px",
                        }}
                      >
                        Hoy
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Button
          color="outline-primary"
          onClick={onNextWeek}
          className="ms-2 p-2"
          style={{ borderRadius: "8px" }}
          size="sm"
        >
          <ChevronRight size={18} />
        </Button>
      </div>

      {/* Información adicional */}
      <div className="d-flex justify-content-between align-items-center text-muted small">
        <div>
          {weekDays.filter(d => d.available).length > 0 && (
            <span>
              <i className="fas fa-circle text-success me-1" style={{ fontSize: "8px" }}></i>
              {weekDays.filter(d => d.available).length} días disponibles
            </span>
          )}
        </div>
        <div>
          <span>
            Semana del{" "}
            {formatDayLabel(new Date(weekStart))}
          </span>
        </div>
      </div>

      {/* Instrucciones */}
      {!weekDays.some(d => d.available) && weekDays.length > 0 && (
        <div className="alert alert-light border mt-3 text-center py-2">
          <p className="mb-1 small">
            <i className="fas fa-info-circle me-1"></i>
            No hay días disponibles esta semana
          </p>
          <p className="mb-0 small text-muted">
            Prueba con otra semana o selecciona un servicio diferente
          </p>
        </div>
      )}

      <style>{`
        .hover-lift:hover { 
          transform: translateY(-3px) !important; 
          box-shadow: 0 6px 16px rgba(0,0,0,0.15) !important; 
        }
        .hover-scale:hover {
          transform: scale(1.15) !important;
        }
        .hover-scale {
          transition: transform 0.2s ease !important;
        }
      `}</style>
    </FormGroup>
  );
};

export default WeekSelector;
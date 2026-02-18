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

// 👉 Fecha de hoy en formato YYYY-MM-DD (LOCAL, sin UTC)
const todayISO = () => {
  const now = new Date();
  const local = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  return local.toISOString().split("T")[0];
};

const WeekSelector = ({
  weekStart,
  weekDays,
  loadingWeek,
  fecha,
  onSelectDay,
  onPrevWeek,
  onNextWeek,
  onWaitlist,
  barberoId,
  barberoInfo,
}) => {
  const parseLocalDate = (str) => {
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  /* ===============================
     ESTADOS BASE
  =============================== */

  if (!barberoId) {
    return (
      <FormGroup className="mb-4">
        <Label className="font-weight-bold">📅 Selecciona día</Label>
        <div className="alert alert-warning text-center py-3">
          <strong>Selecciona un barbero primero</strong>
          <p className="mb-0 small mt-1">
            Elige un barbero para ver los días disponibles
          </p>
        </div>
      </FormGroup>
    );
  }

  if (loadingWeek) {
    return (
      <FormGroup className="mb-4">
        <Label className="font-weight-bold">
          📅 Disponibilidad de la semana
        </Label>
        <div className="d-flex justify-content-center py-4 rounded">
          <Spinner size="sm" className="me-2" />
          Cargando disponibilidad...
        </div>
      </FormGroup>
    );
  }

  if (!weekDays || weekDays.length === 0) {
    return (
      <FormGroup className="mb-4">
        <Label className="font-weight-bold">
          📅 Disponibilidad de la semana
        </Label>
        <div className="alert alert-info text-center py-3">
          <strong>No hay datos de disponibilidad</strong>
        </div>
      </FormGroup>
    );
  }

  const hoyISO = todayISO();

  return (
    <FormGroup className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Label className="font-weight-bold mb-0 h5">
          📅 Disponibilidad de la semana
        </Label>
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
          size="sm"
        >
          <ChevronLeft size={18} />
        </Button>

        <div className="flex-grow-1 overflow-auto">
          <div style={{ display: "flex", gap: "10px" }}>
            {weekDays.map((d) => {
              const isPast = d.iso < hoyISO;
              const isToday = d.iso === hoyISO;
              const isSelected = d.iso === fecha;

              const horasDisponibles = (d.horas || []).filter(
                (h) => h.estado === "disponible",
              );

              const diaHabilitado = d.horas && d.horas.length > 0;
              const diaTieneHoras = horasDisponibles.length > 0;
              const diaLleno = diaHabilitado && !diaTieneHoras;

              // 👉 bloqueo final
              const diaBloqueado = isPast || !diaHabilitado;

              return (
                <div
                  key={d.iso}
                  style={{
                    position: "relative",
                    flex: 1,
                    minWidth: "85px",
                  }}
                >
                  {/* 🔔 Campanita SOLO si NO es pasado y NO habilitado */}
                  {!isPast && !diaHabilitado && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onWaitlist?.({ fecha: d.iso, barberoId });
                      }}
                      style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-8px",
                        backgroundColor: "#ffc107",
                        padding: "6px",
                        borderRadius: "50%",
                        cursor: "pointer",
                        zIndex: 10,
                      }}
                      title="Avisarme si se habilita"
                    >
                      <Bell size={16} />
                    </div>
                  )}

                  {/* TARJETA DÍA */}
                  <div
                    onClick={() => {
                      if (!diaBloqueado) {
                        onSelectDay(d.iso);
                      }
                    }}
                    style={{
                      padding: "12px 8px",
                      borderRadius: "12px",
                      cursor: diaBloqueado ? "not-allowed" : "pointer",
                      opacity: diaBloqueado ? 0.5 : 1,
                      backgroundColor: isSelected
                        ? "#09cf62"
                        : diaTieneHoras
                          ? "#ffffff"
                          : "#f8f9fa",
                      color: isSelected
                        ? "#fff"
                        : diaBloqueado
                          ? "#6c757d"
                          : "#212529",
                      border: isSelected
                        ? "2px solid #28a745"
                        : "1px solid #dee2e6",
                      textAlign: "center",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ fontSize: "12px", fontWeight: 600 }}>
                      {parseLocalDate(d.iso).toLocaleDateString("es-CL", {
                        weekday: "short",
                      })}
                    </div>

                    <div style={{ fontSize: "20px", fontWeight: 700 }}>
                      {parseLocalDate(d.iso).getDate()}
                    </div>

                    <div style={{ fontSize: "11px", opacity: 0.8 }}>
                      {parseLocalDate(d.iso).toLocaleDateString("es-CL", {
                        month: "short",
                      })}
                    </div>

                    <div style={{ marginTop: "4px", fontSize: "11px" }}>
                      {isPast ? (
                        <span>Fecha pasada</span>
                      ) : diaTieneHoras ? (
                        <strong>{horasDisponibles.length} hrs</strong>
                      ) : diaLleno ? (
                        <span>Sin horas</span>
                      ) : (
                        <span>No disponible</span>
                      )}
                    </div>

                    {isToday && !isPast && (
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
                </div>
              );
            })}
          </div>
        </div>

        <Button
          color="outline-primary"
          onClick={onNextWeek}
          className="ms-2 p-2"
          size="sm"
        >
          <ChevronRight size={18} />
        </Button>
      </div>

      <div className="text-muted small">
        Semana del {formatDayLabel(new Date(weekStart))}
      </div>
    </FormGroup>
  );
};

export default WeekSelector;

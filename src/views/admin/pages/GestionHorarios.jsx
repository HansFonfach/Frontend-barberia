// src/views/admin/pages/GestionHorarios.jsx
import React, { useState, useMemo } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Badge,
  Spinner,
  Alert,
} from "reactstrap";
import { PlusCircle, Calendar, Clock, User, Scissors, Lock, Unlock, Star, CheckCircle } from "lucide-react";

import UserHeader from "components/Headers/UserHeader";
import { useAuth } from "context/AuthContext";
import { useHorario } from "context/HorarioContext";
import { useGestionHorariosAdmin } from "hooks/useGestionHorariosAdmin";

// ─── Helpers ───────────────────────────────────────────────────────────────
const sumarMinutos = (horaStr, minutos) => {
  const [h, m] = horaStr.split(":").map(Number);
  const total = h * 60 + m + minutos;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

const ESTADO_CONFIG = {
  disponible: {
    bg: "#f0fdf4",
    border: "#22c55e",
    badge: "success",
    label: "Disponible",
    icon: <CheckCircle size={13} />,
  },
  reservada: {
    bg: "#fffbeb",
    border: "#f59e0b",
    badge: "warning",
    label: "Reservada",
    icon: <Calendar size={13} />,
  },
  ocupada: {
    bg: "#fef9c3",
    border: "#eab308",
    badge: "warning",
    label: "Ocupada",
    icon: null,
  },
  bloqueada: {
    bg: "#fef2f2",
    border: "#ef4444",
    badge: "danger",
    label: "Bloqueada",
    icon: <Lock size={13} />,
  },
  cancelada: {
    bg: "#fef2f2",
    border: "#ef4444",
    badge: "danger",
    label: "Cancelada",
    icon: <Lock size={13} />,
  },
  extra: {
    bg: "#eff6ff",
    border: "#3b82f6",
    badge: "info",
    label: "Extra",
    icon: <Star size={13} />,
  },
  colacion: {
    bg: "#f5f3ff",
    border: "#8b5cf6",
    badge: "secondary",
    label: "Colación",
    icon: <Clock size={13} />,
  },
};

// ─── Agrupa slots: reservada + sus desbordes en un solo bloque ──────────────
const agruparBloques = (horas) => {
  if (!horas || horas.length === 0) return [];

  const grupos = [];
  let i = 0;

  while (i < horas.length) {
    const slot = horas[i];

    if (slot.estado === "reservada") {
      // Absorber slots de desborde que siguen
      const slotsDelBloque = [slot];
      let j = i + 1;

      while (j < horas.length && horas[j].esDesborde) {
        slotsDelBloque.push(horas[j]);
        j++;
      }

      const horaInicio = slot.hora;
      const duracion = slot.reserva?.duracion || 30;
      const horaFin = sumarMinutos(horaInicio, duracion);

      grupos.push({
        ...slot,
        horaInicio,
        horaFin,
        spanSlots: slotsDelBloque.length,
      });

      i = j;
    } else if (slot.esDesborde) {
      // Desborde huérfano (edge case), lo saltamos
      i++;
    } else {
      grupos.push({ ...slot, horaInicio: slot.hora, horaFin: sumarMinutos(slot.hora, 30) });
      i++;
    }
  }

  return grupos;
};

// ─── Componente SlotCard ────────────────────────────────────────────────────
const SlotCard = ({ grupo, horasCanceladasSet, horasExtraSet, onToggle, onEliminarExtra }) => {
  const config = ESTADO_CONFIG[grupo.estado] || ESTADO_CONFIG.disponible;
  const rangoLabel =
    grupo.estado === "reservada"
      ? `${grupo.horaInicio} → ${grupo.horaFin}`
      : grupo.horaInicio;

  return (
    <div
      style={{
        background: config.bg,
        border: `1.5px solid ${config.border}`,
        borderLeft: `4px solid ${config.border}`,
        borderRadius: "10px",
        padding: "12px 14px",
        minHeight: "72px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.2s",
      }}
    >
      {/* Info izquierda */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
          <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1e293b" }}>
            {rangoLabel}
          </span>
          <Badge
            color={config.badge}
            pill
            style={{ fontSize: "0.7rem", display: "flex", alignItems: "center", gap: "3px" }}
          >
            {config.icon} {config.label}
          </Badge>
          {grupo.estado === "reservada" && grupo.reserva?.duracion && (
            <span style={{ fontSize: "0.72rem", color: "#92400e", fontWeight: 600 }}>
              {grupo.reserva.duracion} min
            </span>
          )}
        </div>

        {grupo.estado === "reservada" && grupo.reserva && (
          <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
            <span style={{ marginRight: "10px" }}>
              <User size={11} style={{ marginRight: "3px" }} />
              {grupo.reserva.cliente?.nombre || "—"}
            </span>
            <span>
              <Scissors size={11} style={{ marginRight: "3px" }} />
              {grupo.reserva.servicio || "—"}
            </span>
          </div>
        )}
      </div>

      {/* Acción derecha */}
      <div style={{ flexShrink: 0 }}>
        {(grupo.estado === "disponible" ||
          grupo.estado === "cancelada" ||
          grupo.estado === "bloqueada") && (
          <Button
            size="sm"
            color={grupo.estado === "disponible" ? "danger" : "success"}
            outline
            onClick={() => onToggle(grupo.horaInicio)}
            style={{ fontSize: "0.75rem", padding: "4px 10px" }}
          >
            {grupo.estado === "disponible" ? (
              <><Lock size={12} className="me-1" />Bloquear</>
            ) : (
              <><Unlock size={12} className="me-1" />Habilitar</>
            )}
          </Button>
        )}

        {grupo.estado === "extra" && (
          <Button
            size="sm"
            color="danger"
            outline
            onClick={() => onEliminarExtra(grupo.horaInicio)}
            style={{ fontSize: "0.75rem", padding: "4px 10px" }}
          >
            Eliminar
          </Button>
        )}
      </div>
    </div>
  );
};

// ─── Componente principal ───────────────────────────────────────────────────
const GestionHorarios = () => {
  const { user, isAuthenticated } = useAuth();
  const barbero = user?.id || user?._id;

  const { agregarHoraExtraDiaria, cancelarHoraExtraDiaria, toggleHoraPorDia } =
    useHorario();

  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [nuevaHora, setNuevaHora] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  const {
    todasLasHoras,
    horasExtra,
    horasCanceladas,
    cargando,
    error,
    refetch,
    infoFeriado,
    horasAdmin,
  } = useGestionHorariosAdmin(barbero, fechaSeleccionada);

  const esHoy = useMemo(() => {
    const hoy = new Date().toISOString().split("T")[0];
    return fechaSeleccionada === hoy;
  }, [fechaSeleccionada]);

  const filtrarHorasFuturas = (horas) => {
    if (!esHoy) return horas;
    const ahora = new Date();
    const horaActual = ahora.getHours();
    const minutoActual = ahora.getMinutes();
    return horas.filter((item) => {
      const [hora, minuto] = item.hora.split(":").map(Number);
      if (hora > horaActual) return true;
      if (hora === horaActual && minuto >= minutoActual - 30) return true;
      return false;
    });
  };

  const horasCanceladasSet = useMemo(() => new Set(horasCanceladas), [horasCanceladas]);
  const horasExtraSet = useMemo(() => new Set(horasExtra.map((h) => h.hora)), [horasExtra]);

  const horasAgrupadas = useMemo(() => {
    const horasFiltradas = filtrarHorasFuturas(horasAdmin);
    return agruparBloques(horasFiltradas);
  }, [horasAdmin, esHoy]);

  // Stats rápidas
  const stats = useMemo(() => {
    const base = horasAdmin || [];
    return {
      disponibles: base.filter((h) => h.estado === "disponible").length,
      reservadas: base.filter((h) => h.estado === "reservada").length,
      bloqueadas: base.filter((h) => h.estado === "bloqueada" || h.estado === "cancelada").length,
      extras: base.filter((h) => h.estado === "extra").length,
    };
  }, [horasAdmin]);

  const onToggleHora = async (hora) => {
    try {
      setMensajeError("");
      const esBloqueada = horasCanceladasSet.has(hora);
      if (infoFeriado) {
        if (esBloqueada) {
          await agregarHoraExtraDiaria(barbero, fechaSeleccionada, hora);
          setMensaje(`Hora ${hora} habilitada para el feriado`);
        } else {
          await cancelarHoraExtraDiaria(barbero, fechaSeleccionada, hora);
          setMensaje(`Hora ${hora} bloqueada nuevamente`);
        }
      } else {
        await toggleHoraPorDia(hora, fechaSeleccionada, barbero);
        setMensaje(`Hora ${hora} ${esBloqueada ? "reactivada" : "cancelada"}`);
      }
      await refetch();
    } catch (err) {
      setMensajeError(`Error al actualizar hora ${hora}`);
    }
  };

  const onAgregarHoraExtra = async () => {
    if (!nuevaHora) { setMensajeError("Selecciona una hora"); return; }
    if (horasExtraSet.has(nuevaHora)) { setMensajeError(`La hora ${nuevaHora} ya está agregada como extra`); return; }
    try {
      setMensajeError("");
      await agregarHoraExtraDiaria(barbero, fechaSeleccionada, nuevaHora);
      setNuevaHora("");
      setMensaje(`Hora extra ${nuevaHora} agregada correctamente`);
      await refetch();
    } catch (err) {
      setMensajeError(`Error al agregar hora extra ${nuevaHora}`);
    }
  };

  const onEliminarHoraExtra = async (hora) => {
    try {
      setMensajeError("");
      await cancelarHoraExtraDiaria(barbero, fechaSeleccionada, hora);
      setMensaje(`Hora extra ${hora} eliminada correctamente`);
      await refetch();
    } catch (err) {
      setMensajeError(`Error al eliminar hora extra ${hora}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <Container className="mt--7 mb-5 text-center">
        <Spinner />
      </Container>
    );
  }

  return (
    <>
      <UserHeader />
      <Container className="mt--7 mb-5" style={{ maxWidth: "1000px" }}>
        <Card className="shadow">
          <CardHeader
            style={{
              background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
              borderRadius: "12px 12px 0 0",
              padding: "20px 24px",
            }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <Calendar size={22} color="white" />
                <h5 className="mb-0 text-white fw-bold">Gestión de Horarios</h5>
              </div>
              {esHoy && (
                <Badge
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    color: "white",
                    fontSize: "0.75rem",
                    padding: "5px 10px",
                    borderRadius: "20px",
                  }}
                >
                  Hoy
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardBody style={{ padding: "24px" }}>
            {mensaje && (
              <Alert color="success" toggle={() => setMensaje("")} className="rounded-3">
                ✅ {mensaje}
              </Alert>
            )}
            {mensajeError && (
              <Alert color="danger" toggle={() => setMensajeError("")} className="rounded-3">
                ❌ {mensajeError}
              </Alert>
            )}
            {error && <Alert color="danger">{error}</Alert>}

            {/* Selector de fecha */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "20px",
              }}
            >
              <FormGroup className="mb-0">
                <Label style={{ fontWeight: 600, color: "#374151", fontSize: "0.85rem" }}>
                  <Calendar size={14} className="me-1" /> Fecha
                </Label>
                <Input
                  type="date"
                  value={fechaSeleccionada}
                  onChange={(e) => setFechaSeleccionada(e.target.value)}
                  style={{ borderRadius: "8px", border: "1px solid #d1d5db", maxWidth: "220px" }}
                />
              </FormGroup>
            </div>

            {cargando ? (
              <div className="text-center p-5">
                <Spinner color="primary" />
                <p className="text-muted mt-2">Cargando horarios...</p>
              </div>
            ) : (
              <>
                {infoFeriado && (
                  <Alert color="warning" className="rounded-3 d-flex align-items-center">
                    <Calendar size={16} className="me-2 flex-shrink-0" />
                    <div>
                      <strong>Feriado: {infoFeriado.nombre}</strong>
                      <br />
                      <small>Las horas aparecen bloqueadas. Activa las que quieras habilitar.</small>
                    </div>
                  </Alert>
                )}

                {/* Stats rápidas */}
                {horasAdmin?.length > 0 && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: "10px",
                      marginBottom: "20px",
                    }}
                  >
                    {[
                      { label: "Disponibles", value: stats.disponibles, color: "#22c55e", bg: "#f0fdf4" },
                      { label: "Reservadas", value: stats.reservadas, color: "#f59e0b", bg: "#fffbeb" },
                      { label: "Bloqueadas", value: stats.bloqueadas, color: "#ef4444", bg: "#fef2f2" },
                      { label: "Extras", value: stats.extras, color: "#3b82f6", bg: "#eff6ff" },
                    ].map((s) => (
                      <div
                        key={s.label}
                        style={{
                          background: s.bg,
                          border: `1px solid ${s.color}30`,
                          borderRadius: "10px",
                          padding: "12px",
                          textAlign: "center",
                        }}
                      >
                        <div style={{ fontSize: "1.5rem", fontWeight: 700, color: s.color }}>
                          {s.value}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 500 }}>
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Grilla de slots */}
                {horasAgrupadas.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#94a3b8",
                      background: "#f8fafc",
                      borderRadius: "10px",
                    }}
                  >
                    <Clock size={32} style={{ opacity: 0.4, marginBottom: "8px" }} />
                    <p className="mb-0">Sin horarios para esta fecha</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {horasAgrupadas.map((grupo) => (
                      <SlotCard
                        key={`${grupo.horaInicio}-${grupo.estado}`}
                        grupo={grupo}
                        horasCanceladasSet={horasCanceladasSet}
                        horasExtraSet={horasExtraSet}
                        onToggle={onToggleHora}
                        onEliminarExtra={onEliminarHoraExtra}
                      />
                    ))}
                  </div>
                )}

                {/* Agregar hora extra */}
                <div
                  style={{
                    marginTop: "24px",
                    background: "#eff6ff",
                    border: "1.5px dashed #3b82f6",
                    borderRadius: "10px",
                    padding: "16px",
                  }}
                >
                  <h6
                    className="mb-3 d-flex align-items-center gap-2"
                    style={{ color: "#2563eb", fontWeight: 600 }}
                  >
                    <PlusCircle size={16} />
                    Agregar Hora Extra
                  </h6>
                  <div className="d-flex gap-2 align-items-center flex-wrap">
                    <Input
                      type="time"
                      value={nuevaHora}
                      onChange={(e) => setNuevaHora(e.target.value)}
                      style={{ borderRadius: "8px", maxWidth: "160px" }}
                    />
                    <Button
                      onClick={onAgregarHoraExtra}
                      color="primary"
                      disabled={!nuevaHora}
                      style={{ borderRadius: "8px" }}
                    >
                      <PlusCircle size={14} className="me-1" />
                      Agregar
                    </Button>
                  </div>
                </div>

                {/* Leyenda */}
                <div
                  style={{
                    marginTop: "16px",
                    display: "flex",
                    gap: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  {Object.entries(ESTADO_CONFIG)
                    .filter(([k]) => k !== "ocupada")
                    .map(([key, cfg]) => (
                      <div
                        key={key}
                        style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.75rem", color: "#64748b" }}
                      >
                        <div
                          style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "3px",
                            background: cfg.border,
                            flexShrink: 0,
                          }}
                        />
                        {cfg.label}
                      </div>
                    ))}
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </Container>
    </>
  );
};

export default GestionHorarios;
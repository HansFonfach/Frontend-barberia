// src/components/gestionReservas/ReservasSemana.jsx
//
// Vista "Semana completa" de Gestión de Reservas. Mismo criterio visual y
// misma técnica de grilla que ya se usa en Clases y horarios (grilla propia
// en píxeles, sin librería externa — ver GestionClases.jsx), pero acá SÍ
// son fechas reales (no un horario recurrente): cada bloque es una reserva
// real de la semana que se está mirando.
//
// Desktop: calendario semanal con columnas por día y bloques posicionados
// por hora real. Mobile: agenda vertical por día (la grilla no entra bien
// en una pantalla angosta, así que se prioriza legibilidad).
//
// Color de los bloques: por SERVICIO (no por estado) — así de un vistazo se
// ve qué se está haciendo en cada horario. El estado (pendiente/confirmada/
// etc.) se sigue mostrando, pero como un punto pequeño sobre el bloque y en
// la tarjeta mobile, para no perder esa info. Los colores por servicio se
// asignan automáticamente y cada profesional puede personalizarlos — la
// personalización se guarda en este dispositivo, por profesional (no se
// comparte entre distintos profesionales de la misma empresa).
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";

// ─── Estado visual de una reserva (mismo criterio que ReservaCardMobile /
// ReservaTableDesktop, para que el color/label sea siempre el mismo en
// cualquier vista del panel) ────────────────────────────────────────────
const getEstadoReserva = (reserva) => {
  if (reserva.estado === "no_asistio") return "No asistió";
  if (reserva.estado === "completada") return "Completada";

  if (
    reserva.confirmacionAsistencia?.respondida &&
    reserva.confirmacionAsistencia?.respuesta === "confirma"
  ) {
    return "Confirmada por Cliente";
  }

  const fechaReserva = new Date(reserva.fecha);
  const ahora = new Date();

  if (reserva.estado === "confirmada") return "Confirmada";
  if (fechaReserva < ahora) return "Terminada";

  return "Pendiente";
};

const ESTILO_ESTADO = {
  Pendiente: "#f59e0b",
  Confirmada: "#3b82f6",
  "Confirmada por Cliente": "#16a34a",
  Completada: "#16a34a",
  Terminada: "#64748b",
  "No asistió": "#ef4444",
};

const colorDeEstado = (reserva) => ESTILO_ESTADO[getEstadoReserva(reserva)] || "#8898aa";

const duracionReserva = (reserva) =>
  Number(reserva.duracion) || Number(reserva.servicio?.duracion) || 30;

// ─── Color por servicio ────────────────────────────────────────────────
// Paleta de respaldo para servicios sin color propio elegido — mismo
// criterio que PALETA en GestionClases.jsx (colores saturados, con buen
// contraste para texto blanco encima).
const PALETA_SERVICIOS = [
  "#4361ee",
  "#2D9CDB",
  "#27AE60",
  "#E67E22",
  "#EB5757",
  "#9B51E0",
  "#F2994A",
  "#06A77D",
  "#C2185B",
  "#455A64",
];

const idServicio = (servicio) => servicio?._id || servicio?.nombre || "sin-servicio";
const nombreServicio = (servicio) => servicio?.nombre || "Sin servicio";

// ─── Fechas ──────────────────────────────────────────────────────────────
const DIAS_LARGOS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];
const DIAS_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const aYYYYMMDD = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// Formato corto de hora (24h, "HH:mm") — ocupa menos espacio horizontal que
// toLocaleTimeString con am/pm, clave para que los bloques angostos no se
// vean "cortados".
const horaCorta = (fecha) => {
  const d = new Date(fecha);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

// Hora de término (inicio + duración del servicio) y rango "10:00–10:30"
// listo para mostrar junto a la hora de inicio.
const finReserva = (reserva) =>
  new Date(new Date(reserva.fecha).getTime() + duracionReserva(reserva) * 60000);
const rangoHora = (reserva) => `${horaCorta(reserva.fecha)}–${horaCorta(finReserva(reserva))}`;

// ─── Grilla (misma técnica que el calendario de Clases y horarios) ───────
const ALTO_FILA = 92; // px por hora — más alto que antes para que quepan 2 líneas de texto sin verse achoclonado
const ALTO_HEADER = 54; // px del encabezado de días
const ANCHO_GUTTER = 52; // px de la columna de horas
const ANCHO_COLUMNA_MIN = 132; // px mínimo por columna de día — más ancho para que los bloques solapados no queden angostos

// Agrupa reservas que se superponen en el tiempo dentro de un mismo día y
// les asigna una "columna" para que se vean una al lado de la otra en vez
// de tapadas (mismo algoritmo greedy que usa el calendario de Clases).
const distribuirSolapes = (eventosDia) => {
  const ordenados = [...eventosDia].sort(
    (a, b) => a.start - b.start || a.end - b.end,
  );
  const resultado = [];
  let cluster = [];
  let finMaximoCluster = -Infinity;

  const cerrarCluster = () => {
    if (!cluster.length) return;
    const finColumnas = [];
    cluster.forEach((ev) => {
      let idx = finColumnas.findIndex((fin) => fin <= ev.start.getTime());
      if (idx === -1) {
        idx = finColumnas.length;
        finColumnas.push(ev.end.getTime());
      } else {
        finColumnas[idx] = ev.end.getTime();
      }
      resultado.push({ ...ev, colIdx: idx, totalColumnas: 0 });
    });
    const total = finColumnas.length;
    for (let i = resultado.length - cluster.length; i < resultado.length; i++) {
      resultado[i].totalColumnas = total;
    }
    cluster = [];
    finMaximoCluster = -Infinity;
  };

  ordenados.forEach((ev) => {
    if (cluster.length && ev.start.getTime() >= finMaximoCluster) {
      cerrarCluster();
    }
    cluster.push(ev);
    finMaximoCluster = Math.max(finMaximoCluster, ev.end.getTime());
  });
  cerrarCluster();

  return resultado;
};

const ReservasSemana = ({
  reservas,
  diasSemana,
  loading,
  onVer,
  isMobile,
  mostrarProfesional,
}) => {
  const { user } = useAuth();
  const barberoId = user?.id || user?._id || "sinid";
  const storageKey = `af_colores_servicios_${barberoId}`;

  // reservas "reagendada" son la reserva vieja que quedó reemplazada por
  // una nueva — no corresponde mostrarlas (mismo filtro que las otras
  // vistas de este panel). "cancelada" ya viene excluida desde el backend.
  const reservasVisibles = useMemo(
    () => (reservas || []).filter((r) => r.estado !== "reagendada"),
    [reservas],
  );

  const hoyStr = aYYYYMMDD(new Date());

  // ── Colores por servicio: automáticos + personalización guardada en
  // este dispositivo (por profesional) ──
  const [coloresPersonalizados, setColoresPersonalizados] = useState({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setColoresPersonalizados(raw ? JSON.parse(raw) : {});
    } catch {
      setColoresPersonalizados({});
    }
  }, [storageKey]);

  const guardarColorServicio = (idSvc, color) => {
    setColoresPersonalizados((prev) => {
      const actualizado = { ...prev, [idSvc]: color };
      try {
        localStorage.setItem(storageKey, JSON.stringify(actualizado));
      } catch {
        // localStorage puede fallar (modo privado, cuota llena, etc.) — no
        // es crítico, el color simplemente no persiste entre sesiones.
      }
      return actualizado;
    });
  };

  const restablecerColores = () => {
    setColoresPersonalizados({});
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* no-op */
    }
  };

  // Servicios presentes en la semana visible, ordenados por nombre (orden
  // estable → siempre le toca el mismo color automático mientras no cambie
  // el conjunto de servicios).
  const serviciosInfo = useMemo(() => {
    const mapa = new Map();
    reservasVisibles.forEach((r) => {
      const id = idServicio(r.servicio);
      if (!mapa.has(id)) {
        mapa.set(id, { id, nombre: nombreServicio(r.servicio), count: 0 });
      }
      mapa.get(id).count += 1;
    });
    return Array.from(mapa.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [reservasVisibles]);

  const indiceServicio = useMemo(() => {
    const mapa = new Map();
    serviciosInfo.forEach((s, i) => mapa.set(s.id, i));
    return mapa;
  }, [serviciosInfo]);

  const colorDeServicio = (servicio) => {
    const id = idServicio(servicio);
    if (coloresPersonalizados[id]) return coloresPersonalizados[id];
    const idx = indiceServicio.get(id) ?? 0;
    return PALETA_SERVICIOS[idx % PALETA_SERVICIOS.length];
  };

  // ── Rango de horas de la grilla: se adapta a lo que realmente hay
  // reservado esa semana, con un mínimo razonable (9 a 20) para que la
  // grilla nunca se vea vacía/rota si esa semana no tiene nada agendado.
  const { horaInicioGrilla, horaFinGrilla } = useMemo(() => {
    if (!reservasVisibles.length) return { horaInicioGrilla: 9, horaFinGrilla: 20 };

    let min = 9;
    let max = 20;
    reservasVisibles.forEach((r) => {
      const start = new Date(r.fecha);
      const finMin = start.getHours() * 60 + start.getMinutes() + duracionReserva(r);
      min = Math.min(min, start.getHours());
      max = Math.max(max, Math.ceil(finMin / 60));
    });
    return {
      horaInicioGrilla: Math.max(0, min),
      horaFinGrilla: Math.min(24, Math.max(max, min + 1)),
    };
  }, [reservasVisibles]);

  const horasGrilla = useMemo(
    () =>
      Array.from(
        { length: horaFinGrilla - horaInicioGrilla },
        (_, i) => horaInicioGrilla + i,
      ),
    [horaInicioGrilla, horaFinGrilla],
  );

  // ── Reservas agrupadas por día (yyyy-mm-dd) ──
  const reservasPorDia = useMemo(() => {
    const mapa = new Map();
    diasSemana.forEach((d) => mapa.set(d, []));
    reservasVisibles.forEach((r) => {
      const key = aYYYYMMDD(new Date(r.fecha));
      if (mapa.has(key)) mapa.get(key).push(r);
    });
    return mapa;
  }, [reservasVisibles, diasSemana]);

  // ── Posicionamiento en píxeles para la grilla desktop ──
  const eventosPosicionados = useMemo(() => {
    if (isMobile) return [];
    const resultado = [];
    diasSemana.forEach((diaStr, colIdx) => {
      const eventosDia = (reservasPorDia.get(diaStr) || []).map((r) => {
        const start = new Date(r.fecha);
        const end = new Date(start.getTime() + duracionReserva(r) * 60000);
        return { start, end, reserva: r };
      });

      distribuirSolapes(eventosDia).forEach((ev) => {
        const inicioMin =
          ev.start.getHours() * 60 + ev.start.getMinutes() - horaInicioGrilla * 60;
        const duracionMin = Math.max(15, (ev.end.getTime() - ev.start.getTime()) / 60000);
        const anchoColPct = 100 / diasSemana.length;
        const anchoSubColPct = anchoColPct / ev.totalColumnas;

        resultado.push({
          key: ev.reserva._id,
          reserva: ev.reserva,
          top: Math.max(0, (inicioMin / 60) * ALTO_FILA),
          // Piso de 30px: aunque la reserva dure 15 min, el bloque necesita
          // un mínimo de alto para no verse cortado/ilegible.
          height: Math.max(30, (duracionMin / 60) * ALTO_FILA - 2),
          leftPct: colIdx * anchoColPct + ev.colIdx * anchoSubColPct,
          widthPct: anchoSubColPct,
          totalColumnas: ev.totalColumnas,
        });
      });
    });
    return resultado;
  }, [diasSemana, reservasPorDia, horaInicioGrilla, isMobile]);

  const totalSemana = reservasVisibles.length;

  if (loading) {
    return (
      <div className="text-center py-5">
        <span className="text-muted">Cargando reservas de la semana...</span>
      </div>
    );
  }

  // ═══════════════════════════ MOBILE: agenda vertical ═══════════════════
  if (isMobile) {
    return (
      <div style={{ padding: "4px 0" }}>
        {diasSemana.map((diaStr) => {
          const fecha = new Date(diaStr + "T00:00:00");
          const esHoy = diaStr === hoyStr;
          const reservasDia = (reservasPorDia.get(diaStr) || []).sort(
            (a, b) => new Date(a.fecha) - new Date(b.fecha),
          );

          return (
            <div key={diaStr} style={{ marginBottom: 14 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  borderRadius: 10,
                  background: esHoy ? "#EAF2FF" : "#fafafa",
                  border: `1px solid ${esHoy ? "#C7DBF5" : "#f0f0f0"}`,
                  marginBottom: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: esHoy ? "#2D5FA3" : "#1a1a2e",
                      textTransform: "capitalize",
                    }}
                  >
                    {DIAS_LARGOS[fecha.getDay()]}
                  </span>
                  <span style={{ fontSize: 12, color: "#8898aa" }}>
                    {fecha.toLocaleDateString("es-CL", { day: "numeric", month: "short" })}
                  </span>
                  {esHoy && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#2D5FA3",
                        background: "#D9E8FF",
                        borderRadius: 99,
                        padding: "1px 8px",
                      }}
                    >
                      HOY
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 12, color: "#8898aa", fontWeight: 600 }}>
                  {reservasDia.length
                    ? `${reservasDia.length} reserva${reservasDia.length === 1 ? "" : "s"}`
                    : "Sin reservas"}
                </span>
              </div>

              {reservasDia.map((r) => (
                <div
                  key={r._id}
                  onClick={() => onVer(r)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px",
                    borderRadius: 10,
                    background: "#fff",
                    border: "1px solid #e9ecef",
                    borderLeft: `4px solid ${colorDeServicio(r.servicio)}`,
                    marginBottom: 6,
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: 12.5, color: "#1a1a2e", minWidth: 82 }}>
                    {rangoHora(r)}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#1a1a2e",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.cliente?.nombre} {r.cliente?.apellido}
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        color: "#8898aa",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.servicio?.nombre}
                      {/* 👇 NUEVO: solo aparece en la vista "Todo el equipo" (admin) */}
                      {mostrarProfesional && r.barbero?.nombre && (
                        <span> · {r.barbero.nombre}</span>
                      )}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#fff",
                      background: colorDeEstado(r),
                      borderRadius: 99,
                      padding: "3px 9px",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {getEstadoReserva(r)}
                  </span>
                </div>
              ))}
            </div>
          );
        })}

        {totalSemana === 0 && (
          <p style={{ fontSize: 13, color: "#8898aa", textAlign: "center", padding: "24px 8px" }}>
            No hay reservas esta semana.
          </p>
        )}
      </div>
    );
  }

  // ═══════════════════════════ DESKTOP: grilla semanal ═══════════════════
  return (
    <div style={{ padding: "4px 0 8px" }}>
      <p style={{ fontSize: 12, color: "#8898aa", margin: "0 0 10px" }}>
        {totalSemana} reserva{totalSemana === 1 ? "" : "s"} esta semana. Haz clic en un bloque
        para ver el detalle.
      </p>

      <div style={{ overflowX: "auto", paddingBottom: 8 }}>
        <div style={{ position: "relative", minWidth: ANCHO_GUTTER + ANCHO_COLUMNA_MIN * 7 }}>
          {/* Grilla de fondo */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `${ANCHO_GUTTER}px repeat(${diasSemana.length}, minmax(${ANCHO_COLUMNA_MIN}px, 1fr))`,
              gridTemplateRows: `${ALTO_HEADER}px repeat(${horasGrilla.length}, ${ALTO_FILA}px)`,
            }}
          >
            <div
              style={{
                background: "#fafafa",
                borderBottom: "2px solid #e9ecef",
                borderRight: "1px solid #e9ecef",
              }}
            />
            {diasSemana.map((diaStr) => {
              const fecha = new Date(diaStr + "T00:00:00");
              const esHoy = diaStr === hoyStr;
              return (
                <div
                  key={`enc-${diaStr}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: esHoy ? "#EAF2FF" : "#fafafa",
                    borderBottom: `2px solid ${esHoy ? "#8FB8EE" : "#e9ecef"}`,
                    borderRight: "1px solid #f0f0f0",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: esHoy ? "#2D5FA3" : "#8898aa",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {DIAS_CORTOS[fecha.getDay()]}
                  </span>
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: esHoy ? "#2D5FA3" : "#1a1a2e",
                    }}
                  >
                    {fecha.getDate()}
                  </span>
                </div>
              );
            })}

            {horasGrilla.map((h) => (
              <React.Fragment key={`fila-${h}`}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "flex-end",
                    paddingRight: 8,
                    paddingTop: 4,
                    fontSize: 11.5,
                    color: "#8898aa",
                    borderRight: "1px solid #e9ecef",
                    borderBottom: "1px solid #f5f5f5",
                  }}
                >
                  {`${String(h).padStart(2, "0")}:00`}
                </div>
                {diasSemana.map((diaStr) => (
                  <div
                    key={`celda-${h}-${diaStr}`}
                    style={{
                      borderRight: "1px solid #f0f0f0",
                      borderBottom: "1px solid #f5f5f5",
                      background: diaStr === hoyStr ? "#FAFCFF" : "transparent",
                    }}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>

          {/* Capa de eventos */}
          <div
            style={{
              position: "absolute",
              top: ALTO_HEADER,
              left: ANCHO_GUTTER,
              right: 0,
              height: ALTO_FILA * horasGrilla.length,
              pointerEvents: "none",
            }}
          >
            {eventosPosicionados.map((ev) => {
              // Bloques bajos (turnos cortos) o muy angostos (varios
              // solapados a la vez) van en una sola línea — mostrar 2
              // líneas ahí terminaba recortando el texto ("cortadas").
              const compacto = ev.height < 42 || ev.totalColumnas >= 3;

              return (
                <div
                  key={ev.key}
                  onClick={() => onVer(ev.reserva)}
                  title={`${rangoHora(ev.reserva)} · ${ev.reserva.cliente?.nombre || ""} ${ev.reserva.cliente?.apellido || ""} · ${ev.reserva.servicio?.nombre || ""} · ${getEstadoReserva(ev.reserva)}${mostrarProfesional && ev.reserva.barbero?.nombre ? ` · ${ev.reserva.barbero.nombre} ${ev.reserva.barbero?.apellido || ""}`.trimEnd() : ""}`}
                  style={{
                    position: "absolute",
                    top: ev.top,
                    left: `${ev.leftPct}%`,
                    width: `calc(${ev.widthPct}% - 4px)`,
                    height: ev.height,
                    backgroundColor: colorDeServicio(ev.reserva.servicio),
                    borderRadius: 6,
                    color: "#fff",
                    fontSize: 11.5,
                    fontWeight: 600,
                    padding: compacto ? "3px 6px" : "4px 6px",
                    overflow: "hidden",
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                    pointerEvents: "auto",
                    lineHeight: 1.25,
                  }}
                >
                  {/* Puntito de estado — para no perder esa info al colorear
                      el bloque por servicio */}
                  <span
                    title={getEstadoReserva(ev.reserva)}
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: colorDeEstado(ev.reserva),
                      border: "1.5px solid rgba(255,255,255,0.9)",
                    }}
                  />

                  {compacto ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        height: "100%",
                        paddingRight: 10,
                      }}
                    >
                      <span style={{ fontWeight: 700, flexShrink: 0 }}>
                        {horaCorta(ev.reserva.fecha)}
                      </span>
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {ev.reserva.cliente?.nombre}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div
                        style={{
                          fontWeight: 700,
                          paddingRight: 10,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {rangoHora(ev.reserva)}
                      </div>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {ev.reserva.cliente?.nombre} {ev.reserva.cliente?.apellido}
                        {/* 👇 NUEVO: solo en la vista "Todo el equipo" (admin) */}
                        {mostrarProfesional && ev.reserva.barbero?.nombre && (
                          <span style={{ opacity: 0.85 }}> · {ev.reserva.barbero.nombre}</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Colores por servicio — automáticos, personalizables por cada
          profesional (se guardan en este dispositivo) */}
      <div
        style={{
          marginTop: 16,
          padding: "12px 14px",
          background: "#fafbfc",
          border: "1px solid #f0f0f0",
          borderRadius: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a2e" }}>
            Colores por servicio
          </span>
          {Object.keys(coloresPersonalizados).length > 0 && (
            <button
              type="button"
              onClick={restablecerColores}
              style={{
                fontSize: 11,
                color: "#8898aa",
                background: "none",
                border: "none",
                textDecoration: "underline",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Restablecer colores
            </button>
          )}
        </div>

        {serviciosInfo.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {serviciosInfo.map((s) => (
              <label
                key={s.id}
                style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
                title="Elegir color para este servicio"
              >
                <input
                  type="color"
                  value={colorDeServicio({ _id: s.id, nombre: s.nombre })}
                  onChange={(e) => guardarColorServicio(s.id, e.target.value)}
                  style={{
                    width: 20,
                    height: 20,
                    padding: 0,
                    border: "2px solid #fff",
                    borderRadius: 6,
                    boxShadow: "0 0 0 1px #dfe3e8",
                    cursor: "pointer",
                  }}
                />
                <span style={{ fontSize: 12, color: "#495057" }}>{s.nombre}</span>
              </label>
            ))}
          </div>
        ) : (
          <span style={{ fontSize: 12, color: "#8898aa" }}>Sin reservas esta semana.</span>
        )}

        <p style={{ fontSize: 10.5, color: "#adb5bd", margin: "8px 0 0" }}>
          Haz clic en un color para cambiarlo. Se guarda en este dispositivo, por profesional.
        </p>
      </div>

      {/* Leyenda de estados — referencia del puntito que aparece en cada bloque */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 10, padding: "0 4px" }}>
        {Object.entries(ESTILO_ESTADO).map(([label, color]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: color,
                display: "inline-block",
                border: "1px solid #fff",
                boxShadow: "0 0 0 1px #e9ecef",
              }}
            />
            <span style={{ fontSize: 11.5, color: "#8898aa" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReservasSemana;

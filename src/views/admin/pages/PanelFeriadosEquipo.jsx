// src/views/admin/pages/PanelFeriadosEquipo.jsx
//
// Panel "Feriados" del equipo — solo para admin/dueño. Para cada feriado
// próximo, permite decidir si la empresa atiende o no ese día, y si
// atiende, qué profesionales trabajan, con qué horario, qué servicios y
// (opcional) qué precio especial. Todo con valores por defecto sensatos:
// marcar a un profesional sin tocar nada más significa "trabaja con su
// horario y servicios habituales, al precio normal" — personalizar es
// siempre opcional, nunca obligatorio.
//
// El auto-toggle simple de cada profesional (HabilitarFeriados.jsx, en
// /gestion-feriados) sigue existiendo tal cual para quien no es admin.
// Esta pantalla es la vista de equipo, aparte.
//
// "Habilitar atención" abre un wizard guiado de 4 pasos (Confirmar →
// Equipo → Personalizar → Resumen) en vez de activar el feriado de
// inmediato — así el admin arma todo antes de confirmar, y puede
// cancelar sin dejar nada a medias. Una vez habilitado, la edición día a
// día sigue en la lista de siempre (checkbox + "Editar" por
// profesional), que no cambió.
import React, { useEffect, useState, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Input,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
  Alert,
} from "reactstrap";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck,
  CalendarX,
  ChevronDown,
  ChevronUp,
  Settings,
  X,
  Check,
  Tag,
  Lock,
  Unlock,
} from "lucide-react";

import UserHeader from "components/Headers/UserHeader";
import { useHorario } from "context/HorarioContext";
import { useServicios } from "context/ServiciosContext";
import { useEmpresa } from "context/EmpresaContext";
import { construirTema } from "utils/temaEmpresa";
import { getServiciosBarbero } from "api/servicios";
import { getHorasProfesionalDia } from "api/horarios";

// Estilo de cada botón de hora en la grilla — mismo lenguaje visual que
// la grilla de Administrar Horarios, simplificado: acá solo importa
// disponible/bloqueada (clickeable) vs. el resto (informativo).
const ESTILO_HORA = {
  disponible: { bg: "#f0fdf4", border: "#22c55e", color: "#15803d" },
  bloqueada: { bg: "#fef2f2", border: "#ef4444", color: "#991b1b" },
  reservada: { bg: "#fffbeb", border: "#f59e0b", color: "#92400e" },
  ocupada: { bg: "#fef9c3", border: "#eab308", color: "#854d0e" },
  extra: { bg: "#eff6ff", border: "#3b82f6", color: "#1e40af" },
};

const fmtCLP = (n) => `$${Math.round(n || 0).toLocaleString("es-CL")}`;

const formatearFecha = (fechaStr) => {
  const [anio, mes, dia] = fechaStr.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  return fecha.toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

// Deriva el payload preciosEspeciales que espera el backend a partir del
// mapa { servicioId: "12000" } — un solo lugar para esta conversión,
// usado tanto por el modal de edición como por el wizard.
const armarPreciosEspeciales = (usarPrecioEspecial, preciosPorServicio, serviciosSeleccionados) => {
  if (!usarPrecioEspecial) return [];
  return Object.entries(preciosPorServicio || {})
    .filter(
      ([servicioId, valor]) =>
        valor &&
        (serviciosSeleccionados.length === 0 ||
          serviciosSeleccionados.includes(servicioId)),
    )
    .map(([servicioId, valor]) => ({
      servicio: servicioId,
      precio: Number(valor),
    }));
};

// ─── Estilos (mismo lenguaje visual que PanelEquipo.jsx) ──────────────────
const S = {
  card: {
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #e9ecef",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  cardHeader: {
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid #f0f0f0",
    background: "#fff",
  },
  title: { fontSize: 18, fontWeight: 700, color: "#1a1a2e", margin: 0 },
  subtitle: { fontSize: 12.5, color: "#8898aa", margin: "4px 0 0" },
};

// ─── Avatar de iniciales, reutilizado en varios lados de este archivo ─────
const Avatar = ({ nombre, apellido, size = 34 }) => {
  const iniciales = `${nombre?.[0] || ""}${apellido?.[0] || ""}`.toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg,#4361ee,#3a0ca3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span style={{ color: "#fff", fontWeight: 700, fontSize: size * 0.38 }}>
        {iniciales}
      </span>
    </div>
  );
};

// ─── Panel reutilizable: horas / servicios / precio especial de UN ────────
// profesional. Usado tanto en el modal de edición post-habilitación como
// en el paso "Personalizar" del wizard de habilitar feriado — misma
// lógica, un solo lugar donde vive.
const PanelPersonalizacion = ({
  prof,
  feriado,
  serviciosSeleccionados,
  setServiciosSeleccionados,
  usarPrecioEspecial,
  setUsarPrecioEspecial,
  preciosPorServicio,
  setPreciosPorServicio,
}) => {
  const { servicios: catalogoCompleto } = useServicios();
  const { toggleHoraPorDia } = useHorario();

  const [cargandoServicios, setCargandoServicios] = useState(false);
  const [serviciosAsignados, setServiciosAsignados] = useState([]);

  const [horasDia, setHorasDia] = useState([]);
  const [cargandoHoras, setCargandoHoras] = useState(false);
  const [errorHoras, setErrorHoras] = useState("");
  const [guardandoHora, setGuardandoHora] = useState(null);
  // 🔧 El back puede devolver una grilla vacía por DOS motivos muy distintos:
  // (a) el profesional de verdad no tiene horario ese día de la semana
  // (sinHorario), o (b) sí tiene horario, pero ese día puntual está
  // bloqueado o es un rango de vacaciones (bloqueado + motivo) — antes se
  // mostraba el mismo mensaje genérico de "no tiene horario habitual" en
  // ambos casos, lo cual es engañoso cuando el profesional SÍ trabaja ese
  // día de la semana normalmente.
  const [infoDiaVacio, setInfoDiaVacio] = useState(null);

  const cargarHorasDia = useCallback(() => {
    if (!prof || !feriado?.fecha) return;
    setCargandoHoras(true);
    setErrorHoras("");
    getHorasProfesionalDia(prof.barberoId, feriado.fecha)
      .then((res) => {
        setHorasDia(res?.horas || []);
        setInfoDiaVacio({
          bloqueado: !!res?.bloqueado,
          motivo: res?.motivo || null,
          sinHorario: !!res?.sinHorario,
        });
      })
      .catch(() => setErrorHoras("No se pudieron cargar las horas de este día"))
      .finally(() => setCargandoHoras(false));
  }, [prof, feriado]);

  useEffect(() => {
    if (!prof || !feriado?.fecha) return;
    setCargandoServicios(true);
    getServiciosBarbero(prof.barberoId)
      .then((res) => setServiciosAsignados(res.data || []))
      .catch(() => setServiciosAsignados([]))
      .finally(() => setCargandoServicios(false));
    cargarHorasDia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prof?.barberoId, feriado?.fecha]);

  const precioNormal = (servicioId) =>
    catalogoCompleto.find((s) => s._id === servicioId)?.precio || 0;

  const serviciosParaPrecio = usarPrecioEspecial
    ? serviciosAsignados.filter(
        (s) =>
          serviciosSeleccionados.length === 0 ||
          serviciosSeleccionados.includes(s.servicioId),
      )
    : [];

  const toggleServicio = (servicioId) => {
    setServiciosSeleccionados((prev) =>
      prev.includes(servicioId)
        ? prev.filter((id) => id !== servicioId)
        : [...prev, servicioId],
    );
  };

  const cambiarPrecio = (servicioId, valor) => {
    setPreciosPorServicio((prev) => ({ ...prev, [servicioId]: valor }));
  };

  const onClickHora = async (hora, estado) => {
    // Solo se puede bloquear una hora libre, o reactivar una ya bloqueada
    // — igual que en Administrar Horarios. Una hora reservada, ocupada por
    // desborde, o de una hora extra no se toca desde acá.
    if (estado !== "disponible" && estado !== "bloqueada") return;

    setGuardandoHora(hora);
    setErrorHoras("");
    try {
      await toggleHoraPorDia(hora, feriado.fecha, prof.barberoId, true);
      cargarHorasDia();
    } catch (err) {
      setErrorHoras(
        err?.response?.data?.message || `No se pudo actualizar la hora ${hora}`,
      );
    } finally {
      setGuardandoHora(null);
    }
  };

  if (cargandoServicios) {
    return (
      <div className="text-center py-4">
        <Spinner color="primary" size="sm" />
      </div>
    );
  }

  return (
    <>
      {/* Horas del día — click para bloquear/habilitar */}
      <div
        className="p-3 rounded mb-3"
        style={{ border: "1px solid #dee2e6", background: "#fafbff" }}
      >
        <Label style={{ fontWeight: 600, fontSize: 13.5, color: "#374151" }}>
          Horas disponibles ese día
          <span style={{ fontWeight: 400, color: "#94a3b8", marginLeft: 6 }}>
            (clic para bloquear o habilitar)
          </span>
        </Label>

        {errorHoras && (
          <Alert color="danger" className="rounded-3 py-2 mb-2" style={{ fontSize: 12.5 }}>
            {errorHoras}
          </Alert>
        )}

        {cargandoHoras ? (
          <div className="text-center py-3">
            <Spinner size="sm" color="primary" />
          </div>
        ) : horasDia.filter((h) => h.estado !== "colacion").length === 0 ? (
          <p className="text-muted small mb-0">
            {infoDiaVacio?.bloqueado ? (
              <>
                Este profesional tiene ese día bloqueado
                {infoDiaVacio.motivo ? ` (${infoDiaVacio.motivo})` : ""}, por
                eso no hay horas para mostrar aunque tenga horario habitual
                ese día de la semana. Revisa sus vacaciones o bloqueos en
                Administrar Horarios.
              </>
            ) : (
              <>
                Este profesional no tiene horario habitual ese día de la
                semana, así que no hay horas para mostrar. Asígnale un
                horario en Asignar Horarios primero.
              </>
            )}
          </p>
        ) : (
          <div className="d-flex flex-wrap" style={{ gap: 6 }}>
            {horasDia
              .filter((h) => h.estado !== "colacion")
              .map((h) => {
                const estilo = ESTILO_HORA[h.estado] || ESTILO_HORA.disponible;
                const clickeable =
                  h.estado === "disponible" || h.estado === "bloqueada";
                const cargando = guardandoHora === h.hora;
                return (
                  <span
                    key={h.hora}
                    onClick={() => !cargando && onClickHora(h.hora, h.estado)}
                    title={
                      h.estado === "reservada"
                        ? `Reservada${h.reserva?.cliente ? ` — ${h.reserva.cliente}` : ""}`
                        : h.estado === "extra"
                          ? "Hora extraordinaria — se edita en Gestión de Horarios"
                          : ""
                    }
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: `1.5px solid ${estilo.border}`,
                      background: estilo.bg,
                      color: estilo.color,
                      cursor: clickeable
                        ? cargando
                          ? "wait"
                          : "pointer"
                        : "default",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      opacity: cargando ? 0.6 : 1,
                      userSelect: "none",
                    }}
                  >
                    {h.estado === "bloqueada" && <Lock size={10} />}
                    {h.estado === "disponible" && <Unlock size={10} />}
                    {h.hora}
                  </span>
                );
              })}
          </div>
        )}
      </div>

      {/* Servicios disponibles */}
      <div
        className="p-3 rounded mb-3"
        style={{ border: "1px solid #dee2e6", background: "#fafbff" }}
      >
        <Label style={{ fontWeight: 600, fontSize: 13.5, color: "#374151" }}>
          Servicios disponibles este día
          <span style={{ fontWeight: 400, color: "#94a3b8", marginLeft: 6 }}>
            (ninguno seleccionado = todos)
          </span>
        </Label>
        {serviciosAsignados.length === 0 ? (
          <p className="text-muted small mb-0">
            Este profesional no tiene servicios asignados todavía.
          </p>
        ) : (
          <div className="d-flex flex-wrap" style={{ gap: 8 }}>
            {serviciosAsignados.map((s) => {
              const seleccionado = serviciosSeleccionados.includes(
                s.servicioId,
              );
              return (
                <span
                  key={s.servicioId}
                  onClick={() => toggleServicio(s.servicioId)}
                  style={{
                    cursor: "pointer",
                    fontSize: 13,
                    padding: "6px 14px",
                    borderRadius: 20,
                    border: seleccionado
                      ? "2px solid #4361ee"
                      : "1px solid #dee2e6",
                    background: seleccionado ? "#EEF1FE" : "#f8f9fa",
                    color: seleccionado ? "#4361ee" : "#6c757d",
                    fontWeight: seleccionado ? 600 : 400,
                    userSelect: "none",
                  }}
                >
                  {seleccionado ? "✓ " : ""}
                  {s.nombre} — {fmtCLP(precioNormal(s.servicioId))}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Precio especial */}
      <div
        className="p-3 rounded"
        style={{ border: "1px solid #dee2e6", background: "#fafbff" }}
      >
        <div className="d-flex align-items-center justify-content-between">
          <Label
            className="mb-0 d-flex align-items-center"
            style={{ fontWeight: 600, fontSize: 13.5, color: "#374151", gap: 6 }}
          >
            <Tag size={13} />
            Usar precio especial este día
          </Label>
          <Input
            type="checkbox"
            checked={usarPrecioEspecial}
            onChange={(e) => setUsarPrecioEspecial(e.target.checked)}
            style={{ width: 18, height: 18 }}
          />
        </div>

        {usarPrecioEspecial && (
          <div className="mt-2">
            {serviciosParaPrecio.length === 0 ? (
              <p className="text-muted small mb-0">
                Selecciona arriba qué servicios tienen precio especial (o
                deja ninguno para aplicarlo a todos).
              </p>
            ) : (
              serviciosParaPrecio.map((s) => (
                <div
                  key={s.servicioId}
                  className="d-flex align-items-center justify-content-between mb-2"
                >
                  <div style={{ fontSize: 13.5 }}>
                    <span style={{ fontWeight: 600 }}>{s.nombre}</span>
                    <span className="text-muted ms-2">
                      normal: {fmtCLP(precioNormal(s.servicioId))}
                    </span>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Precio normal"
                    value={preciosPorServicio[s.servicioId] || ""}
                    onChange={(e) =>
                      cambiarPrecio(s.servicioId, e.target.value)
                    }
                    style={{ maxWidth: 140, borderRadius: 8 }}
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
};

// ─── Fila de un profesional dentro del detalle de un feriado ──────────────
const FilaProfesional = ({ prof, onToggle, onPersonalizar, guardando }) => {
  const tienePersonalizacion =
    prof.horaInicio || prof.horaFin || prof.serviciosPermitidos?.length > 0 ||
    prof.preciosEspeciales?.length > 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid #f4f4f6",
        flexWrap: "wrap",
      }}
    >
      <div
        onClick={() => !guardando && onToggle(prof)}
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          border: `2px solid ${prof.configurado ? "#22c55e" : "#cbd5e1"}`,
          background: prof.configurado ? "#22c55e" : "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: guardando ? "wait" : "pointer",
          flexShrink: 0,
        }}
      >
        {prof.configurado && <Check size={14} color="#fff" strokeWidth={3} />}
      </div>

      <Avatar nombre={prof.nombre} apellido={prof.apellido} />

      <div style={{ flex: "1 1 140px", minWidth: 120 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a2e" }}>
          {prof.nombre} {prof.apellido}
        </div>
        {prof.configurado && (
          <div style={{ fontSize: 11.5, color: "#8898aa" }}>
            {prof.horaInicio && prof.horaFin
              ? `${prof.horaInicio} – ${prof.horaFin}`
              : "Horario habitual"}
            {prof.serviciosPermitidos?.length > 0 && " · servicios limitados"}
            {prof.preciosEspeciales?.length > 0 && " · precio especial"}
          </div>
        )}
      </div>

      {prof.configurado && (
        <Button
          size="sm"
          color="primary"
          outline
          style={{ borderRadius: 8, fontSize: 12.5 }}
          onClick={() => onPersonalizar(prof)}
        >
          <Settings size={12} className="me-1" />
          {tienePersonalizacion ? "Editar" : "Personalizar"}
        </Button>
      )}
    </div>
  );
};

// ─── Modal: personalizar horario / servicios / precio de UN profesional ───
// (edición día a día, una vez que el feriado ya está habilitado)
const ModalPersonalizarProfesional = ({
  isOpen,
  toggle,
  prof,
  feriado,
  onGuardar,
}) => {
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]); // [] = todos
  const [usarPrecioEspecial, setUsarPrecioEspecial] = useState(false);
  const [preciosPorServicio, setPreciosPorServicio] = useState({}); // { servicioId: "12000" }
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [conflictos, setConflictos] = useState([]);

  useEffect(() => {
    if (!isOpen || !prof) return;

    setError("");
    setConflictos([]);
    setGuardando(false);
    setServiciosSeleccionados(prof.serviciosPermitidos || []);
    setUsarPrecioEspecial((prof.preciosEspeciales || []).length > 0);

    const preciosIniciales = {};
    (prof.preciosEspeciales || []).forEach((p) => {
      preciosIniciales[p.servicio] = String(p.precio);
    });
    setPreciosPorServicio(preciosIniciales);
  }, [isOpen, prof]);

  if (!prof) return null;

  const handleGuardar = async () => {
    setError("");
    setConflictos([]);

    const preciosEspeciales = armarPreciosEspeciales(
      usarPrecioEspecial,
      preciosPorServicio,
      serviciosSeleccionados,
    );

    setGuardando(true);
    try {
      await onGuardar(prof.barberoId, {
        horaInicio: null,
        horaFin: null,
        serviciosPermitidos: serviciosSeleccionados,
        preciosEspeciales,
      });
      toggle();
    } catch (err) {
      const data = err?.response?.data;
      if (data?.conflictos) {
        setConflictos(data.conflictos);
        setError(data.message);
      } else {
        setError(data?.message || "No se pudo guardar la configuración");
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered scrollable>
      <ModalHeader toggle={toggle} className="bg-white border-0 pb-0">
        <div className="d-flex align-items-center" style={{ gap: 8 }}>
          <Settings size={18} className="text-primary" />
          <span>
            {prof.nombre} {prof.apellido} — <strong>{feriado?.nombre}</strong>
          </span>
        </div>
        <p className="text-muted small mb-0 mt-1 font-weight-normal">
          Todo es opcional. Si no cambias nada, trabaja con su horario y
          servicios habituales, al precio normal.
        </p>
      </ModalHeader>

      <ModalBody>
        {error && (
          <Alert color="danger" className="rounded-3">
            {error}
            {conflictos.length > 0 && (
              <ul className="mb-0 mt-2 ps-3">
                {conflictos.map((c) => (
                  <li key={c.id} style={{ fontSize: 13 }}>
                    {c.hora} — {c.servicio} ({c.motivo})
                  </li>
                ))}
              </ul>
            )}
          </Alert>
        )}

        <PanelPersonalizacion
          prof={prof}
          feriado={feriado}
          serviciosSeleccionados={serviciosSeleccionados}
          setServiciosSeleccionados={setServiciosSeleccionados}
          usarPrecioEspecial={usarPrecioEspecial}
          setUsarPrecioEspecial={setUsarPrecioEspecial}
          preciosPorServicio={preciosPorServicio}
          setPreciosPorServicio={setPreciosPorServicio}
        />
      </ModalBody>

      <ModalFooter className="border-0 pt-0">
        <Button color="secondary" outline onClick={toggle} disabled={guardando}>
          Cancelar
        </Button>
        <Button color="primary" onClick={handleGuardar} disabled={guardando}>
          {guardando ? <Spinner size="sm" /> : "Guardar"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

// ─── Wizard: habilitar un feriado para toda la empresa ────────────────────
// 4 pasos: Confirmar → Equipo → Personalizar (opcional) → Resumen. Nada
// se guarda hasta el último "Confirmar y habilitar" — cancelar en
// cualquier paso no deja nada a medias.
const PASOS_WIZARD = [
  { numero: 1, label: "Confirmar" },
  { numero: 2, label: "Equipo" },
  { numero: 3, label: "Personalizar" },
  { numero: 4, label: "Resumen" },
];

const WizardStepIndicator = ({ pasoActual, colorPrimario }) => (
  <div className="d-flex align-items-center mb-4" style={{ gap: 4 }}>
    {PASOS_WIZARD.map((paso, i) => (
      <React.Fragment key={paso.numero}>
        <div
          className="d-flex flex-column align-items-center"
          style={{ flex: "0 0 auto" }}
        >
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: 30,
              height: 30,
              fontSize: 12.5,
              fontWeight: 700,
              color: pasoActual >= paso.numero ? "#fff" : "#94a3b8",
              background: pasoActual >= paso.numero ? colorPrimario : "#eef1f5",
              transition: "background 0.25s ease, color 0.25s ease",
            }}
          >
            {pasoActual > paso.numero ? <Check size={14} /> : paso.numero}
          </div>
          <small
            className="mt-1 text-center"
            style={{
              fontSize: 10,
              fontWeight: pasoActual === paso.numero ? 700 : 500,
              color: pasoActual === paso.numero ? colorPrimario : "#94a3b8",
              whiteSpace: "nowrap",
            }}
          >
            {paso.label}
          </small>
        </div>
        {i < PASOS_WIZARD.length - 1 && (
          <div
            style={{
              flex: 1,
              height: 2,
              background: pasoActual > paso.numero ? colorPrimario : "#eef1f5",
              borderRadius: 2,
              transition: "background 0.25s ease",
              marginBottom: 14,
            }}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

const FilaSeleccionProfesional = ({ prof, activo, onToggle, colorPrimario }) => (
  <div
    onClick={onToggle}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 12px",
      borderRadius: 10,
      border: `1.5px solid ${activo ? colorPrimario : "#e9ecef"}`,
      background: activo ? "#fafbff" : "#fff",
      marginBottom: 8,
      cursor: "pointer",
      transition: "border-color 0.15s ease, background 0.15s ease",
    }}
  >
    <div
      style={{
        width: 22,
        height: 22,
        borderRadius: 6,
        border: `2px solid ${activo ? colorPrimario : "#cbd5e1"}`,
        background: activo ? colorPrimario : "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {activo && <Check size={14} color="#fff" strokeWidth={3} />}
    </div>
    <Avatar nombre={prof.nombre} apellido={prof.apellido} size={32} />
    <span style={{ fontWeight: 600, fontSize: 14, color: "#1a1a2e" }}>
      {prof.nombre} {prof.apellido}
    </span>
  </div>
);

const WizardHabilitarFeriado = ({ isOpen, toggle, feriado, onCompletado }) => {
  const { empresa } = useEmpresa();
  const theme = construirTema(empresa?.colores);
  const {
    obtenerDetalleFeriadoEmpresa,
    toggleFeriadoEmpresa,
    configurarTrabajoFeriado,
  } = useHorario();

  const [paso, setPaso] = useState(1);
  const [cargandoEquipo, setCargandoEquipo] = useState(false);
  const [errorCarga, setErrorCarga] = useState("");
  const [profesionales, setProfesionales] = useState([]);
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [configPorProf, setConfigPorProf] = useState({});
  const [expandidoId, setExpandidoId] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState("");
  const [listo, setListo] = useState(false);

  useEffect(() => {
    if (!isOpen || !feriado) return;
    setPaso(1);
    setExpandidoId(null);
    setErrorEnvio("");
    setErrorCarga("");
    setListo(false);
    setCargandoEquipo(true);
    obtenerDetalleFeriadoEmpresa(feriado.id)
      .then((data) => {
        const profs = data.profesionales || [];
        setProfesionales(profs);
        // Por defecto todo el equipo queda trabajando — el admin destilda
        // a quien no trabaje, en vez de tener que marcar uno por uno.
        setSeleccionados(new Set(profs.map((p) => p.barberoId)));

        const inicial = {};
        profs.forEach((p) => {
          const preciosIniciales = {};
          (p.preciosEspeciales || []).forEach((pe) => {
            preciosIniciales[pe.servicio] = String(pe.precio);
          });
          inicial[p.barberoId] = {
            serviciosSeleccionados: p.serviciosPermitidos || [],
            usarPrecioEspecial: (p.preciosEspeciales || []).length > 0,
            preciosPorServicio: preciosIniciales,
          };
        });
        setConfigPorProf(inicial);
      })
      .catch(() => setErrorCarga("No se pudo cargar el equipo de tu empresa"))
      .finally(() => setCargandoEquipo(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, feriado?.id]);

  if (!feriado) return null;

  const toggleProf = (barberoId) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(barberoId)) next.delete(barberoId);
      else next.add(barberoId);
      return next;
    });
  };

  const seleccionarTodos = () =>
    setSeleccionados(new Set(profesionales.map((p) => p.barberoId)));
  const deseleccionarTodos = () => setSeleccionados(new Set());

  const setConfigProf = (barberoId, patch) => {
    setConfigPorProf((prev) => ({
      ...prev,
      [barberoId]: { ...prev[barberoId], ...patch },
    }));
  };

  const seleccionadosList = profesionales.filter((p) =>
    seleccionados.has(p.barberoId),
  );

  const tienePersonalizacion = (barberoId) => {
    const c = configPorProf[barberoId];
    if (!c) return false;
    return (
      c.serviciosSeleccionados.length > 0 ||
      (c.usarPrecioEspecial &&
        Object.values(c.preciosPorServicio).some((v) => v))
    );
  };

  const handleConfirmarTodo = async () => {
    setEnviando(true);
    setErrorEnvio("");

    try {
      await toggleFeriadoEmpresa(feriado.id, true);
    } catch (err) {
      setEnviando(false);
      setErrorEnvio(
        err?.response?.data?.message || "No se pudo habilitar el feriado",
      );
      return;
    }

    const resultados = await Promise.allSettled(
      seleccionadosList.map((prof) => {
        const c = configPorProf[prof.barberoId] || {
          serviciosSeleccionados: [],
          usarPrecioEspecial: false,
          preciosPorServicio: {},
        };
        const preciosEspeciales = armarPreciosEspeciales(
          c.usarPrecioEspecial,
          c.preciosPorServicio,
          c.serviciosSeleccionados,
        );
        return configurarTrabajoFeriado(prof.barberoId, feriado.fecha, {
          horaInicio: null,
          horaFin: null,
          serviciosPermitidos: c.serviciosSeleccionados || [],
          preciosEspeciales,
        });
      }),
    );

    const fallidos = resultados.filter((r) => r.status === "rejected").length;

    setEnviando(false);
    if (fallidos > 0) {
      setErrorEnvio(
        `Se habilitó el feriado, pero ${fallidos} profesional${fallidos > 1 ? "es" : ""} no se ${fallidos > 1 ? "pudieron" : "pudo"} configurar. Puedes ajustarlo${fallidos > 1 ? "s" : ""} después desde la lista.`,
      );
    }

    setListo(true);
    onCompletado();
  };

  const cerrar = () => {
    if (enviando) return;
    toggle();
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={cerrar}
      size="lg"
      centered
      scrollable
      backdrop={enviando ? "static" : true}
    >
      <ModalHeader toggle={cerrar} className="bg-white border-0 pb-0">
        <div className="d-flex align-items-center" style={{ gap: 8 }}>
          <CalendarCheck size={18} style={{ color: theme.primary }} />
          <span>Habilitar {feriado.nombre}</span>
        </div>
      </ModalHeader>

      <ModalBody>
        <WizardStepIndicator pasoActual={paso} colorPrimario={theme.primary} />

        {errorCarga && <Alert color="danger">{errorCarga}</Alert>}

        <AnimatePresence mode="wait">
          {listo ? (
            <motion.div
              key="listo"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="text-center py-4"
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "#dcfce7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Check size={32} color="#16a34a" strokeWidth={3} />
              </div>
              <h5 className="font-weight-bold mb-1">¡Feriado habilitado!</h5>
              <p className="text-muted small mb-0">
                {feriado.nombre} — {seleccionadosList.length} profesional
                {seleccionadosList.length !== 1 ? "es" : ""} trabajando.
              </p>
              {errorEnvio && (
                <Alert
                  color="warning"
                  className="rounded-3 mt-3 text-start"
                  style={{ fontSize: 13 }}
                >
                  {errorEnvio}
                </Alert>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={paso}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.18 }}
            >
              {paso === 1 && (
                <div className="text-center py-3">
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: "#EEF1FE",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                    }}
                  >
                    <CalendarCheck size={26} style={{ color: theme.primary }} />
                  </div>
                  <h5 className="font-weight-bold mb-1">{feriado.nombre}</h5>
                  <p className="text-muted mb-0">
                    {formatearFecha(feriado.fecha)}
                  </p>
                  <p className="text-muted small mt-3 mb-0">
                    Vas a abrir la atención este día. En los próximos pasos
                    eliges quién trabaja y, si quieres, le personalizas el
                    horario, los servicios o el precio.
                  </p>
                </div>
              )}

              {paso === 2 &&
                (cargandoEquipo ? (
                  <div className="text-center py-4">
                    <Spinner color="primary" size="sm" />
                  </div>
                ) : (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <p className="text-muted small mb-0">
                        Por defecto todo el equipo queda trabajando con su
                        horario habitual. Destilda a quien no trabaje.
                      </p>
                      {profesionales.length > 0 && (
                        <div
                          className="d-flex"
                          style={{ gap: 10, flexShrink: 0 }}
                        >
                          <span
                            onClick={seleccionarTodos}
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: theme.primary,
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Todos
                          </span>
                          <span
                            onClick={deseleccionarTodos}
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#94a3b8",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Ninguno
                          </span>
                        </div>
                      )}
                    </div>
                    {profesionales.length === 0 ? (
                      <p className="text-muted small mb-0">
                        No hay profesionales creados todavía.
                      </p>
                    ) : (
                      profesionales.map((p) => (
                        <FilaSeleccionProfesional
                          key={p.barberoId}
                          prof={p}
                          activo={seleccionados.has(p.barberoId)}
                          onToggle={() => toggleProf(p.barberoId)}
                          colorPrimario={theme.primary}
                        />
                      ))
                    )}
                  </>
                ))}

              {paso === 3 && (
                <>
                  <p className="text-muted small mb-3">
                    Opcional. Sin tocar nada, cada profesional trabaja con
                    su horario y servicios habituales, al precio normal.
                  </p>
                  {seleccionadosList.length === 0 ? (
                    <p className="text-muted small mb-0">
                      No seleccionaste a nadie en el paso anterior.
                    </p>
                  ) : (
                    seleccionadosList.map((p) => {
                      const expandido = expandidoId === p.barberoId;
                      const personalizado = tienePersonalizacion(p.barberoId);
                      const c = configPorProf[p.barberoId] || {
                        serviciosSeleccionados: [],
                        usarPrecioEspecial: false,
                        preciosPorServicio: {},
                      };
                      return (
                        <div
                          key={p.barberoId}
                          className="mb-2"
                          style={{
                            border: "1px solid #e9ecef",
                            borderRadius: 10,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            onClick={() =>
                              setExpandidoId(expandido ? null : p.barberoId)
                            }
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "10px 12px",
                              cursor: "pointer",
                              background: "#fff",
                            }}
                          >
                            <Avatar
                              nombre={p.nombre}
                              apellido={p.apellido}
                              size={30}
                            />
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  fontWeight: 600,
                                  fontSize: 13.5,
                                  color: "#1a1a2e",
                                }}
                              >
                                {p.nombre} {p.apellido}
                              </div>
                              <div style={{ fontSize: 11.5, color: "#8898aa" }}>
                                {personalizado
                                  ? "Personalizado"
                                  : "Horario y servicios habituales"}
                              </div>
                            </div>
                            {expandido ? (
                              <ChevronUp size={16} className="text-muted" />
                            ) : (
                              <ChevronDown size={16} className="text-muted" />
                            )}
                          </div>
                          {expandido && (
                            <div
                              style={{
                                padding: "0 12px 12px",
                                background: "#fafbff",
                              }}
                            >
                              <PanelPersonalizacion
                                prof={p}
                                feriado={feriado}
                                serviciosSeleccionados={c.serviciosSeleccionados}
                                setServiciosSeleccionados={(v) =>
                                  setConfigProf(p.barberoId, {
                                    serviciosSeleccionados:
                                      typeof v === "function"
                                        ? v(c.serviciosSeleccionados)
                                        : v,
                                  })
                                }
                                usarPrecioEspecial={c.usarPrecioEspecial}
                                setUsarPrecioEspecial={(v) =>
                                  setConfigProf(p.barberoId, {
                                    usarPrecioEspecial: v,
                                  })
                                }
                                preciosPorServicio={c.preciosPorServicio}
                                setPreciosPorServicio={(v) =>
                                  setConfigProf(p.barberoId, {
                                    preciosPorServicio:
                                      typeof v === "function"
                                        ? v(c.preciosPorServicio)
                                        : v,
                                  })
                                }
                              />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </>
              )}

              {paso === 4 && (
                <>
                  <div
                    className="p-3 rounded mb-3"
                    style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#15803d" }}>
                      {feriado.nombre}
                    </div>
                    <div style={{ fontSize: 12.5, color: "#166534" }}>
                      {formatearFecha(feriado.fecha)} — atención habilitada
                    </div>
                  </div>
                  {seleccionadosList.length === 0 ? (
                    <p className="text-muted small">
                      Ningún profesional quedará trabajando este día.
                    </p>
                  ) : (
                    seleccionadosList.map((p) => (
                      <div
                        key={p.barberoId}
                        className="d-flex justify-content-between align-items-center py-2"
                        style={{ borderBottom: "1px solid #f0f0f0" }}
                      >
                        <span style={{ fontSize: 13.5, fontWeight: 600 }}>
                          {p.nombre} {p.apellido}
                        </span>
                        <span style={{ fontSize: 12, color: "#8898aa" }}>
                          {tienePersonalizacion(p.barberoId)
                            ? "Personalizado"
                            : "Horario habitual, precio normal"}
                        </span>
                      </div>
                    ))
                  )}
                  {errorEnvio && (
                    <Alert color="danger" className="rounded-3 mt-3" style={{ fontSize: 13 }}>
                      {errorEnvio}
                    </Alert>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </ModalBody>

      <ModalFooter className="border-0 pt-0">
        {listo ? (
          <Button
            color="primary"
            style={{ background: theme.primary, borderColor: theme.primary }}
            onClick={cerrar}
          >
            Listo
          </Button>
        ) : (
          <>
            {paso > 1 && (
              <Button
                color="secondary"
                outline
                onClick={() => setPaso((p) => p - 1)}
                disabled={enviando}
              >
                Atrás
              </Button>
            )}
            <Button color="secondary" outline onClick={cerrar} disabled={enviando}>
              Cancelar
            </Button>
            {paso < 4 ? (
              <Button
                color="primary"
                style={{ background: theme.primary, borderColor: theme.primary }}
                onClick={() => setPaso((p) => p + 1)}
                disabled={cargandoEquipo}
              >
                Continuar
              </Button>
            ) : (
              <Button color="success" onClick={handleConfirmarTodo} disabled={enviando}>
                {enviando ? <Spinner size="sm" /> : "Confirmar y habilitar"}
              </Button>
            )}
          </>
        )}
      </ModalFooter>
    </Modal>
  );
};

// ─── Tarjeta de un feriado (colapsable) ────────────────────────────────────
const TarjetaFeriado = ({ feriado, expandido, onExpandir, children }) => {
  const activo = feriado.habilitado;

  return (
    <div
      style={{
        background: activo ? "#f0fdf4" : "#f8fafc",
        border: `1.5px solid ${activo ? "#22c55e" : "#e2e8f0"}`,
        borderLeft: `4px solid ${activo ? "#22c55e" : "#cbd5e1"}`,
        borderRadius: 10,
        marginBottom: 10,
        overflow: "hidden",
      }}
    >
      <div
        onClick={onExpandir}
        style={{
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          cursor: "pointer",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>
            {feriado.nombre}
          </div>
          <div style={{ fontSize: 12.5, color: "#64748b" }}>
            {formatearFecha(feriado.fecha)}
          </div>
        </div>

        <div className="d-flex align-items-center" style={{ gap: 10 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: 99,
              color: activo ? "#15803d" : "#94a3b8",
              background: activo ? "#dcfce7" : "#eef1f5",
            }}
          >
            {activo
              ? `Abierto — ${feriado.profesionalesConfigurados}/${feriado.totalProfesionales} profesionales`
              : "Cerrado"}
          </span>
          {expandido ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {expandido && <div style={{ padding: "0 16px 16px" }}>{children}</div>}
    </div>
  );
};

const PanelFeriadosEquipo = () => {
  const {
    obtenerFeriadosEmpresa,
    obtenerDetalleFeriadoEmpresa,
    toggleFeriadoEmpresa,
    configurarTrabajoFeriado,
    quitarTrabajoFeriado,
  } = useHorario();

  const [feriados, setFeriados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [expandidoId, setExpandidoId] = useState(null);
  const [detalle, setDetalle] = useState(null); // { feriado, profesionales }
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [guardandoProfId, setGuardandoProfId] = useState(null);
  const [errorDetalle, setErrorDetalle] = useState("");
  const [modalProf, setModalProf] = useState(null); // profesional en edición
  const [wizardFeriado, setWizardFeriado] = useState(null); // feriado en proceso de habilitación

  const cargarFeriados = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const data = await obtenerFeriadosEmpresa();
      setFeriados(data);
    } catch (err) {
      console.error("❌ Error al obtener feriados de la empresa:", err);
      setError("No se pudieron cargar los feriados");
    } finally {
      setCargando(false);
    }
  }, [obtenerFeriadosEmpresa]);

  useEffect(() => {
    cargarFeriados();
  }, [cargarFeriados]);

  const cargarDetalle = useCallback(
    async (feriadoId) => {
      setCargandoDetalle(true);
      setErrorDetalle("");
      try {
        const data = await obtenerDetalleFeriadoEmpresa(feriadoId);
        setDetalle(data);
      } catch (err) {
        console.error("❌ Error al obtener detalle del feriado:", err);
        setErrorDetalle("No se pudo cargar el detalle de este feriado");
      } finally {
        setCargandoDetalle(false);
      }
    },
    [obtenerDetalleFeriadoEmpresa],
  );

  const onExpandir = (feriado) => {
    if (expandidoId === feriado.id) {
      setExpandidoId(null);
      setDetalle(null);
      return;
    }
    setExpandidoId(feriado.id);
    setDetalle(null);
    if (feriado.habilitado) {
      cargarDetalle(feriado.id);
    }
  };

  const onCambiarEstadoEmpresa = async (feriado, habilitado) => {
    setCambiandoEstado(true);
    setErrorDetalle("");
    try {
      await toggleFeriadoEmpresa(feriado.id, habilitado);
      await cargarFeriados();
      if (habilitado) {
        cargarDetalle(feriado.id);
      } else {
        setDetalle(null);
      }
    } catch (err) {
      setErrorDetalle(
        err?.response?.data?.message ||
          "No se pudo actualizar el estado del feriado",
      );
    } finally {
      setCambiandoEstado(false);
    }
  };

  const onToggleProfesional = async (prof) => {
    if (!detalle) return;
    setGuardandoProfId(prof.barberoId);
    setErrorDetalle("");
    try {
      if (prof.configurado) {
        await quitarTrabajoFeriado(prof.barberoId, detalle.feriado.fecha);
      } else {
        await configurarTrabajoFeriado(prof.barberoId, detalle.feriado.fecha, {});
      }
      await cargarDetalle(detalle.feriado.id);
      await cargarFeriados();
    } catch (err) {
      setErrorDetalle(
        err?.response?.data?.message ||
          `No se pudo actualizar a ${prof.nombre}`,
      );
    } finally {
      setGuardandoProfId(null);
    }
  };

  const onGuardarPersonalizacion = async (barberoId, config) => {
    await configurarTrabajoFeriado(barberoId, detalle.feriado.fecha, config);
    await cargarDetalle(detalle.feriado.id);
    await cargarFeriados();
  };

  const onWizardCompletado = async () => {
    await cargarFeriados();
    if (wizardFeriado) {
      setExpandidoId(wizardFeriado.id);
      await cargarDetalle(wizardFeriado.id);
    }
  };

  return (
    <>
      <UserHeader />
      <Container className="mt--7 mb-5" fluid>
        <Row className="justify-content-center">
          <Col xl="9" lg="10">
            <div style={S.card}>
              <div style={S.cardHeader}>
                <div className="d-flex align-items-center" style={{ gap: 8 }}>
                  <CalendarCheck size={20} className="text-primary" />
                  <h3 style={S.title}>Feriados del equipo</h3>
                </div>
                <p style={S.subtitle}>
                  Decide si tu empresa atiende cada feriado y, si atiende,
                  quién trabaja, con qué horario, qué servicios y a qué
                  precio.
                </p>
              </div>

              <div style={{ padding: "1.25rem 1.5rem" }}>
                {error && <Alert color="danger">{error}</Alert>}

                {cargando ? (
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                    <p className="text-muted mt-2">Cargando feriados...</p>
                  </div>
                ) : feriados.length === 0 ? (
                  <div className="text-center py-5">
                    <CalendarX size={32} className="text-muted mb-2" style={{ opacity: 0.4 }} />
                    <p className="text-muted mb-0">No hay feriados próximos</p>
                  </div>
                ) : (
                  feriados.map((f) => (
                    <TarjetaFeriado
                      key={f.id}
                      feriado={f}
                      expandido={expandidoId === f.id}
                      onExpandir={() => onExpandir(f)}
                    >
                      {/* Interruptor: ¿la empresa atiende este feriado? */}
                      <div
                        className="d-flex align-items-center mb-3"
                        style={{ gap: 8 }}
                      >
                        <Button
                          size="sm"
                          color={!f.habilitado ? "secondary" : "secondary"}
                          outline={f.habilitado}
                          disabled={cambiandoEstado || !f.habilitado}
                          style={{ borderRadius: 8, fontWeight: 600 }}
                          onClick={() => onCambiarEstadoEmpresa(f, false)}
                        >
                          <X size={13} className="me-1" />
                          No trabajar
                        </Button>
                        <Button
                          size="sm"
                          color="success"
                          outline={!f.habilitado}
                          disabled={cambiandoEstado || f.habilitado}
                          style={{ borderRadius: 8, fontWeight: 600 }}
                          onClick={() => setWizardFeriado(f)}
                        >
                          <Check size={13} className="me-1" />
                          Habilitar atención
                        </Button>
                      </div>

                      {errorDetalle && expandidoId === f.id && (
                        <Alert color="danger" className="rounded-3 py-2" style={{ fontSize: 13 }}>
                          {errorDetalle}
                        </Alert>
                      )}

                      {f.habilitado && (
                        <div
                          style={{
                            background: "#fff",
                            border: "1px solid #e2e8f0",
                            borderRadius: 10,
                            padding: "10px 14px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 12.5,
                              fontWeight: 700,
                              color: "#374151",
                              textTransform: "uppercase",
                              letterSpacing: "0.03em",
                              marginBottom: 4,
                            }}
                          >
                            Profesionales
                          </div>

                          {cargandoDetalle && expandidoId === f.id ? (
                            <div className="text-center py-3">
                              <Spinner size="sm" color="primary" />
                            </div>
                          ) : detalle?.feriado?.id === f.id ? (
                            detalle.profesionales.length === 0 ? (
                              <p className="text-muted small mb-0">
                                No hay profesionales creados todavía.
                              </p>
                            ) : (
                              detalle.profesionales.map((prof) => (
                                <FilaProfesional
                                  key={prof.barberoId}
                                  prof={prof}
                                  guardando={guardandoProfId === prof.barberoId}
                                  onToggle={onToggleProfesional}
                                  onPersonalizar={setModalProf}
                                />
                              ))
                            )
                          ) : null}
                        </div>
                      )}
                    </TarjetaFeriado>
                  ))
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <ModalPersonalizarProfesional
        isOpen={!!modalProf}
        toggle={() => setModalProf(null)}
        prof={modalProf}
        feriado={detalle?.feriado}
        onGuardar={onGuardarPersonalizacion}
      />

      <WizardHabilitarFeriado
        isOpen={!!wizardFeriado}
        toggle={() => setWizardFeriado(null)}
        feriado={wizardFeriado}
        onCompletado={onWizardCompletado}
      />
    </>
  );
};

export default PanelFeriadosEquipo;

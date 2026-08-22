import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Container,
  Row,
  Col,
  Table,
  Modal,
  ModalBody,
  ModalHeader,
  Form,
  FormGroup,
  Input,
  Badge,
} from "reactstrap";
import UserHeader from "components/Headers/UserHeader.js";
import Swal from "sweetalert2";
import ClasesContext from "context/ClasesContext";
import { useUsuario } from "context/usuariosContext";
import InscribirClienteModal from "components/gestionClases/InscribirClienteModal";

const DIAS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const FORM_VACIO = {
  _id: null,
  nombre: "",
  descripcion: "",
  instructor: "",
  duracion: "60",
  cupoMaximo: "10",
  precioPaseDiario: "",
  horarioSemanal: [],
};

const formatearHorario = (bloques = []) => {
  if (!bloques.length) return "Sin horario";
  return bloques
    .slice()
    .sort((a, b) => a.diaSemana - b.diaSemana || a.horaInicio.localeCompare(b.horaInicio))
    .map((b) => `${DIAS[b.diaSemana]?.slice(0, 3)} ${b.horaInicio}`)
    .join(" · ");
};

// Agrupa el array plano [{diaSemana, horaInicio}, ...] (formato que espera
// el back) por día, conservando el índice original de cada bloque en el
// array plano — así el formulario puede mostrar "un día con varias horas"
// sin dejar de mandarle al back el mismo formato de siempre.
const agruparHorarioPorDia = (horarioSemanal = []) => {
  const mapa = new Map();
  horarioSemanal.forEach((b, idx) => {
    if (!mapa.has(b.diaSemana)) mapa.set(b.diaSemana, []);
    mapa.get(b.diaSemana).push({ idx, horaInicio: b.horaInicio });
  });
  return Array.from(mapa.entries())
    .map(([diaSemana, horas]) => ({
      diaSemana: Number(diaSemana),
      horas: horas.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)),
    }))
    .sort((a, b) => a.diaSemana - b.diaSemana);
};

// ─── Estilos (mismo lenguaje visual que GestionMembresias.jsx) ────────────────

const S = {
  page: { padding: "1.5rem 0" },
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
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    background: "#fff",
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    background: "#EEEDFE",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  title: { fontSize: 17, fontWeight: 600, color: "#1a1a2e", margin: 0 },
  subtitle: { fontSize: 12, color: "#8898aa", margin: 0 },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
    gap: 10,
    padding: "1rem 1.5rem",
    borderBottom: "1px solid #f0f0f0",
    background: "#fafafa",
  },
  statCard: {
    background: "#fff",
    border: "1px solid #e9ecef",
    borderRadius: 10,
    padding: "10px 14px",
  },
  statLabel: {
    fontSize: 11,
    color: "#8898aa",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  statValue: { fontSize: 20, fontWeight: 600, color: "#1a1a2e", lineHeight: 1 },
  filterBar: {
    padding: "1rem 1.5rem",
    borderBottom: "1px solid #f0f0f0",
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  input: {
    padding: "6px 10px",
    border: "1px solid #e9ecef",
    borderRadius: 8,
    fontSize: 13,
    color: "#1a1a2e",
    background: "#fafafa",
    outline: "none",
    minWidth: 200,
    flex: 1,
  },
  btnPrimary: {
    background: "#534AB7",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "7px 16px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  actionBtn: {
    borderRadius: 8,
    padding: "5px 12px",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    border: "1px solid transparent",
  },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    padding: "10px 16px",
    textAlign: "left",
    fontSize: 11,
    fontWeight: 600,
    color: "#8898aa",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    background: "#fafafa",
    borderBottom: "1px solid #f0f0f0",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "13px 16px",
    borderBottom: "1px solid #f5f5f5",
    color: "#1a1a2e",
    verticalAlign: "middle",
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    color: "#fff",
    flexShrink: 0,
  },
  mobileList: { padding: "1rem" },
  mobileCard: {
    background: "#fff",
    border: "1px solid #e9ecef",
    borderRadius: 12,
    padding: "14px",
    marginBottom: 10,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  emptyState: { textAlign: "center", padding: "3.5rem 1rem" },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "#EEEDFE",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1rem",
  },
};

const pill = (bg, color) => ({
  background: bg,
  color,
  borderRadius: 99,
  padding: "3px 10px",
  fontSize: 11,
  fontWeight: 500,
  display: "inline-block",
});

const iniciales = (nombre = "") =>
  nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";

const GestionClases = () => {
  const {
    clases,
    loadingClases,
    getAllClases,
    crearClase,
    actualizarClase,
    toggleActivaClase,
    eliminarClase,
    getSesiones,
    getInscritos,
    cancelarInscripcion,
  } = useContext(ClasesContext);

  const { barberos, getBarberosDisponibles } = useUsuario();

  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState(FORM_VACIO);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [modalSesiones, setModalSesiones] = useState({
    abierto: false,
    clase: null,
    sesiones: [],
    cargando: false,
  });

  // Fila de sesión expandida (índice) y sus inscritos ya cargados/cargando
  const [sesionAbierta, setSesionAbierta] = useState(null);
  const [inscritosPorSesion, setInscritosPorSesion] = useState({});

  const [modalInscribir, setModalInscribir] = useState({ abierto: false, sesion: null });

  useEffect(() => {
    getAllClases();
    getBarberosDisponibles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggle = () => setModal(!modal);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleNuevo = () => {
    setEditando(false);
    setForm(FORM_VACIO);
    setModal(true);
  };

  const handleEditar = (clase) => {
    setEditando(true);
    setForm({
      _id: clase._id,
      nombre: clase.nombre || "",
      descripcion: clase.descripcion || "",
      instructor: clase.instructor?._id || clase.instructor || "",
      duracion: clase.duracion ?? "60",
      cupoMaximo: clase.cupoMaximo ?? "10",
      precioPaseDiario: clase.precioPaseDiario ?? "",
      horarioSemanal: clase.horarioSemanal || [],
    });
    setModal(true);
  };

  // El formulario sigue guardando `form.horarioSemanal` como el mismo array
  // plano de siempre [{diaSemana, horaInicio}, ...] (es lo que espera el
  // back); lo que cambia es que la UI lo agrupa por día para que agregar
  // "lunes 08:30 y lunes 19:30" sea un solo grupo con 2 horas, no 2 filas
  // sueltas repitiendo el día.
  const agregarDiaGrupo = () => {
    const diasUsados = form.horarioSemanal.map((b) => b.diaSemana);
    const diaLibre = DIAS.map((_, i) => i).find((i) => !diasUsados.includes(i));
    if (diaLibre === undefined) return; // ya están los 7 días agregados
    setForm({
      ...form,
      horarioSemanal: [...form.horarioSemanal, { diaSemana: diaLibre, horaInicio: "09:00" }],
    });
  };

  const cambiarDiaGrupo = (diaViejo, diaNuevo) => {
    const nuevo = Number(diaNuevo);
    setForm({
      ...form,
      horarioSemanal: form.horarioSemanal.map((b) =>
        b.diaSemana === diaViejo ? { ...b, diaSemana: nuevo } : b,
      ),
    });
  };

  const quitarDiaGrupo = (dia) => {
    setForm({
      ...form,
      horarioSemanal: form.horarioSemanal.filter((b) => b.diaSemana !== dia),
    });
  };

  const agregarHoraADia = (dia) => {
    setForm({
      ...form,
      horarioSemanal: [...form.horarioSemanal, { diaSemana: dia, horaInicio: "09:00" }],
    });
  };

  const actualizarBloque = (idx, campo, valor) => {
    const nuevos = form.horarioSemanal.map((b, i) =>
      i === idx ? { ...b, [campo]: campo === "diaSemana" ? Number(valor) : valor } : b,
    );
    setForm({ ...form, horarioSemanal: nuevos });
  };

  const quitarBloque = (idx) => {
    setForm({
      ...form,
      horarioSemanal: form.horarioSemanal.filter((_, i) => i !== idx),
    });
  };

  const handleGuardar = async () => {
    if (!form.nombre.trim()) {
      Swal.fire("Error", "El nombre de la clase es obligatorio", "error");
      return;
    }
    if (!form.duracion || Number(form.duracion) <= 0) {
      Swal.fire("Error", "La duración debe ser mayor a 0", "error");
      return;
    }
    if (!form.cupoMaximo || Number(form.cupoMaximo) <= 0) {
      Swal.fire("Error", "El cupo máximo debe ser mayor a 0", "error");
      return;
    }
    if (form.horarioSemanal.length === 0) {
      Swal.fire(
        "Error",
        "Agrega al menos un bloque de horario (día + hora)",
        "error",
      );
      return;
    }

    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      instructor: form.instructor || null,
      duracion: Number(form.duracion),
      cupoMaximo: Number(form.cupoMaximo),
      precioPaseDiario:
        form.precioPaseDiario === "" ? null : Number(form.precioPaseDiario),
      horarioSemanal: form.horarioSemanal,
    };

    try {
      if (editando) {
        await actualizarClase(form._id, payload);
      } else {
        await crearClase(payload);
      }
      Swal.fire("Listo", "Clase guardada correctamente", "success");
      setModal(false);
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo guardar la clase",
        "error",
      );
    }
  };

  const handleToggleActiva = async (clase) => {
    try {
      await toggleActivaClase(clase._id);
    } catch (error) {
      Swal.fire("Error", "No se pudo cambiar el estado de la clase", "error");
    }
  };

  const handleEliminar = async (clase) => {
    const confirmar = await Swal.fire({
      title: "¿Eliminar clase?",
      text: clase.nombre,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    });

    if (confirmar.isConfirmed) {
      try {
        const res = await eliminarClase(clase._id);
        Swal.fire("Listo", res?.message || "Clase eliminada", "success");
      } catch (error) {
        Swal.fire("Error", "No se pudo eliminar la clase", "error");
      }
    }
  };

  const abrirSesiones = async (clase) => {
    setModalSesiones({ abierto: true, clase, sesiones: [], cargando: true });
    try {
      const sesiones = await getSesiones({ claseId: clase._id });
      setModalSesiones({ abierto: true, clase, sesiones, cargando: false });
    } catch (error) {
      setModalSesiones({ abierto: true, clase, sesiones: [], cargando: false });
    }
  };

  const cerrarSesiones = () => {
    setModalSesiones({ abierto: false, clase: null, sesiones: [], cargando: false });
    setSesionAbierta(null);
    setInscritosPorSesion({});
  };

  const handleCancelarInscripcion = async (ins) => {
    const confirmar = await Swal.fire({
      title: "¿Cancelar inscripción?",
      text: `${ins.cliente?.nombre || ""} ${ins.cliente?.apellido || ""}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    });
    if (!confirmar.isConfirmed) return;

    try {
      await cancelarInscripcion(ins._id);
      Swal.fire("Listo", "Inscripción cancelada", "success");
      if (modalSesiones.clase) abrirSesiones(modalSesiones.clase);
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo cancelar la inscripción",
        "error",
      );
    }
  };

  const toggleInscritos = async (idx, sesion) => {
    if (sesionAbierta === idx) {
      setSesionAbierta(null);
      return;
    }
    setSesionAbierta(idx);

    if (inscritosPorSesion[idx]) return; // ya cargados

    setInscritosPorSesion((prev) => ({
      ...prev,
      [idx]: { cargando: true, lista: [] },
    }));
    try {
      const lista = await getInscritos(sesion.claseId, sesion.fecha);
      setInscritosPorSesion((prev) => ({
        ...prev,
        [idx]: { cargando: false, lista },
      }));
    } catch (error) {
      setInscritosPorSesion((prev) => ({
        ...prev,
        [idx]: { cargando: false, lista: [], error: true },
      }));
    }
  };

  const clasesFiltradas = clases.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const sinClases = clasesFiltradas.length === 0;

  // Vista agrupada por día del horario que se está editando en el modal
  const gruposHorario = agruparHorarioPorDia(form.horarioSemanal);
  const diasUsadosGlobal = gruposHorario.map((g) => g.diaSemana);

  const totalClases = clases.length;
  const activasCount = clases.filter((c) => c.activa).length;
  const inactivasCount = totalClases - activasCount;

  return (
    <>
      <UserHeader />

      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col xl="11" style={S.page}>
            <div style={S.card}>
              {/* ── Header ── */}
              <div style={S.cardHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={S.iconWrap}>
                    <i className="fas fa-dumbbell" style={{ color: "#534AB7", fontSize: 18 }} />
                  </div>
                  <div>
                    <p style={S.title}>Clases y cupos</p>
                    <p style={S.subtitle}>
                      Crea y administra las clases grupales, su horario y su cupo
                    </p>
                  </div>
                </div>
                <button style={S.btnPrimary} onClick={handleNuevo}>
                  + Nueva clase
                </button>
              </div>

              {/* ── Stats ── */}
              <div style={S.statsGrid}>
                {[
                  { label: "Total", value: totalClases },
                  { label: "Activas", value: activasCount },
                  { label: "Inactivas", value: inactivasCount },
                ].map((s) => (
                  <div key={s.label} style={S.statCard}>
                    <div style={S.statLabel}>{s.label}</div>
                    <div style={S.statValue}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* ── Filtro ── */}
              <div style={S.filterBar}>
                <input
                  style={S.input}
                  placeholder="Buscar clase..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                {busqueda && (
                  <button
                    style={{
                      background: "transparent",
                      color: "#8898aa",
                      border: "1px solid #e9ecef",
                      borderRadius: 8,
                      padding: "7px 16px",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                    onClick={() => setBusqueda("")}
                  >
                    Limpiar
                  </button>
                )}
              </div>

              {/* ── Contenido ── */}
              {loadingClases ? (
                <div style={{ textAlign: "center", padding: "3rem" }}>
                  <div className="spinner-border text-primary" role="status" />
                </div>
              ) : sinClases ? (
                <div style={S.emptyState}>
                  <div style={S.emptyIcon}>
                    <i className="fas fa-dumbbell" style={{ color: "#534AB7", fontSize: 22 }} />
                  </div>
                  <p style={{ fontWeight: 600, color: "#1a1a2e", marginBottom: 4 }}>
                    {busqueda ? "No hay clases que coincidan" : "No hay clases creadas aún"}
                  </p>
                  <p style={{ fontSize: 13, color: "#8898aa", marginBottom: 16 }}>
                    {busqueda
                      ? "Prueba con otro nombre o limpia el filtro."
                      : "Crea tu primera clase para que los clientes puedan inscribirse."}
                  </p>
                  {!busqueda && (
                    <button style={S.btnPrimary} onClick={handleNuevo}>
                      + Crear clase
                    </button>
                  )}
                </div>
              ) : isMobile ? (
                <div style={S.mobileList}>
                  {clasesFiltradas.map((c) => (
                    <div key={c._id} style={S.mobileCard}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          marginBottom: 10,
                          gap: 10,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ ...S.avatar, background: c.color || "#534AB7" }}>
                            {iniciales(c.nombre)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>
                              {c.nombre}
                            </div>
                            <div style={{ fontSize: 11, color: "#8898aa" }}>
                              {c.instructor
                                ? `${c.instructor.nombre || ""} ${c.instructor.apellido || ""}`.trim()
                                : "Sin instructor asignado"}
                            </div>
                          </div>
                        </div>
                        <span style={c.activa ? pill("#E6F9F0", "#1A7A4A") : pill("#F0F0F0", "#8898aa")}>
                          {c.activa ? "Activa" : "Inactiva"}
                        </span>
                      </div>

                      <div style={{ fontSize: 12, color: "#525f7f", marginBottom: 10 }}>
                        {formatearHorario(c.horarioSemanal)}
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                        <span style={pill("#EAF2FF", "#2D5FA3")}>Cupo {c.cupoMaximo}</span>
                        <span style={pill("#FFF3CD", "#856404")}>{c.duracion} min</span>
                        <span style={pill("#F5F0FF", "#6C4BC7")}>
                          {c.precioPaseDiario ? `Pase $${c.precioPaseDiario.toLocaleString("es-CL")}` : "Sin pase diario"}
                        </span>
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        <button
                          style={{ ...S.actionBtn, background: "#534AB7", color: "#fff" }}
                          onClick={() => handleEditar(c)}
                        >
                          Editar
                        </button>
                        <button
                          style={{ ...S.actionBtn, background: "transparent", color: "#2D5FA3", border: "1px solid #C7DBF5" }}
                          onClick={() => abrirSesiones(c)}
                        >
                          Ver cupos
                        </button>
                        <button
                          style={{
                            ...S.actionBtn,
                            background: "transparent",
                            color: c.activa ? "#8898aa" : "#1A7A4A",
                            border: `1px solid ${c.activa ? "#e9ecef" : "#BEEBD2"}`,
                          }}
                          onClick={() => handleToggleActiva(c)}
                        >
                          {c.activa ? "Desactivar" : "Activar"}
                        </button>
                        <button
                          style={{ ...S.actionBtn, background: "transparent", color: "#E24B4A", border: "1px solid #F5C2C2" }}
                          onClick={() => handleEliminar(c)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={S.tableWrap}>
                  <table style={S.table}>
                    <thead>
                      <tr>
                        <th style={S.th}>Clase</th>
                        <th style={S.th}>Instructor</th>
                        <th style={S.th}>Horario</th>
                        <th style={S.th}>Cupo</th>
                        <th style={S.th}>Duración</th>
                        <th style={S.th}>Pase diario</th>
                        <th style={S.th}>Estado</th>
                        <th style={S.th}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {clasesFiltradas.map((c) => (
                        <tr key={c._id}>
                          <td style={S.td}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ ...S.avatar, background: c.color || "#534AB7" }}>
                                {iniciales(c.nombre)}
                              </div>
                              <span style={{ fontWeight: 600 }}>{c.nombre}</span>
                            </div>
                          </td>
                          <td style={S.td}>
                            {c.instructor
                              ? `${c.instructor.nombre || ""} ${c.instructor.apellido || ""}`.trim()
                              : "—"}
                          </td>
                          <td style={{ ...S.td, fontSize: 12 }}>{formatearHorario(c.horarioSemanal)}</td>
                          <td style={S.td}>{c.cupoMaximo}</td>
                          <td style={S.td}>{c.duracion} min</td>
                          <td style={S.td}>
                            {c.precioPaseDiario ? `$${c.precioPaseDiario.toLocaleString("es-CL")}` : "—"}
                          </td>
                          <td style={S.td}>
                            <span style={c.activa ? pill("#E6F9F0", "#1A7A4A") : pill("#F0F0F0", "#8898aa")}>
                              {c.activa ? "Activa" : "Inactiva"}
                            </span>
                          </td>
                          <td style={S.td}>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              <button
                                style={{ ...S.actionBtn, background: "#534AB7", color: "#fff" }}
                                onClick={() => handleEditar(c)}
                              >
                                Editar
                              </button>
                              <button
                                style={{ ...S.actionBtn, background: "transparent", color: "#2D5FA3", border: "1px solid #C7DBF5" }}
                                onClick={() => abrirSesiones(c)}
                              >
                                Ver cupos
                              </button>
                              <button
                                style={{
                                  ...S.actionBtn,
                                  background: "transparent",
                                  color: c.activa ? "#8898aa" : "#1A7A4A",
                                  border: `1px solid ${c.activa ? "#e9ecef" : "#BEEBD2"}`,
                                }}
                                onClick={() => handleToggleActiva(c)}
                              >
                                {c.activa ? "Desactivar" : "Activar"}
                              </button>
                              <button
                                style={{ ...S.actionBtn, background: "transparent", color: "#E24B4A", border: "1px solid #F5C2C2" }}
                                onClick={() => handleEliminar(c)}
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>

      {/* MODAL CREAR/EDITAR */}
      <Modal isOpen={modal} toggle={toggle} centered size="lg">
        <ModalHeader toggle={toggle}>
          {editando ? "Editar clase" : "Nueva clase"}
        </ModalHeader>
        <ModalBody>
          <Form>
            <Row>
              <Col md="6">
                <FormGroup>
                  <label>Nombre</label>
                  <Input name="nombre" value={form.nombre} onChange={handleChange} />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label>Instructor</label>
                  <Input
                    type="select"
                    name="instructor"
                    value={form.instructor}
                    onChange={handleChange}
                  >
                    <option value="">Sin asignar</option>
                    {barberos.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.nombre} {b.apellido}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
            </Row>

            <FormGroup>
              <label>Descripción</label>
              <Input
                type="textarea"
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
              />
            </FormGroup>

            <Row>
              <Col md="4">
                <FormGroup>
                  <label>Duración (min)</label>
                  <Input
                    type="number"
                    name="duracion"
                    value={form.duracion}
                    onChange={handleChange}
                  />
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <label>Cupo máximo</label>
                  <Input
                    type="number"
                    name="cupoMaximo"
                    value={form.cupoMaximo}
                    onChange={handleChange}
                  />
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <label>Precio pase diario ($)</label>
                  <Input
                    type="number"
                    name="precioPaseDiario"
                    placeholder="Opcional"
                    value={form.precioPaseDiario}
                    onChange={handleChange}
                  />
                </FormGroup>
              </Col>
            </Row>

            <FormGroup>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="mb-0">Horario semanal</label>
                <Button
                  size="sm"
                  color="primary"
                  outline
                  onClick={agregarDiaGrupo}
                  type="button"
                  disabled={gruposHorario.length >= 7}
                >
                  + Agregar día
                </Button>
              </div>

              {gruposHorario.length === 0 && (
                <p className="text-muted small">
                  Agrega los días en que se repite esta clase y, dentro de cada
                  día, todas las horas que tenga (ej. lunes con 08:30 y 19:30
                  si hay tanda de mañana y de tarde).
                </p>
              )}

              {gruposHorario.map((grupo) => (
                <div
                  key={grupo.diaSemana}
                  className="border rounded p-2 mb-2"
                  style={{ background: "#fafafa" }}
                >
                  <div
                    className="d-flex align-items-center mb-2"
                    style={{ gap: 8, flexWrap: "wrap" }}
                  >
                    <Input
                      type="select"
                      value={grupo.diaSemana}
                      onChange={(e) => cambiarDiaGrupo(grupo.diaSemana, e.target.value)}
                      style={{ maxWidth: 150, flex: "1 1 130px" }}
                    >
                      {DIAS.map(
                        (d, i) =>
                          (i === grupo.diaSemana || !diasUsadosGlobal.includes(i)) && (
                            <option key={i} value={i}>
                              {d}
                            </option>
                          ),
                      )}
                    </Input>
                    <Button
                      size="sm"
                      color="primary"
                      outline
                      type="button"
                      onClick={() => agregarHoraADia(grupo.diaSemana)}
                    >
                      + Hora
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      outline
                      type="button"
                      className="ml-auto"
                      onClick={() => quitarDiaGrupo(grupo.diaSemana)}
                    >
                      Quitar día
                    </Button>
                  </div>

                  <div className="d-flex flex-wrap" style={{ gap: 8 }}>
                    {grupo.horas.map(({ idx, horaInicio }) => (
                      <div
                        key={idx}
                        className="d-flex align-items-center"
                        style={{ gap: 4 }}
                      >
                        <Input
                          type="time"
                          value={horaInicio}
                          onChange={(e) => actualizarBloque(idx, "horaInicio", e.target.value)}
                          style={{ width: 130 }}
                        />
                        <Button
                          size="sm"
                          color="danger"
                          outline
                          type="button"
                          onClick={() => quitarBloque(idx)}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </FormGroup>

            <Button block color="primary" onClick={handleGuardar} type="button">
              Guardar
            </Button>
          </Form>
        </ModalBody>
      </Modal>

      {/* MODAL VER SESIONES / CUPOS */}
      <Modal isOpen={modalSesiones.abierto} toggle={cerrarSesiones} centered>
        <ModalHeader toggle={cerrarSesiones}>
          Próximas sesiones — {modalSesiones.clase?.nombre}
        </ModalHeader>
        <ModalBody>
          {modalSesiones.cargando ? (
            <div className="text-center py-4 text-muted">Cargando...</div>
          ) : modalSesiones.sesiones.length === 0 ? (
            <p className="text-muted text-center py-3">
              No hay sesiones próximas en los siguientes 14 días.
            </p>
          ) : (
            <>
              <p className="text-muted small mb-2">
                Toca una sesión para ver quién está inscrito.
              </p>
              <Table size="sm" responsive>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Cupo</th>
                    <th>Estado</th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {modalSesiones.sesiones.map((s, i) => {
                    const abierta = sesionAbierta === i;
                    const info = inscritosPorSesion[i];
                    return (
                      <React.Fragment key={i}>
                        <tr
                          style={{ cursor: "pointer" }}
                          onClick={() => toggleInscritos(i, s)}
                        >
                          <td>
                            {new Date(s.fecha).toLocaleString("es-CL", {
                              weekday: "short",
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "America/Santiago",
                            })}
                          </td>
                          <td>
                            {s.inscritos} / {s.cupoMaximo}
                          </td>
                          <td>
                            <Badge color={s.lleno ? "danger" : "success"}>
                              {s.lleno ? "Lleno" : "Disponible"}
                            </Badge>
                          </td>
                          <td className="text-right">
                            {!s.lleno && (
                              <Button
                                size="sm"
                                color="primary"
                                outline
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setModalInscribir({ abierto: true, sesion: s });
                                }}
                              >
                                + Inscribir
                              </Button>
                            )}
                          </td>
                          <td className="text-right">
                            <i className={`fas fa-chevron-${abierta ? "up" : "down"} text-muted`} />
                          </td>
                        </tr>
                        {abierta && (
                          <tr>
                            <td colSpan={5} style={{ background: "#fafafa" }}>
                              {info?.cargando ? (
                                <div className="text-center text-muted py-2">
                                  Cargando inscritos...
                                </div>
                              ) : info?.error ? (
                                <div className="text-center text-danger py-2">
                                  No se pudo cargar la lista de inscritos.
                                </div>
                              ) : !info?.lista?.length ? (
                                <div className="text-center text-muted py-2">
                                  Nadie inscrito todavía en esta sesión.
                                </div>
                              ) : (
                                <ul className="list-unstyled mb-0 py-1">
                                  {info.lista.map((ins) => (
                                    <li key={ins._id} className="mb-1">
                                      <strong>
                                        {ins.cliente?.nombre} {ins.cliente?.apellido}
                                      </strong>{" "}
                                      <span className="text-muted small">
                                        ({ins.cliente?.telefono || ins.cliente?.email || "sin contacto"})
                                      </span>{" "}
                                      <Badge
                                        color={
                                          ins.tipoAcceso === "membresia"
                                            ? "info"
                                            : ins.tipoAcceso === "prueba_gratis"
                                              ? "warning"
                                              : "secondary"
                                        }
                                        pill
                                        className="ml-1"
                                      >
                                        {ins.tipoAcceso === "membresia"
                                          ? "Mensualidad"
                                          : ins.tipoAcceso === "prueba_gratis"
                                            ? "Prueba gratis"
                                            : "Pase diario"}
                                      </Badge>
                                      {ins.estado !== "cancelada" && (
                                        <button
                                          type="button"
                                          className="btn btn-link btn-sm text-danger p-0 ml-2"
                                          onClick={() => handleCancelarInscripcion(ins)}
                                        >
                                          Cancelar
                                        </button>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </Table>
            </>
          )}
        </ModalBody>
      </Modal>

      <InscribirClienteModal
        isOpen={modalInscribir.abierto}
        toggle={() => setModalInscribir({ abierto: false, sesion: null })}
        sesion={modalInscribir.sesion}
        onInscrito={() => modalSesiones.clase && abrirSesiones(modalSesiones.clase)}
      />
    </>
  );
};

export default GestionClases;

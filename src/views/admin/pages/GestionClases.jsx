import React, { useContext, useEffect, useMemo, useState, useCallback } from "react";
import {
  Button,
  Container,
  Row,
  Col,
  Table,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Form,
  FormGroup,
  Input,
  Label,
  Badge,
} from "reactstrap";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import localeData from "dayjs/plugin/localeData";
import localizedFormat from "dayjs/plugin/localizedFormat";
import updateLocale from "dayjs/plugin/updateLocale";
import UserHeader from "components/Headers/UserHeader.js";
import Swal from "sweetalert2";
import ClasesContext from "context/ClasesContext";
import { useUsuario } from "context/usuariosContext";
import InscribirClienteModal from "components/gestionClases/InscribirClienteModal";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localeData);
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(localizedFormat);
dayjs.extend(updateLocale);
dayjs.locale("es");

const TZ = "America/Santiago";

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
  color: "",
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

// Paleta de respaldo para clases sin color propio asignado — solo para que
// el calendario semanal se vea variado, igual que como pedía el negocio
// ("similar" al ejemplo, sin copiar exactamente esos colores).
const PALETA = ["#534AB7", "#2D9CDB", "#27AE60", "#E67E22", "#EB5757", "#9B51E0", "#F2994A"];
const colorDeClase = (clase, idx) => clase.color || PALETA[idx % PALETA.length];

// Swatches rápidos para el selector de color del formulario. Es una lista
// aparte de PALETA (que sigue usándose solo como respaldo automático para
// clases sin color propio) para no cambiarle el color a clases ya
// existentes que dependen de esa paleta por índice.
const SWATCHES_COLOR = [
  "#534AB7",
  "#2D9CDB",
  "#27AE60",
  "#E67E22",
  "#EB5757",
  "#9B51E0",
  "#F2994A",
  "#000000",
];

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
  btnSecondary: {
    background: "transparent",
    color: "#534AB7",
    border: "1px solid #D9D5F5",
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
  calendarWrap: { padding: "0.5rem 1.5rem 1.5rem" },
  miniCalWrap: { overflowX: "auto", paddingBottom: 8 },
  miniCalCorner: {
    background: "#fafafa",
    borderBottom: "2px solid #e9ecef",
    borderRight: "1px solid #e9ecef",
    boxSizing: "border-box",
  },
  miniCalHeaderCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 13,
    color: "#1a1a2e",
    textTransform: "capitalize",
    background: "#fafafa",
    borderBottom: "2px solid #e9ecef",
    borderRight: "1px solid #f0f0f0",
    boxSizing: "border-box",
  },
  miniCalHoraLabel: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "flex-end",
    paddingRight: 8,
    paddingTop: 4,
    fontSize: 12,
    color: "#8898aa",
    borderRight: "1px solid #e9ecef",
    borderBottom: "1px solid #f5f5f5",
    boxSizing: "border-box",
  },
  miniCalCelda: {
    borderRight: "1px solid #f0f0f0",
    borderBottom: "1px solid #f5f5f5",
    boxSizing: "border-box",
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

// ─── Calendario semanal (grilla propia, sin librería externa) ────────────────
// Se venía usando react-big-calendar para esto, pero su sistema de
// posicionamiento por porcentaje (relativo al alto real en px de su propio
// contenedor interno) resultó demasiado frágil para este layout — terminaba
// mostrando todos los bloques amontonados cerca de una misma fila sin
// importar la hora real de cada uno, y no se logró estabilizar tocando sus
// props/CSS. Acá se arma la grilla a mano: la posición de cada bloque se
// calcula directo en píxeles (hora → fila, día → columna), sin depender de
// ningún cálculo interno de terceros.
const HORA_INICIO_GRILLA = 6; // 06:00
const HORA_FIN_GRILLA = 22; // 22:00 (límite inferior de la última fila)
const HORAS_GRILLA = Array.from(
  { length: HORA_FIN_GRILLA - HORA_INICIO_GRILLA },
  (_, i) => HORA_INICIO_GRILLA + i,
);
const ALTO_FILA = 64; // px por hora
const ALTO_HEADER = 42; // px del encabezado de días
const ANCHO_GUTTER = 56; // px de la columna de horas
const ANCHO_COLUMNA_MIN = 100; // px mínimo por columna de día (si la pantalla
// es angosta, de ahí para abajo entra scroll horizontal en vez de apretarlas)
// diaSemana: 0=domingo…6=sábado (igual que en el back). La semana se muestra
// de lunes a domingo, en ese orden — offset (diaSemana+6)%7 ya usado más
// abajo para eventosSemana coincide con este mismo orden de columnas.
const COLUMNAS_DIA = [1, 2, 3, 4, 5, 6, 0];

// Agrupa eventos que se superponen en el tiempo dentro de un mismo día y les
// asigna una "columna" (0,1,2…) y el total de columnas del grupo, para que
// clases simultáneas (ej. distintas salas a la misma hora) se vean una al
// lado de la otra en vez de tapadas. Algoritmo greedy estándar de layout de
// calendario (similar al que usan Google Calendar y react-big-calendar).
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
    crearExcepcionClase,
    getFeriados,
    bloquearFeriado,
    desbloquearFeriado,
  } = useContext(ClasesContext);

  const { barberos, getBarberosDisponibles } = useUsuario();

  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
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

  // ── Calendario semanal (horario recurrente, sin fechas reales) ──
  const [modalAcciones, setModalAcciones] = useState({ abierto: false, clase: null });

  // ── Feriados del módulo de clases (bloquear día / excepciones por clase) ──
  const [modalFeriados, setModalFeriados] = useState(false);
  const [feriados, setFeriados] = useState([]);
  const [cargandoFeriados, setCargandoFeriados] = useState(false);
  const [feriadoExpandido, setFeriadoExpandido] = useState(null);

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
      color: clase.color || "",
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
    if (guardando) return; // ya hay un guardado en curso, ignora el reintento

    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      instructor: form.instructor || null,
      duracion: Number(form.duracion),
      cupoMaximo: Number(form.cupoMaximo),
      precioPaseDiario:
        form.precioPaseDiario === "" ? null : Number(form.precioPaseDiario),
      color: form.color || null,
      horarioSemanal: form.horarioSemanal,
    };

    setGuardando(true);
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
    } finally {
      setGuardando(false);
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

  /* =======================================================
     🗓️ Calendario semanal: NO son sesiones reales con fecha — es el
     horario recurrente (horarioSemanal) de cada clase dibujado sobre una
     semana de referencia fija, para ver de un vistazo los bloques
     ocupados. Clickear un bloque abre las mismas acciones que antes tenía
     la fila de la tabla (editar / ver cupos / activar / eliminar).
  ======================================================= */
  const inicioSemanaRef = useMemo(() => dayjs().startOf("week"), []);

  const eventosSemana = useMemo(
    () =>
      clasesFiltradas.flatMap((c, idx) =>
        (c.horarioSemanal || []).map((b, i) => {
          const [hh, mm] = b.horaInicio.split(":").map(Number);
          // diaSemana: 0=domingo...6=sábado; inicioSemanaRef es lunes
          // (locale "es"), así que el offset desde el lunes es (d+6)%7.
          const offset = (b.diaSemana + 6) % 7;
          const start = inicioSemanaRef
            .add(offset, "day")
            .hour(hh)
            .minute(mm)
            .second(0)
            .toDate();
          const end = new Date(start.getTime() + (Number(c.duracion) || 60) * 60000);
          return {
            // Se muestra la hora junto al nombre (ej. "ARMOR · 07:30") — además
            // de quedar más claro para quien mira el calendario, sirve para
            // comprobar a simple vista que el bloque está en la fila correcta.
            title: `${c.nombre} · ${b.horaInicio}`,
            start,
            end,
            diaSemana: b.diaSemana,
            resource: c,
            color: colorDeClase(c, idx),
            key: `${c._id}-${b.diaSemana}-${b.horaInicio}-${i}`,
          };
        }),
      ),
    [clasesFiltradas, inicioSemanaRef],
  );

  // Convierte eventosSemana (hora/día "lógicos") en posiciones concretas en
  // píxeles dentro de la grilla (top/left/width/height), resolviendo también
  // los solapes de clases simultáneas del mismo día.
  const eventosPosicionados = useMemo(() => {
    const porDia = new Map();
    eventosSemana.forEach((ev) => {
      if (!porDia.has(ev.diaSemana)) porDia.set(ev.diaSemana, []);
      porDia.get(ev.diaSemana).push(ev);
    });

    const resultado = [];
    porDia.forEach((eventosDia, diaSemana) => {
      const colIdxDia = COLUMNAS_DIA.indexOf(diaSemana);
      if (colIdxDia === -1) return;
      distribuirSolapes(eventosDia).forEach((ev) => {
        const inicioMin =
          ev.start.getHours() * 60 + ev.start.getMinutes() - HORA_INICIO_GRILLA * 60;
        const duracionMin = Math.max(15, (ev.end.getTime() - ev.start.getTime()) / 60000);
        // Horizontal en % (relativo al ancho real de la capa de eventos, que
        // sigue el ancho fluido de la grilla vía CSS) — así las columnas se
        // estiran solas para llenar la pantalla sin tener que medir nada por
        // JS. Vertical sigue en px, ya que esa parte ya quedó funcionando bien.
        const anchoColPct = 100 / COLUMNAS_DIA.length;
        const anchoSubColPct = anchoColPct / ev.totalColumnas;
        resultado.push({
          ...ev,
          top: Math.max(0, (inicioMin / 60) * ALTO_FILA),
          height: (duracionMin / 60) * ALTO_FILA - 2,
          leftPct: colIdxDia * anchoColPct + ev.colIdx * anchoSubColPct,
          widthPct: anchoSubColPct,
        });
      });
    });
    return resultado;
  }, [eventosSemana]);

  const abrirAcciones = (event) => setModalAcciones({ abierto: true, clase: event.resource });
  const cerrarAcciones = () => setModalAcciones({ abierto: false, clase: null });

  // ── Feriados ──
  const cargarFeriados = useCallback(async () => {
    setCargandoFeriados(true);
    try {
      const hoy = dayjs().format("YYYY-MM-DD");
      const data = await getFeriados({ desde: hoy });
      setFeriados(data);
    } catch (error) {
      setFeriados([]);
    } finally {
      setCargandoFeriados(false);
    }
  }, [getFeriados]);

  const abrirFeriados = () => {
    setModalFeriados(true);
    setFeriadoExpandido(null);
    cargarFeriados();
  };

  const handleToggleBloqueoFeriado = async (feriado) => {
    const dia = dayjs(feriado.fecha).format("YYYY-MM-DD");
    try {
      if (feriado.bloqueado) {
        await desbloquearFeriado(dia);
        Swal.fire("Listo", "Día habilitado nuevamente", "success");
      } else {
        await bloquearFeriado(dia, feriado.nombre);
        Swal.fire("Listo", "Día bloqueado para las clases", "success");
      }
      cargarFeriados();
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo actualizar el feriado",
        "error",
      );
    }
  };

  const handleExcepcionClasePorFeriado = async (claseId, fecha, tipo) => {
    if (tipo === "normal") return; // nada que hacer, es el valor por defecto
    try {
      await crearExcepcionClase(claseId, { fecha, tipo });
      Swal.fire("Listo", "Excepción aplicada a esa clase en esa fecha", "success");
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo aplicar la excepción",
        "error",
      );
    }
  };

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
                    <p style={S.title}>Clases y horarios</p>
                    <p style={S.subtitle}>
                      Horario semanal de tus clases grupales, cupo y feriados
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button style={S.btnSecondary} onClick={abrirFeriados}>
                    <i className="fas fa-star mr-1" /> Feriados
                  </button>
                  <button style={S.btnPrimary} onClick={handleNuevo}>
                    + Nueva clase
                  </button>
                </div>
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
                <div style={S.calendarWrap}>
                  <p style={{ fontSize: 12, color: "#8898aa", margin: "10px 0" }}>
                    Horario semanal recurrente (no son fechas reales). Haz clic en un bloque para editar la clase, ver sus cupos, activarla/desactivarla o eliminarla.
                  </p>
                  <div style={S.miniCalWrap}>
                    <div style={{ position: "relative" }}>
                      {/* Grilla de fondo: encabezado de días + filas de horas.
                          Las columnas de día usan minmax(ANCHO_COLUMNA_MIN, 1fr)
                          — el navegador las estira solas para llenar todo el
                          ancho disponible (sin medir nada por JS); si no entran
                          ni al mínimo, este contenedor scrollea horizontal
                          (overflowX en S.miniCalWrap) en vez de apretarlas. */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: `${ANCHO_GUTTER}px repeat(${COLUMNAS_DIA.length}, minmax(${ANCHO_COLUMNA_MIN}px, 1fr))`,
                          gridTemplateRows: `${ALTO_HEADER}px repeat(${HORAS_GRILLA.length}, ${ALTO_FILA}px)`,
                        }}
                      >
                        <div style={S.miniCalCorner} />
                        {COLUMNAS_DIA.map((dia) => (
                          <div key={`enc-${dia}`} style={S.miniCalHeaderCell}>
                            {DIAS[dia]}
                          </div>
                        ))}
                        {HORAS_GRILLA.map((h) => (
                          <React.Fragment key={`fila-${h}`}>
                            <div style={S.miniCalHoraLabel}>
                              {`${String(h).padStart(2, "0")}:00`}
                            </div>
                            {COLUMNAS_DIA.map((dia) => (
                              <div key={`celda-${h}-${dia}`} style={S.miniCalCelda} />
                            ))}
                          </React.Fragment>
                        ))}
                      </div>

                      {/* Capa de eventos. Vertical (top/height) en px, ya
                          probado que queda bien. Horizontal (left/width) en %
                          sobre el ancho de esta misma capa (left:GUTTER,
                          right:0 — sigue el ancho fluido de la grilla de
                          arriba sin depender de ninguna medición por JS). */}
                      <div
                        style={{
                          position: "absolute",
                          top: ALTO_HEADER,
                          left: ANCHO_GUTTER,
                          right: 0,
                          height: ALTO_FILA * HORAS_GRILLA.length,
                          pointerEvents: "none",
                        }}
                      >
                        {eventosPosicionados.map((ev) => (
                          <div
                            key={ev.key}
                            onClick={() => abrirAcciones(ev)}
                            title={ev.title}
                            style={{
                              position: "absolute",
                              top: ev.top,
                              left: `${ev.leftPct}%`,
                              width: `calc(${ev.widthPct}% - 4px)`,
                              height: ev.height,
                              backgroundColor: ev.color,
                              opacity: ev.resource.activa ? 1 : 0.45,
                              borderRadius: 6,
                              color: "#fff",
                              fontSize: 12,
                              fontWeight: 700,
                              padding: "4px 6px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              cursor: "pointer",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                              pointerEvents: "auto",
                            }}
                          >
                            {ev.title}
                          </div>
                        ))}
                      </div>
                    </div>
                    {eventosSemana.length === 0 && (
                      <p style={{ fontSize: 13, color: "#8898aa", padding: "16px 4px" }}>
                        No hay clases con horario configurado.
                      </p>
                    )}
                  </div>
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
              <label>Color de la clase</label>
              <div className="d-flex align-items-center flex-wrap" style={{ gap: 8 }}>
                {SWATCHES_COLOR.map((c) => (
                  <div
                    key={c}
                    onClick={() => setForm({ ...form, color: c })}
                    title={c}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: c,
                      cursor: "pointer",
                      border:
                        form.color === c ? "3px solid #1a1a2e" : "2px solid #fff",
                      boxShadow: "0 0 0 1px #e0e0e0",
                    }}
                  />
                ))}
                <Input
                  type="color"
                  name="color"
                  value={form.color || "#534AB7"}
                  onChange={handleChange}
                  style={{ width: 44, height: 30, padding: 2 }}
                  title="Elegir otro color"
                />
                {form.color && (
                  <Button
                    size="sm"
                    color="link"
                    className="text-muted p-0 ml-1"
                    type="button"
                    onClick={() => setForm({ ...form, color: "" })}
                  >
                    Quitar
                  </Button>
                )}
              </div>
              <small className="text-muted d-block mt-1">
                Se usa en el calendario semanal. Si no eliges uno, se asigna
                automáticamente.
              </small>
            </FormGroup>

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

            <Button
              block
              color="primary"
              onClick={handleGuardar}
              type="button"
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Guardar"}
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

      {/* MODAL ACCIONES: clic en un bloque del calendario semanal */}
      <Modal isOpen={modalAcciones.abierto} toggle={cerrarAcciones} centered size="sm">
        <ModalHeader toggle={cerrarAcciones}>{modalAcciones.clase?.nombre}</ModalHeader>
        <ModalBody>
          {modalAcciones.clase && (
            <>
              <p className="text-muted small mb-3">
                {formatearHorario(modalAcciones.clase.horarioSemanal)} · Cupo {modalAcciones.clase.cupoMaximo} · {modalAcciones.clase.duracion} min
              </p>
              <div className="d-flex flex-column" style={{ gap: 8 }}>
                <Button
                  color="primary"
                  outline
                  onClick={() => {
                    cerrarAcciones();
                    handleEditar(modalAcciones.clase);
                  }}
                >
                  Editar clase
                </Button>
                <Button
                  color="info"
                  outline
                  onClick={() => {
                    const clase = modalAcciones.clase;
                    cerrarAcciones();
                    abrirSesiones(clase);
                  }}
                >
                  Ver cupos / inscritos
                </Button>
                <Button
                  color={modalAcciones.clase.activa ? "secondary" : "success"}
                  outline
                  onClick={() => {
                    handleToggleActiva(modalAcciones.clase);
                    cerrarAcciones();
                  }}
                >
                  {modalAcciones.clase.activa ? "Desactivar" : "Activar"}
                </Button>
                <Button
                  color="danger"
                  outline
                  onClick={() => {
                    const clase = modalAcciones.clase;
                    cerrarAcciones();
                    handleEliminar(clase);
                  }}
                >
                  Eliminar clase
                </Button>
              </div>
            </>
          )}
        </ModalBody>
      </Modal>

      {/* MODAL FERIADOS: bloquear día completo o dejar clases puntuales
          habilitadas/canceladas pese al feriado. Los feriados en sí
          (fecha/nombre) son globales; lo que se administra acá es solo el
          bloqueo propio de este gimnasio. */}
      <Modal isOpen={modalFeriados} toggle={() => setModalFeriados(false)} centered size="md">
        <ModalHeader toggle={() => setModalFeriados(false)}>Feriados</ModalHeader>
        <ModalBody>
          <p className="text-muted small mb-3">
            Los feriados aparecen habilitados por defecto: las clases funcionan con normalidad. Puedes bloquear el día completo, o dejar/cancelar clases puntuales pese al bloqueo.
          </p>
          {cargandoFeriados ? (
            <div className="text-center py-4 text-muted">Cargando...</div>
          ) : feriados.length === 0 ? (
            <p className="text-muted text-center py-3">No hay feriados próximos.</p>
          ) : (
            <div className="d-flex flex-column" style={{ gap: 8 }}>
              {feriados.map((f) => {
                const dia = dayjs(f.fecha).format("YYYY-MM-DD");
                const expandido = feriadoExpandido === dia;
                return (
                  <div
                    key={f._id}
                    style={{ border: "1px solid #e9ecef", borderRadius: 10, padding: 10 }}
                  >
                    <div className="d-flex align-items-center justify-content-between" style={{ gap: 8, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{f.nombre}</div>
                        <div style={{ fontSize: 12, color: "#8898aa", textTransform: "capitalize" }}>
                          {dayjs(f.fecha).format("dddd D [de] MMMM")}
                        </div>
                      </div>
                      <div className="d-flex align-items-center" style={{ gap: 6 }}>
                        <span style={f.bloqueado ? pill("#FCEBEB", "#A32D2D") : pill("#E6F9F0", "#1A7A4A")}>
                          {f.bloqueado ? "Bloqueado" : "Habilitado"}
                        </span>
                        <Button
                          size="sm"
                          color={f.bloqueado ? "success" : "danger"}
                          outline
                          onClick={() => handleToggleBloqueoFeriado(f)}
                        >
                          {f.bloqueado ? "Habilitar" : "Bloquear"}
                        </Button>
                        <Button
                          size="sm"
                          color="secondary"
                          outline
                          onClick={() => setFeriadoExpandido(expandido ? null : dia)}
                        >
                          {expandido ? "Ocultar" : "Excepciones"}
                        </Button>
                      </div>
                    </div>

                    {expandido && (
                      <div style={{ marginTop: 10, borderTop: "1px solid #f0f0f0", paddingTop: 10 }}>
                        <p className="text-muted small mb-2">
                          Excepción puntual por clase para el {dayjs(f.fecha).format("D MMM")} (no afecta otras fechas):
                        </p>
                        {clases.map((c) => (
                          <div key={c._id} className="d-flex align-items-center justify-content-between mb-2" style={{ gap: 8 }}>
                            <span style={{ fontSize: 13 }}>{c.nombre}</span>
                            <Input
                              type="select"
                              bsSize="sm"
                              style={{ maxWidth: 220 }}
                              defaultValue="normal"
                              onChange={(e) =>
                                handleExcepcionClasePorFeriado(c._id, dia, e.target.value)
                              }
                            >
                              <option value="normal">Sin cambios</option>
                              <option value="cancelada">Cancelar esta clase ese día</option>
                              <option value="forzar_habilitada">Mantener habilitada pese al bloqueo</option>
                            </Input>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setModalFeriados(false)}>
            Cerrar
          </Button>
        </ModalFooter>
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

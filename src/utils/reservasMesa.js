// Constantes y utilidades compartidas del módulo de reservas de mesa.
// Las reglas de verdad viven en el backend; acá solo están las etiquetas y
// los atajos de la interfaz (qué botón mostrar en cada estado).

export const ESTADOS_MESA = {
  pendiente: { label: "Pendiente", color: "warning" },
  confirmada: { label: "Confirmada", color: "primary" },
  llego: { label: "Llegó", color: "success" },
  completada: { label: "Completada", color: "secondary" },
  cancelada: { label: "Cancelada", color: "danger" },
  no_asistio: { label: "No asistió", color: "dark" },
};

// Botones rápidos por estado (deben ser transiciones válidas del backend)
export const ACCIONES_RAPIDAS = {
  pendiente: [
    { hacia: "confirmada", label: "Confirmar", color: "primary" },
    { hacia: "llego", label: "Llegó", color: "success" },
  ],
  confirmada: [
    { hacia: "llego", label: "Llegó", color: "success" },
    { hacia: "no_asistio", label: "No asistió", color: "secondary" },
  ],
  llego: [{ hacia: "completada", label: "Se fue", color: "secondary" }],
  no_asistio: [{ hacia: "llego", label: "Sí llegó", color: "success", pideMotivo: true }],
  completada: [],
  cancelada: [],
};

export const ESTADOS_CANCELABLES = ["pendiente", "confirmada"];
export const ESTADOS_EDITABLES = ["pendiente", "confirmada", "llego"];

export const ORIGENES_MESA = [
  { value: "telefono", label: "Teléfono" },
  { value: "presencial", label: "Presencial" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "otro", label: "Otro" },
];

export const ETIQUETA_ORIGEN = {
  telefono: "Teléfono",
  presencial: "Presencial",
  web: "Web",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  otro: "Otro",
};

export const MOTIVOS_CANCELACION_MESA = [
  { value: "cliente_cancelo", label: "El cliente canceló" },
  { value: "cliente_no_confirmo", label: "El cliente no confirmó" },
  { value: "local_no_puede_atender", label: "El local no puede atender (clima, evento, cierre)" },
  { value: "error_registro", label: "Error al registrar" },
  { value: "otro", label: "Otro" },
];

export const DIAS_SEMANA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/** Fecha de hoy en Chile, "YYYY-MM-DD". */
export const hoyChile = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

export const sumarDias = (fecha, dias) => {
  const [y, m, d] = fecha.split("-").map(Number);
  const f = new Date(Date.UTC(y, m - 1, d + dias, 12));
  return f.toISOString().slice(0, 10);
};

/** "2026-10-23" → "viernes 23 de octubre" */
export const fechaLarga = (fecha) => {
  if (!fecha) return "";
  const [y, m, d] = fecha.split("-").map(Number);
  const dia = new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
  return `${DIAS_SEMANA[dia].toLowerCase()} ${d} de ${MESES[m - 1]}`;
};

/** Primera letra en mayúscula ("viernes 23 de octubre" → "Viernes 23 de octubre") */
export const capitalizar = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

/** "2026-10-23" → "23-10-2026" */
export const fechaCorta = (fecha) => (fecha ? fecha.split("-").reverse().join("-") : "");

export const fechaHora = (iso) =>
  iso
    ? new Date(iso).toLocaleString("es-CL", {
        timeZone: "America/Santiago",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

export const mensajeError = (error, porDefecto = "Ocurrió un error, intenta de nuevo") =>
  error?.response?.data?.message || porDefecto;

/** Clave única por formulario abierto (evita duplicados por doble clic). */
export const nuevaClave = () =>
  window.crypto?.randomUUID
    ? window.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const telLink = (telefono) => `tel:${String(telefono || "").replace(/[^\d+]/g, "")}`;

/** Link de WhatsApp con un mensaje listo. Celulares chilenos sin código: se agrega 56. */
export const whatsappLink = (telefono, texto = "") => {
  let n = String(telefono || "").replace(/\D/g, "");
  if (n.length === 9 && n.startsWith("9")) n = `56${n}`;
  return `https://wa.me/${n}${texto ? `?text=${encodeURIComponent(texto)}` : ""}`;
};

/** Usuario de Instagram desde un link ("https://www.instagram.com/santafeovalle/") o "@santafeovalle". */
export const usuarioInstagram = (valor) => {
  const v = String(valor || "").trim();
  if (!v) return "";
  const m = v.match(/instagram\.com\/([A-Za-z0-9._]+)/i) || v.match(/^@?([A-Za-z0-9._]+)$/);
  return m ? m[1] : "";
};

/** Abre directo el chat (mensaje directo) de Instagram con ese usuario. */
export const instagramLink = (usuario) => `https://ig.me/m/${usuario}`;

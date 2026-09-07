// src/utils/temaEmpresa.js
//
// Tema visual (colores) de las páginas públicas que ve un cliente/invitado:
// Landing, LandingGimnasio, ReservarHoraInvitado, ClasePruebaInvitado.
//
// Antes cada una de esas páginas traía su propio mapa de colores "a mano"
// por slug (themes = { lumicabeauty: {...}, "danails-studio": {...},
// default: {...} }), copiado y pegado en más de un archivo. Cualquier
// negocio nuevo que quisiera su propio color quedaba pegado con el azul
// por defecto hasta que alguien tocara el código y desplegara de nuevo —
// es decir, la personalización de "Configuración → Colores" (que sí guarda
// empresa.colores en la base de datos) no se veía reflejada en ninguna
// página real del cliente.
//
// Desde ahora el color sale de empresa.colores en cuanto el negocio lo
// configura. Si nunca lo ha tocado (colores.primario vacío), se usa un
// tema "de fábrica" como respaldo, para no cambiarle la cara a nadie que
// no haya entrado nunca a personalizar sus colores.

// Genera una variante clara del color (para fondos/badges) — mismo
// criterio que ya usa EmpresaContext.jsx para las variables CSS.
const getLightVariant = (hex) => {
  if (!hex || !hex.startsWith("#") || hex.length < 7) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},0.12)`;
};

// Genera una variante oscura (para hover) — mismo criterio que
// EmpresaContext.jsx.
const getDarkVariant = (hex) => {
  if (!hex || !hex.startsWith("#") || hex.length < 7) return hex;
  const r = Math.floor(parseInt(hex.slice(1, 3), 16) * 0.8);
  const g = Math.floor(parseInt(hex.slice(3, 5), 16) * 0.8);
  const b = Math.floor(parseInt(hex.slice(5, 7), 16) * 0.8);
  return `rgb(${r},${g},${b})`;
};

// Tema por defecto de toda la vida (el que ya usaban Landing.jsx,
// ReservaInvitado.jsx y ClasePruebaInvitado.jsx para cualquier empresa sin
// tema propio hardcodeado).
export const TEMA_DEFAULT = {
  primary: "#5e72e4",
  primaryLight: "#eaecfe",
  primaryDark: "#324cdd",
  secondary: "#2dce89",
  softBg: "#f6f9fc",
  heroBg: "linear-gradient(150deg, #172b4d 0%, #1a174d 100%)",
  textDark: "#172b4d",
  textMuted: "#8898aa",
  variant: "dark",
};

// Los dos temas que antes estaban hardcodeados por slug en Landing.jsx y
// ReservaInvitado.jsx. Se mantienen intactos como respaldo: si Lumica
// Beauty o Danails Studio todavía no entran a "Configuración → Colores" a
// guardar sus colores en la base de datos, se ven exactamente igual que
// antes de este cambio.
export const TEMAS_LEGACY_POR_SLUG = {
  lumicabeauty: {
    primary: "#FF5DA1",
    primaryLight: "#FFE4F0",
    primaryDark: "#E64D8F",
    secondary: "#BA68C8",
    softBg: "#FFFFFF",
    heroBg: "linear-gradient(135deg, #FFFFFF 0%, #FFF5FA 100%)",
    textDark: "#2D3748",
    textMuted: "#718096",
    variant: "light",
  },
  "danails-studio": {
    primary: "#F2A7C3",
    primaryLight: "#FEF0F5",
    primaryDark: "#D4819F",
    secondary: "#D4AF37",
    softBg: "#FFF8FB",
    heroBg: "linear-gradient(135deg, #FFFFFF 0%, #FEF0F5 50%, #FFF8FB 100%)",
    textDark: "#3A2E32",
    textMuted: "#B09AA0",
    variant: "light",
  },
};

// Tema de fábrica para gimnasios — antes vivía como constante fija dentro
// de LandingGimnasio.jsx, igual para todos los gimnasios sin excepción.
export const TEMA_DEFAULT_GIMNASIO = {
  primary: "#2dce89",
  primaryLight: "#e3fcef",
  primaryDark: "#24a46d",
  secondary: "#11cdef",
  heroBg: "linear-gradient(150deg, #11142b 0%, #172b4d 55%, #0f2a22 100%)",
  softBg: "#f6fcf9",
  textDark: "#172b4d",
  textMuted: "#8898aa",
  variant: "dark",
};

/**
 * Arma el tema final a partir de empresa.colores, priorizando siempre lo
 * que el negocio haya configurado él mismo. Cualquier color que no haya
 * configurado cae al `temaDeFabrica` que se le pase (para no dejar huecos
 * a medio personalizar con valores raros).
 */
export const construirTema = (colores, temaDeFabrica = TEMA_DEFAULT) => {
  if (!colores?.primario) return temaDeFabrica;

  const primary = colores.primario;

  // Ojo con "heroEsClaro": si el negocio nunca lo tocó (undefined/null en
  // la base de datos), NO hay que asumir "dark" a la fuerza — eso es lo
  // que rompió a Lumica Beauty (fondo claro heredado del tema de fábrica +
  // variant "dark" a la fuerza = texto blanco sobre fondo casi blanco,
  // invisible). Si no lo configuró, se hereda el variant del tema de
  // fábrica; solo se fuerza light/dark cuando el negocio guardó ese campo
  // explícitamente como true/false.
  const variant =
    typeof colores.heroEsClaro === "boolean"
      ? colores.heroEsClaro
        ? "light"
        : "dark"
      : temaDeFabrica.variant;

  return {
    primary,
    primaryLight: colores.primarioLight || getLightVariant(primary),
    primaryDark: colores.primarioDark || getDarkVariant(primary),
    secondary: colores.secundario || temaDeFabrica.secondary,
    softBg: colores.softBg || temaDeFabrica.softBg,
    heroBg: colores.heroBg || temaDeFabrica.heroBg,
    textDark: colores.texto || temaDeFabrica.textDark,
    textMuted: colores.textoMuted || temaDeFabrica.textMuted,
    variant,
  };
};

/**
 * Punto de entrada único para las páginas públicas: recibe la empresa
 * completa (la que entrega useEmpresa()) y el slug de la URL, y devuelve
 * el tema listo para usar.
 *
 * `temasLegacyPorSlug` es opcional — solo lo necesitan las páginas que ya
 * tenían temas hechos a mano antes de este cambio (Landing.jsx y
 * ReservaInvitado.jsx, vía TEMAS_LEGACY_POR_SLUG). El resto puede omitirlo
 * y usa `temaDeFabrica` (por defecto TEMA_DEFAULT) directamente.
 */
export const obtenerTemaEmpresa = (
  empresa,
  slug,
  { temasLegacyPorSlug = {}, temaDeFabrica = TEMA_DEFAULT } = {},
) => {
  const fabrica = temasLegacyPorSlug[slug] || temaDeFabrica;
  return construirTema(empresa?.colores, fabrica);
};

/**
 * Estilo inline para un botón de selección (chip de categoría, tarjeta de
 * servicio, profesional, día u hora): relleno con el color primario cuando
 * está seleccionado, o solo el borde/texto cuando no. Reemplaza el
 * color="success" / "outline-success" de Reactstrap que antes dejaba estos
 * botones siempre verdes sin importar lo que el negocio configurara.
 */
export const estiloBotonTema = (theme, activo) => ({
  backgroundColor: activo ? theme.primary : "#ffffff",
  border: `1.5px solid ${theme.primary}`,
  color: activo ? "#ffffff" : theme.primary,
});

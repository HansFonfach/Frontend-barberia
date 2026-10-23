// src/utils/filtrarRutas.js

/**
 * Reglas de acceso de una ruta.
 * - soloAdmin: solo la ve quien tenga esAdmin === true
 * - excludeSlugs: negocios donde la ruta no aplica (por slug puntual)
 * - excludeRubros: rubros de empresa donde la ruta no aplica
 *   (ej. ["gimnasio"] para ocultar pantallas de barbería/salón que un gimnasio no usa)
 * - requiereModulo: nombre del flag en empresa.modulos que debe estar en true
 *   (ej. "clasesGrupales" para las pantallas del módulo de gimnasios)
 * - soloRubros: la ruta existe SOLO para estos rubros
 * - todosLosRubros: la ruta también aplica a los rubros con menú propio
 *   (perfil, contraseña, configuración de la empresa, equipo)
 * - nombrePorRubro: nombre distinto en el menú según el rubro
 *   (ej. { restaurante: "Equipo" } en vez de "Profesionales")
 */

// Rubros que no usan la agenda por servicios (barbería/salón/salud): solo ven
// las rutas marcadas para ellos (soloRubros), las de módulos que tengan
// activos (requiereModulo) y las comunes (todosLosRubros). Así un rubro
// nuevo no hereda decenas de pantallas que no le sirven, sin tener que
// agregarlo a cada excludeRubros.
export const RUBROS_MENU_PROPIO = ["restaurante"];

const tienePermiso = (ruta, { user, slug, empresa }) => {
  if (ruta.soloAdmin && !user?.esAdmin) return false;
  if (ruta.excludeSlugs?.includes(slug)) return false;
  if (ruta.excludeRubros?.includes(empresa?.rubro)) return false;
  if (ruta.soloRubros && !ruta.soloRubros.includes(empresa?.rubro)) return false;
  if (
    RUBROS_MENU_PROPIO.includes(empresa?.rubro) &&
    !ruta.soloRubros &&
    !ruta.todosLosRubros &&
    !ruta.requiereModulo
  ) {
    return false;
  }
  if (ruta.requiereModulo && !empresa?.modulos?.[ruta.requiereModulo]) return false;
  return true;
};

/**
 * Recorre el árbol de rutas (incluyendo children) y devuelve solo
 * las permitidas. Un padre que se queda sin hijos visibles se descarta.
 *
 * incluirInvisibles = true  -> para registrar los <Route> (perfil,
 *                              cambiar-contrasena, etc. no salen en el
 *                              menú pero tienen que seguir existiendo)
 * incluirInvisibles = false -> para pintar el sidebar
 */
const nombreSegunRubro = (ruta, empresa) => {
  const nombre = ruta.nombrePorRubro?.[empresa?.rubro];
  return nombre ? { ...ruta, name: nombre } : ruta;
};

const filtrar = (rutas, contexto, incluirInvisibles) =>
  rutas.reduce((acc, ruta) => {
    if (!tienePermiso(ruta, contexto)) return acc;
    if (!incluirInvisibles && ruta.invisible) return acc;

    if (ruta.children) {
      const children = filtrar(ruta.children, contexto, incluirInvisibles);
      if (children.length === 0) return acc;
      return [...acc, nombreSegunRubro({ ...ruta, children }, contexto.empresa)];
    }

    return [...acc, nombreSegunRubro(ruta, contexto.empresa)];
  }, []);

/** Rutas que el usuario puede cargar. Úsala para armar los <Route>. */
export const filtrarRutasPermitidas = (rutas = [], contexto = {}) =>
  filtrar(rutas, contexto, true);

/** Rutas que el usuario puede ver en el menú. Úsala para el Sidebar. */
export const filtrarRutasMenu = (rutas = [], contexto = {}) =>
  filtrar(rutas, contexto, false);

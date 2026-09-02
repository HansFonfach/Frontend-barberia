// src/utils/versionWatcher.js
//
// Problema que resuelve: un celular puede dejar cacheado el index.html y
// el JS de una versión vieja del sitio. Si después haces un cambio en el
// backend (ej. cómo responde un endpoint), esa copia vieja del frontend
// puede fallar justo al hacer esa llamada — y como React no tiene manejo
// de errores por defecto, la pantalla queda en blanco. Modo incógnito
// "arregla" el síntoma porque parte sin caché y baja la versión actual.
//
// Este watcher detecta esa situación sola: pide el index.html real (sin
// caché) cada cierto tiempo, compara el archivo JS que trae contra el que
// está corriendo ahora mismo en el navegador, y si son distintos, recarga
// la página UNA vez para traer la versión al día. Así nadie tiene que
// acordarse de usar incógnito ni limpiar caché a mano.
const STORAGE_KEY = "af_reload_por_version_nueva";

const obtenerScriptActual = () => {
  const script = document.querySelector('script[src*="/static/js/main."]');
  return script?.getAttribute("src") || null;
};

export const iniciarVersionWatcher = () => {
  const scriptInicial = obtenerScriptActual();
  // Si no lo encontramos (ej. en desarrollo local con react-scripts start,
  // donde los nombres de archivo son distintos), no hacemos nada — esto
  // solo aplica a la build de producción.
  if (!scriptInicial) return () => {};

  const chequear = async () => {
    try {
      const res = await fetch(`${window.location.origin}/index.html?_=${Date.now()}`, {
        cache: "no-store",
      });
      if (!res.ok) return;

      const html = await res.text();
      const match = html.match(/\/static\/js\/main\.[^"]+\.js/);
      const scriptNuevo = match?.[0];

      if (scriptNuevo && scriptNuevo !== scriptInicial) {
        // Recarga como mucho una vez por pestaña, para no entrar en loop
        // si algo raro pasa con la detección.
        if (!sessionStorage.getItem(STORAGE_KEY)) {
          sessionStorage.setItem(STORAGE_KEY, "1");
          window.location.reload();
        }
      }
    } catch {
      // Sin internet en ese instante, servidor caído momentáneamente, etc.
      // No hacemos nada, se vuelve a intentar en el próximo chequeo.
    }
  };

  const alVolverVisible = () => {
    if (document.visibilityState === "visible") chequear();
  };

  document.addEventListener("visibilitychange", alVolverVisible);
  const intervalo = setInterval(chequear, 5 * 60 * 1000); // cada 5 min

  return () => {
    document.removeEventListener("visibilitychange", alVolverVisible);
    clearInterval(intervalo);
  };
};

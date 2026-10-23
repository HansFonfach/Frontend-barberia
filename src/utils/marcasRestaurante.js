// Identidad visual y contenido de la landing de cada bar/restaurante.
//
// Solo información entregada por el propio local: nada inventado. Lo que no
// está acá se toma de la empresa (dirección, teléfono, redes) o simplemente
// no se muestra. Un restaurante sin entrada en este archivo usa la versión
// genérica (nombre, descripción, horarios y logo de la empresa).
//
// Para agregar fotos reales del local: importarlas y ponerlas en `fotos`
// (la galería aparece sola cuando hay al menos una).
import logoSantafe from "assets/img/brand/santafe-logo.jpg";
import maderaSantafe from "assets/img/brand/santafe-madera.jpg";

export const MARCAS_RESTAURANTE = {
  santafe: {
    logo: logoSantafe,
    fondoHero: maderaSantafe,
    ciudad: "Ovalle",
    lema: "Coctelería de autor y cocina del mundo",
    horario: "Martes a sábado · desde las 18:00 hrs",
    cartaUrl: "https://santafe.tucartadigital.com/",
    // Lugar para el botón "Cómo llegar" (búsqueda en Google Maps)
    mapaBusqueda: "Santa Fe Ovalle",
    destacados: [
      {
        icono: "coctel",
        titulo: "Coctelería internacional y de autor",
        texto: "Clásicos de todo el mundo y creaciones propias de la casa.",
      },
      {
        icono: "mundo",
        titulo: "Cocina del mundo",
        texto: "Platos inspirados en distintas cocinas del mundo.",
      },
      {
        icono: "huella",
        titulo: "Pet friendly",
        texto: "Tu mascota también es bienvenida.",
      },
    ],
    fotos: [],
    colores: {
      fondo: "#110d0a",
      fondoAlterno: "#1a1410",
      tarjeta: "#211913",
      acento: "#c9954c",
      acentoClaro: "#e8c591",
      texto: "#f3e9dc",
      textoSuave: "#b8a894",
      borde: "rgba(201, 149, 76, 0.22)",
    },
  },
};

// Colores por defecto para restaurantes sin identidad propia
export const COLORES_RESTAURANTE_DEFAULT = {
  fondo: "#121212",
  fondoAlterno: "#1b1b1b",
  tarjeta: "#222222",
  acento: "#d4a35a",
  acentoClaro: "#ecd2a3",
  texto: "#f2f0ec",
  textoSuave: "#b5b0a8",
  borde: "rgba(212, 163, 90, 0.22)",
};

export const marcaDe = (empresa) => MARCAS_RESTAURANTE[empresa?.slug] || null;

// Carga una sola vez las fuentes de la landing (un <link> en el <head>; un
// @import dentro del CSS se pierde al unirse con el resto de los estilos).
const URL_FUENTES =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Jost:wght@300;400;500;600&display=swap";

export const cargarFuentesRestaurante = () => {
  if (typeof document === "undefined" || document.getElementById("fuentes-restaurante")) return;
  const link = document.createElement("link");
  link.id = "fuentes-restaurante";
  link.rel = "stylesheet";
  link.href = URL_FUENTES;
  document.head.appendChild(link);
};

/** Variables CSS de la paleta, para el atributo style del contenedor .lr */
export const variablesColores = (c) => ({
  "--lr-fondo": c.fondo,
  "--lr-fondo-alterno": c.fondoAlterno,
  "--lr-tarjeta": c.tarjeta,
  "--lr-acento": c.acento,
  "--lr-acento-claro": c.acentoClaro,
  "--lr-texto": c.texto,
  "--lr-texto-suave": c.textoSuave,
  "--lr-borde": c.borde,
});

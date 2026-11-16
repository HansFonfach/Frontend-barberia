// utils/seo.js
//
// Título, descripción y datos para Google de cada página pública. La app es
// React (todo se arma en el navegador), así que esto actualiza el <head>
// al entrar a la página y lo deja como estaba al salir.
import { useEffect } from "react";

export const SITIO = "https://www.agendafonfach.cl";

// Tipo de negocio para schema.org (lo que Google entiende como "barbería", etc.)
const TIPO_SCHEMA = {
  barberia: "HairSalon",
  peluqueria: "HairSalon",
  salon_belleza: "BeautySalon",
  "salon de belleza": "BeautySalon",
  centro_estetica: "BeautySalon",
  estetica: "BeautySalon",
  spa: "DaySpa",
  masajes: "DaySpa",
  gimnasio: "HealthClub",
  dental: "Dentist",
  medicina_general: "MedicalClinic",
  consultorio: "MedicalClinic",
  nutricion: "MedicalBusiness",
  kinesiologia: "MedicalBusiness",
  psicologia: "MedicalBusiness",
  tatuajes: "TattooParlor",
  restaurante: "Restaurant",
};

const ETIQUETA_RUBRO = {
  barberia: "Barbería",
  peluqueria: "Peluquería",
  salon_belleza: "Salón de belleza",
  "salon de belleza": "Salón de belleza",
  centro_estetica: "Centro de estética",
  estetica: "Centro de estética",
  spa: "Spa",
  masajes: "Masajes",
  gimnasio: "Gimnasio",
  dental: "Clínica dental",
  medicina_general: "Consulta médica",
  consultorio: "Consulta médica",
  nutricion: "Nutricionista",
  kinesiologia: "Kinesiología",
  psicologia: "Psicología",
  tatuajes: "Estudio de tatuajes",
  restaurante: "Bar y restaurante",
};

const recortar = (texto, max = 158) => {
  const t = String(texto || "").replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
};

const urlInstagram = (valor) => {
  const v = String(valor || "").trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  const usuario = v.replace(/^@/, "").replace(/^(www\.)?instagram\.com\//i, "").split(/[/?#]/)[0];
  return usuario ? `https://www.instagram.com/${usuario}` : null;
};

/** Nombre sin emojis (para el título y la descripción que muestra Google). */
const sinEmojis = (texto) =>
  String(texto || "")
    .replace(/[\p{Extended_Pictographic}‍️]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

const unirConY = (lista) =>
  lista.length <= 1 ? lista.join("") : `${lista.slice(0, -1).join(", ")} y ${lista[lista.length - 1]}`;

const pesosCL = (n) => `$${Number(n).toLocaleString("es-CL")}`;

const ACCION_POR_RUBRO = {
  restaurante: { texto: "Reserva tu mesa", ruta: "reservar-mesa" },
  gimnasio: { texto: "Agenda tu clase", ruta: "clase-de-prueba" },
};

/**
 * Título, descripción y JSON-LD de la página pública de un negocio.
 * Con `servicios` (los de la página) arma una descripción con sus servicios
 * principales + la ciudad ("Lifting de pestañas, ... en Ovalle"), que es lo
 * que la gente escribe en Google, y le pasa a Google la lista con precios.
 */
export const seoNegocio = (empresa, slug, servicios = []) => {
  if (!empresa?.nombre) return {};
  const clave = String(empresa.rubro || empresa.tipo || "").toLowerCase().trim();
  const etiqueta = ETIQUETA_RUBRO[clave] || "";
  const ciudad = String(empresa.ciudad || "").trim();
  const accion = ACCION_POR_RUBRO[clave] || { texto: "Reserva tu hora", ruta: "reservar" };
  const url = `${SITIO}/${slug || empresa.slug}`;
  const nombre = sinEmojis(empresa.nombre) || empresa.nombre;

  const lista = (servicios || []).filter((s) => s?.nombre);
  const nivel = (s) => (s.destacado === "principal" ? 2 : s.destacado === "destacado" ? 1 : 0);
  const marcados = lista.filter((s) => nivel(s) > 0).sort((a, b) => nivel(b) - nivel(a));
  const principales = (marcados.length ? marcados : lista).slice(0, 3).map((s) => sinEmojis(s.nombre));
  const precios = lista
    .map((s) => Number(s.precioFinal ?? s.precio))
    .filter((p) => Number.isFinite(p) && p > 0);

  // "Lumica Beauty · Salón de belleza en Ovalle | Reserva online"
  const queEs = [etiqueta, ciudad && `en ${ciudad}`].filter(Boolean).join(" ");
  const titulo = `${nombre}${queEs ? ` · ${queEs}` : ""} | ${accion.texto} online`;

  // "Lifting de pestañas, Diseño de cejas y Laminado de cejas en Ovalle. <descripción>"
  const entrada = principales.length
    ? `${unirConY(principales)}${ciudad ? ` en ${ciudad}` : ""}.`
    : queEs
      ? `${etiqueta || nombre}${ciudad ? ` en ${ciudad}` : ""}.`
      : "";
  const descripcion = recortar(
    `${entrada} ${
      empresa.descripcion ||
      `Revisa servicios, precios y horas disponibles y reserva online en ${nombre}.`
    }`,
  );

  const sameAs = [
    urlInstagram(empresa.redes?.instagram),
    empresa.redes?.facebook,
    empresa.redes?.tiktok,
    empresa.redes?.youtube,
  ].filter((s) => s && /^https?:\/\//i.test(s));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": TIPO_SCHEMA[clave] || "LocalBusiness",
    name: nombre,
    url,
    ...(empresa.logo ? { image: empresa.logo, logo: empresa.logo } : {}),
    ...(empresa.descripcion ? { description: recortar(empresa.descripcion, 300) } : {}),
    ...(empresa.telefono ? { telephone: empresa.telefono } : {}),
    ...(empresa.direccion || ciudad
      ? {
          address: {
            "@type": "PostalAddress",
            ...(empresa.direccion ? { streetAddress: empresa.direccion } : {}),
            ...(ciudad ? { addressLocality: ciudad } : {}),
            addressCountry: "CL",
          },
        }
      : {}),
    ...(ciudad ? { areaServed: { "@type": "City", name: ciudad } } : {}),
    ...(precios.length
      ? {
          priceRange:
            Math.min(...precios) === Math.max(...precios)
              ? pesosCL(precios[0])
              : `${pesosCL(Math.min(...precios))} - ${pesosCL(Math.max(...precios))}`,
        }
      : {}),
    ...(lista.length
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: `Servicios de ${nombre}`,
            itemListElement: lista.slice(0, 40).map((s) => {
              const precio = Number(s.precioFinal ?? s.precio);
              return {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: sinEmojis(s.nombre),
                  ...(s.descripcion ? { description: recortar(s.descripcion, 200) } : {}),
                },
                ...(Number.isFinite(precio) && precio > 0 ? { price: precio, priceCurrency: "CLP" } : {}),
              };
            }),
          },
        }
      : {}),
    potentialAction: {
      "@type": "ReserveAction",
      name: accion.texto,
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/${accion.ruta}`,
        actionPlatform: ["https://schema.org/DesktopWebPlatform", "https://schema.org/MobileWebPlatform"],
      },
    },
    ...(sameAs.length ? { sameAs } : {}),
  };

  return { titulo, descripcion, canonical: url, imagen: empresa.logo || undefined, jsonLd };
};

const ponerMeta = (atributo, clave, valor, deshacer) => {
  if (!valor) return;
  let el = document.head.querySelector(`meta[${atributo}="${clave}"]`);
  const creado = !el;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(atributo, clave);
    document.head.appendChild(el);
  }
  const antes = el.getAttribute("content");
  el.setAttribute("content", valor);
  deshacer.push(() => (creado ? el.remove() : el.setAttribute("content", antes ?? "")));
};

/**
 * useSeo({ titulo, descripcion, canonical, imagen, jsonLd, noIndexar })
 * Sin titulo no hace nada (por ejemplo mientras carga la empresa).
 */
export const useSeo = ({ titulo, descripcion, canonical, imagen, jsonLd, noIndexar = false } = {}) => {
  const ld = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    if (!titulo) return undefined;
    const deshacer = [];
    const tituloAntes = document.title;
    document.title = titulo;

    ponerMeta("name", "description", descripcion, deshacer);
    ponerMeta("property", "og:title", titulo, deshacer);
    ponerMeta("property", "og:description", descripcion, deshacer);
    ponerMeta("property", "og:type", "website", deshacer);
    ponerMeta("property", "og:url", canonical, deshacer);
    ponerMeta("property", "og:image", imagen, deshacer);
    ponerMeta("name", "twitter:card", "summary", deshacer);
    if (noIndexar) ponerMeta("name", "robots", "noindex, nofollow", deshacer);

    if (canonical) {
      let link = document.head.querySelector('link[rel="canonical"]');
      const creado = !link;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      const antes = link.getAttribute("href");
      link.setAttribute("href", canonical);
      deshacer.push(() => (creado ? link.remove() : link.setAttribute("href", antes || "")));
    }

    if (ld) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo", "1");
      script.textContent = ld;
      document.head.appendChild(script);
      deshacer.push(() => script.remove());
    }

    return () => {
      document.title = tituloAntes;
      deshacer.reverse().forEach((f) => f());
    };
  }, [titulo, descripcion, canonical, imagen, ld, noIndexar]);
};

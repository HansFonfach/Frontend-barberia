import React, { useEffect, useMemo, useState } from "react";
import { listarCategoriasPublico } from "api/categoria";

/**
 * Página pública de barberías, salones y demás negocios de horas (los
 * gimnasios y los restaurantes tienen la suya). Se arma con los colores del
 * negocio en dos estilos:
 *  - oscuro: fondo negro y letras tipo editorial (marcas oscuras, ej. La Santa)
 *  - claro:  fondo claro, moderno
 * El estilo sale de Configuración → Colores ("Estilo de la página"); en
 * "automático" se usa el oscuro si el color de fondo del negocio es oscuro.
 */

const FUENTES =
  "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600;700;800&display=swap";

const RUBROS = {
  barberia: "Barbería",
  peluqueria: "Peluquería",
  salon_belleza: "Salón de belleza",
  "salon de belleza": "Salón de belleza",
  centro_estetica: "Centro de estética",
  estetica: "Centro de estética",
  spa: "Spa",
  masajes: "Masajes",
  nutricion: "Nutrición",
  kinesiologia: "Kinesiología",
  psicologia: "Psicología",
  medicina_general: "Consulta médica",
  consultorio: "Consulta médica",
  dental: "Clínica dental",
  tatuajes: "Estudio de tatuajes",
};

/* ───────── colores ───────── */
const hexARgb = (color) => {
  let h = (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(color || "").trim()) || [])[1];
  if (!h) return null;
  if (h.length === 3) h = h.replace(/./g, "$&$&");
  const n = parseInt(h, 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
};
const luminancia = (color) => {
  const rgb = hexARgb(color);
  if (!rgb) return null;
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const mezclar = (color, con, p) => {
  const a = hexARgb(color);
  const b = hexARgb(con);
  if (!a || !b) return color;
  return `#${a.map((v, i) => Math.round(v + (b[i] - v) * p).toString(16).padStart(2, "0")).join("")}`;
};
const textoSobre = (color) => ((luminancia(color) ?? 0) > 0.36 ? "#141414" : "#ffffff");

/** Color de acento legible sobre el fondo de cada estilo. */
const acentoPara = (primario, oscuro) => {
  const base = hexARgb(primario) ? primario : "#5e72e4";
  const l = luminancia(base) ?? 0.2;
  if (oscuro && l < 0.12) return mezclar(base, "#ffffff", 0.35);
  if (!oscuro && l > 0.55) return mezclar(base, "#000000", 0.35);
  return base;
};

export const esEstiloOscuro = (empresa) => {
  const elegido = empresa?.configuracion?.estiloPagina;
  if (elegido === "oscuro") return true;
  if (elegido === "claro") return false;
  const lFondo = luminancia(empresa?.colores?.fondo);
  return lFondo != null && lFondo < 0.2;
};

/* ───────── datos ───────── */
const clp = (n) => `$${Math.round(Number(n) || 0).toLocaleString("es-CL")}`;
const iniciales = (texto = "") =>
  texto
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
const duracionTexto = (s) =>
  s.duracionMin && s.duracionMax && s.duracionMin !== s.duracionMax
    ? `${s.duracionMin}–${s.duracionMax} min`
    : s.duracionMin
      ? `${s.duracionMin} min`
      : "";
const urlInstagram = (valor) => {
  const v = String(valor || "").trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  const u = v.replace(/^@/, "").replace(/^(www\.)?instagram\.com\//i, "").split(/[/?#]/)[0];
  return u ? `https://www.instagram.com/${u}` : null;
};
const telefonoWhatsapp = (tel) => {
  const d = String(tel || "").replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("56")) return d;
  if (d.length === 9 && d.startsWith("9")) return `56${d}`;
  if (d.length === 8) return `569${d}`;
  return d;
};

const LandingNegocio = ({ empresa, slug, servicios = [], profesionales = [], theme, navigate }) => {
  const oscuro = esEstiloOscuro(empresa);
  const acento = acentoPara(theme?.primary, oscuro);
  const [categoria, setCategoria] = useState("todas");
  const [categoriasApi, setCategoriasApi] = useState(null);
  const [detalle, setDetalle] = useState(null); // servicio con la descripción completa

  // Las mismas categorías (y en el mismo orden) que al reservar
  useEffect(() => {
    let vigente = true;
    listarCategoriasPublico(slug)
      .then((r) => vigente && setCategoriasApi(Array.isArray(r) ? r : r?.data || []))
      .catch(() => vigente && setCategoriasApi([]));
    return () => {
      vigente = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!detalle) return undefined;
    const cerrar = (e) => e.key === "Escape" && setDetalle(null);
    window.addEventListener("keydown", cerrar);
    return () => window.removeEventListener("keydown", cerrar);
  }, [detalle]);

  useEffect(() => {
    if (document.querySelector('link[data-ln-fuentes="1"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FUENTES;
    link.setAttribute("data-ln-fuentes", "1");
    document.head.appendChild(link);
  }, []);

  const vars = oscuro
    ? {
        "--ln-bg": "#0e0e0f",
        "--ln-bg2": "#141416",
        "--ln-card": "#1a1a1d",
        "--ln-txt": "#f4f1ea",
        "--ln-mut": "#a7a29a",
        "--ln-borde": "rgba(255,255,255,.09)",
        "--ln-serif": "'Playfair Display', Georgia, serif",
      }
    : {
        "--ln-bg": "#faf9f7",
        "--ln-bg2": "#ffffff",
        "--ln-card": "#ffffff",
        "--ln-txt": "#1b1a19",
        "--ln-mut": "#6c6862",
        "--ln-borde": "#ece8e2",
        "--ln-serif": "'DM Serif Display', Georgia, serif",
      };
  vars["--ln-acc"] = acento;
  vars["--ln-acc-txt"] = textoSobre(acento);
  vars["--ln-acc-suave"] = oscuro ? mezclar(acento, "#0e0e0f", 0.82) : mezclar(acento, "#ffffff", 0.88);

  const rubro = RUBROS[String(empresa.rubro || empresa.tipo || "").toLowerCase().trim()] || "";
  const ciudad = String(empresa.ciudad || "").trim();
  const reservar = () => navigate(`/${slug}/reservar`);
  const irA = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const instagram = urlInstagram(empresa.redes?.instagram);
  const whatsapp = telefonoWhatsapp(empresa.telefono);
  const mostrarLogo = empresa.logo && empresa.configuracion?.mostrarLogo !== false;

  // Filtro por categoría igual que al reservar: Todos · categorías · Otros
  const idCategoria = (s) => (s.categoria ? String(s.categoria._id || s.categoria) : null);
  const categorias = useMemo(() => {
    const conServicios = new Set(servicios.map(idCategoria).filter(Boolean));
    const base =
      categoriasApi && categoriasApi.length
        ? categoriasApi.map((c) => ({ id: String(c._id), nombre: c.nombre }))
        : [...new Map(servicios.filter((s) => s.categoria?.nombre).map((s) => [idCategoria(s), s.categoria])).entries()]
            .sort((a, b) => (a[1].orden ?? 999) - (b[1].orden ?? 999))
            .map(([id, c]) => ({ id, nombre: c.nombre }));
    return base.filter((c) => conServicios.has(c.id));
  }, [servicios, categoriasApi]);
  const haySinCategoria = servicios.some((s) => !idCategoria(s));
  const serviciosVisibles =
    categoria === "todas"
      ? servicios
      : categoria === "otros"
        ? servicios.filter((s) => !idCategoria(s))
        : servicios.filter((s) => idCategoria(s) === categoria);
  const destacados = servicios.slice(0, 4);
  const desde = servicios.length ? Math.min(...servicios.map((s) => Number(s.precioFinal ?? s.precio) || 0).filter(Boolean)) : 0;

  const marca = mostrarLogo ? (
    <img src={empresa.logo} alt={`Logo de ${empresa.nombre}`} className="ln-logo" />
  ) : (
    <span className="ln-logo ln-logo-ini">{iniciales(empresa.nombre)}</span>
  );

  return (
    <div className={`ln ${oscuro ? "ln-oscuro" : "ln-claro"}`} style={vars}>
      <style>{CSS}</style>

      {/* ───── NAV ───── */}
      <nav className="ln-nav">
        <div className="ln-wrap ln-nav-in">
          <button type="button" className="ln-marca" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            {marca}
            <span>{empresa.nombre}</span>
          </button>
          <div className="ln-menu">
            <button type="button" onClick={() => irA("servicios")}>Servicios</button>
            {profesionales.length > 0 && <button type="button" onClick={() => irA("equipo")}>Equipo</button>}
            {empresa.giftcards?.activa && <button type="button" onClick={() => navigate(`/${slug}/regalar`)}>Giftcards</button>}
            <button type="button" onClick={() => irA("ubicacion")}>Ubicación</button>
          </div>
          <div className="ln-nav-acc">
            <button type="button" className="ln-link" onClick={() => navigate(`/${slug}/login`)}>Iniciar sesión</button>
            <button type="button" className="ln-btn" onClick={reservar}>Reservar hora</button>
          </div>
        </div>
      </nav>

      {/* ───── PORTADA ───── */}
      <header className="ln-hero">
        <div className="ln-hero-fondo" />
        <div className="ln-wrap ln-hero-in">
          <div className="ln-hero-txt">
            {(rubro || ciudad) && <div className="ln-eyebrow">{[rubro, ciudad].filter(Boolean).join(" · ")}</div>}
            <h1 className="ln-h1">{empresa.nombre}</h1>
            <p className="ln-lead">
              {empresa.mensajeBienvenida || empresa.descripcion || "Reserva tu hora online en menos de un minuto, sin llamadas ni esperas."}
            </p>
            <div className="ln-cta">
              <button type="button" className="ln-btn ln-btn-lg" onClick={reservar}>Reservar mi hora</button>
              <button type="button" className="ln-btn-sec ln-btn-lg" onClick={() => irA("servicios")}>Ver servicios</button>
            </div>
            <div className="ln-datos">
              <div><b>24/7</b><span>reserva online</span></div>
              {desde > 0 && <div><b>Desde {clp(desde)}</b><span>{servicios.length} servicios</span></div>}
              {empresa.horarios && <div><b>Horario</b><span>{empresa.horarios}</span></div>}
            </div>
          </div>
          {destacados.length > 0 && (
            <div className={`ln-destacados ${mostrarLogo ? "con-logo" : ""}`}>
              {mostrarLogo && (
                <div className="ln-dest-logo">
                  <img src={empresa.logo} alt={`Logo de ${empresa.nombre}`} />
                </div>
              )}
              <div className="ln-destacados-tit">
                <span className="ln-eyebrow">Servicios</span>
                <span className="ln-mut ln-small">{servicios.length} en total</span>
              </div>
              {destacados.map((s) => {
                const conPromo = Number(s.precioFinal) < Number(s.precio);
                return (
                  <button type="button" key={s._id} className="ln-dest" onClick={reservar}>
                    <span className="ln-dest-txt">
                      <b>{s.nombre}</b>
                      {duracionTexto(s) && <small>{duracionTexto(s)}</small>}
                    </span>
                    <strong>{clp(conPromo ? s.precioFinal : s.precio)}</strong>
                  </button>
                );
              })}
              <div className="ln-destacados-pie">
                <button type="button" className="ln-link" onClick={() => irA("servicios")}>Ver todos →</button>
                <button type="button" className="ln-btn" onClick={reservar}>Reservar</button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ───── SERVICIOS ───── */}
      <section id="servicios" className="ln-sec">
        <div className="ln-wrap">
          <div className="ln-tit">
            <div>
              <div className="ln-eyebrow">Servicios</div>
              <h2 className="ln-h2">Precios claros, sin sorpresas</h2>
            </div>
            <button type="button" className="ln-btn-sec" onClick={reservar}>Reservar</button>
          </div>

          {categorias.length + (haySinCategoria ? 1 : 0) > 1 && (
            <div className="ln-chips">
              {[{ id: "todas", nombre: "Todos" }, ...categorias, ...(haySinCategoria ? [{ id: "otros", nombre: "Otros" }] : [])].map((c) => (
                <button key={c.id} type="button" className={categoria === c.id ? "activo" : ""} onClick={() => setCategoria(c.id)}>
                  {c.nombre}
                </button>
              ))}
            </div>
          )}

          {servicios.length === 0 ? (
            <p className="ln-mut">Pronto vas a ver acá los servicios.</p>
          ) : (
            <div className="ln-servicios">
              {serviciosVisibles.map((s) => {
                const conPromo = Number(s.precioFinal) < Number(s.precio);
                const larga = String(s.descripcion || "").length > 110;
                return (
                  <div key={s._id} className="ln-serv">
                    <div className="ln-serv-txt">
                      <h3>{s.nombre}</h3>
                      {s.descripcion && <p className={larga ? "ln-recortado" : ""}>{s.descripcion}</p>}
                      <div className="ln-serv-meta">
                        {duracionTexto(s) && <span className="ln-dur">{duracionTexto(s)}</span>}
                        {larga && (
                          <button type="button" className="ln-link ln-acc ln-small" onClick={() => setDetalle(s)}>
                            Leer completo
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="ln-serv-precio">
                      {conPromo && <s>{clp(s.precio)}</s>}
                      <strong>{clp(conPromo ? s.precioFinal : s.precio)}</strong>
                      {conPromo && s.descuento?.porcentaje ? <em>-{s.descuento.porcentaje}%</em> : null}
                      <button type="button" className="ln-serv-ir" onClick={reservar}>Reservar →</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ───── EQUIPO ───── */}
      {profesionales.length > 0 && (
        <section id="equipo" className="ln-sec ln-sec-alt">
          <div className="ln-wrap">
            <div className="ln-tit">
              <div>
                <div className="ln-eyebrow">Equipo</div>
                <h2 className="ln-h2">Quién te atiende</h2>
              </div>
            </div>
            <div className={`ln-equipo ${profesionales.length === 1 ? "uno" : profesionales.length === 2 ? "dos" : ""}`}>
              {profesionales.map((p) => {
                const foto = p.perfilProfesional?.fotoPerfil?.url;
                const esp = p.perfilProfesional?.especialidades || [];
                const anios = p.perfilProfesional?.aniosExperiencia;
                return (
                  <div key={p._id} className="ln-pro">
                    <div className="ln-pro-foto">
                      {foto ? <img src={foto} alt={`${p.nombre} ${p.apellido || ""}`.trim()} loading="lazy" /> : <span>{iniciales(`${p.nombre} ${p.apellido || ""}`)}</span>}
                    </div>
                    <div className="ln-pro-txt">
                      <h3>{p.nombre} {p.apellido}</h3>
                      {anios ? <div className="ln-mut ln-small">{anios} {anios === 1 ? "año" : "años"} de experiencia</div> : null}
                      {esp.length > 0 && (
                        <div className="ln-tags">
                          {esp.slice(0, 3).map((e) => <span key={e}>{e}</span>)}
                        </div>
                      )}
                      {p.descripcion && <p>{p.descripcion}</p>}
                      {profesionales.length === 1 ? (
                        <div className="ln-pro-cta">
                          <button type="button" className="ln-btn ln-btn-lg" onClick={reservar}>Reservar con {p.nombre}</button>
                          {instagram && (
                            <a className="ln-btn-sec ln-btn-lg" href={instagram} target="_blank" rel="noopener noreferrer">Ver trabajos en Instagram</a>
                          )}
                        </div>
                      ) : (
                        <button type="button" className="ln-link ln-acc" onClick={reservar}>Reservar con {p.nombre} →</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ───── CÓMO RESERVAR ───── */}
      <section className="ln-sec">
        <div className="ln-wrap">
          <div className="ln-tit ln-tit-centro">
            <div>
              <div className="ln-eyebrow">Cómo reservar</div>
              <h2 className="ln-h2">Tu hora en 3 pasos</h2>
            </div>
          </div>
          <div className="ln-pasos">
            {[
              ["Elige tu servicio", "Ves el precio y cuánto dura antes de reservar."],
              ["Escoge día y hora", "Solo te mostramos las horas que de verdad están libres."],
              ["Listo", "Te llega la confirmación al correo, sin llamadas."],
            ].map(([t, d], i) => (
              <div key={t} className="ln-paso">
                <b>{i + 1}</b>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── GIFTCARDS ───── */}
      {empresa.giftcards?.activa && (
        <section className="ln-sec" style={{ paddingTop: 0 }}>
          <div className="ln-wrap">
            <div className="ln-gift">
              <div>
                <div className="ln-eyebrow">🎁 Giftcards</div>
                <h2 className="ln-h2">Regala {empresa.nombre}</h2>
                <p className="ln-mut">Un servicio o el monto que quieras, lista para enviar por correo o WhatsApp.</p>
              </div>
              <button type="button" className="ln-btn ln-btn-lg" onClick={() => navigate(`/${slug}/regalar`)}>Regalar una giftcard</button>
            </div>
          </div>
        </section>
      )}

      {/* ───── UBICACIÓN Y CONTACTO ───── */}
      <section id="ubicacion" className="ln-sec ln-sec-alt">
        <div className="ln-wrap ln-info">
          <div className="ln-caja">
            <div className="ln-eyebrow">Encuéntranos</div>
            <h2 className="ln-h2" style={{ fontSize: 32 }}>Te esperamos</h2>
            <ul className="ln-lista">
              {empresa.direccion && (
                <li>
                  <span>Dirección</span>
                  <b>{empresa.direccion}{ciudad && !empresa.direccion.toLowerCase().includes(ciudad.toLowerCase()) ? `, ${ciudad}` : ""}</b>
                </li>
              )}
              {empresa.horarios && <li><span>Horario</span><b>{empresa.horarios}</b></li>}
              {empresa.telefono && <li><span>Teléfono</span><b><a href={`tel:${empresa.telefono}`}>{empresa.telefono}</a></b></li>}
              {empresa.correo && <li><span>Correo</span><b><a href={`mailto:${empresa.correo}`}>{empresa.correo}</a></b></li>}
            </ul>
            <div className="ln-contacto">
              <button type="button" className="ln-btn" onClick={reservar}>Reservar mi hora</button>
              {whatsapp && (
                <a className="ln-btn-sec" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              )}
              {instagram && (
                <a className="ln-btn-sec" href={instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
              )}
            </div>
          </div>
          {empresa.direccion ? (
            <div className="ln-mapa">
              <iframe
                title={`Mapa de ${empresa.nombre}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(`${empresa.direccion}${ciudad ? `, ${ciudad}` : ""}, Chile`)}&z=16&output=embed`}
              />
              <a
                className="ln-mapa-ir"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${empresa.direccion}${ciudad ? `, ${ciudad}` : ""}, Chile`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Cómo llegar ↗
              </a>
            </div>
          ) : (
            <div className="ln-mapa ln-mapa-vacio">
              <div className="ln-emblema">{mostrarLogo ? <img src={empresa.logo} alt="" /> : <span>{iniciales(empresa.nombre)}</span>}</div>
            </div>
          )}
        </div>
      </section>

      {/* ───── PIE ───── */}
      <footer className="ln-pie">
        <div className="ln-wrap ln-pie-in">
          <div className="ln-marca" style={{ cursor: "default" }}>
            {marca}
            <span>{empresa.nombre}</span>
          </div>
          <div className="ln-mut ln-small">
            © {new Date().getFullYear()} {empresa.nombre} · Reservas con{" "}
            <a href="/" className="ln-acc">AgendaFonfach</a>
          </div>
        </div>
      </footer>

      <button type="button" className="ln-btn ln-fija" onClick={reservar}>Reservar mi hora</button>

      {/* ───── Descripción completa de un servicio ───── */}
      {detalle && (
        <div className="ln-modal-fondo" onClick={() => setDetalle(null)} role="presentation">
          <div className="ln-modal" role="dialog" aria-modal="true" aria-label={detalle.nombre} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="ln-modal-x" onClick={() => setDetalle(null)} aria-label="Cerrar">×</button>
            {detalle.categoria?.nombre && <div className="ln-eyebrow">{detalle.categoria.nombre}</div>}
            <h3 className="ln-h2" style={{ fontSize: 28, marginTop: 6 }}>{detalle.nombre}</h3>
            <div className="ln-modal-meta">
              <strong>{clp(Number(detalle.precioFinal) < Number(detalle.precio) ? detalle.precioFinal : detalle.precio)}</strong>
              {duracionTexto(detalle) && <span className="ln-dur" style={{ marginTop: 0 }}>{duracionTexto(detalle)}</span>}
            </div>
            <p className="ln-modal-desc">{detalle.descripcion}</p>
            <button type="button" className="ln-btn ln-btn-lg" style={{ width: "100%" }} onClick={reservar}>Reservar este servicio</button>
          </div>
        </div>
      )}
    </div>
  );
};

const CSS = `
.ln{background:var(--ln-bg);color:var(--ln-txt);font-family:Inter,system-ui,-apple-system,sans-serif;min-height:100vh;overflow-x:hidden}
.ln *{box-sizing:border-box}
.ln a{color:inherit;text-decoration:none}
.ln button{font-family:inherit}
.ln-wrap{max-width:1160px;margin:0 auto;padding:0 22px}
.ln-mut{color:var(--ln-mut)}
.ln-small{font-size:13px}
.ln-acc{color:var(--ln-acc)!important}
.ln-eyebrow{color:var(--ln-acc);font-size:12px;font-weight:700;letter-spacing:.24em;text-transform:uppercase}
.ln-h1{font-family:var(--ln-serif);font-weight:700;font-size:clamp(42px,6.4vw,82px);line-height:1.02;margin:14px 0 18px;letter-spacing:-.01em;color:var(--ln-txt)}
.ln-claro .ln-h1,.ln-claro .ln-h2{font-weight:400}
.ln-h2{font-family:var(--ln-serif);font-weight:700;font-size:clamp(30px,3.6vw,44px);line-height:1.1;margin:8px 0 0;color:var(--ln-txt)}
.ln-lead{color:var(--ln-mut);font-size:18px;line-height:1.65;max-width:540px;margin:0}
.ln-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--ln-acc);color:var(--ln-acc-txt)!important;border:0;font-weight:700;font-size:15px;padding:11px 22px;border-radius:999px;cursor:pointer;transition:transform .15s ease,box-shadow .15s ease}
.ln-btn:hover{transform:translateY(-1px);box-shadow:0 10px 24px -12px var(--ln-acc)}
.ln-btn-sec{display:inline-flex;align-items:center;justify-content:center;background:transparent;color:var(--ln-txt);border:1px solid var(--ln-borde);font-weight:600;font-size:15px;padding:11px 22px;border-radius:999px;cursor:pointer}
.ln-oscuro .ln-btn-sec{border-color:rgba(255,255,255,.28)}
.ln-btn-sec:hover{border-color:var(--ln-acc);color:var(--ln-acc)}
.ln-btn-lg{padding:14px 28px;font-size:16px}
.ln-link{background:none;border:0;padding:0;color:var(--ln-mut);font-weight:600;font-size:14px;cursor:pointer}
.ln-link:hover{color:var(--ln-txt)}
.ln-claro .ln-btn,.ln-claro .ln-btn-sec{border-radius:14px}

.ln-nav{position:sticky;top:0;z-index:20;background:var(--ln-bg);background:color-mix(in srgb,var(--ln-bg) 86%,transparent);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-bottom:1px solid var(--ln-borde)}
.ln-nav-in{display:flex;align-items:center;justify-content:space-between;height:70px;gap:16px}
.ln-marca{display:flex;align-items:center;gap:12px;background:none;border:0;padding:0;color:var(--ln-txt);font-weight:700;font-size:16px;cursor:pointer;min-width:0}
.ln-marca span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ln-logo{width:40px;height:40px;border-radius:50%;object-fit:cover;flex-shrink:0;background:#fff}
.ln-logo-ini{display:inline-grid;place-items:center;background:var(--ln-acc);color:var(--ln-acc-txt);font-size:14px;font-weight:800}
.ln-oscuro .ln-logo{box-shadow:0 0 0 1.5px var(--ln-acc)}
.ln-menu{display:flex;gap:26px}
.ln-menu button{background:none;border:0;color:var(--ln-mut);font-size:14px;font-weight:500;cursor:pointer;padding:0}
.ln-menu button:hover{color:var(--ln-txt)}
.ln-nav-acc{display:flex;align-items:center;gap:18px;flex-shrink:0}

.ln-hero{position:relative;overflow:hidden;padding:84px 0 96px}
.ln-hero-fondo{position:absolute;inset:0;pointer-events:none}
.ln-oscuro .ln-hero-fondo{background:radial-gradient(900px 500px at 78% 30%,color-mix(in srgb,var(--ln-acc) 22%,transparent),transparent 70%),repeating-linear-gradient(135deg,rgba(255,255,255,.025) 0 2px,transparent 2px 14px)}
.ln-claro .ln-hero-fondo{background:radial-gradient(800px 460px at 80% 20%,var(--ln-acc-suave),transparent 70%)}
.ln-hero-in{position:relative;display:grid;grid-template-columns:1.25fr .75fr;gap:48px;align-items:center}
.ln-cta{display:flex;gap:12px;flex-wrap:wrap;margin-top:30px}
.ln-datos{display:flex;gap:34px;flex-wrap:wrap;margin-top:42px}
.ln-datos div{display:flex;flex-direction:column;max-width:240px}
.ln-datos b{font-family:var(--ln-serif);font-size:20px;color:var(--ln-txt);font-weight:700}
.ln-claro .ln-datos b{font-weight:400}
.ln-datos span{color:var(--ln-mut);font-size:13px;margin-top:2px}
.ln-hero-emblema{display:flex;justify-content:center}
.ln-emblema{width:min(320px,80%);aspect-ratio:1;border-radius:50%;display:grid;place-items:center;position:relative;background:var(--ln-card);box-shadow:0 30px 70px -30px rgba(0,0,0,.55)}
.ln-emblema::before{content:"";position:absolute;inset:-14px;border-radius:50%;border:1px solid color-mix(in srgb,var(--ln-acc) 55%,transparent)}
.ln-emblema::after{content:"";position:absolute;inset:-30px;border-radius:50%;border:1px dashed color-mix(in srgb,var(--ln-acc) 30%,transparent)}
.ln-emblema img{width:72%;height:72%;object-fit:contain;border-radius:50%}
.ln-emblema span{font-family:var(--ln-serif);font-size:84px;color:var(--ln-acc)}

.ln-destacados{position:relative}
.ln-destacados.con-logo{margin-top:64px;padding-top:62px}
.ln-dest-logo{position:absolute;top:-58px;left:50%;transform:translateX(-50%);width:116px;height:116px;border-radius:50%;padding:5px;background:var(--ln-card);border:1px solid var(--ln-borde);box-shadow:0 18px 40px -18px rgba(0,0,0,.55)}
.ln-oscuro .ln-dest-logo{border:1.5px solid var(--ln-acc);background:#141416}
.ln-dest-logo img{width:100%;height:100%;border-radius:50%;object-fit:cover;background:#fff}
.ln-hero-logo{display:block;width:68px;height:68px;border-radius:50%;object-fit:cover;background:#fff;margin-bottom:22px;box-shadow:0 12px 30px -14px rgba(0,0,0,.5)}
.ln-oscuro .ln-hero-logo{box-shadow:0 0 0 1.5px var(--ln-acc),0 12px 30px -14px rgba(0,0,0,.8)}
.ln-destacados{background:var(--ln-card);border:1px solid var(--ln-borde);border-radius:24px;padding:22px;box-shadow:0 30px 70px -36px rgba(0,0,0,.55)}
@media (min-width:901px){.ln-hero-logo.solo-cel{display:none}}
.ln-oscuro .ln-destacados{background:rgba(26,26,29,.82);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.ln-destacados-tit{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px}
.ln-dest{display:flex;justify-content:space-between;align-items:center;gap:14px;width:100%;background:none;border:0;border-bottom:1px solid var(--ln-borde);padding:13px 0;text-align:left;color:var(--ln-txt);cursor:pointer}
.ln-dest:hover b{color:var(--ln-acc)}
.ln-dest-txt{display:flex;flex-direction:column;min-width:0}
.ln-dest-txt b{font-weight:600;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ln-dest-txt small{color:var(--ln-mut);font-size:12px;margin-top:2px}
.ln-dest strong{font-family:var(--ln-serif);color:var(--ln-acc);font-size:19px;white-space:nowrap;font-weight:700}
.ln-claro .ln-dest strong{font-weight:400}
.ln-destacados-pie{display:flex;justify-content:space-between;align-items:center;margin-top:16px}
.ln-recortado{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.ln-serv-meta{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:8px}
.ln-serv-meta .ln-dur{margin-top:0}
button.ln-serv-ir{background:none;border:0;padding:0;cursor:pointer;font-family:inherit}
.ln-modal-fondo{position:fixed;inset:0;z-index:50;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:18px}
.ln-modal{position:relative;width:100%;max-width:520px;max-height:88vh;overflow:auto;background:var(--ln-card);color:var(--ln-txt);border:1px solid var(--ln-borde);border-radius:24px;padding:30px}
.ln-modal-x{position:absolute;top:14px;right:16px;width:36px;height:36px;border-radius:50%;border:1px solid var(--ln-borde);background:transparent;color:var(--ln-txt);font-size:22px;line-height:1;cursor:pointer}
.ln-modal-meta{display:flex;align-items:center;gap:12px;margin:12px 0 4px}
.ln-modal-meta strong{font-family:var(--ln-serif);color:var(--ln-acc);font-size:26px}
.ln-modal-desc{color:var(--ln-mut);font-size:15px;line-height:1.7;white-space:pre-line;margin:12px 0 22px}
.ln-sec{padding:88px 0}
.ln-sec-alt{background:var(--ln-bg2);border-top:1px solid var(--ln-borde);border-bottom:1px solid var(--ln-borde)}
.ln-tit{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap;margin-bottom:34px}
.ln-tit-centro{justify-content:center;text-align:center}
.ln-chips{display:flex;flex-wrap:wrap;gap:8px;margin:-10px 0 26px}
.ln-chips button{border:1px solid var(--ln-borde);background:transparent;color:var(--ln-mut);border-radius:999px;padding:7px 15px;font-size:14px;font-weight:600;cursor:pointer}
.ln-chips button.activo{background:var(--ln-acc);border-color:var(--ln-acc);color:var(--ln-acc-txt)}

.ln-servicios{display:grid;grid-template-columns:repeat(2,1fr);gap:0 56px}
.ln-serv{display:flex;justify-content:space-between;gap:20px;text-align:left;background:none;border:0;border-bottom:1px solid var(--ln-borde);padding:22px 0;color:inherit;cursor:pointer;width:100%}
.ln-serv h3{font-size:18px;font-weight:600;margin:0;color:var(--ln-txt)}
.ln-serv p{color:var(--ln-mut);font-size:14px;line-height:1.55;margin:6px 0 0}
.ln-dur{display:inline-block;margin-top:8px;font-size:12px;color:var(--ln-mut);border:1px solid var(--ln-borde);border-radius:999px;padding:2px 10px}
.ln-serv-precio{display:flex;flex-direction:column;align-items:flex-end;white-space:nowrap;flex-shrink:0}
.ln-serv-precio strong{font-family:var(--ln-serif);font-size:24px;color:var(--ln-acc);font-weight:700}
.ln-claro .ln-serv-precio strong{font-weight:400}
.ln-serv-precio s{color:var(--ln-mut);font-size:13px}
.ln-serv-precio em{font-style:normal;font-size:11px;font-weight:700;background:var(--ln-acc-suave);color:var(--ln-acc);border-radius:999px;padding:1px 8px;margin-top:2px}
.ln-serv-ir{font-size:12px;color:var(--ln-mut);margin-top:6px;opacity:0;transition:opacity .15s}
.ln-serv:hover .ln-serv-ir{opacity:1;color:var(--ln-acc)}
.ln-serv:hover h3{color:var(--ln-acc)}
.ln-claro .ln-servicios{grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px}
.ln-claro .ln-serv{flex-direction:column;background:var(--ln-card);border:1px solid var(--ln-borde);border-radius:20px;padding:22px;transition:box-shadow .15s,border-color .15s}
.ln-claro .ln-serv:hover{border-color:var(--ln-acc);box-shadow:0 18px 40px -26px var(--ln-acc)}
.ln-claro .ln-serv-precio{flex-direction:row;align-items:baseline;gap:8px;margin-top:auto;padding-top:10px;flex-wrap:wrap}
.ln-claro .ln-serv-ir{opacity:1;margin:0 0 0 auto;color:var(--ln-acc);font-weight:600}

.ln-equipo{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:22px}
.ln-pro{background:var(--ln-card);border:1px solid var(--ln-borde);border-radius:22px;overflow:hidden;display:flex;flex-direction:column}
.ln-pro-foto{aspect-ratio:4/4.2;background:var(--ln-acc-suave);display:grid;place-items:center;overflow:hidden}
.ln-pro-foto img{width:100%;height:100%;object-fit:cover}
.ln-pro-foto span{font-family:var(--ln-serif);font-size:64px;color:var(--ln-acc)}
.ln-pro-txt{padding:18px 20px 20px;display:flex;flex-direction:column;gap:6px;flex:1}
.ln-pro-txt h3{font-size:18px;font-weight:700;margin:0;color:var(--ln-txt)}
.ln-pro-txt p{color:var(--ln-mut);font-size:14px;line-height:1.5;margin:4px 0 6px}
.ln-pro-txt .ln-link{margin-top:auto;text-align:left}
.ln-equipo.uno{grid-template-columns:1fr}
.ln-equipo.uno .ln-pro{flex-direction:row;max-width:980px}
.ln-equipo.uno .ln-pro-foto{width:40%;flex-shrink:0;aspect-ratio:auto;min-height:380px}
.ln-equipo.uno .ln-pro-txt{padding:38px 40px;justify-content:center;gap:10px}
.ln-equipo.uno .ln-pro-txt h3{font-family:var(--ln-serif);font-size:34px;font-weight:700}
.ln-claro .ln-equipo.uno .ln-pro-txt h3{font-weight:400}
.ln-equipo.uno .ln-pro-txt p{font-size:16px;line-height:1.7;margin:8px 0 10px}
.ln-pro-cta{display:flex;gap:10px;flex-wrap:wrap;margin-top:6px}
.ln-equipo.dos{grid-template-columns:repeat(2,1fr)}
.ln-equipo.dos .ln-pro{flex-direction:row}
.ln-equipo.dos .ln-pro-foto{width:42%;flex-shrink:0;aspect-ratio:auto;min-height:260px}
.ln-tags{display:flex;flex-wrap:wrap;gap:6px}
.ln-tags span{font-size:12px;background:var(--ln-acc-suave);color:var(--ln-acc);border-radius:999px;padding:3px 10px;font-weight:600}

.ln-pasos{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.ln-paso{background:var(--ln-card);border:1px solid var(--ln-borde);border-radius:20px;padding:26px}
.ln-paso b{display:inline-grid;place-items:center;width:36px;height:36px;border-radius:50%;background:var(--ln-acc);color:var(--ln-acc-txt);margin-bottom:12px}
.ln-paso h3{font-size:17px;font-weight:700;margin:0;color:var(--ln-txt)}
.ln-paso p{color:var(--ln-mut);font-size:14px;line-height:1.55;margin:6px 0 0}

.ln-gift{display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap;border-radius:26px;padding:42px;border:1px solid color-mix(in srgb,var(--ln-acc) 35%,transparent);background:linear-gradient(120deg,var(--ln-acc-suave),var(--ln-card))}
.ln-gift p{margin:8px 0 0;max-width:520px}

.ln-info{display:grid;grid-template-columns:1fr 1.1fr;gap:28px;align-items:stretch}
.ln-caja{background:var(--ln-card);border:1px solid var(--ln-borde);border-radius:22px;padding:30px}
.ln-lista{list-style:none;padding:0;margin:20px 0 0}
.ln-lista li{display:flex;justify-content:space-between;gap:16px;padding:11px 0;border-bottom:1px solid var(--ln-borde);font-size:15px}
.ln-lista span{color:var(--ln-mut)}
.ln-lista b{font-weight:500;text-align:right;color:var(--ln-txt)}
.ln-contacto{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}
.ln-mapa{position:relative;border-radius:22px;overflow:hidden;min-height:340px;border:1px solid var(--ln-borde);background:var(--ln-card)}
.ln-mapa iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.ln-oscuro .ln-mapa iframe{filter:grayscale(.6) invert(.92) hue-rotate(180deg)}
.ln-mapa-ir{position:absolute;right:14px;bottom:14px;background:var(--ln-acc);color:var(--ln-acc-txt)!important;font-weight:700;font-size:14px;padding:9px 16px;border-radius:999px}
.ln-mapa-vacio{display:grid;place-items:center}

.ln-pie{padding:34px 0 40px;border-top:1px solid var(--ln-borde)}
.ln-pie-in{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}
.ln-fija{display:none}

@media (max-width:900px){
  .ln-menu{display:none}
  .ln-hero{padding:48px 0 64px}
  .ln-hero-in{grid-template-columns:1fr;gap:28px}
  .ln-hero-emblema{order:-1;justify-content:flex-start;padding:22px 0 0 22px}
  .ln-emblema{width:120px}
  .ln-emblema::after{inset:-18px}.ln-emblema::before{inset:-8px}
  .ln-emblema span{font-size:40px}
  .ln-servicios,.ln-info,.ln-pasos,.ln-equipo.dos{grid-template-columns:1fr}
  .ln-destacados{display:none}
  .ln-equipo.uno .ln-pro,.ln-equipo.dos .ln-pro{flex-direction:column}
  .ln-equipo.uno .ln-pro-foto,.ln-equipo.dos .ln-pro-foto{width:100%;min-height:0;aspect-ratio:4/3.6}
  .ln-equipo.uno .ln-pro-txt{padding:24px}
  .ln-equipo.uno .ln-pro-txt h3{font-size:28px}
  .ln-sec{padding:60px 0}
  .ln-gift{padding:28px}
}
@media (max-width:600px){
  .ln-nav-acc .ln-link{display:none}
  .ln-nav-acc .ln-btn{padding:9px 16px;font-size:14px}
  .ln-datos{gap:20px}
  .ln-fija{display:flex;position:fixed;left:14px;right:14px;bottom:14px;z-index:30;padding:15px;font-size:16px;box-shadow:0 14px 34px -10px rgba(0,0,0,.55)}
  .ln-pie{padding-bottom:96px}
  .ln-serv-ir{opacity:1}
}
`;

export default LandingNegocio;

import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Col, Container, Row } from "reactstrap";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import IconoRestaurante from "./IconosRestaurante";
import "./landingRestaurante.css";
import {
  COLORES_RESTAURANTE_DEFAULT,
  cargarFuentesRestaurante,
  marcaDe,
  variablesColores,
} from "utils/marcasRestaurante";

/** Hace aparecer suavemente los elementos .lr-aparece al entrar en pantalla. */
const useAparicion = () => {
  const raiz = useRef(null);
  useEffect(() => {
    const nodos = raiz.current?.querySelectorAll(".lr-aparece") || [];
    if (!("IntersectionObserver" in window)) {
      nodos.forEach((n) => n.classList.add("visible"));
      return undefined;
    }
    const obs = new IntersectionObserver(
      (entradas) =>
        entradas.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.15 },
    );
    nodos.forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, []);
  return raiz;
};

const Adorno = () => (
  <div className="lr-adorno" aria-hidden="true">
    <svg width="14" height="14" viewBox="0 0 14 14">
      <path d="M7 0l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="currentColor" />
    </svg>
  </div>
);

/**
 * Landing de bares y restaurantes (rubro "restaurante"). Su objetivo es que
 * el visitante reserve mesa o vea la carta. El contenido sale de
 * utils/marcasRestaurante.js (identidad de cada local) y de los datos de la
 * empresa; lo que no está en ninguno de los dos no se muestra.
 */
const LandingRestaurante = ({ empresa, slug }) => {
  const marca = marcaDe(empresa);
  const colores = marca?.colores || COLORES_RESTAURANTE_DEFAULT;
  const logo = marca?.logo || empresa?.logo || null;
  const raiz = useAparicion();
  const [solida, setSolida] = useState(false);
  // El botón fijo del celular aparece recién cuando el del hero ya no se ve
  const [flotante, setFlotante] = useState(false);

  useEffect(() => {
    cargarFuentesRestaurante();
    const onScroll = () => {
      setSolida(window.scrollY > 60);
      setFlotante(window.scrollY > window.innerHeight * 0.75);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const urlReserva = `/${slug}/reservar-mesa`;
  const telefonoLimpio = (empresa?.telefono || "").replace(/\D/g, "");
  const horario = marca?.horario || empresa?.horarios || "";
  const ubicacion = empresa?.direccion || marca?.ciudad || "";
  const mapa = marca?.mapaBusqueda || empresa?.direccion;
  const urlMapa = mapa ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapa)}` : null;
  const destacados = marca?.destacados || [];
  const esPetFriendly = destacados.some((d) => d.icono === "huella");
  const fotos = marca?.fotos || [];

  return (
    <div className="lr" ref={raiz} style={variablesColores(colores)}>
      {/* ───────── Barra superior ───────── */}
      <nav className={`lr-nav${solida ? " solida" : ""}`}>
        <Container className="lr-nav-inner">
          <a href="#inicio" className="lr-nav-marca">
            {logo && <img src={logo} alt={empresa.nombre} />}
            <span>{empresa.nombre}</span>
          </a>
          <div className="lr-nav-links">
            {destacados.length > 0 && (
              <a href="#experiencia" className="lr-solo-escritorio">
                Experiencia
              </a>
            )}
            {marca?.cartaUrl && (
              <a href="#carta" className="lr-solo-escritorio">
                Carta
              </a>
            )}
            <a href="#visitanos" className="lr-solo-escritorio">
              Visítanos
            </a>
            <Link to={urlReserva} className="lr-btn lr-btn-primario lr-btn-chico">
              Reservar
            </Link>
          </div>
        </Container>
      </nav>

      {/* ───────── Hero ───────── */}
      <header
        id="inicio"
        className="lr-hero"
        style={marca?.fondoHero ? { backgroundImage: `url(${marca.fondoHero})` } : undefined}
      >
        <Container>
          {logo && <img src={logo} alt={`Logo de ${empresa.nombre}`} className="lr-hero-logo" />}
          <div>
            <span className="lr-eyebrow">{marca?.ciudad || empresa.nombre}</span>
          </div>
          {marca?.lema ? (
            <h1>
              {marca.lema.split(" y ")[0]}
              {marca.lema.includes(" y ") && (
                <>
                  <br />
                  <em>y {marca.lema.split(" y ").slice(1).join(" y ")}</em>
                </>
              )}
            </h1>
          ) : (
            <h1>{empresa.nombre}</h1>
          )}
          {(empresa.mensajeBienvenida || empresa.descripcion) && (
            <p className="lr-hero-sub">{empresa.mensajeBienvenida || empresa.descripcion}</p>
          )}
          {!empresa.mensajeBienvenida && !empresa.descripcion && (
            <p className="lr-hero-sub">Reserva tu mesa en línea en menos de un minuto.</p>
          )}
          <div className="lr-hero-acciones">
            <Link to={urlReserva} className="lr-btn lr-btn-primario">
              <IconoRestaurante nombre="calendario" size={18} /> Reservar mesa
            </Link>
            {marca?.cartaUrl && (
              <a href={marca.cartaUrl} target="_blank" rel="noreferrer" className="lr-btn lr-btn-linea">
                <IconoRestaurante nombre="carta" size={18} /> Ver la carta
              </a>
            )}
          </div>
        </Container>
        <span className="lr-scroll" aria-hidden="true" />
      </header>

      {/* ───────── Franja de datos ───────── */}
      {(horario || ubicacion || esPetFriendly) && (
        <div className="lr-franja">
          <Container className="lr-franja-items">
            {horario && (
              <span className="lr-franja-item">
                <IconoRestaurante nombre="reloj" size={22} className="lr-ico" /> {horario}
              </span>
            )}
            {ubicacion && (
              <span className="lr-franja-item">
                <IconoRestaurante nombre="ubicacion" size={22} className="lr-ico" /> {ubicacion}
              </span>
            )}
            {esPetFriendly && (
              <span className="lr-franja-item">
                <IconoRestaurante nombre="huella" size={22} className="lr-ico" /> Pet friendly
              </span>
            )}
          </Container>
        </div>
      )}

      {/* ───────── Experiencia ───────── */}
      {destacados.length > 0 && (
        <section id="experiencia" className="lr-seccion">
          <Container>
            <div className="lr-titulo lr-aparece">
              <span className="lr-eyebrow">La experiencia</span>
              <h2>Lo que te espera en {empresa.nombre}</h2>
              <Adorno />
            </div>
            <Row className="justify-content-center">
              {destacados.map((d, i) => (
                <Col key={d.titulo} md="4" className="mb-4 lr-aparece" style={{ transitionDelay: `${i * 0.12}s` }}>
                  <div className="lr-tarjeta">
                    <IconoRestaurante nombre={d.icono} size={56} className="lr-ico" />
                    <h3>{d.titulo}</h3>
                    {d.texto && <p>{d.texto}</p>}
                  </div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      )}

      {/* ───────── Galería (cuando haya fotos reales) ───────── */}
      {fotos.length > 0 && (
        <section className="lr-seccion lr-seccion-alterna">
          <Container>
            <div className="lr-galeria lr-aparece">
              {fotos.map((f, i) => (
                <img key={i} src={f.src || f} alt={f.alt || `${empresa.nombre} ${i + 1}`} loading="lazy" />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ───────── Carta ───────── */}
      {marca?.cartaUrl && (
        <section id="carta" className="lr-seccion lr-seccion-alterna">
          <Container>
            <div className="lr-carta lr-aparece">
              <IconoRestaurante nombre="carta" size={52} className="lr-ico" />
              <span className="lr-eyebrow d-block">Nuestra carta</span>
              <h2>Cócteles y cocina del mundo</h2>
              <p>Revisa la carta completa antes de venir.</p>
              <a href={marca.cartaUrl} target="_blank" rel="noreferrer" className="lr-btn lr-btn-primario">
                Ver la carta digital
              </a>
            </div>
          </Container>
        </section>
      )}

      {/* ───────── Cómo reservar ───────── */}
      <section id="reservas" className="lr-seccion">
        <Container>
          <div className="lr-titulo lr-aparece">
            <span className="lr-eyebrow">Reservas</span>
            <h2>Asegura tu mesa en tres pasos</h2>
            <Adorno />
          </div>
          <Row className="lr-aparece">
            <Col md="4" className="mb-4">
              <div className="lr-paso">
                <div className="lr-paso-num">1</div>
                <h3>Elige día y personas</h3>
                <p>Ves al instante las horas con lugar disponible.</p>
              </div>
            </Col>
            <Col md="4" className="mb-4">
              <div className="lr-paso">
                <div className="lr-paso-num">2</div>
                <h3>Escoge hora y sector</h3>
                <p>Selecciona el horario y el espacio que prefieras.</p>
              </div>
            </Col>
            <Col md="4" className="mb-4">
              <div className="lr-paso">
                <div className="lr-paso-num">3</div>
                <h3>Recibe la confirmación</h3>
                <p>Te llega por correo, sin crear cuenta.</p>
              </div>
            </Col>
          </Row>
          <div className="text-center lr-aparece">
            <Link to={urlReserva} className="lr-btn lr-btn-primario">
              Reservar mesa
            </Link>
            <div>
              <span className="lr-nota">
                <IconoRestaurante nombre="pastel" size={24} className="lr-ico" />
                ¿Celebras un cumpleaños? Cuéntanos al reservar.
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* ───────── Visítanos ───────── */}
      <section id="visitanos" className="lr-seccion lr-seccion-alterna">
        <Container>
          <div className="lr-titulo lr-aparece">
            <span className="lr-eyebrow">Visítanos</span>
            <h2>Te esperamos</h2>
            <Adorno />
          </div>
          <Row className="align-items-stretch">
            <Col lg="6" className="mb-4 lr-aparece">
              {horario && (
                <div className="lr-dato">
                  <IconoRestaurante nombre="reloj" size={30} className="lr-ico" />
                  <div>
                    <div className="lr-dato-label">Horario</div>
                    <div className="lr-dato-valor">{horario}</div>
                  </div>
                </div>
              )}
              {ubicacion && (
                <div className="lr-dato">
                  <IconoRestaurante nombre="ubicacion" size={30} className="lr-ico" />
                  <div>
                    <div className="lr-dato-label">Dónde</div>
                    <div className="lr-dato-valor">{ubicacion}</div>
                    {urlMapa && (
                      <a href={urlMapa} target="_blank" rel="noreferrer" className="lr-btn lr-btn-linea lr-btn-chico mt-3">
                        Cómo llegar
                      </a>
                    )}
                  </div>
                </div>
              )}
              {empresa?.telefono && (
                <div className="lr-dato">
                  <IconoRestaurante nombre="telefono" size={30} className="lr-ico" />
                  <div>
                    <div className="lr-dato-label">Teléfono</div>
                    <a className="lr-dato-valor d-block" href={`tel:${telefonoLimpio}`}>
                      {empresa.telefono}
                    </a>
                  </div>
                </div>
              )}
              {(telefonoLimpio || empresa?.redes?.instagram) && (
                <div className="d-flex flex-wrap pt-4" style={{ gap: 12 }}>
                  {telefonoLimpio && (
                    <a href={`https://wa.me/${telefonoLimpio}`} target="_blank" rel="noreferrer" className="lr-btn lr-btn-linea lr-btn-chico">
                      <FaWhatsapp /> WhatsApp
                    </a>
                  )}
                  {empresa?.redes?.instagram && (
                    <a href={empresa.redes.instagram} target="_blank" rel="noreferrer" className="lr-btn lr-btn-linea lr-btn-chico">
                      <FaInstagram /> Instagram
                    </a>
                  )}
                </div>
              )}
            </Col>
            <Col lg="6" className="mb-4 lr-aparece">
              <div
                className="lr-visita-cta"
                style={marca?.fondoHero ? { backgroundImage: `url(${marca.fondoHero})` } : undefined}
              >
                <IconoRestaurante nombre="coctel" size={52} className="lr-ico mb-3" />
                <h3>Reserva tu mesa</h3>
                <p>Elige el día y la hora, y te confirmamos por correo.</p>
                <Link to={urlReserva} className="lr-btn lr-btn-primario">
                  Reservar ahora
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ───────── Pie ───────── */}
      <footer className="lr-pie">
        <Container>
          {logo && <img src={logo} alt={empresa.nombre} />}
          <small>
            {empresa.nombre}
            {marca?.ciudad ? ` · ${marca.ciudad}` : ""}
          </small>
          <small className="mt-2">Reservas con Agenda Fonfach</small>
          <a href={`/${slug}/login`} className="d-inline-block mt-3">
            Acceso del equipo
          </a>
        </Container>
      </footer>

      {/* Botón fijo en celular */}
      <div className={`lr-flotante${flotante ? " visible" : ""}`}>
        <Link to={urlReserva} className="lr-btn lr-btn-primario">
          <IconoRestaurante nombre="calendario" size={18} /> Reservar mesa
        </Link>
      </div>
    </div>
  );
};

export default LandingRestaurante;

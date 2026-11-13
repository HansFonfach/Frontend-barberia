import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Container } from "reactstrap";
import { axiosPublic } from "api/axiosPublic";
import { EmpresaCard } from "views/publico/NegociosConfianza";
import { SITIO, useSeo } from "utils/seo";

/**
 * Directorio público por ciudad y rubro:
 *   /negocios                     → todos
 *   /negocios/ovalle              → negocios en Ovalle
 *   /negocios/ovalle/barberias    → barberías en Ovalle
 * Sirve para que Google muestre los negocios en búsquedas como
 * "barbería Ovalle". Cada ficha lleva a la página de siempre del negocio.
 */

const AZUL = "#4361ee";

const Chip = ({ to, activo, children }) => (
  <Link
    to={to}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "8px 16px",
      borderRadius: 999,
      fontSize: 14,
      fontWeight: 600,
      border: `1px solid ${activo ? "#12131a" : "#e5e7eb"}`,
      background: activo ? "#12131a" : "#fff",
      color: activo ? "#fff" : "#374151",
      textDecoration: "none",
    }}
  >
    {children}
  </Link>
);

const Directorio = () => {
  const { ciudad: ciudadSlug, rubro: rubroSlug } = useParams();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let vigente = true;
    axiosPublic
      .get("/seo/directorio")
      .then(({ data }) => vigente && setDatos(data))
      .catch(() => vigente && setError(true));
    return () => {
      vigente = false;
    };
  }, []);

  const ciudad = datos?.ciudades?.find((c) => c.slug === ciudadSlug);
  const rubro = ciudad?.rubros?.find((r) => r.slug === rubroSlug);
  const noExiste = !!datos && ((ciudadSlug && !ciudad) || (rubroSlug && !rubro));

  const negocios = useMemo(() => {
    let lista = datos?.negocios || [];
    if (ciudadSlug) lista = lista.filter((n) => n.ciudadSlug === ciudadSlug);
    if (rubroSlug) lista = lista.filter((n) => n.rubroSlug === rubroSlug);
    return lista;
  }, [datos, ciudadSlug, rubroSlug]);

  const h1 = rubro
    ? `${rubro.nombre} en ${ciudad.nombre}`
    : ciudad
      ? `Negocios en ${ciudad.nombre}`
      : "Negocios con reserva online";
  const subtitulo = rubro
    ? `Reserva tu hora online en ${rubro.nombre.toLowerCase()} de ${ciudad.nombre}: revisa servicios, precios y horarios.`
    : ciudad
      ? `Barberías, salones, gimnasios y más negocios de ${ciudad.nombre} donde puedes reservar online.`
      : "Encuentra negocios por ciudad y reserva online en menos de un minuto.";

  const url = `${SITIO}/negocios${ciudadSlug ? `/${ciudadSlug}` : ""}${rubroSlug ? `/${rubroSlug}` : ""}`;
  const migas = [
    { nombre: "Inicio", url: `${SITIO}/`, to: "/" },
    { nombre: "Negocios", url: `${SITIO}/negocios`, to: "/negocios" },
    ...(ciudad ? [{ nombre: ciudad.nombre, url: `${SITIO}/negocios/${ciudad.slug}`, to: `/negocios/${ciudad.slug}` }] : []),
    ...(rubro ? [{ nombre: rubro.nombre, url, to: `/negocios/${ciudad.slug}/${rubro.slug}` }] : []),
  ];

  useSeo(
    datos
      ? {
          titulo: noExiste ? "No encontramos esa página | AgendaFonfach" : `${h1} · Reserva online | AgendaFonfach`,
          descripcion: subtitulo,
          canonical: url,
          noIndexar: noExiste || negocios.length === 0,
          jsonLd: noExiste
            ? null
            : {
                "@context": "https://schema.org",
                "@graph": [
                  {
                    "@type": "BreadcrumbList",
                    itemListElement: migas.map((m, i) => ({ "@type": "ListItem", position: i + 1, name: m.nombre, item: m.url })),
                  },
                  {
                    "@type": "ItemList",
                    name: h1,
                    itemListElement: negocios.map((n, i) => ({
                      "@type": "ListItem",
                      position: i + 1,
                      name: n.nombre,
                      url: `${SITIO}/${n.slug}`,
                    })),
                  },
                ],
              },
        }
      : {},
  );

  const chips = ciudad ? (
    <>
      <Chip to={`/negocios/${ciudad.slug}`} activo={!rubroSlug}>
        Todos <small style={{ opacity: 0.6 }}>{ciudad.total}</small>
      </Chip>
      {ciudad.rubros.map((r) => (
        <Chip key={r.slug} to={`/negocios/${ciudad.slug}/${r.slug}`} activo={r.slug === rubroSlug}>
          {r.nombre} <small style={{ opacity: 0.6 }}>{r.total}</small>
        </Chip>
      ))}
    </>
  ) : (
    (datos?.ciudades || []).map((c) => (
      <Chip key={c.slug} to={`/negocios/${c.slug}`}>
        📍 {c.nombre} <small style={{ opacity: 0.6 }}>{c.total}</small>
      </Chip>
    ))
  );

  return (
    <div style={{ minHeight: "100vh", background: "#fff", color: "#12131a" }}>
      <header style={{ borderBottom: "1px solid #eef0f4" }}>
        <Container className="d-flex align-items-center justify-content-between" style={{ height: 64 }}>
          <Link to="/" style={{ fontWeight: 800, fontSize: 18, color: "#12131a", textDecoration: "none" }}>
            Agenda<span style={{ color: AZUL }}>Fonfach</span>
          </Link>
          <Link to="/registro-negocio" style={{ fontSize: 14, fontWeight: 600, color: AZUL }}>
            Registra tu negocio
          </Link>
        </Container>
      </header>

      <section style={{ background: "linear-gradient(180deg, #f7f8fb 0%, #ffffff 100%)", padding: "40px 0 28px" }}>
        <Container>
          <nav aria-label="Ruta" style={{ fontSize: 13, color: "#6b7280", marginBottom: 14 }}>
            {migas.map((m, i) => (
              <span key={m.to}>
                {i > 0 && <span style={{ margin: "0 6px" }}>›</span>}
                {i < migas.length - 1 ? (
                  <Link to={m.to} style={{ color: "#6b7280" }}>
                    {m.nombre}
                  </Link>
                ) : (
                  <span style={{ color: "#12131a" }}>{m.nombre}</span>
                )}
              </span>
            ))}
          </nav>
          <h1 style={{ fontWeight: 800, fontSize: "clamp(1.9rem, 4vw, 2.8rem)", letterSpacing: "-0.02em", margin: "0 0 10px" }}>
            {noExiste ? "No encontramos esa página" : h1}
          </h1>
          <p style={{ color: "#6b7280", fontSize: "1.05rem", maxWidth: 640, margin: 0 }}>
            {noExiste ? "Puede que todavía no haya negocios en esa ciudad o rubro." : subtitulo}
          </p>
          {!noExiste && datos && (
            <div className="d-flex flex-wrap" style={{ gap: 8, marginTop: 22 }}>
              {chips}
            </div>
          )}
        </Container>
      </section>

      <section style={{ padding: "28px 0 80px" }}>
        <Container>
          {error && <p className="text-muted">No pudimos cargar los negocios. Intenta de nuevo en un rato.</p>}
          {!datos && !error && <p className="text-muted">Cargando negocios…</p>}
          {noExiste && (
            <Link to="/negocios" style={{ color: AZUL, fontWeight: 600 }}>
              Ver todos los negocios →
            </Link>
          )}
          {datos && !noExiste && (
            <>
              {negocios.length === 0 ? (
                <p className="text-muted">Pronto vas a encontrar negocios acá.</p>
              ) : (
                <div className="nc-grilla">
                  {negocios.map((n) => (
                    <EmpresaCard key={n._id} empresa={n} />
                  ))}
                </div>
              )}

              <div
                className="d-flex flex-column flex-md-row align-items-md-center justify-content-between"
                style={{ gap: 14, marginTop: 56, padding: "24px 26px", borderRadius: 18, background: "#f5f7ff", border: "1px solid #e4e8ff" }}
              >
                <div>
                  <strong style={{ fontSize: 17 }}>¿Tienes un negocio{ciudad ? ` en ${ciudad.nombre}` : ""}?</strong>
                  <div style={{ color: "#6b7280" }}>Recibe reservas online, recordatorios por WhatsApp y tu propia página.</div>
                </div>
                <Link
                  to="/registro-negocio"
                  style={{ background: AZUL, color: "#fff", borderRadius: 12, padding: "10px 20px", fontWeight: 700, whiteSpace: "nowrap", textDecoration: "none" }}
                >
                  Súmate a AgendaFonfach
                </Link>
              </div>
            </>
          )}
        </Container>
      </section>
    </div>
  );
};

export default Directorio;

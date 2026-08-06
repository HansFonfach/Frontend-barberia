import { Container, Row, Col, Button } from "reactstrap";
import barberoDefault from "assets/img/barberos/ale.jpg";
import "./profesionalesSection.css";
import { useParams } from "react-router-dom";

const themeFallback = {
  primary: "#5e72e4",
  primaryLight: "#eaecfe",
  primaryDark: "#324cdd",
  textDark: "#172b4d",
  textMuted: "#8898aa",
};

const getInitials = (nombre, apellido) =>
  `${nombre?.[0] || ""}${apellido?.[0] || ""}`.toUpperCase();

const ProfesionalesSection = ({ profesionales, theme, onReservar }) => {
  const { slug } = useParams();
  if (!profesionales?.length) return null;

  const t = { ...themeFallback, ...(theme || {}) };
  const isLumica = slug === "lumicabeauty";

  /* =====================================================
     UNA SOLA PROFESIONAL — se mantiene tal cual estaba
  ===================================================== */
  if (profesionales.length === 1) {
    const prof = profesionales[0];
    const fotoPerfil = prof.perfilProfesional?.fotoPerfil?.url || barberoDefault;
    const especialidades = prof.perfilProfesional?.especialidades || [];
    const aniosExp = prof.perfilProfesional?.aniosExperiencia;
    const tieneFoto = prof.perfilProfesional?.fotoPerfil?.url;

    return (
      <section className="py-7">
        <Container>
          <Row className="align-items-center g-5 mt-4 justify-content-center">
            <Col lg="4" className="text-center">
              <div className="barber-circle-container">
                <div className="barber-circle">
                  {tieneFoto ? (
                    <img
                      src={fotoPerfil}
                      alt={prof.nombre}
                      className="barber-img"
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#4654d1",
                        color: "#ffffff",
                        fontSize: "3rem",
                        fontWeight: 700,
                        borderRadius: "50%",
                      }}
                    >
                      {getInitials(prof.nombre, prof.apellido)}
                    </div>
                  )}
                </div>
              </div>
            </Col>

            <Col lg="6">
              <div className="barber-info-content">
                <h2 className="barber-name mb-3">
                  {prof.nombre} <span>{prof.apellido}</span>
                </h2>

                <div className="barber-stats mb-4">
                  {aniosExp && (
                    <div className="stat-item">
                      <span className="stat-value">{aniosExp}+</span>
                      <span className="stat-label">Años exp.</span>
                    </div>
                  )}
                  {isLumica && (
                    <div className="stat-item">
                      <span className="stat-value">+2.000</span>
                      <span className="stat-label">
                        Lifting de pestañas realizados
                      </span>
                    </div>
                  )}
                </div>

                <p className="barber-description mb-4">{prof.descripcion}</p>

                <div className="specialties mb-4">
                  {especialidades.map((esp, i) => (
                    <span key={i} className="specialty-tag">
                      {esp}
                    </span>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    );
  }

  /* =====================================================
     VARIOS PROFESIONALES — grilla
  ===================================================== */
  const total = profesionales.length;

  const colProps =
    total === 2
      ? { md: 6, lg: 5 }
      : total === 3
        ? { md: 6, lg: 4 }
        : { sm: 6, lg: 4, xl: 3 };

  return (
    <section className="py-6">
      <style>{`
        .pro-grid {
          --pro-primary: ${t.primary};
          --pro-primary-light: ${t.primaryLight};
          --pro-primary-dark: ${t.primaryDark};
          --pro-text: ${t.textDark};
          --pro-muted: ${t.textMuted};
        }

        .pro-card {
          position: relative;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 2.5rem 1.5rem 2rem;
          background: #ffffff;
          border: 1px solid var(--pro-primary-light);
          border-radius: 24px;
          transition: transform 0.35s ease, box-shadow 0.35s ease;
        }

        .pro-card:hover,
        .pro-card:focus-within {
          transform: translateY(-6px);
          box-shadow: 0 18px 40px color-mix(in srgb, var(--pro-primary) 22%, transparent);
        }

        /* El anillo desplazado es el detalle que hereda el círculo
           de la vista individual y lo vuelve firma de la grilla */
        .pro-portrait {
          position: relative;
          width: 148px;
          height: 148px;
          margin-bottom: 1.5rem;
        }

        .pro-portrait::before {
          content: "";
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          border: 2px solid var(--pro-primary);
          opacity: 0.35;
          transform: translate(7px, 7px);
          transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s ease;
          pointer-events: none;
        }

        .pro-card:hover .pro-portrait::before,
        .pro-card:focus-within .pro-portrait::before {
          transform: translate(0, 0);
          opacity: 0.9;
        }

        .pro-portrait img,
        .pro-initials {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          display: block;
        }

        .pro-initials {
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--pro-primary) 0%, var(--pro-primary-dark) 100%);
          color: #ffffff;
          font-size: 2.4rem;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .pro-eyebrow {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--pro-primary);
          margin-bottom: 0.4rem;
        }

        .pro-name {
          font-size: 1.3rem;
          font-weight: 700;
          line-height: 1.25;
          color: var(--pro-text);
          margin-bottom: 0.75rem;
        }

        .pro-name span {
          font-weight: 400;
          color: var(--pro-muted);
        }

        .pro-rule {
          width: 32px;
          height: 2px;
          background: var(--pro-primary);
          opacity: 0.5;
          border-radius: 2px;
          margin-bottom: 1rem;
        }

        .pro-description {
          font-size: 0.92rem;
          line-height: 1.6;
          color: var(--pro-muted);
          margin-bottom: 1.25rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .pro-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          justify-content: center;
          margin-top: auto;
        }

        .pro-tag {
          font-size: 0.75rem;
          font-weight: 500;
          padding: 5px 12px;
          border-radius: 50px;
          background: var(--pro-primary-light);
          color: var(--pro-primary-dark);
          white-space: nowrap;
        }

        .pro-tag--more {
          background: transparent;
          border: 1px dashed var(--pro-primary);
          color: var(--pro-primary);
        }

        .pro-cta {
          margin-top: 1.5rem;
          background: transparent;
          border: 1px solid var(--pro-primary);
          color: var(--pro-primary);
          font-weight: 600;
          font-size: 0.85rem;
          padding: 9px 22px;
          border-radius: 50px;
          transition: all 0.3s ease;
        }

        .pro-cta:hover,
        .pro-cta:focus-visible {
          background: var(--pro-primary);
          border-color: var(--pro-primary);
          color: #ffffff;
        }

        @media (max-width: 575.98px) {
          .pro-card { padding: 2rem 1.25rem 1.75rem; }
          .pro-portrait { width: 124px; height: 124px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .pro-card,
          .pro-portrait::before,
          .pro-cta { transition: none; }
          .pro-card:hover,
          .pro-card:focus-within { transform: none; }
        }
      `}</style>

      <Container className="pro-grid">
        <Row className="justify-content-center g-4">
          {profesionales.map((prof, idx) => {
            const foto = prof.perfilProfesional?.fotoPerfil?.url;
            const especialidades = prof.perfilProfesional?.especialidades || [];
            const aniosExp = prof.perfilProfesional?.aniosExperiencia;
            const visibles = especialidades.slice(0, 3);
            const restantes = especialidades.length - visibles.length;

            return (
              <Col key={prof._id || idx} {...colProps}>
                <div className="pro-card">
                  <div className="pro-portrait">
                    {foto ? (
                      <img
                        src={foto}
                        alt={`${prof.nombre} ${prof.apellido || ""}`.trim()}
                        loading="lazy"
                      />
                    ) : (
                      <div className="pro-initials" aria-hidden="true">
                        {getInitials(prof.nombre, prof.apellido)}
                      </div>
                    )}
                  </div>

                  {aniosExp && (
                    <div className="pro-eyebrow">{aniosExp}+ años de experiencia</div>
                  )}

                  <h3 className="pro-name">
                    {prof.nombre} <span>{prof.apellido}</span>
                  </h3>

                  <div className="pro-rule" />

                  {prof.descripcion && (
                    <p className="pro-description">{prof.descripcion}</p>
                  )}

                  {especialidades.length > 0 && (
                    <div className="pro-tags">
                      {visibles.map((esp, i) => (
                        <span key={i} className="pro-tag">
                          {esp}
                        </span>
                      ))}
                      {restantes > 0 && (
                        <span className="pro-tag pro-tag--more">
                          +{restantes}
                        </span>
                      )}
                    </div>
                  )}

                  {onReservar && (
                    <Button
                      className="pro-cta"
                      onClick={() => onReservar(prof)}
                    >
                      Reservar con {prof.nombre}
                    </Button>
                  )}
                </div>
              </Col>
            );
          })}
        </Row>
      </Container>
    </section>
  );
};

export default ProfesionalesSection;
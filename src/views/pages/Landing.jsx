import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Button, Badge } from "reactstrap";

import { useEmpresa } from "context/EmpresaContext";
import { useLandingData } from "hooks/useLandingData";

import AuthFooter from "components/Footers/AuthFooter";
import ServiciosSection from "components/landing/ServiciosSection";
import ProfesionalesSection from "components/landing/ProfesionalesSection";

import { MdLocationOn, MdAccessTime, MdEmail, MdPhone } from "react-icons/md";
import { FaWhatsapp, FaCalendarCheck, FaFacebook } from "react-icons/fa";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Landing = () => {
  const navigate = useNavigate();
  const { slug } = useParams();

  const { empresa, loading } = useEmpresa();
  const {
    servicios,
    profesionales,
    loading: loadingLanding,
  } = useLandingData(slug);

  const isLumica = slug === "lumicabeauty";

  // Definir tema basado en el slug
  const theme = isLumica
    ? {
        // Tema especial para lumicabeauty con rosado #FF5DA1
        primary: "#FF5DA1",
        primaryLight: "#FFE4F0",
        primaryDark: "#E64D8F",
        secondary: "#BA68C8",
        softBg: "#FFFFFF",
        heroBg: "linear-gradient(135deg, #FFFFFF 0%, #FFF5FA 100%)",
        textDark: "#2D3748",
        textMuted: "#718096",
        isLumica: true,
      }
    : {
        // Tema original para otras empresas
        primary: "#5e72e4",
        primaryLight: "#eaecfe",
        primaryDark: "#324cdd",
        secondary: "#2dce89",
        softBg: "#f6f9fc",
        heroBg: "linear-gradient(150deg, #172b4d 0%, #1a174d 100%)",
        textDark: "#172b4d",
        textMuted: "#8898aa",
        isLumica: false,
      };

  if (loading || loadingLanding) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div
            className="spinner-border mb-3"
            role="status"
            style={{ color: theme.primary }}
          >
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p style={{ color: theme.textMuted }}>Preparando todo para ti...</p>
        </div>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h2 className="mb-3" style={{ color: theme.textDark }}>
            Empresa no encontrada
          </h2>
          <p className="mb-4" style={{ color: theme.textMuted }}>
            Lo sentimos, no pudimos encontrar la empresa que buscas.
          </p>
          <Button
            style={{
              backgroundColor: theme.primary,
              border: "none",
              color: "white",
            }}
            onClick={() => navigate("/")}
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#FFFFFF", overflowX: "hidden" }}>
      {/* ================= HERO ================= */}
      <section
        style={{
          background: theme.heroBg,
          minHeight: "85vh",
          display: "flex",
          alignItems: "center",
          position: "relative",
          color: theme.isLumica ? theme.textDark : "#fff",
        }}
      >
        <Container className="position-relative">
          <Row className="justify-content-center">
            <Col lg="8" className="text-center">
              {theme.isLumica && (
                <div
                  style={{
                    position: "relative",
                    display: "inline-block",
                    marginBottom: "2rem",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "-20px",
                      left: "-20px",
                      right: "-20px",
                      bottom: "-20px",
                      background: `${theme.primary}20`,
                      borderRadius: "50%",
                      filter: "blur(30px)",
                    }}
                  />
                </div>
              )}

              <Badge
                pill
                style={{
                  backgroundColor: theme.isLumica
                    ? theme.primaryLight
                    : "rgba(255,255,255,0.2)",
                  color: theme.isLumica ? theme.primary : "#fff",
                  padding: "8px 16px",
                  fontSize: "0.85rem",
                  marginBottom: "2rem",
                  ...(theme.isLumica
                    ? { border: `1px solid ${theme.primary}20` }
                    : {
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }),
                }}
              >
                ✨ Bienvenido a {empresa.nombre}
              </Badge>

              <h1
                className="display-3 font-weight-bold mb-4"
                style={{
                  fontSize: "clamp(2.5rem, 5vw, 4rem)",
                  color: theme.isLumica ? theme.textDark : "#fff",
                  ...(theme.isLumica
                    ? {}
                    : { textShadow: "0 2px 10px rgba(0,0,0,0.1)" }),
                }}
              >
                {empresa.nombre}
              </h1>

              <p
                className="lead mb-5"
                style={{
                  fontSize: "1.25rem",
                  color: theme.isLumica ? theme.textMuted : "#fff",
                  opacity: theme.isLumica ? 1 : 0.95,
                  maxWidth: "600px",
                  marginLeft: "auto",
                  marginRight: "auto",
                  marginBottom: "2rem",
                }}
              >
                {empresa.descripcion ||
                  "Expertos en belleza y bienestar, dedicados a resaltar tu mejor versión."}
              </p>

              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Button
                  size="lg"
                  style={{
                    backgroundColor: theme.isLumica ? "#FFFFFF" : "#ffffff",
                    color: theme.primary,
                    border: "none",
                    fontWeight: 600,
                    padding: "14px 32px",
                    borderRadius: "50px",
                    boxShadow: theme.isLumica
                      ? `0 10px 20px ${theme.primary}40`
                      : "0 10px 20px rgba(0,0,0,0.1)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (theme.isLumica) {
                      e.target.style.backgroundColor = "#FFFFFF";
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = `0 15px 30px ${theme.primary}60`;
                    } else {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 15px 30px rgba(0,0,0,0.15)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (theme.isLumica) {
                      e.target.style.backgroundColor = "#FFFFFF";
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = `0 10px 20px ${theme.primary}40`;
                    } else {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 10px 20px rgba(0,0,0,0.1)";
                    }
                  }}
                  onClick={() => navigate(`/${slug}/reservar`)}
                >
                  <FaCalendarCheck className="me-2" />
                  Reservar hora
                </Button>

                <Button
                  outline
                  size="lg"
                  style={{
                    borderColor: theme.isLumica
                      ? theme.primary
                      : "rgba(255,255,255,0.5)",
                    color: theme.isLumica ? theme.primary : "#ffffff",
                    fontWeight: 500,
                    padding: "14px 32px",
                    borderRadius: "50px",
                    backgroundColor: theme.isLumica
                      ? "transparent"
                      : "transparent",
                    backdropFilter: theme.isLumica ? "none" : "blur(5px)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (theme.isLumica) {
                      e.target.style.backgroundColor = theme.primaryLight;
                      e.target.style.borderColor = theme.primaryDark;
                    } else {
                      e.target.style.borderColor = "#ffffff";
                      e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (theme.isLumica) {
                      e.target.style.backgroundColor = "transparent";
                      e.target.style.borderColor = theme.primary;
                    } else {
                      e.target.style.borderColor = "rgba(255,255,255,0.5)";
                      e.target.style.backgroundColor = "transparent";
                    }
                  }}
                  onClick={() => navigate(`/${slug}/login`)}
                >
                  Iniciar sesión
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ================= SERVICIOS DESTACADOS ================= */}
      <section
        style={{
          paddingTop: "5rem",
          paddingBottom: "3rem",
          backgroundColor: "#FFFFFF",
        }}
      >
  
        <ServiciosSection
          servicios={servicios}
          onReservar={() => navigate(`/${slug}/reservar`)}
          theme={theme}
        />
      </section>

      {/* ================= PROFESIONALES ================= */}
      <section
        style={{
          paddingTop: "3rem",
          paddingBottom: "5rem",
          backgroundColor: theme.isLumica ? theme.primaryLight : theme.softBg,
          position: "relative",
        }}
      >
        <Container>
          <Row className="justify-content-center text-center mb-5">
            <Col lg="6">
              <Badge
                pill
                style={{
                  backgroundColor: theme.isLumica
                    ? "#FFFFFF"
                    : theme.primaryLight,
                  color: theme.primary,
                  padding: "8px 16px",
                  fontSize: "0.85rem",
                  marginBottom: "1rem",
                  ...(theme.isLumica
                    ? { border: `1px solid ${theme.primary}20` }
                    : {}),
                }}
              >
                Nuestro equipo
              </Badge>
              <h2
                style={{
                  fontWeight: 700,
                  fontSize: "2.5rem",
                  marginBottom: "1rem",
                  color: theme.textDark,
                }}
              >
                Profesionales expertos
              </h2>
              <p style={{ color: theme.textMuted }}>
                Conoce a nuestro talentoso equipo de especialistas
              </p>
            </Col>
          </Row>
        </Container>
        <ProfesionalesSection profesionales={profesionales} theme={theme} />
      </section>

      {/* ================= CTA SECTION ================= */}
      <section
        style={{
          padding: "4rem 0",
          background: theme.isLumica
            ? `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`
            : `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col lg="8" className="text-lg-start text-center mb-4 mb-lg-0">
              <h3 className="h2 mb-2" style={{ color: "#FFFFFF" }}>
                ¿Listo para tu próxima cita?
              </h3>
              <p className="mb-0" style={{ color: "#FFFFFF", opacity: 0.9 }}>
                Reserva ahora y disfruta de nuestros servicios con profesionales
                expertos
              </p>
            </Col>
            <Col lg="4" className="text-lg-end text-center">
              <Button
                size="lg"
                style={{
                  backgroundColor: "#FFFFFF",
                  color: theme.primary,
                  border: "none",
                  fontWeight: 600,
                  padding: "14px 32px",
                  borderRadius: "50px",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                }}
                onClick={() => navigate(`/${slug}/reservar`)}
              >
                <FaCalendarCheck className="me-2" />
                Agendar cita
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ================= CONTACTO ================= */}
      <section
        style={{
          backgroundColor: "#FFFFFF",
          paddingTop: "5rem",
          paddingBottom: "5rem",
        }}
      >
        <Container>
          <Row className="justify-content-center text-center mb-5">
            <Col lg="6">
              <Badge
                pill
                style={{
                  backgroundColor: theme.primaryLight,
                  color: theme.primary,
                  padding: "8px 16px",
                  fontSize: "0.85rem",
                  marginBottom: "1rem",
                }}
              >
                Contacto
              </Badge>
              <h2
                style={{
                  fontWeight: 700,
                  fontSize: "2.5rem",
                  marginBottom: "1rem",
                  color: theme.textDark,
                }}
              >
                Estamos para ayudarte
              </h2>
              <p style={{ color: theme.textMuted }}>
                ¿Tienes alguna pregunta? No dudes en contactarnos
              </p>
            </Col>
          </Row>

          <Row>
            {/* INFO CARDS */}
            <Col md="5" className="mb-5 mb-md-0">
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "24px",
                  padding: "2.5rem",
                  height: "100%",
                  boxShadow: theme.isLumica
                    ? `0 10px 30px ${theme.primary}20`
                    : "0 10px 30px rgba(0,0,0,0.05)",
                  border: theme.isLumica
                    ? `1px solid ${theme.primaryLight}`
                    : "1px solid rgba(0,0,0,0.05)",
                }}
              >
                <h3
                  style={{
                    fontWeight: 600,
                    marginBottom: "2rem",
                    color: theme.textDark,
                  }}
                >
                  Información de contacto
                </h3>

                <div className="d-flex mb-4">
                  <div
                    style={{
                      backgroundColor: theme.primaryLight,
                      width: "50px",
                      height: "50px",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "1rem",
                    }}
                  >
                    <MdLocationOn size={24} style={{ color: theme.primary }} />
                  </div>
                  <div>
                    <h6 className="mb-1" style={{ color: theme.textDark }}>
                      Dirección
                    </h6>
                    <p className="mb-0" style={{ color: theme.textMuted }}>
                      {empresa.direccion || "No disponible"}
                    </p>
                  </div>
                </div>

                <div className="d-flex mb-4">
                  <div
                    style={{
                      backgroundColor: theme.primaryLight,
                      width: "50px",
                      height: "50px",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "1rem",
                    }}
                  >
                    <MdAccessTime size={24} style={{ color: theme.primary }} />
                  </div>
                  <div>
                    <h6 className="mb-1" style={{ color: theme.textDark }}>
                      Horarios
                    </h6>
                    <p className="mb-0" style={{ color: theme.textMuted }}>
                      {empresa.horarios || "No disponible"}
                    </p>
                  </div>
                </div>

                {empresa.telefono && (
                  <div className="d-flex mb-4">
                    <div
                      style={{
                        backgroundColor: theme.primaryLight,
                        width: "50px",
                        height: "50px",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "1rem",
                      }}
                    >
                      <MdPhone size={24} style={{ color: theme.primary }} />
                    </div>
                    <div>
                      <h6 className="mb-1" style={{ color: theme.textDark }}>
                        Teléfono
                      </h6>
                      <p className="mb-0" style={{ color: theme.textMuted }}>
                        {empresa.telefono}
                      </p>
                    </div>
                  </div>
                )}

                {empresa.email && (
                  <div className="d-flex mb-4">
                    <div
                      style={{
                        backgroundColor: theme.primaryLight,
                        width: "50px",
                        height: "50px",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "1rem",
                      }}
                    >
                      <MdEmail size={24} style={{ color: theme.primary }} />
                    </div>
                    <div>
                      <h6 className="mb-1" style={{ color: theme.textDark }}>
                        Email
                      </h6>
                      <p className="mb-0" style={{ color: theme.textMuted }}>
                        {empresa.email}
                      </p>
                    </div>
                  </div>
                )}

                <div className="d-flex gap-2 mt-4">
                  {empresa.telefono && (
                    <Button
                      style={{
                        backgroundColor: "#25D366",
                        border: "none",
                        fontWeight: 600,
                        borderRadius: "50px",
                        padding: "10px 20px",
                        color: "#FFFFFF",
                      }}
                      onClick={() => {
                        const telefonoLimpio = empresa.telefono.replace(
                          /\D/g,
                          "",
                        );
                        window.open(
                          `https://wa.me/${telefonoLimpio}`,
                          "_blank",
                        );
                      }}
                    >
                      <FaWhatsapp className="me-2" />
                      WhatsApp
                    </Button>
                  )}

                  {/* Botón de Instagram con imagen real */}
                  <Button
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      padding: "0",
                      width: "40px",
                      height: "40px",
                      overflow: "hidden",
                      borderRadius: "50%",
                    }}
                    onClick={() =>
                      window.open(`${empresa.redes.instagram}`, "_blank")
                    }
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/2048px-Instagram_logo_2016.svg.png"
                      alt="Instagram"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Button>
                </div>
              </div>
            </Col>

            {/* FORM */}
            <Col md="7">
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: "2.5rem",
                  borderRadius: "24px",
                  boxShadow: theme.isLumica
                    ? `0 10px 30px ${theme.primary}20`
                    : "0 10px 30px rgba(0,0,0,0.05)",
                  border: theme.isLumica
                    ? `1px solid ${theme.primaryLight}`
                    : "1px solid rgba(0,0,0,0.05)",
                  height: "100%",
                }}
              >
                <h3
                  style={{
                    fontWeight: 600,
                    marginBottom: "2rem",
                    color: theme.textDark,
                  }}
                >
                  Envíanos un mensaje
                </h3>

                <form>
                  <Row>
                    <Col md="6" className="mb-3">
                      <label
                        className="form-label small"
                        style={{ color: theme.textMuted }}
                      >
                        Nombre
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        placeholder="Tu nombre"
                        required
                        style={{
                          borderRadius: "12px",
                          border: `1px solid ${theme.primaryLight}`,
                          padding: "12px 16px",
                          color: theme.textDark,
                        }}
                      />
                    </Col>

                    <Col md="6" className="mb-3">
                      <label
                        className="form-label small"
                        style={{ color: theme.textMuted }}
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-lg"
                        placeholder="tu@email.com"
                        required
                        style={{
                          borderRadius: "12px",
                          border: `1px solid ${theme.primaryLight}`,
                          padding: "12px 16px",
                          color: theme.textDark,
                        }}
                      />
                    </Col>
                  </Row>

                  <div className="mb-3">
                    <label
                      className="form-label small"
                      style={{ color: theme.textMuted }}
                    >
                      Asunto
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="¿Sobre qué quieres hablar?"
                      style={{
                        borderRadius: "12px",
                        border: `1px solid ${theme.primaryLight}`,
                        padding: "12px 16px",
                        color: theme.textDark,
                      }}
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      className="form-label small"
                      style={{ color: theme.textMuted }}
                    >
                      Mensaje
                    </label>
                    <textarea
                      className="form-control form-control-lg"
                      rows="4"
                      placeholder="Escribe tu mensaje..."
                      required
                      style={{
                        borderRadius: "12px",
                        border: `1px solid ${theme.primaryLight}`,
                        padding: "12px 16px",
                        color: theme.textDark,
                      }}
                    />
                  </div>

                  <Button
                    block
                    size="lg"
                    style={{
                      backgroundColor: theme.primary,
                      border: "none",
                      fontWeight: 600,
                      padding: "14px",
                      borderRadius: "12px",
                      color: "#FFFFFF",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = theme.primaryDark;
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = theme.isLumica
                        ? `0 10px 20px ${theme.primary}40`
                        : "0 10px 20px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = theme.primary;
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "none";
                    }}
                  >
                    Enviar mensaje
                  </Button>
                </form>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <AuthFooter />
    </div>
  );
};

export default Landing;

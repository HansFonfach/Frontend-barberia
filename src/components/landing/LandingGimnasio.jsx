import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Badge } from "reactstrap";
import { Dumbbell, Gift, ShieldCheck, Users, CalendarClock } from "lucide-react";
import { MdLocationOn, MdAccessTime, MdEmail, MdPhone } from "react-icons/md";
import { FaWhatsapp, FaCalendarCheck } from "react-icons/fa";
import "@fortawesome/fontawesome-free/css/all.min.css";

import AuthFooter from "components/Footers/AuthFooter";
import ClasesSection from "components/landing/ClasesSection";
import ProfesionalesSection from "components/landing/ProfesionalesSection";
import PlanesSection from "components/landing/PlanesSection";

const theme = {
  primary: "#2dce89",
  primaryLight: "#e3fcef",
  primaryDark: "#24a46d",
  heroBg: "linear-gradient(150deg, #11142b 0%, #172b4d 55%, #0f2a22 100%)",
  softBg: "#f6fcf9",
  textDark: "#172b4d",
  textMuted: "#8898aa",
};

/**
 * Landing dedicado a empresas de rubro "gimnasio". Reemplaza el landing de
 * barbería/salón (que sigue intacto para el resto de los negocios): hero
 * orientado a agendar la clase de prueba SIN cuenta, catálogo de clases,
 * planes de membresía (con CTA de WhatsApp — no hay pasarela de pago) e
 * instructores. Recibe los datos ya cargados por Landing.jsx vía
 * useLandingData, así que no vuelve a pedirlos.
 */
const LandingGimnasio = ({ empresa, slug, clases = [], planes = [], profesionales = [] }) => {
  const navigate = useNavigate();

  const telefonoLimpio = (empresa?.telefono || "").replace(/\D/g, "");

  const stats = [
    clases.length > 0 && { valor: clases.length, label: "Clases disponibles" },
    profesionales.length > 0 && {
      valor: profesionales.length,
      label: profesionales.length === 1 ? "Instructor certificado" : "Instructores certificados",
    },
    planes.length > 0 && { valor: planes.length, label: "Planes de membresía" },
  ].filter(Boolean);

  return (
    <div style={{ backgroundColor: "#FFFFFF", overflowX: "hidden" }}>
      {/* ================= HERO ================= */}
      <section
        style={{
          background: theme.heroBg,
          minHeight: "88vh",
          display: "flex",
          alignItems: "center",
          position: "relative",
          color: "#fff",
        }}
      >
        <Container className="position-relative">
          <Row className="justify-content-center">
            <Col lg="9" className="text-center">
              <Badge
                pill
                style={{
                  backgroundColor: "rgba(255,255,255,0.12)",
                  color: "#fff",
                  padding: "8px 18px",
                  fontSize: "0.9rem",
                  marginBottom: "2rem",
                  border: "1px solid rgba(255,255,255,0.18)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Dumbbell size={16} className="me-2" style={{ verticalAlign: "-3px" }} />{" "}
                Bienvenido a {empresa.nombre}
              </Badge>

              <h1
                className="display-3 font-weight-bold mb-4"
                style={{
                  fontSize: "clamp(2.4rem, 5vw, 4rem)",
                  color: "#fff",
                  textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                }}
              >
                {empresa.nombre}
              </h1>

              <p
                className="lead mb-5"
                style={{
                  fontSize: "1.2rem",
                  color: "rgba(255,255,255,0.9)",
                  maxWidth: "620px",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                {empresa.descripcion ||
                  "Entrena con clases grupales, instructores certificados y el plan que se ajuste a ti."}
              </p>

              <div className="d-flex gap-3 justify-content-center flex-wrap mb-5">
                <Button
                  size="lg"
                  style={{
                    backgroundColor: theme.primary,
                    color: "#fff",
                    border: "none",
                    fontWeight: 600,
                    padding: "14px 32px",
                    borderRadius: "50px",
                    boxShadow: `0 12px 24px ${theme.primary}55`,
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = theme.primaryDark;
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = theme.primary;
                    e.target.style.transform = "translateY(0)";
                  }}
                  onClick={() => navigate(`/${slug}/clase-de-prueba`)}
                >
                  <Gift size={18} className="me-2" style={{ verticalAlign: "-3px" }} />
                  Agenda tu clase de prueba gratis
                </Button>

                <Button
                  outline
                  size="lg"
                  style={{
                    borderColor: "rgba(255,255,255,0.5)",
                    color: "#ffffff",
                    fontWeight: 500,
                    padding: "14px 32px",
                    borderRadius: "50px",
                    backdropFilter: "blur(5px)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = "#ffffff";
                    e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.5)";
                    e.target.style.backgroundColor = "transparent";
                  }}
                  onClick={() => navigate(`/${slug}/login`)}
                >
                  Iniciar sesión
                </Button>
              </div>

              <p className="small mb-0" style={{ color: "rgba(255,255,255,0.65)" }}>
                Sin tarjeta, sin registro previo — solo elige tu clase y agenda.
              </p>
            </Col>
          </Row>

          {stats.length > 0 && (
            <Row className="justify-content-center mt-5">
              <Col lg="8">
                <Row className="text-center">
                  {stats.map((s) => (
                    <Col key={s.label} xs={12 / stats.length}>
                      <div
                        style={{
                          fontSize: "2.2rem",
                          fontWeight: 800,
                          color: "#fff",
                        }}
                      >
                        {s.valor}
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
                        {s.label}
                      </div>
                    </Col>
                  ))}
                </Row>
              </Col>
            </Row>
          )}
        </Container>
      </section>

      {/* ================= POR QUÉ NOSOTROS ================= */}
      <section style={{ padding: "4.5rem 0", backgroundColor: "#FFFFFF" }}>
        <Container>
          <Row className="justify-content-center g-4">
            {[
              {
                icon: Gift,
                titulo: "Clase de prueba gratis",
                texto: "Agéndala sin crear cuenta ni entregar datos de pago.",
              },
              {
                icon: ShieldCheck,
                titulo: "Instructores certificados",
                texto: "Cada clase está guiada por profesionales del área.",
              },
              {
                icon: CalendarClock,
                titulo: "Cupos limitados",
                texto: "Horarios claros y reserva confirmada al instante.",
              },
            ].map(({ icon: Icon, titulo, texto }) => (
              <Col md="4" key={titulo} className="text-center">
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    backgroundColor: theme.primaryLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.25rem",
                  }}
                >
                  <Icon size={28} style={{ color: theme.primary }} />
                </div>
                <h5 className="font-weight-bold" style={{ color: theme.textDark }}>
                  {titulo}
                </h5>
                <p style={{ color: theme.textMuted }}>{texto}</p>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ================= CLASES ================= */}
      {clases.length > 0 && (
        <section style={{ backgroundColor: theme.softBg }}>
          <ClasesSection
            clases={clases}
            onIngresar={() => navigate(`/${slug}/clase-de-prueba`)}
            theme={theme}
          />
        </section>
      )}

      {/* ================= PLANES ================= */}
      {planes.length > 0 && (
        <section style={{ backgroundColor: "#FFFFFF" }}>
          <PlanesSection planes={planes} empresa={empresa} theme={theme} />
        </section>
      )}

      {/* ================= INSTRUCTORES ================= */}
      {profesionales.length > 0 && (
        <section
          style={{
            paddingTop: "3rem",
            paddingBottom: "5rem",
            backgroundColor: theme.softBg,
          }}
        >
          <Container>
            <Row className="justify-content-center text-center mb-5">
              <Col lg="6">
                <Badge
                  pill
                  style={{
                    backgroundColor: "#FFFFFF",
                    color: theme.primary,
                    padding: "8px 16px",
                    fontSize: "0.85rem",
                    marginBottom: "1rem",
                    border: `1px solid ${theme.primary}20`,
                  }}
                >
                  <Users size={14} className="me-1" style={{ verticalAlign: "-2px" }} />
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
                  Instructores certificados
                </h2>
                <p style={{ color: theme.textMuted }}>
                  Conoce a nuestro equipo de instructores
                </p>
              </Col>
            </Row>
          </Container>
          <ProfesionalesSection profesionales={profesionales} theme={theme} />
        </section>
      )}

      {/* ================= CTA FINAL ================= */}
      <section
        style={{
          padding: "4rem 0",
          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col lg="8" className="text-lg-start text-center mb-4 mb-lg-0">
              <h3 className="h2 mb-2" style={{ color: "#FFFFFF" }}>
                ¿Lista para tu primera clase?
              </h3>
              <p className="mb-0" style={{ color: "#FFFFFF", opacity: 0.9 }}>
                Agenda tu clase de prueba gratis, hoy mismo y sin compromiso.
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
                onClick={() => navigate(`/${slug}/clase-de-prueba`)}
              >
                <FaCalendarCheck className="me-2" />
                Agendar clase de prueba
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
                ¿Tienes alguna pregunta? Escríbenos
              </p>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col md="8" lg="6">
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "24px",
                  padding: "2.5rem",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                  border: `1px solid ${theme.primaryLight}`,
                }}
              >
                {empresa.direccion && (
                  <div className="d-flex mb-4">
                    <div
                      style={{
                        backgroundColor: theme.primaryLight,
                        width: 50,
                        height: 50,
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "1rem",
                        flexShrink: 0,
                      }}
                    >
                      <MdLocationOn size={24} style={{ color: theme.primary }} />
                    </div>
                    <div>
                      <h6 className="mb-1" style={{ color: theme.textDark }}>
                        Encuéntranos en
                      </h6>
                      <p className="mb-0" style={{ color: theme.textMuted }}>
                        {empresa.direccion}
                      </p>
                    </div>
                  </div>
                )}

                {empresa.horarios && (
                  <div className="d-flex mb-4">
                    <div
                      style={{
                        backgroundColor: theme.primaryLight,
                        width: 50,
                        height: 50,
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "1rem",
                        flexShrink: 0,
                      }}
                    >
                      <MdAccessTime size={24} style={{ color: theme.primary }} />
                    </div>
                    <div>
                      <h6 className="mb-1" style={{ color: theme.textDark }}>
                        Horarios
                      </h6>
                      <p className="mb-0" style={{ color: theme.textMuted }}>
                        {empresa.horarios}
                      </p>
                    </div>
                  </div>
                )}

                {empresa.telefono && (
                  <div className="d-flex mb-4">
                    <div
                      style={{
                        backgroundColor: theme.primaryLight,
                        width: 50,
                        height: 50,
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "1rem",
                        flexShrink: 0,
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

                {empresa.correo && (
                  <div className="d-flex mb-4">
                    <div
                      style={{
                        backgroundColor: theme.primaryLight,
                        width: 50,
                        height: 50,
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "1rem",
                        flexShrink: 0,
                      }}
                    >
                      <MdEmail size={24} style={{ color: theme.primary }} />
                    </div>
                    <div>
                      <h6 className="mb-1" style={{ color: theme.textDark }}>
                        Email
                      </h6>
                      <p className="mb-0" style={{ color: theme.textMuted }}>
                        {empresa.correo}
                      </p>
                    </div>
                  </div>
                )}

                <div className="d-flex" style={{ gap: 10 }}>
                  {telefonoLimpio && (
                    <Button
                      block
                      style={{
                        backgroundColor: "#25D366",
                        border: "none",
                        fontWeight: 600,
                        borderRadius: "50px",
                        padding: "12px 20px",
                        color: "#FFFFFF",
                      }}
                      onClick={() =>
                        window.open(`https://wa.me/${telefonoLimpio}`, "_blank")
                      }
                    >
                      <FaWhatsapp className="me-2" />
                      WhatsApp
                    </Button>
                  )}

                  {empresa?.redes?.instagram && (
                    <Button
                      style={{
                        background:
                          "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                        border: "none",
                        borderRadius: "50px",
                        padding: "12px 20px",
                        color: "#FFFFFF",
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                      onClick={() =>
                        window.open(empresa.redes.instagram, "_blank")
                      }
                    >
                      <i className="fab fa-instagram me-2" />
                      Instagram
                    </Button>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <AuthFooter />
    </div>
  );
};

export default LandingGimnasio;

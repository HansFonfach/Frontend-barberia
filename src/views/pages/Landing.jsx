import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Button, Badge } from "reactstrap";

import { useEmpresa } from "context/EmpresaContext";
import { useLandingData } from "hooks/useLandingData";

import AuthFooter from "components/Footers/AuthFooter";
import ServiciosSection from "components/landing/ServiciosSection";
import ProfesionalesSection from "components/landing/ProfesionalesSection";

import { MdLocationOn, MdAccessTime } from "react-icons/md";
import { FaWhatsapp, FaCalendarCheck } from "react-icons/fa";
import "@fortawesome/fontawesome-free/css/all.min.css";

import logo from "assets/img/logo4.png";

const Landing = () => {
  const navigate = useNavigate();
  const { slug } = useParams();

  const { empresa, loading } = useEmpresa();
  const {
    servicios,
    profesionales,
    loading: loadingLanding,
  } = useLandingData(slug);

  if (loading || loadingLanding) {
    return <div className="text-center py-6">Cargando...</div>;
  }

  if (!empresa) {
    return <div className="text-center py-6">Empresa no encontrada</div>;
  }

  return (
    <div className="bg-white">
      {/* ================= HERO ================= */}
      <section
        className="py-7 py-lg-8 position-relative"
        style={{
          background: "linear-gradient(150deg, #172b4d 0%, #1a174d 100%)",
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg="8">
              <img
                src={logo}
                alt={empresa.nombre}
                className="img-fluid mb-4"
                style={{ width: 150 }}
              />

              <h1 className="display-2 text-white font-weight-bold mb-3">
                {empresa.nombre}
              </h1>

              <p className="lead text-light mb-5">{empresa.descripcion}</p>

              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Button
                  color="primary"
                  size="lg"
                  onClick={() => navigate(`/${slug}/reservar`)}
                >
                  <FaCalendarCheck className="mr-2" />
                  Reservar hora
                </Button>

                <Button
                  outline
                  color="light"
                  size="lg"
                  onClick={() => navigate(`/${slug}/login`)}
                >
                  Iniciar sesión
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ================= SERVICIOS ================= */}
      <ServiciosSection
        servicios={servicios}
        onReservar={() => navigate(`/${slug}/reservar`)}
      />

      {/* ================= PROFESIONALES ================= */}
      <ProfesionalesSection profesionales={profesionales} />

      {/* ================= CONTACTO ================= */}
      <section className="bg-secondary py-6">
        {" "}
        {/* El fondo está en la section */}
        <Container className="py-6 ">
          <Row className="align-items-start">
            {/* ===== INFO ===== */}
            <Col md="6" className="mb-5 mb-md-0">
              <Badge color="primary" pill className="mb-3">
                Ubicación & Contacto
              </Badge>

              <h2 className="display-4 font-weight-bold mb-4">Contáctanos</h2>

              {/* Dirección */}
              <div className="d-flex mb-3">
                <MdLocationOn size={24} className="text-primary mr-3 mt-1" />
                <div>
                  <h6 className="mb-0">Dirección</h6>
                  <p className="text-muted mb-0">
                    {empresa.direccion || "No disponible"}
                  </p>
                </div>
              </div>

              {/* Horarios */}
              <div className="d-flex mb-4">
                <MdAccessTime size={24} className="text-primary mr-3 mt-1" />
                <div>
                  <h6 className="mb-0">Horarios</h6>
                  <p className="text-muted mb-0">
                    {empresa.horarios || "No disponible"}
                  </p>
                </div>
              </div>

              {/* Redes */}
              <h6 className="mb-3">Síguenos</h6>

              <div className="d-flex gap-3 mb-4 align-items-center">
                {empresa.redes.instagram && (
                  <i
                    className="fab fa-instagram fs-4 text-primary cursor-pointer"
                    onClick={() =>
                      window.open(empresa.redes.instagram, "_blank")
                    }
                    title="Instagram"
                    role="button"
                  />
                )}

                {empresa.redes.facebook && (
                  <i
                    className="fab fa-facebook fs-4 ml-2 text-primary cursor-pointer"
                    onClick={() =>
                      window.open(empresa.redes.facebook, "_blank")
                    }
                    title="Facebook"
                    role="button"
                  />
                )}

                {empresa.redes.tiktok && (
                  <i
                    className="fab fa-tiktok fs-4   ml-2 text-primary cursor-pointer"
                    onClick={() => window.open(empresa.redes.tiktok, "_blank")}
                    title="TikTok"
                    role="button"
                  />
                )}
              </div>

              {/* WhatsApp */}
              {empresa.telefono && (
                <Button
                  color="success"
                  onClick={() => {
                    const telefonoLimpio = empresa.telefono.replace(/\D/g, "");
                    window.open(`https://wa.me/${telefonoLimpio}`, "_blank");
                  }}
                >
                  <FaWhatsapp className="mr-2" />
                  Escríbenos por WhatsApp
                </Button>
              )}
            </Col>

            {/* ===== FORMULARIO ===== */}
            <Col md="6" >
              <div className="p-4 rounded shadow-sm bg-secondary">
                <h5 className="mb-4 font-weight-bold">Envíanos un mensaje</h5>

                <form>
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nombre"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Correo electrónico"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Mensaje"
                      required
                    />
                  </div>

                  <Button color="primary" block>
                    Enviar mensaje
                  </Button>
                </form>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ================= CTA FINAL ================= */}

      <AuthFooter />
    </div>
  );
};

export default Landing;

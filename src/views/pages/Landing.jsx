import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  CardBody,
  Badge,
} from "reactstrap";

// Componentes y recursos
import AuthNavbar from "components/Navbars/AuthNavbar";
import AuthFooter from "components/Footers/AuthFooter";
import { MdLocationOn, MdPhone, MdAccessTime } from "react-icons/md";
import { FaWhatsapp, FaCut, FaUserFriends, FaCalendarCheck } from "react-icons/fa";
import logo from "assets/img/logo4.png";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white">
      
      {/* SECCIÓN HERO - Estilo Moderno Oscuro */}
      <div className="position-relative bg-darker py-7 py-lg-8" style={{
        background: "linear-gradient(150deg, #172b4d 0%, #1a174d 100%)",
        minHeight: "70vh",
        display: "flex",
        alignItems: "center"
      }}>
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg="8">
              <img
                src={logo}
                alt="La Santa Barbería"
                className="img-fluid mb-4 floating"
                style={{ width: "150px", filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.3))" }}
              />
              <h1 className="display-2 text-white font-weight-bold mb-2">
                LA SANTA BARBERÍA
              </h1>
              <p className="lead text-light mb-5">
                Elevando tu estilo con precisión. Reserva tu hora en segundos, sin esperas.
              </p>
              
              <div className="d-flex justify-content-center gap-3">
                <Button
                  className="btn-icon btn-3 px-5"
                  color="primary"
                  type="button"
                  size="lg"
                  onClick={() => navigate("/reservar")}
                >
                  <span className="btn-inner--icon"><FaCalendarCheck /></span>
                  <span className="btn-inner--text ml-2">Reservar como invitado</span>
                </Button>
                <Button
                  className="btn-neutral btn-icon px-4"
                  outline
                  size="lg"
                  onClick={() => navigate("/auth/login")}
                >
                  Iniciar sesión
                </Button>
              </div>
            </Col>
          </Row>
        </Container>

        {/* Separador curvo moderno */}
        <div className="separator separator-bottom separator-skew zindex-100">
          <svg x="0" y="0" viewBox="0 0 2560 100" preserveAspectRatio="none" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <polygon className="fill-white" points="2560 0 2560 100 0 100"></polygon>
          </svg>
        </div>
      </div>

      {/* SECCIÓN SERVICIOS RÁPIDOS */}
      <Container className="mt--6 position-relative zindex-100">
        <Row className="justify-content-center">
          {[
            { title: "Servicios", desc: "Cortes y barba premium", icon: <FaCut size={30}/>, color: "text-primary" },
            { title: "Profesionales", desc: "Expertos a tu elección", icon: <FaUserFriends size={30}/>, color: "text-info" },
            { title: "Horarios", desc: "Tú eliges el momento", icon: <MdAccessTime size={30}/>, color: "text-success" }
          ].map((item, idx) => (
            <Col lg="4" key={idx} className="mb-4">
              <Card className="shadow-lg border-0 text-center hover-lift">
                <CardBody className="py-5">
                  <div className={`${item.color} mb-3`}>{item.icon}</div>
                  <h5 className="h4 text-uppercase font-weight-bold">{item.title}</h5>
                  <p className="description mt-3 text-muted">{item.desc}</p>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* INFO DE CONTACTO Y UBICACIÓN */}
      <Container className="py-6">
        <Row className="align-items-center">
          <Col md="6" className="mb-5 mb-md-0">
            <div className="pr-md-5">
              <Badge color="primary" pill className="mb-3 text-uppercase">Ubicación & Contacto</Badge>
              <h2 className="display-4 font-weight-bold mb-4">Visítanos en Ovalle</h2>
              
              <div className="d-flex align-items-start mb-3">
                <MdLocationOn className="text-primary mt-1 mr-3" size={24} />
                <div>
                  <h6 className="mb-0">Dirección</h6>
                  <p className="text-muted">Calle Portales #310, Ovalle, Chile</p>
                </div>
              </div>

              <div className="d-flex align-items-start mb-3">
                <MdAccessTime className="text-primary mt-1 mr-3" size={24} />
                <div>
                  <h6 className="mb-0">Horarios de Atención</h6>
                  <p className="text-muted">
                    Lunes a Viernes: 08:00 – 19:00 <br/>
                    <small className="font-italic">Sábados: Exclusivo suscritos</small>
                  </p>
                </div>
              </div>

              <Button 
                color="success" 
                className="btn-icon mt-3"
                onClick={() => window.open("https://wa.me/56996817505", "_blank")}
              >
                <span className="btn-inner--icon"><FaWhatsapp size={18}/></span>
                <span className="btn-inner--text ml-2">Consultas WhatsApp</span>
              </Button>
            </div>
          </Col>
          
          <Col md="6">
            <div className="rounded shadow-xl overflow-hidden" style={{ height: "350px" }}>
              <iframe
                title="Ubicación Google Maps"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3434.7!2d-71.2!3d-30.6!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDM2JzAwLjAiUyA3McKwMTInMDAuMCJX!5e0!3m2!1ses-419!2scl!4v1630000000000!5m2!1ses-419!2scl"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              />
            </div>
          </Col>
        </Row>
      </Container>

      {/* FOOTER */}
      <section className="py-5 bg-secondary">
        <Container>
          <Row className="text-center justify-content-center">
            <Col lg="8">
              <h3 className="display-4 mb-2">¿Listo para un cambio?</h3>
              <p className="lead text-muted mb-4">No pierdas tiempo esperando. Asegura tu lugar con tu barbero favorito.</p>
              <Button color="primary" size="lg" onClick={() => navigate("/reservar")}>
                Reservar mi cita ahora
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      <AuthFooter />
    </div>
  );
};

export default Landing;
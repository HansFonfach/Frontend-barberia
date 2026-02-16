import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  CardBody,
  Badge,
  Navbar,
  Nav,
  NavItem,
  NavLink,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import { Link } from "react-router-dom";

// Iconos
import {
  FiCalendar,
  FiCheckCircle,
  FiArrowRight,
  FiInstagram,
  FiSmartphone,
  FiZap,
  FiClock,
  FiMail,
  FiFacebook,
  FiGift,
  FiStar,
  FiUsers,
  FiBell,
  FiRefreshCw,
  FiTrendingUp,
  FiMessageCircle,
  FiUserCheck,
  FiUserX,
} from "react-icons/fi";

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // DATOS REALES DE TUS NEGOCIOS (clientes que ya usan la agenda)
  const clientes = [
    {
      _id: "698de476677550fcd3d2209c",
      nombre: "La Santa Barbería",
      tipo: "barbería",
      imagen:
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=500",
      rating: "5.0",
      testimonio:
        "Antes perdía 3 horas diarias con llamadas y WhatsApp. Con AgendaFonfach recuperé mi tiempo y mis clientes felices.",
    },
    {
      _id: "698deb6b677550fcd3d22160",
      nombre: "Herradura Barberia",
      tipo: "barbería",
      imagen:
        "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=500",
      rating: "4.9",
      testimonio:
        "Mis clientes adoran el sistema de puntos. Ahora compiten por ser los más leales y yo no pierdo ni un minuto gestionando.",
    },
  ];

  // Características de TU AGENDA (lo que vendes)
  const features = [
    {
      icon: FiZap,
      title: "Cero tiempo perdido",
      desc: "Olvídate del WhatsApp y las llamadas. Todo se gestiona automático.",
      color: "#4361ee",
      detalle: "Recupera hasta 15 horas a la semana",
    },
    {
      icon: FiUsers,
      title: "Clientes que vuelven",
      desc: "Sistema de puntos y beneficios que fideliza como ningún otro.",
      color: "#f72585",
      detalle: "Aumenta la lealtad de tus clientes",
    },
    {
      icon: FiBell,
      title: "Notificaciones inteligentes",
      desc: "Te avisamos cuando se libera un horario que te interesa.",
      color: "#06d6a0",
      detalle: "Nunca más pierdas una hora",
    },
    {
      icon: FiRefreshCw,
      title: "Lista de espera automática",
      desc: "Si alguien cancela, notificamos al próximo en la lista.",
      color: "#ff9e00",
      detalle: "Tus horas siempre ocupadas",
    },
    {
      icon: FiTrendingUp,
      title: "Recordatorio inteligente",
      desc: "Sabemos cuándo tu cliente necesita volver y le avisamos.",
      color: "#7209b7",
      detalle: "Basado en su historial de reservas",
    },
    {
      icon: FiGift,
      title: "Programa de puntos",
      desc: "Acumulan por cada visita y canjean por premios. Tú eliges qué dar.",
      color: "#2ec4b6",
      detalle: "Incrementa la frecuencia de visitas",
    },
  ];

  // Funcionalidades para profesionales
  const adminFeatures = [
    {
      icon: FiUserCheck,
      title: "Gestión completa",
      desc: "Administra usuarios, profesionales, horarios y canjes desde un panel intuitivo.",
    },
    {
      icon: FiMessageCircle,
      title: "Notificaciones multicanal",
      desc: "WhatsApp, correo y notificaciones push. Todo automático.",
    },
    {
      icon: FiUserX,
      title: "Reserva como invitado o registrado",
      desc: "Máxima flexibilidad: sin registro para los rápidos, con beneficios para los fieles.",
    },
  ];

  // PLAN ÚNICO
  const plan = {
    nombre: "Plan Único",
    precio: "24.990",
    periodo: "mes",
    descripcion: "Todo lo que necesitas para nunca más perder una hora",
    incluye: [
      "Reservas ilimitadas",
      "Sistema de puntos y canjes",
      "Lista de espera automática",
      "Notificaciones WhatsApp + Email",
      "Recordatorios inteligentes de reposición",
      "Panel de administración completo",
      "Múltiples profesionales",
      "Reserva como invitado o registrado",
      "Sin comisiones por reserva",
    ],
  };

  return (
    <div style={{ backgroundColor: "#ffffff" }}>
      {/* Navbar */}
      <Navbar
        className={`fixed-top ${scrolled ? "bg-white shadow-sm py-2" : "bg-transparent py-3"}`}
        expand="md"
        style={{ transition: "all 0.3s ease" }}
      >
        <Container>
          <Link
            to="/"
            className="navbar-brand d-flex align-items-center font-weight-bold"
            style={{ color: "#1a1a1a", fontSize: "1.4rem" }}
          >
            <FiCalendar className="mr-2" style={{ color: "#f72585" }} />
            <span>
              Agenda<span style={{ color: "#4361ee" }}>Fonfach</span>
            </span>
          </Link>
          <Nav className="ml-auto align-items-center" navbar>
            <NavItem className="d-none d-md-block">
              <NavLink href="#funcionalidades" className="text-dark mr-4">
                ¿Qué hace?
              </NavLink>
            </NavItem>
            <NavItem className="d-none d-md-block">
              <NavLink href="#clientes" className="text-dark mr-4">
                Clientes felices
              </NavLink>
            </NavItem>
            <NavItem className="d-none d-md-block">
              <NavLink href="#plan-contacto" className="text-dark mr-4">
                Plan y Contacto
              </NavLink>
            </NavItem>
            <NavItem>
              <Button
                color="primary"
                pill
                className="px-4"
                style={{
                  borderRadius: "50px",
                  fontWeight: "600",
                  background: "#4361ee",
                  border: "none",
                }}
                onClick={() => (window.location.href = "/registro-negocio")}
              >
                Quiero probarlo
              </Button>
            </NavItem>
          </Nav>
        </Container>
      </Navbar>

      {/* Hero Section - Enfocado en vender la agenda */}
      <section
        className="pt-9 pb-5"
        style={{
          background: "linear-gradient(180deg, #f8faff 0%, #ffffff 100%)",
          paddingTop: "150px",
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col lg="6" className="text-center text-lg-left mb-5">
              <Badge
                color="soft-primary"
                className="mb-3 px-3 py-2"
                style={{
                  backgroundColor: "#e0e7ff",
                  color: "#4361ee",
                  borderRadius: "10px",
                }}
              >
                ⏰ Para profesionales que valoran su tiempo
              </Badge>
              <h1
                className="display-3 font-weight-bold mb-4"
                style={{ color: "#0f172a", lineHeight: "1.1" }}
              >
                Recupera <span style={{ color: "#4361ee" }}>15 horas</span>{" "}
                <br />a la semana
              </h1>
              <p
                className="lead text-muted mb-5"
                style={{ fontSize: "1.2rem" }}
              >
                Dile adiós al WhatsApp, las llamadas y los "te confirmo
                después". AgendaFonfach automatiza tus reservas, fideliza
                clientes y llena tus horas muertas.
              </p>
              <div className="d-flex justify-content-center justify-content-lg-start">
                <Button
                  size="lg"
                  className="mr-3 px-4 py-3 shadow-lg"
                  style={{
                    background: "#4361ee",
                    border: "none",
                    borderRadius: "12px",
                  }}
                  onClick={() => (window.location.href = "/registro-negocio")}
                >
                  Comenzar ahora <FiArrowRight className="ml-2" />
                </Button>
                <Button
                  size="lg"
                  outline
                  className="px-4 py-3"
                  style={{
                    borderRadius: "12px",
                    borderColor: "#4361ee",
                    color: "#4361ee",
                  }}
                  onClick={() =>
                    document
                      .getElementById("funcionalidades")
                      .scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Ver cómo funciona
                </Button>
              </div>
            </Col>
            <Col lg="6" className="position-relative">
              <div
                className="rounded-custom shadow-2xl overflow-hidden"
                style={{ borderRadius: "24px" }}
              >
                <img
                  src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800"
                  alt="Dashboard AgendaFonfach"
                  className="img-fluid"
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Sección: El problema que resolvemos - IMAGEN CAMBIADA */}
      <section className="py-6" style={{ background: "#f8f9fa" }}>
        <Container>
          <Row className="align-items-center">
            <Col lg="6" className="mb-4 mb-lg-0">
              <img
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800"
                alt="Profesional trabajando con tablet"
                className="img-fluid rounded-lg shadow"
                style={{ borderRadius: "20px" }}
              />
            </Col>
            <Col lg="6">
              <Badge
                color="danger"
                className="mb-3 px-3 py-2"
                style={{
                  backgroundColor: "#ffebee",
                  color: "#c62828",
                  borderRadius: "10px",
                }}
              >
                ⚠️ El problema
              </Badge>
              <h2 className="font-weight-bold mb-4">¿Suena familiar?</h2>
              <ul className="list-unstyled">
                <li className="mb-3 d-flex align-items-center">
                  <FiClock className="mr-3 text-danger" size={24} />
                  <span className="text-muted">
                    20 llamadas perdidas al día mientras atiendes
                  </span>
                </li>
                <li className="mb-3 d-flex align-items-center">
                  <FiMessageCircle className="mr-3 text-danger" size={24} />
                  <span className="text-muted">
                    50 mensajes de WhatsApp preguntando horarios
                  </span>
                </li>
                <li className="mb-3 d-flex align-items-center">
                  <FiUserX className="mr-3 text-danger" size={24} />
                  <span className="text-muted">
                    Clientes que no se acuerdan cuándo volver
                  </span>
                </li>
                <li className="mb-3 d-flex align-items-center">
                  <FiCalendar className="mr-3 text-danger" size={24} />
                  <span className="text-muted">
                    Horarios vacíos que podrían estar llenos
                  </span>
                </li>
              </ul>
              <p
                className="h5 font-weight-bold mt-4"
                style={{ color: "#4361ee" }}
              >
                Con AgendaFonfach, todo eso desaparece.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Funcionalidades de la agenda */}
      <section id="funcionalidades" className="py-7 bg-white">
        <Container>
          <div className="text-center mb-6">
            <h2 className="display-4 font-weight-bold">
              Tu nueva asistente 24/7
            </h2>
            <p className="text-muted">
              Automatizamos todo para que tú solo te preocupes de atender bien
            </p>
          </div>

          <Row>
            {features.map((f, i) => (
              <Col md="6" lg="4" key={i} className="mb-4">
                <Card
                  className="border-0 shadow-sm h-100 hover-lift"
                  style={{ borderRadius: "20px" }}
                >
                  <CardBody className="p-4">
                    <div
                      className="mb-3 d-inline-block p-3 rounded-circle"
                      style={{ background: `${f.color}10`, color: f.color }}
                    >
                      <f.icon size={30} />
                    </div>
                    <h4 className="font-weight-bold mb-2">{f.title}</h4>
                    <p className="text-muted mb-2">{f.desc}</p>
                    <small
                      className="font-weight-bold"
                      style={{ color: f.color }}
                    >
                      {f.detalle}
                    </small>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Funcionalidades de administración */}
          <Row className="mt-5 pt-4">
            <Col lg="12">
              <h3 className="text-center font-weight-bold mb-5">
                Todo el control en tus manos
              </h3>
            </Col>
            {adminFeatures.map((f, i) => (
              <Col md="4" key={i}>
                <div className="text-center">
                  <div
                    className="mb-3 d-inline-block p-3"
                    style={{ background: "#f0f0f0", borderRadius: "15px" }}
                  >
                    <f.icon size={30} color="#4361ee" />
                  </div>
                  <h5 className="font-weight-bold">{f.title}</h5>
                  <p className="text-muted small">{f.desc}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Clientes que ya usan la agenda (testimonios) */}
      <section id="clientes" className="py-7" style={{ background: "#f8f9fa" }}>
        <Container>
          <div className="text-center mb-6">
            <h2 className="display-4 font-weight-bold">
              Ellos ya recuperaron su tiempo
            </h2>
            <p className="text-muted">Negocios que confían en AgendaFonfach</p>
          </div>

          <Row className="justify-content-center">
            {clientes.map((cliente) => (
              <Col lg="5" md="6" key={cliente._id} className="mb-4">
                <Card
                  className="border-0 shadow h-100"
                  style={{ borderRadius: "20px" }}
                >
                  <CardBody className="p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "15px",
                          overflow: "hidden",
                          marginRight: "15px",
                        }}
                      >
                        <img
                          src={cliente.imagen}
                          alt={cliente.nombre}
                          className="w-100 h-100"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <div>
                        <h4 className="font-weight-bold mb-1">
                          {cliente.nombre}
                        </h4>
                        <Badge
                          color="light"
                          style={{
                            backgroundColor: "#e0e7ff",
                            color: "#4361ee",
                          }}
                        >
                          {cliente.tipo}
                        </Badge>
                      </div>
                    </div>

                    <div className="mb-3">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className="text-warning"
                          fill="currentColor"
                          style={{ display: "inline" }}
                        />
                      ))}
                    </div>

                    <p className="text-muted font-italic">
                      "{cliente.testimonio}"
                    </p>

                    <hr />

                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-primary font-weight-bold">
                        Cliente desde 2024
                      </small>
                      <FiCheckCircle color="#06d6a0" />
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* SECCIÓN COMBINADA: PLAN Y CONTACTO */}
      <section id="plan-contacto" className="py-7 bg-white">
        <Container>
          <div className="text-center mb-6">
            <h2 className="display-4 font-weight-bold">
              Un plan, todo incluido
            </h2>
            <p className="text-muted">
              Sin importar tu rubro, el precio es el mismo
            </p>
          </div>

          <Row className="justify-content-center">
            <Col lg="10">
              <Row>
                {/* Columna del Plan */}
                <Col md="6">
                  <Card
                    className="border-0 shadow-lg h-100"
                    style={{ borderRadius: "30px", overflow: "hidden" }}
                  >
                    <div
                      className="p-4 text-center"
                      style={{
                        background:
                          "linear-gradient(135deg, #4361ee 0%, #f72585 100%)",
                      }}
                    >
                      <Badge
                        className="mb-3"
                        style={{
                          background: "rgba(255,255,255,0.2)",
                          color: "white",
                          border: "none",
                        }}
                      >
                        PLAN ÚNICO
                      </Badge>
                      <h3 className="text-white mb-2">
                        Para cualquier profesional
                      </h3>
                      <div className="d-flex align-items-center justify-content-center">
                        <span
                          className="text-white"
                          style={{ fontSize: "3rem", fontWeight: "bold" }}
                        >
                          ${plan.precio}
                        </span>
                        <span className="text-white-50 ml-2">/{plan.periodo}</span>
                      </div>
                      <p className="text-white-50 mt-2 mb-0">
                        Barberías, salones, spa, consultorios y más
                      </p>
                    </div>

                    <CardBody className="p-4">
                      <p className="text-center text-muted mb-4">
                        {plan.descripcion}
                      </p>

                      <div className="mb-4">
                        {plan.incluye.map((item, index) => (
                          <div
                            key={index}
                            className="d-flex align-items-center mb-3"
                          >
                            <FiCheckCircle
                              className="mr-3"
                              style={{ color: "#06d6a0", fontSize: "1.2rem" }}
                            />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>

                      <Button
                        block
                        size="lg"
                        style={{
                          background: "#4361ee",
                          border: "none",
                          borderRadius: "15px",
                          padding: "15px",
                        }}
                        onClick={() => (window.location.href = "/registro-negocio")}
                      >
                        Quiero recuperar mi tiempo <FiArrowRight className="ml-2" />
                      </Button>

                      <p className="text-center text-muted small mt-3">
                        Sin permanencia. Prueba 7 días gratis.
                      </p>
                    </CardBody>
                  </Card>
                </Col>

                {/* Columna de Contacto */}
                <Col md="6">
                  <Card
                    className="border-0 shadow-lg h-100"
                    style={{ borderRadius: "30px", overflow: "hidden" }}
                  >
                    <CardBody className="p-4">
                      <div className="text-center mb-4">
                        <div
                          className="d-inline-block p-3 rounded-circle mb-3"
                          style={{ background: "#e0e7ff" }}
                        >
                          <FiMail size={30} color="#4361ee" />
                        </div>
                        <h3 className="font-weight-bold">¿Tienes dudas?</h3>
                        <p className="text-muted">
                          Contáctame directamente y te responderé a la brevedad
                        </p>
                      </div>

                      {/* Datos de contacto */}
                      <div className="mb-4 p-3" style={{ background: "#f8f9fa", borderRadius: "15px" }}>
                        <h5 className="font-weight-bold mb-3">Hans Fonfach Rodriguez</h5>
                        
                        <div className="d-flex align-items-center mb-3">
                          <FiInstagram className="mr-3" color="#4361ee" size={20} />
                          <a
                            href="https://instagram.com/hans.fonfach"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-dark"
                            style={{ textDecoration: "none" }}
                          >
                            @hans.fonfach
                          </a>
                        </div>

                        <div className="d-flex align-items-center mb-3">
                          <FiSmartphone className="mr-3" color="#25D366" size={20} />
                          <a
                            href="https://wa.me/56975297584"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-dark"
                            style={{ textDecoration: "none" }}
                          >
                            +56 9 7529 7584
                          </a>
                        </div>

                        <div className="d-flex align-items-center">
                          <FiMail className="mr-3" color="#f72585" size={20} />
                          <span className="text-dark">hans@agendafonfach.cl</span>
                        </div>
                      </div>

                      {/* Formulario simplificado */}
                      <Form>
                        <FormGroup>
                          <Input
                            type="text"
                            placeholder="Tu nombre"
                            style={{ borderRadius: "10px", marginBottom: "10px" }}
                          />
                        </FormGroup>
                        <FormGroup>
                          <Input
                            type="email"
                            placeholder="Tu email"
                            style={{ borderRadius: "10px", marginBottom: "10px" }}
                          />
                        </FormGroup>
                        <FormGroup>
                          <Input
                            type="textarea"
                            placeholder="Tu mensaje..."
                            rows="3"
                            style={{ borderRadius: "10px", marginBottom: "15px" }}
                          />
                        </FormGroup>
                        <Button
                          block
                          style={{
                            background: "#f72585",
                            border: "none",
                            borderRadius: "10px",
                            padding: "12px",
                            fontWeight: "600",
                          }}
                        >
                          Enviar mensaje <FiArrowRight className="ml-2" />
                        </Button>
                      </Form>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer simplificado */}
      <footer
        className="py-4"
        style={{ borderTop: "1px solid #eee", background: "#f8f9fa" }}
      >
        <Container>
          <Row className="align-items-center">
            <Col md="6" className="text-center text-md-left mb-3 mb-md-0">
              <div className="d-flex align-items-center justify-content-center justify-content-md-start">
                <FiCalendar style={{ color: "#f72585", fontSize: "1.5rem" }} />
                <span className="ml-2 font-weight-bold">AgendaFonfach</span>
              </div>
            </Col>

            <Col md="6" className="text-center text-md-right">
              <a
                href="https://instagram.com/hans.fonfach"
                target="_blank"
                rel="noopener noreferrer"
                className="mx-2"
              >
                <FiInstagram size={20} color="#4361ee" />
              </a>
              <a
                href="https://wa.me/56975297584"
                target="_blank"
                rel="noopener noreferrer"
                className="mx-2"
              >
                <FiSmartphone size={20} color="#25D366" />
              </a>
            </Col>
          </Row>

          <hr className="my-3" />

          <div className="text-center">
            <p className="text-muted small mb-0">
              © 2026 AgendaFonfach - Creado por Hans Fonfach Rodriguez
            </p>
            <p className="text-muted small mt-2">
              ⚡ $24.990 CLP fijos - Recupera 15 horas a la semana
            </p>
          </div>
        </Container>
      </footer>

      <style jsx>{`
        .hover-lift {
          transition: all 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1) !important;
        }
        .pt-9 {
          padding-top: 8rem;
        }
        .py-7 {
          padding-top: 6rem;
          padding-bottom: 6rem;
        }
        .mb-6 {
          margin-bottom: 4rem;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
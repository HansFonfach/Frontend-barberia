// src/views/LandingPage.jsx
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
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";

// Iconos
import {
  FiCalendar,
  FiClock,
  FiUsers,
  FiScissors,
  FiCreditCard,
  FiBell,
  FiStar,
  FiTrendingUp,
  FiCheckCircle,
  FiArrowRight,
  FiSmartphone,
  FiShield,
  FiAward,
  FiMapPin,
  FiMessageCircle,
  FiPlay,
  FiChevronRight,
  FiBarChart2,
  FiZap,
  FiLock,
  FiMail,
  FiPhone,
} from "react-icons/fi";

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { value: "10K+", label: "Reservas mensuales", icon: FiCalendar, color: "#4361ee" },
    { value: "500+", label: "Barberías activas", icon: FiScissors, color: "#f72585" },
    { value: "98%", label: "Clientes satisfechos", icon: FiStar, color: "#fb8500" },
    { value: "24/7", label: "Disponibilidad", icon: FiClock, color: "#06d6a0" },
  ];

  const features = [
    {
      icon: FiCalendar,
      title: "Reservas en línea",
      description: "Tus clientes pueden reservar 24/7 desde cualquier dispositivo, sin necesidad de llamadas.",
      color: "#4361ee",
      bgColor: "#e0e7ff",
    },
    {
      icon: FiUsers,
      title: "Gestión de barberos",
      description: "Administra múltiples barberos, sus horarios y especialidades desde un solo lugar.",
      color: "#f72585",
      bgColor: "#ffe0f0",
    },
    {
      icon: FiCreditCard,
      title: "Pagos integrados",
      description: "Acepta pagos con tarjeta, transferencias o pago en efectivo. Todo sincronizado.",
      color: "#fb8500",
      bgColor: "#fff3e0",
    },
    {
      icon: FiBell,
      title: "Recordatorios automáticos",
      description: "Notificaciones por WhatsApp y email para reducir inasistencias.",
      color: "#06d6a0",
      bgColor: "#e0f7f0",
    },
    {
      icon: FiBarChart2,
      title: "Reportes y estadísticas",
      description: "Visualiza tus ingresos, ocupación y rendimiento en tiempo real.",
      color: "#7209b7",
      bgColor: "#f0e0ff",
    },
    {
      icon: FiSmartphone,
      title: "App para clientes",
      description: "Tus clientes pueden gestionar sus reservas desde su celular.",
      color: "#4cc9f0",
      bgColor: "#e0f5ff",
    },
  ];

  const pricingPlans = [
    {
      name: "Básico",
      price: "$0",
      period: "mes",
      description: "Para empezar",
      features: [
        "Hasta 50 reservas/mes",
        "1 barbero",
        "Recordatorios básicos",
        "Soporte email",
      ],
      buttonColor: "primary",
      buttonText: "Comenzar gratis",
      popular: false,
    },
    {
      name: "Profesional",
      price: "$29.990",
      period: "mes",
      description: "Para barberías en crecimiento",
      features: [
        "Reservas ilimitadas",
        "Hasta 5 barberos",
        "Recordatorios WhatsApp",
        "Estadísticas avanzadas",
        "Pagos integrados",
        "Soporte prioritario",
      ],
      buttonColor: "success",
      buttonText: "Probar 14 días gratis",
      popular: true,
    },
    {
      name: "Empresarial",
      price: "$59.990",
      period: "mes",
      description: "Para múltiples sucursales",
      features: [
        "Todo lo del plan Profesional",
        "Barberos ilimitados",
        "Múltiples sucursales",
        "API personalizada",
        "Gerente dedicado",
        "Capacitación incluida",
      ],
      buttonColor: "info",
      buttonText: "Contactar ventas",
      popular: false,
    },
  ];

  const testimonials = [
    {
      name: "Carlos Rodríguez",
      role: "Dueño de 'La Elegancia'",
      content: "Desde que uso AgendaFonfach, mis ingresos aumentaron un 40%. Mis clientes aman poder reservar online y yo amo no tener que contestar el teléfono todo el día.",
      rating: 5,
      avatar: "👨🏻",
      color: "#4361ee",
    },
    {
      name: "Miguel Ángel",
      role: "Barbero independiente",
      content: "La mejor inversión que he hecho para mi negocio. Los recordatorios por WhatsApp redujeron mis inasistencias a casi cero.",
      rating: 5,
      avatar: "👨🏽",
      color: "#f72585",
    },
    {
      name: "Patricia Muñoz",
      role: "Gerente de 'Studio P'",
      content: "Poder gestionar 8 barberos desde una sola plataforma es increíble. El panel de control es súper intuitivo.",
      rating: 5,
      avatar: "👩🏻",
      color: "#fb8500",
    },
  ];

  const faqs = [
    {
      question: "¿Cómo empiezo a usar AgendaFonfach?",
      answer: "Regístrate gratis, configura tus servicios y barberos, y comienza a recibir reservas en minutos. No necesitas tarjeta de crédito para empezar."
    },
    {
      question: "¿Puedo probar antes de comprar?",
      answer: "¡Claro! Ofrecemos 14 días gratis del plan Profesional, sin compromiso. Puedes cancelar cuando quieras."
    },
    {
      question: "¿Qué pasa si tengo más de un local?",
      answer: "Nuestro plan Empresarial te permite gestionar múltiples sucursales con un solo inicio de sesión. Cada local puede tener sus propios barberos y horarios."
    },
    {
      question: "¿Los clientes necesitan crear una cuenta?",
      answer: "No, pueden reservar ingresando solo su RUT y teléfono. Si lo prefieren, pueden crear una cuenta para ver su historial."
    }
  ];

  const handleReservarClick = () => {
    if (isAuthenticated && user?.rol === "cliente") {
      navigate("/reservar-hora");
    } else if (isAuthenticated && user?.rol === "barbero") {
      navigate("/admin/mis-reservas");
    } else {
      navigate("/auth/login");
    }
  };

  return (
    <>
      {/* Navbar más claro */}
      <Navbar
        className={`navbar-top fixed-top px-0 px-md-4 ${
          scrolled ? "navbar-scrolled bg-white shadow-sm" : "bg-transparent"
        }`}
        expand="md"
        style={{
          transition: "all 0.3s ease",
        }}
      >
        <Container fluid className="px-4">
          <Navbar brand>
            <Link
              to="/"
              className="navbar-brand font-weight-bold"
              style={{ 
                fontSize: "1.5rem",
                color: scrolled ? "#4361ee" : "white",
              }}
            >
              <FiScissors className="mr-2" />
              Agenda<span style={{ color: "#f72585" }}>Fonfach</span>
            </Link>
          </Navbar>

          <Nav className="ml-auto" navbar>
            {isAuthenticated ? (
              <>
                <NavItem>
                  <NavLink
                    tag={Link}
                    to={user?.rol === "admin" ? "/admin/dashboard" : "/dashboard"}
                    style={{ color: scrolled ? "#4361ee" : "white" }}
                  >
                    Dashboard
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    tag={Link}
                    to="/perfil"
                    style={{ color: scrolled ? "#4361ee" : "white" }}
                  >
                    Mi Perfil
                  </NavLink>
                </NavItem>
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret style={{ color: scrolled ? "#4361ee" : "white" }}>
                    {user?.nombre || "Usuario"}
                  </DropdownToggle>
                  <DropdownMenu right>
                    <DropdownItem tag={Link} to="/perfil">
                      Perfil
                    </DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem tag={Link} to="/logout">
                      Cerrar sesión
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </>
            ) : (
              <>
                <NavItem>
                  <NavLink
                    tag={Link}
                    to="/auth/login"
                    style={{ color: scrolled ? "#4361ee" : "white" }}
                  >
                    Iniciar sesión
                  </NavLink>
                </NavItem>
                <NavItem>
                  <Button
                    color="primary"
                    size="sm"
                    className="ml-2"
                    tag={Link}
                    to="/auth/register"
                    style={{
                      background: scrolled ? "#4361ee" : "white",
                      color: scrolled ? "white" : "#4361ee",
                      border: "none"
                    }}
                  >
                    Registrarse
                  </Button>
                </NavItem>
              </>
            )}
          </Nav>
        </Container>
      </Navbar>

      {/* Hero Section - Más claro y vibrante */}
      <section
        className="section-hero"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          minHeight: "100vh",
          paddingTop: "80px",
        }}
      >
        <Container className="pt-5">
          <Row className="align-items-center min-vh-100">
            <Col lg="6" className="text-white mb-5 mb-lg-0">
              <Badge 
                color="light" 
                pill 
                className="px-3 py-2 mb-4"
                style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "none" }}
              >
                ⚡ La #1 en gestión de barberías
              </Badge>
              <h1 className="display-3 font-weight-bold mb-4">
                La plataforma que
                <span style={{ color: "#ffd166" }}> transforma </span>
                tu barbería
              </h1>
              <p className="lead mb-4" style={{ color: "rgba(255,255,255,0.9)" }}>
                AgendaFonfach automatiza tus reservas, reduce las inasistencias y aumenta tus ingresos. Todo en un solo lugar, desde cualquier dispositivo.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Button
                  color="light"
                  size="lg"
                  className="mr-3 mb-2"
                  onClick={handleReservarClick}
                  style={{ 
                    background: "white", 
                    color: "#667eea",
                    border: "none",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
                  }}
                >
                  {isAuthenticated ? "Ir a mi cuenta" : "Comenzar gratis"}
                  <FiArrowRight className="ml-2" />
                </Button>
                <Button
                  outline
                  color="light"
                  size="lg"
                  className="mb-2"
                  style={{ border: "2px solid white", color: "white" }}
                  onClick={() => {
                    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <FiPlay className="mr-2" />
                  Ver demo
                </Button>
              </div>
              <div className="mt-5 d-flex align-items-center">
                <div className="d-flex mr-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="rounded-circle bg-white mr-2"
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundImage: `url(https://randomuser.me/api/portraits/men/${i}.jpg)`,
                        backgroundSize: "cover",
                        border: "2px solid white",
                      }}
                    />
                  ))}
                </div>
                <div>
                  <strong className="text-white d-block">+500 barberías</strong>
                  <small style={{ color: "rgba(255,255,255,0.8)" }}>confían en nosotros</small>
                </div>
              </div>
            </Col>
            <Col lg="6" className="text-center">
              <img
                src="https://via.placeholder.com/600x400/ffffff/667eea?text=Dashboard+Preview"
                alt="Dashboard"
                className="img-fluid rounded-lg shadow-lg"
                style={{ maxHeight: "500px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section - Más colorido */}
      <section className="py-5" style={{ background: "#f8f9fa" }}>
        <Container>
          <Row>
            {stats.map((stat, index) => (
              <Col md="3" sm="6" key={index} className="mb-4 mb-md-0">
                <div className="text-center">
                  <div 
                    className="rounded-circle d-inline-flex p-3 mb-3"
                    style={{ background: stat.color + '20' }}
                  >
                    <stat.icon size={30} style={{ color: stat.color }} />
                  </div>
                  <h2 className="font-weight-bold mb-1" style={{ color: stat.color }}>
                    {stat.value}
                  </h2>
                  <p className="text-muted mb-0">{stat.label}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section id="features" className="py-7" style={{ background: "white" }}>
        <Container>
          <Row className="text-center mb-5">
            <Col lg="8" className="mx-auto">
              <Badge color="primary" pill className="px-3 py-2 mb-4" style={{ background: "#667eea" }}>
                🚀 CARACTERÍSTICAS
              </Badge>
              <h2 className="display-4 font-weight-bold mb-3">
                Todo lo que necesitas para
                <span style={{ color: "#667eea" }}> crecer</span>
              </h2>
              <p className="lead text-muted">
                Una plataforma completa que automatiza tu barbería y mejora la experiencia de tus clientes
              </p>
            </Col>
          </Row>

          <Row>
            {features.map((feature, index) => (
              <Col lg="4" md="6" key={index} className="mb-4">
                <Card className="shadow-sm h-100 border-0 hover-scale">
                  <CardBody className="p-4">
                    <div
                      className="rounded-circle d-inline-flex p-3 mb-3"
                      style={{ backgroundColor: feature.bgColor }}
                    >
                      <feature.icon size={24} style={{ color: feature.color }} />
                    </div>
                    <h5 className="font-weight-bold mb-2">{feature.title}</h5>
                    <p className="text-muted mb-0">{feature.description}</p>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* How it works */}
      <section className="py-7" style={{ background: "#f8f9fa" }}>
        <Container>
          <Row className="text-center mb-5">
            <Col lg="8" className="mx-auto">
              <Badge color="success" pill className="px-3 py-2 mb-4" style={{ background: "#06d6a0" }}>
                ⚙️ CÓMO FUNCIONA
              </Badge>
              <h2 className="display-4 font-weight-bold mb-3">
                Reserva en <span style={{ color: "#06d6a0" }}>3 simples pasos</span>
              </h2>
              <p className="lead text-muted">
                Para tus clientes es súper fácil, para ti es automático
              </p>
            </Col>
          </Row>

          <Row>
            {[
              {
                step: 1,
                title: "Elige servicio y barbero",
                description: "Tus clientes ven disponibilidad en tiempo real y eligen quién los atenderá",
                icon: FiUsers,
                color: "#4361ee",
              },
              {
                step: 2,
                title: "Selecciona día y hora",
                description: "Solo las horas disponibles se muestran, evitando conflictos",
                icon: FiCalendar,
                color: "#f72585",
              },
              {
                step: 3,
                title: "Confirma y recibe recordatorios",
                description: "Reserva confirmada al instante y recordatorios automáticos",
                icon: FiCheckCircle,
                color: "#06d6a0",
              },
            ].map((item) => (
              <Col md="4" key={item.step}>
                <div className="text-center px-4">
                  <div className="position-relative mb-4">
                    <div 
                      className="rounded-circle text-white d-inline-flex p-4"
                      style={{ background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)` }}
                    >
                      <item.icon size={32} />
                    </div>
                    <div 
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                      style={{ background: item.color }}
                    >
                      {item.step}
                    </div>
                  </div>
                  <h5 className="font-weight-bold mb-2">{item.title}</h5>
                  <p className="text-muted">{item.description}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Pricing */}
      <section className="py-7" style={{ background: "white" }}>
        <Container>
          <Row className="text-center mb-5">
            <Col lg="8" className="mx-auto">
              <Badge color="warning" pill className="px-3 py-2 mb-4" style={{ background: "#fb8500" }}>
                💰 PRECIOS
              </Badge>
              <h2 className="display-4 font-weight-bold mb-3">
                Planes para <span style={{ color: "#fb8500" }}>todos</span>
              </h2>
              <p className="lead text-muted">
                Elige el plan que mejor se adapte a tu negocio. Cancela cuando quieras.
              </p>
            </Col>
          </Row>

          <Row>
            {pricingPlans.map((plan, index) => (
              <Col lg="4" md="6" key={index} className="mb-4">
                <Card
                  className={`shadow-sm h-100 border-0 ${plan.popular ? "popular-plan" : ""}`}
                  style={
                    plan.popular
                      ? {
                          transform: "scale(1.05)",
                          border: "2px solid #fb8500",
                          position: "relative",
                        }
                      : {}
                  }
                >
                  {plan.popular && (
                    <div
                      className="position-absolute top-0 start-50 translate-middle"
                      style={{ transform: "translate(-50%, -50%)" }}
                    >
                      <Badge color="warning" pill className="px-3 py-2" style={{ background: "#fb8500" }}>
                        ⭐ MÁS POPULAR
                      </Badge>
                    </div>
                  )}
                  <CardBody className="p-4">
                    <h4 className="font-weight-bold mb-1">{plan.name}</h4>
                    <p className="text-muted small">{plan.description}</p>
                    <div className="mb-4">
                      <span className="display-4 font-weight-bold" style={{ color: plan.popular ? "#fb8500" : "#4361ee" }}>
                        {plan.price}
                      </span>
                      <span className="text-muted">/{plan.period}</span>
                    </div>
                    <ul className="list-unstyled mb-4">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="mb-2">
                          <FiCheckCircle className="text-success mr-2" size={18} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      color={plan.buttonColor}
                      block
                      size="lg"
                      tag={Link}
                      to={plan.popular ? "/auth/register" : "/contacto"}
                      style={{
                        background: plan.popular ? "#fb8500" : plan.buttonColor === "primary" ? "#4361ee" : "#06d6a0",
                        border: "none"
                      }}
                    >
                      {plan.buttonText}
                    </Button>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="py-7" style={{ background: "#f8f9fa" }}>
        <Container>
          <Row className="text-center mb-5">
            <Col lg="8" className="mx-auto">
              <Badge color="info" pill className="px-3 py-2 mb-4" style={{ background: "#4cc9f0" }}>
                💬 TESTIMONIOS
              </Badge>
              <h2 className="display-4 font-weight-bold mb-3">
                Lo que dicen <span style={{ color: "#4cc9f0" }}>nuestros clientes</span>
              </h2>
              <p className="lead text-muted">
                Más de 500 barberías ya confían en nosotros
              </p>
            </Col>
          </Row>

          <Row>
            {testimonials.map((testimonial, index) => (
              <Col lg="4" md="6" key={index} className="mb-4">
                <Card className="shadow-sm h-100 border-0">
                  <CardBody className="p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div
                        className="rounded-circle text-white d-flex align-items-center justify-content-center mr-3"
                        style={{ 
                          width: "50px", 
                          height: "50px", 
                          fontSize: "24px",
                          background: `linear-gradient(135deg, ${testimonial.color} 0%, ${testimonial.color}dd 100%)`
                        }}
                      >
                        {testimonial.avatar}
                      </div>
                      <div>
                        <h6 className="font-weight-bold mb-0">{testimonial.name}</h6>
                        <small className="text-muted">{testimonial.role}</small>
                      </div>
                    </div>
                    <div className="mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <FiStar key={i} style={{ color: "#fb8500", fill: "#fb8500" }} size={18} />
                      ))}
                    </div>
                    <p className="text-muted mb-0">"{testimonial.content}"</p>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-7" style={{ background: "white" }}>
        <Container>
          <Row className="text-center mb-5">
            <Col lg="8" className="mx-auto">
              <Badge color="secondary" pill className="px-3 py-2 mb-4" style={{ background: "#7209b7" }}>
                ❓ PREGUNTAS FRECUENTES
              </Badge>
              <h2 className="display-4 font-weight-bold mb-3">
                Todo lo que <span style={{ color: "#7209b7" }}>necesitas saber</span>
              </h2>
              <p className="lead text-muted">
                Respuestas a las dudas más comunes
              </p>
            </Col>
          </Row>

          <Row>
            <Col lg="8" className="mx-auto">
              {faqs.map((faq, index) => (
                <Card key={index} className="shadow-sm mb-3 border-0">
                  <CardBody>
                    <h6 className="font-weight-bold mb-2">
                      <FiChevronRight style={{ color: "#7209b7" }} className="mr-2" />
                      {faq.question}
                    </h6>
                    <p className="text-muted mb-0 ml-4">{faq.answer}</p>
                  </CardBody>
                </Card>
              ))}
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA - Más vibrante */}
      <section className="py-7" style={{ 
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}>
        <Container>
          <Row className="align-items-center">
            <Col lg="8" className="text-white mb-4 mb-lg-0">
              <h2 className="display-4 font-weight-bold mb-3">
                Comienza a transformar tu barbería hoy
              </h2>
              <p className="lead mb-0" style={{ color: "rgba(255,255,255,0.9)" }}>
                Regístrate gratis y descubre por qué +500 barberías ya confían en nosotros
              </p>
            </Col>
            <Col lg="4" className="text-lg-right">
              <Button
                color="light"
                size="lg"
                className="mr-3"
                tag={Link}
                to="/auth/register"
                style={{ 
                  background: "white", 
                  color: "#667eea",
                  border: "none",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
                }}
              >
                Crear cuenta gratis
                <FiArrowRight className="ml-2" />
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer - Más claro */}
      <footer className="py-7" style={{ background: "#2d3748", color: "white" }}>
        <Container>
          <Row>
            <Col lg="4" className="mb-5 mb-lg-0">
              <h4 className="mb-4 font-weight-bold">
                <FiScissors className="mr-2" />
                Agenda<span style={{ color: "#f72585" }}>Fonfach</span>
              </h4>
              <p style={{ color: "rgba(255,255,255,0.7)" }} className="mb-4">
                La plataforma #1 en gestión de reservas para barberías y peluquerías en Chile.
              </p>
              <div className="d-flex">
                {[FiMessageCircle, FiMapPin, FiClock].map((Icon, i) => (
                  <div
                    key={i}
                    className="rounded-circle p-2 mr-2"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  >
                    <Icon size={18} className="text-white" />
                  </div>
                ))}
              </div>
            </Col>
            <Col lg="2" md="6" className="mb-5 mb-lg-0">
              <h6 className="text-white font-weight-bold mb-4">Producto</h6>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Link to="/caracteristicas" style={{ color: "rgba(255,255,255,0.7)" }}>Características</Link>
                </li>
                <li className="mb-2">
                  <Link to="/precios" style={{ color: "rgba(255,255,255,0.7)" }}>Precios</Link>
                </li>
                <li className="mb-2">
                  <Link to="/demo" style={{ color: "rgba(255,255,255,0.7)" }}>Demo</Link>
                </li>
              </ul>
            </Col>
            <Col lg="2" md="6" className="mb-5 mb-lg-0">
              <h6 className="text-white font-weight-bold mb-4">Compañía</h6>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Link to="/nosotros" style={{ color: "rgba(255,255,255,0.7)" }}>Sobre nosotros</Link>
                </li>
                <li className="mb-2">
                  <Link to="/blog" style={{ color: "rgba(255,255,255,0.7)" }}>Blog</Link>
                </li>
                <li className="mb-2">
                  <Link to="/contacto" style={{ color: "rgba(255,255,255,0.7)" }}>Contacto</Link>
                </li>
              </ul>
            </Col>
            <Col lg="4" md="12">
              <h6 className="text-white font-weight-bold mb-4">Newsletter</h6>
              <p style={{ color: "rgba(255,255,255,0.7)" }} className="mb-3">
                Suscríbete para recibir tips y novedades
              </p>
              <div className="d-flex">
                <input
                  type="email"
                  className="form-control mr-2"
                  placeholder="tu@email.com"
                  style={{ 
                    background: "rgba(255,255,255,0.1)", 
                    border: "none",
                    color: "white"
                  }}
                />
                <Button color="primary" style={{ background: "#f72585", border: "none" }}>
                  Enviar
                </Button>
              </div>
            </Col>
          </Row>
          <hr style={{ background: "rgba(255,255,255,0.1)" }} className="my-5" />
          <Row>
            <Col md="6" className="text-center text-md-left">
              <p style={{ color: "rgba(255,255,255,0.5)" }} className="mb-0">
                © 2024 AgendaFonfach. Todos los derechos reservados.
              </p>
            </Col>
            <Col md="6" className="text-center text-md-right">
              <Link to="/terminos" style={{ color: "rgba(255,255,255,0.5)" }} className="mr-3">Términos</Link>
              <Link to="/privacidad" style={{ color: "rgba(255,255,255,0.5)" }}>Privacidad</Link>
            </Col>
          </Row>
        </Container>
      </footer>

      <style jsx>{`
        .hover-scale {
          transition: transform 0.3s ease;
        }
        .hover-scale:hover {
          transform: translateY(-5px);
        }
        .popular-plan {
          transition: transform 0.3s ease;
        }
        .popular-plan:hover {
          transform: scale(1.07);
        }
        .section-hero {
          position: relative;
          overflow: hidden;
        }
        .section-hero::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="%23ffffff" fill-opacity="0.1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"/></svg>');
          background-repeat: no-repeat;
          background-position: bottom;
          background-size: cover;
          opacity: 0.5;
        }
        .navbar-scrolled {
          backdrop-filter: blur(10px);
        }
      `}</style>
    </>
  );
};

export default LandingPage;
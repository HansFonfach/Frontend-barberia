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
  FiGift,
  FiStar,
  FiUsers,
  FiBell,
  FiRefreshCw,
  FiTrendingUp,
  FiMessageCircle,
  FiUserCheck,
  FiUserX,
  FiAward,
  FiHeart,
  FiThumbsUp,
  FiShield,
} from "react-icons/fi";

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [testimoniosActivos, setTestimoniosActivos] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cliente real
  const clienteReal = {
    _id: "698de476677550fcd3d2209c",
    nombre: "La Santa Barbería",
    tipo: "barbería",
    imagen:
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=500",
    rating: "5.0",
    testimonio:
      "Antes me llegaban decenas de WhatsApp y llamadas todos los días. Perdía mucho tiempo respondiendo y agendando a mano, incluso en la noche. Con AgendaFonfach, la mayoría de las reservas se hacen solas y hoy casi no tengo que contestar mensajes.",
    dueño: "Ale Robledo",
    años: 15,
    profesionales: 1,
    reservasMes: 180,
  };

  // Testimonios simulados (basados en problemas reales)
  const testimoniosSimulados = [
  
  ];

  // Características de TU AGENDA (lo que vendes)
  const features = [
    {
      icon: FiZap,
      title: "Cero tiempo perdido",
      desc: "Olvídate del WhatsApp y las llamadas. Todo se gestiona automático.",
      color: "#4361ee",
      detalle: "Recupera hasta 15 horas a la semana",
      stats: "+40% productividad"
    },
    {
      icon: FiUsers,
      title: "Clientes que vuelven",
      desc: "Sistema de puntos y beneficios que fideliza como ningún otro.",
      color: "#f72585",
      detalle: "Aumenta la lealtad de tus clientes",
      stats: "+60% recompra"
    },
    {
      icon: FiBell,
      title: "Notificaciones inteligentes",
      desc: "Te avisamos cuando se libera un horario que te interesa.",
      color: "#06d6a0",
      detalle: "Nunca más pierdas una hora",
      stats: "0 horas vacías"
    },
    {
      icon: FiRefreshCw,
      title: "Lista de espera automática",
      desc: "Si alguien cancela, notificamos al próximo en la lista.",
      color: "#ff9e00",
      detalle: "Tus horas siempre ocupadas",
      stats: "100% ocupación"
    },
    {
      icon: FiTrendingUp,
      title: "Recordatorio inteligente",
      desc: "Sabemos cuándo tu cliente necesita volver y le avisamos.",
      color: "#7209b7",
      detalle: "Basado en su historial de reservas",
      stats: "+35% visitas"
    },
    {
      icon: FiGift,
      title: "Programa de puntos",
      desc: "Acumulan por cada visita y canjean por premios. Tú eliges qué dar.",
      color: "#2ec4b6",
      detalle: "Incrementa la frecuencia de visitas",
      stats: "2x frecuencia"
    },
  ];

  // Funcionalidades para profesionales
  const adminFeatures = [
    {
      icon: FiUserCheck,
      title: "Gestión completa",
      desc: "Administra usuarios, profesionales, horarios y canjes desde un panel intuitivo.",
      color: "#4361ee"
    },
    {
      icon: FiMessageCircle,
      title: "Notificaciones multicanal",
      desc: "WhatsApp, correo y notificaciones push. Todo automático.",
      color: "#f72585"
    },
    {
      icon: FiUserX,
      title: "Reserva como invitado o registrado",
      desc: "Máxima flexibilidad: sin registro para los rápidos, con beneficios para los fieles.",
      color: "#06d6a0"
    },
  ];

  // Negocios que pueden usar la agenda
  const rubros = [
    { nombre: "Barberías", icon: "💈", count: 1 },
    { nombre: "Peluquerías", icon: "💇‍♀️", count: 0 },
    { nombre: "Centros de estética", icon: "✨", count: 0 },
    { nombre: "Spa", icon: "🧖‍♀️", count: 0 },
    { nombre: "Masajes", icon: "💆‍♂️", count: 0 },
    { nombre: "Tatuajes", icon: "🖋️", count: 0 },
    { nombre: "Consultorios", icon: "🏥", count: 0 },
    { nombre: "Clínicas dentales", icon: "🦷", count: 0 },
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
              <NavLink href="#testimonios" className="text-dark mr-4">
                Resultados reales
              </NavLink>
            </NavItem>
            <NavItem className="d-none d-md-block">
              <NavLink href="#plan-contacto" className="text-dark mr-4">
                Plan y Contacto
              </NavLink>
            </NavItem>
            <NavItem>
        
            </NavItem>
          </Nav>
        </Container>
      </Navbar>

      {/* Hero Section - Más enfocado en beneficios */}
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
                className="mb-3 px-3 py-2"
                style={{
                  background: "linear-gradient(135deg, #4361ee 0%, #f72585 100%)",
                  color: "white",
                  borderRadius: "50px",
                  border: "none"
                }}
              >
                ⚡ Lanzamiento - Precio especial
              </Badge>

              <h1 className="display-3 font-weight-bold mb-4">
                Automatiza tus reservas y{" "}
                <span style={{ color: "#f72585" }}>recupera tu tiempo</span>
              </h1>

              <p
                className="lead text-muted mb-5"
                style={{ fontSize: "1.2rem" }}
              >
                Dile adiós al WhatsApp, las llamadas y los "te confirmo después". 
                AgendaFonfach automatiza tus reservas, fideliza clientes y llena tus horas muertas.
              </p>

              {/* Stats rápidas */}
              <Row className="mb-5">
                <Col xs={4} className="text-center">
                  <h3 className="font-weight-bold mb-0" style={{ color: "#4361ee" }}>15h</h3>
                  <small className="text-muted">semanales recuperadas</small>
                </Col>
                <Col xs={4} className="text-center">
                  <h3 className="font-weight-bold mb-0" style={{ color: "#f72585" }}>+40%</h3>
                  <small className="text-muted">más reservas</small>
                </Col>
                <Col xs={4} className="text-center">
                  <h3 className="font-weight-bold mb-0" style={{ color: "#06d6a0" }}>0%</h3>
                  <small className="text-muted">comisión por reserva</small>
                </Col>
              </Row>

              <div className="d-flex justify-content-center justify-content-lg-start">
                <Button
                  size="lg"
                  className="mr-3 px-4 py-3 shadow-lg text-white"
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

      {/* Sección: Para quién es - NUEVA */}
      <section className="py-6" style={{ background: "#ffffff" }}>
        <Container>
          <div className="text-center mb-5">
            <Badge
              className="mb-3 px-3 py-2"
              style={{
                background: "#e0e7ff",
                color: "#4361ee",
                borderRadius: "50px"
              }}
            >
              📋 Para todo tipo de negocios
            </Badge>
            <h2 className="display-4 font-weight-bold">
              ¿Tienes un negocio de atención al cliente?
            </h2>
            <p className="text-muted">
              AgendaFonfach funciona para cualquier rubro que requiera reservas
            </p>
          </div>

          <Row className="justify-content-center">
            {rubros.map((rubro, index) => (
              <Col xs={6} md={3} key={index} className="mb-3">
                <div className="text-center p-3">
                  <span style={{ fontSize: "2rem" }}>{rubro.icon}</span>
                  <h6 className="mt-2 mb-1">{rubro.nombre}</h6>
                  {rubro.count > 0 && (
                    <Badge color="success" pill>Ya en uso</Badge>
                  )}
                </div>
              </Col>
            ))}
          </Row>

          <div className="text-center mt-4">
            <p className="text-muted">
              <FiShield className="mr-2" style={{ color: "#4361ee" }} />
              Todos los rubros tienen el mismo precio:{" "}
              <strong>$24.990 CLP/mes</strong>
            </p>
          </div>
        </Container>
      </section>

      {/* Sección: El problema que resolvemos */}
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
                className="mb-3 px-3 py-2"
                style={{
                  background: "#ffebee",
                  color: "#c62828",
                  borderRadius: "50px",
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
            <Badge
              className="mb-3 px-3 py-2"
              style={{
                background: "#e0e7ff",
                color: "#4361ee",
                borderRadius: "50px"
              }}
            >
              🚀 Funcionalidades
            </Badge>
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
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div
                        className="p-3 rounded-circle"
                        style={{ background: `${f.color}10`, color: f.color }}
                      >
                        <f.icon size={30} />
                      </div>
                      <Badge
                        style={{
                          background: `${f.color}20`,
                          color: f.color,
                          border: "none"
                        }}
                      >
                        {f.stats}
                      </Badge>
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
        </Container>
      </section>

      {/* Testimonios - Combinando real y simulados */}
      <section id="testimonios" className="py-7" style={{ background: "#f8f9fa" }}>
        <Container>
          <div className="text-center mb-6">
            <Badge
              className="mb-3 px-3 py-2"
              style={{
                background: "linear-gradient(135deg, #4361ee 0%, #f72585 100%)",
                color: "white",
                borderRadius: "50px"
              }}
            >
              ⭐ Resultados que hablan
            </Badge>
            <h2 className="display-4 font-weight-bold">
              Lo que dicen los profesionales
            </h2>
            <p className="text-muted">
              Historias reales de negocios que ya están usando AgendaFonfach
            </p>
          </div>

          <Row>
            {/* Cliente Real destacado */}
            <Col lg={12} className="mb-5">
              <Card
                className="border-0 shadow-lg"
                style={{ borderRadius: "30px", overflow: "hidden" }}
              >
                <Row className="g-0">
                  <Col md={4}>
                    <img
                      src={clienteReal.imagen}
                      alt={clienteReal.nombre}
                      className="img-fluid h-100"
                      style={{ objectFit: "cover", width: "100%" }}
                    />
                  </Col>
                  <Col md={8}>
                    <CardBody className="p-5">
                      <div className="d-flex align-items-center mb-3">
                        <Badge
                          className="mr-3"
                          style={{
                            background: "#4361ee",
                            color: "white",
                            borderRadius: "50px",
                            padding: "8px 16px"
                          }}
                        >
                          ⭐ Cliente real
                        </Badge>
                        <h4 className="font-weight-bold mb-0">{clienteReal.nombre}</h4>
                      </div>
                      
                      <div className="d-flex mb-4">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className="text-warning"
                            fill="currentColor"
                            size={20}
                          />
                        ))}
                      </div>

                      <p className="lead mb-4 font-italic">
                        "{clienteReal.testimonio}"
                      </p>

                      <Row>
                        <Col xs={6} md={3} className="mb-3">
                          <small className="text-muted d-block">Dueño</small>
                          <strong>{clienteReal.dueño}</strong>
                        </Col>
                        <Col xs={6} md={3} className="mb-3">
                          <small className="text-muted d-block">Trayectoria</small>
                          <strong>{clienteReal.años} años</strong>
                        </Col>
                        <Col xs={6} md={3} className="mb-3">
                          <small className="text-muted d-block">Profesionales</small>
                          <strong>{clienteReal.profesionales}</strong>
                        </Col>
                        <Col xs={6} md={3} className="mb-3">
                          <small className="text-muted d-block">Reservas/mes</small>
                          <strong>+{clienteReal.reservasMes}</strong>
                        </Col>
                      </Row>

                      <Button
                        color="link"
                        className="p-0 mt-3"
                        onClick={() =>
                          (window.location.href = "/lasantabarberia")
                        }
                      >
                        Ver perfil público <FiArrowRight />
                      </Button>
                    </CardBody>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          <Row>
            {testimoniosSimulados.map((testimonio, index) => (
              <Col md={4} key={index} className="mb-4">
                <Card
                  className="border-0 shadow h-100 hover-lift"
                  style={{ borderRadius: "20px" }}
                >
                  <CardBody className="p-4">
                    <div className="d-flex align-items-center mb-3">
                      <img
                        src={testimonio.avatar}
                        alt={testimonio.nombre}
                        className="rounded-circle mr-3"
                        width="50"
                        height="50"
                      />
                      <div>
                        <h5 className="font-weight-bold mb-0">{testimonio.nombre}</h5>
                        <small className="text-muted">{testimonio.negocio}</small>
                      </div>
                    </div>

                    <Badge
                      className="mb-3"
                      style={{
                        background: "#e0e7ff",
                        color: "#4361ee",
                        borderRadius: "50px"
                      }}
                    >
                      {testimonio.tipo}
                    </Badge>

                    <p className="text-muted font-italic mb-3">
                      "{testimonio.testimonio}"
                    </p>

                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <small className="text-success">
                        <FiCheckCircle className="mr-1" />
                        Problema resuelto: {testimonio.problemaResuelto}
                      </small>
                      <small className="text-muted">
                        {testimonio.mesesUsando}
                      </small>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Badge de confianza */}
          <div className="text-center mt-5">
            <div className="d-inline-flex align-items-center p-3 bg-white rounded-pill shadow-sm">
              <FiHeart className="mr-2" color="#f72585" />
              <span className="mr-3">Únete a</span>
              <strong style={{ color: "#4361ee" }}>La Santa Barbería</strong>
              <span className="mx-2">y otros profesionales</span>
              <FiUsers className="ml-2" color="#4361ee" />
            </div>
          </div>
        </Container>
      </section>

      {/* SECCIÓN COMBINADA: PLAN Y CONTACTO */}
      <section id="plan-contacto" className="py-7 bg-white">
        <Container>
          <div className="text-center mb-6">
            <Badge
              className="mb-3 px-3 py-2"
              style={{
                background: "linear-gradient(135deg, #4361ee 0%, #f72585 100%)",
                color: "white",
                borderRadius: "50px"
              }}
            >
              💎 Precio único
            </Badge>
            <h2 className="display-4 font-weight-bold">
              Un plan, todo incluido
            </h2>
            <p className="text-muted">
              Sin importar el tamaño de tu negocio, el precio es el mismo
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
                          borderRadius: "50px",
                          padding: "8px 16px"
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
                        <span className="text-white-50 ml-2">
                          /{plan.periodo}
                        </span>
                      </div>
                      <p className="text-white-50 mt-2 mb-0">
                        Barberías, salones, spa, consultorios y más
                      </p>
                    </div>

                    <CardBody className="p-4">
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

                      

                      <p className="text-center text-muted small mt-3">
                        <FiShield className="mr-1" /> Sin permanencia. 7 días gratis.
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
                        <h3 className="font-weight-bold">¿Te interesa o tienes dudas?</h3>
                        <p className="text-muted">
                          Contáctame directamente y te responderé a la brevedad
                        </p>
                      </div>

                      {/* Datos de contacto */}
                      <div
                        className="mb-4 p-3"
                        style={{ background: "#f8f9fa", borderRadius: "15px" }}
                      >
                        <h5 className="font-weight-bold mb-3">
                          Hans Fonfach Rodriguez
                        </h5>

                        <div className="d-flex align-items-center mb-3">
                          <FiInstagram
                            className="mr-3"
                            color="#4361ee"
                            size={20}
                          />
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
                          <FiSmartphone
                            className="mr-3"
                            color="#25D366"
                            size={20}
                          />
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
                          <span className="text-dark">
                            contacto@agendafonfach.cl
                          </span>
                        </div>
                      </div>

                      {/* Formulario simplificado */}
                      <Form>
                        <FormGroup>
                          <Input
                            type="text"
                            placeholder="Tu nombre"
                            style={{
                              borderRadius: "10px",
                              marginBottom: "10px",
                            }}
                          />
                        </FormGroup>
                        <FormGroup>
                          <Input
                            type="email"
                            placeholder="Tu email"
                            style={{
                              borderRadius: "10px",
                              marginBottom: "10px",
                            }}
                          />
                        </FormGroup>
                        <FormGroup>
                          <Input
                            type="textarea"
                            placeholder="Escribe tu mensaje..."
                            rows="3"
                            style={{
                              borderRadius: "10px",
                              marginBottom: "15px",
                            }}
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

      {/* Footer */}
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

          <Row>
            <Col md="6" className="text-center text-md-left">
              <p className="text-muted small mb-0">
                © 2026 AgendaFonfach - Creado por Hans Fonfach.
              </p>
            </Col>
            <Col md="6" className="text-center text-md-right">
              <p className="text-muted small mb-0">
                ⚡ $24.990 CLP fijos - Sin comisiones - 7 días gratis
              </p>
            </Col>
          </Row>
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
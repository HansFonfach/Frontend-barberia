import React, { useState, useEffect } from "react";
import {
  Container, Row, Col, Card, CardBody,
  Input, Button, Badge, Form, FormGroup,
  NavItem, Nav, Navbar,
} from "reactstrap";
import { FiArrowRight, FiCalendar, FiCheckCircle } from "react-icons/fi";
import { Link, NavLink } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { postRegistroEmpresa } from "api/empresa";

const RegistrarNegocio = () => {
  const [form, setForm] = useState({
    nombre: "",
    tipo: "barberia",
    telefono: "",
    correo: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await postRegistroEmpresa(form);
      setExito(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Ocurrió un error, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const WHATSAPP_NUMBER = "56975297584";
  const MESSAGE = encodeURIComponent("Hola, estoy interesado en probar la agenda para mi negocio");
  const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${MESSAGE}`;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #f8faff 0%, #ffffff 100%)", paddingTop: "120px" }}>
      <Navbar
        className={`fixed-top ${scrolled ? "bg-white shadow-sm py-2" : "bg-transparent py-3"}`}
        expand="md"
        style={{ transition: "all 0.3s ease" }}
      >
        <Container>
          <Link to="/" className="navbar-brand d-flex align-items-center font-weight-bold" style={{ color: "#1a1a1a", fontSize: "1.4rem" }}>
            <FiCalendar className="mr-2" style={{ color: "#f72585" }} />
            <span>Agenda<span style={{ color: "#4361ee" }}>Fonfach</span></span>
          </Link>
          <Nav className="ml-auto align-items-center" navbar>
            <NavItem className="d-none d-md-block">
              <NavLink href="#funcionalidades" className="text-dark mr-4">¿Qué hace?</NavLink>
            </NavItem>
            <NavItem className="d-none d-md-block">
              <NavLink href="#testimonios" className="text-dark mr-4">Resultados reales</NavLink>
            </NavItem>
            <NavItem className="d-none d-md-block">
              <NavLink href="#plan-contacto" className="text-dark mr-4">Plan y Contacto</NavLink>
            </NavItem>
            <NavItem>
              <Button
                className="px-4 d-flex align-items-center gap-2"
                style={{ borderRadius: "50px", fontWeight: "600", background: "#25D366", border: "none", color: "white" }}
                onClick={() => window.open(WHATSAPP_URL, "_blank")}
              >
                <FaWhatsapp size={20} /> Quiero probarlo
              </Button>
            </NavItem>
          </Nav>
        </Container>
      </Navbar>

      <Container>
        <Row className="justify-content-center">
          <Col lg="6">
            <div className="text-center mb-5">
              <Badge className="mb-3 px-3 py-2" style={{ background: "linear-gradient(135deg, #4361ee 0%, #f72585 100%)", color: "white", borderRadius: "50px" }}>
                🚀 Prueba gratis 7 días
              </Badge>
              <h2 className="font-weight-bold">Crea tu negocio en minutos</h2>
              <p className="text-muted">Empieza a recibir reservas automáticas hoy mismo</p>
            </div>

            {/* ✅ CONDICIONAL EXITO */}
            {exito ? (
              <Card className="border-0 shadow-lg text-center" style={{ borderRadius: "24px" }}>
                <CardBody className="p-5">
                  <FiCheckCircle size={56} color="#06d6a0" className="mb-3" />
                  <h4 className="font-weight-bold">¡Negocio creado!</h4>
                  <p className="text-muted mt-3">
                    Revisa tu correo <strong>{form.correo}</strong> — te enviamos tus credenciales para ingresar al panel.
                  </p>
                  <p className="text-muted small">
                    Si no lo ves en unos minutos, revisa la carpeta de spam.
                  </p>
                </CardBody>
              </Card>
            ) : (
              <Card className="border-0 shadow-lg" style={{ borderRadius: "24px" }}>
                <CardBody className="p-4">
                  <Form onSubmit={handleSubmit}>
                    <FormGroup>
                      <label className="font-weight-bold">Nombre del negocio</label>
                      <Input
                        name="nombre"
                        placeholder="Ej: Barbería Elite"
                        value={form.nombre}
                        onChange={handleChange}
                        required
                        style={{ borderRadius: "10px" }}
                      />
                    </FormGroup>

                    {/* ✅ TIPO COMO SELECT CON VALORES DEL ENUM */}
                    <FormGroup>
                      <label className="font-weight-bold">Tipo de negocio</label>
                      <Input
                        type="select"
                        name="tipo"
                        value={form.tipo}
                        onChange={handleChange}
                        style={{ borderRadius: "10px" }}
                      >
                        <option value="barberia">Barbería</option>
                        <option value="peluqueria">Peluquería</option>
                        <option value="salon_belleza">Salón de belleza</option>
                        <option value="spa">Spa</option>
                        <option value="centro_estetica">Centro de estética</option>
                         <option value="otros">Otros</option>
                      </Input>
                    </FormGroup>

                    <FormGroup>
                      <label className="font-weight-bold">Teléfono (WhatsApp)</label>
                      <Input
                        name="telefono"
                        placeholder="9 1234 5678"
                        value={form.telefono}
                        onChange={handleChange}
                        required
                        style={{ borderRadius: "10px" }}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label className="font-weight-bold">Correo</label>
                      <Input
                        type="email"
                        name="correo"
                        placeholder="contacto@negocio.cl"
                        value={form.correo}
                        onChange={handleChange}
                        required
                        style={{ borderRadius: "10px" }}
                      />
                    </FormGroup>

                    <div className="p-3 mb-4" style={{ background: "#f8f9fa", borderRadius: "15px" }}>
                      <div className="d-flex align-items-center mb-2">
                        <FiCheckCircle className="mr-2" color="#06d6a0" />
                        <small>7 días gratis</small>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <FiCheckCircle className="mr-2" color="#06d6a0" />
                        <small>Sin tarjeta de crédito</small>
                      </div>
                      <div className="d-flex align-items-center">
                        <FiCheckCircle className="mr-2" color="#06d6a0" />
                        <small>Activa en menos de 5 minutos</small>
                      </div>
                    </div>

                    {error && (
                      <div className="mb-3 p-3 text-center" style={{ background: "#fff0f0", borderRadius: "10px", color: "#c0392b", fontSize: "14px" }}>
                        {error}
                      </div>
                    )}

                    <Button
                      block
                      type="submit"
                      disabled={loading}
                      className="text-white"
                      style={{ background: "linear-gradient(135deg, #4361ee, #f72585)", border: "none", borderRadius: "12px", padding: "14px", fontWeight: "600" }}
                    >
                      {loading ? "Creando..." : <> Crear mi negocio <FiArrowRight className="ml-2" /></>}
                    </Button>
                  </Form>
                </CardBody>
              </Card>
            )}

            <p className="text-center text-muted small mt-3">
              No necesitas tarjeta. Puedes cancelar cuando quieras.
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default RegistrarNegocio;
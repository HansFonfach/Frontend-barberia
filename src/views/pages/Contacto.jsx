import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Form,
  FormGroup,
  Input,
  Button,
  CardTitle,
  CardText,
  Badge
} from "reactstrap";
import UserHeader from "components/Headers/UserHeader";

// Íconos de react-icons
import {
  MdMail,
  MdPhone,
  MdLocationOn,
  MdAccessTime,
  MdPerson,
  MdMessage,
  MdOutlineSchedule
} from "react-icons/md";
import { FaWhatsapp, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import Swal from "sweetalert2";

const Contacto = () => {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    Swal.fire({
      title: "¡Mensaje Enviado!",
      text: "Gracias por contactarnos. Te responderemos dentro de 24 horas.",
      icon: "success",
      confirmButtonColor: "#fb6340",
      confirmButtonText: "Entendido",
      timer: 3000
    });
    setForm({ nombre: "", email: "", telefono: "", mensaje: "" });
  };

  const contactInfo = [
    {
      icon: <MdLocationOn size={24} />,
      title: "Dirección",
      content: "Calle Portales #310, Ovalle, Chile",
      color: "primary",
      badge: "📍"
    },
    {
      icon: <MdPhone size={24} />,
      title: "Teléfono / WhatsApp",
      content: "+56 9 9681 7505",
      color: "success",
      badge: "📱",
      action: "https://wa.me/56996817505"
    },
    {
      icon: <MdMail size={24} />,
      title: "Email",
      content: "alerobledo26@gmail.com",
      color: "warning",
      badge: "✉️",
      action: "mailto:alerobledo26@gmail.com"
    },
    {
      icon: <MdAccessTime size={24} />,
      title: "Horario de Atención",
      content: "Lunes a Viernes 8:00 - 19:00 hrs",
      subcontent: "Sábado solo suscritos",
      color: "info",
      badge: "🕒"
    }
  ];

  return (
    <>
      <UserHeader 
        title="Contacto" 
        subtitle="Contáctanos para reservas, consultas o información"
        background="bg-gradient-primary"
      />

      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col lg="8" xl="9">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-transparent pb-5">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h2 className="display-4 text-primary mb-0">La Santa Barbería</h2>
                    <p className="lead text-muted mb-0">💈 Cortes clásicos con estilo moderno</p>
                  </div>
                  <Badge color="success" pill className="px-4 py-2">
                    <MdOutlineSchedule className="mr-2" />
                    Abierto ahora
                  </Badge>
                </div>
              </CardHeader>

              <CardBody className="px-lg-5 py-lg-5">
                <Row>
                  {/* Información de Contacto */}
                  <Col lg="5" className="mb-5 mb-lg-0">
                    <h3 className="h2 text-primary mb-4">Información de Contacto</h3>
                    <p className="lead text-muted mb-5">
                      Estamos aquí para ayudarte. Visítanos, llámanos o envíanos un mensaje.
                    </p>
                    
                    {contactInfo.map((item, index) => (
                      <Card 
                        key={index} 
                        className="card-lift--hover shadow-sm border-0 mb-4"
                        style={{ cursor: item.action ? 'pointer' : 'default' }}
                        onClick={() => item.action && window.open(item.action, '_blank')}
                      >
                        <CardBody>
                          <Row className="align-items-center">
                            <Col xs="auto">
                              <div className={`icon icon-shape icon-shape-${item.color} rounded-circle`}>
                                {item.icon}
                              </div>
                            </Col>
                            <Col>
                              <CardTitle tag="h5" className={`text-${item.color} mb-1`}>
                                {item.title}
                              </CardTitle>
                              <CardText className="mb-0 text-default font-weight-bold">
                                {item.content}
                              </CardText>
                              {item.subcontent && (
                                <CardText className="text-muted text-sm mt-1">
                                  <FaClock className="mr-1" size={14} />
                                  {item.subcontent}
                                </CardText>
                              )}
                            </Col>
                            <Col xs="auto">
                              <span className="h3 mb-0">{item.badge}</span>
                            </Col>
                          </Row>
                        </CardBody>
                      </Card>
                    ))}

                    {/* Mapa de ubicación */}
                    <div className="mt-5">
                      <h4 className="h5 text-primary mb-3">Ubicación</h4>
                      <div className="card shadow-sm border-0">
                        <CardBody className="p-3">
                          <div className="embed-responsive embed-responsive-16by9 rounded">
                            <iframe
                              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3445.185714285718!2d-71.2076884848207!3d-30.601910581793234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x968f33b0c3c0c0c1%3A0x1c3b9d1b1b1b1b1b!2sCalle%20Portales%20310%2C%20Ovalle%2C%20Chile!5e0!3m2!1ses!2scl!4v1620000000000!5m2!1ses!2scl"
                              width="100%"
                              height="200"
                              style={{ border: 0 }}
                              allowFullScreen=""
                              loading="lazy"
                              title="Ubicación La Santa Barbería"
                            ></iframe>
                          </div>
                        </CardBody>
                      </div>
                    </div>
                  </Col>

                  {/* Formulario de Contacto */}
                  <Col lg="7">
                    <div className="pl-lg-4">
                      <div className="card shadow border-0">
                        <CardBody className="px-lg-5 py-lg-5">
                          <h3 className="h2 text-primary mb-4">Envíanos un mensaje</h3>
                          <p className="text-muted mb-4">
                            Completa el formulario y te contactaremos a la brevedad.
                          </p>
                          
                          <Form onSubmit={handleSubmit}>
                            <Row>
                              <Col md="6">
                                <FormGroup>
                                  <label className="form-control-label">
                                    <MdPerson className="mr-2" />
                                    Nombre completo
                                  </label>
                                  <Input
                                    type="text"
                                    name="nombre"
                                    placeholder="Tu nombre"
                                    value={form.nombre}
                                    onChange={handleChange}
                                    required
                                    className="form-control-alternative"
                                  />
                                </FormGroup>
                              </Col>
                              <Col md="6">
                                <FormGroup>
                                  <label className="form-control-label">
                                    <MdMail className="mr-2" />
                                    Email
                                  </label>
                                  <Input
                                    type="email"
                                    name="email"
                                    placeholder="tucorreo@ejemplo.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    className="form-control-alternative"
                                  />
                                </FormGroup>
                              </Col>
                            </Row>
                            
                            <FormGroup>
                              <label className="form-control-label">
                                <MdPhone className="mr-2" />
                                Teléfono
                              </label>
                              <Input
                                type="tel"
                                name="telefono"
                                placeholder="+56 9 1234 5678"
                                value={form.telefono}
                                onChange={handleChange}
                                required
                                className="form-control-alternative"
                              />
                            </FormGroup>
                            
                            <FormGroup>
                              <label className="form-control-label">
                                <MdMessage className="mr-2" />
                                Mensaje
                              </label>
                              <Input
                                type="textarea"
                                name="mensaje"
                                placeholder="¿En qué podemos ayudarte?"
                                rows="5"
                                value={form.mensaje}
                                onChange={handleChange}
                                required
                                className="form-control-alternative"
                              />
                            </FormGroup>
                            
                            <div className="text-center">
                              <Button
                                color="success"
                                type="submit"
                                className="mt-4 px-5 py-3"
                                size="lg"
                              >
                                <FaWhatsapp className="mr-2" />
                                Enviar mensaje
                              </Button>
                            </div>
                          </Form>
                          
                          {/* Información adicional */}
                          <div className="mt-5 pt-4 border-top">
                            <Row className="text-center">
                              <Col md="6" className="mb-3 mb-md-0">
                                <div className="h5 text-primary">Respuesta rápida</div>
                                <p className="text-sm text-muted">
                                  Respondemos en menos de 24 horas
                                </p>
                              </Col>
                              <Col md="6">
                                <div className="h5 text-primary">Reservas confirmadas</div>
                                <p className="text-sm text-muted">
                                  Recibirás confirmación vía WhatsApp
                                </p>
                              </Col>
                            </Row>
                          </div>
                        </CardBody>
                      </div>
                    </div>
                  </Col>
                </Row>
              </CardBody>
              
              {/* Footer */}
              <div className="card-footer bg-gradient-success border-0 pt-5 pb-4">
                <Container>
                  <Row className="align-items-center">
                    <Col md="8">
                      <h2 className="text-white mb-2 ">La Santa Barbería</h2>
                      <p className="text-white mb-0">
                        💈 Experiencia premium en cortes de cabello y cuidado personal
                      </p>
                    </Col>
                    <Col md="4" className="text-md-right">
                      <Button
                        color="success"
                        className="btn-icon-only rounded-circle"
                        onClick={() => window.open('https://wa.me/56996817505', '_blank')}
                      >
                        <FaWhatsapp size={20} />
                      </Button>
                      <Button
                        color="primary"
                        className="btn-icon-only rounded-circle ml-2"
                        onClick={() => window.open('tel:+56996817505', '_blank')}
                      >
                        <MdPhone size={20} />
                      </Button>
                    </Col>
                  </Row>
                </Container>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Contacto;
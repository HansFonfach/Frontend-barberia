import React, { useState } from "react";
import { Container, Row, Col, Card, CardBody, CardHeader } from "reactstrap";
import UserHeader from "components/Headers/UserHeader";

const SubscriptionPage = () => {
  const [copiedField, setCopiedField] = useState(null);

  const benefits = [
    {
      icon: "⏰",
      title: "Reserva anticipada",
      description:
        "Podrás agendar tus turnos con 30 días de anticipación. Los demás clientes solo podrán hacerlo 15 días antes.",
    },
    {
      icon: "📅",
      title: "Uso del mes siguiente",
      description:
        "La membresía se paga por adelantado. Si la adquieres en octubre, podrás usarla durante noviembre.",
    },
    {
      icon: "💈",
      title: "Horarios exclusivos de sábado",
      description:
        "Acceso especial a horarios reservados los sábados: 10:00, 11:00, 12:00 y 13:00 hs.",
    },
    {
      icon: "✂️",
      title: "Dos cortes por mes",
      description:
        "Tu membresía incluye dos cortes dentro del mes de uso, con prioridad en la reserva.",
    },
    {
      icon: "🚫",
      title: "Uso personal",
      description:
        "La membresía es intransferible. Solo el titular registrado puede utilizarla.",
    },
    {
      icon: "💸",
      title: "Pago anticipado",
      description:
        "El pago se realiza con anticipación para garantizar tu lugar y mantener la exclusividad.",
    },
  ];

  const bankDetails = [
    { label: "Banco", value: "Banco Estado" },
    { label: "Tipo de Cuenta", value: "Cuenta Vista" },
    { label: "Número de Cuenta", value: "1234-5678-9012-3456" },
    { label: "Titular", value: "Barbería Ejemplo" },
    { label: "RUT", value: "19.301.809-2" },
    { label: "Monto", value: "$25.000 CLP" },
  ];

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
      })
      .catch((err) => console.error("Error al copiar:", err));
  };

  const openWhatsApp = () => {
    const message =
      "Hola, quiero activar mi membresía. Adjunto el comprobante de transferencia 💈";
    const phoneNumber = "56975297584";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
  };

  return (
    <>
      <UserHeader />

      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col lg="10">
            <Card className="shadow border-0">
              {/* ENCABEZADO DE LA TARJETA */}
              <CardHeader className="bg-transparent text-center">
                <h2 className="font-weight-bold mb-2">
                  Membresía Barbería Premium
                </h2>

                <p className="text-warning mb-2 font-weight-bold">
                  Reserva anticipada, horarios exclusivos y atención prioritaria
                </p>

                <div className="price-tag bg-gradient-primary text-white d-inline-block px-4 py-2 rounded-pill">
                  <span className="h3 font-weight-bold mb-0">$25.000</span>
                  <span className="ml-2">/mensual</span>
                </div>
              </CardHeader>

              {/* CUERPO PRINCIPAL */}
              <CardBody>
                {/* SECCIÓN BENEFICIOS */}
                <Row className="mb-5">
                  <Col>
                    <h4 className="text-center font-weight-bold mb-4">
                      Beneficios Exclusivos
                    </h4>
                    <p className="text-center text-muted mb-4">
                      Disfruta de estos privilegios como miembro premium
                    </p>
                    
                    <Row>
                      {benefits.map((benefit, index) => (
                        <Col key={index} md="6" className="mb-4">
                          <Card className="h-100 border-0 shadow-sm">
                            <CardBody className="d-flex align-items-start">
                              <div className="mr-3" style={{ fontSize: "2rem" }}>
                                {benefit.icon}
                              </div>
                              <div>
                                <h6 className="font-weight-bold mb-2">
                                  {benefit.title}
                                </h6>
                                <p className="text-muted small mb-0">
                                  {benefit.description}
                                </p>
                              </div>
                            </CardBody>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Col>
                </Row>

                {/* SECCIÓN CÓMO SUSCRIBIRSE */}
                <Row className="mb-5">
                  <Col>
                    <h4 className="text-center font-weight-bold mb-4">
                      Cómo Activar tu Membresía
                    </h4>
                    
                    <Row className="text-center">
                      <Col md="4" className="mb-3">
                        <div className="step-circle bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                             style={{ width: "50px", height: "50px" }}>
                          1
                        </div>
                        <h6 className="font-weight-bold">Realiza la transferencia</h6>
                        <p className="text-muted small">
                          Utiliza los datos bancarios proporcionados
                        </p>
                      </Col>
                      
                      <Col md="4" className="mb-3">
                        <div className="step-circle bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                             style={{ width: "50px", height: "50px" }}>
                          2
                        </div>
                        <h6 className="font-weight-bold">Guarda el comprobante</h6>
                        <p className="text-muted small">
                          Conserva el comprobante de pago
                        </p>
                      </Col>
                      
                      <Col md="4" className="mb-3">
                        <div className="step-circle bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                             style={{ width: "50px", height: "50px" }}>
                          3
                        </div>
                        <h6 className="font-weight-bold">Envía por WhatsApp</h6>
                        <p className="text-muted small">
                          Comparte el comprobante para activar
                        </p>
                      </Col>
                    </Row>
                  </Col>
                </Row>

                {/* SECCIÓN DATOS BANCARIOS */}
                <Row className="mb-5">
                  <Col>
                    <Card className="bg-light border-0">
                      <CardBody>
                        <h5 className="text-center font-weight-bold mb-4">
                          Datos Bancarios
                        </h5>
                        
                        {bankDetails.map((detail, index) => (
                          <Row key={index} className="align-items-center mb-3">
                            <Col sm="3">
                              <strong>{detail.label}</strong>
                            </Col>
                            <Col sm="6">
                              <code className="bg-white p-2 rounded border w-100">
                                {detail.value}
                              </code>
                            </Col>
                            <Col sm="3">
                              <button
                                className={`btn btn-sm ${
                                  copiedField === detail.label 
                                    ? 'btn-success' 
                                    : 'btn-outline-primary'
                                } w-100`}
                                onClick={() => copyToClipboard(detail.value, detail.label)}
                              >
                                {copiedField === detail.label ? '✓ Copiado' : 'Copiar'}
                              </button>
                            </Col>
                          </Row>
                        ))}
                      </CardBody>
                    </Card>
                  </Col>
                </Row>

                {/* SECCIÓN WHATSAPP */}
                <Row>
                  <Col>
                    <Card className="bg-gradient-success text-white border-0">
                      <CardBody className="text-center">
                        <h5 className="font-weight-bold mb-3">
                          ¿Ya realizaste la transferencia?
                        </h5>
                        <p className="mb-4">
                          Envía el comprobante por WhatsApp para activar tu membresía inmediatamente
                        </p>
                        <button 
                          className="btn btn-white btn-lg font-weight-bold"
                          onClick={openWhatsApp}
                        >
                          📱 Enviar por WhatsApp
                        </button>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default SubscriptionPage;
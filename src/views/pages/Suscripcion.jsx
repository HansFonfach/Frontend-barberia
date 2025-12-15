import React, { useState } from "react";
import { Container, Row, Col, Card, CardBody, CardHeader, Spinner } from "reactstrap";
import UserHeader from "components/Headers/UserHeader";
import { iniciarPagoSuscripcion } from "api/pagos";
import Swal from "sweetalert2";

const SubscriptionPage = () => {
  const [loading, setLoading] = useState(false);
  const [suscripcionData, setSuscripcionData] = useState(null);

  const benefits = [
    { icon: "⏰", title: "Reserva anticipada", description: "Podrás agendar tus turnos con 30 días de anticipación." },
    { icon: "📅", title: "Uso del mes siguiente", description: "La membresía se paga por adelantado y se usa el mes siguiente." },
    { icon: "💈", title: "Horarios exclusivos de sábado", description: "Sábados: 10:00, 11:00, 12:00 y 13:00." },
    { icon: "✂️", title: "Dos cortes por mes", description: "Incluye dos cortes mensuales con prioridad." },
    { icon: "🚫", title: "Uso personal", description: "Intransferible, solo para el titular." },
    { icon: "💸", title: "Pago anticipado", description: "Pago previo para mantener tu cupo exclusivo." },
  ];

  const startPayment = async () => {
    try {
      setLoading(true);
      const res = await iniciarPagoSuscripcion();

      // Guardamos algunos datos temporales de la transacción para mostrar en UI si quieres
      setSuscripcionData({
        buyOrder: res.buyOrder,
        monto: 25000,
      });

      // Crear formulario para Webpay
      const form = document.createElement("form");
      form.method = "POST";
      form.action = res.url;
      form.style.display = "none";

      const tokenInput = document.createElement("input");
      tokenInput.type = "hidden";
      tokenInput.name = "token_ws";
      tokenInput.value = res.token;
      form.appendChild(tokenInput);

      document.body.appendChild(form);

      // Mostrar mensaje breve
      Swal.fire({
        title: "Redirigiendo a Transbank...",
        text: "Por favor espera mientras se procesa tu pago.",
        didOpen: () => {
          Swal.showLoading();
        },
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      setTimeout(() => form.submit(), 1000);
    } catch (error) {
      setLoading(false);
      console.error("Error iniciando pago:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.error || error.message,
      });
    }
  };

  return (
    <>
      <UserHeader />
      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col lg="10">
            <Card className="shadow border-0">
              <CardHeader className="bg-transparent text-center">
                <h2 className="font-weight-bold mb-2">Membresía Barbería Premium</h2>
                <p className="text-warning mb-2 font-weight-bold">
                  Reserva anticipada, horarios exclusivos y atención prioritaria
                </p>
                <div className="price-tag bg-gradient-success text-white d-inline-block px-4 py-2 rounded-pill">
                  <span className="h3 font-weight-bold mb-0">$25.000</span>
                  <span className="ml-2">/ mensual</span>
                </div>
              </CardHeader>
              <CardBody>
                {/* Beneficios */}
                <Row className="mb-5">
                  {benefits.map((b, i) => (
                    <Col key={i} md="6" className="mb-4">
                      <Card className="h-100 shadow-sm border-0">
                        <CardBody className="d-flex align-items-start">
                          <div style={{ fontSize: "2rem", marginRight: "1rem" }}>{b.icon}</div>
                          <div>
                            <h6 className="font-weight-bold mb-1">{b.title}</h6>
                            <p className="text-muted small mb-0">{b.description}</p>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {/* Pago */}
                <Row className="mb-5">
                  <Col>
                    <Card className="bg-gradient-success text-white shadow border-0">
                      <CardBody className="text-center">
                        {!suscripcionData ? (
                          <>
                            <h4 className="font-weight-bold mb-3">Activar Membresía</h4>
                            <p className="mb-4">Realiza tu pago online de forma rápida y segura.</p>
                            <button
                              className="btn bg-yellow btn-lg font-weight-bold px-5 py-3"
                              onClick={startPayment}
                              disabled={loading}
                            >
                              {loading ? (
                                <>
                                  <Spinner size="sm" /> Procesando...
                                </>
                              ) : (
                                "💳 Pagar con Webpay"
                              )}
                            </button>
                          </>
                        ) : (
                          <>
                            <h4 className="font-weight-bold mb-3">Suscripción Iniciada</h4>
                            <p className="mb-2">Tu pago fue iniciado correctamente. Serás redirigido a Transbank.</p>
                            <p className="mb-0">ID Transacción: <strong>{suscripcionData.buyOrder}</strong></p>
                            <p className="mb-0">Monto: <strong>${suscripcionData.monto.toLocaleString()}</strong></p>
                          </>
                        )}
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

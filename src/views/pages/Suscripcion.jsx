import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Spinner,
} from "reactstrap";
import UserHeader from "components/Headers/UserHeader";
import { iniciarPagoSuscripcion } from "api/pagos";
import Swal from "sweetalert2";

const SubscriptionPage = () => {
  const [loading, setLoading] = useState(false);
  const [suscripcionData, setSuscripcionData] = useState(null);

  const benefits = [
    {
      icon: "📅",
      title: "Acceso a sábados",
      description:
        "Reserva horarios exclusivos los días sábado, disponibles solo para suscriptores.",
    },
    {
      icon: "💸",
      title: "Ahorro garantizado",
      description:
        "Dos servicios por $25.000. Precio normal $30.000. Ahorras todos los meses.",
    },
    {
      icon: "⏳",
      title: "Agenda extendida",
      description:
        "Reserva con hasta 31 días de anticipación (16 días más que un usuario normal).",
    },
    {
      icon: "⭐",
      title: "Atención preferente",
      description:
        "Prioridad en horarios y cupos, incluso en fechas de alta demanda.",
    },
    {
      icon: "🎁",
      title: "Puntos adicionales",
      description:
        "Recibe puntos extra al suscribirte y accede a futuros beneficios.",
    },
    {
      icon: "🚫",
      title: "Membresía personal",
      description:
        "Suscripción intransferible, diseñada para clientes frecuentes.",
    },
  ];

  const startPayment = async () => {
    try {
      setLoading(true);
      const res = await iniciarPagoSuscripcion();

      setSuscripcionData({
        buyOrder: res.buyOrder,
        monto: 25000,
      });

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

      Swal.fire({
        title: "Redirigiendo a Transbank...",
        text: "Estás a un paso de asegurar tu membresía exclusiva.",
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      setTimeout(() => form.submit(), 1000);
    } catch (error) {
      setLoading(false);
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
          <Col xl="9" lg="10">
            <Card className="shadow-lg border-0">
              {/* HEADER */}
              <CardHeader className="bg-transparent text-center pb-4">
                <h1 className="font-weight-bold mb-2">
                  Membresía Barbería Premium
                </h1>

                <p className="text-warning font-weight-bold mb-3">
                  Exclusividad, ahorro y prioridad real en tu agenda
                </p>

                <div className="d-inline-flex align-items-center bg-gradient-success text-white px-4 py-3 rounded-pill shadow">
                  <span className="h2 font-weight-bold mb-0">$25.000</span>
                  <span className="ml-2">/ mes</span>
                </div>

                <p className="text-muted mt-3 mb-1">
                  Valor normal: <del>$30.000</del> · Ahorras $5.000 cada mes
                </p>

                <span className="badge badge-warning mt-2">
                  Cupos limitados · Atención preferente garantizada
                </span>
              </CardHeader>

              <CardBody className="px-lg-5">
                {/* BENEFICIOS */}
                <Row className="mb-5">
                  {benefits.map((b, i) => (
                    <Col key={i} md="6" className="mb-4">
                      <Card className="h-100 border-0 shadow-sm">
                        <CardBody className="d-flex">
                          <div
                            className="mr-3 d-flex align-items-center justify-content-center rounded-circle bg-gradient-success text-white"
                            style={{
                              width: 48,
                              height: 48,
                              fontSize: "1.4rem",
                              flexShrink: 0,
                            }}
                          >
                            {b.icon}
                          </div>
                          <div>
                            <h6 className="font-weight-bold mb-1">
                              {b.title}
                            </h6>
                            <p className="text-muted small mb-0">
                              {b.description}
                            </p>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {/* CTA */}
                <Row>
                  <Col>
                    <Card className="bg-gradient-success text-white border-0 shadow-lg">
                      <CardBody className="text-center py-5">
                        {!suscripcionData ? (
                          <>
                            <h3 className="font-weight-bold mb-3">
                              Asegura tu cupo mensual
                            </h3>

                            <p className="mb-4">
                              Limitamos la cantidad de suscriptores para
                              garantizar horarios preferentes y atención
                              personalizada.
                            </p>

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
                                "💳 Suscribirme ahora"
                              )}
                            </button>

                            <p className="text-white-50 small mt-3 mb-0">
                              Membresía exclusiva · Uso personal · No
                              transferible
                            </p>
                          </>
                        ) : (
                          <>
                            <h4 className="font-weight-bold mb-3">
                              Suscripción iniciada
                            </h4>
                            <p className="mb-2">
                              Serás redirigido a Transbank para completar el
                              pago.
                            </p>
                            <p className="mb-0">
                              Transacción:{" "}
                              <strong>{suscripcionData.buyOrder}</strong>
                            </p>
                            <p className="mb-0">
                              Monto:{" "}
                              <strong>
                                ${suscripcionData.monto.toLocaleString()}
                              </strong>
                            </p>
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

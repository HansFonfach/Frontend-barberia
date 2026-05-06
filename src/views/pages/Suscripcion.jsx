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
  const [copiado, setCopiado] = useState(null);

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

  const datosCuenta = [
    { label: "Nombre", value: "Alejandro Daniel Robledo" },
    { label: "RUT", value: "24.153.990-3" },
    { label: "Banco", value: "Mercado Pago" },
    { label: "Tipo de cuenta", value: "Cuenta Vista" },
    { label: "N° de cuenta", value: "1039233588" },
    { label: "Correo", value: "alerobledo26@gmail.com" },
  ];

  const copiar = (value, label) => {
    navigator.clipboard.writeText(value);
    setCopiado(label);
    setTimeout(() => setCopiado(null), 2000);
  };

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
                            <h6 className="font-weight-bold mb-1">{b.title}</h6>
                            <p className="text-muted small mb-0">
                              {b.description}
                            </p>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {/* DATOS DE TRANSFERENCIA */}
                <Row className="mb-4">
                  <Col>
                    <Card className="border-0 shadow-sm">
                      <CardBody>
                        <div className="d-flex align-items-center mb-3">
                          <span style={{ fontSize: "1.4rem" }} className="mr-2">
                            🏦
                          </span>
                          <div>
                            <h5 className="font-weight-bold mb-0">
                              Paga por transferencia
                            </h5>
                            <p className="text-muted small mb-0">
                              Envía el comprobante al WhatsApp del local para
                              activar tu membresía
                            </p>
                          </div>
                        </div>

                        <div
                          style={{
                            background: "#f8f9fa",
                            borderRadius: "12px",
                            overflow: "hidden",
                            border: "1px solid #e9ecef",
                          }}
                        >
                          {datosCuenta.map(({ label, value }) => (
                            <div
                              key={label}
                              className="d-flex justify-content-between align-items-center px-3 py-2"
                              style={{ borderBottom: "1px solid #e9ecef" }}
                            >
                              <small className="text-muted">{label}</small>
                              <div className="d-flex align-items-center">
                                <span
                                  className="font-weight-bold mr-2"
                                  style={{ fontSize: "13px" }}
                                >
                                  {value}
                                </span>
                                <button
                                  onClick={() => copiar(value, label)}
                                  style={{
                                    background:
                                      copiado === label ? "#28a745" : "#e9ecef",
                                    border: "none",
                                    borderRadius: "6px",
                                    padding: "2px 8px",
                                    fontSize: "11px",
                                    cursor: "pointer",
                                    color:
                                      copiado === label ? "#fff" : "#495057",
                                    transition: "all 0.2s ease",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {copiado === label ? "✓ Copiado" : "Copiar"}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <p className="text-muted small mt-3 mb-0 text-center">
                          💬 Una vez realizada la transferencia, envía el
                          comprobante a WhatsApp:{" "}
                          <a
                            href="https://wa.me/56996817505"
                            target="_blank"
                            rel="noreferrer"
                            className="font-weight-bold text-success"
                          >
                            +569 96817505
                          </a>{" "}
                          para activar tu suscripción
                        </p>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>

                {/* CTA */}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default SubscriptionPage;

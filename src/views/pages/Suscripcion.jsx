import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
} from "reactstrap";
import UserHeader from "components/Headers/UserHeader";

const SubscriptionPage = () => {
  const [copiado, setCopiado] = useState(null);
  const [planSeleccionado, setPlanSeleccionado] = useState(null);

  const planes = [
    {
      id: "creditos",
      nombre: "La Santa Navaja",
      emoji: "✂️",
      precio: 25000,
      color: "success",
      badge: "Más popular",
      descripcion: "La membresía esencial para el cliente frecuente. Dos servicios al precio de uno y medio.",
      servicios: [
        "1 corte de pelo",
        "1 corte de barba",
        "O bien: 1 corte + barba (usa ambos créditos)",
      ],
      beneficios: [
        { icon: "📅", title: "Acceso a sábados", desc: "Reserva horarios exclusivos los días sábado, disponibles solo para suscriptores." },
        { icon: "🗓️", title: "Agenda extendida 31 días", desc: "Reserva con hasta 31 días de anticipación. Un usuario normal solo puede ver 15 días." },
        { icon: "💸", title: "Ahorro garantizado", desc: "Dos servicios por $25.000. Precio normal $30.000. Ahorras cada mes." },
        { icon: "🎁", title: "Puntos adicionales", desc: "Recibe puntos extra al suscribirte y accede a futuros beneficios." },
      ],
      condiciones: [
        "La suscripción dura 31 días o hasta usar tus 2 servicios, lo que ocurra primero.",
        "Si reservas un tercer servicio estando suscrito, se cobra a precio normal.",
        "Al vencer la suscripción, pierdes acceso a los sábados y al calendario extendido.",
        "Membresía personal e intransferible.",
      ],
    },
    {
      id: "combo_visita_corte_barba",
      nombre: "La Santa Dupla",
      emoji: "👑",
      precio: 40000,
      color: "warning",
      badge: "Premium",
      descripcion: "Para el que no transan: corte y barba completo, dos veces al mes. La experiencia completa de La Santa Barbería.",
      servicios: [
        "2 visitas de Corte + perfilado barba",
        "Cada visita cubre el servicio completo (corte y barba juntos)",
      ],
      beneficios: [
        { icon: "📅", title: "Acceso a sábados", desc: "Reserva horarios exclusivos los días sábado, disponibles solo para suscriptores." },
        { icon: "🗓️", title: "Agenda extendida 31 días", desc: "Reserva con hasta 31 días de anticipación. Un usuario normal solo puede ver 15 días." },
        { icon: "💸", title: "Ahorro garantizado", desc: "Dos visitas completas por $40.000. Un valor difícil de superar." },
        { icon: "🎁", title: "Puntos adicionales", desc: "Recibe puntos extra al suscribirte y accede a futuros beneficios." },
      ],
      condiciones: [
        "La suscripción dura 31 días o hasta realizar tus 2 visitas, lo que ocurra primero.",
        "Si reservas corte solo o barba sola, se cobra a precio normal y no descuenta créditos.",
        "Solo aplica para el servicio 'Corte + perfilado barba'.",
        "Al vencer la suscripción, pierdes acceso a los sábados y al calendario extendido.",
        "Membresía personal e intransferible.",
      ],
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

  return (
    <>
      <UserHeader />
      <Container className="mt--7" fluid>
        <Row className="justify-content-center mb-5">
          <Col xl="10" lg="11">

            {/* TÍTULO */}
            <div className="text-center mb-5">
              <h1 className="font-weight-bold display-4">Membresías</h1>
              <p className="text-muted lead">
                La Santa Barbería · Elige el plan que se adapte a ti
              </p>
            </div>

            {/* PLANES */}
            <Row className="justify-content-center mb-5">
              {planes.map((plan) => (
                <Col key={plan.id} lg="5" className="mb-4">
                  <Card
                    className="shadow border-0 h-100"
                    style={{
                      borderRadius: "20px",
                      cursor: "pointer",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      transform: planSeleccionado === plan.id ? "translateY(-6px)" : "none",
                      boxShadow: planSeleccionado === plan.id
                        ? "0 20px 60px rgba(0,0,0,0.15)"
                        : undefined,
                      outline: planSeleccionado === plan.id
                        ? `2px solid ${plan.color === "warning" ? "#f5a623" : "#2dce89"}`
                        : "none",
                    }}
                    onClick={() => setPlanSeleccionado(plan.id)}
                  >
                    <CardHeader
                      className={`bg-gradient-${plan.color} text-white text-center border-0`}
                      style={{ borderRadius: "20px 20px 0 0", padding: "2rem" }}
                    >
                      <span className="badge badge-light text-dark mb-2 px-3 py-1" style={{ fontSize: "11px", borderRadius: "20px" }}>
                        {plan.badge}
                      </span>
                      <div style={{ fontSize: "2.5rem" }}>{plan.emoji}</div>
                      <h2 className="font-weight-bold text-white mt-2 mb-1">{plan.nombre}</h2>
                      <div className="mt-3">
                        <span style={{ fontSize: "2.2rem", fontWeight: 800 }}>
                          ${plan.precio.toLocaleString("es-CL")}
                        </span>
                        <span className="ml-1" style={{ opacity: 0.85 }}>/ mes</span>
                      </div>
                      <p className="mt-2 mb-0" style={{ opacity: 0.9, fontSize: "13px" }}>
                        {plan.descripcion}
                      </p>
                    </CardHeader>

                    <CardBody className="px-4 pt-4">
                      {/* SERVICIOS INCLUIDOS */}
                      <h6 className="font-weight-bold text-uppercase text-muted mb-3" style={{ fontSize: "11px", letterSpacing: "1px" }}>
                        Incluye
                      </h6>
                      <ul className="list-unstyled mb-4">
                        {plan.servicios.map((s, i) => (
                          <li key={i} className="d-flex align-items-start mb-2">
                            <span className="mr-2" style={{ color: plan.color === "warning" ? "#f5a623" : "#2dce89", fontWeight: 700 }}>✓</span>
                            <small className="font-weight-bold">{s}</small>
                          </li>
                        ))}
                      </ul>

                      {/* BENEFICIOS */}
                      <h6 className="font-weight-bold text-uppercase text-muted mb-3" style={{ fontSize: "11px", letterSpacing: "1px" }}>
                        Beneficios
                      </h6>
                      <ul className="list-unstyled mb-4">
                        {plan.beneficios.map((b, i) => (
                          <li key={i} className="d-flex align-items-start mb-3">
                            <span className="mr-2" style={{ fontSize: "1.1rem" }}>{b.icon}</span>
                            <div>
                              <small className="font-weight-bold d-block">{b.title}</small>
                              <small className="text-muted">{b.desc}</small>
                            </div>
                          </li>
                        ))}
                      </ul>

                      {/* CONDICIONES */}
                      <h6 className="font-weight-bold text-uppercase text-muted mb-3" style={{ fontSize: "11px", letterSpacing: "1px" }}>
                        Condiciones
                      </h6>
                      <ul className="list-unstyled">
                        {plan.condiciones.map((c, i) => (
                          <li key={i} className="d-flex align-items-start mb-2">
                            <span className="mr-2 text-muted">·</span>
                            <small className="text-muted">{c}</small>
                          </li>
                        ))}
                      </ul>

                      <button
                        className={`btn btn-${plan.color} btn-block mt-3 font-weight-bold`}
                        style={{ borderRadius: "12px", padding: "12px" }}
                        onClick={() => setPlanSeleccionado(plan.id)}
                      >
                        {planSeleccionado === plan.id ? "✓ Plan seleccionado" : "Seleccionar plan"}
                      </button>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* DATOS TRANSFERENCIA — solo si hay plan seleccionado */}
            {planSeleccionado && (
              <Row className="justify-content-center">
                <Col lg="7">
                  <Card className="border-0 shadow" style={{ borderRadius: "20px" }}>
                    <CardBody className="p-4">
                      <div className="text-center mb-4">
                        <span style={{ fontSize: "2rem" }}>🏦</span>
                        <h4 className="font-weight-bold mt-2 mb-1">Datos de transferencia</h4>
                        <p className="text-muted small mb-0">
                          Transfiere{" "}
                          <strong>
                            ${planes.find(p => p.id === planSeleccionado)?.precio.toLocaleString("es-CL")}
                          </strong>{" "}
                          y envía el comprobante por WhatsApp para activar tu membresía
                        </p>
                      </div>

                      <div style={{ background: "#f8f9fa", borderRadius: "12px", overflow: "hidden", border: "1px solid #e9ecef" }}>
                        {datosCuenta.map(({ label, value }) => (
                          <div
                            key={label}
                            className="d-flex justify-content-between align-items-center px-3 py-2"
                            style={{ borderBottom: "1px solid #e9ecef" }}
                          >
                            <small className="text-muted">{label}</small>
                            <div className="d-flex align-items-center">
                              <span className="font-weight-bold mr-2" style={{ fontSize: "13px" }}>
                                {value}
                              </span>
                              <button
                                onClick={() => copiar(value, label)}
                                style={{
                                  background: copiado === label ? "#28a745" : "#e9ecef",
                                  border: "none",
                                  borderRadius: "6px",
                                  padding: "2px 8px",
                                  fontSize: "11px",
                                  cursor: "pointer",
                                  color: copiado === label ? "#fff" : "#495057",
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
                        💬 Envía tu comprobante a WhatsApp:{" "}
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
            )}

          </Col>
        </Row>
      </Container>
    </>
  );
};

export default SubscriptionPage;
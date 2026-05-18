import React, { useState } from "react";
import {
  Container, Row, Col, Card, CardBody, Badge, Button,
} from "reactstrap";
import {
  FiBell, FiRefreshCw, FiTrendingUp, FiGift,
  FiDollarSign, FiBarChart2, FiSliders, FiGlobe, FiList,
  FiCheckCircle, FiZap, FiUsers,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

// ─── Data ──────────────────────────────────────────────────────────────────────

const clienteFeatures = [
  {
    icon: FiZap,
    title: "Reservas 24/7, sin llamadas",
    desc: "Agenda disponible todo el día. Sin WhatsApp, sin esperas.",
    color: "#4361ee",
    stats: "15h/semana recuperadas",
  },
  {
    icon: FiUsers,
    title: "Con cuenta o como invitado",
    desc: "Reserva rápida sin registro, o crea cuenta para acumular puntos y ver historial.",
    color: "#f72585",
    stats: "Máxima flexibilidad",
  },
  {
    icon: FiGift,
    title: "Programa de puntos",
    desc: "Acumulan en cada visita y canjean por premios. Tú decides qué ofrecer.",
    color: "#7209b7",
    stats: "2× frecuencia de visitas",
  },
  {
    icon: FiRefreshCw,
    title: "Lista de espera automática",
    desc: "Si alguien cancela, el sistema avisa al siguiente. Sin que muevas un dedo.",
    color: "#ff9e00",
    stats: "100% ocupación",
  },
  {
    icon: FiTrendingUp,
    title: "Recordatorio de reposición",
    desc: "Detectamos cuándo tu cliente necesita volver y le avisamos por su cuenta.",
    color: "#06d6a0",
    stats: "+35% visitas",
  },
];

const adminFeatures = [
  {
    icon: FiDollarSign,
    title: "Cobro de abono al reservar",
    desc: "Activa el pago anticipado para asegurar tus horas. Tú decides si es obligatorio.",
    color: "#4361ee",
    stats: "0 no-shows",
  },
  {
    icon: FiBarChart2,
    title: "Estadísticas reales",
    desc: "Ingresos del mes, horas más canceladas, clientes que más reservan o cancelan.",
    color: "#f72585",
    stats: "Decisiones inteligentes",
  },
  {
    icon: FiSliders,
    title: "Control total del horario",
    desc: "Agrega horas extra, bloquea ratos del día, gestiona vacaciones sin complicaciones.",
    color: "#06d6a0",
    stats: "Tu agenda, tus reglas",
  },
  {
    icon: FiGlobe,
    title: "Landing de tu negocio",
    desc: "Recibe una página con la info de tu negocio y tu enlace de reserva listo para compartir.",
    color: "#ff9e00",
    stats: "Presencia online incluida",
  },
  {
    icon: FiList,
    title: "Políticas personalizadas",
    desc: "Define con cuántas horas se puede cancelar, cuántos días mostrar, si requiere abono.",
    color: "#7209b7",
    stats: "Tú mandas",
  },
];

const notificaciones = [
  {
    canal: "Correo",
    color: "#4361ee",
    bg: "#e8edff",
    items: [
      "Confirmación inmediata al reservar",
      "Recordatorio 24 hrs antes del servicio",
      "Aviso con el motivo si el profesional cancela",
    ],
  },
  {
    canal: "WhatsApp",
    color: "#25D366",
    bg: "#e6faf0",
    items: [
      "Recordatorio 3 hrs antes con todos los datos",
      "Notificación al dueño cuando le agendan o cancelan",
    ],
  },
];

// ─── Componente ────────────────────────────────────────────────────────────────

const FuncionalidadesSection = () => {
  const [tab, setTab] = useState("clientes");

  const tabStyle = (active) => ({
    borderRadius: "50px",
    border: active ? "none" : "1px solid #dee2e6",
    background: active ? "#393ce9" : "transparent",
    color: active ? "#fff" : "#6c757d",
    fontWeight: 600,
    fontSize: "0.85rem",
    padding: "8px 22px",
    cursor: "pointer",
    transition: "all 0.2s",
  });

  return (
    <section id="funcionalidades" className="py-7 bg-white">
      <Container>

        {/* Encabezado */}
        <div className="text-center mb-5">
          <Badge
            className="mb-3 px-3 py-2"
            style={{ background: "#e0e7ff", color: "#4361ee", borderRadius: "50px" }}
          >
            🚀 Funcionalidades
          </Badge>
          <h2 className="display-4 font-weight-bold">
            Tu agenda trabaja mientras tú atiendes
          </h2>
          <p className="text-muted" style={{ maxWidth: 520, margin: "0 auto" }}>
            Todo lo que necesitas para gestionar tu negocio, sin WhatsApps, sin llamadas,
            sin horas vacías.
          </p>
        </div>

        {/* Tabs */}
        <div className="d-flex justify-content-center flex-wrap gap-2 mb-5" style={{ gap: "8px" }}>
          {["clientes", "admin", "notificaciones"].map((t) => (
            <button key={t} style={tabStyle(tab === t)} onClick={() => setTab(t)}>
              {t === "clientes" && "👤 Para tus clientes"}
              {t === "admin" && "⚙️ Para ti (admin)"}
              {t === "notificaciones" && "🔔 Notificaciones"}
            </button>
          ))}
        </div>

        {/* Tab: Clientes */}
        {tab === "clientes" && (
          <Row>
            {clienteFeatures.map((f, i) => (
              <Col md="6" lg="4" key={i} className="mb-4">
                <Card className="border-0 shadow-sm h-100 hover-lift" style={{ borderRadius: "20px", overflow: "hidden" }}>
                  <div style={{ height: "4px", background: f.color }} />
                  <CardBody className="p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div
                        className="p-3 rounded-circle"
                        style={{ background: `${f.color}15`, color: f.color }}
                      >
                        <f.icon size={26} />
                      </div>
                      <Badge style={{ background: `${f.color}18`, color: f.color, border: "none", fontSize: "11px" }}>
                        {f.stats}
                      </Badge>
                    </div>
                    <h5 className="font-weight-bold mb-2">{f.title}</h5>
                    <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>{f.desc}</p>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Tab: Admin */}
        {tab === "admin" && (
          <Row>
            {adminFeatures.map((f, i) => (
              <Col md="6" lg="4" key={i} className="mb-4">
                <Card className="border-0 shadow-sm h-100 hover-lift" style={{ borderRadius: "20px", overflow: "hidden" }}>
                  <div style={{ height: "4px", background: f.color }} />
                  <CardBody className="p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div
                        className="p-3 rounded-circle"
                        style={{ background: `${f.color}15`, color: f.color }}
                      >
                        <f.icon size={26} />
                      </div>
                      <Badge style={{ background: `${f.color}18`, color: f.color, border: "none", fontSize: "11px" }}>
                        {f.stats}
                      </Badge>
                    </div>
                    <h5 className="font-weight-bold mb-2">{f.title}</h5>
                    <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>{f.desc}</p>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Tab: Notificaciones */}
        {tab === "notificaciones" && (
          <Row className="justify-content-center">
            {notificaciones.map((grupo, i) => (
              <Col md="5" key={i} className="mb-4">
                <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "20px", overflow: "hidden" }}>
                  <div style={{ height: "4px", background: grupo.color }} />
                  <CardBody className="p-4">
                    <div className="d-flex align-items-center mb-4">
                      <div
                        className="p-2 rounded-circle mr-3"
                        style={{ background: grupo.bg, color: grupo.color }}
                      >
                        {grupo.canal === "WhatsApp"
                          ? <FaWhatsapp size={22} />
                          : <FiBell size={22} />
                        }
                      </div>
                      <h5 className="font-weight-bold mb-0">Vía {grupo.canal}</h5>
                    </div>
                    {grupo.items.map((item, j) => (
                      <div key={j} className="d-flex align-items-start mb-3">
                        <FiCheckCircle
                          className="mr-3 mt-1 flex-shrink-0"
                          style={{ color: grupo.color }}
                          size={16}
                        />
                        <span style={{ fontSize: "0.9rem", color: "#495057" }}>{item}</span>
                      </div>
                    ))}
                  </CardBody>
                </Card>
              </Col>
            ))}

            {/* Nota extra */}
            <Col md="10">
              <div
                className="text-center p-3 mt-2"
                style={{ background: "#f8faff", borderRadius: "16px", border: "1px solid #e0e7ff" }}
              >
                <span style={{ color: "#4361ee", fontSize: "0.9rem", fontWeight: 600 }}>
                  🔄 Si el profesional cancela, el cliente recibe el motivo automáticamente.
                  Si se libera una hora, se avisa al siguiente en lista de espera.
                </span>
              </div>
            </Col>
          </Row>
        )}

        {/* CTA final */}
        <div className="text-center mt-5">
          <p className="text-muted mb-3" style={{ fontSize: "0.95rem" }}>
            Todo esto incluido en un solo plan, sin comisiones por reserva.
          </p>
          <Button
            size="lg"
            className="px-5 py-3 text-white mr-3"
            style={{
              background: "linear-gradient(135deg, #4361ee, #f72585)",
              border: "none",
              borderRadius: "50px",
              fontWeight: "600",
            }}
            onClick={() => (window.location.href = "/registro-negocio")}
          >
            Comenzar gratis — 7 días sin costo →
          </Button>
        </div>

      </Container>
    </section>
  );
};

export default FuncionalidadesSection;
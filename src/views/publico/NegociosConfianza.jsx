import React, { useState, useEffect } from "react";
import { Container, Row, Col, Badge, Card, CardBody } from "reactstrap";
import { FiMapPin, FiClock, FiArrowRight, FiCalendar } from "react-icons/fi";
import { axiosPublic } from "api/axiosPublic";

// Catálogo de rubros. Cubre tanto el campo "rubro" (vigente, obligatorio en
// empresas nuevas) como el campo "tipo" (antiguo, solo lo tienen empresas
// creadas antes de que existiera "rubro") — por eso una misma categoría
// puede tener varias llaves ("salon_belleza" y "salon de belleza").
const CATEGORIAS = {
  barberia: { label: "Barbería", emoji: "💈", color: "#4361ee" },
  peluqueria: { label: "Peluquería", emoji: "✂️", color: "#4361ee" },
  salon_belleza: { label: "Salón de belleza", emoji: "💇‍♀️", color: "#f72585" },
  "salon de belleza": {
    label: "Salón de belleza",
    emoji: "💇‍♀️",
    color: "#f72585",
  },
  spa: { label: "Spa", emoji: "🧖‍♀️", color: "#f72585" },
  centro_estetica: { label: "Centro de estética", emoji: "✨", color: "#c026d3" },
  estetica: { label: "Centro de estética", emoji: "✨", color: "#c026d3" },
  nutricion: { label: "Nutrición", emoji: "🥗", color: "#06d6a0" },
  kinesiologia: { label: "Kinesiología", emoji: "🦵", color: "#06d6a0" },
  psicologia: { label: "Psicología", emoji: "🧠", color: "#06d6a0" },
  medicina_general: { label: "Medicina general", emoji: "🩺", color: "#06d6a0" },
  gimnasio: { label: "Gimnasio", emoji: "🏋️‍♂️", color: "#ff9e00" },
  masajes: { label: "Masajes", emoji: "💆‍♂️", color: "#7209b7" },
  tatuajes: { label: "Tatuaje", emoji: "🖋️", color: "#1a1a2e" },
  consultorio: { label: "Consultorio", emoji: "🏥", color: "#06d6a0" },
  dental: { label: "Clínica dental", emoji: "🦷", color: "#06d6a0" },
  otros: { label: "Negocio", emoji: "🏪", color: "#6c757d" },
};

const CATEGORIA_DEFAULT = { label: "Negocio", emoji: "🏪", color: "#6c757d" };

// Una empresa puede tener el rubro guardado en "rubro" (vigente) o en
// "tipo" (antiguo). Se prioriza "rubro" porque es el campo obligatorio hoy.
const getCategoria = (empresa) => {
  const clave = (empresa.rubro || empresa.tipo || "").toLowerCase().trim();
  return CATEGORIAS[clave] || CATEGORIA_DEFAULT;
};

const isOpen = (horarioStr) => {
  if (!horarioStr) return null;
  const now = new Date();
  const dayIndex = now.getDay();
  const timeMatch = horarioStr.match(
    /(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/,
  );
  if (!timeMatch) return null;

  const openMinutes = parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
  const closeMinutes = parseInt(timeMatch[3]) * 60 + parseInt(timeMatch[4]);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const includesSat = /sáb|sabado|sábado/i.test(horarioStr);
  const includesSun = /domingo/i.test(horarioStr);

  if (dayIndex === 0 && !includesSun) return false;
  if (dayIndex === 6 && !includesSat) return false;

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
};

const getHorarioDisplay = (horarioStr) => {
  if (!horarioStr) return null;
  const m = horarioStr.match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/);
  return m ? `${m[1]} – ${m[2]}` : horarioStr;
};

const EmpresaCard = ({ empresa }) => {
  const [hover, setHover] = useState(false);
  const open = isOpen(empresa.horarios);
  const categoria = getCategoria(empresa);
  const horario = getHorarioDisplay(empresa.horarios);

  return (
    <Col md={6} lg={4} className="mb-4">
      <Card
        className="border-0 h-100"
        style={{
          borderRadius: "22px",
          boxShadow: hover
            ? "0 22px 40px rgba(0,0,0,0.14)"
            : "0 4px 20px rgba(0,0,0,0.07)",
          transform: hover ? "translateY(-6px)" : "translateY(0)",
          transition: "all 0.25s ease",
          cursor: "pointer",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => (window.location.href = `/${empresa.slug}`)}
      >
        {/* HEADER */}
        <div
          style={{
            height: "120px",
            background: empresa.colores?.primario
              ? `linear-gradient(135deg, ${empresa.colores.primario}26, ${
                  empresa.colores.secundario || empresa.colores.primario
                }4d)`
              : `linear-gradient(135deg, ${categoria.color}1f, ${categoria.color}40)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {empresa.logo ? (
            <img
              src={empresa.logo}
              alt={empresa.nombre}
              style={{
                width: "76px",
                height: "76px",
                objectFit: "cover",
                borderRadius: "50%",
                border: "3px solid white",
                boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
              }}
            />
          ) : (
            <div
              style={{
                width: "76px",
                height: "76px",
                borderRadius: "50%",
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.1rem",
                boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
              }}
            >
              {categoria.emoji}
            </div>
          )}

          {open !== null && (
            <div
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: open ? "#06d6a0" : "#ff4d6d",
                color: "white",
                borderRadius: "50px",
                padding: "4px 11px",
                fontSize: "11px",
                fontWeight: "600",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              {open ? "Abierto ahora" : "Cerrado"}
            </div>
          )}
        </div>

        {/* BODY */}
        <CardBody className="p-4 d-flex flex-column">
          <Badge
            className="align-self-start"
            style={{
              background: `${categoria.color}1a`,
              color: categoria.color,
              borderRadius: "50px",
              fontSize: "11px",
              fontWeight: "600",
              padding: "5px 12px",
              marginBottom: "10px",
            }}
          >
            {categoria.emoji} {categoria.label}
          </Badge>

          <h5 className="font-weight-bold mb-2" style={{ color: "#1a1a2e" }}>
            {empresa.nombre}
          </h5>

          {/* DESCRIPCIÓN */}
          {empresa.descripcion && (
            <p
              className="text-muted flex-grow-1 mb-3"
              style={{
                fontSize: "13px",
                WebkitLineClamp: 2,
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {empresa.descripcion}
            </p>
          )}
          {!empresa.descripcion && <div className="flex-grow-1" />}

          {/* INFO */}
          <div style={{ fontSize: "12px", color: "#6c757d" }}>
            {horario && (
              <div className="d-flex align-items-center gap-2 mb-1">
                <FiClock size={13} /> {horario}
              </div>
            )}
            {empresa.direccion && (
              <div className="d-flex align-items-center gap-2">
                <FiMapPin size={13} /> {empresa.direccion}
              </div>
            )}
          </div>

          {/* FOOTER SIEMPRE ABAJO */}
          <div className="mt-3 pt-3 border-top d-flex align-items-center justify-content-between">
            <span
              className="d-flex align-items-center gap-1"
              style={{ fontSize: "11px", color: "#adb5bd" }}
            >
              <FiCalendar size={13} /> Reserva online
            </span>
            <span
              style={{
                fontWeight: 600,
                fontSize: "13px",
                color: categoria.color,
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              Ver agenda
              <FiArrowRight
                size={14}
                style={{
                  transition: "transform 0.2s ease",
                  transform: hover ? "translateX(3px)" : "translateX(0)",
                }}
              />
            </span>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

// Placeholder animado mientras cargan las empresas, para que la sección no
// se sienta vacía/rota en el primer render.
const CardSkeleton = () => (
  <Col md={6} lg={4} className="mb-4">
    <div
      style={{
        borderRadius: "22px",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      }}
    >
      <div
        className="negocio-skeleton-shimmer"
        style={{ height: "120px", background: "#eef0f4" }}
      />
      <div style={{ background: "#fff", padding: "24px" }}>
        <div
          className="negocio-skeleton-shimmer"
          style={{
            height: "18px",
            width: "60%",
            borderRadius: "6px",
            background: "#eef0f4",
            marginBottom: "12px",
          }}
        />
        <div
          className="negocio-skeleton-shimmer"
          style={{
            height: "12px",
            width: "90%",
            borderRadius: "6px",
            background: "#eef0f4",
            marginBottom: "8px",
          }}
        />
        <div
          className="negocio-skeleton-shimmer"
          style={{
            height: "12px",
            width: "70%",
            borderRadius: "6px",
            background: "#eef0f4",
          }}
        />
      </div>
    </div>
  </Col>
);

const NegociosConfianza = () => {
  const [empresas, setEmpresas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    axiosPublic
      .get("/empresa/publicas")
      .then((res) => setEmpresas(res.data))
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  return (
    <section className="py-7" style={{ background: "#f8f9fa" }}>
      <Container>
        <div className="text-center mb-6">
          <Badge
            className="mb-3 px-3 py-2"
            style={{
              background: "linear-gradient(135deg,#4361ee,#f72585)",
              color: "white",
              borderRadius: "50px",
            }}
          >
            ⭐ Negocios verificados
          </Badge>

          <h2 className="display-4 font-weight-bold">
            Negocios que confían en nosotros
          </h2>

          <p className="text-muted">
            Reserva fácil, rápido y sin complicaciones
          </p>
        </div>

        <Row>
          {cargando &&
            [...Array(3)].map((_, i) => <CardSkeleton key={i} />)}

          {!cargando && empresas.length === 0 && (
            <Col xs={12} className="text-center text-muted py-4">
              Pronto vas a encontrar acá negocios increíbles.
            </Col>
          )}

          {!cargando &&
            empresas.map((empresa) => (
              <EmpresaCard key={empresa._id} empresa={empresa} />
            ))}
        </Row>
      </Container>

      <style jsx>{`
        .negocio-skeleton-shimmer {
          position: relative;
          overflow: hidden;
        }
        .negocio-skeleton-shimmer::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.6),
            transparent
          );
          animation: negocio-shimmer 1.4s infinite;
        }
        @keyframes negocio-shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </section>
  );
};

export default NegociosConfianza;

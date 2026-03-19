import React, { useState, useEffect } from "react";
import { Container, Row, Col, Badge, Card, CardBody } from "reactstrap";
import { FiMapPin, FiClock, FiExternalLink, FiUsers, FiCheckCircle } from "react-icons/fi";
import { axiosPublic } from "api/axiosPublic";

const TIPO_LABELS = {
  barberia: "Barbería",
  "salon de belleza": "Salón de belleza",
  spa: "Spa",
  peluqueria: "Peluquería",
  estetica: "Estética",
  masajes: "Masajes",
  tatuajes: "Tatuaje",
  consultorio: "Consultorio",
  dental: "Clínica dental",
};

const TIPO_EMOJI = {
  barberia: "💈",
  "salon de belleza": "💇‍♀️",
  spa: "🧖‍♀️",
  peluqueria: "✂️",
  estetica: "✨",
  masajes: "💆‍♂️",
  tatuajes: "🖋️",
  consultorio: "🏥",
  dental: "🦷",
};

const isOpen = (horarioStr) => {
  if (!horarioStr) return null;
  const now = new Date();
  const dayIndex = now.getDay();
  const timeMatch = horarioStr.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
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
  const open = isOpen(empresa.horarios);
  const tipo = empresa.tipo?.toLowerCase() || "";
  const tipoLabel = TIPO_LABELS[tipo] || tipo;
  const tipoEmoji = TIPO_EMOJI[tipo] || "🏪";
  const horario = getHorarioDisplay(empresa.horarios);

  return (
    <Col md={6} lg={4} className="mb-4">
      <Card
        className="border-0 h-100"
        style={{
          borderRadius: "20px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
          transition: "transform 0.25s ease, box-shadow 0.25s ease",
          cursor: "pointer",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-5px)";
          e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.13)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.07)";
        }}
        onClick={() => (window.location.href = `/${empresa.slug}`)}
      >
        <div
          style={{
            height: "110px",
            background: empresa.colores?.primario
              ? `linear-gradient(135deg, ${empresa.colores.primario}22, ${empresa.colores.secundario || empresa.colores.primario}44)`
              : "linear-gradient(135deg, #f0f4ff, #fce4f0)",
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
                width: "72px",
                height: "72px",
                objectFit: "cover",
                borderRadius: "50%",
                border: "3px solid white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            />
          ) : (
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              }}
            >
              {tipoEmoji}
            </div>
          )}

          {open !== null && (
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "12px",
                background: open ? "#06d6a0" : "#ff4d6d",
                color: "white",
                borderRadius: "50px",
                padding: "3px 10px",
                fontSize: "11px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.7)",
                  display: "inline-block",
                }}
              />
              {open ? "Abierto" : "Cerrado"}
            </div>
          )}
        </div>

        <CardBody className="p-4">
          <div className="mb-2">
            <Badge
              style={{
                background: "#e8edff",
                color: "#4361ee",
                borderRadius: "50px",
                fontWeight: "600",
                fontSize: "11px",
                padding: "4px 10px",
                border: "none",
              }}
            >
              {tipoEmoji} {tipoLabel}
            </Badge>
          </div>

          <h5 className="font-weight-bold mb-1" style={{ color: "#1a1a2e" }}>
            {empresa.nombre}
          </h5>

          {empresa.descripcion && (
            <p
              className="text-muted mb-3"
              style={{
                fontSize: "13px",
                lineHeight: "1.5",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {empresa.descripcion}
            </p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {horario && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#6c757d" }}>
                <FiClock size={13} color="#4361ee" />
                <span>{horario}</span>
              </div>
            )}
            {empresa.direccion && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12px", color: "#6c757d" }}>
                <FiMapPin size={13} color="#f72585" style={{ marginTop: "2px", flexShrink: 0 }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {empresa.direccion}
                </span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3" style={{ borderTop: "1px solid #f0f0f0" }}>
            <a
              href={`/${empresa.slug}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#4361ee",
                fontWeight: "600",
                fontSize: "13px",
                textDecoration: "none",
              }}
            >
              Ver agenda y reservar <FiExternalLink size={13} />
            </a>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

const NegociosConfianza = () => {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosPublic
      .get("/empresa/publicas")
      .then((res) => setEmpresas(res.data))
      .catch((err) => console.error("Error cargando empresas:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="negocios" className="py-7" style={{ background: "#f8f9fa" }}>
      <Container>
        <div className="text-center mb-6">
          <Badge
            className="mb-3 px-3 py-2"
            style={{
              background: "linear-gradient(135deg, #4361ee 0%, #f72585 100%)",
              color: "white",
              borderRadius: "50px",
              border: "none",
            }}
          >
            ✅ Negocios reales
          </Badge>
          <h2 className="display-4 font-weight-bold">
            Ya confían en AgendaFonfach
          </h2>
          <p className="text-muted">
            Estos negocios automatizaron sus reservas y recuperaron su tiempo
          </p>
        </div>

        {loading ? (
          <Row>
            {[1, 2, 3].map((i) => (
              <Col md={6} lg={4} key={i} className="mb-4">
                <div
                  style={{
                    height: "280px",
                    borderRadius: "20px",
                    background: "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s infinite",
                  }}
                />
              </Col>
            ))}
            <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
          </Row>
        ) : (
          <Row>
            {empresas.map((empresa) => (
              <EmpresaCard key={empresa._id} empresa={empresa} />
            ))}
          </Row>
        )}

        {!loading && empresas.length > 0 && (
          <div className="text-center mt-5">
            <div
              className="d-inline-flex align-items-center"
              style={{
                background: "white",
                borderRadius: "60px",
                padding: "14px 32px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
                gap: "20px",
              }}
            >
              <div className="d-flex align-items-center" style={{ gap: "8px" }}>
                <FiCheckCircle color="#06d6a0" size={18} />
                <span style={{ fontWeight: "600", color: "#1a1a2e" }}>
                  {empresas.length} {empresas.length === 1 ? "negocio activo" : "negocios activos"}
                </span>
              </div>
              <div style={{ width: "1px", height: "24px", background: "#e0e0e0" }} />
              <div className="d-flex align-items-center" style={{ gap: "8px" }}>
                <FiUsers color="#4361ee" size={18} />
                <span style={{ color: "#6c757d", fontSize: "14px" }}>
                  Sin comisiones · Sin permanencia
                </span>
              </div>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
};

export default NegociosConfianza;
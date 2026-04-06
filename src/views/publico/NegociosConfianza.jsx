import React, { useState, useEffect } from "react";
import { Container, Row, Col, Badge, Card, CardBody } from "reactstrap";
import {
  FiMapPin,
  FiClock,
  FiExternalLink,
} from "react-icons/fi";
import { FaStar } from "react-icons/fa";
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
  const timeMatch = horarioStr.match(
    /(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/
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
  const open = isOpen(empresa.horarios);
  const tipo = empresa.tipo?.toLowerCase() || "";
  const tipoLabel = TIPO_LABELS[tipo] || tipo;
  const tipoEmoji = TIPO_EMOJI[tipo] || "🏪";
  const horario = getHorarioDisplay(empresa.horarios);

const rating = "5.0";

  return (
    <Col md={6} lg={4} className="mb-4">
      <Card
        className="border-0 h-100"
        style={{
          borderRadius: "20px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
          transition: "all 0.3s ease",
          cursor: "pointer",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-6px)";
          e.currentTarget.style.boxShadow =
            "0 20px 40px rgba(0,0,0,0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow =
            "0 4px 20px rgba(0,0,0,0.07)";
        }}
        onClick={() => (window.location.href = `/${empresa.slug}`)}
      >
        {/* HEADER */}
        <div
          style={{
            height: "110px",
            background: empresa.colores?.primario
              ? `linear-gradient(135deg, ${empresa.colores.primario}22, ${
                  empresa.colores.secundario || empresa.colores.primario
                }44)`
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
              }}
            >
              {open ? "Abierto" : "Cerrado"}
            </div>
          )}
        </div>

        {/* BODY */}
        <CardBody className="p-4 d-flex flex-column">
          <Badge
            style={{
              background: "#e8edff",
              color: "#4361ee",
              borderRadius: "50px",
              fontSize: "11px",
              marginBottom: "6px",
            }}
          >
            {tipoEmoji} {tipoLabel}
          </Badge>

          <h5 className="font-weight-bold mb-1">{empresa.nombre}</h5>

          {/* ⭐ RATING */}
          <div className="d-flex align-items-center mb-2" style={{ gap: "4px" }}>
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} size={12} color="#fca311" />
            ))}
            <span style={{ fontSize: "12px", color: "#6c757d" }}>
              {rating}
            </span>
          </div>

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
          <div className="mt-auto pt-3 border-top">
            <span
              style={{
                fontWeight: 600,
                fontSize: "13px",
                color: "#4361ee",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              Ver agenda <FiExternalLink size={13} />
            </span>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

const NegociosConfianza = () => {
  const [empresas, setEmpresas] = useState([]);

  useEffect(() => {
    axiosPublic
      .get("/empresa/publicas")
      .then((res) => setEmpresas(res.data))
      .catch(console.error);
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
          {empresas.map((empresa) => (
            <EmpresaCard key={empresa._id} empresa={empresa} />
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default NegociosConfianza;
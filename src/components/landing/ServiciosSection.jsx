import { Container, Row, Col, Card, CardBody, Button, Badge } from "reactstrap";
import { FaCalendarCheck } from "react-icons/fa";
import { MdAccessTime } from "react-icons/md";

const ServiciosSection = ({ servicios, onReservar, theme }) => {
  if (!servicios.length) return null;

  const isLumica = theme?.isLumica || false;

  const primaryColor = theme?.primary || "#5e72e4";
  const primaryLight = theme?.primaryLight || "#eaecfe";
  const primaryDark = theme?.primaryDark || "#324cdd";

  return (
    <section
      className="py-6"
      style={{
        backgroundColor: isLumica ? "#FFFFFF" : "transparent",
      }}
    >
      <Container>
        {/* HEADER */}
        <div className="text-center mb-5">
          <span
            className="badge badge-pill mb-3"
            style={{
              backgroundColor: primaryLight,
              color: primaryColor,
              padding: "8px 16px",
              fontSize: "0.85rem",
              border: isLumica ? `1px solid ${primaryColor}20` : "none",
            }}
          >
            Servicios
          </span>

          <h2
            style={{
              fontWeight: 700,
              fontSize: "2.5rem",
              marginBottom: "1rem",
              color: theme?.textDark || "#172b4d",
            }}
          >
            Nuestros servicios
          </h2>

          <p style={{ color: theme?.textMuted || "#8898aa" }}>
            Atención profesional y especializada
          </p>
        </div>

        <Row>
          {servicios.map((servicio) => {
            const duracionTexto =
              servicio.duracionMin === servicio.duracionMax
                ? `${servicio.duracionMin} min`
                : `${servicio.duracionMin} - ${servicio.duracionMax} min`;

            return (
              <Col md="6" lg="4" key={servicio._id} className="mb-4">
                <Card
                  className={`border-0 h-100`}
                  style={{
                    borderRadius: "20px",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    backgroundColor: "#fff",
                    boxShadow: isLumica
                      ? `0 10px 30px ${primaryColor}20`
                      : "0 10px 25px rgba(0,0,0,0.06)",
                    border: `1px solid ${
                      isLumica ? primaryLight : "rgba(0,0,0,0.05)"
                    }`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-6px)";
                    e.currentTarget.style.boxShadow = isLumica
                      ? `0 20px 40px ${primaryColor}40`
                      : "0 20px 40px rgba(0,0,0,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = isLumica
                      ? `0 10px 30px ${primaryColor}20`
                      : "0 10px 25px rgba(0,0,0,0.06)";
                  }}
                >
                  <CardBody className="d-flex flex-column">
                    {/* NOMBRE */}
                    <h5
                      className="font-weight-bold mb-2"
                      style={{
                        color: isLumica ? primaryColor : "#172b4d",
                      }}
                    >
                      {servicio.nombre}
                    </h5>

                    {/* DESCRIPCIÓN */}
                    <p
                      className="flex-grow-1"
                      style={{
                        color: "#8898aa",
                        fontSize: "0.95rem",
                      }}
                    >
                      {servicio.descripcion}
                    </p>

                    {/* DURACIÓN */}
                    <div className="mb-3">
                      <Badge
                        pill
                        style={{
                          backgroundColor: primaryLight,
                          color: primaryColor,
                          fontSize: "0.75rem",
                          padding: "6px 10px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <MdAccessTime size={14} />
                        {duracionTexto}
                      </Badge>
                    </div>

                    {/* FOOTER */}
                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      {/* PRECIO */}
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "1.2rem",
                          color: primaryColor,
                        }}
                      >
                        ${servicio.precio.toLocaleString("es-CL")}
                      </span>

                      {/* BOTÓN */}
                      <Button
                        size="sm"
                        style={{
                          backgroundColor: primaryColor,
                          borderColor: primaryColor,
                          color: "#FFFFFF",
                          borderRadius: "12px",
                          padding: "8px 16px",
                          fontWeight: 600,
                          transition: "all 0.3s ease",
                        }}
                        onClick={() => onReservar(servicio)}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = primaryDark;
                          e.target.style.borderColor = primaryDark;
                          e.target.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = primaryColor;
                          e.target.style.borderColor = primaryColor;
                          e.target.style.transform = "translateY(0)";
                        }}
                      >
                        <FaCalendarCheck className="me-1" />
                        Reservar
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </section>
  );
};

export default ServiciosSection;
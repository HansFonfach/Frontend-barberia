import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
import { FaCalendarCheck } from "react-icons/fa";

const ServiciosSection = ({ servicios, onReservar, theme }) => {
  if (!servicios.length) return null;

  // Verificamos si es Lumica basado en el tema
  const isLumica = theme?.isLumica || false;
  
  // Colores específicos para Lumica
  const primaryColor = theme?.primary || "#5e72e4";
  const primaryLight = theme?.primaryLight || "#eaecfe";
  const primaryDark = theme?.primaryDark || "#324cdd";

  return (
    <section 
      className="py-6" 
      style={{ 
        // Para no Lumica, usamos transparent para que herede el fondo del padre
        backgroundColor: isLumica ? "#FFFFFF" : "transparent"
      }}
    >
      <Container>
        {/* Título con color dinámico */}
        <div className="text-center mb-5">
          <span 
            className="badge badge-pill mb-3"
            style={{
              backgroundColor: primaryLight,
              color: primaryColor,
              padding: "8px 16px",
              fontSize: "0.85rem",
              border: isLumica ? `1px solid ${primaryColor}20` : "none"
            }}
          >
            Servicios
          </span>
          <h2 
            style={{
              fontWeight: 700,
              fontSize: "2.5rem",
              marginBottom: "1rem",
              color: theme?.textDark || "#172b4d"
            }}
          >
            Nuestros servicios
          </h2>
          <p style={{ color: theme?.textMuted || "#8898aa" }}>
            Atención profesional y especializada
          </p>
        </div>

        <Row>
          {servicios.map((servicio) => (
            <Col md="6" lg="4" key={servicio._id} className="mb-4">
              <Card 
                className={`border-0 h-100 ${!isLumica ? 'shadow hover-lift' : ''}`}
                style={{
                  ...(isLumica ? {
                    boxShadow: `0 10px 30px ${primaryColor}20`,
                    borderRadius: "20px",
                    border: `1px solid ${primaryLight}`,
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  } : {})
                }}
                onMouseEnter={(e) => {
                  if (isLumica) {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow = `0 20px 40px ${primaryColor}40`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (isLumica) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = `0 10px 30px ${primaryColor}20`;
                  }
                }}
              >
                <CardBody className="d-flex flex-column">
                  <h5 
                    className="font-weight-bold"
                    style={{
                      color: isLumica ? primaryColor : undefined
                    }}
                  >
                    {servicio.nombre}
                  </h5>
                  <p className="text-muted flex-grow-1">
                    {servicio.descripcion}
                  </p>

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span 
                      className="font-weight-bold"
                      style={{
                        color: isLumica ? primaryColor : undefined,
                        ...(isLumica ? {
                          backgroundColor: `${primaryColor}15`,
                          padding: "6px 12px",
                          borderRadius: "12px",
                          fontSize: "1.1rem"
                        } : {})
                      }}
                    >
                    ${servicio.precio.toLocaleString('es-ES')} 
                    </span>
                    <Button
                      size="sm"
                      style={{
                        backgroundColor: isLumica ? primaryColor : undefined,
                        borderColor: isLumica ? primaryColor : undefined,
                        color: isLumica ? "#FFFFFF" : undefined,
                        borderRadius: isLumica ? "12px" : undefined,
                        padding: isLumica ? "8px 16px" : undefined,
                        fontWeight: isLumica ? 600 : undefined,
                        transition: "all 0.3s ease"
                      }}
                      className={!isLumica ? "btn-primary" : ""}
                      onClick={() => onReservar(servicio)}
                      onMouseEnter={(e) => {
                        if (isLumica) {
                          e.target.style.backgroundColor = primaryDark;
                          e.target.style.borderColor = primaryDark;
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow = `0 10px 20px ${primaryColor}40`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isLumica) {
                          e.target.style.backgroundColor = primaryColor;
                          e.target.style.borderColor = primaryColor;
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "none";
                        }
                      }}
                    >
                      <FaCalendarCheck className="mr-1" />
                      Reservar
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default ServiciosSection;
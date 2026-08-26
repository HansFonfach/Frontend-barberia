import { Container, Row, Col, Card, CardBody } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { Check, CreditCard } from "lucide-react";

/**
 * Catálogo público de planes de membresía para el landing de un gimnasio.
 * No existe pasarela de pago online: cada plan termina en un botón de
 * WhatsApp con un mensaje pre-armado, igual que en "Mi plan" (la vista
 * del cliente logueado) — la activación siempre la hace un administrador
 * a mano.
 */
const PlanesSection = ({ planes, empresa, theme }) => {
  const navigate = useNavigate();
  const { slug } = useParams();

  if (!planes?.length) return null;

  const primaryColor = theme?.primary || "#5e72e4";
  const primaryLight = theme?.primaryLight || "#eaecfe";
  const primaryDark = theme?.primaryDark || "#324cdd";
  const textDark = theme?.textDark || "#172b4d";
  const textMuted = theme?.textMuted || "#8898aa";

  const contactarWhatsapp = (plan) => {
    const telefono = (empresa?.telefono || "").replace(/\D/g, "");
    if (!telefono) return;
    const mensaje = encodeURIComponent(
      `Hola! Quiero suscribirme al ${plan.nombre} ($${plan.precio.toLocaleString("es-CL")}) en ${empresa?.nombre || "el gimnasio"}.`,
    );
    window.open(`https://wa.me/${telefono}?text=${mensaje}`, "_blank");
  };

  return (
    <section className="py-6">
      <Container>
        <div className="text-center mb-5">
          <span
            className="badge badge-pill mb-3"
            style={{
              backgroundColor: primaryLight,
              color: primaryColor,
              padding: "8px 16px",
              fontSize: "0.85rem",
            }}
          >
            Planes
          </span>

          <h2
            style={{
              fontWeight: 700,
              fontSize: "2.5rem",
              marginBottom: "1rem",
              color: textDark,
            }}
          >
            Elige tu plan
          </h2>

          <p style={{ color: textMuted }}>
            Contrata tu plan directamente aquí, o escríbenos por WhatsApp si
            prefieres coordinarlo con nosotros.
          </p>
        </div>

        <Row className="justify-content-center">
          {planes.map((plan, idx) => {
            const destacado = idx === Math.floor((planes.length - 1) / 2) && planes.length > 1;

            return (
              <Col key={plan._id || plan.nombre} lg="4" md="6" className="mb-4">
                <Card
                  className="border-0 h-100"
                  style={{
                    borderRadius: "24px",
                    boxShadow: destacado
                      ? `0 20px 45px ${primaryColor}35`
                      : "0 10px 25px rgba(0,0,0,0.06)",
                    border: destacado
                      ? `2px solid ${primaryColor}`
                      : "1px solid rgba(0,0,0,0.05)",
                    transform: destacado ? "scale(1.03)" : "none",
                    position: "relative",
                  }}
                >
                  {destacado && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-14px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        backgroundColor: primaryColor,
                        color: "#fff",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        padding: "6px 16px",
                        borderRadius: "50px",
                        boxShadow: `0 6px 15px ${primaryColor}50`,
                      }}
                    >
                      Más elegido
                    </span>
                  )}

                  {/* Solo el plan destacado lleva el bloque a full color;
                      el resto usa un header claro para no saturar la
                      sección entera de verde. */}
                  <div
                    className="text-center"
                    style={
                      destacado
                        ? {
                            background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryDark} 100%)`,
                            borderRadius: "24px 24px 0 0",
                            padding: "2.25rem 1.5rem",
                          }
                        : {
                            backgroundColor: "#fafbfc",
                            borderBottom: "1px solid rgba(0,0,0,0.06)",
                            borderRadius: "24px 24px 0 0",
                            padding: "2.25rem 1.5rem",
                          }
                    }
                  >
                    <h3
                      className="font-weight-bold mb-2"
                      style={{ color: destacado ? "#fff" : textDark }}
                    >
                      {plan.nombre}
                    </h3>
                    <div>
                      <span
                        style={{
                          fontSize: "2.4rem",
                          fontWeight: 800,
                          color: destacado ? "#fff" : primaryColor,
                        }}
                      >
                        ${plan.precio.toLocaleString("es-CL")}
                      </span>
                      <span
                        style={{
                          color: destacado
                            ? "rgba(255,255,255,0.85)"
                            : textMuted,
                        }}
                        className="ml-1"
                      >
                        /{" "}
                        {plan.duracionDias === 30
                          ? "mes"
                          : `${plan.duracionDias} días`}
                      </span>
                    </div>
                  </div>

                  <CardBody className="px-4 pt-4 pb-4 d-flex flex-column">
                    <ul className="list-unstyled mb-4 flex-grow-1">
                      <li className="d-flex align-items-start mb-3">
                        <Check
                          size={18}
                          style={{ color: primaryColor }}
                          className="mr-2 mt-1"
                        />
                        <span style={{ color: textDark }}>
                          <strong>{plan.clasesIncluidas}</strong>{" "}
                          {plan.tipoCiclo === "mensual"
                            ? "clases incluidas al mes"
                            : "clases incluidas en total"}
                        </span>
                      </li>
                      <li className="d-flex align-items-start mb-3">
                        <Check
                          size={18}
                          style={{ color: primaryColor }}
                          className="mr-2 mt-1"
                        />
                        <span style={{ color: textDark }}>
                          Válido por {plan.duracionDias} días desde la
                          activación
                        </span>
                      </li>
                    </ul>

                    <button
                      className="btn btn-block font-weight-bold mb-2"
                      style={{
                        backgroundColor: primaryColor,
                        color: "#fff",
                        borderRadius: "12px",
                        padding: "12px",
                        border: "none",
                      }}
                      onClick={() => navigate(`/${slug}/contratar-plan?plan=${plan._id}`)}
                    >
                      <CreditCard size={16} className="mr-2" />
                      Contratar plan
                    </button>

                    {destacado ? (
                      <button
                        className="btn btn-block font-weight-bold"
                        style={{
                          backgroundColor: "#fff",
                          color: primaryColor,
                          borderRadius: "12px",
                          padding: "12px",
                          border: `1.5px solid ${primaryColor}`,
                        }}
                        onClick={() => contactarWhatsapp(plan)}
                      >
                        <FaWhatsapp className="mr-2" />
                        ¿Cómo pagar? (WhatsApp)
                      </button>
                    ) : (
                      <button
                        className="btn btn-block font-weight-bold"
                        style={{
                          backgroundColor: "#fff",
                          color: primaryColor,
                          borderRadius: "12px",
                          padding: "12px",
                          border: `1.5px solid ${primaryColor}`,
                        }}
                        onClick={() => contactarWhatsapp(plan)}
                      >
                        <FaWhatsapp className="mr-2" />
                        ¿Cómo pagar? (WhatsApp)
                      </button>
                    )}
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

export default PlanesSection;

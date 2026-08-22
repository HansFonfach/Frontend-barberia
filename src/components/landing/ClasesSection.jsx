import { Container, Row, Col, Card, CardBody, Button, Badge } from "reactstrap";
import { FaCalendarCheck } from "react-icons/fa";
import { MdAccessTime, MdPerson } from "react-icons/md";

const DIAS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const formatearHoras = (horas) => {
  if (horas.length === 1) return horas[0];
  if (horas.length === 2) return `${horas[0]} y ${horas[1]}`;
  return `${horas.slice(0, -1).join(", ")} y ${horas[horas.length - 1]}`;
};

// En vez de repetir el día por cada hora suelta (ej. "Lun 16:00 · Lun 17:00"),
// agrupa las horas de un mismo día ("Lunes 16:00 y 17:00") y, si varios días
// seguidos comparten exactamente el mismo horario, los junta en un rango
// ("Lunes a Viernes 08:30 y 19:30") para que se lea resumido pero claro.
const formatearHorario = (bloques = []) => {
  if (!bloques.length) return "Horario a confirmar";

  const porDia = new Map();
  bloques.forEach((b) => {
    if (!porDia.has(b.diaSemana)) porDia.set(b.diaSemana, new Set());
    porDia.get(b.diaSemana).add(b.horaInicio);
  });

  const diasOrdenados = Array.from(porDia.keys()).sort((a, b) => a - b);
  const horasPorDia = diasOrdenados.map((d) => Array.from(porDia.get(d)).sort());
  const clavePorDia = horasPorDia.map((horas) => horas.join(","));

  const grupos = [];
  let i = 0;
  while (i < diasOrdenados.length) {
    let j = i;
    while (
      j + 1 < diasOrdenados.length &&
      diasOrdenados[j + 1] === diasOrdenados[j] + 1 &&
      clavePorDia[j + 1] === clavePorDia[i]
    ) {
      j++;
    }
    grupos.push({
      diaInicio: diasOrdenados[i],
      diaFin: diasOrdenados[j],
      horas: horasPorDia[i],
    });
    i = j + 1;
  }

  return grupos
    .map((g) => {
      const etiquetaDia =
        g.diaInicio === g.diaFin
          ? DIAS[g.diaInicio]
          : `${DIAS[g.diaInicio]} a ${DIAS[g.diaFin]}`;
      return `${etiquetaDia} ${formatearHoras(g.horas)}`;
    })
    .join(" · ");
};

/**
 * Catálogo público de clases grupales para el landing de un gimnasio.
 * Mismo tratamiento visual que ServiciosSection, pero con los campos
 * propios de una clase (horario semanal, instructor, cupo) en vez de
 * precio/descuento de un servicio de barbería.
 */
const ClasesSection = ({ clases, onIngresar, theme }) => {
  if (!clases?.length) return null;

  const primaryColor = theme?.primary || "#5e72e4";
  const primaryLight = theme?.primaryLight || "#eaecfe";
  const primaryDark = theme?.primaryDark || "#324cdd";

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
            Clases
          </span>

          <h2
            style={{
              fontWeight: 700,
              fontSize: "2.5rem",
              marginBottom: "1rem",
              color: theme?.textDark || "#172b4d",
            }}
          >
            Nuestras clases
          </h2>

          <p style={{ color: theme?.textMuted || "#8898aa" }}>
            Cupos limitados · Reserva tu lugar desde tu cuenta
          </p>
        </div>

        <Row>
          {clases.map((clase) => (
            <Col md="6" lg="4" key={clase._id} className="mb-4">
              <Card
                className="border-0 h-100"
                style={{
                  borderRadius: "20px",
                  transition: "all 0.3s ease",
                  backgroundColor: "#fff",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(0,0,0,0.05)",
                  borderTop: `4px solid ${clase.color || primaryColor}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow =
                    "0 20px 40px rgba(0,0,0,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 25px rgba(0,0,0,0.06)";
                }}
              >
                <CardBody className="d-flex flex-column">
                  <h5 className="font-weight-bold mb-2" style={{ color: "#172b4d" }}>
                    {clase.nombre}
                  </h5>

                  {clase.descripcion && (
                    <p
                      className="flex-grow-1"
                      style={{ color: "#8898aa", fontSize: "0.95rem" }}
                    >
                      {clase.descripcion}
                    </p>
                  )}

                  <div className="mb-2">
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
                      {clase.duracion} min
                    </Badge>
                  </div>

                  <p className="small text-muted mb-2 d-flex align-items-start">
                    <FaCalendarCheck size={13} className="mr-2 mt-1" style={{ flexShrink: 0 }} />
                    <span>{formatearHorario(clase.horarioSemanal)}</span>
                  </p>

                  {clase.instructor && (
                    <p className="small text-muted d-flex align-items-center mb-3">
                      <MdPerson size={16} className="mr-1" />
                      {clase.instructor.nombre} {clase.instructor.apellido}
                    </p>
                  )}

                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: clase.precioPaseDiario ? "1.1rem" : "0.85rem",
                        color: clase.precioPaseDiario ? primaryColor : "#8898aa",
                      }}
                    >
                      {clase.precioPaseDiario
                        ? `$${clase.precioPaseDiario.toLocaleString("es-CL")} pase diario`
                        : "Incluida en tu plan"}
                    </span>

                    <Button
                      size="sm"
                      style={{
                        backgroundColor: primaryColor,
                        borderColor: primaryColor,
                        color: "#FFFFFF",
                        borderRadius: "12px",
                        padding: "8px 16px",
                        fontWeight: 600,
                      }}
                      onClick={onIngresar}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = primaryDark;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = primaryColor;
                      }}
                    >
                      <FaCalendarCheck className="me-1" />
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

export default ClasesSection;

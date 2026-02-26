import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
import { FaCalendarCheck } from "react-icons/fa";
import SectionTitle from "./SectionTitle";

const ServiciosSection = ({ servicios, onReservar }) => {
  if (!servicios.length) return null;

  return (
    <section className="py-6 bg-secondary">
      <Container>
        <SectionTitle
          badge="Servicios"
          title="Nuestros servicios"
          subtitle="Atención profesional y especializada"
        />

        <Row>
          {servicios.map((servicio) => (
            <Col md="6" lg="4" key={servicio._id} className="mb-4">
              <Card className="border-0 shadow h-100 hover-lift">
                <CardBody className="d-flex flex-column">
                  <h5 className="font-weight-bold">{servicio.nombre}</h5>
                  <p className="text-muted flex-grow-1">
                    {servicio.descripcion}
                  </p>

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span className="font-weight-bold text-primary">
                      ${servicio.precio}
                    </span>
                    <Button
                      size="sm"
                      color="primary"
                      onClick={() => onReservar(servicio)}
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
import React from "react";
import { Container, Row, Col, Card, CardBody, Badge, Button } from "reactstrap";
import UserHeader from "components/Headers/UserHeader";
import { MdLocationOn, MdPhone, MdAccessTime } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";
import { useEmpresa } from "context/EmpresaContext";
import { useNavigate } from "react-router-dom";

const Contacto = () => {
  const { empresa } = useEmpresa();
  const navigate = useNavigate();

  if (!empresa) return null;

  const telefonoFormateado = empresa.telefono?.replace(/\D/g, "");
  const whatsappLink = `https://wa.me/${telefonoFormateado}?text=Hola ${empresa.nombre}, quiero agendar una cita ✨`;

  // 🔥 Detectar si está abierto
  const ahora = new Date();
  const horaActual = ahora.getHours() + ahora.getMinutes() / 60;

  const diasActivos = [
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
  ];
  const diaActual = ahora
    .toLocaleDateString("es-CL", { weekday: "long" })
    .toLowerCase();

  let abierto = false;

  if (empresa.horarios) {
    const match = empresa.horarios.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);

    if (match && diasActivos.includes(diaActual)) {
      const [_, inicio, fin] = match;

      const [hInicio, mInicio] = inicio.split(":").map(Number);
      const [hFin, mFin] = fin.split(":").map(Number);

      const horaInicio = hInicio + mInicio / 60;
      const horaFin = hFin + mFin / 60;

      abierto = horaActual >= horaInicio && horaActual <= horaFin;
    }
  }

  return (
    <>
      <UserHeader
        title="Contacto"
        subtitle={`Agenda tu cita en ${empresa.nombre}`}
        background="bg-gradient-primary"
      />

      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col lg="10">
            <Card className="shadow-lg border-0">
              <CardBody className="p-5">
                <Row>
                  {/* IZQUIERDA */}
                  <Col lg="6" className="mb-5 mb-lg-0">
                    <h3 className="text-primary mb-4">
                      Información de contacto
                    </h3>

                    <div className="mb-4 d-flex align-items-start">
                      <div className="icon icon-shape bg-primary text-white rounded-circle mr-3">
                        <MdLocationOn size={20} />
                      </div>
                      <div>
                        <h6 className="mb-1">Dirección</h6>
                        <p className="mb-0 text-muted">{empresa.direccion}</p>
                      </div>
                    </div>

                    <div className="mb-4 d-flex align-items-start">
                      <div className="icon icon-shape bg-success text-white rounded-circle mr-3">
                        <MdPhone size={20} />
                      </div>
                      <div>
                        <h6 className="mb-1">Teléfono</h6>
                        <p className="mb-0 text-muted">{empresa.telefono}</p>
                      </div>
                    </div>

                    <div className="mb-4 d-flex align-items-start">
                      <div className="icon icon-shape bg-info text-white rounded-circle mr-3">
                        <MdAccessTime size={20} />
                      </div>
                      <div>
                        <h6 className="mb-1">Horario</h6>
                        <p className="mb-0 text-muted">{empresa.horarios}</p>
                      </div>
                    </div>

                    <div className="shadow-sm rounded overflow-hidden mt-4">
                      <iframe
                        title="Mapa"
                        src={`https://www.google.com/maps?q=${encodeURIComponent(
                          empresa.direccion,
                        )}&output=embed`}
                        width="100%"
                        height="220"
                        style={{ border: 0 }}
                        loading="lazy"
                      ></iframe>
                    </div>
                  </Col>

                  {/* DERECHA – CARD INTELIGENTE */}
                  <Col lg="6">
                    <div className="h-100 d-flex flex-column justify-content-center text-center p-5 rounded shadow">
                      <CardBody className="text-center d-flex flex-column justify-content-center p-5">
                        {empresa.logo && (
                          <div className="d-flex justify-content-center mb-4">
                            <img
                              src={empresa.logo}
                              alt={empresa.nombre}
                              style={{
                                width: "110px",
                                height: "110px",
                                objectFit: "cover",
                              
                               
                              }}
                            />
                          </div>
                        )}

                        <h2 className="text-primary mb-3">{empresa.nombre}</h2>

                        {/* 🔥 BADGE DINÁMICO */}
                        <Badge
                          color={abierto ? "success" : "danger"}
                          className="mb-4 px-4 py-2"
                        >
                          {abierto ? "🟢 Abierto ahora" : "🔴 Cerrado"}
                        </Badge>

                        <Button
                          color="success"
                          size="lg"
                          block
                          className="py-3"
                          onClick={() => window.open(whatsappLink, "_blank")}
                        >
                          <FaWhatsapp className="mr-2" />
                          WhatsApp directo
                        </Button>

                        <div className="mt-4">
                          <small className="text-muted">
                            Confirmación inmediata · Atención personalizada
                          </small>
                        </div>
                      </CardBody>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Contacto;

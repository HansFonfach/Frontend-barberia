import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Collapse,
  Button,
} from "reactstrap";
import UserHeader from "components/Headers/UserHeader.js";
import { useState } from "react";
import {
  HelpCircle,
  Clock,
  XCircle,
  RefreshCcw,
  User,
  MessageCircle,
} from "lucide-react";

const CentroAyuda = () => {
  const [open, setOpen] = useState(null);

  const toggle = (i) => {
    setOpen(open === i ? null : i);
  };

  const faqs = [
    {
      icon: <Clock size={22} />,
      title: "¿Cómo reservo una hora?",
      text: "Ingresa a la sección 'Reservar Hora', selecciona un día disponible y luego elige una hora libre. Confirma y listo.",
    },
    {
      icon: <XCircle size={22} />,
      title: "¿Cómo cancelo una reserva?",
      text: "Anda a 'Mis Reservas'. Ahí verás tus reservas activas. Presiona el botón Cancelar y confirma la acción.",
    },
    {
      icon: <RefreshCcw size={22} />,
      title: "¿Puedo reagendar una hora?",
      text: "Sí. Cancela tu reserva actual y vuelve a seleccionar un nuevo horario disponible.",
    },
    {
      icon: <User size={22} />,
      title: "¿Cómo edito mi perfil?",
      text: "En el menú superior, entra a tu Perfil. Ahí podrás actualizar tus datos personales y contraseña.",
    },
    {
      icon: <HelpCircle size={22} />,
      title: "¿Cómo gano puntos?",
      text: "Ganas puntos automáticamente cuando cumples una reserva y asistes a tu hora. También obtienes puntos al suscribirte al sistema. Los puntos se acreditan sin que tengas que hacer nada.",
    },
    {
      icon: <HelpCircle size={22} />,
      title: "¿Cuándo se suman los puntos?",
      text: "Los puntos por reserva se suman solo cuando la cita se cumple correctamente. Si cancelas o no asistes, no se otorgan puntos.",
    },
    {
      icon: <HelpCircle size={22} />,
      title: "¿Pierdo puntos si cancelo?",
      text: "Si cancelas con anticipación, no pierdes puntos. Si no asistes sin cancelar, el sistema puede descontar puntos según las reglas del negocio.",
    },
    {
      icon: <HelpCircle size={22} />,
      title: "¿Para qué sirven los puntos?",
      text: "Los puntos se pueden canjear por beneficios definidos por el negocio, como descuentos, servicios gratis u otros premios.",
    },
    {
      icon: <User size={22} />,
      title: "¿Puedo reservar sin crear una cuenta?",
      text: "Sí. Puedes reservar como invitado usando tus datos básicos. Sin embargo, solo los usuarios registrados acumulan puntos y beneficios.",
    },
  ];

  return (
    <>
      <UserHeader /> {/* Mantiene tu estilo actual */}
      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col lg="8">
            <Card className="shadow border-0">
              <CardHeader className="bg-transparent">
                <h2 className="mb-0 d-flex align-items-center">
                  <HelpCircle className="mr-2" size={26} /> Centro de Ayuda
                </h2>
                <p className="text-muted mt-2 mb-0">
                  Encuentra aquí respuestas rápidas y soporte.
                </p>
              </CardHeader>

              <CardBody>
                {/* FAQ */}
                {faqs.map((faq, i) => (
                  <Card key={i} className="mb-3 shadow-sm">
                    <CardHeader
                      style={{ cursor: "pointer" }}
                      onClick={() => toggle(i)}
                      className="d-flex align-items-center"
                    >
                      <div className="mr-3">{faq.icon}</div>
                      <h5 className="mb-0">{faq.title}</h5>
                    </CardHeader>

                    <Collapse isOpen={open === i}>
                      <CardBody className="text-muted">{faq.text}</CardBody>
                    </Collapse>
                  </Card>
                ))}

                {/* Contacto directo */}
                <Card className="mt-4 shadow">
                  <CardBody className="text-center">
                    <MessageCircle size={32} className="text-primary mb-3" />
                    <h4>¿Aún necesitas ayuda?</h4>
                    <p className="text-muted">
                      Escríbenos y te responderemos lo antes posible.
                    </p>

                    <Button color="primary" href="mailto:soporte@tusistema.cl">
                      Contactar soporte
                    </Button>
                  </CardBody>
                </Card>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default CentroAyuda;

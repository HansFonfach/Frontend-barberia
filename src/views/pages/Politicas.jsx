import React from "react";
import { Container, Row, Col, Card, CardBody, CardHeader } from "reactstrap";
import UserHeader from "components/Headers/UserHeader";

// Íconos de react-icons
import {
  MdWarning,
  MdAccessTime,
  MdCancel,
  MdCalendarMonth,
} from "react-icons/md";

const Politicas = () => {
  return (
    <>
      <UserHeader />

      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col xl="10">
            <Card className="shadow bg-white">
              <CardHeader>
                <h2 className="mb-0 text-default">Políticas del Servicio</h2>
                <p className="text-muted mb-0">
                  Reglas y normas para el uso correcto del sistema de reservas.
                </p>
              </CardHeader>

              <CardBody className="pt-4">

                {/* --- POLÍTICA 1 --- */}
                <div className="mb-5">
                  <h4 className="text-default d-flex align-items-center">
                    <MdCalendarMonth size={22} className="mr-2 text-primary" />
                    Política de Cancelación
                  </h4>
                  <p className="text-muted">
                    Puedes cancelar tu reserva con hasta{" "}
                    <strong>2 horas de anticipación</strong>.  
                    Si cancelas después de ese tiempo, se considera una{" "}
                    <strong>cancelación tardía</strong>.
                  </p>
                </div>

                {/* --- POLÍTICA 2 --- */}
                <div className="mb-5">
                  <h4 className="text-default d-flex align-items-center">
                    <MdAccessTime size={22} className="mr-2 text-warning" />
                    Política de Atrasos
                  </h4>
                  <p className="text-muted">
                    Se permite un atraso máximo de{" "}
                    <strong>10 minutos</strong>.  
                    Pasado ese periodo, el profesional puede atender a otro cliente
                    y marcar tu reserva como <strong>No Asistida</strong>.
                  </p>
                </div>

                {/* --- POLÍTICA 3 --- */}
                <div className="mb-5">
                  <h4 className="text-default d-flex align-items-center">
                    <MdCancel size={22} className="mr-2 text-danger" />
                    Política de No Asistencia (No Show)
                  </h4>
                  <p className="text-muted">
                    Si no te presentas a tu hora agendada, se marcará como{" "}
                    <strong>No Asistida</strong>.  
                    Acumular varias inasistencias puede generar restricciones.
                  </p>

                  <ul className="mt-2 text-muted">
                    <li>1 inasistencia → Advertencia</li>
                    <li>2 inasistencias → Riesgo de bloqueo</li>
                    <li>3 inasistencias → Bloqueo por 7 días</li>
                  </ul>
                </div>

                {/* --- POLÍTICA 4 --- */}
                <div className="mb-5">
                  <h4 className="text-default d-flex align-items-center">
                    <MdWarning size={22} className="mr-2 text-danger" />
                    Modificaciones por parte del profesional
                  </h4>
                  <p className="text-muted">
                    En situaciones excepcionales, un profesional puede modificar su
                    horario. Si tu reserva se ve afectada, tendrás opción de{" "}
                    <strong>reagendar o cancelar sin penalización</strong>.
                  </p>
                </div>

                {/* --- POLÍTICA 5 --- */}
                <div className="mb-4">
                  <h4 className="text-default d-flex align-items-center">
                    <MdWarning size={22} className="mr-2 text-info" />
                    Responsabilidad del Cliente
                  </h4>
                  <p className="text-muted">
                    Es tu responsabilidad revisar tus reservas y mantener tus
                    datos actualizados para recibir notificaciones y recordatorios.
                  </p>
                </div>

              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Politicas;

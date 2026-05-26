import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Container,
  Row,
  Col,
  Input,
} from "reactstrap";

import UserHeader from "components/Headers/UserHeader";

import { useReserva } from "context/ReservaContext";
import { useEmpresa } from "context/EmpresaContext";
import { useHorario } from "context/HorarioContext";

import ReservaCardMobile from "../../../components/gestionReservas/ReservaCardMobile";
import ReservaTableDesktop from "../../../components/gestionReservas/ReservaTableDesktop";
import ReservaDetalleModal from "../../../components/gestionReservas/ReservaDetalleModal";
import ReagendarModal from "../../../components/gestionReservas/ReagendarModal";

const GestionReservas = () => {
  const {
    reservas,
    getReservasPorFechaBarbero,
    loading,
    cancelarReserva,
    marcarReservaNoAsistida,
    reagendarReserva,
  } = useReserva();

  const { empresa } = useEmpresa();
  const { getHorasDisponiblesBarbero } = useHorario();

  const [modal, setModal] = useState(false);
  const [modalReagendar, setModalReagendar] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

  const [filtroFecha, setFiltroFecha] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [vistaMobile, setVistaMobile] = useState(false);

  const [nuevaFecha, setNuevaFecha] = useState("");
  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);
  const [loadingHoras, setLoadingHoras] = useState(false);

  useEffect(() => {
    getReservasPorFechaBarbero(filtroFecha);
  }, [filtroFecha]);

  useEffect(() => {
    const checkMobile = () => setVistaMobile(window.innerWidth < 768);

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleVerReserva = (reserva) => {
    setReservaSeleccionada(reserva);
    setModal(true);
  };

  return (
    <>
      <UserHeader />

      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col xl="10" lg="12">
            <Card className="bg-secondary shadow">
              <CardHeader className="bg-white border-0">
                <Row className="align-items-center">
                  <Col md="8">
                    <h3 className="mb-0">Gestión de Reservas</h3>
                  </Col>

                  <Col md="4">
                    <Input
                      type="date"
                      value={filtroFecha}
                      onChange={(e) => setFiltroFecha(e.target.value)}
                    />
                  </Col>
                </Row>
              </CardHeader>

              <CardBody>
                {vistaMobile ? (
                  <ReservaCardMobile
                    reservas={reservas}
                    empresa={empresa}
                    onVer={handleVerReserva}
                  />
                ) : (
                  <ReservaTableDesktop
                    reservas={reservas}
                    empresa={empresa}
                    onVer={handleVerReserva}
                  />
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <ReservaDetalleModal
        modal={modal}
        setModal={setModal}
        reservaSeleccionada={reservaSeleccionada}
        setReservaSeleccionada={setReservaSeleccionada}
        vistaMobile={vistaMobile}
        cancelarReserva={cancelarReserva}
        marcarReservaNoAsistida={marcarReservaNoAsistida}
        setModalReagendar={setModalReagendar}
      />

      <ReagendarModal
        modal={modalReagendar}
        setModal={setModalReagendar}
        reservaSeleccionada={reservaSeleccionada}
        nuevaFecha={nuevaFecha}
        setNuevaFecha={setNuevaFecha}
        horasDisponibles={horasDisponibles}
        setHorasDisponibles={setHorasDisponibles}
        horaSeleccionada={horaSeleccionada}
        setHoraSeleccionada={setHoraSeleccionada}
        loadingHoras={loadingHoras}
        setLoadingHoras={setLoadingHoras}
        getHorasDisponiblesBarbero={getHorasDisponiblesBarbero}
        reagendarReserva={reagendarReserva}
      />
    </>
  );
};

export default GestionReservas;

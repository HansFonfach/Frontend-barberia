import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Row,
  Col,
  Table,
  Modal,
  Badge,
  Input,
} from "reactstrap";
import UserHeader from "components/Headers/UserHeader.js";
import { useReserva } from "context/ReservaContext";

const GestionReservas = () => {
  const {
    reservas,
    getReservasPorFechaBarbero,
    loading,
    error,
    cancelarReserva,
  } = useReserva();

  const [modal, setModal] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [filtroFecha, setFiltroFecha] = useState(
    new Date().toISOString().split("T")[0]
  );

  const toggle = () => setModal(!modal);

  // Traer reservas cada vez que cambie la fecha
  useEffect(() => {
    if (filtroFecha) getReservasPorFechaBarbero(filtroFecha);
  }, [filtroFecha]);

  const getEstado = (fecha) => {
    return new Date(fecha) >= new Date() ? "Pendiente" : "Terminada";
  };

  const handleVerResumen = (reserva) => {
    setReservaSeleccionada(reserva);
    setModal(true);
  };

  const handleCancelar = async () => {
    if (!reservaSeleccionada) return;
    if (window.confirm("¿Estás seguro de que deseas cancelar esta reserva?")) {
      await cancelarReserva(reservaSeleccionada._id);
      setModal(false);
      getReservasPorFechaBarbero(filtroFecha); // refrescar tabla
    }
  };

  useEffect(() => {
    if (reservas.length > 0) {
      console.log("RESERVAS:", reservas);
    }
  }, [reservas]);

  return (
    <>
      <UserHeader />
      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col className="mb-5" xl="10">
            <Card className="bg-secondary shadow">
              <CardHeader className="bg-white border-0">
                <Row className="align-items-center">
                  <Col xs="8">
                    <h3 className="mb-0 text-default">
                      <i className="ni ni-calendar-grid-58 text-primary mr-2"></i>
                      Gestión de Reservas
                    </h3>
                    <p className="text-sm text-muted mb-0 mt-1">
                      Visualiza y gestiona las reservas por fecha
                    </p>
                  </Col>
                  <Col xs="4" className="text-right">
                    <Input
                      type="date"
                      value={filtroFecha}
                      onChange={(e) => setFiltroFecha(e.target.value)}
                    />
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                {loading ? (
                  <p>Cargando reservas...</p>
                ) : reservas.length === 0 ? (
                  <p className="text-center">No hay reservas para esta fecha</p>
                ) : (
                  <div className="table-responsive">
                    <Table
                      className="align-items-center table-flush"
                      responsive
                    >
                      <thead className="thead-light">
                        <tr>
                          <th>Cliente</th>
                          <th>Servicio</th>
                          <th>Asistencia</th>
                          <th>Hora</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservas.map((reserva) => (
                          <tr key={reserva._id}>
                            <td>
                              {reserva.cliente?.suscrito && "⭐ "}
                              {reserva.cliente?.nombre}{" "}
                              {reserva.cliente?.apellido}
                            </td>

                            <td>{reserva.servicio?.nombre}</td>

                            {/* Nueva columna Suscripción */}
                            <td>
                              {reserva.suscripcion ? (
                                <Badge
                                  color={
                                    reserva.suscripcion.posicion >
                                    reserva.suscripcion.limite
                                      ? "danger"
                                      : "success"
                                  }
                                >
                                  {reserva.suscripcion.posicion}/
                                  {reserva.suscripcion.limite}
                                </Badge>
                              ) : (
                                <strong className="ml-2">-</strong>
                              )}
                            </td>

                            <td>
                              {new Date(reserva.fecha).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>

                            <td>
                              <Badge
                                color={
                                  getEstado(reserva.fecha) === "Pendiente"
                                    ? "primary"
                                    : "success"
                                }
                              >
                                {getEstado(reserva.fecha)}
                              </Badge>
                            </td>

                            <td>
                              <Button
                                color="info"
                                size="sm"
                                className="mr-2"
                                onClick={() => handleVerResumen(reserva)}
                              >
                                Ver
                              </Button>
                              {getEstado(reserva.fecha) === "Pendiente" && (
                                <Button
                                  color="danger"
                                  size="sm"
                                  onClick={() => handleVerResumen(reserva)}
                                >
                                  Cancelar
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modal resumen de reserva */}
      <Modal isOpen={modal} toggle={toggle} className="modal-dialog-centered">
        {reservaSeleccionada && (
          <>
            <div className="modal-header">
              <h6 className="modal-title">Resumen de reserva</h6>
              <button aria-label="Close" className="close" onClick={toggle}>
                <span aria-hidden={true}>×</span>
              </button>
            </div>
            <div className="modal-body">
              <p>
                <strong>Cliente:</strong> {reservaSeleccionada.cliente?.nombre}{" "}
                {reservaSeleccionada.cliente?.apellido}
              </p>
              <p>
                <strong>Servicio:</strong>{" "}
                {reservaSeleccionada.servicio?.nombre}
              </p>
              <p>
                <strong>Hora:</strong>{" "}
                {new Date(reservaSeleccionada.fecha).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p>
                <strong>Estado:</strong>{" "}
                <Badge
                  color={
                    getEstado(reservaSeleccionada.fecha) === "Pendiente"
                      ? "primary"
                      : "success"
                  }
                >
                  {getEstado(reservaSeleccionada.fecha)}
                </Badge>
              </p>
            </div>
            <div className="modal-footer">
              {getEstado(reservaSeleccionada.fecha) === "Pendiente" && (
                <Button color="danger" onClick={handleCancelar}>
                  Cancelar reserva
                </Button>
              )}
              <Button color="secondary" onClick={toggle}>
                Cerrar
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default GestionReservas;

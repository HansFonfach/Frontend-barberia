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

  const handleNoAsistio = (reserva) => {
    // lógica para marcar no asistencia
    console.log("Marcando como no asistió:", reserva);
  };

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
                              {(reserva.suscripcion && "⭐") ||
                                (!reserva.suscripcion && "🧔🏻‍♂️")}
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
                                <>
                                  <Button
                                    color="danger"
                                    size="sm"
                                    className="mr-2"
                                    onClick={() => handleVerResumen(reserva)}
                                  >
                                    Cancelar
                                  </Button>
                                </>
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
      <Modal
        isOpen={modal}
        toggle={toggle}
        className="modal-dialog-centered modal-lg"
      >
        {reservaSeleccionada && (
          <div className="modal-content">
            {/* Header con color primario de Argon */}
            <div className="modal-header bg-gradient-primary">
              <h5 className="modal-title text-white">
                <i className="ni ni-single-copy-04 mr-2"></i>
                Detalles de la Reserva
              </h5>
              <button
                type="button"
                className="close text-white"
                data-dismiss="modal"
                aria-label="Close"
                onClick={toggle}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div className="modal-body">
              <Row>
                {/* Información del Cliente */}
                <Col md="6">
                  <Card className="card-profile shadow-sm mb-4">
                    <CardHeader className="bg-white border-0">
                      <div className="d-flex align-items-center">
                        <div className="mr-3">
                          <span className="avatar avatar-lg rounded-circle bg-gradient-primary">
                            <i className="ni ni-single-02 text-white"></i>
                          </span>
                        </div>
                        <div>
                          <h5 className="mb-0">
                            {reservaSeleccionada.cliente?.nombre}{" "}
                            {reservaSeleccionada.cliente?.apellido}
                          </h5>
                          <p className="text-sm text-muted mb-0">
                            {reservaSeleccionada.suscripcion
                              ? "Suscriptor"
                              : "Cliente Regular"}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <div className="pl-md-4">
                        <p className="mb-2">
                          <strong className="text-muted">
                            <i className="ni ni-mobile-button mr-1"></i>
                            Teléfono:
                          </strong>
                          <span className="ml-2">
                            {reservaSeleccionada.cliente?.telefono}
                          </span>
                        </p>
                        <p className="mb-0">
                          <strong className="text-muted">
                            <i className="ni ni-tag mr-1"></i>
                            Tipo:
                          </strong>
                          <Badge
                            color={
                              reservaSeleccionada.suscripcion
                                ? "success"
                                : "info"
                            }
                            className="ml-2"
                          >
                            {reservaSeleccionada.suscripcion
                              ? "Suscriptor"
                              : "Regular"}
                          </Badge>
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                </Col>

                {/* Detalles de la Reserva */}
                <Col md="6">
                  <Card className="shadow-sm mb-4">
                    <CardHeader className="bg-white border-0">
                      <h6 className="mb-0">
                        <i className="ni ni-time-alarm mr-2"></i>
                        Información de la Reserva
                      </h6>
                    </CardHeader>
                    <CardBody>
                      <div className="pl-md-4">
                        <p className="mb-2">
                          <strong className="text-muted">
                            <i className="ni ni-scissors mr-1"></i>
                            Servicio:
                          </strong>
                          <span className="ml-2">
                            {reservaSeleccionada.servicio?.nombre}
                          </span>
                        </p>
                        <p className="mb-2">
                          <strong className="text-muted">
                            <i className="ni ni-watch-time mr-1"></i>
                            Hora:
                          </strong>
                          <span className="ml-2">
                            {new Date(
                              reservaSeleccionada.fecha
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </p>
                        <p className="mb-2">
                          <strong className="text-muted">
                            <i className="ni ni-calendar-grid-58 mr-1"></i>
                            Fecha:
                          </strong>
                          <span className="ml-2">
                            {new Date(
                              reservaSeleccionada.fecha
                            ).toLocaleDateString()}
                          </span>
                        </p>
                        <p className="mb-0">
                          <strong className="text-muted">
                            <i className="ni ni-check-bold mr-1"></i>
                            Estado:
                          </strong>
                          <Badge
                            color={
                              getEstado(reservaSeleccionada.fecha) ===
                              "Pendiente"
                                ? "primary"
                                : "info"
                            }
                            className="ml-2"
                          >
                            {getEstado(reservaSeleccionada.fecha)}
                          </Badge>
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </div>
            <div className="modal-footer">
              {getEstado(reservaSeleccionada.fecha) === "Pendiente" ? (
                <>
                  <Button
                    color="warning"
                    className="mr-2"
                    onClick={() => {
                      if (window.confirm("¿Marcar como NO ASISTIÓ?")) {
                        handleNoAsistio(reservaSeleccionada);
                        setModal(false);
                      }
                    }}
                  >
                    <i className="ni ni-user-run mr-1"></i>
                    No asistió
                  </Button>

                  <Button
                    color="danger"
                    className="mr-2"
                    onClick={handleCancelar}
                  >
                    <i className="ni ni-fat-remove mr-1"></i>
                    Cancelar
                  </Button>
                </>
              ) : (
                // Solo para reservas pasadas
                <Button
                  color="warning"
                  className="mr-2"
                  onClick={() => {
                    if (
                      window.confirm("¿Marcar como NO ASISTIÓ (retroactivo)?")
                    ) {
                      handleNoAsistio(reservaSeleccionada);
                      setModal(false);
                    }
                  }}
                >
                  <i className="ni ni-user-run mr-1"></i>
                  No asistió
                </Button>
              )}

              <Button color="secondary" onClick={toggle}>
                <i className="ni ni-curved-next mr-1"></i>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default GestionReservas;

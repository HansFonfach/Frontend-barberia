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
import Swal from "sweetalert2";

const GestionReservas = () => {
  const {
    reservas,
    getReservasPorFechaBarbero,
    loading,
    error,
    cancelarReserva,
    marcarReservaNoAsistida,
  } = useReserva();

  const [modal, setModal] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [filtroFecha, setFiltroFecha] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [vistaMobile, setVistaMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setVistaMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

    const { value: motivo, isConfirmed } = await Swal.fire({
      title: "¿Cancelar reserva?",
      html: "Esta acción no se puede revertir.",
      icon: "warning",
      input: "textarea",
      inputLabel: "Motivo de cancelación",
      inputPlaceholder: "Escribe el motivo aquí...",
      inputAttributes: { rows: 3 },
      inputValidator: (value) => {
        if (!value || value.trim() === "") {
          return "Debes ingresar un motivo";
        }
      },
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, cancelar reserva",
      cancelButtonText: "Volver",
    });

    if (!isConfirmed) return;

    await cancelarReserva(reservaSeleccionada._id, motivo);
    setModal(false);
    getReservasPorFechaBarbero(filtroFecha);

    Swal.fire({
      title: "Reserva cancelada",
      text: "La reserva fue cancelada correctamente, notificaremos al cliente con el motivo de cancelación.",
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleNoAsistio = async () => {
    if (!reservaSeleccionada) return;

    const res = await marcarReservaNoAsistida(reservaSeleccionada._id);

    if (!res) return;

    setModal(false);
    getReservasPorFechaBarbero(filtroFecha);

    Swal.fire({
      title: "Reserva actualizada",
      text: "La reserva fue marcada como NO ASISTIÓ",
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  // Renderizado para móvil (tarjetas en lugar de tabla)
  const renderMobileView = () => (
    <div className="reservas-mobile">
      {reservas.map((reserva) => (
        <Card key={reserva._id} className="mb-3 shadow-sm">
          <CardBody className="p-3">
            {/* Header con cliente y estado */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center">
                <span className="mr-2" style={{ fontSize: "1.2rem" }}>
                  {reserva.suscripcion ? "⭐" : "🧔🏻‍♂️"}
                </span>
                <strong className="text-dark">
                  {reserva.cliente?.nombre} {reserva.cliente?.apellido}
                </strong>
              </div>
              <Badge
                color={
                  getEstado(reserva.fecha) === "Pendiente"
                    ? "primary"
                    : "success"
                }
                pill
              >
                {getEstado(reserva.fecha)}
              </Badge>
            </div>

            {/* Detalles del servicio */}
            <div className="pl-4 mb-3">
              <div className="d-flex flex-wrap mb-1">
                <small className="text-muted w-50">
                  <i className="ni ni-scissors mr-1"></i>
                  Servicio:
                </small>
                <small className="w-50 text-right font-weight-bold">
                  {reserva.servicio?.nombre}
                </small>
              </div>

              <div className="d-flex flex-wrap mb-1">
                <small className="text-muted w-50">
                  <i className="ni ni-watch-time mr-1"></i>
                  Hora:
                </small>
                <small className="w-50 text-right font-weight-bold">
                  {new Date(reserva.fecha).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </small>
              </div>

              {reserva.suscripcion && (
                <div className="d-flex flex-wrap mb-1">
                  <small className="text-muted w-50">
                    <i className="ni ni-tag mr-1"></i>
                    Suscripción:
                  </small>
                  <small className="w-50 text-right">
                    <Badge
                      color={
                        reserva.suscripcion.posicion >
                        reserva.suscripcion.limite
                          ? "danger"
                          : "success"
                      }
                      pill
                    >
                      {reserva.suscripcion.posicion}/
                      {reserva.suscripcion.limite}
                    </Badge>
                  </small>
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="d-flex justify-content-end border-top pt-2">
              <Button
                color="info"
                size="sm"
                className="mr-2"
                onClick={() => handleVerResumen(reserva)}
              >
                <i className="ni ni-zoom-split-in mr-1"></i>
                Ver
              </Button>

              {getEstado(reserva.fecha) === "Pendiente" && (
                <Button
                  color="danger"
                  size="sm"
                  onClick={() => handleVerResumen(reserva)}
                >
                  <i className="ni ni-fat-remove mr-1"></i>
                  Cancelar
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );

  // Renderizado para desktop (tabla)
  const renderDesktopView = () => (
    <div className="table-responsive">
      <Table className="align-items-center table-flush" responsive>
        <thead className="thead-light">
          <tr>
            <th>Cliente</th>
            <th>Servicio</th>
            <th>Suscripción</th>
            <th>Hora</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map((reserva) => (
            <tr key={reserva._id}>
              <td className="text-nowrap">
                <span className="mr-2">
                  {reserva.suscripcion ? "⭐" : "🧔🏻‍♂️"}
                </span>
                {reserva.cliente?.nombre} {reserva.cliente?.apellido}
              </td>
              <td className="text-nowrap">{reserva.servicio?.nombre}</td>
              <td>
                {reserva.suscripcion ? (
                  <Badge
                    color={
                      reserva.suscripcion.posicion > reserva.suscripcion.limite
                        ? "danger"
                        : "success"
                    }
                    pill
                  >
                    {reserva.suscripcion.posicion}/{reserva.suscripcion.limite}
                  </Badge>
                ) : (
                  <Badge color="secondary" pill>
                    -
                  </Badge>
                )}
              </td>
              <td className="text-nowrap">
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
                  pill
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
  );

  return (
    <>
      <UserHeader />
      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col className="mb-5" xl="10" lg="12" md="12">
            <Card className="bg-secondary shadow">
              <CardHeader className="bg-white border-0">
                <Row className="align-items-center">
                  <Col xs="12" md="8" className="mb-3 mb-md-0">
                    <h3 className="mb-0 text-default">
                      <i className="ni ni-calendar-grid-58 text-primary mr-2"></i>
                      Gestión de Reservas
                    </h3>
                    <p className="text-sm text-muted mb-0 mt-1">
                      Visualiza y gestiona las reservas por fecha
                    </p>
                  </Col>
                  <Col xs="12" md="4">
                    <Input
                      type="date"
                      value={filtroFecha}
                      onChange={(e) => setFiltroFecha(e.target.value)}
                      className="w-100"
                    />
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="sr-only">Cargando...</span>
                    </div>
                    <p className="mt-2">Cargando reservas...</p>
                  </div>
                ) : reservas.length === 0 ? (
                  <div className="text-center py-5">
                    <i
                      className="ni ni-calendar-grid-58 text-muted"
                      style={{ fontSize: "3rem" }}
                    ></i>
                    <p className="mt-3 text-muted">
                      No hay reservas para esta fecha
                    </p>
                  </div>
                ) : vistaMobile ? (
                  renderMobileView()
                ) : (
                  renderDesktopView()
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modal resumen de reserva - Mejorado para móvil */}
      <Modal
        isOpen={modal}
        toggle={toggle}
        className={`modal-dialog-centered ${vistaMobile ? "modal-sm" : "modal-lg"}`}
      >
        {reservaSeleccionada && (
          <div className="modal-content">
            <div className="modal-header bg-gradient-primary">
              <h5 className="modal-title text-white">
                <i className="ni ni-single-copy-04 mr-2"></i>
                Detalles de la Reserva
              </h5>
              <button
                type="button"
                className="close text-white"
                onClick={toggle}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div className="modal-body">
              <Row>
                <Col xs="12" md="6" className={!vistaMobile ? "pr-md-2" : ""}>
                  <Card className="card-profile shadow-sm mb-3">
                    <CardHeader className="bg-white border-0">
                      <div className="d-flex align-items-center">
                        <div className="mr-3">
                          <span className="avatar avatar-lg rounded-circle bg-gradient-primary">
                            <i className="ni ni-single-02 text-white"></i>
                          </span>
                        </div>
                        <div className="text-truncate">
                          <h5 className="mb-0 text-truncate">
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
                      <div className={vistaMobile ? "" : "pl-md-4"}>
                        <p className="mb-2 d-flex flex-wrap">
                          <strong className="text-muted mr-2">
                            <i className="ni ni-mobile-button mr-1"></i>
                            Teléfono:
                          </strong>
                          <span className="ml-auto font-weight-bold">
                            {reservaSeleccionada.cliente?.telefono}
                          </span>
                        </p>
                        <p className="mb-0 d-flex flex-wrap">
                          <strong className="text-muted mr-2">
                            <i className="ni ni-tag mr-1"></i>
                            Tipo:
                          </strong>
                          <Badge
                            color={
                              reservaSeleccionada.suscripcion
                                ? "success"
                                : "info"
                            }
                            className="ml-auto"
                            pill
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

                <Col xs="12" md="6" className={!vistaMobile ? "pl-md-2" : ""}>
                  <Card className="shadow-sm">
                    <CardHeader className="bg-white border-0">
                      <h6 className="mb-0">
                        <i className="ni ni-time-alarm mr-2"></i>
                        Información de la Reserva
                      </h6>
                    </CardHeader>
                    <CardBody>
                      <div className={vistaMobile ? "" : "pl-md-4"}>
                        <p className="mb-2 d-flex flex-wrap">
                          <strong className="text-muted mr-2">
                            <i className="ni ni-scissors mr-1"></i>
                            Servicio:
                          </strong>
                          <span className="ml-auto font-weight-bold text-right">
                            {reservaSeleccionada.servicio?.nombre}
                          </span>
                        </p>
                        <p className="mb-2 d-flex flex-wrap">
                          <strong className="text-muted mr-2">
                            <i className="ni ni-watch-time mr-1"></i>
                            Hora:
                          </strong>
                          <span className="ml-auto font-weight-bold">
                            {new Date(
                              reservaSeleccionada.fecha,
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </p>
                        <p className="mb-2 d-flex flex-wrap">
                          <strong className="text-muted mr-2">
                            <i className="ni ni-calendar-grid-58 mr-1"></i>
                            Fecha:
                          </strong>
                          <span className="ml-auto font-weight-bold">
                            {new Date(
                              reservaSeleccionada.fecha,
                            ).toLocaleDateString()}
                          </span>
                        </p>
                        <p className="mb-0 d-flex flex-wrap">
                          <strong className="text-muted mr-2">
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
                            className="ml-auto"
                            pill
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

            <div className="modal-footer flex-wrap">
              {getEstado(reservaSeleccionada.fecha) === "Pendiente" ? (
                <>
                  <Button
                    color="warning"
                    size={vistaMobile ? "sm" : "md"}
                    className="mr-2 mb-2 mb-sm-0 flex-fill"
                    onClick={() => {
                      handleNoAsistio(reservaSeleccionada);
                    }}
                  >
                    <i className="ni ni-user-run mr-1"></i>
                    No asistió
                  </Button>

                  <Button
                    color="danger"
                    size={vistaMobile ? "sm" : "md"}
                    className="mr-2 mb-2 mb-sm-0 flex-fill"
                    onClick={handleCancelar}
                  >
                    <i className="ni ni-fat-remove mr-1"></i>
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button
                  color="warning"
                  size={vistaMobile ? "sm" : "md"}
                  className="mr-2 mb-2 mb-sm-0 flex-fill"
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

              <Button
                color="secondary"
                size={vistaMobile ? "sm" : "md"}
                className="flex-fill"
                onClick={toggle}
              >
                <i className="ni ni-curved-next mr-1"></i>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Estilos personalizados para móvil */}
      <style jsx>{`
        @media (max-width: 768px) {
          .reservas-mobile {
            max-height: 70vh;
            overflow-y: auto;
            padding-right: 5px;
          }

          .reservas-mobile::-webkit-scrollbar {
            width: 4px;
          }

          .reservas-mobile::-webkit-scrollbar-thumb {
            background-color: #888;
            border-radius: 4px;
          }
        }
      `}</style>
    </>
  );
};

export default GestionReservas;

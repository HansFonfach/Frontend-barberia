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
import { useEmpresa } from "context/EmpresaContext";
import { useHorario } from "context/HorarioContext";

const GestionReservas = () => {
  const {
    reservas,
    getReservasPorFechaBarbero,
    loading,
    error,
    cancelarReserva,
    marcarReservaNoAsistida,
  } = useReserva();
  const { empresa } = useEmpresa();

  const [modal, setModal] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [filtroFecha, setFiltroFecha] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [vistaMobile, setVistaMobile] = useState(false);

  const { reagendarReserva } = useReserva();
  const { getHorasDisponiblesBarbero } = useHorario();

  const [modalReagendar, setModalReagendar] = useState(false);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);
  const [loadingHoras, setLoadingHoras] = useState(false);

  useEffect(() => {
    const checkMobile = () => setVistaMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggle = () => setModal(!modal);

  useEffect(() => {
    if (filtroFecha) getReservasPorFechaBarbero(filtroFecha);
  }, [filtroFecha]);

  /* =============================
      HELPERS DE ESTADO ACTUALIZADOS
  ============================== */
  const getEstado = (reserva) => {
    // ✅ RESPETAR ESTADOS REALES DEL BACK
    if (reserva.estado === "cancelada") return "Cancelada";
    if (reserva.estado === "no_asistio") return "No asistió";
    if (reserva.estado === "completada") return "Completada";
    if (reserva.estado === "reagendada") return "Reagendada";

    // ✅ Confirmación del cliente
    if (
      reserva.confirmacionAsistencia?.respondida &&
      reserva.confirmacionAsistencia?.respuesta === "confirma"
    ) {
      return "Confirmada por Cliente";
    }

    // ⏱️ SOLO si sigue activa
    const fechaReserva = new Date(reserva.fecha);
    const ahora = new Date();

    if (reserva.estado === "confirmada") return "Confirmada";

    if (fechaReserva < ahora) return "Terminada";

    return "Pendiente";
  };

  const getColorEstado = (reserva) => {
    const estado = getEstado(reserva);

    switch (estado) {
      case "No asistió":
        return "danger";
      case "Cancelada":
        return "dark";
      case "Reagendada":
        return "warning"; // 🔥 NUEVO
      case "Confirmada por Cliente":
        return "success";
      case "Confirmada":
        return "primary";
      case "Terminada":
        return "secondary";
      case "Completada":
        return "success";
      default:
        return "info";
    }
  };

  const esPendiente = (reserva) =>
    reserva.estado === "pendiente" || reserva.estado === "confirmada";

  /* =============================
      HANDLERS
  ============================== */
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
        if (!value || value.trim() === "") return "Debes ingresar un motivo";
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

  // 🔥 SOLO CAMBIÉ LO NECESARIO (handleFechaReagendar)

  const handleFechaReagendar = async (fecha) => {
    setNuevaFecha(fecha);
    setHoraSeleccionada(null);

    if (!fecha || !reservaSeleccionada) return;

    // ✅ FIX IMPORTANTE
    const barberoId =
      reservaSeleccionada?.barbero?._id || reservaSeleccionada?.barbero;

    const servicioId =
      reservaSeleccionada?.servicio?._id || reservaSeleccionada?.servicio;

    if (!barberoId || !servicioId) {
      console.warn("❌ Faltan datos:", { barberoId, servicioId });
      return;
    }

    try {
      setLoadingHoras(true);

      const response = await getHorasDisponiblesBarbero(
        barberoId,
        fecha,
        servicioId,
      );

      // ✅ FIX RESPONSE
      setHorasDisponibles(response?.horas || []);
    } catch (error) {
      console.error("❌ Error cargando horas:", error);
      setHorasDisponibles([]);
    } finally {
      setLoadingHoras(false);
    }
  };

  const handleConfirmarReagendar = async () => {
    if (!horaSeleccionada || !nuevaFecha) return;

    const result = await reagendarReserva(
      reservaSeleccionada._id,
      nuevaFecha,
      horaSeleccionada,
    );
    if (!result) return;

    setModalReagendar(false);
    setModal(false);
    getReservasPorFechaBarbero(filtroFecha);

    Swal.fire({
      title: "Reserva reagendada",
      text: `La reserva fue movida al ${nuevaFecha} a las ${horaSeleccionada}`,
      icon: "success",
      timer: 2500,
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

  const iconoCliente = (reserva) => {
    if (reserva.suscripcion) return "⭐";
    if (empresa?.slug === "lumicabeauty") return "🎀";
    return "🧔🏻‍♂️";
  };

  /* =============================
      VISTA MOBILE
  ============================== */
  const renderMobileView = () => (
    <div className="reservas-mobile">
      {reservas.map((reserva) => (
        <Card key={reserva._id} className="mb-3 shadow-sm">
          <CardBody className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center">
                <span className="mr-2" style={{ fontSize: "1.2rem" }}>
                  {iconoCliente(reserva)}
                </span>
                <strong className="text-dark">
                  {reserva.cliente?.nombre} {reserva.cliente?.apellido}
                </strong>
              </div>
              <Badge color={getColorEstado(reserva)} pill>
                {getEstado(reserva)}
              </Badge>
            </div>

            <div className="pl-4 mb-3">
              <div className="d-flex flex-wrap mb-1">
                <small className="text-muted w-50">
                  <i className="ni ni-scissors mr-1"></i>Servicio:
                </small>
                <small className="w-50 text-right font-weight-bold">
                  {reserva.servicio?.nombre}
                </small>
              </div>

              <div className="d-flex flex-wrap mb-1">
                <small className="text-muted w-50">
                  <i className="ni ni-watch-time mr-1"></i>Hora:
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
                    <i className="ni ni-tag mr-1"></i>Suscripción:
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
                      {reserva.suscripcion.esDobleServicio && " ×2"}
                    </Badge>
                  </small>
                </div>
              )}
            </div>

            <div className="d-flex justify-content-end border-top pt-2">
              <Button
                color="info"
                size="sm"
                className="mr-2"
                onClick={() => handleVerResumen(reserva)}
              >
                <i className="ni ni-zoom-split-in mr-1"></i>Ver
              </Button>

              {esPendiente(reserva) && (
                <Button
                  color="danger"
                  size="sm"
                  onClick={() => handleVerResumen(reserva)}
                >
                  <i className="ni ni-fat-remove mr-1"></i>Cancelar
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );

  /* =============================
      VISTA DESKTOP
  ============================== */
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
                <span className="mr-2">{iconoCliente(reserva)}</span>
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
                    {reserva.suscripcion.esDobleServicio && " ×2"}
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
                <Badge color={getColorEstado(reserva)} pill>
                  {getEstado(reserva)}
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
                {esPendiente(reserva) && (
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

      {/* =============================
          MODAL DETALLE RESERVA
      ============================== */}
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
                      <p className="mb-2 d-flex flex-wrap">
                        <strong className="text-muted mr-2">
                          <i className="ni ni-mobile-button mr-1"></i>Teléfono:
                        </strong>
                        <span className="ml-auto font-weight-bold">
                          {reservaSeleccionada.cliente?.telefono}
                        </span>
                      </p>
                      <p className="mb-0 d-flex flex-wrap">
                        <strong className="text-muted mr-2">
                          <i className="ni ni-tag mr-1"></i>Tipo:
                        </strong>
                        <Badge
                          color={
                            reservaSeleccionada.suscripcion ? "success" : "info"
                          }
                          className="ml-auto"
                          pill
                        >
                          {reservaSeleccionada.suscripcion
                            ? "Suscriptor"
                            : "Regular"}
                        </Badge>
                      </p>
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
                      <p className="mb-2 d-flex flex-wrap">
                        <strong className="text-muted mr-2">
                          <i className="ni ni-scissors mr-1"></i>Servicio:
                        </strong>
                        <span className="ml-auto font-weight-bold text-right">
                          {reservaSeleccionada.servicio?.nombre}
                        </span>
                      </p>
                      <p className="mb-2 d-flex flex-wrap">
                        <strong className="text-muted mr-2">
                          <i className="ni ni-watch-time mr-1"></i>Hora:
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
                          <i className="ni ni-calendar-grid-58 mr-1"></i>Fecha:
                        </strong>
                        <span className="ml-auto font-weight-bold">
                          {new Date(
                            reservaSeleccionada.fecha,
                          ).toLocaleDateString()}
                        </span>
                      </p>
                      <p className="mb-2 d-flex flex-wrap">
                        <strong className="text-muted mr-2">
                          <i className="ni ni-check-bold mr-1"></i>Estado:
                        </strong>
                        <Badge
                          color={getColorEstado(reservaSeleccionada)}
                          className="ml-auto"
                          pill
                        >
                          {getEstado(reservaSeleccionada)}
                        </Badge>
                      </p>

                      {/* --- SECCIÓN DE TRAZABILIDAD DE CONFIRMACIÓN --- */}
                      {reservaSeleccionada.confirmacionAsistencia
                        ?.solicitada && (
                        <div className="mt-3 p-2 bg-secondary rounded border shadow-none">
                          <small className="d-block text-muted mb-1 font-weight-bold">
                            <i className="ni ni-send mr-1 text-primary"></i>{" "}
                            RECORDATORIO 24H:
                          </small>
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-xs">Estado:</small>
                            {reservaSeleccionada.confirmacionAsistencia
                              .respondida ? (
                              <Badge
                                color={
                                  reservaSeleccionada.confirmacionAsistencia
                                    .respuesta === "confirma"
                                    ? "success"
                                    : "danger"
                                }
                                className="text-xxs"
                              >
                                {reservaSeleccionada.confirmacionAsistencia
                                  .respuesta === "confirma"
                                  ? "CONFIRMÓ"
                                  : "CANCELÓ VÍA LINK"}
                              </Badge>
                            ) : (
                              <Badge color="warning" className="text-xxs">
                                ENVIADO / SIN RESPUESTA
                              </Badge>
                            )}
                          </div>
                          {reservaSeleccionada.confirmacionAsistencia
                            .respondidaEn && (
                            <div className="d-flex justify-content-between align-items-center mt-1">
                              <small className="text-xs">Respondido:</small>
                              <small className="font-weight-bold text-xs text-primary">
                                {new Date(
                                  reservaSeleccionada.confirmacionAsistencia
                                    .respondidaEn,
                                ).toLocaleString([], {
                                  day: "2-digit",
                                  month: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </small>
                            </div>
                          )}
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </div>

            <div className="modal-footer flex-wrap">
              {esPendiente(reservaSeleccionada) ? (
                <>
                  <Button
                    color="warning"
                    size={vistaMobile ? "sm" : "md"}
                    className="mr-2 mb-2 mb-sm-0 flex-fill"
                    onClick={handleNoAsistio}
                  >
                    <i className="ni ni-user-run mr-1"></i>
                    No asistió
                  </Button>
                  {esPendiente(reservaSeleccionada) && (
                    <Button
                      color="primary"
                      size={vistaMobile ? "sm" : "md"}
                      className="mr-2 mb-2 mb-sm-0 flex-fill"
                      onClick={() => {
                        setNuevaFecha("");
                        setHorasDisponibles([]);
                        setHoraSeleccionada(null);
                        setModalReagendar(true);
                      }}
                    >
                      <i className="ni ni-calendar-grid-58 mr-1"></i>
                      Reagendar
                    </Button>
                  )}
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
                reservaSeleccionada.estado !== "no_asistio" && (
                  <Button
                    color="warning"
                    size={vistaMobile ? "sm" : "md"}
                    className="mr-2 mb-2 mb-sm-0 flex-fill"
                    onClick={async () => {
                      const confirm = await Swal.fire({
                        title: "¿Marcar como No Asistió?",
                        text: "Esta acción es retroactiva.",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#f5a623",
                        cancelButtonColor: "#3085d6",
                        confirmButtonText: "Sí, marcar",
                        cancelButtonText: "Cancelar",
                      });
                      if (confirm.isConfirmed) handleNoAsistio();
                    }}
                  >
                    <i className="ni ni-user-run mr-1"></i>
                    No asistió
                  </Button>
                )
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

      <Modal
        isOpen={modalReagendar}
        toggle={() => setModalReagendar(false)}
        className="modal-dialog-centered"
      >
        <div className="modal-header bg-gradient-primary">
          <h5 className="modal-title text-white">
            <i className="ni ni-calendar-grid-58 mr-2"></i>
            Reagendar reserva
          </h5>
          <button
            className="close text-white"
            onClick={() => setModalReagendar(false)}
          >
            <span>&times;</span>
          </button>
        </div>

        <div className="modal-body">
          {/* Info de la reserva actual */}
          <div
            className="bg-secondary rounded p-3 mb-3 d-flex flex-wrap"
            style={{ gap: "1rem" }}
          >
            <div>
              <small className="text-muted d-block">Cliente</small>
              <strong>
                {reservaSeleccionada?.cliente?.nombre}{" "}
                {reservaSeleccionada?.cliente?.apellido}
              </strong>
            </div>
            <div>
              <small className="text-muted d-block">Servicio</small>
              <strong>{reservaSeleccionada?.servicio?.nombre}</strong>
            </div>
            <div>
              <small className="text-muted d-block">Hora actual</small>
              <Badge color="info" pill>
                {reservaSeleccionada &&
                  new Date(reservaSeleccionada.fecha).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </Badge>
            </div>
          </div>

          {/* Selector de fecha */}
          <div className="mb-3">
            <label
              className="form-control-label text-muted"
              style={{ fontSize: "13px" }}
            >
              Nueva fecha
            </label>
            <Input
              type="date"
              value={nuevaFecha}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => handleFechaReagendar(e.target.value)}
            />
          </div>

          {/* Slots de horas */}
          {nuevaFecha && (
            <div>
              <label
                className="form-control-label text-muted"
                style={{ fontSize: "13px" }}
              >
                Hora disponible
              </label>
              {loadingHoras ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-primary" />
                </div>
              ) : horasDisponibles.length === 0 ? (
                <p className="text-muted text-sm text-center py-2">
                  No hay horas disponibles para este día
                </p>
              ) : (
                <div className="d-flex flex-wrap" style={{ gap: "8px" }}>
                  {horasDisponibles.map((h) => (
                    <Button
                      key={h.hora}
                      size="sm"
                      color={
                        horaSeleccionada === h.hora ? "primary" : "secondary"
                      }
                      disabled={h.estado !== "disponible"}
                      onClick={() => setHoraSeleccionada(h.hora)}
                      style={{
                        minWidth: "70px",
                        opacity: h.estado !== "disponible" ? 0.4 : 1,
                      }}
                    >
                      {h.hora}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <Button color="secondary" onClick={() => setModalReagendar(false)}>
            Cancelar
          </Button>
          <Button
            color="primary"
            disabled={!horaSeleccionada || !nuevaFecha}
            onClick={handleConfirmarReagendar}
          >
            <i className="ni ni-check-bold mr-1"></i>
            Confirmar reagendo
          </Button>
        </div>
      </Modal>

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
        .text-xxs {
          font-size: 0.65rem;
        }
      `}</style>
    </>
  );
};

export default GestionReservas;

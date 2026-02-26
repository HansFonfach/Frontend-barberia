import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  Container,
  Row,
  Col,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
  Spinner,
  Pagination,
  PaginationItem,
  PaginationLink,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import {
  Calendar,
  Scissors,
  Clock,
  Trash2,
  X,
  History,
  AlertTriangle,
  Plus,
  ChevronLeft,
  ChevronRight,
  Zap,
  User,
} from "lucide-react";
import axios from "axios";
import UserHeader from "components/Headers/UserHeader.js";
import { useAuth } from "context/AuthContext";
import { useReserva } from "context/ReservaContext";
import Swal from "sweetalert2";
import { getReservasByUserId } from "api/reservas";
import { useEmpresa } from "context/EmpresaContext";

const MisReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalCancelar, setModalCancelar] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [alerta, setAlerta] = useState({
    mostrar: false,
    tipo: "",
    mensaje: "",
  });

  const [tabActiva, setTabActiva] = useState("futuras");
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(6);

  const { user } = useAuth();
  const { cancelarReserva } = useReserva();
   const { empresa, loading } = useEmpresa();

  const userId = user.id;

  const handleCancelarReserva = async (idReserva) => {
    try {
      const res = await cancelarReserva(idReserva);

      Swal.fire({
        title: "Reserva cancelada.",
        text: res?.message || "Tu reserva se ha cancelado correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      }).then(() => {
        setModalCancelar(false);
        setReservas((prev) => prev.filter((r) => r._id !== idReserva));
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error",
        text:
          error?.response?.data?.message || "No se pudo cancelar la reserva.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  };

  const fetchReservas = async () => {
    try {
      setCargando(true);
      const res = await getReservasByUserId(userId);

      const data = Array.isArray(res.data.reservas) ? res.data.reservas : [];
      setReservas(data);
    } catch (error) {
      console.error("Error completo:", error.response); // ← y esto
      setReservas([]);
      mostrarAlerta("danger", "Error al cargar las reservas");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchReservas();
  }, []);

  const mostrarAlerta = (tipo, mensaje) => {
    setAlerta({ mostrar: true, tipo, mensaje });
    setTimeout(
      () => setAlerta({ mostrar: false, tipo: "", mensaje: "" }),
      4000,
    );
  };

  const abrirModalCancelar = (reserva) => {
    setReservaSeleccionada(reserva);
    setModalCancelar(true);
  };

  const getEstadoCalculado = (reserva) => {
    const ahora = new Date();
    const fechaReserva = new Date(reserva.fecha);

    if (reserva.estado === "cancelada") return "cancelada";
    if (reserva.estado === "completada") return "completada";
    if (reserva.estado === "no_asistio") return "no_asistio";

    // Si la fecha y hora ya pasó pero no está marcada como completada
    if (fechaReserva < ahora) return "finalizada";

    return reserva.estado; // pendiente, confirmada, etc.
  };

  const getBadgeColor = (estado) => {
    const colores = {
      confirmada: "success",
      pendiente: "info",
      finalizada: "success",
      cancelada: "warning",
      no_asistio: "danger",
    };
    return colores[estado] || "success";
  };

  const getEstadoTexto = (estado) => {
    const estados = {
      confirmada: "Confirmada",
      pendiente: "Pendiente",
      finalizada: "Finalizada",
      completada: "Completada",
      cancelada: "Cancelada",
      no_asistio: "No asistió",
    };
    return estados[estado] || estado;
  };
  const formatFecha = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("es-CL", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatHora = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const esPasada = (fecha) => new Date(fecha) < new Date();

  const reservasFuturas = reservas.filter(
    (r) => r.estado === "pendiente" || r.estado === "confirmada",
  );
  const reservasHistorial = reservas.filter(
    (r) =>
      r.estado === "cancelada" ||
      r.estado === "completada" ||
      r.estado === "no_asistio" ||
      getEstadoCalculado(r) === "finalizada",
  );

  const reservasActivas =
    tabActiva === "futuras" ? reservasFuturas : reservasHistorial;

  const indexUltima = paginaActual * itemsPorPagina;
  const indexPrimera = indexUltima - itemsPorPagina;
  const reservasPagina = reservasActivas.slice(indexPrimera, indexUltima);
  const totalPaginas = Math.ceil(reservasActivas.length / itemsPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const Paginacion = () => {
    if (totalPaginas <= 1) return null;

    return (
      <Pagination className="justify-content-center mt-4">
        <PaginationItem disabled={paginaActual === 1}>
          <PaginationLink
            previous
            onClick={() => cambiarPagina(paginaActual - 1)}
          >
            <ChevronLeft size={16} />
          </PaginationLink>
        </PaginationItem>

        {[...Array(totalPaginas)].map((_, index) => {
          const numeroPagina = index + 1;
          return (
            <PaginationItem
              key={numeroPagina}
              active={numeroPagina === paginaActual}
            >
              <PaginationLink onClick={() => cambiarPagina(numeroPagina)}>
                {numeroPagina}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem disabled={paginaActual === totalPaginas}>
          <PaginationLink next onClick={() => cambiarPagina(paginaActual + 1)}>
            <ChevronRight size={16} />
          </PaginationLink>
        </PaginationItem>
      </Pagination>
    );
  };

  const renderContenido = () => {
    if (reservasActivas.length === 0) {
      return (
        <div className="text-center py-6">
          {tabActiva === "futuras" ? (
            <>
              <Calendar size={48} className="text-muted mb-3" />
              <h5 className="text-muted mb-2">No hay reservas programadas</h5>
              <p className="text-muted mb-3">
                ¡Agenda tu próxima cita con nosotros!
              </p>
              <Button
                color="success"
                href="/reservar-hora"
                className="px-4 rounded-lg"
              >
                <Plus size={16} className="mr-1" /> Reservar Ahora
              </Button>
            </>
          ) : (
            <>
              <History size={48} className="text-muted mb-3" />
              <h5 className="text-muted mb-2">No hay historial de reservas</h5>
              <p className="text-muted">
                Tus reservas anteriores aparecerán aquí
              </p>
            </>
          )}
        </div>
      );
    }

    return (
      <>
        {/* Diseño tipo cards moderno */}
        <Row>
          {reservasPagina.map((reserva) => (
            <Col lg="6" xl="4" className="mb-4" key={reserva._id}>
              <Card
                className="shadow-sm border-0 h-100 hover-lift"
                style={{
                  transition: "all 0.3s ease",
                  borderRadius: "12px",
                  borderLeft: `4px solid ${
                    reserva.estado === "confirmada"
                      ? "#28a745"
                      : reserva.estado === "pendiente"
                        ? "#ffc107"
                        : reserva.estado === "completada"
                          ? "#17a2b8"
                          : "#6c757d"
                  }`,
                }}
              >
                <CardBody className="p-4 border">
                  {/* Header con fecha y estado */}
                  <div className="d-flex justify-content-between align-items-start mb-3 ">
                    <div>
                      <h6 className="font-weight-bold text-dark mb-1">
                        {formatFecha(reserva.fecha)}
                      </h6>
                      <small className="text-muted d-flex align-items-center">
                        <Clock size={12} className="mr-1" />
                        {formatHora(reserva.fecha)}
                      </small>
                    </div>
                    <Badge
                      color={getBadgeColor(getEstadoCalculado(reserva))}
                      className="rounded-pill px-3 py-2 font-weight-bold"
                    >
                      {getEstadoTexto(getEstadoCalculado(reserva))}
                    </Badge>
                  </div>

                  {/* Información del servicio */}
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <Scissors size={16} className="text-success mr-2" />
                      <h6 className="font-weight-bold mb-0 text-dark">
                        {reserva.servicio?.nombre || "Servicio no asignado"}
                      </h6>
                    </div>

                    <div className="d-flex justify-content-between text-sm">
                      <span className="text-muted">Precio:</span>
                      <strong className="text-success">
                        $
                        {reserva.servicio?.precio.toLocaleString() ||
                          "precio no asignado"}
                      </strong>
                    </div>
                  </div>

                  {/* Información del barbero */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-1">
                      <User size={16} className="text-primary mr-2" />
                      <small className="text-muted">{empresa.profesional}</small>
                    </div>
                    <h6 className="font-weight-bold text-dark mb-0">
                      {reserva.barbero?.nombre || "Barbero no asignado"}
                    </h6>
                  </div>

                  {/* Acciones - solo para reservas futuras */}
                  {tabActiva === "futuras" && (
                    <div className="border-top pt-3">
                      <Button
                        color="outline-danger"
                        size="sm"
                        block
                        className="rounded-lg font-weight-bold py-2 border-2"
                        onClick={() => abrirModalCancelar(reserva)}
                      >
                        <Trash2 size={14} className="mr-2" />
                        Cancelar Reserva
                      </Button>
                    </div>
                  )}

                  {/* Badge para historial */}
                  {tabActiva === "historial" && (
                    <div className="border-top pt-3">
                      <small className="text-muted">
                        {reserva.estado === "completada"
                          ? "✅ Completada"
                          : reserva.estado === "cancelada"
                            ? "❌ Cancelada"
                            : "📅 Finalizada"}
                      </small>
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>

        <Paginacion />
        <div className="text-center text-muted small mt-2">
          Mostrando {reservasPagina.length} de {reservasActivas.length} reservas
        </div>
      </>
    );
  };

  return (
    <>
      <UserHeader />
      <Container className="mt--7 mb-5" fluid>
        <Row className="justify-content-center">
          <Col lg="10" xl="8">
            {alerta.mostrar && (
              <Alert
                color={alerta.tipo}
                className="text-center mb-4 rounded-lg border-0 shadow-sm"
                fade={false}
              >
                {alerta.mensaje}
              </Alert>
            )}
            {/* Header */}
            <Card className="shadow-sm border-0 bg-white mb-5">
              <CardBody className="py-5">
                <Row className="align-items-center">
                  <Col lg="8">
                    <div className="bg-success rounded-circle d-inline-flex p-3 mb-3 shadow-sm">
                      <Scissors size={32} className="text-white" />
                    </div>
                    <h1 className="h3 font-weight-bold text-dark mb-2">
                      Mis Reservas 💈
                    </h1>
                    <p className="text-muted mb-0">
                      Gestiona y revisa el historial de tus citas fácilmente
                    </p>
                  </Col>
                  <Col lg="4" className="text-lg-right">
                    <Calendar size={64} className="text-success opacity-6" />
                  </Col>
                </Row>
              </CardBody>
            </Card>

            {cargando ? (
              <Card className="shadow-sm border-0 mb-4">
                <CardBody className="text-center py-5">
                  <Spinner color="success" size="lg" className="mb-3" />
                  <h5 className="text-muted">Cargando tus reservas...</h5>
                </CardBody>
              </Card>
            ) : (
              <Card className="shadow-sm rounded-lg border-0 bg-white mb-4">
                <CardBody className="p-0">
                  {/* Header pestañas */}
                  <div className="bg-success p-3 border-bottom rounded-top">
                    <Row className="align-items-center">
                      <Col>
                        <Nav tabs className="border-0">
                          <NavItem>
                            <NavLink
                              active={tabActiva === "futuras"}
                              onClick={() => {
                                setTabActiva("futuras");
                                setPaginaActual(1);
                              }}
                              className={`cursor-pointer rounded-lg font-weight-bold px-3 py-2 mr-2 ${
                                tabActiva === "futuras"
                                  ? "bg-success text-white"
                                  : "bg-success text-white"
                              }`}
                            >
                              <Calendar size={16} className="mr-1" /> Próximas
                              Citas
                              <Badge
                                color={
                                  tabActiva === "futuras" ? "light" : "success"
                                }
                                className="ml-2 text-white"
                              >
                                {reservasFuturas.length}
                              </Badge>
                            </NavLink>
                          </NavItem>
                          <NavItem>
                            <NavLink
                              active={tabActiva === "historial"}
                              onClick={() => {
                                setTabActiva("historial");
                                setPaginaActual(1);
                              }}
                              className={`cursor-pointer rounded-lg font-weight-bold px-3 py-2 ${
                                tabActiva === "historial"
                                  ? "bg-success text-white"
                                  : "bg-success text-white"
                              }`}
                            >
                              <History size={16} className="mr-1" /> Historial
                              <Badge
                                color={
                                  tabActiva === "historial"
                                    ? "success"
                                    : "success"
                                }
                                className="ml-2 text-white"
                              >
                                {reservasHistorial.length}
                              </Badge>
                            </NavLink>
                          </NavItem>
                        </Nav>
                      </Col>
                    </Row>
                  </div>
                  {/* Contenido */}
                  <div className="p-4">
                    <TabContent activeTab={tabActiva}>
                      <TabPane tabId="futuras">{renderContenido()}</TabPane>
                      <TabPane tabId="historial">{renderContenido()}</TabPane>
                    </TabContent>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Modal Cancelación */}
            <Modal
              isOpen={modalCancelar}
              toggle={() => setModalCancelar(false)}
              centered
              size="md"
              className="rounded-lg"
            >
              <ModalHeader
                toggle={() => setModalCancelar(false)}
                className="border-0 pb-0"
              >
                <div
                  className="bg-warning rounded-circle d-flex align-items-center justify-content-center mr-3"
                  style={{ width: "40px", height: "40px" }}
                >
                  <AlertTriangle size={20} className="text-white" />
                </div>
                <h5 className="mb-0 font-weight-bold text-dark">
                  Confirmar Cancelación
                </h5>
              </ModalHeader>
              <ModalBody className="pt-3">
                {reservaSeleccionada && (
                  <>
                    <p className="text-muted mb-3">
                      ¿Estás seguro de que deseas cancelar esta reserva? Esta
                      acción no se puede deshacer.
                    </p>
                    <Card className="shadow-sm rounded-lg border-success">
                      <CardBody>
                        <h6 className="font-weight-bold text-success d-flex align-items-center mb-2">
                          <Zap size={18} className="mr-2" /> Detalles de la
                          reserva
                        </h6>
                        <div className="small">
                          <div className="d-flex justify-content-between py-1 border-bottom">
                            <span className="text-muted">📅 Fecha:</span>
                            <strong>
                              {formatFecha(reservaSeleccionada.fecha)}
                            </strong>
                          </div>
                          <div className="d-flex justify-content-between py-1 border-bottom">
                            <span className="text-muted">⏰ Hora:</span>
                            <strong>
                              {formatHora(reservaSeleccionada.fecha)}
                            </strong>
                          </div>
                          <div className="d-flex justify-content-between py-1 border-bottom">
                            <span className="text-muted">✂️ Servicio:</span>
                            <strong>
                              {reservaSeleccionada?.servicio?.nombre ||
                                "Servicio no asignado"}
                            </strong>
                          </div>
                          <div className="d-flex justify-content-between py-1 border-bottom">
                            <span className="text-muted">💈 Barbero:</span>
                            <strong>
                              <strong>
                                {reservaSeleccionada?.barbero?.nombre ||
                                  "Barbero no asignado"}
                              </strong>
                            </strong>
                          </div>
                          <div className="d-flex justify-content-between pt-2">
                            <span className="text-muted">💰 Total:</span>
                            <strong className="text-success">
                              $
                              {reservaSeleccionada.servicio?.precio.toLocaleString() ||
                                "precio no asignado"}
                            </strong>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </>
                )}
              </ModalBody>
              <ModalFooter className="border-0 pt-0">
                <Button
                  color="outline-secondary"
                  onClick={() => setModalCancelar(false)}
                  className="rounded-lg px-4 font-weight-bold"
                >
                  <X size={16} className="mr-1" /> Mantener
                </Button>
                <Button
                  color="danger"
                  onClick={() => handleCancelarReserva(reservaSeleccionada._id)}
                  disabled={cargando}
                  className="rounded-lg px-4 font-weight-bold"
                >
                  {cargando ? (
                    <Spinner size="sm" className="mr-1" />
                  ) : (
                    <Trash2 size={16} className="mr-1" />
                  )}
                  Cancelar Reserva
                </Button>
              </ModalFooter>
            </Modal>
          </Col>
        </Row>
      </Container>

      <style>
        {`
            .hover-lift:hover {
              transform: translateY(-5px);
              box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
            }
          `}
      </style>
    </>
  );
};

export default MisReservas;

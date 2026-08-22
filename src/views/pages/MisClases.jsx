import React, { useContext, useEffect, useState } from "react";
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
  Spinner,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import {
  Calendar,
  Clock,
  Trash2,
  X,
  History,
  AlertTriangle,
  Plus,
  User,
  Dumbbell,
} from "lucide-react";
import Swal from "sweetalert2";
import UserHeader from "components/Headers/UserHeader.js";
import ClasesContext from "context/ClasesContext";

const formatFecha = (isoString) =>
  new Date(isoString).toLocaleDateString("es-CL", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const formatHora = (isoString) =>
  new Date(isoString).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Santiago",
  });

const getBadgeColor = (estado) => {
  const colores = {
    confirmada: "success",
    completada: "info",
    cancelada: "warning",
    no_asistio: "danger",
  };
  return colores[estado] || "secondary";
};

const getEstadoTexto = (estado) => {
  const estados = {
    confirmada: "Confirmada",
    completada: "Completada",
    cancelada: "Cancelada",
    no_asistio: "No asistió",
  };
  return estados[estado] || estado;
};

const getAccesoTexto = (tipoAcceso) => {
  const tipos = {
    membresia: "Mensualidad",
    prueba_gratis: "Prueba gratis",
    pase_dia: "Pase diario",
  };
  return tipos[tipoAcceso] || tipoAcceso;
};

/**
 * "Mis reservas" pero para clases grupales: historial + próximas clases del
 * cliente logueado, con opción de cancelar las que aún no ocurren.
 */
const MisClases = () => {
  const { misInscripciones, cancelarInscripcion } = useContext(ClasesContext);

  const [inscripciones, setInscripciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [tabActiva, setTabActiva] = useState("futuras");
  const [modalCancelar, setModalCancelar] = useState(false);
  const [seleccionada, setSeleccionada] = useState(null);
  const [cancelando, setCancelando] = useState(false);

  const cargar = async () => {
    setCargando(true);
    try {
      const data = await misInscripciones();
      setInscripciones(data);
    } catch (error) {
      console.error("Error al obtener mis clases:", error);
      setInscripciones([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abrirModalCancelar = (inscripcion) => {
    setSeleccionada(inscripcion);
    setModalCancelar(true);
  };

  const handleCancelar = async () => {
    if (!seleccionada) return;
    setCancelando(true);
    try {
      await cancelarInscripcion(seleccionada._id);
      Swal.fire({
        title: "Inscripción cancelada",
        text: "Ya no estás anotado en esa clase.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
      setModalCancelar(false);
      await cargar();
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo cancelar la inscripción",
        "error",
      );
    } finally {
      setCancelando(false);
    }
  };

  const ahora = new Date();
  const futuras = inscripciones.filter(
    (i) => i.estado === "confirmada" && new Date(i.fecha) > ahora,
  );
  const historial = inscripciones.filter(
    (i) =>
      i.estado === "cancelada" ||
      i.estado === "completada" ||
      i.estado === "no_asistio" ||
      (i.estado === "confirmada" && new Date(i.fecha) <= ahora),
  );

  const listaActiva = tabActiva === "futuras" ? futuras : historial;

  const renderTarjeta = (inscripcion) => (
    <Col lg="6" xl="4" className="mb-4" key={inscripcion._id}>
      <Card
        className="shadow-sm border-0 h-100"
        style={{
          borderRadius: "12px",
          borderLeft: `4px solid ${
            inscripcion.clase?.color ||
            (inscripcion.estado === "cancelada" ? "#f5365c" : "#2dce89")
          }`,
        }}
      >
        <CardBody className="p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h6 className="font-weight-bold text-dark mb-1">
                {formatFecha(inscripcion.fecha)}
              </h6>
              <small className="text-muted d-flex align-items-center">
                <Clock size={12} className="mr-1" />
                {formatHora(inscripcion.fecha)}
              </small>
            </div>
            <Badge
              color={getBadgeColor(inscripcion.estado)}
              className="rounded-pill px-3 py-2 font-weight-bold"
            >
              {getEstadoTexto(inscripcion.estado)}
            </Badge>
          </div>

          <div className="d-flex align-items-center mb-2">
            <Dumbbell size={16} className="text-success mr-2" />
            <h6 className="font-weight-bold mb-0 text-dark">
              {inscripcion.clase?.nombre || "Clase eliminada"}
            </h6>
          </div>

          {inscripcion.clase?.instructor && (
            <div className="d-flex align-items-center mb-3">
              <User size={16} className="text-primary mr-2" />
              <small className="text-muted">
                {inscripcion.clase.instructor.nombre}{" "}
                {inscripcion.clase.instructor.apellido}
              </small>
            </div>
          )}

          <Badge color="light" className="text-dark border mb-3">
            {getAccesoTexto(inscripcion.tipoAcceso)}
          </Badge>

          {inscripcion.estado === "confirmada" &&
            new Date(inscripcion.fecha) > ahora && (
              <div className="border-top pt-3">
                <Button
                  color="outline-danger"
                  size="sm"
                  block
                  className="rounded-lg font-weight-bold py-2 border-2"
                  onClick={() => abrirModalCancelar(inscripcion)}
                >
                  <Trash2 size={14} className="mr-2" />
                  Cancelar inscripción
                </Button>
              </div>
            )}
        </CardBody>
      </Card>
    </Col>
  );

  return (
    <>
      <UserHeader />
      <Container className="mt--7 mb-5" fluid>
        <Row className="justify-content-center">
          <Col lg="10" xl="8">
            <Card className="shadow-sm border-0 bg-white mb-5">
              <CardBody className="py-5">
                <Row className="align-items-center">
                  <Col lg="8">
                    <div className="bg-success rounded-circle d-inline-flex p-3 mb-3 shadow-sm">
                      <Dumbbell size={32} className="text-white" />
                    </div>
                    <h1 className="h3 font-weight-bold text-dark mb-2">
                      Mis clases
                    </h1>
                    <p className="text-muted mb-0">
                      Revisa tus próximas clases y tu historial de asistencia
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
                  <h5 className="text-muted">Cargando tus clases...</h5>
                </CardBody>
              </Card>
            ) : (
              <Card className="shadow-sm rounded-lg border-0 bg-white mb-4">
                <CardBody className="p-0">
                  <div className="bg-success p-3 border-bottom rounded-top">
                    <Nav tabs className="border-0">
                      <NavItem>
                        <NavLink
                          active={tabActiva === "futuras"}
                          onClick={() => setTabActiva("futuras")}
                          className="cursor-pointer rounded-lg font-weight-bold px-3 py-2 mr-2 bg-success text-white"
                        >
                          <Calendar size={16} className="mr-1" /> Próximas
                          <Badge
                            color={tabActiva === "futuras" ? "light" : "success"}
                            className="ml-2 text-white"
                          >
                            {futuras.length}
                          </Badge>
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          active={tabActiva === "historial"}
                          onClick={() => setTabActiva("historial")}
                          className="cursor-pointer rounded-lg font-weight-bold px-3 py-2 bg-success text-white"
                        >
                          <History size={16} className="mr-1" /> Historial
                          <Badge color="success" className="ml-2 text-white">
                            {historial.length}
                          </Badge>
                        </NavLink>
                      </NavItem>
                    </Nav>
                  </div>

                  <div className="p-4">
                    <TabContent activeTab={tabActiva}>
                      <TabPane tabId="futuras">
                        {futuras.length === 0 ? (
                          <div className="text-center py-6">
                            <Calendar size={48} className="text-muted mb-3" />
                            <h5 className="text-muted mb-2">
                              No tienes clases agendadas
                            </h5>
                            <p className="text-muted mb-3">
                              Inscríbete en una clase para verla aquí.
                            </p>
                            <Button
                              color="success"
                              href="/agendar-clase"
                              className="px-4 rounded-lg"
                            >
                              <Plus size={16} className="mr-1" /> Agendar clase
                            </Button>
                          </div>
                        ) : (
                          <Row>{futuras.map(renderTarjeta)}</Row>
                        )}
                      </TabPane>
                      <TabPane tabId="historial">
                        {historial.length === 0 ? (
                          <div className="text-center py-6">
                            <History size={48} className="text-muted mb-3" />
                            <h5 className="text-muted mb-2">
                              No hay historial todavía
                            </h5>
                          </div>
                        ) : (
                          <Row>{historial.map(renderTarjeta)}</Row>
                        )}
                      </TabPane>
                    </TabContent>
                  </div>
                </CardBody>
              </Card>
            )}
          </Col>
        </Row>
      </Container>

      <Modal
        isOpen={modalCancelar}
        toggle={() => setModalCancelar(false)}
        centered
        size="md"
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
            Confirmar cancelación
          </h5>
        </ModalHeader>
        <ModalBody className="pt-3">
          {seleccionada && (
            <>
              <p className="text-muted mb-3">
                ¿Seguro que quieres cancelar tu inscripción a esta clase?
              </p>
              <Card className="shadow-sm rounded-lg border-success">
                <CardBody className="small">
                  <div className="d-flex justify-content-between py-1 border-bottom">
                    <span className="text-muted">Clase:</span>
                    <strong>{seleccionada.clase?.nombre}</strong>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom">
                    <span className="text-muted">Fecha:</span>
                    <strong>{formatFecha(seleccionada.fecha)}</strong>
                  </div>
                  <div className="d-flex justify-content-between pt-2">
                    <span className="text-muted">Hora:</span>
                    <strong>{formatHora(seleccionada.fecha)}</strong>
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
            onClick={handleCancelar}
            disabled={cancelando}
            className="rounded-lg px-4 font-weight-bold"
          >
            {cancelando ? (
              <Spinner size="sm" className="mr-1" />
            ) : (
              <Trash2 size={16} className="mr-1" />
            )}
            Cancelar inscripción
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default MisClases;

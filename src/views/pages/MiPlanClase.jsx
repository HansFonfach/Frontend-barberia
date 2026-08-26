import React, { useContext, useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Progress,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  FormGroup,
  Input,
  Label,
  Button,
} from "reactstrap";
import {
  Dumbbell,
  Zap,
  CheckCircle,
  Landmark,
  Banknote,
  UploadCloud,
  Clock3,
  XCircle,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import Swal from "sweetalert2";
import UserHeader from "components/Headers/UserHeader.js";
import { useAuth } from "context/AuthContext";
import { useEmpresa } from "context/EmpresaContext";
import PlanesMembresiaContext from "context/PlanesMembresiaContext";
import { getEstadoMembresiaCliente } from "api/membresiasClases";
import {
  postCrearSolicitudMembresia,
  getMisSolicitudesMembresia,
} from "api/solicitudesMembresia";

const formatoPesos = (valor) =>
  `$${Number(valor || 0).toLocaleString("es-CL")}`;

/**
 * Modal para solicitar un plan: el cliente elige cómo va a pagar
 * (transferencia o efectivo en el local). Si es transferencia, ve los datos
 * de la cuenta y debe subir el comprobante; si es efectivo, solo confirma.
 * En ambos casos queda "pendiente" hasta que el dueño del gimnasio la
 * revisa y activa el plan manualmente — no hay pasarela de pago.
 */
const SolicitarPlanModal = ({ isOpen, toggle, plan, empresa, onEnviada }) => {
  const [metodo, setMetodo] = useState("transferencia");
  const [comprobanteFile, setComprobanteFile] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMetodo("transferencia");
      setComprobanteFile(null);
    }
  }, [isOpen, plan]);

  const datosTransferencia = empresa?.pagos?.transferencia || {};
  const tieneDatosTransferencia = Boolean(
    datosTransferencia.numeroCuenta || datosTransferencia.rut,
  );

  const handleEnviar = async () => {
    if (!plan) return;
    if (metodo === "transferencia" && !comprobanteFile) {
      Swal.fire("Error", "Debes adjuntar el comprobante de la transferencia", "error");
      return;
    }

    const formData = new FormData();
    formData.append("planId", plan._id);
    formData.append("metodo", metodo);
    if (metodo === "transferencia" && comprobanteFile) {
      formData.append("comprobante", comprobanteFile);
    }

    setEnviando(true);
    try {
      await postCrearSolicitudMembresia(formData);
      toggle();
      Swal.fire({
        icon: "success",
        title: "Solicitud enviada",
        text:
          metodo === "transferencia"
            ? "Recibimos tu comprobante. El gimnasio revisará tu pago y activará tu plan pronto."
            : "Tu solicitud quedó registrada. Paga en efectivo en el local y el gimnasio activará tu plan.",
      });
      onEnviada && onEnviada();
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo enviar la solicitud",
        "error",
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>
        Solicitar {plan?.nombre || "plan"}
      </ModalHeader>
      <ModalBody>
        <p className="text-muted mb-4">
          <strong>{plan?.nombre}</strong> · {formatoPesos(plan?.precio)} ·{" "}
          {plan?.clasesIncluidas} clases{plan?.tipoCiclo === "mensual" ? "/mes" : " en total"} · {plan?.duracionDias} días
        </p>

        <FormGroup>
          <Label className="font-weight-bold small">¿Cómo vas a pagar?</Label>
          <div className="d-flex" style={{ gap: 10 }}>
            <div
              onClick={() => setMetodo("transferencia")}
              className="d-flex align-items-center"
              style={{
                flex: 1,
                gap: 8,
                padding: "12px 14px",
                borderRadius: 12,
                cursor: "pointer",
                border:
                  metodo === "transferencia"
                    ? "2px solid #2dce89"
                    : "2px solid #e9ecef",
                background: metodo === "transferencia" ? "#E6F9F0" : "#fff",
                fontWeight: metodo === "transferencia" ? 700 : 400,
                color: metodo === "transferencia" ? "#1A7A4A" : "#525f7f",
              }}
            >
              <Landmark size={18} /> Transferencia
            </div>
            <div
              onClick={() => setMetodo("efectivo")}
              className="d-flex align-items-center"
              style={{
                flex: 1,
                gap: 8,
                padding: "12px 14px",
                borderRadius: 12,
                cursor: "pointer",
                border:
                  metodo === "efectivo"
                    ? "2px solid #2dce89"
                    : "2px solid #e9ecef",
                background: metodo === "efectivo" ? "#E6F9F0" : "#fff",
                fontWeight: metodo === "efectivo" ? 700 : 400,
                color: metodo === "efectivo" ? "#1A7A4A" : "#525f7f",
              }}
            >
              <Banknote size={18} /> Efectivo
            </div>
          </div>
        </FormGroup>

        {metodo === "transferencia" ? (
          tieneDatosTransferencia ? (
            <>
              <div
                className="p-3 mb-3"
                style={{ background: "#fafafa", borderRadius: 12, fontSize: 13 }}
              >
                {[
                  ["Banco", datosTransferencia.banco],
                  ["Tipo de cuenta", datosTransferencia.tipoCuenta],
                  ["N° de cuenta", datosTransferencia.numeroCuenta],
                  ["Titular", datosTransferencia.titular],
                  ["RUT", datosTransferencia.rut],
                  ["Correo", datosTransferencia.correo],
                ]
                  .filter(([, v]) => v)
                  .map(([label, value]) => (
                    <div
                      key={label}
                      className="d-flex justify-content-between py-1"
                      style={{ borderBottom: "1px solid #eee" }}
                    >
                      <span className="text-muted">{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
              </div>

              <FormGroup>
                <Label className="small font-weight-bold">
                  Comprobante de transferencia
                </Label>
                <Input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setComprobanteFile(e.target.files?.[0] || null)}
                />
                <small className="text-muted">
                  <UploadCloud size={12} className="mr-1" />
                  Sube una foto o PDF del comprobante una vez hecha la
                  transferencia
                </small>
              </FormGroup>
            </>
          ) : (
            <p className="text-warning small">
              El gimnasio todavía no configuró sus datos de transferencia.
              Escríbenos por WhatsApp para coordinar el pago.
            </p>
          )
        ) : (
          <p className="text-muted small mb-4">
            Paga <strong>{formatoPesos(plan?.precio)}</strong> en efectivo
            directamente en el local. Cuando confirmes esta solicitud, el
            gimnasio activará tu plan al recibir el pago.
          </p>
        )}

        <Button
          block
          color="success"
          disabled={
            enviando || (metodo === "transferencia" && !tieneDatosTransferencia)
          }
          onClick={handleEnviar}
          className="font-weight-bold mt-2"
        >
          {enviando ? "Enviando..." : "Enviar solicitud"}
        </Button>
      </ModalBody>
    </Modal>
  );
};

/**
 * "Suscripción" equivalente para gimnasios: muestra el estado de la
 * mensualidad del cliente (si tiene una activa) y el catálogo de planes
 * disponibles. Como no hay pasarela de pago online, la activación siempre
 * es manual: el cliente solicita el plan (transferencia + comprobante, o
 * efectivo en el local) y el dueño del gimnasio la revisa y activa.
 */
const MiPlanClase = () => {
  const { user } = useAuth();
  const { empresa } = useEmpresa();
  const { planes, loadingPlanes, getAllPlanes } = useContext(
    PlanesMembresiaContext,
  );

  const [membresia, setMembresia] = useState(null);
  const [cargandoMembresia, setCargandoMembresia] = useState(true);
  const [misSolicitudes, setMisSolicitudes] = useState([]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [planElegido, setPlanElegido] = useState(null);

  const cargarSolicitudes = async () => {
    try {
      const res = await getMisSolicitudesMembresia();
      setMisSolicitudes(res.data?.solicitudes || []);
    } catch (error) {
      console.error("Error al obtener mis solicitudes:", error);
    }
  };

  useEffect(() => {
    getAllPlanes(false);

    const cargarMembresia = async () => {
      try {
        const res = await getEstadoMembresiaCliente(user.id);
        setMembresia(res.data);
      } catch (error) {
        console.error("Error al obtener el estado de la mensualidad:", error);
        setMembresia({ activa: false });
      } finally {
        setCargandoMembresia(false);
      }
    };

    cargarMembresia();
    cargarSolicitudes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contactarWhatsapp = (plan) => {
    const telefono = (empresa?.telefono || "").replace(/\D/g, "");
    const mensaje = encodeURIComponent(
      plan
        ? `Hola! Quiero suscribirme al ${plan.nombre} ($${plan.precio.toLocaleString("es-CL")}) en ${empresa?.nombre || "el gimnasio"}.`
        : `Hola! Quiero información sobre las membresías de ${empresa?.nombre || "el gimnasio"}.`,
    );
    if (!telefono) return;
    window.open(`https://wa.me/${telefono}?text=${mensaje}`, "_blank");
  };

  const abrirSolicitud = (plan) => {
    setPlanElegido(plan);
    setModalAbierto(true);
  };

  const diasRestantes = membresia?.activa
    ? Math.max(
        0,
        Math.ceil(
          (new Date(membresia.fechaFin) - new Date()) / (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  const solicitudPendiente = misSolicitudes.find((s) => s.estado === "pendiente");
  const ultimaSolicitud = misSolicitudes[0];

  return (
    <>
      <UserHeader />
      <Container className="mt--7 mb-5" fluid>
        <Row className="justify-content-center">
          <Col xl="10" lg="11">
            {/* Card con fondo sólido para que el título no quede flotando
                directo sobre la imagen del header (se ve "corrido" si el
                fondo es transparente, porque el mt--7 sube este bloque hasta
                superponerse con el "¡BIENVENIDO!" de UserHeader). */}
            <Card className="border-0 shadow-sm mb-5" style={{ borderRadius: 16 }}>
              <CardBody className="text-center py-5">
                <div className="bg-success rounded-circle d-inline-flex p-3 mb-3 shadow-sm">
                  <Dumbbell size={28} className="text-white" />
                </div>
                <h1 className="font-weight-bold display-4">Mi plan</h1>
                <p className="text-muted lead mb-0">
                  {empresa?.nombre
                    ? `${empresa.nombre} · Tu mensualidad y los planes disponibles`
                    : "Tu mensualidad y los planes disponibles"}
                </p>
              </CardBody>
            </Card>

            {/* ===== SOLICITUD PENDIENTE / RECHAZADA ===== */}
            {solicitudPendiente && (
              <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
                <CardBody className="p-4 d-flex align-items-center" style={{ gap: 14 }}>
                  <Clock3 className="text-warning" size={28} />
                  <div>
                    <strong>
                      Tu solicitud para {solicitudPendiente.nombrePlan} está en
                      revisión
                    </strong>
                    <p className="text-muted small mb-0">
                      Método:{" "}
                      {solicitudPendiente.metodo === "transferencia"
                        ? "Transferencia"
                        : "Efectivo en el local"}
                      . Te avisaremos apenas el gimnasio la confirme.
                    </p>
                  </div>
                </CardBody>
              </Card>
            )}

            {!solicitudPendiente && ultimaSolicitud?.estado === "rechazada" && (
              <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
                <CardBody className="p-4 d-flex align-items-center" style={{ gap: 14 }}>
                  <XCircle className="text-danger" size={28} />
                  <div>
                    <strong>
                      Tu solicitud para {ultimaSolicitud.nombrePlan} fue rechazada
                    </strong>
                    <p className="text-muted small mb-0">
                      {ultimaSolicitud.motivoRechazo ||
                        "Contacta al gimnasio para más detalles."}{" "}
                      Puedes volver a solicitar el plan más abajo.
                    </p>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* ===== ESTADO ACTUAL ===== */}
            {cargandoMembresia ? (
              <Card className="shadow-sm border-0 mb-5">
                <CardBody className="text-center py-5">
                  <Spinner color="success" size="lg" />
                </CardBody>
              </Card>
            ) : membresia?.activa ? (
              <Card className="border-0 shadow mb-5" style={{ borderRadius: "20px" }}>
                <CardBody className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center">
                      <Zap className="text-success mr-2" size={24} />
                      <h4 className="mb-0">{membresia.nombrePlan}</h4>
                    </div>
                    <Badge color="success" pill>
                      Activa
                    </Badge>
                  </div>

                  <Row>
                    <Col xs="6" md="3" className="mb-3">
                      <div className="border rounded p-3 text-center">
                        <small className="text-muted d-block">
                          Días restantes
                        </small>
                        <strong className="h3">{diasRestantes}</strong>
                      </div>
                    </Col>
                    <Col xs="6" md="3" className="mb-3">
                      <div className="border rounded p-3 text-center">
                        <small className="text-muted d-block">
                          {membresia.tipoCiclo === "mensual"
                            ? "Clases usadas este mes"
                            : "Clases usadas"}
                        </small>
                        <strong className="h3">
                          {membresia.clasesUsadas}/{membresia.clasesIncluidas}
                        </strong>
                      </div>
                    </Col>
                  </Row>

                  <Progress
                    value={Math.min(
                      (membresia.clasesUsadas / membresia.clasesIncluidas) *
                        100,
                      100,
                    )}
                    color={membresia.clasesRestantes === 0 ? "danger" : "success"}
                    style={{ height: 8 }}
                    className="mt-2 mb-2"
                  />

                  <small className="text-muted">
                    {membresia.tipoCiclo === "mensual"
                      ? membresia.clasesRestantes > 0
                        ? `Te quedan ${membresia.clasesRestantes} clase${membresia.clasesRestantes !== 1 ? "s" : ""} este mes (se renuevan el próximo mes)`
                        : "Ya usaste todas las clases de este mes, se renuevan el próximo mes"
                      : membresia.clasesRestantes > 0
                        ? `Te quedan ${membresia.clasesRestantes} clase${membresia.clasesRestantes !== 1 ? "s" : ""} en tu plan`
                        : "Ya usaste todas las clases incluidas en tu plan"}
                  </small>
                </CardBody>
              </Card>
            ) : (
              <Card className="border-0 shadow-sm mb-5 bg-light">
                <CardBody className="p-4 text-center">
                  <p className="text-muted mb-3">
                    No tienes una mensualidad activa en este momento.
                  </p>
                  <p className="text-muted small mb-0">
                    Elige un plan más abajo y solicítalo para activarlo.
                  </p>
                </CardBody>
              </Card>
            )}

            {/* ===== PLANES DISPONIBLES ===== */}
            <h4 className="font-weight-bold mb-4">Planes disponibles</h4>

            {loadingPlanes ? (
              <div className="text-center py-5">
                <Spinner color="success" />
              </div>
            ) : planes.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardBody className="text-center py-5 text-muted">
                  Todavía no hay planes de membresía publicados.
                </CardBody>
              </Card>
            ) : (
              <Row className="justify-content-center">
                {planes.map((plan) => (
                  <Col key={plan._id} lg="5" md="6" className="mb-4">
                    <Card
                      className="shadow border-0 h-100"
                      style={{ borderRadius: "20px" }}
                    >
                      <CardHeader
                        className="bg-gradient-success text-white text-center border-0"
                        style={{ borderRadius: "20px 20px 0 0", padding: "2rem" }}
                      >
                        <h2 className="font-weight-bold text-white mb-1">
                          {plan.nombre}
                        </h2>
                        <div className="mt-3">
                          <span style={{ fontSize: "2.2rem", fontWeight: 800 }}>
                            ${plan.precio.toLocaleString("es-CL")}
                          </span>
                          <span className="ml-1" style={{ opacity: 0.85 }}>
                            / {plan.duracionDias === 30 ? "mes" : `${plan.duracionDias} días`}
                          </span>
                        </div>
                      </CardHeader>

                      <CardBody className="px-4 pt-4">
                        <ul className="list-unstyled mb-4">
                          <li className="d-flex align-items-start mb-2">
                            <CheckCircle
                              size={16}
                              className="text-success mr-2 mt-1"
                            />
                            <span>
                              <strong>{plan.clasesIncluidas}</strong>{" "}
                              {plan.tipoCiclo === "mensual"
                                ? "clases incluidas al mes"
                                : "clases incluidas en total"}
                            </span>
                          </li>
                          <li className="d-flex align-items-start mb-2">
                            <CheckCircle
                              size={16}
                              className="text-success mr-2 mt-1"
                            />
                            <span>
                              Válido por {plan.duracionDias} días desde la
                              activación
                            </span>
                          </li>
                        </ul>

                        <button
                          className="btn btn-success btn-block font-weight-bold"
                          style={{ borderRadius: "12px", padding: "12px" }}
                          disabled={!!solicitudPendiente}
                          onClick={() => abrirSolicitud(plan)}
                        >
                          {solicitudPendiente
                            ? "Ya tienes una solicitud pendiente"
                            : "Quiero este plan"}
                        </button>
                      </CardBody>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}

            {empresa?.telefono && (
              <p className="text-muted small mt-4 text-center">
                💬 ¿Tienes dudas? Escríbenos a WhatsApp:{" "}
                <a
                  href={`https://wa.me/${empresa.telefono.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-weight-bold text-success"
                  onClick={(e) => {
                    e.preventDefault();
                    contactarWhatsapp(planElegido);
                  }}
                >
                  {empresa.telefono}
                </a>
              </p>
            )}
          </Col>
        </Row>
      </Container>

      <SolicitarPlanModal
        isOpen={modalAbierto}
        toggle={() => setModalAbierto(false)}
        plan={planElegido}
        empresa={empresa}
        onEnviada={cargarSolicitudes}
      />
    </>
  );
};

export default MiPlanClase;

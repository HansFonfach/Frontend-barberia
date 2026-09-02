import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Table,
  Badge,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  FormGroup,
  Input,
} from "reactstrap";
import Swal from "sweetalert2";
import {
  getEmpresasRequest,
  getGananciasRequest,
  patchEstadoEmpresaRequest,
  patchSuscripcionEmpresaRequest,
  patchCobroEmpresaRequest,
  postPagoEmpresaRequest,
  logoutSuperAdminRequest,
} from "api/superAdmin";

const formatoPesos = (valor) =>
  valor || valor === 0 ? `$${Number(valor).toLocaleString("es-CL")}` : "—";

const formatoFecha = (valor) =>
  valor ? new Date(valor).toLocaleDateString("es-CL") : "—";

const BadgeEstado = ({ estado }) => (
  <Badge color={estado === "activo" ? "success" : "secondary"}>
    {estado === "activo" ? "Activa" : "Inactiva"}
  </Badge>
);

const BadgeSuscripcion = ({ estadoSuscripcion }) => {
  const colores = {
    trial: "info",
    activo: "success",
    suspendido: "warning",
    cancelado: "danger",
  };
  const etiquetas = {
    trial: "Trial",
    activo: "Al día",
    suspendido: "Suspendida",
    cancelado: "Cancelada",
  };
  return (
    <Badge color={colores[estadoSuscripcion] || "secondary"}>
      {etiquetas[estadoSuscripcion] || estadoSuscripcion}
    </Badge>
  );
};

/* =====================================================
   Modal: editar cobro (cuota mensual + día de pago)
===================================================== */
const ModalCobro = ({ empresa, onClose, onGuardado }) => {
  const [cuotaMensual, setCuotaMensual] = useState(empresa?.cuotaMensual ?? "");
  const [fechaPago, setFechaPago] = useState(empresa?.fechaPago ?? "");
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    setGuardando(true);
    try {
      await patchCobroEmpresaRequest(empresa._id, {
        cuotaMensual: cuotaMensual === "" ? undefined : Number(cuotaMensual),
        fechaPago: fechaPago === "" ? undefined : Number(fechaPago),
      });
      onGuardado();
      onClose();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "No se pudo guardar", "error");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal isOpen toggle={onClose} centered>
      <ModalHeader toggle={onClose}>Cobro — {empresa.nombre}</ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <label className="small font-weight-bold">Cuota mensual ($)</label>
            <Input
              type="number"
              value={cuotaMensual}
              onChange={(e) => setCuotaMensual(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <label className="small font-weight-bold">Día de pago del mes (1-31)</label>
            <Input
              type="number"
              min={1}
              max={31}
              value={fechaPago}
              onChange={(e) => setFechaPago(e.target.value)}
            />
          </FormGroup>
          <Button color="primary" block onClick={guardar} disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar"}
          </Button>
        </Form>
      </ModalBody>
    </Modal>
  );
};

/* =====================================================
   Modal: registrar pago recibido
===================================================== */
const ModalPago = ({ empresa, onClose, onGuardado }) => {
  const [monto, setMonto] = useState(empresa?.cuotaMensual || "");
  const [notas, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    setGuardando(true);
    try {
      await postPagoEmpresaRequest(empresa._id, {
        monto: monto === "" ? undefined : Number(monto),
        notas,
      });
      onGuardado();
      onClose();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "No se pudo registrar el pago", "error");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal isOpen toggle={onClose} centered>
      <ModalHeader toggle={onClose}>Registrar pago — {empresa.nombre}</ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <label className="small font-weight-bold">Monto recibido ($)</label>
            <Input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} />
          </FormGroup>
          <FormGroup>
            <label className="small font-weight-bold">Notas (opcional)</label>
            <Input
              type="text"
              placeholder="Ej: transferencia 02-09"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </FormGroup>
          <small className="text-muted d-block mb-3">
            Si esta empresa estaba suspendida por no pago, al registrar el pago se reactiva sola.
          </small>
          <Button color="success" block onClick={guardar} disabled={guardando}>
            {guardando ? "Guardando..." : "Registrar pago"}
          </Button>
        </Form>
      </ModalBody>
    </Modal>
  );
};

/* =====================================================
   Modal: suspender por no pago (pide motivo)
===================================================== */
const ModalSuspender = ({ empresa, onClose, onGuardado }) => {
  const [motivo, setMotivo] = useState("");
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    setGuardando(true);
    try {
      await patchSuscripcionEmpresaRequest(empresa._id, "suspendido", motivo);
      onGuardado();
      onClose();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "No se pudo suspender", "error");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal isOpen toggle={onClose} centered>
      <ModalHeader toggle={onClose}>Suspender — {empresa.nombre}</ModalHeader>
      <ModalBody>
        <p className="small text-muted">
          Esto bloquea el acceso al sistema para todos los usuarios de esta empresa
          (barberos/admin y clientes) hasta que la reactives o registres un pago.
        </p>
        <Form>
          <FormGroup>
            <label className="small font-weight-bold">Motivo (opcional, solo para ti)</label>
            <Input
              type="text"
              placeholder="Ej: no pagó cuota de septiembre"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </FormGroup>
          <Button color="danger" block onClick={guardar} disabled={guardando}>
            {guardando ? "Suspendiendo..." : "Suspender acceso"}
          </Button>
        </Form>
      </ModalBody>
    </Modal>
  );
};

/* =====================================================
   PANEL PRINCIPAL
===================================================== */
const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState([]);
  const [ganancias, setGanancias] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [modalCobro, setModalCobro] = useState(null);
  const [modalPago, setModalPago] = useState(null);
  const [modalSuspender, setModalSuspender] = useState(null);

  const cargarTodo = useCallback(async () => {
    try {
      const [resEmpresas, resGanancias] = await Promise.all([
        getEmpresasRequest(),
        getGananciasRequest(),
      ]);
      setEmpresas(resEmpresas.data.empresas);
      setGanancias(resGanancias.data);
    } catch (error) {
      if (error.response?.status !== 401) {
        Swal.fire("Error", "No se pudo cargar el panel", "error");
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("superadminToken")) {
      navigate("/superadmin/login");
      return;
    }
    cargarTodo();
  }, [cargarTodo, navigate]);

  const handleLogout = async () => {
    try {
      await logoutSuperAdminRequest();
    } catch (_) {}
    localStorage.removeItem("superadminToken");
    navigate("/superadmin/login");
  };

  const toggleActivo = async (empresa) => {
    const nuevoEstado = empresa.estado === "activo" ? "inactivo" : "activo";
    const confirmar = await Swal.fire({
      title: nuevoEstado === "inactivo" ? "¿Desactivar empresa?" : "¿Reactivar empresa?",
      text: empresa.nombre,
      icon: "warning",
      showCancelButton: true,
    });
    if (!confirmar.isConfirmed) return;

    try {
      await patchEstadoEmpresaRequest(empresa._id, nuevoEstado);
      cargarTodo();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "No se pudo actualizar", "error");
    }
  };

  const reactivarSuscripcion = async (empresa) => {
    try {
      await patchSuscripcionEmpresaRequest(empresa._id, "activo", "");
      cargarTodo();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "No se pudo reactivar", "error");
    }
  };

  if (cargando) {
    return (
      <div className="text-center py-5 text-muted">Cargando panel...</div>
    );
  }

  return (
    <Container className="mt-5" fluid style={{ maxWidth: 1200 }}>
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="mb-0">Panel de administración</h2>
          <p className="text-muted small mb-0">Gestión de todas tus empresas</p>
        </Col>
        <Col className="text-right">
          <Button color="secondary" outline size="sm" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </Col>
      </Row>

      {/* Resumen de ganancias */}
      {ganancias && (
        <Row className="mb-4">
          <Col md="3" className="mb-3">
            <Card className="shadow-sm h-100">
              <CardBody>
                <small className="text-muted text-uppercase">Ingreso mensual recurrente</small>
                <h3 className="mb-0 text-success">
                  {formatoPesos(ganancias.ingresoMensualRecurrente)}
                </h3>
                <small className="text-muted">si todas pagan al día</small>
              </CardBody>
            </Card>
          </Col>
          <Col md="3" className="mb-3">
            <Card className="shadow-sm h-100">
              <CardBody>
                <small className="text-muted text-uppercase">Recibido histórico</small>
                <h3 className="mb-0">{formatoPesos(ganancias.totalRecibidoHistorico)}</h3>
                <small className="text-muted">suma de pagos registrados</small>
              </CardBody>
            </Card>
          </Col>
          <Col md="3" className="mb-3">
            <Card className="shadow-sm h-100">
              <CardBody>
                <small className="text-muted text-uppercase">Empresas activas</small>
                <h3 className="mb-0">
                  {ganancias.empresasActivas} / {ganancias.empresasTotal}
                </h3>
              </CardBody>
            </Card>
          </Col>
          <Col md="3" className="mb-3">
            <Card className="shadow-sm h-100">
              <CardBody>
                <small className="text-muted text-uppercase">Suspendidas por pago</small>
                <h3 className="mb-0 text-warning">{ganancias.empresasSuspendidas}</h3>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      {ganancias?.historialMensual?.length > 0 && (
        <Card className="shadow-sm mb-4">
          <CardHeader>
            <h6 className="mb-0">Pagos recibidos por mes</h6>
          </CardHeader>
          <CardBody>
            <div className="d-flex flex-wrap" style={{ gap: 12 }}>
              {ganancias.historialMensual.map((m) => (
                <div key={m.mes} className="text-center px-3 py-2 border rounded">
                  <div className="small text-muted">{m.mes}</div>
                  <strong>{formatoPesos(m.total)}</strong>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Tabla de empresas */}
      <Card className="shadow-sm">
        <CardHeader>
          <h6 className="mb-0">Empresas ({empresas.length})</h6>
        </CardHeader>
        <CardBody className="p-0">
          <div style={{ overflowX: "auto" }}>
            <Table responsive className="mb-0">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Estado</th>
                  <th>Pago</th>
                  <th>Cuota</th>
                  <th>Último pago</th>
                  <th>Próximo pago</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {empresas.map((e) => (
                  <tr key={e._id}>
                    <td>
                      <strong>{e.nombre}</strong>
                      <br />
                      <small className="text-muted">/{e.slug}</small>
                    </td>
                    <td>
                      <BadgeEstado estado={e.estado} />
                    </td>
                    <td>
                      <BadgeSuscripcion estadoSuscripcion={e.estadoSuscripcion} />
                      {e.motivoSuspension && (
                        <div className="small text-muted mt-1">{e.motivoSuspension}</div>
                      )}
                    </td>
                    <td>{formatoPesos(e.cuotaMensual)}</td>
                    <td>{formatoFecha(e.ultimoPago)}</td>
                    <td>{formatoFecha(e.proximoPago)}</td>
                    <td className="text-right">
                      <div className="d-flex flex-wrap justify-content-end" style={{ gap: 6 }}>
                        <Button size="sm" outline color="primary" onClick={() => setModalCobro(e)}>
                          Cobro
                        </Button>
                        <Button size="sm" outline color="success" onClick={() => setModalPago(e)}>
                          Marcar pago
                        </Button>
                        {["suspendido", "cancelado"].includes(e.estadoSuscripcion) ? (
                          <Button
                            size="sm"
                            outline
                            color="success"
                            onClick={() => reactivarSuscripcion(e)}
                          >
                            Reactivar
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            outline
                            color="warning"
                            onClick={() => setModalSuspender(e)}
                          >
                            Suspender
                          </Button>
                        )}
                        <Button
                          size="sm"
                          outline
                          color={e.estado === "activo" ? "secondary" : "success"}
                          onClick={() => toggleActivo(e)}
                        >
                          {e.estado === "activo" ? "Desactivar" : "Reactivar"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {modalCobro && (
        <ModalCobro
          empresa={modalCobro}
          onClose={() => setModalCobro(null)}
          onGuardado={cargarTodo}
        />
      )}
      {modalPago && (
        <ModalPago
          empresa={modalPago}
          onClose={() => setModalPago(null)}
          onGuardado={cargarTodo}
        />
      )}
      {modalSuspender && (
        <ModalSuspender
          empresa={modalSuspender}
          onClose={() => setModalSuspender(null)}
          onGuardado={cargarTodo}
        />
      )}
    </Container>
  );
};

export default SuperAdminDashboard;

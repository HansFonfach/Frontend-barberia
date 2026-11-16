import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  FormGroup,
  Input,
  Label,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import {
  FiAlertTriangle,
  FiCalendar,
  FiCheckCircle,
  FiDollarSign,
  FiExternalLink,
  FiLogOut,
  FiMoreHorizontal,
  FiRefreshCw,
  FiSearch,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import Swal from "sweetalert2";
import {
  getEmpresasRequest,
  getGananciasRequest,
  patchEstadoEmpresaRequest,
  patchSuscripcionEmpresaRequest,
  patchCobroEmpresaRequest,
  postPagoEmpresaRequest,
  postRecordatorioVencimientoRequest,
  logoutSuperAdminRequest,
} from "api/superAdmin";

const formatoPesos = (valor) =>
  valor || valor === 0 ? `$${Number(valor).toLocaleString("es-CL")}` : "—";

const formatoFecha = (valor) =>
  valor
    ? new Date(valor).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })
    : "—";

const DIA = 24 * 60 * 60 * 1000;
const inicioDia = (d) => {
  const f = new Date(d);
  f.setHours(0, 0, 0, 0);
  return f;
};
/** Días que faltan para una fecha (negativo = ya pasó). */
const diasPara = (fecha) =>
  fecha ? Math.round((inicioDia(fecha) - inicioDia(new Date())) / DIA) : null;

const textoDias = (d) => {
  if (d === null) return "";
  if (d === 0) return "vence hoy";
  if (d === 1) return "vence mañana";
  if (d > 0) return `en ${d} días`;
  return d === -1 ? "venció ayer" : `venció hace ${-d} días`;
};

const ETIQUETA_RUBRO = {
  barberia: "Barbería",
  peluqueria: "Peluquería",
  salon_belleza: "Salón de belleza",
  "salon de belleza": "Salón de belleza",
  centro_estetica: "Estética",
  estetica: "Estética",
  spa: "Spa",
  masajes: "Masajes",
  gimnasio: "Gimnasio",
  restaurante: "Restaurante",
  tatuajes: "Tatuajes",
  dental: "Dental",
  nutricion: "Nutrición",
  kinesiologia: "Kinesiología",
  psicologia: "Psicología",
  medicina_general: "Consulta",
  consultorio: "Consulta",
};
const rubroDe = (e) => ETIQUETA_RUBRO[String(e.rubro || e.tipo || "").toLowerCase()] || "";

const iniciales = (nombre = "") =>
  nombre
    .replace(/[^\p{L}\s]/gu, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("") || "?";

/** Estado "de un vistazo" de cada negocio para la tabla y los filtros. */
const estadoNegocio = (e) => {
  if (e.estado !== "activo") return { clave: "inactiva", texto: "Inactiva", tono: "gris" };
  if (e.estadoSuscripcion === "cancelado") return { clave: "suspendida", texto: "Cancelada", tono: "rojo" };
  if (e.estadoSuscripcion === "suspendido") return { clave: "suspendida", texto: "Suspendida", tono: "ambar" };
  if (e.estadoSuscripcion === "trial") return { clave: "trial", texto: "Prueba", tono: "azul" };
  return { clave: "aldia", texto: "Al día", tono: "verde" };
};

/** Si hay que cobrarle pronto: vencido o dentro de los próximos 7 días. */
const alertaCobro = (e) => {
  if (e.estado !== "activo" || e.estadoSuscripcion === "cancelado") return null;
  const d = diasPara(e.proximoPago);
  if (d === null) return null;
  if (d < 0) return { tono: "rojo", dias: d };
  if (d <= 7) return { tono: "ambar", dias: d };
  return null;
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
  const [enviarCorreo, setEnviarCorreo] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    setGuardando(true);
    try {
      const res = await postPagoEmpresaRequest(empresa._id, {
        monto: monto === "" ? undefined : Number(monto),
        notas,
        enviarCorreo,
      });
      onGuardado();
      onClose();

      const correo = res.data?.correo;
      if (correo?.enviado) {
        Swal.fire("Pago registrado", `Se envió el correo de confirmación a ${correo.destino}`, "success");
      } else if (enviarCorreo) {
        Swal.fire(
          "Pago registrado",
          `El pago quedó guardado, pero no se envió el correo: ${correo?.motivo || "motivo desconocido"}.`,
          "warning",
        );
      } else {
        Swal.fire("Pago registrado", "Sin correo de confirmación.", "success");
      }
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
          <FormGroup check className="mb-3">
            <Label check className="small">
              <Input
                type="checkbox"
                checked={enviarCorreo}
                onChange={(e) => setEnviarCorreo(e.target.checked)}
              />{" "}
              Enviar correo de “pago acreditado”
              {empresa.correo ? ` a ${empresa.correo}` : " (este negocio no tiene correo registrado)"}
            </Label>
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
   Piezas del panel
===================================================== */
const Pastilla = ({ tono, children }) => <span className={`sa-pill sa-${tono}`}>{children}</span>;

const Avatar = ({ empresa }) =>
  empresa.logo ? (
    <img className="sa-avatar" src={empresa.logo} alt="" loading="lazy" />
  ) : (
    <span className="sa-avatar sa-avatar-ini">{iniciales(empresa.nombre)}</span>
  );

const Kpi = ({ icono, tono, titulo, valor, detalle }) => (
  <div className="sa-kpi">
    <div className={`sa-kpi-ico sa-${tono}`}>{icono}</div>
    <div className="sa-kpi-txt">
      <span>{titulo}</span>
      <strong>{valor}</strong>
      {detalle && <small>{detalle}</small>}
    </div>
  </div>
);

/** Barras simples con los pagos recibidos por mes (últimos 12). */
const GraficoMeses = ({ meses }) => {
  const max = Math.max(...meses.map((m) => m.total), 1);
  const etiqueta = (mes) => {
    const [a, m] = mes.split("-").map(Number);
    return new Date(a, m - 1, 1).toLocaleDateString("es-CL", { month: "short" }).replace(".", "");
  };
  return (
    <div className="sa-barras" role="img" aria-label="Pagos recibidos por mes">
      {meses.map((m, i) => (
        <div key={m.mes} className="sa-barra-col" title={`${m.mes}: ${formatoPesos(m.total)}`}>
          <span className="sa-barra-valor">{m.total >= 1000 ? `$${Math.round(m.total / 1000)}k` : formatoPesos(m.total)}</span>
          <div className="sa-barra-pista">
            <div
              className={`sa-barra ${i === meses.length - 1 ? "actual" : ""}`}
              style={{ height: `${Math.max((m.total / max) * 100, 3)}%` }}
            />
          </div>
          <span className="sa-barra-mes">{etiqueta(m.mes)}</span>
        </div>
      ))}
    </div>
  );
};

const FILTROS = [
  { clave: "todas", texto: "Todas" },
  { clave: "aldia", texto: "Al día" },
  { clave: "trial", texto: "Prueba" },
  { clave: "porcobrar", texto: "Por cobrar" },
  { clave: "suspendida", texto: "Suspendidas" },
  { clave: "inactiva", texto: "Inactivas" },
];

/* =====================================================
   PANEL PRINCIPAL
===================================================== */
const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState([]);
  const [ganancias, setGanancias] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [modalCobro, setModalCobro] = useState(null);
  const [modalPago, setModalPago] = useState(null);
  const [modalSuspender, setModalSuspender] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todas");

  const cargarTodo = useCallback(async () => {
    setActualizando(true);
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
      setActualizando(false);
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

  const enviarAvisoVencimiento = async (empresa) => {
    if (!empresa.correo) {
      Swal.fire(
        "Sin correo",
        `${empresa.nombre} no tiene un correo registrado, no hay a dónde enviar el aviso.`,
        "warning",
      );
      return;
    }

    const confirmar = await Swal.fire({
      title: "¿Enviar aviso de vencimiento?",
      html: `Se enviará el correo <b>“Tu plan vence hoy”</b> a<br/><b>${empresa.correo}</b>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Enviar aviso",
      cancelButtonText: "Cancelar",
    });
    if (!confirmar.isConfirmed) return;

    try {
      const res = await postRecordatorioVencimientoRequest(empresa._id);
      Swal.fire("Aviso enviado", res.data?.message || "Correo enviado", "success");
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "No se pudo enviar el aviso", "error");
    }
  };

  // ───── Datos derivados ─────
  const porCobrar = useMemo(
    () =>
      empresas
        .map((e) => ({ e, alerta: alertaCobro(e) }))
        .filter((x) => x.alerta)
        .sort((a, b) => a.alerta.dias - b.alerta.dias),
    [empresas],
  );

  const conteos = useMemo(() => {
    const c = { todas: empresas.length, porcobrar: porCobrar.length };
    empresas.forEach((e) => {
      const k = estadoNegocio(e).clave;
      c[k] = (c[k] || 0) + 1;
    });
    return c;
  }, [empresas, porCobrar]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return empresas.filter((e) => {
      if (filtro === "porcobrar" && !alertaCobro(e)) return false;
      if (!["todas", "porcobrar"].includes(filtro) && estadoNegocio(e).clave !== filtro) return false;
      if (!q) return true;
      return [e.nombre, e.slug, e.correo, e.ciudad, rubroDe(e)].some((v) => String(v || "").toLowerCase().includes(q));
    });
  }, [empresas, filtro, busqueda]);

  const meses = ganancias?.historialMensual || [];
  const mesActual = meses.length ? meses[meses.length - 1] : null;
  const hoyTexto = new Date().toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" });

  const acciones = (e) => (
    <div className="sa-acciones">
      <button type="button" className="sa-btn sa-btn-ok" onClick={() => setModalPago(e)}>
        <FiCheckCircle /> Marcar pago
      </button>
      <UncontrolledDropdown>
        <DropdownToggle tag="button" type="button" className="sa-btn sa-btn-icono" aria-label={`Más acciones para ${e.nombre}`}>
          <FiMoreHorizontal />
        </DropdownToggle>
        <DropdownMenu right className="sa-menu">
          <DropdownItem onClick={() => setModalCobro(e)}>Editar cobro</DropdownItem>
          <DropdownItem onClick={() => enviarAvisoVencimiento(e)}>Avisar que vence hoy</DropdownItem>
          <DropdownItem tag="a" href={`/${e.slug}`} target="_blank" rel="noreferrer">
            Ver página pública <FiExternalLink size={12} />
          </DropdownItem>
          <DropdownItem divider />
          {["suspendido", "cancelado"].includes(e.estadoSuscripcion) ? (
            <DropdownItem className="text-success" onClick={() => reactivarSuscripcion(e)}>
              Reactivar plan
            </DropdownItem>
          ) : (
            <DropdownItem className="sa-menu-ambar" onClick={() => setModalSuspender(e)}>
              Suspender por no pago
            </DropdownItem>
          )}
          <DropdownItem className={e.estado === "activo" ? "text-danger" : "text-success"} onClick={() => toggleActivo(e)}>
            {e.estado === "activo" ? "Desactivar negocio" : "Activar negocio"}
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    </div>
  );

  const proximoPago = (e) => {
    const alerta = alertaCobro(e);
    return (
      <div className="sa-fecha">
        <span>{formatoFecha(e.proximoPago)}</span>
        {alerta && <small className={`sa-txt-${alerta.tono}`}>{textoDias(alerta.dias)}</small>}
      </div>
    );
  };

  if (cargando) {
    return (
      <div className="sa">
        <style>{CSS}</style>
        <div className="sa-cargando">
          <div className="spinner-border text-primary" role="status" />
          <span>Cargando panel…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="sa">
      <style>{CSS}</style>

      {/* ───── Barra superior ───── */}
      <header className="sa-top">
        <div className="sa-wrap sa-top-in">
          <div className="sa-marca">
            <FiCalendar className="sa-marca-ico" />
            <span>
              Agenda<b>Fonfach</b>
            </span>
            <span className="sa-marca-tag">Superadmin</span>
          </div>
          <div className="sa-top-acc">
            <button type="button" className="sa-btn sa-btn-suave" onClick={cargarTodo} disabled={actualizando}>
              <FiRefreshCw className={actualizando ? "sa-girando" : ""} /> <span className="sa-solo-pc">Actualizar</span>
            </button>
            <button type="button" className="sa-btn sa-btn-suave" onClick={handleLogout}>
              <FiLogOut /> <span className="sa-solo-pc">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main className="sa-wrap sa-main">
        <div className="sa-titulo">
          <div>
            <h1>Resumen del negocio</h1>
            <p>{hoyTexto.charAt(0).toUpperCase() + hoyTexto.slice(1)}</p>
          </div>
        </div>

        {/* ───── Indicadores ───── */}
        {ganancias && (
          <section className="sa-kpis">
            <Kpi
              icono={<FiTrendingUp />}
              tono="verde"
              titulo="Ingreso mensual recurrente"
              valor={formatoPesos(ganancias.ingresoMensualRecurrente)}
              detalle="si todas pagan al día"
            />
            <Kpi
              icono={<FiDollarSign />}
              tono="azul"
              titulo={mesActual ? "Recibido este mes" : "Recibido histórico"}
              valor={formatoPesos(mesActual ? mesActual.total : ganancias.totalRecibidoHistorico)}
              detalle={`${formatoPesos(ganancias.totalRecibidoHistorico)} en total`}
            />
            <Kpi
              icono={<FiUsers />}
              tono="morado"
              titulo="Negocios activos"
              valor={`${ganancias.empresasActivas} de ${ganancias.empresasTotal}`}
              detalle={conteos.trial ? `${conteos.trial} en prueba` : "registrados en la plataforma"}
            />
            <Kpi
              icono={<FiAlertTriangle />}
              tono={porCobrar.length || ganancias.empresasSuspendidas ? "ambar" : "verde"}
              titulo="Por cobrar (7 días)"
              valor={porCobrar.length}
              detalle={`${ganancias.empresasSuspendidas} suspendida${ganancias.empresasSuspendidas === 1 ? "" : "s"} por pago`}
            />
          </section>
        )}

        <section className="sa-grilla">
          {/* ───── Gráfico ───── */}
          <div className="sa-card">
            <div className="sa-card-tit">
              <h2>Pagos recibidos por mes</h2>
              <span>últimos {meses.length || 0} meses</span>
            </div>
            {meses.length ? (
              <GraficoMeses meses={meses} />
            ) : (
              <p className="sa-vacio">Todavía no hay pagos registrados.</p>
            )}
          </div>

          {/* ───── Próximos cobros ───── */}
          <div className="sa-card">
            <div className="sa-card-tit">
              <h2>Próximos cobros</h2>
              <span>{porCobrar.length ? `${porCobrar.length} pendiente${porCobrar.length === 1 ? "" : "s"}` : "todo al día"}</span>
            </div>
            {porCobrar.length === 0 ? (
              <div className="sa-vacio sa-vacio-ok">
                <FiCheckCircle size={28} />
                <span>Ningún negocio vence en los próximos 7 días.</span>
              </div>
            ) : (
              <ul className="sa-cobros">
                {porCobrar.slice(0, 6).map(({ e, alerta }) => (
                  <li key={e._id}>
                    <Avatar empresa={e} />
                    <div className="sa-cobro-txt">
                      <b>{e.nombre}</b>
                      <small className={`sa-txt-${alerta.tono}`}>
                        {textoDias(alerta.dias)} · {formatoPesos(e.cuotaMensual)}
                      </small>
                    </div>
                    <button type="button" className="sa-btn sa-btn-ok sa-btn-chico" onClick={() => setModalPago(e)}>
                      Cobrado
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* ───── Negocios ───── */}
        <section className="sa-card sa-card-tabla">
          <div className="sa-tabla-cab">
            <div className="sa-card-tit" style={{ marginBottom: 0 }}>
              <h2>Negocios</h2>
              <span>{visibles.length} de {empresas.length}</span>
            </div>
            <label className="sa-buscar">
              <FiSearch />
              <input
                type="search"
                placeholder="Buscar por nombre, slug, correo…"
                value={busqueda}
                onChange={(ev) => setBusqueda(ev.target.value)}
              />
            </label>
          </div>

          <div className="sa-filtros" role="tablist" aria-label="Filtrar negocios">
            {FILTROS.map((f) => (
              <button
                key={f.clave}
                type="button"
                role="tab"
                aria-selected={filtro === f.clave}
                className={filtro === f.clave ? "activo" : ""}
                onClick={() => setFiltro(f.clave)}
              >
                {f.texto}
                <span>{conteos[f.clave] || 0}</span>
              </button>
            ))}
          </div>

          {visibles.length === 0 ? (
            <p className="sa-vacio">No hay negocios con ese filtro.</p>
          ) : (
            <>
              {/* Escritorio: tabla */}
              <div className="sa-tabla-wrap">
                <table className="sa-tabla">
                  <thead>
                    <tr>
                      <th>Negocio</th>
                      <th>Estado</th>
                      <th className="sa-der">Cuota</th>
                      <th>Último pago</th>
                      <th>Próximo pago</th>
                      <th className="sa-der">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibles.map((e) => {
                      const est = estadoNegocio(e);
                      return (
                        <tr key={e._id}>
                          <td>
                            <div className="sa-negocio">
                              <Avatar empresa={e} />
                              <div>
                                <b>{e.nombre}</b>
                                <small>
                                  /{e.slug}
                                  {(rubroDe(e) || e.ciudad) && ` · ${[rubroDe(e), e.ciudad].filter(Boolean).join(" · ")}`}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <Pastilla tono={est.tono}>{est.texto}</Pastilla>
                            {e.motivoSuspension && <small className="sa-motivo">{e.motivoSuspension}</small>}
                          </td>
                          <td className="sa-der sa-num">{formatoPesos(e.cuotaMensual)}</td>
                          <td className="sa-gris">{formatoFecha(e.ultimoPago)}</td>
                          <td>{proximoPago(e)}</td>
                          <td className="sa-der">{acciones(e)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Celular: tarjetas */}
              <div className="sa-lista-movil">
                {visibles.map((e) => {
                  const est = estadoNegocio(e);
                  return (
                    <div key={e._id} className="sa-item">
                      <div className="sa-negocio">
                        <Avatar empresa={e} />
                        <div>
                          <b>{e.nombre}</b>
                          <small>/{e.slug}</small>
                        </div>
                        <Pastilla tono={est.tono}>{est.texto}</Pastilla>
                      </div>
                      <div className="sa-item-datos">
                        <div>
                          <span>Cuota</span>
                          <b>{formatoPesos(e.cuotaMensual)}</b>
                        </div>
                        <div>
                          <span>Último pago</span>
                          <b>{formatoFecha(e.ultimoPago)}</b>
                        </div>
                        <div>
                          <span>Próximo pago</span>
                          {proximoPago(e)}
                        </div>
                      </div>
                      {acciones(e)}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </main>

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
    </div>
  );
};

const CSS = `
.sa{--sa-bg:#f4f6fb;--sa-card:#fff;--sa-txt:#0f172a;--sa-mut:#64748b;--sa-borde:#e6e9f2;--sa-azul:#4361ee;
  min-height:100vh;background:var(--sa-bg);color:var(--sa-txt);font-family:Inter,"Open Sans",system-ui,-apple-system,sans-serif;font-size:14px}
.sa *{box-sizing:border-box}
.sa-wrap{max-width:1240px;margin:0 auto;padding:0 24px}
.sa-cargando{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;color:var(--sa-mut)}

.sa-top{position:sticky;top:0;z-index:30;background:#0f172a;color:#fff}
.sa-top-in{display:flex;align-items:center;justify-content:space-between;height:62px;gap:12px}
.sa-marca{display:flex;align-items:center;gap:10px;font-size:18px;font-weight:600;letter-spacing:-.01em}
.sa-marca b{color:#8ea2ff;font-weight:700}
.sa-marca-ico{color:#f72585;font-size:20px}
.sa-marca-tag{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.12em;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.14);padding:4px 9px;border-radius:999px;color:#cbd5e1}
.sa-top-acc{display:flex;gap:8px}
.sa-top .sa-btn-suave{background:rgba(255,255,255,.08);color:#e2e8f0;border-color:rgba(255,255,255,.12)}
.sa-top .sa-btn-suave:hover{background:rgba(255,255,255,.16)}

.sa-main{padding-top:30px;padding-bottom:60px}
.sa-titulo{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:22px}
.sa-titulo h1{font-size:26px;font-weight:700;margin:0;letter-spacing:-.02em;color:var(--sa-txt)}
.sa-titulo p{margin:4px 0 0;color:var(--sa-mut)}

.sa-btn{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--sa-borde);background:#fff;color:var(--sa-txt);border-radius:10px;padding:8px 13px;font-size:13px;font-weight:600;cursor:pointer;line-height:1.2;white-space:nowrap;transition:background .15s,border-color .15s,color .15s}
.sa-btn:hover{border-color:#cdd3e1;background:#f8fafc}
.sa-btn:disabled{opacity:.6;cursor:default}
.sa-btn-ok{background:#ecfdf5;border-color:#bbf7d0;color:#047857}
.sa-btn-ok:hover{background:#d1fae5;border-color:#86efac}
.sa-btn-icono{padding:8px 10px}
.sa-btn-chico{padding:6px 11px;font-size:12px}
.sa-girando{animation:sa-giro 1s linear infinite}
@keyframes sa-giro{to{transform:rotate(360deg)}}

.sa-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:18px}
.sa-kpi{background:var(--sa-card);border:1px solid var(--sa-borde);border-radius:16px;padding:18px;display:flex;gap:14px;align-items:flex-start;box-shadow:0 1px 2px rgba(15,23,42,.04)}
.sa-kpi-ico{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;font-size:19px;flex-shrink:0}
.sa-kpi-txt{display:flex;flex-direction:column;min-width:0}
.sa-kpi-txt span{color:var(--sa-mut);font-size:12.5px;font-weight:500}
.sa-kpi-txt strong{font-size:24px;font-weight:700;letter-spacing:-.02em;margin:3px 0 2px;color:var(--sa-txt)}
.sa-kpi-txt small{color:var(--sa-mut);font-size:12px}

.sa-verde{background:#ecfdf5;color:#047857}
.sa-azul{background:#eef2ff;color:#3346d3}
.sa-morado{background:#f5f0ff;color:#7c3aed}
.sa-ambar{background:#fffbeb;color:#b45309}
.sa-rojo{background:#fef2f2;color:#b91c1c}
.sa-gris{color:var(--sa-mut)}
.sa-pill.sa-gris{background:#f1f5f9;color:#475569}
.sa-txt-rojo{color:#dc2626!important;font-weight:600}
.sa-txt-ambar{color:#b45309!important;font-weight:600}

.sa-grilla{display:grid;grid-template-columns:1.5fr 1fr;gap:16px;margin-bottom:18px}
.sa-card{background:var(--sa-card);border:1px solid var(--sa-borde);border-radius:16px;padding:20px;box-shadow:0 1px 2px rgba(15,23,42,.04);min-width:0}
.sa-card-tit{display:flex;justify-content:space-between;align-items:baseline;gap:10px;margin-bottom:16px}
.sa-card-tit h2{font-size:15px;font-weight:700;margin:0;color:var(--sa-txt)}
.sa-card-tit span{color:var(--sa-mut);font-size:12.5px}
.sa-vacio{color:var(--sa-mut);margin:10px 0;text-align:center;padding:18px 0}
.sa-vacio-ok{display:flex;flex-direction:column;align-items:center;gap:8px;color:#047857}

.sa-barras{display:flex;align-items:stretch;gap:8px;height:210px}
.sa-barra-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;min-width:0}
.sa-barra-valor{font-size:11px;color:var(--sa-mut);white-space:nowrap}
.sa-barra-pista{flex:1;width:100%;max-width:44px;display:flex;align-items:flex-end;background:#f5f7fc;border-radius:8px}
.sa-barra{width:100%;background:#c7d0fb;border-radius:8px;transition:height .4s ease}
.sa-barra.actual{background:var(--sa-azul)}
.sa-barra-mes{font-size:11.5px;color:var(--sa-mut);text-transform:capitalize}

.sa-cobros{list-style:none;margin:0;padding:0}
.sa-cobros li{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--sa-borde)}
.sa-cobros li:last-child{border-bottom:0}
.sa-cobro-txt{flex:1;min-width:0;display:flex;flex-direction:column}
.sa-cobro-txt b{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sa-cobro-txt small{font-size:12px}

.sa-avatar{width:38px;height:38px;border-radius:11px;object-fit:cover;flex-shrink:0;border:1px solid var(--sa-borde);background:#fff}
.sa-avatar-ini{display:grid;place-items:center;background:linear-gradient(135deg,#eef2ff,#fdf2f8);color:#4338ca;font-weight:700;font-size:13px}

.sa-card-tabla{padding:0;overflow:hidden}
.sa-tabla-cab{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:20px 20px 0;flex-wrap:wrap}
.sa-buscar{display:flex;align-items:center;gap:8px;border:1px solid var(--sa-borde);border-radius:10px;padding:0 12px;background:#f8fafc;min-width:280px;margin:0;color:var(--sa-mut)}
.sa-buscar input{border:0;background:transparent;outline:0;height:38px;width:100%;font-size:13.5px;color:var(--sa-txt)}
.sa-buscar:focus-within{border-color:var(--sa-azul);background:#fff;box-shadow:0 0 0 3px rgba(67,97,238,.12)}
.sa-filtros{display:flex;gap:6px;flex-wrap:wrap;padding:14px 20px;border-bottom:1px solid var(--sa-borde)}
.sa-filtros button{flex-shrink:0;white-space:nowrap;display:inline-flex;align-items:center;gap:7px;border:1px solid var(--sa-borde);background:#fff;color:#334155;border-radius:999px;padding:6px 12px;font-size:12.5px;font-weight:600;cursor:pointer}
.sa-filtros button span{background:#f1f5f9;color:var(--sa-mut);border-radius:999px;padding:1px 7px;font-size:11px}
.sa-filtros button.activo{background:#0f172a;border-color:#0f172a;color:#fff}
.sa-filtros button.activo span{background:rgba(255,255,255,.18);color:#fff}

.sa-tabla-wrap{overflow-x:auto}
.sa-tabla{width:100%;border-collapse:collapse}
.sa-tabla th{font-size:11.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--sa-mut);font-weight:600;padding:12px 20px;background:#f8fafc;border-bottom:1px solid var(--sa-borde);text-align:left;white-space:nowrap}
.sa-tabla td{padding:14px 20px;border-bottom:1px solid var(--sa-borde);vertical-align:middle}
.sa-tabla tbody tr:last-child td{border-bottom:0}
.sa-tabla tbody tr:hover td{background:#fafbff}
.sa-der{text-align:right!important}
.sa-num{font-variant-numeric:tabular-nums;font-weight:600}
.sa-negocio{display:flex;align-items:center;gap:12px;min-width:0}
.sa-negocio > div{display:flex;flex-direction:column;min-width:0}
.sa-negocio b{font-weight:600;color:var(--sa-txt)}
.sa-negocio small{color:var(--sa-mut);font-size:12px}
.sa-pill{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;border-radius:999px;padding:4px 10px;white-space:nowrap}
.sa-pill::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor}
.sa-motivo{display:block;color:var(--sa-mut);font-size:11.5px;margin-top:4px;max-width:180px}
.sa-fecha{display:flex;flex-direction:column}
.sa-fecha small{font-size:11.5px}
.sa-acciones{display:inline-flex;align-items:center;gap:6px;justify-content:flex-end}
.sa-menu{border:1px solid var(--sa-borde);border-radius:12px;box-shadow:0 18px 40px -12px rgba(15,23,42,.25);padding:6px;min-width:220px}
.sa-menu .dropdown-item{border-radius:8px;font-size:13px;padding:8px 12px;display:flex;align-items:center;gap:6px}
.sa-lista-movil{display:none}
.sa-menu .sa-menu-ambar{color:#b45309}
.sa-solo-pc{display:inline}

@media (max-width:1024px){
  .sa-kpis{grid-template-columns:repeat(2,1fr)}
  .sa-grilla{grid-template-columns:1fr}
}
@media (max-width:760px){
  .sa-wrap{padding:0 16px}
  .sa-main{padding-top:22px}
  .sa-titulo h1{font-size:22px}
  .sa-kpis{gap:10px}
  .sa-kpi{padding:14px;flex-direction:column;gap:10px}
  .sa-kpi-txt strong{font-size:20px}
  .sa-solo-pc{display:none}
  .sa-marca-tag{display:none}
  .sa-buscar{min-width:0;width:100%}
  .sa-tabla-cab{padding:16px 16px 0}
  .sa-filtros{padding:12px 16px;flex-wrap:nowrap;overflow-x:auto}
  .sa-tabla-wrap{display:none}
  .sa-lista-movil{display:block}
  .sa-item{padding:16px;border-bottom:1px solid var(--sa-borde)}
  .sa-item:last-child{border-bottom:0}
  .sa-item .sa-negocio > div{flex:1}
  .sa-item-datos{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}
  .sa-item-datos span{display:block;color:var(--sa-mut);font-size:11px;margin-bottom:2px}
  .sa-item-datos b,.sa-item-datos .sa-fecha span{font-size:13px;font-weight:600;color:var(--sa-txt)}
  .sa-item .sa-acciones{width:100%}
  .sa-item .sa-acciones .sa-btn-ok{flex:1;justify-content:center}
  .sa-barras{gap:4px;height:180px}
  .sa-barra-valor{display:none}
}
`;

export default SuperAdminDashboard;

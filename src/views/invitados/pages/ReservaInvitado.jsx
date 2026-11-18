import React, { useState, useMemo, useEffect, useContext } from "react";
import {
  Container,
  Card,
  CardBody,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Input,
  Row,
  Col,
} from "reactstrap";
import { Info } from "lucide-react";
import { FaPhone } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";

import StepIndicator from "components/reserva/StepIndicator";
import ServicioSelector from "components/reserva/ServicioSelector";
import BarberoSelector from "components/reserva/BarberoSelector";
import WeekSelector from "components/reserva/WeekSelector";
import HorasDisponibles from "components/reserva/HorasDisponibles";
import ResumenReserva from "components/reserva/ResumenReserva";

import { useReservaInvitado } from "hooks/useReservaInvitado";
import AuthFooter from "components/Footers/AuthFooter";
import logo from "assets/img/logo4.png";
import { useRutValidator } from "hooks/useRutValidador";
import { EmpresaContext, useEmpresa } from "context/EmpresaContext";
import { esEstiloBarberia, PALETA_BARBERIA } from "components/landing/LandingNegocio";
import { getUsuarioByRutPublico } from "api/usuarios";
import { getPlanesPublicos } from "api/planesSuscripcion";
import { mejorPlanParaServicio } from "utils/planesSuscripcion";

import { calcularPrecioFinal } from "utils/preciosServicios.js";
import {
  construirTema,
  obtenerTemaEmpresa,
  TEMAS_LEGACY_POR_SLUG,
  TEMA_DEFAULT,
} from "utils/temaEmpresa";

// Esta página siempre mostraba el hero con texto blanco cuando no había un
// tema hecho a mano (fondo oscuro fijo) — se mantiene igual como respaldo
// para no cambiarle nada a los negocios que aún no configuran sus colores.
const TEMA_DEFAULT_RESERVA = {
  ...TEMA_DEFAULT,
  textDark: "#ffffff",
  textMuted: "rgba(255,255,255,0.9)",
};

const CSS_RESERVA_BARBERIA = `
/* Reserva sin cuenta con estilo "barbería clásica": todo en negro, dorado y café */
.ri-barberia{background:#0b0b0c;color:#f3ede2}
.ri-barberia .text-muted,.ri-barberia small{color:#a9a196!important}
.ri-barberia .card{background:#141416!important;border:1px solid rgba(201,162,75,.18)!important;color:#f3ede2}
.ri-barberia .card-body,.ri-barberia h1,.ri-barberia h2,.ri-barberia h3,.ri-barberia h4,.ri-barberia h5,.ri-barberia h6,.ri-barberia label,.ri-barberia strong,.ri-barberia b,.ri-barberia .text-dark,.ri-barberia p{color:#f3ede2}
.ri-barberia .bg-white,.ri-barberia .bg-light,.ri-barberia .bg-secondary,.ri-barberia .list-group-item{background:#1b1b1e!important;color:#f3ede2}
.ri-barberia .progress{background:#232326}
.ri-barberia [style*="background-color: rgb(255, 255, 255)"],.ri-barberia [style*="background: rgb(255, 255, 255)"],.ri-barberia [style*="background-color: white"],.ri-barberia [style*="background-color: rgb(247, 250, 252)"],.ri-barberia [style*="background-color: rgb(248, 249, 250)"]{background-color:#1b1b1e!important}
.ri-barberia [style*="background-color: rgb(201, 162, 75)"]{color:#1a140a!important}
.ri-barberia [style*="color: rgb(33, 37, 41)"],.ri-barberia [style*="color: rgb(51, 51, 51)"],.ri-barberia [style*="color: rgb(45, 55, 72)"]{color:#f3ede2!important}
.ri-barberia .form-control,.ri-barberia input{background:#1b1b1e!important;color:#f3ede2!important;border-color:rgba(243,237,226,.16)!important}
.ri-barberia .form-control::placeholder{color:#8d867b}
.ri-barberia hr,.ri-barberia .border-top,.ri-barberia .border-bottom,.ri-barberia td,.ri-barberia th{border-color:rgba(243,237,226,.1)!important}
.ri-barberia .btn-outline-primary{color:#c9a24b;border-color:rgba(201,162,75,.6);background:transparent}
.ri-barberia .btn-outline-primary:hover{background:#c9a24b;color:#1a140a}
.ri-barberia .badge-info{background:rgba(201,162,75,.18);color:#e2c27a}
.ri-barberia .alert-success{background:rgba(201,162,75,.12);color:#e2c27a;border-color:rgba(201,162,75,.3)}
.ri-barberia-modal .modal-content{background:#141416;color:#f3ede2;border:1px solid rgba(201,162,75,.25)}
.ri-barberia-modal .modal-header{border-color:rgba(243,237,226,.1)}
.ri-barberia-modal .modal-title,.ri-barberia-modal .close{color:#f3ede2}
.ri-barberia-modal .form-control{background:#1b1b1e;color:#f3ede2;border-color:rgba(243,237,226,.16)}
.ri-barberia-modal .form-control::placeholder{color:#8d867b}
.ri-barberia-modal input,.ri-barberia-modal .input-group-text,.ri-barberia-modal [style*="background-color: rgb(255, 255, 255)"],.ri-barberia-modal [style*="background: rgb(255, 255, 255)"],.ri-barberia-modal [style*="background-color: white"],.ri-barberia-modal [style*="background-color: rgb(248, 249, 250)"],.ri-barberia-modal [style*="background-color: rgb(247, 250, 252)"]{background-color:#1b1b1e!important;color:#f3ede2!important;border-color:rgba(243,237,226,.16)!important}
.ri-barberia-modal input::placeholder{color:#8d867b}
.ri-barberia-modal .text-dark,.ri-barberia-modal [style*="color: rgb(33, 37, 41)"]{color:#f3ede2!important}
.ri-barberia .text-primary,.ri-barberia-modal .text-primary{color:#c9a24b!important}
`;

const ReservarHoraInvitado = () => {
  const { slug } = useParams();
  const { empresa } = useEmpresa();

  // Usa los colores que el negocio haya configurado en
  // "Configuración → Colores" (empresa.colores). Si todavía no configuró
  // nada, cae al tema hecho a mano que tenía antes (o al default general).
  // Estilo "barbería clásica" (ej. La Santa): los mismos colores de su
  // página pública. Solo en esta reserva como invitado; con sesión iniciada
  // todo sigue igual.
  const barberia = esEstiloBarberia(empresa, slug);
  const contextoEmpresa = useContext(EmpresaContext);
  const coloresBarberia = useMemo(
    () => ({
      primario: PALETA_BARBERIA.oro,
      primarioLight: "rgba(201,162,75,.14)",
      primarioDark: PALETA_BARBERIA.oroOscuro,
      heroBg: `radial-gradient(760px 380px at 85% 10%, rgba(201,162,75,.20), transparent 70%), radial-gradient(560px 340px at 6% 100%, rgba(122,80,42,.26), transparent 70%), repeating-linear-gradient(135deg, rgba(255,255,255,.022) 0 2px, transparent 2px 14px), ${PALETA_BARBERIA.negro}`,
      heroEsClaro: false,
    }),
    [],
  );
  // Los selectores de servicio, día y hora toman los colores de la empresa
  // del contexto: aquí se les pasan los de barbería sin tocar los datos.
  const valorContexto = useMemo(
    () =>
      barberia && contextoEmpresa
        ? { ...contextoEmpresa, empresa: { ...empresa, colores: { ...(empresa?.colores || {}), ...coloresBarberia } } }
        : contextoEmpresa,
    [barberia, contextoEmpresa, empresa, coloresBarberia],
  );

  const theme = barberia
    ? construirTema(coloresBarberia, TEMA_DEFAULT_RESERVA)
    : obtenerTemaEmpresa(empresa, slug, {
        temasLegacyPorSlug: TEMAS_LEGACY_POR_SLUG,
        temaDeFabrica: TEMA_DEFAULT_RESERVA,
      });
  const isLightTheme = theme.variant === "light";

  const {
    servicios,
    barberosFiltrados,
    servicio,
    barbero,
    fecha,
    hora,
    weekStart,
    weekDays,
    loadingWeek,
    horasDisponibles,
    cargandoHoras,
    mensajeHoras,
    horasDataCompleta,
    duracionServicio,
    invitado,
    setInvitado,
    loadingServicios,
    loadingBarberos,
    reservando,
    pasoActual,
    handleSeleccionarServicio,
    handleSeleccionarBarbero,
    handleSelectDay,
    prevWeek,
    nextWeek,
    setHora,
    reservarComoInvitado,
    codigoDescuento,
  } = useReservaInvitado(slug);

  const {
    rut: rutInvitado,
    handleRutChange,
    error: rutError,
  } = useRutValidator();

  const [modalInvitado, setModalInvitado] = useState(false);
  const toggleModalInvitado = () => setModalInvitado(!modalInvitado);
  const [buscandoUsuario, setBuscandoUsuario] = useState(false);
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(false);
  const [usuarioData, setUsuarioData] = useState(null);

  useEffect(() => {
    setInvitado((prev) => ({ ...prev, rut: rutInvitado }));
    setUsuarioEncontrado(false);
    setUsuarioData(null);

    if (!rutError && rutInvitado.length >= 8) {
      const buscar = async () => {
        setBuscandoUsuario(true);
        try {
          const usuario = await getUsuarioByRutPublico(slug, rutInvitado);
          if (usuario) {
            setUsuarioData(usuario);
            setInvitado({
              rut: rutInvitado,
              nombre: usuario.nombre || "",
              apellido: usuario.apellido || "",
              telefono: "",
              email: "",
            });
            setUsuarioEncontrado(true);
          }
        } catch (err) {
        } finally {
          setBuscandoUsuario(false);
        }
      };
      buscar();
    }
  }, [rutInvitado, rutError]); // 👈 NO incluyas setInvitado aquí

  const invitadoValido =
    invitado.nombre &&
    invitado.apellido &&
    rutInvitado &&
    !rutError &&
    invitado.telefono?.length === 8 &&
    invitado.email;

  const servicioSeleccionado = useMemo(() => {
    if (!servicio) return null;
    return servicios.find((s) => String(s._id) === String(servicio)) || null;
  }, [servicio, servicios]);

  // "Ahorra suscribiéndote": si algún plan del negocio incluye el servicio
  // elegido y sale más barato por servicio, se muestra el aviso.
  const [planes, setPlanes] = useState([]);
  useEffect(() => {
    let vigente = true;
    getPlanesPublicos(slug)
      .then((r) => vigente && setPlanes(Array.isArray(r?.data?.planes) ? r.data.planes : []))
      .catch(() => vigente && setPlanes([]));
    return () => {
      vigente = false;
    };
  }, [slug]);
  const sugerenciaPlan = useMemo(
    () =>
      servicioSeleccionado
        ? mejorPlanParaServicio(planes, servicioSeleccionado._id, servicioSeleccionado.precio)
        : null,
    [planes, servicioSeleccionado],
  );

  const barberoSeleccionado = useMemo(() => {
    // 👈 esto falta, agregalo
    if (!barbero) return null;
    return barberosFiltrados.find((b) => b._id === barbero) || null;
  }, [barbero, barberosFiltrados]);

  const precioFinalCalculado = useMemo(() => {
    if (!servicioSeleccionado) return null;

    // El precio real (con feriado/hora extra especial si corresponde) ya
    // viene calculado desde el backend para cada hora — es el mismo
    // cálculo que se usa al confirmar la reserva. Se prioriza ese valor.
    if (hora) {
      const horaSeleccionada = horasDisponibles?.find((h) => h.hora === hora);
      if (horaSeleccionada?.precio != null) return horaSeleccionada.precio;
    } else if (horasDisponibles?.length) {
      // Todavía no eligió hora: si TODAS las horas de ese día tienen el
      // mismo precio (el caso típico — precio especial de feriado que
      // rige el día completo), se puede mostrar de una vez. Si varían
      // (ej. una sola hora extra con precio distinto al resto del día),
      // se espera a que elija la hora exacta en vez de adivinar.
      const precios = new Set(
        horasDisponibles.filter((h) => h.precio != null).map((h) => h.precio),
      );
      if (precios.size === 1) return [...precios][0];
    }

    // Respaldo: cálculo local (solo descuentos por fecha del catálogo),
    // para cuando todavía no hay horas cargadas para ese día.
    return calcularPrecioFinal(servicioSeleccionado, fecha);
  }, [servicioSeleccionado, fecha, hora, horasDisponibles]);

  const progresoPasos = useMemo(() => {
    let pasos = 0;
    if (servicio) pasos++;
    if (barbero) pasos++;
    if (fecha) pasos++;
    if (hora) pasos++;
    return (pasos / 4) * 100;
  }, [servicio, barbero, fecha, hora]);

  if (loadingServicios) {
    return (
      <Container className="mt-7 py-5 text-center">
        <div
          className="spinner-border mb-3"
          role="status"
          style={{ color: theme.primary }}
        />
        <h5>Cargando disponibilidad</h5>
      </Container>
    );
  }

  return (
    <EmpresaContext.Provider value={valorContexto}>
    <div
      className={barberia ? "ri-barberia" : undefined}
      style={{ backgroundColor: barberia ? PALETA_BARBERIA.negro : "#FFFFFF", overflowX: "hidden" }}
    >
      {barberia && <style>{CSS_RESERVA_BARBERIA}</style>}
      <div
        className="position-relative py-7 py-lg-8"
        style={{
          background: theme.heroBg,
          minHeight: "40vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg="8">
              {!isLightTheme && (
                <img
                  src={empresa?.logo || logo}
                  alt={empresa?.nombre || "Logo"}
                  className="img-fluid mb-4 floating"
                  style={{
                    width: "150px",
                    filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.3))",
                  }}
                />
              )}
              <div
                style={{
                  display: "inline-block",
                  backgroundColor: isLightTheme
                    ? theme.primaryLight
                    : "rgba(255,255,255,0.2)",
                  color: isLightTheme ? theme.primary : "#ffffff",
                  padding: "8px 20px",
                  borderRadius: "50px",
                  fontSize: "0.95rem",
                  marginBottom: "1.5rem",
                  fontWeight: 500,
                  border: isLightTheme
                    ? `1px solid ${theme.primary}30`
                    : "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: isLightTheme ? "none" : "blur(10px)",
                }}
              >
                {barberia ? "✂️" : "✨"} {empresa?.nombre || "Bienvenido"}
              </div>
              <h1
                className="display-2 font-weight-bold mb-2"
                style={{
                  color: isLightTheme ? theme.textDark : "#ffffff",
                  fontSize: "clamp(2.5rem, 6vw, 4rem)",
                  textShadow: isLightTheme
                    ? "none"
                    : "0 2px 10px rgba(0,0,0,0.2)",
                }}
              >
                Reserva tu hora
              </h1>
              <p
                className="lead"
                style={{
                  color: isLightTheme
                    ? theme.textMuted
                    : "rgba(255,255,255,0.9)",
                  fontSize: "1.25rem",
                  maxWidth: "600px",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                Sin cuenta, sin complicaciones. Completa los pasos y asegura tu
                cita.
              </p>
            </Col>
          </Row>
        </Container>
      </div>

      {barberia && (
        <div
          aria-hidden="true"
          style={{
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(201,162,75,.8), transparent)",
          }}
        />
      )}

      <Container className="mt-5 mb-5" style={{ maxWidth: "1200px" }}>
        <div className="mb-4">
          <div className="d-flex justify-content-between">
            <span className="small text-muted">Progreso</span>
            <span className="small fw-bold" style={{ color: theme.primary }}>
              {Math.round(progresoPasos)}%
            </span>
          </div>
          <div className="progress" style={{ height: 6 }}>
            <div
              className="progress-bar"
              style={{
                width: `${progresoPasos}%`,
                backgroundColor: theme.primary,
              }}
            />
          </div>
        </div>

        <StepIndicator pasoActual={pasoActual} />

        <Card className="shadow-lg border-0">
          <div
            className="p-4 text-white"
            style={{
              background: barberia
                ? `linear-gradient(135deg, ${PALETA_BARBERIA.negro} 0%, #1c1c1f 100%)`
                : `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
              borderBottom: barberia ? `3px solid ${PALETA_BARBERIA.oro}` : undefined,
            }}
          >
            <h3 className="mb-1">Reserva tu hora</h3>
            <small>Sin cuenta, sin complicaciones</small>
          </div>
          <CardBody className="p-4">
            <Row>
              <Col lg={7}>
                <ServicioSelector
                  servicios={servicios}
                  servicio={servicio}
                  onSeleccionarServicio={handleSeleccionarServicio}
                  slug={slug}
                />
                {sugerenciaPlan && (
                  <div
                    className="d-flex align-items-start mb-4"
                    style={{
                      gap: 12,
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: `1px solid ${theme.primary}55`,
                      background: barberia ? "rgba(201,162,75,.08)" : `${theme.primary}10`,
                    }}
                  >
                    <span style={{ fontSize: 20, lineHeight: 1 }}>💡</span>
                    <div style={{ fontSize: "0.9rem", lineHeight: 1.5 }}>
                      <strong style={{ color: theme.primary }}>Ahorra suscribiéndote</strong>
                      <div>
                        Con el plan «{sugerenciaPlan.plan.nombre}», este servicio te sale a{" "}
                        <strong>${sugerenciaPlan.precioPorServicio.toLocaleString("es-CL")}</strong> en vez de $
                        {Number(servicioSeleccionado?.precio || 0).toLocaleString("es-CL")}.{" "}
                        <Link to={`/${slug}#planes`} style={{ color: theme.primary, fontWeight: 600 }}>
                          Ver planes
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
                {servicio && (
                  <BarberoSelector
                    barberos={barberosFiltrados}
                    barbero={barbero}
                    loading={loadingBarberos}
                    onSeleccionarBarbero={handleSeleccionarBarbero}
                  />
                )}
                {servicio && barbero && (
                  <WeekSelector
                    weekStart={weekStart}
                    weekDays={weekDays}
                    loadingWeek={loadingWeek}
                    fecha={fecha}
                    onSelectDay={handleSelectDay}
                    onPrevWeek={prevWeek}
                    onNextWeek={nextWeek}
                    barberoId={barbero}
                    barberoInfo={barberoSeleccionado}
                  />
                )}
                {servicio && barbero && fecha && (
                  <HorasDisponibles
                    horasDisponibles={horasDisponibles}
                    mensajeHoras={mensajeHoras}
                    cargandoHoras={cargandoHoras}
                    hora={hora}
                    onSeleccionarHora={setHora}
                    fecha={fecha}
                    barberoId={barbero}
                    duracionSeleccionado={duracionServicio}
                    horasDataCompleta={horasDataCompleta}
                    esInvitado={true}
                  />
                )}
                {(!servicio || !barbero || !fecha || !hora) && (
                  <div className="mt-4 d-flex">
                    <Info className="me-2" style={{ color: theme.primary }} />
                    <small className="text-muted">
                      Sigue los pasos para completar tu reserva
                    </small>
                  </div>
                )}
              </Col>

              <Col lg={5}>
                <ResumenReserva
                  servicioSeleccionado={servicioSeleccionado}
                  precioFinalCalculado={precioFinalCalculado} // 👈 nuevo prop
                  barberoSeleccionado={barberoSeleccionado}
                  fecha={fecha}
                  hora={hora}
                  reservando={reservando}
                  onReservar={toggleModalInvitado}
                  codigoDescuento={codigoDescuento}
                  habilitado={servicio && barbero && fecha && hora}
                />
              </Col>
            </Row>
          </CardBody>
        </Card>

        <Modal
          isOpen={modalInvitado}
          toggle={toggleModalInvitado}
          centered
          modalClassName={barberia ? "ri-barberia-modal" : undefined}
        >
          <ModalHeader toggle={toggleModalInvitado}>
            Datos del cliente
          </ModalHeader>

          <ModalBody autoComplete="off">
            <form autoComplete="off">
              <Input
                className={`mb-2 ${rutError ? "is-invalid" : ""}`}
                placeholder="Ingrese RUT sin puntos ni guión"
                value={rutInvitado}
                maxLength={12}
                onChange={handleRutChange}
                autoComplete="off"
                name="rut_fake"
              />

              {rutError && (
                <div className="invalid-feedback d-block mb-2">{rutError}</div>
              )}

              {buscandoUsuario && (
                <small className="text-muted d-block mb-2">
                  🔍 Buscando cliente...
                </small>
              )}
              {usuarioEncontrado && !buscandoUsuario && (
                <small className="d-block mb-2" style={{ color: theme.primary }}>
                  ✓ Datos completados automáticamente
                </small>
              )}

              <Input
                className="mb-2"
                placeholder="Nombre"
                value={invitado.nombre}
                autoComplete="off"
                name="nombre_fake"
                onChange={(e) => {
                  setUsuarioEncontrado(false);
                  setInvitado({ ...invitado, nombre: e.target.value });
                }}
              />

              <Input
                className="mb-2"
                placeholder="Apellido"
                value={invitado.apellido}
                autoComplete="off"
                name="apellido_fake"
                onChange={(e) =>
                  setInvitado({ ...invitado, apellido: e.target.value })
                }
              />

              <div className="mb-2">
                <div
                  className="d-flex align-items-center rounded input-group-alternative"
                  style={{
                    border: "1px solid #cad1d7",
                    backgroundColor: "#fff",
                  }}
                >
                  <div
                    className="d-flex align-items-center px-3 py-2"
                    style={{
                      backgroundColor: "#f7fafc",
                      borderRight: "1px solid #cad1d7",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <FaPhone
                      size={13}
                      className="me-2"
                      style={{ color: theme.primary }}
                    />
                    <span
                      className="fw-bold text-dark"
                      style={{ fontSize: "0.85rem", color: theme.textMuted }}
                    >
                      +569
                    </span>
                  </div>

                  <input
                    placeholder="Teléfono"
                    type="text"
                    name="telefono_random"
                    autoComplete="new-password"
                    inputMode="numeric"
                    value={invitado.telefono}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      if (value.length > 8) value = value.slice(0, 8);
                      setInvitado({ ...invitado, telefono: value });
                    }}
                    className="form-control"
                    style={{
                      border: "none",
                      boxShadow: "none",
                      backgroundColor: "transparent",
                      padding: "0.65rem 0.75rem",
                      fontSize: "0.875rem",
                    }}
                  />

                  {invitado.telefono && (
                    <div className="px-2">
                      {invitado.telefono.length === 8 ? (
                        <span
                          className="fw-bold"
                          style={{ color: theme.primary }}
                        >
                          ✓
                        </span>
                      ) : (
                        <span className="text-muted small">
                          {invitado.telefono.length}/8
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {invitado.telefono && invitado.telefono.length !== 8 && (
                  <small className="text-danger ms-1">
                    El teléfono debe tener 8 dígitos
                  </small>
                )}
              </div>

              <Input
                className="mb-3"
                placeholder="Email"
                type="email"
                value={invitado.email}
                name="email_random"
                autoComplete="new-password"
                onChange={(e) =>
                  setInvitado({ ...invitado, email: e.target.value })
                }
              />

              <Button
                block
                disabled={!invitadoValido || reservando}
                style={{
                  backgroundColor: theme.primary,
                  border: "none",
                  fontWeight: 600,
                  borderRadius: "8px",
                  color: barberia ? "#1a140a" : "#FFFFFF",
                }}
                onClick={async () => {
                  await reservarComoInvitado();
                  toggleModalInvitado();
                }}
              >
                {reservando ? "Reservando..." : "Confirmar reserva"}
              </Button>
            </form>
          </ModalBody>
        </Modal>
      </Container>

      <AuthFooter />
    </div>
    </EmpresaContext.Provider>
  );
};

export default ReservarHoraInvitado;

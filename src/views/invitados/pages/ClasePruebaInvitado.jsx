import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, CardBody, Row, Col, Button } from "reactstrap";
import { Dumbbell, Check, Gift } from "lucide-react";
import Swal from "sweetalert2";

import AuthFooter from "components/Footers/AuthFooter";
import { useEmpresa } from "context/EmpresaContext";
import { getClasesPublicas, getSesionesPublicas, postInscribirClasePublica } from "api/clases";
import DiaClaseSelector from "components/gestionClases/DiaClaseSelector";
import HorarioClaseSelector from "components/gestionClases/HorarioClaseSelector";
import ClaseEnHorarioSelector from "components/gestionClases/ClaseEnHorarioSelector";
import ResumenPruebaGratisInvitado from "components/gestionClases/ResumenPruebaGratisInvitado";
import { construirTema, TEMA_DEFAULT } from "utils/temaEmpresa";

// Tema de respaldo tal cual estaba antes de conectar los colores propios
// del negocio (fondo oscuro fijo con texto blanco), para no cambiarle nada
// a los gimnasios que aún no configuran sus colores.
const TEMA_DEFAULT_CLASE_PRUEBA = {
  ...TEMA_DEFAULT,
  textDark: "#ffffff",
  textMuted: "rgba(255,255,255,0.9)",
};

const PasosPruebaGratis = ({ pasoActual }) => {
  const pasos = [
    { numero: 1, label: "Día" },
    { numero: 2, label: "Horario" },
    { numero: 3, label: "Clase" },
    { numero: 4, label: "Tus datos" },
  ];

  return (
    <Card className="shadow-sm border-0 mb-4">
      <CardBody className="py-3">
        <Row className="align-items-center">
          {pasos.map((paso) => (
            <Col key={paso.numero} className="text-center">
              <div
                className={`d-inline-flex align-items-center justify-content-center rounded-circle ${
                  pasoActual >= paso.numero
                    ? "bg-success text-white"
                    : "bg-light text-muted"
                }`}
                style={{ width: 40, height: 40 }}
              >
                {pasoActual > paso.numero ? <Check size={18} /> : paso.numero}
              </div>
              <small className="d-block mt-1 font-weight-bold">
                {paso.label}
              </small>
            </Col>
          ))}
        </Row>
      </CardBody>
    </Card>
  );
};

/**
 * Agenda una clase SIN crear cuenta. Mismo espíritu que "Reservar hora" para
 * invitados: página pública, sin login, con el mismo wizard visual que usa
 * el cliente logueado en "Agendar clase" (DiaClaseSelector /
 * HorarioClaseSelector / ClaseEnHorarioSelector — día → horario → clase),
 * terminando en un formulario de datos personales.
 *
 * Si el RUT ingresado tiene una membresía activa, la reserva descuenta una
 * clase de esa membresía (pidiendo el teléfono o correo registrado como
 * verificación extra, para que no baste con saber el RUT de otra persona).
 * Si no tiene membresía, cae automáticamente en la clase de prueba gratis
 * (una sola vez por persona) — el backend decide cuál de las dos aplica,
 * este formulario es el mismo para ambos casos.
 */
const ClasePruebaInvitado = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { empresa } = useEmpresa();

  // Usa los colores que el gimnasio haya configurado en
  // "Configuración → Colores" (empresa.colores). Si todavía no configuró
  // nada, cae al tema que tenía antes (fondo oscuro, texto blanco).
  const theme = construirTema(empresa?.colores, TEMA_DEFAULT_CLASE_PRUEBA);

  const [clases, setClases] = useState([]);
  const [sesiones, setSesiones] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);
  const [sesionSeleccionada, setSesionSeleccionada] = useState(null);
  const [confirmando, setConfirmando] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const cargar = async () => {
      setCargando(true);
      try {
        const [clasesRes, sesionesRes] = await Promise.all([
          getClasesPublicas(slug),
          getSesionesPublicas(slug, {}),
        ]);
        setClases(clasesRes?.data?.clases || []);
        setSesiones(sesionesRes?.data?.sesiones || []);
      } catch (error) {
        console.error("Error al cargar clase de prueba:", error);
        setClases([]);
        setSesiones([]);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [slug]);

  const claseSeleccionada = clases.find(
    (c) => c._id === sesionSeleccionada?.claseId,
  );

  // Agrupa TODAS las sesiones (de cualquier clase) por día — el invitado
  // todavía no eligió clase en este punto, solo quiere ver qué días hay
  // algo disponible.
  const diasDisponibles = useMemo(() => {
    const porDia = new Map();
    sesiones
      .slice()
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      .forEach((s) => {
        const iso = s.fecha.split("T")[0];
        if (!porDia.has(iso)) porDia.set(iso, []);
        porDia.get(iso).push(s);
      });
    return Array.from(porDia.entries()).map(([iso, ses]) => ({ iso, sesiones: ses }));
  }, [sesiones]);

  const sesionesDelDia = diaSeleccionado
    ? diasDisponibles.find((d) => d.iso === diaSeleccionado)?.sesiones || []
    : [];

  const formatHoraChile = (fechaISO) =>
    new Date(fechaISO).toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Santiago",
    });

  // Sesiones (de cualquier clase) que caen justo en el horario ya elegido.
  const sesionesDelHorario = horaSeleccionada
    ? sesionesDelDia.filter((s) => formatHoraChile(s.fecha) === horaSeleccionada)
    : [];

  // Solo las clases que de verdad tienen una sesión en ese día+horario.
  const clasesDelHorario = clases.filter((c) =>
    sesionesDelHorario.some((s) => s.claseId === c._id),
  );

  const handleSeleccionarDia = (iso) => {
    setDiaSeleccionado(iso);
    setHoraSeleccionada(null);
    setSesionSeleccionada(null);
  };

  const handleSeleccionarHorario = (hora) => {
    setHoraSeleccionada(hora);
    setSesionSeleccionada(null);
  };

  const handleSeleccionarClaseEnHorario = (id) => {
    const sesion = sesionesDelHorario.find((s) => s.claseId === id);
    if (sesion) setSesionSeleccionada(sesion);
  };

  const pasoActual = !diaSeleccionado
    ? 1
    : !horaSeleccionada
      ? 2
      : !sesionSeleccionada
        ? 3
        : 4;

  const handleConfirmar = async (datosInvitado) => {
    if (!sesionSeleccionada) return;
    setConfirmando(true);
    try {
      const res = await postInscribirClasePublica(slug, {
        ...datosInvitado,
        claseId: sesionSeleccionada.claseId,
        fecha: sesionSeleccionada.fecha,
      });

      const usoMembresia = res?.data?.inscripcion?.tipoAcceso === "membresia";

      await Swal.fire({
        title: usoMembresia ? "¡Clase reservada! 🎉" : "¡Tu clase de prueba quedó agendada! 🎉",
        text: usoMembresia
          ? "Se descontó una clase de tu membresía. Te esperamos en el horario que elegiste."
          : "Te esperamos en el horario que elegiste. Te llegará la confirmación a tu correo.",
        icon: "success",
        confirmButtonText: "Genial",
      });

      setDiaSeleccionado(null);
      setHoraSeleccionada(null);
      setSesionSeleccionada(null);
    } catch (error) {
      const data = error.response?.data;

      if (data?.code === "CUENTA_EXISTENTE") {
        const resultado = await Swal.fire({
          title: "Ya tienes una cuenta con nosotros",
          text: data.message,
          icon: "info",
          confirmButtonText: "Iniciar sesión",
          showCancelButton: true,
          cancelButtonText: "Cerrar",
        });
        if (resultado.isConfirmed) {
          navigate(`/${slug}/login`);
        }
      } else if (data?.code === "VERIFICACION_REQUERIDA") {
        Swal.fire(
          "Verifica tu identidad",
          `${data.message} Completa el teléfono o el correo con el que estás registrado en el formulario.`,
          "warning",
        );
      } else if (data?.code === "SIN_MEMBRESIA") {
        Swal.fire(
          "Sin membresía activa",
          `${data.message}`,
          "info",
        );
      } else {
        Swal.fire(
          "No se pudo agendar",
          data?.message || "Ocurrió un problema al agendar tu clase.",
          "error",
        );
      }
    } finally {
      setConfirmando(false);
    }
  };

  if (cargando) {
    return (
      <Container className="mt-7 py-5 text-center">
        <div className="spinner-border text-success" />
        <p className="mt-3 text-muted">Cargando clases disponibles...</p>
      </Container>
    );
  }

  return (
    <div style={{ backgroundColor: "#FFFFFF", overflowX: "hidden" }}>
      <div
        className="position-relative py-7 py-lg-8"
        style={{
          background: theme.heroBg,
          minHeight: "35vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg="8">
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: "#ffffff",
                  padding: "8px 20px",
                  borderRadius: "50px",
                  fontSize: "0.95rem",
                  marginBottom: "1.5rem",
                  fontWeight: 500,
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <Gift size={16} /> {empresa?.nombre || "Bienvenido"}
              </div>
              <h1
                className="display-3 font-weight-bold mb-2"
                style={{ color: "#ffffff", fontSize: "clamp(2.2rem, 5vw, 3.5rem)" }}
              >
                Agenda tu clase sin crear cuenta
              </h1>
              <p
                className="lead"
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: "1.15rem",
                  maxWidth: "600px",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                ¿Ya eres socio? Ingresa tu RUT y reservamos con tu membresía. ¿Primera vez? Agenda
                tu clase de prueba gratis.
              </p>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="mt-5 mb-5" style={{ maxWidth: "1200px" }}>
        <PasosPruebaGratis pasoActual={pasoActual} />

        <Card className="shadow-lg border-0">
          <div
            className="p-4 text-white"
            style={{
              background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
            }}
          >
            <h3 className="mb-1 d-flex align-items-center">
              <Dumbbell size={22} className="me-2" /> Clase de prueba gratis
            </h3>
            <small>Día → Horario → Clase → Tus datos</small>
          </div>
          <CardBody className="p-4">
            <Row>
              <Col lg="7" md="12">
                <DiaClaseSelector
                  dias={diasDisponibles}
                  diaSeleccionado={diaSeleccionado}
                  onSelectDay={handleSeleccionarDia}
                />

                {diaSeleccionado && (
                  <HorarioClaseSelector
                    sesionesDelDia={sesionesDelDia}
                    horaSeleccionada={horaSeleccionada}
                    onSeleccionar={handleSeleccionarHorario}
                    yaInscrito={() => false}
                  />
                )}

                {diaSeleccionado && horaSeleccionada && (
                  <ClaseEnHorarioSelector
                    clases={clasesDelHorario}
                    sesionesDelHorario={sesionesDelHorario}
                    claseId={sesionSeleccionada?.claseId}
                    onSeleccionar={handleSeleccionarClaseEnHorario}
                    yaInscrito={() => false}
                  />
                )}
              </Col>

              <Col lg="5" md="12">
                <ResumenPruebaGratisInvitado
                  slug={slug}
                  claseSeleccionada={claseSeleccionada}
                  sesionSeleccionada={sesionSeleccionada}
                  onConfirmar={handleConfirmar}
                  confirmando={confirmando}
                  habilitado={!!sesionSeleccionada}
                />
              </Col>
            </Row>

            {clases.length === 0 && (
              <div className="text-center py-5">
                <p className="text-muted mb-3">
                  Todavía no hay clases disponibles para agendar.
                </p>
                <Button color="success" outline onClick={() => navigate(`/${slug}`)}>
                  Volver al inicio
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      </Container>

      <AuthFooter />
    </div>
  );
};

export default ClasePruebaInvitado;

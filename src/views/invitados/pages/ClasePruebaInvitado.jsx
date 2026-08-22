import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, CardBody, Row, Col, Button } from "reactstrap";
import { Dumbbell, Check, Gift } from "lucide-react";
import Swal from "sweetalert2";

import AuthFooter from "components/Footers/AuthFooter";
import { useEmpresa } from "context/EmpresaContext";
import { getClasesPublicas, getSesionesPublicas, postInscribirPruebaGratisInvitado } from "api/clases";
import ClaseGridSelector from "components/gestionClases/ClaseGridSelector";
import DiaClaseSelector from "components/gestionClases/DiaClaseSelector";
import HoraClaseSelector from "components/gestionClases/HoraClaseSelector";
import ResumenPruebaGratisInvitado from "components/gestionClases/ResumenPruebaGratisInvitado";

const themes = {
  default: {
    primary: "#5e72e4",
    primaryLight: "#eaecfe",
    primaryDark: "#324cdd",
    heroBg: "linear-gradient(150deg, #172b4d 0%, #1a174d 100%)",
    textDark: "#ffffff",
    textMuted: "rgba(255,255,255,0.9)",
    variant: "dark",
  },
};

const PasosPruebaGratis = ({ pasoActual }) => {
  const pasos = [
    { numero: 1, label: "Clase" },
    { numero: 2, label: "Día" },
    { numero: 3, label: "Hora" },
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
 * Agenda la clase de prueba gratis SIN crear cuenta. Mismo espíritu que
 * "Reservar hora" para invitados: página pública, sin login, con el mismo
 * wizard visual que usa el cliente logueado en "Agendar clase"
 * (ClaseGridSelector / DiaClaseSelector / HoraClaseSelector), terminando en
 * un formulario de datos personales en vez de un selector de tipo de acceso
 * (acá SIEMPRE es la clase de prueba, nunca mensualidad ni pase diario).
 */
const ClasePruebaInvitado = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { empresa } = useEmpresa();
  const theme = themes.default;

  const [clases, setClases] = useState([]);
  const [sesiones, setSesiones] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [claseId, setClaseId] = useState(null);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
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

  const claseSeleccionada = clases.find((c) => c._id === claseId);
  const sesionesDeClase = sesiones.filter((s) => s.claseId === claseId);

  const diasDisponibles = useMemo(() => {
    const porDia = new Map();
    sesionesDeClase
      .slice()
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      .forEach((s) => {
        const iso = s.fecha.split("T")[0];
        if (!porDia.has(iso)) porDia.set(iso, []);
        porDia.get(iso).push(s);
      });
    return Array.from(porDia.entries()).map(([iso, ses]) => ({ iso, sesiones: ses }));
  }, [sesionesDeClase]);

  const sesionesDelDia = diaSeleccionado
    ? diasDisponibles.find((d) => d.iso === diaSeleccionado)?.sesiones || []
    : [];

  const handleSeleccionarClase = (id) => {
    setClaseId(id);
    setDiaSeleccionado(null);
    setSesionSeleccionada(null);
  };

  const handleSeleccionarDia = (iso) => {
    setDiaSeleccionado(iso);
    setSesionSeleccionada(null);
  };

  const pasoActual = !claseId ? 1 : !diaSeleccionado ? 2 : !sesionSeleccionada ? 3 : 4;

  const handleConfirmar = async (datosInvitado) => {
    if (!sesionSeleccionada) return;
    setConfirmando(true);
    try {
      await postInscribirPruebaGratisInvitado(slug, {
        ...datosInvitado,
        claseId: sesionSeleccionada.claseId,
        fecha: sesionSeleccionada.fecha,
      });

      await Swal.fire({
        title: "¡Tu clase de prueba quedó agendada! 🎉",
        text: "Te esperamos en el horario que elegiste. Te llegará la confirmación a tu correo.",
        icon: "success",
        confirmButtonText: "Genial",
      });

      setClaseId(null);
      setDiaSeleccionado(null);
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
      } else {
        Swal.fire(
          "No se pudo agendar",
          data?.message || "Ocurrió un problema al agendar tu clase de prueba.",
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
                Agenda tu clase de prueba gratis
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
                Sin cuenta, sin costo, sin compromiso. Elige tu clase y listo.
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
            <small>Clase → Día → Hora → Tus datos</small>
          </div>
          <CardBody className="p-4">
            <Row>
              <Col lg="7" md="12">
                <ClaseGridSelector
                  clases={clases}
                  claseId={claseId}
                  onSeleccionar={handleSeleccionarClase}
                />

                {claseId && (
                  <DiaClaseSelector
                    dias={diasDisponibles}
                    diaSeleccionado={diaSeleccionado}
                    onSelectDay={handleSeleccionarDia}
                    claseNombre={claseSeleccionada?.nombre}
                  />
                )}

                {claseId && diaSeleccionado && (
                  <HoraClaseSelector
                    sesiones={sesionesDelDia}
                    sesionSeleccionada={sesionSeleccionada}
                    onSeleccionar={setSesionSeleccionada}
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

import React, { useContext, useEffect, useMemo, useState } from "react";
import { Container, Card, CardBody, Row, Col } from "reactstrap";
import { Dumbbell, Check } from "lucide-react";
import Swal from "sweetalert2";
import UserHeader from "components/Headers/UserHeader.js";
import { useAuth } from "context/AuthContext";
import ClasesContext from "context/ClasesContext";
import { getEstadoMembresiaCliente } from "api/membresiasClases";
import ClaseGridSelector from "components/gestionClases/ClaseGridSelector";
import DiaClaseSelector from "components/gestionClases/DiaClaseSelector";
import HoraClaseSelector from "components/gestionClases/HoraClaseSelector";
import ResumenInscripcionClase from "components/gestionClases/ResumenInscripcionClase";

/* =========================================================
   Indicador de pasos — mismo look que StepIndicator de
   "Reservar hora", con las etiquetas propias de este flujo.
========================================================= */
const PasosAgendarClase = ({ pasoActual }) => {
  const pasos = [
    { numero: 1, label: "Clase" },
    { numero: 2, label: "Día" },
    { numero: 3, label: "Hora" },
    { numero: 4, label: "Confirmar" },
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
 * Vista del cliente para agendar clases grupales, con el mismo wizard
 * paso a paso que "Reservar hora" (clase → día → hora → confirmar) en vez
 * de una lista plana de sesiones.
 */
const AgendarClase = () => {
  const { user } = useAuth();
  const { clases, getAllClases, getSesiones, misInscripciones, inscribirCliente } =
    useContext(ClasesContext);

  const [sesiones, setSesiones] = useState([]);
  const [misIns, setMisIns] = useState([]);
  const [estadoMembresia, setEstadoMembresia] = useState(null);
  const [cargando, setCargando] = useState(true);

  const [claseId, setClaseId] = useState(null);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [sesionSeleccionada, setSesionSeleccionada] = useState(null);
  const [tipoAcceso, setTipoAcceso] = useState("pase_dia");
  const [confirmando, setConfirmando] = useState(false);

  const cargarTodo = async () => {
    setCargando(true);
    try {
      const [sesionesData, inscripcionesData, membresiaRes] =
        await Promise.all([
          getSesiones({}),
          misInscripciones(),
          getEstadoMembresiaCliente(user.id).catch(() => null),
        ]);
      setSesiones(sesionesData);
      setMisIns(inscripcionesData);
      setEstadoMembresia(membresiaRes?.data || { activa: false });
    } catch (error) {
      console.error("Error al cargar clases disponibles:", error);
      setSesiones([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    getAllClases();
    cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pruebaGratisUsada = useMemo(
    () =>
      misIns.some(
        (i) => i.tipoAcceso === "prueba_gratis" && i.estado !== "cancelada",
      ),
    [misIns],
  );

  const yaInscrito = (sesion) =>
    misIns.some(
      (i) =>
        i.estado === "confirmada" &&
        i.clase?._id === sesion.claseId &&
        new Date(i.fecha).getTime() === new Date(sesion.fecha).getTime(),
    );

  const clasesActivas = clases.filter((c) => c.activa);
  const claseSeleccionada = clasesActivas.find((c) => c._id === claseId);

  const sesionesDeClase = sesiones.filter((s) => s.claseId === claseId);

  // Agrupa las sesiones de la clase elegida por día, para la tira de días
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
    return Array.from(porDia.entries()).map(([iso, ses]) => ({
      iso,
      sesiones: ses,
    }));
  }, [sesionesDeClase]);

  const sesionesDelDia = diaSeleccionado
    ? diasDisponibles.find((d) => d.iso === diaSeleccionado)?.sesiones || []
    : [];

  // Ajusta la opción de acceso por defecto apenas se conoce el estado real
  useEffect(() => {
    if (!sesionSeleccionada) return;
    if (estadoMembresia?.activa && estadoMembresia?.clasesRestantes > 0) {
      setTipoAcceso("membresia");
    } else if (!pruebaGratisUsada) {
      setTipoAcceso("prueba_gratis");
    } else {
      setTipoAcceso("pase_dia");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesionSeleccionada]);

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

  const handleConfirmar = async () => {
    if (!sesionSeleccionada) return;
    setConfirmando(true);
    try {
      await inscribirCliente(sesionSeleccionada.claseId, {
        fecha: sesionSeleccionada.fecha,
        tipoAcceso,
      });
      Swal.fire({
        title: "¡Listo!",
        text: "Quedaste inscrito en la clase.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
      setClaseId(null);
      setDiaSeleccionado(null);
      setSesionSeleccionada(null);
      await cargarTodo();
    } catch (error) {
      Swal.fire(
        "No se pudo inscribir",
        error.response?.data?.message ||
          "Ocurrió un problema al inscribirte en la clase.",
        "error",
      );
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
    <>
      <UserHeader />

      <Container className="mt--7 mb-5" style={{ maxWidth: "1200px" }}>
        <PasosAgendarClase pasoActual={pasoActual} />

        <Card className="shadow-lg rounded-3 border-0 bg-white">
          <CardBody className="p-4">
            <div className="text-center mb-4">
              <div className="bg-success rounded-circle d-inline-flex p-2 mb-3 shadow">
                <Dumbbell size={28} className="text-white" />
              </div>
              <h2 className="h3 font-weight-bold text-dark mb-1">
                Agendar clase
              </h2>
              <p className="text-muted mb-0">Clase → Día → Hora → Confirmar</p>
            </div>

            <Row>
              <Col lg="7" md="12" className="pr-lg-4">
                <ClaseGridSelector
                  clases={clasesActivas}
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
                    yaInscrito={yaInscrito}
                  />
                )}
              </Col>

              <Col lg="5" md="12" className="pl-lg-4">
                <ResumenInscripcionClase
                  claseSeleccionada={claseSeleccionada}
                  sesionSeleccionada={sesionSeleccionada}
                  estadoMembresia={estadoMembresia}
                  pruebaGratisUsada={pruebaGratisUsada}
                  tipoAcceso={tipoAcceso}
                  setTipoAcceso={setTipoAcceso}
                  onConfirmar={handleConfirmar}
                  confirmando={confirmando}
                  habilitado={!!sesionSeleccionada && !confirmando}
                />
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Container>
    </>
  );
};

export default AgendarClase;

import React, { useMemo } from "react";
import { Card, CardBody, Button, Spinner, Badge, Input } from "reactstrap";
import { Zap, MapPin, Dumbbell, User, Calendar } from "lucide-react";
import { useEmpresa } from "context/EmpresaContext";

const formatFechaLarga = (fechaISO) =>
  new Date(fechaISO).toLocaleDateString("es-CL", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

const formatHora = (fechaISO) =>
  new Date(fechaISO).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Santiago",
  });

/**
 * Resumen + confirmación del wizard "Agendar clase" — mismo tratamiento
 * visual que ResumenReserva en "Reservar hora" (tarjeta con el detalle +
 * botón grande de confirmar), pero además resuelve con qué accede el
 * cliente (mensualidad, prueba gratis o pase diario) según su estado real.
 */
const ResumenInscripcionClase = ({
  claseSeleccionada,
  sesionSeleccionada,
  estadoMembresia,
  pruebaGratisUsada,
  tipoAcceso,
  setTipoAcceso,
  onConfirmar,
  confirmando,
  habilitado,
}) => {
  const { empresa } = useEmpresa();

  const puedeMembresia = !!(
    estadoMembresia?.activa && estadoMembresia?.clasesRestantes > 0
  );
  const puedePruebaGratis = !pruebaGratisUsada;

  const opciones = useMemo(() => {
    const lista = [];
    if (puedeMembresia) {
      lista.push({
        value: "membresia",
        label: `Mi mensualidad (${estadoMembresia.clasesRestantes} clase${estadoMembresia.clasesRestantes !== 1 ? "s" : ""} disponibles)`,
      });
    }
    if (puedePruebaGratis) {
      lista.push({ value: "prueba_gratis", label: "Mi clase de prueba gratis" });
    }
    lista.push({
      value: "pase_dia",
      label: sesionSeleccionada?.precioPaseDiario
        ? `Pase diario · $${sesionSeleccionada.precioPaseDiario.toLocaleString("es-CL")}`
        : "Pase diario (valor a consultar)",
    });
    return lista;
  }, [puedeMembresia, puedePruebaGratis, estadoMembresia, sesionSeleccionada]);

  return (
    <>
      <Card className="border-success shadow-sm mb-3">
        <CardBody>
          <h6 className="font-weight-bold text-success d-flex align-items-center">
            <Zap size={18} className="me-2" /> Resumen
          </h6>

          <div className="small">
            <div className="d-flex justify-content-between border-bottom py-1">
              <span>
                <Dumbbell size={14} className="me-1" /> Clase:
              </span>
              <strong>{claseSeleccionada?.nombre || "—"}</strong>
            </div>

            <div className="d-flex justify-content-between border-bottom py-1">
              <span>
                <User size={14} className="me-1" /> Instructor:
              </span>
              <strong>
                {claseSeleccionada?.instructor
                  ? `${claseSeleccionada.instructor.nombre} ${claseSeleccionada.instructor.apellido || ""}`.trim()
                  : "—"}
              </strong>
            </div>

            <div className="d-flex justify-content-between border-bottom py-1">
              <span>
                <Calendar size={14} className="me-1" /> Fecha:
              </span>
              <strong className="text-capitalize">
                {sesionSeleccionada ? formatFechaLarga(sesionSeleccionada.fecha) : "—"}
              </strong>
            </div>

            <div className="d-flex justify-content-between border-bottom py-1">
              <span>⏰ Hora:</span>
              <strong>
                {sesionSeleccionada ? formatHora(sesionSeleccionada.fecha) : "—"}
              </strong>
            </div>
          </div>

          {sesionSeleccionada && (
            <div className="mt-3">
              <label className="small font-weight-bold mb-1">
                ¿Cómo quieres asistir?
              </label>
              <Input
                type="select"
                value={tipoAcceso}
                onChange={(e) => setTipoAcceso(e.target.value)}
              >
                {opciones.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </Input>
              {tipoAcceso === "pase_dia" && (
                <small className="text-muted d-block mt-1">
                  El pase diario se paga directamente en el gimnasio.
                </small>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      <div className="d-grid gap-2">
        <Button
          type="button"
          color="success"
          size="lg"
          block
          className="font-weight-bold"
          onClick={onConfirmar}
          disabled={!habilitado || confirmando}
        >
          {confirmando ? (
            <>
              <Spinner size="sm" className="me-2" />
              Inscribiendo...
            </>
          ) : (
            "✅ Confirmar inscripción"
          )}
        </Button>

        {!sesionSeleccionada && empresa && (
          <Card className="border-success mt-1">
            <CardBody className="text-center">
              <MapPin size={40} className="text-success mb-2" />
              <h5 className="font-weight-bold text-success">
                {empresa?.nombre || "—"}
              </h5>
              <p className="small text-muted mb-2">
                🕒 {empresa?.horarios || "—"}
                <br />
                📍 {empresa?.direccion || "—"}
                <br />
                📞 {empresa?.telefono || "—"}
              </p>
              <Badge color="success" className="rounded-pill text-white px-3 py-2">
                Elige una clase para empezar
              </Badge>
            </CardBody>
          </Card>
        )}
      </div>
    </>
  );
};

export default ResumenInscripcionClase;

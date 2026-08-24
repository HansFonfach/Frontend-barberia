import React, { useEffect, useState } from "react";
import { Card, CardBody, Button, Spinner, Input, FormGroup } from "reactstrap";
import { Dumbbell, User, Calendar, Gift } from "lucide-react";
import { FaPhone } from "react-icons/fa";
import { useRutValidator } from "hooks/useRutValidador";
import { getUsuarioByRutPublico } from "api/usuarios";

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
 * Paso final del wizard "Agenda tu clase de prueba" (invitado, sin cuenta):
 * resumen de la clase elegida + formulario de datos personales, con el
 * mismo buscador por RUT que usa "Reservar hora" para invitados (autofill
 * seguro: solo nombre/apellido, nunca datos sensibles ni estado de
 * mensualidad — eso lo decide el back al confirmar).
 */
const ResumenPruebaGratisInvitado = ({
  slug,
  claseSeleccionada,
  sesionSeleccionada,
  onConfirmar,
  confirmando,
  habilitado,
}) => {
  const { rut, handleRutChange, error: rutError } = useRutValidator();
  const [datos, setDatos] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    email: "",
  });
  const [buscando, setBuscando] = useState(false);
  const [encontrado, setEncontrado] = useState(false);

  useEffect(() => {
    setEncontrado(false);
    if (rutError || rut.length < 8) return;

    let activo = true;
    const buscar = async () => {
      setBuscando(true);
      try {
        const usuario = await getUsuarioByRutPublico(slug, rut);
        if (!activo || !usuario) return;
        setDatos((prev) => ({
          ...prev,
          nombre: usuario.nombre || prev.nombre,
          apellido: usuario.apellido || prev.apellido,
        }));
        setEncontrado(true);
      } catch (_) {
        // RUT no encontrado: no pasa nada, la persona completa sus datos a mano
      } finally {
        if (activo) setBuscando(false);
      }
    };
    buscar();

    return () => {
      activo = false;
    };
  }, [rut, rutError, slug]);

  const datosCompletos =
    datos.nombre.trim() &&
    datos.apellido.trim() &&
    rut &&
    !rutError &&
    datos.telefono.trim().length >= 8 &&
    datos.email.trim();

  return (
    <>
      <Card className="border-success shadow-sm mb-3">
        <CardBody>
          <h6 className="font-weight-bold text-success d-flex align-items-center">
            <Gift size={18} className="me-2" /> Tu clase
          </h6>

          <div className="small mb-3">
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
            <div className="d-flex justify-content-between py-1">
              <span>⏰ Hora:</span>
              <strong>
                {sesionSeleccionada ? formatHora(sesionSeleccionada.fecha) : "—"}
              </strong>
            </div>
          </div>

          {sesionSeleccionada && (
            <>
              <label className="small font-weight-bold mb-1 d-block">
                Tus datos
              </label>

              <Input
                className={`mb-2 ${rutError ? "is-invalid" : ""}`}
                placeholder="RUT (sin puntos ni guión)"
                value={rut}
                maxLength={12}
                onChange={handleRutChange}
                autoComplete="off"
              />
              {rutError && (
                <div className="invalid-feedback d-block mb-2">{rutError}</div>
              )}
              {buscando && (
                <small className="text-muted d-block mb-2">
                  🔍 Buscando tus datos...
                </small>
              )}
              {encontrado && !buscando && (
                <small className="text-success d-block mb-2">
                  ✓ Te encontramos, completamos tu nombre
                </small>
              )}

              <Input
                className="mb-2"
                placeholder="Nombre"
                value={datos.nombre}
                autoComplete="off"
                onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
              />
              <Input
                className="mb-2"
                placeholder="Apellido"
                value={datos.apellido}
                autoComplete="off"
                onChange={(e) => setDatos({ ...datos, apellido: e.target.value })}
              />

              <FormGroup className="mb-2">
                <div
                  className="d-flex align-items-center rounded"
                  style={{ border: "1px solid #cad1d7", backgroundColor: "#fff" }}
                >
                  <div
                    className="d-flex align-items-center px-3 py-2"
                    style={{
                      backgroundColor: "#f7fafc",
                      borderRight: "1px solid #cad1d7",
                    }}
                  >
                    <FaPhone size={13} className="me-2 text-success" />
                  </div>
                  <input
                    placeholder="Teléfono"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={datos.telefono}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 9);
                      setDatos({ ...datos, telefono: value });
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
                </div>
              </FormGroup>

              <Input
                className="mb-2"
                placeholder="Correo electrónico"
                type="email"
                value={datos.email}
                autoComplete="off"
                onChange={(e) => setDatos({ ...datos, email: e.target.value })}
              />
            </>
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
          onClick={() => onConfirmar({ ...datos, rut })}
          disabled={!habilitado || !datosCompletos || confirmando}
        >
          {confirmando ? (
            <>
              <Spinner size="sm" className="me-2" />
              Agendando...
            </>
          ) : (
            "Reservar mi clase"
          )}
        </Button>

        <small className="text-muted text-center d-block mt-1">
          Si tienes membresía activa, se descuenta de tu plan. Si no, es tu clase de prueba
          gratis y solo se puede usar una vez.
        </small>
      </div>
    </>
  );
};

export default ResumenPruebaGratisInvitado;

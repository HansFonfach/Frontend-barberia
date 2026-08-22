import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  FormGroup,
  Input,
  Alert,
} from "reactstrap";
import Swal from "sweetalert2";
import ClasesContext from "context/ClasesContext";

const formatFechaHora = (fecha) =>
  fecha
    ? new Date(fecha).toLocaleString("es-CL", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Santiago",
      })
    : "";

/**
 * Modal de auto-inscripción del cliente logueado (sin buscador de cliente,
 * porque siempre es él mismo). Ofrece las opciones de acceso que realmente
 * puede usar según su estado de mensualidad y si ya gastó su clase de
 * prueba gratis. El pago del pase diario queda pendiente/manual, igual que
 * en el flujo del admin.
 *
 * Props:
 * - sesion: objeto de getSesiones({...}) → { claseId, nombre, fecha, ... , precioPaseDiario }
 * - estadoMembresia: resultado de getEstadoMembresiaCliente(user.id)
 * - pruebaGratisUsada: boolean, derivado de misInscripciones()
 */
const ConfirmarInscripcionModal = ({
  isOpen,
  toggle,
  sesion,
  estadoMembresia,
  pruebaGratisUsada,
  onInscrito,
}) => {
  const { inscribirCliente } = useContext(ClasesContext);
  const [tipoAcceso, setTipoAcceso] = useState("");
  const [guardando, setGuardando] = useState(false);

  const puedeMembresia = !!(
    estadoMembresia?.activa && estadoMembresia?.clasesRestantes > 0
  );
  const puedePruebaGratis = !pruebaGratisUsada;

  const opciones = useMemo(() => {
    const lista = [];
    if (puedeMembresia) {
      lista.push({
        value: "membresia",
        label: `Usar mi mensualidad (te quedan ${estadoMembresia.clasesRestantes} clase${estadoMembresia.clasesRestantes !== 1 ? "s" : ""})`,
      });
    }
    if (puedePruebaGratis) {
      lista.push({
        value: "prueba_gratis",
        label: "Mi clase de prueba gratis",
      });
    }
    lista.push({
      value: "pase_dia",
      label: sesion?.precioPaseDiario
        ? `Pase diario · $${sesion.precioPaseDiario.toLocaleString("es-CL")} (se paga en el lugar)`
        : "Pase diario (consultar valor en el lugar)",
    });
    return lista;
  }, [puedeMembresia, puedePruebaGratis, estadoMembresia, sesion]);

  useEffect(() => {
    if (isOpen) {
      setTipoAcceso(opciones[0]?.value || "pase_dia");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, sesion]);

  const handleConfirmar = async () => {
    if (!sesion) return;

    setGuardando(true);
    try {
      await inscribirCliente(sesion.claseId, {
        fecha: sesion.fecha,
        tipoAcceso,
      });
      Swal.fire({
        title: "¡Listo!",
        text: "Quedaste inscrito en la clase.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
      toggle();
      onInscrito && onInscrito();
    } catch (error) {
      Swal.fire(
        "No se pudo inscribir",
        error.response?.data?.message ||
          "Ocurrió un problema al inscribirte en la clase.",
        "error",
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Confirmar inscripción</ModalHeader>
      <ModalBody>
        {sesion && (
          <div className="mb-3">
            <h5 className="mb-1">{sesion.nombre}</h5>
            <p className="text-muted small text-capitalize mb-0">
              {formatFechaHora(sesion.fecha)}
            </p>
            <p className="text-muted small mb-0">
              Cupos: {sesion.inscritos}/{sesion.cupoMaximo}
            </p>
          </div>
        )}

        <FormGroup>
          <label className="font-weight-bold">¿Cómo quieres asistir?</label>
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
        </FormGroup>

        {tipoAcceso === "pase_dia" && (
          <Alert color="info" className="small mb-3">
            El pase diario se paga directamente en el lugar antes o después de
            la clase.
          </Alert>
        )}

        {!puedeMembresia && estadoMembresia?.activa === false && (
          <p className="text-muted small">
            No tienes una mensualidad activa en este momento. Puedes revisar
            los planes disponibles en <strong>Mi plan</strong>.
          </p>
        )}

        <Button
          block
          color="success"
          disabled={guardando || !sesion}
          onClick={handleConfirmar}
          type="button"
        >
          {guardando ? "Inscribiendo..." : "Confirmar inscripción"}
        </Button>
      </ModalBody>
    </Modal>
  );
};

export default ConfirmarInscripcionModal;

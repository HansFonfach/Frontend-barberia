import React, { useContext, useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  FormGroup,
  Input,
  Button,
} from "reactstrap";
import Swal from "sweetalert2";
import ClasesContext from "context/ClasesContext";
import BuscadorClientePorRut from "./BuscadorClientePorRut";

const FORM_VACIO = {
  tipoAcceso: "membresia",
  monto: "",
  metodo: "",
};

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
 * Modal para que el admin inscriba a un cliente en una sesión puntual de una
 * clase. `sesion` viene de getSesiones({...}) y trae claseId, nombre, fecha,
 * cupoMaximo, inscritos. El cliente se busca por RUT (mismo patrón que
 * "Agendar cliente" en barbería) en vez de elegirlo de una lista larga.
 */
const InscribirClienteModal = ({ isOpen, toggle, sesion, onInscrito }) => {
  const { inscribirCliente } = useContext(ClasesContext);
  const [form, setForm] = useState(FORM_VACIO);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(FORM_VACIO);
      setClienteSeleccionado(null);
    }
  }, [isOpen, sesion]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleGuardar = async () => {
    if (!sesion) return;
    if (!clienteSeleccionado) {
      Swal.fire("Error", "Busca y selecciona un cliente por su RUT", "error");
      return;
    }

    const payload = {
      fecha: sesion.fecha,
      tipoAcceso: form.tipoAcceso,
      clienteId: clienteSeleccionado._id,
    };
    if (form.tipoAcceso === "pase_dia") {
      if (form.monto !== "") payload.monto = Number(form.monto);
      if (form.metodo) payload.metodo = form.metodo;
    }

    setGuardando(true);
    try {
      await inscribirCliente(sesion.claseId, payload);
      Swal.fire("Listo", "Cliente inscrito correctamente", "success");
      toggle();
      onInscrito && onInscrito();
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo inscribir al cliente",
        "error",
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Inscribir cliente</ModalHeader>
      <ModalBody>
        {sesion && (
          <p className="text-muted small text-capitalize mb-3">
            {sesion.nombre} · {formatFechaHora(sesion.fecha)}
            <br />
            Cupo: {sesion.inscritos}/{sesion.cupoMaximo}
          </p>
        )}

        <Form>
          <BuscadorClientePorRut
            clienteSeleccionado={clienteSeleccionado}
            onSeleccionar={setClienteSeleccionado}
            onLimpiarSeleccion={() => setClienteSeleccionado(null)}
          />

          <FormGroup>
            <label>Tipo de acceso</label>
            <Input
              type="select"
              name="tipoAcceso"
              value={form.tipoAcceso}
              onChange={handleChange}
            >
              <option value="membresia">Mensualidad (descuenta clase del plan)</option>
              <option value="pase_dia">Pase diario (paga esa clase)</option>
              <option value="prueba_gratis">Clase de prueba gratis</option>
            </Input>
            {form.tipoAcceso === "membresia" && (
              <small className="text-muted">
                El cliente debe tener una mensualidad activa con clases
                disponibles; si no, se avisará al guardar.
              </small>
            )}
            {form.tipoAcceso === "prueba_gratis" && (
              <small className="text-muted">
                Solo se puede usar una vez por cliente.
              </small>
            )}
          </FormGroup>

          {form.tipoAcceso === "pase_dia" && (
            <FormGroup>
              <label>Monto ($)</label>
              <Input
                type="number"
                name="monto"
                placeholder="Vacío = usa el precio de pase diario de la clase"
                value={form.monto}
                onChange={handleChange}
              />
              <Input
                type="select"
                name="metodo"
                value={form.metodo}
                onChange={handleChange}
                className="mt-2"
              >
                <option value="">Método de pago (opcional)</option>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="tarjeta">Tarjeta</option>
              </Input>
            </FormGroup>
          )}

          <Button
            block
            color="primary"
            disabled={guardando}
            onClick={handleGuardar}
            type="button"
          >
            {guardando ? "Inscribiendo..." : "Inscribir"}
          </Button>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default InscribirClienteModal;

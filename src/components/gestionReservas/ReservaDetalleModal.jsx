import React, { useEffect, useState } from "react";

import { Modal, Button, Row, Col } from "reactstrap";

import Swal from "sweetalert2";

import ClienteInfoCard from "./ClienteInfoCard";
import ReservaInfoCard from "./ReservaInfoCard";
import ReservaProductosSection from "./ReservaProductosSection";
import { useReserva } from "context/ReservaContext";
import ModalNotaCliente from "./ModalNotaCliente";
import { putActualizarNota } from "api/usuarios";

const ReservaDetalleModal = ({
  modal,
  setModal,
  reservaSeleccionada,
  vistaMobile,
  setReservaSeleccionada,

  cancelarReserva,
  marcarReservaNoAsistida,
  setModalReagendar,
}) => {
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [modalNota, setModalNota] = useState(false);
  const [extrasSeleccionados, setExtrasSeleccionados] = useState([]); // 👈
  const [observacionReserva, setObservacionReserva] = useState("");

  const { actualizarReserva } = useReserva();

  useEffect(() => {
    if (reservaSeleccionada) {
      setObservacionReserva(reservaSeleccionada.observacionFinal || "");
      setProductosSeleccionados(
        reservaSeleccionada.productos?.map((p) => ({
          _id: p.producto,
          nombre: p.nombre,
          precio: p.precio,
          categoria: p.categoria,
          cantidad: p.cantidad,
        })) || [],
      );
      setExtrasSeleccionados(
        reservaSeleccionada.extras?.map((e) => ({
          id: Math.random().toString(36).substr(2, 9),
          nombre: e.nombre,
          precio: e.precio,
          cantidad: e.cantidad,
        })) || [],
      );
    }
  }, [reservaSeleccionada]);

  const handleGuardarNota = async (clienteId, notasProfesional) => {
    try {
      await putActualizarNota(clienteId, notasProfesional);

      // actualizar localmente sin recargar
      setReservaSeleccionada((prev) => ({
        ...prev,
        cliente: {
          ...prev.cliente,
          notasProfesional,
        },
      }));

      Swal.fire({
        icon: "success",
        title: "Nota guardada",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo guardar la nota.",
      });
    }
  };

  const handleGuardarDetalle = async () => {
    const productosPayload = productosSeleccionados.map((p) => ({
      producto: p._id,
      cantidad: p.cantidad,
    }));

    // 👇 nuevo
    const extrasPayload = extrasSeleccionados.map((e) => ({
      nombre: e.nombre,
      precio: e.precio,
      cantidad: e.cantidad,
    }));

    const res = await actualizarReserva(
      reservaSeleccionada._id,
      observacionReserva,
      productosPayload,
      extrasPayload, // 👈
    );

    if (!res) return;
    setModal(false);
    Swal.fire({
      icon: "success",
      title: "Detalle guardado",
      timer: 1600,
      showConfirmButton: false,
    });
  };

  if (!reservaSeleccionada) return null;

  const esPendiente = (reserva) =>
    reserva.estado === "pendiente" ||
    reserva.estado === "confirmada" ||
    reserva.estado === "completada";

  /* =========================
      CANCELAR
  ========================= */

  const handleCancelar = async () => {
    const { value: motivo, isConfirmed } = await Swal.fire({
      title: "¿Cancelar reserva?",
      html: "Esta acción no se puede revertir.",
      icon: "warning",

      input: "textarea",

      inputLabel: "Motivo de cancelación",

      inputPlaceholder: "Escribe el motivo aquí...",

      inputAttributes: {
        rows: 3,
      },

      inputValidator: (value) => {
        if (!value || value.trim() === "") {
          return "Debes ingresar un motivo";
        }
      },

      showCancelButton: true,

      confirmButtonColor: "#d33",

      cancelButtonColor: "#3085d6",

      confirmButtonText: "Sí, cancelar",

      cancelButtonText: "Volver",
    });

    if (!isConfirmed) return;

    await cancelarReserva(reservaSeleccionada._id, motivo);

    setModal(false);

    Swal.fire({
      title: "Reserva cancelada",

      text: "La reserva fue cancelada correctamente.",

      icon: "success",

      timer: 2000,

      showConfirmButton: false,
    });
  };

  /* =========================
      NO ASISTIÓ
  ========================= */

  const handleNoAsistio = async () => {
    const res = await marcarReservaNoAsistida(reservaSeleccionada._id);

    if (!res) return;

    setModal(false);

    Swal.fire({
      title: "Reserva actualizada",

      text: "Marcada como NO ASISTIÓ",

      icon: "success",

      timer: 2000,

      showConfirmButton: false,
    });
  };

  return (
    <Modal
      isOpen={modal}
      toggle={() => setModal(false)}
      className={`modal-dialog-centered ${
        vistaMobile ? "modal-sm" : "modal-lg"
      }`}
    >
      <div className="modal-content">
        {/* HEADER */}
        <div className="modal-header bg-gradient-primary">
          <h5 className="modal-title text-white">Detalle Reserva</h5>

          <button className="close text-white" onClick={() => setModal(false)}>
            <span>&times;</span>
          </button>
        </div>

        {/* BODY */}
        <div className="modal-body">
          <Row>
            <Col md="6">
              <ClienteInfoCard
                reservaSeleccionada={reservaSeleccionada}
                onEditarNota={() => setModalNota(true)}
              />
            </Col>

            <Col md="6">
              <ReservaInfoCard reservaSeleccionada={reservaSeleccionada} />
            </Col>
          </Row>

          <ReservaProductosSection
            productosSeleccionados={productosSeleccionados}
            setProductosSeleccionados={setProductosSeleccionados}
            observacionReserva={observacionReserva}
            setObservacionReserva={setObservacionReserva}
            reservaSeleccionada={reservaSeleccionada}
            extrasSeleccionados={extrasSeleccionados} // 👈
            setExtrasSeleccionados={setExtrasSeleccionados} // 👈
          />
        </div>

        <ModalNotaCliente
          isOpen={modalNota}
          toggle={() => setModalNota(false)}
          cliente={reservaSeleccionada.cliente}
          onGuardar={handleGuardarNota}
        />

        {/* FOOTER */}
        <div className="modal-footer flex-wrap">
          {esPendiente(reservaSeleccionada) && (
            <>
              {/* NO ASISTIÓ */}
              <Button
                color="warning"
                className="mr-2 mb-2"
                onClick={handleNoAsistio}
              >
                <i className="ni ni-user-run mr-1"></i>
                No asistió
              </Button>

              {/* REAGENDAR */}
              <Button
                color="primary"
                className="mr-2 mb-2"
                onClick={() => {
                  setModal(false);

                  setModalReagendar(true);
                }}
              >
                <i className="ni ni-calendar-grid-58 mr-1"></i>
                Reagendar
              </Button>

              {/* CANCELAR */}
              <Button
                color="danger"
                className="mr-2 mb-2"
                onClick={handleCancelar}
              >
                <i className="ni ni-fat-remove mr-1"></i>
                Cancelar
              </Button>
            </>
          )}

          {/* GUARDAR */}
          <Button
            color="success"
            className="mr-2 mb-2"
            onClick={handleGuardarDetalle} // ← esto
          >
            <i className="ni ni-check-bold mr-1"></i>
            Guardar detalle
          </Button>
          {/* CERRAR */}
          <Button color="secondary" onClick={() => setModal(false)}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReservaDetalleModal;

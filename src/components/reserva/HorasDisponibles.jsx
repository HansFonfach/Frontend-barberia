// src/components/reserva/HorasDisponibles.jsx
import React, { useState } from "react";
import {
  FormGroup,
  Label,
  Row,
  Col,
  Button,
  Spinner,
  Alert,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "reactstrap";
import { Bell, Clock, Mail } from "lucide-react";
import Swal from "sweetalert2";
import { useNotificacion } from "context/NotificacionesContext";
import { useAuth } from "context/AuthContext";
import { postCrearNotificacion } from "api/notificaciones";

const HorasDisponibles = ({
  horasDisponibles = [],
  mensajeHoras,
  cargandoHoras,
  hora: horaSeleccionada,
  onSeleccionarHora,
  horasDataCompleta,
  duracionSeleccionado,
  fecha,
  barberoId,
  esInvitado = false,
}) => {
  // ✅ Los hooks SIEMPRE se llaman, sin condiciones
  const notificacionContext = useNotificacion();
  const authContext = useAuth();

  // Luego usamos los valores condicionalmente
  const crearNotificacion = !esInvitado
    ? notificacionContext?.crearNotificacion
    : null;
  const user = !esInvitado ? authContext?.user : null;

  // Estado para el modal de invitados
  const [modalEmail, setModalEmail] = useState(false);
  const [emailInvitado, setEmailInvitado] = useState("");
  const [horaParaNotificar, setHoraParaNotificar] = useState(null);
  const [enviandoNotif, setEnviandoNotif] = useState(false);
  const [emailError, setEmailError] = useState("");

  const duracionReal = Number(
    horasDataCompleta?.duracionServicio || duracionSeleccionado || 0,
  );

  const calcularHoraFin = (horaInicio) => {
    if (!duracionReal) return "";
    const [h, m] = horaInicio.split(":").map(Number);
    const total = h * 60 + m + duracionReal;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(
      total % 60,
    ).padStart(2, "0")}`;
  };

  const validarEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmailInvitado(val);
    if (val && !validarEmail(val)) {
      setEmailError("Ingresa un correo válido");
    } else {
      setEmailError("");
    }
  };

  const handleNotify = async (e, h) => {
    e.stopPropagation();

    if (esInvitado) {
      // Abrir modal para pedir email
      setHoraParaNotificar(h);
      setEmailInvitado("");
      setEmailError("");
      setModalEmail(true);
      return;
    }

    if (!crearNotificacion) {
      console.error("Error: crearNotificacion no está disponible");
      return;
    }

    try {
      await crearNotificacion({
        fecha,
        hora: h,
        barberoId,
        usuarioId: user?.id,
      });

      Swal.fire({
        icon: "success",
        title: "Listo 👌",
        text: `Te avisaremos mediante WhatsApp si se libera la hora ${h}`,
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error al crear notificación:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo crear la notificación",
        timer: 2500,
        showConfirmButton: false,
      });
    }
  };

  const handleConfirmarNotifInvitado = async () => {
    console.log("🔔 handleConfirmarNotifInvitado ejecutado");
    console.log("📧 email:", emailInvitado);
    console.log("⏰ hora:", horaParaNotificar);
    console.log("📅 fecha:", fecha);
    console.log("💈 barberoId:", barberoId);
    console.log("contexto:", notificacionContext);

    if (!validarEmail(emailInvitado)) {
      setEmailError("Ingresa un correo válido");
      return;
    }

    setEnviandoNotif(true);
    try {
      await postCrearNotificacion({
        fecha,
        hora: horaParaNotificar,
        barberoId,
        emailInvitado,
        esInvitado: true,
      });

      setModalEmail(false);

      Swal.fire({
        icon: "success",
        title: "¡Te avisaremos! 🔔",
        html: `Te enviaremos un correo a <strong>${emailInvitado}</strong> si se libera la hora <strong>${horaParaNotificar}</strong>.`,
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error al crear notificación de invitado:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo registrar la notificación. Intenta nuevamente.",
        timer: 2500,
        showConfirmButton: false,
      });
    } finally {
      setEnviandoNotif(false);
    }
  };

  return (
    <FormGroup className="mb-4">
      <Label className="font-weight-bold d-flex align-items-center mb-3">
        <Clock size={18} className="mr-2 text-primary" />
        <span style={{ fontSize: "1.1rem" }}>Horas disponibles</span>
      </Label>

      {cargandoHoras && (
        <div className="text-center py-4">
          <Spinner color="primary" size="sm" className="mr-2" />
          <span className="text-muted">Buscando horarios...</span>
        </div>
      )}

      {!cargandoHoras && horasDisponibles.length === 0 && (
        <Alert color="success" className="text-center border-dashed">
          {mensajeHoras || "No hay horarios disponibles para esta fecha."}
        </Alert>
      )}

      {!cargandoHoras && horasDisponibles.length > 0 && (
        <>
          <Row className="px-2">
            {horasDisponibles.map(({ hora: h, estado }) => {
              const isSelected = horaSeleccionada === h;
              const isDisponible = estado === "disponible";

              return (
                <Col key={h} xs="4" sm="3" md="2" className="p-1">
                  <div className="position-relative">
                    <Button
                      block
                      outline={!isSelected}
                      color={
                        isDisponible
                          ? isSelected
                            ? "success"
                            : "success"
                          : "light"
                      }
                      onClick={() => isDisponible && onSeleccionarHora(h)}
                      className={`py-2 border-2 ${
                        !isDisponible ? "text-muted" : ""
                      }`}
                      style={{
                        cursor: isDisponible ? "pointer" : "default",
                        opacity: isDisponible ? 1 : 0.6,
                        fontWeight: isSelected ? "bold" : "500",
                        fontSize: "0.9rem",
                        borderRadius: "8px",
                        borderStyle: isDisponible ? "solid" : "dashed",
                      }}
                    >
                      {h}
                    </Button>

                    {/* Campanita para horas NO disponibles */}
                    {!isDisponible && (
                      <button
                        onClick={(e) => handleNotify(e, h)}
                        title={
                          esInvitado
                            ? "Avísame por correo si se libera"
                            : "Avísame si se libera"
                        }
                        style={{
                          position: "absolute",
                          top: "-5px",
                          right: "-5px",
                          backgroundColor: "#FFC107",
                          border: "2px solid white",
                          borderRadius: "50%",
                          width: "24px",
                          height: "24px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 0,
                          cursor: "pointer",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          zIndex: 2,
                        }}
                      >
                        <Bell size={12} fill="#212529" color="#212529" />
                      </button>
                    )}
                  </div>
                </Col>
              );
            })}
          </Row>

          {horaSeleccionada && (
            <div
              className="mt-4 p-3"
              style={{
                backgroundColor: "#e8f5e9",
                borderLeft: "5px solid #28a745",
                borderRadius: "8px",
              }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-success font-weight-bold d-block">
                    Reserva seleccionada
                  </span>
                  <span className="h5 mb-0">
                    {horaSeleccionada} – {calcularHoraFin(horaSeleccionada)}
                  </span>
                </div>
                <Badge color="success" pill className="px-3 py-2">
                  {duracionReal} min
                </Badge>
              </div>
            </div>
          )}
        </>
      )}

      {/* ===== MODAL EMAIL PARA INVITADOS ===== */}
      <Modal
        isOpen={modalEmail}
        toggle={() => setModalEmail(false)}
        centered
        size="sm"
      >
        <ModalHeader toggle={() => setModalEmail(false)}>
          <div className="d-flex align-items-center gap-2">
            <Bell size={18} className="text-warning" />
            <span>Notificarme para las {horaParaNotificar}</span>
          </div>
        </ModalHeader>

        <ModalBody>
          <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
            Ingresa tu correo y te avisaremos si esta hora se libera.
          </p>

          <div className="position-relative mb-1">
            <div
              className="d-flex align-items-center rounded"
              style={{
                border: `1px solid ${emailError ? "#dc3545" : "#cad1d7"}`,
                backgroundColor: "#fff",
                overflow: "hidden",
              }}
            >
              {/* Ícono prefijo */}
              <div
                className="d-flex align-items-center px-3 py-2"
                style={{
                  backgroundColor: "#f7fafc",
                  borderRight: "1px solid #cad1d7",
                }}
              >
                <Mail size={14} className="text-success" />
              </div>

              {/* Input */}
              <input
                type="email"
                placeholder="tucorreo@email.com"
                value={emailInvitado}
                onChange={handleEmailChange}
                className="form-control"
                style={{
                  border: "none",
                  boxShadow: "none",
                  backgroundColor: "transparent",
                  padding: "0.65rem 0.75rem",
                  fontSize: "0.875rem",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !emailError && emailInvitado) {
                    handleConfirmarNotifInvitado();
                  }
                }}
              />
            </div>

            {emailError && (
              <small className="text-danger ms-1">{emailError}</small>
            )}
          </div>

          <small
            className="text-muted d-block mt-2"
            style={{ fontSize: "0.78rem" }}
          >
            🔒 Solo usaremos tu correo para avisarte sobre esta hora.
          </small>
        </ModalBody>

        <ModalFooter className="pt-0 border-0">
          <Button
            color="warning"
            block
            disabled={!emailInvitado || !!emailError || enviandoNotif}
            onClick={handleConfirmarNotifInvitado}
            style={{ fontWeight: 600 }}
          >
            {enviandoNotif ? (
              <>
                <Spinner size="sm" className="me-2" />
                Registrando...
              </>
            ) : (
              <>
                <Bell size={14} className="me-2" />
                Avisarme cuando se libere
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </FormGroup>
  );
};

export default HorasDisponibles;

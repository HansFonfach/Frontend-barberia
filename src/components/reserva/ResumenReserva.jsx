// src/views/admin/pages/components/ResumenReserva.jsx
import React from "react";
import { Card, CardBody, Button, Spinner, Badge } from "reactstrap";
import { Zap, MapPin, Briefcase } from "lucide-react";
import { useEmpresa } from "context/EmpresaContext";

const ResumenReserva = ({
  usuarioEncontrado,
  rut,
  servicioSeleccionado,
  barberoSeleccionado,
  fecha,
  hora,
  reservando,
  cargandoHoras,
  onReservar,
  habilitado,
  mostrarInfo,

  // 🔥 NUEVO
  suscripcion,
  serviciosReserva,
  serviciosRestantes,
  excedente,
}) => {
  const nombreServicio = servicioSeleccionado?.nombre || "—";
  const duracionServicio = servicioSeleccionado?.duracion;
  const precioServicio = servicioSeleccionado?.precio;
  const { empresa } = useEmpresa();

  const serviciosLuegoReserva = Math.max(
    0,
    serviciosRestantes - serviciosReserva,
  );

  const obtenerIconoServicio = () => {
    if (!empresa?.tipo) return "🛠"; // fallback genérico

    switch (empresa.tipo) {
      case "barberia":
        return "✂️";
      case "salon de belleza":
        return "💅";
      default:
        return "🛠"; // icono genérico para otros servicios
    }
  };

    const obtenerIconoProfesional = () => {
    if (!empresa?.tipo) return "🛠"; // fallback genérico

    switch (empresa.tipo) {
      case "barberia":
        return "👨‍💼";
      case "salon de belleza":
        return "💇‍♀️";
      default:
        return "🛠"; // icono genérico para otros servicios
    }
  };
      const obtenerIconoCliente = () => {
    if (!empresa?.tipo) return "🛠"; // fallback genérico

    switch (empresa.tipo) {
      case "barberia":
        return "👤 ";
      case "salon de belleza":
        return "👩🏼";
      default:
        return "🛠"; // icono genérico para otros servicios
    }
  };

  return (
    <>
      <Card className="border-success shadow-sm mb-3">
        <CardBody>
          <h6 className="font-weight-bold text-success d-flex align-items-center">
            <Zap size={18} className="me-2" /> Resumen
          </h6>

          <div className="small">
            <div className="d-flex justify-content-between border-bottom py-1">
                 <span>{obtenerIconoCliente()} Servicio:</span>
              <strong>
                {usuarioEncontrado
                  ? `${usuarioEncontrado.nombre} ${usuarioEncontrado.apellido}`
                  : rut || "—"}
              </strong>
            </div>

            <div className="d-flex justify-content-between border-bottom py-1">
              <span className="d-flex align-items-center gap-1">
                <span>{obtenerIconoServicio()} Servicio:</span>
              </span>
              <strong>
                {duracionServicio
                  ? `${nombreServicio} (${duracionServicio} min)`
                  : nombreServicio}
              </strong>
            </div>

            <div className="d-flex justify-content-between border-bottom py-1">
              <span>{obtenerIconoProfesional()} Profesional:</span>
              <strong>
                {barberoSeleccionado
                  ? `${barberoSeleccionado.nombre} ${barberoSeleccionado.apellido}`
                  : "—"}
              </strong>
            </div>

            <div className="d-flex justify-content-between border-bottom py-1">
              <span>📅 Fecha:</span>
              <strong>{fecha || "—"}</strong>
            </div>

            <div className="d-flex justify-content-between border-bottom py-1">
              <span>⏰ Hora:</span>
              <strong>{hora || "—"}</strong>
            </div>

            <div className="d-flex justify-content-between border-bottom py-1">
              <span>💸 Precio:</span>
              <strong>
                {precioServicio
                  ? `$${precioServicio.toLocaleString("es-CL")}`
                  : "—"}
              </strong>
            </div>
          </div>

          {/* 🔥 IMPACTO SUSCRIPCIÓN */}
          {suscripcion && hora && serviciosReserva > 0 && (
            <div
              className={`alert mt-3 ${
                excedente > 0 ? "alert-warning" : "alert-success"
              }`}
            >
              {excedente === 0 ? (
                <>
                  Esta reserva consume <strong>{serviciosReserva}</strong>{" "}
                  servicio{serviciosReserva > 1 ? "s" : ""}. Te quedarán{" "}
                  <strong>{serviciosLuegoReserva}</strong> disponible
                  {serviciosLuegoReserva !== 1 ? "s" : ""}.
                </>
              ) : (
                <>
                  Esta reserva consume <strong>{serviciosReserva}</strong>{" "}
                  servicio{serviciosReserva > 1 ? "s" : ""}. Excedes tu plan en{" "}
                  <strong>{excedente}</strong> servicio
                  {excedente > 1 ? "s" : ""}, que se cobrará a valor normal.
                </>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      <div className="d-grid gap-2">
        <Button
          color={excedente > 0 ? "warning" : "success"}
          size="lg"
          className="font-weight-bold"
          onClick={onReservar}
          disabled={!habilitado || cargandoHoras}
        >
          {reservando ? (
            <>
              <Spinner size="sm" className="me-2" />
              Procesando...
            </>
          ) : (
            "✅ Confirmar Reserva"
          )}
        </Button>

        {mostrarInfo && empresa && (
          <Card className="border-success mt-1">
            <CardBody className="text-center">
              <MapPin size={40} className="text-success mb-2" />
              <h5 className="font-weight-bold text-success">
                {empresa?.nombre || "—"}
              </h5>
              <p className="small text-muted mb-2">
                🕒 {empresa?.horarios || "—"}
               
                {empresa?.slug === "lasantabarberia" && (
                  
                  <>  <br />⭐ Sábado atención solo suscritos</>
                )}
                <br />
                📍 {empresa?.direccion || "—"}
                <br />
                📞 {empresa?.telefono || "—"}
              </p>
              <Badge
                color="success"
                className="rounded-pill text-white px-3 py-2"
              >
                ⭐ 4.8 (156)
              </Badge>
            </CardBody>
          </Card>
        )}
      </div>
    </>
  );
};

export default ResumenReserva;

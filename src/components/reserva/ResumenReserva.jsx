// src/views/admin/pages/components/ResumenReserva.jsx
import React from "react";
import { Card, CardBody, Button, Spinner, Badge } from "reactstrap";
import { Zap, MapPin } from "lucide-react";

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
}) => {
  return (
    <>
      <Card className="border-success shadow-sm mb-3">
        <CardBody>
          <h6 className="font-weight-bold text-success d-flex align-items-center">
            <Zap size={18} className="me-2" /> Resumen
          </h6>

          <div className="small">
            <div className="d-flex justify-content-between border-bottom py-1">
              <span>👤 Cliente:</span>
              <strong>
                {usuarioEncontrado
                  ? `${usuarioEncontrado.nombre} ${usuarioEncontrado.apellido}`
                  : rut || "—"}
              </strong>
            </div>
            <div className="d-flex justify-content-between border-bottom py-1">
              <span>✂️ Servicio:</span>
              <strong>
                {servicioSeleccionado
                  ? `${servicioSeleccionado.nombre} (${servicioSeleccionado.duracion} min)`
                  : "—"}
              </strong>
            </div>
            <div className="d-flex justify-content-between border-bottom py-1">
              <span>👨‍💼 Barbero:</span>
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
                {servicioSeleccionado ? `$${servicioSeleccionado.precio}` : "—"}
              </strong>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Acciones */}
      <div className="d-grid gap-2">
        <Button
          color="success"
          size="lg"
          className="font-weight-bold"
          onClick={onReservar}
          disabled={!habilitado}
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

        {/* Info barbería */}
        {mostrarInfo && (
          <Card className="border-success mt-1">
            <CardBody className="text-center">
              <MapPin size={40} className="text-success mb-2" />
              <h5 className="font-weight-bold text-success">
                La Santa Barberia 💈
              </h5>
              <p className="small text-muted mb-2">
                🕒 Lunes a Viernes 8:00 - 19:00 hrs
                <br />
                ⭐ Sábado atención solo suscritos
                <br />
                📍 Calle Diego Portales #310
                <br />
                📞 +56 9 9681 7505
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

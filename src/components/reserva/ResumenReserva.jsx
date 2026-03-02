// src/views/admin/pages/components/ResumenReserva.jsx
import React from "react";
import { Card, CardBody, Button, Spinner, Badge } from "reactstrap";
import { Zap, MapPin } from "lucide-react";
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
}) => {
  const nombreServicio = servicioSeleccionado?.nombre || "—";
  const duracionServicio = servicioSeleccionado?.duracion;
  const precioServicio = servicioSeleccionado?.precio;
  const { empresa } = useEmpresa();

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
                {duracionServicio ? `${nombreServicio} ` : nombreServicio}
              </strong>
            </div>

            <div className="d-flex justify-content-between border-bottom py-1">
              <span>👨‍💼 Profesional:</span>
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
        </CardBody>
      </Card>

      <div className="d-grid gap-2">
        <Button
          color="success"
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
                <br />
                ⭐ Sábado atención solo suscritos
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

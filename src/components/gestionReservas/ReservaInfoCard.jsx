import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
} from "reactstrap";

const ReservaInfoCard = ({
  reservaSeleccionada,
  onMarcarAbono,
  onRevertirAbono,
  procesandoAbono,
}) => {
  const abono = reservaSeleccionada.abono;
  const totalServicio = reservaSeleccionada.servicioSnapshot?.precio || 0;

  // Hora de término = hora de inicio + duración del servicio (o 30 min si
  // por algún motivo no viene la duración).
  const duracionServicio =
    Number(reservaSeleccionada.duracion) ||
    Number(reservaSeleccionada.servicioSnapshot?.duracion) ||
    Number(reservaSeleccionada.servicio?.duracion) ||
    30;
  const horaFin = new Date(
    new Date(reservaSeleccionada.fecha).getTime() + duracionServicio * 60000,
  ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-white border-0">
        <h6>Información Reserva</h6>
      </CardHeader>

      <CardBody>
        <p>
          <strong>Servicio:</strong>{" "}
          {reservaSeleccionada.servicio?.nombre}
        </p>

        <p>
          <strong>Fecha:</strong>{" "}
          {new Date(
            reservaSeleccionada.fecha,
          ).toLocaleDateString()}
        </p>

        <p>
          <strong>Hora:</strong>{" "}
          {new Date(
            reservaSeleccionada.fecha,
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {" – "}
          {horaFin}
        </p>

        <hr className="my-3" />

        {reservaSeleccionada.giftcard?.giftcardId && (
          <div
            className="mb-3"
            style={{ background: "#fdf2f8", border: "1px solid #fbcfe8", borderRadius: 10, padding: "10px 12px" }}
          >
            <strong style={{ color: "#be185d" }}>🎁 Reserva con giftcard</strong>
            <div className="small text-muted mt-1">
              Código {reservaSeleccionada.giftcard.codigo} · cubre $
              {Number(reservaSeleccionada.giftcard.montoAplicado || 0).toLocaleString("es-CL")}
              {reservaSeleccionada.giftcard.precioOriginal
                ? ` de $${Number(reservaSeleccionada.giftcard.precioOriginal).toLocaleString("es-CL")}`
                : ""}
            </div>
            <div className="small text-muted">
              {totalServicio > 0
                ? `El cliente paga la diferencia: $${totalServicio.toLocaleString("es-CL")}`
                : "El servicio ya está pagado: no hay que cobrarle."}
            </div>
          </div>
        )}

        <p className="mb-1">
          <strong>Total:</strong> ${totalServicio.toLocaleString("es-CL")}
        </p>

        {abono?.estado === "pagado" ? (
          <>
            <p className="mb-1 text-success">
              <i className="ni ni-check-bold mr-1"></i>
              Abonado: ${abono.monto?.toLocaleString("es-CL")}
            </p>
            <p className="mb-2">
              <strong>Pendiente:</strong> $
              {(reservaSeleccionada.montoPendiente ?? 0).toLocaleString("es-CL")}
            </p>
          </>
        ) : (
          <p className="mb-2 text-muted">
            <i className="ni ni-time-alarm mr-1"></i>
            Sin abono registrado
          </p>
        )}

        {abono?.estado === "pagado" ? (
          <Button
            color="danger"
            outline
            size="sm"
            onClick={onRevertirAbono}
            disabled={procesandoAbono}
          >
            {procesandoAbono ? "Procesando..." : "Revertir abono"}
          </Button>
        ) : (
          <Button
            color="info"
            size="sm"
            onClick={onMarcarAbono}
            disabled={procesandoAbono}
          >
            {procesandoAbono ? "Procesando..." : "Marcar abonado"}
          </Button>
        )}
      </CardBody>
    </Card>
  );
};

export default ReservaInfoCard;
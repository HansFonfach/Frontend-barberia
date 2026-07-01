import React from "react";
import { Table, Button, Badge } from "reactstrap";

const ReservaTableDesktop = ({ reservas, empresa, onVer, isLoading }) => {
  const getEstado = (reserva) => {
    if (reserva.estado === "cancelada") return "Cancelada";
    if (reserva.estado === "no_asistio") return "No asistió";
    if (reserva.estado === "completada") return "Completada";
    if (reserva.estado === "reagendada") return "Reagendada";

    if (
      reserva.confirmacionAsistencia?.respondida &&
      reserva.confirmacionAsistencia?.respuesta === "confirma"
    ) {
      return "Confirmada por Cliente";
    }

    const fechaReserva = new Date(reserva.fecha);
    const ahora = new Date();

    if (reserva.estado === "confirmada") return "Confirmada";
    if (fechaReserva < ahora) return "Terminada";

    return "Pendiente";
  };

  const getColorEstado = (reserva) => {
    const estado = getEstado(reserva);
    switch (estado) {
      case "No asistió":
        return "danger";
      case "Cancelada":
        return "dark";
      case "Reagendada":
        return "warning";
      case "Confirmada por Cliente":
        return "success";
      case "Confirmada":
        return "primary";
      case "Terminada":
        return "secondary";
      case "Completada":
        return "success";
      default:
        return "info";
    }
  };

  const iconoCliente = (reserva) => {
    const tieneNota = reserva.cliente?.notasProfesional?.trim();
    const nota = tieneNota ? " 📝" : "";

    if (reserva.suscripcion) return "⭐" + nota;
    if (empresa?.slug === "lumicabeauty") return "🎀" + nota;
    return "🧔🏻‍♂️" + nota;
  };

  // 👇 NUEVO: mismo cálculo que en la card mobile
  const infoAbono = (reserva) => {
    const totalServicio =
      reserva.servicioSnapshot?.precio || reserva.servicio?.precio || 0;
    const totalExtras = reserva.totalExtras || 0;
    const totalProductos = reserva.totalProductos || 0;
    const totalGeneral = totalServicio + totalExtras + totalProductos;

    const abonado =
      reserva.abono?.estado === "pagado" ? reserva.abono.monto || 0 : 0;

    const pendiente = totalGeneral - abonado;

    if (abonado === 0) {
      return { texto: "Sin abono", color: "warning" };
    }
    if (pendiente <= 0) {
      return { texto: "Pagado", color: "success" };
    }
    return {
      texto: `Pendiente $${pendiente.toLocaleString("es-CL")}`,
      color: "warning",
    };
  };

  const reservasFiltradas = reservas.filter(
    (reserva) => getEstado(reserva) !== "Reagendada",
  );

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <span className="text-muted">Cargando reservas...</span>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <Table className="align-items-center table-flush" responsive>
        <thead className="thead-light">
          <tr>
            <th>Cliente</th>
            <th>Servicio</th>
            <th>Hora</th>
            <th>Estado</th>
            <th>Abono</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {reservasFiltradas.map((reserva) => {
            const abono = infoAbono(reserva);
            return (
              <tr key={reserva._id}>
                <td className="text-nowrap">
                  <span className="mr-2">{iconoCliente(reserva)}</span>
                  {reserva.cliente?.nombre} {reserva.cliente?.apellido}
                </td>

                <td className="text-nowrap">{reserva.servicio?.nombre}</td>

                <td className="text-nowrap">
                  {new Date(reserva.fecha).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>

                <td>
                  <Badge color={getColorEstado(reserva)} pill>
                    {getEstado(reserva)}
                  </Badge>
                </td>

                {/* 👇 NUEVO */}
                <td>
                  <Badge color={abono.color} pill>
                    {abono.texto}
                  </Badge>
                </td>

                <td>
                  <Button color="info" size="sm" onClick={() => onVer(reserva)}>
                    Ver
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default ReservaTableDesktop;
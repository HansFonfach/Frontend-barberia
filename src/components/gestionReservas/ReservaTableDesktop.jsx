import React from "react";
import {
  Table,
  Button,
  Badge,
} from "reactstrap";

const ReservaTableDesktop = ({
  reservas,
  empresa,
  onVer,
}) => {
  const getEstado = (reserva) => {
    if (reserva.estado === "cancelada")
      return "Cancelada";

    if (reserva.estado === "no_asistio")
      return "No asistió";

    if (reserva.estado === "completada")
      return "Completada";

    if (reserva.estado === "reagendada")
      return "Reagendada";

    if (
      reserva.confirmacionAsistencia
        ?.respondida &&
      reserva.confirmacionAsistencia
        ?.respuesta === "confirma"
    ) {
      return "Confirmada por Cliente";
    }

    const fechaReserva = new Date(
      reserva.fecha,
    );

    const ahora = new Date();

    if (reserva.estado === "confirmada")
      return "Confirmada";

    if (fechaReserva < ahora)
      return "Terminada";

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
    if (reserva.suscripcion)
      return "⭐";

    if (
      empresa?.slug === "lumicabeauty"
    )
      return "🎀";

    return "🧔🏻‍♂️";
  };

  const reservasFiltradas =
    reservas.filter(
      (reserva) =>
        getEstado(reserva) !==
        "Reagendada",
    );

  return (
    <div className="table-responsive">
      <Table
        className="align-items-center table-flush"
        responsive
      >
        <thead className="thead-light">
          <tr>
            <th>Cliente</th>
            <th>Servicio</th>
            <th>Hora</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {reservasFiltradas.map(
            (reserva) => (
              <tr key={reserva._id}>
                {/* CLIENTE */}
                <td className="text-nowrap">
                  <span className="mr-2">
                    {iconoCliente(
                      reserva,
                    )}
                  </span>

                  {
                    reserva.cliente
                      ?.nombre
                  }{" "}
                  {
                    reserva.cliente
                      ?.apellido
                  }
                </td>

                {/* SERVICIO */}
                <td className="text-nowrap">
                  {
                    reserva.servicio
                      ?.nombre
                  }
                </td>

                {/* HORA */}
                <td className="text-nowrap">
                  {new Date(
                    reserva.fecha,
                  ).toLocaleTimeString(
                    [],
                    {
                      hour:
                        "2-digit",
                      minute:
                        "2-digit",
                    },
                  )}
                </td>

                {/* ESTADO */}
                <td>
                  <Badge
                    color={getColorEstado(
                      reserva,
                    )}
                    pill
                  >
                    {getEstado(reserva)}
                  </Badge>
                </td>

                {/* ACTIONS */}
                <td>
                  <Button
                    color="info"
                    size="sm"
                    onClick={() =>
                      onVer(reserva)
                    }
                  >
                    Ver
                  </Button>
                </td>
              </tr>
            ),
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default ReservaTableDesktop;
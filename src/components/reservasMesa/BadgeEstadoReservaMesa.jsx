import React from "react";
import { Badge } from "reactstrap";
import { ESTADOS_MESA } from "utils/reservasMesa";

const BadgeEstadoReservaMesa = ({ estado, className = "" }) => {
  const e = ESTADOS_MESA[estado] || { label: estado, color: "light" };
  return (
    <Badge color={e.color} pill className={className}>
      {e.label}
    </Badge>
  );
};

export default BadgeEstadoReservaMesa;

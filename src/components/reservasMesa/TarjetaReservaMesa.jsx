import React from "react";
import { Badge, Button } from "reactstrap";
import { Users, Phone, Cake, MessageSquare, AlertTriangle } from "lucide-react";
import BadgeEstadoReservaMesa from "./BadgeEstadoReservaMesa";
import { ACCIONES_RAPIDAS, ETIQUETA_ORIGEN, telLink } from "utils/reservasMesa";

/** Una reserva en la vista "Hoy": se lee de un vistazo y se marca con un toque. */
const TarjetaReservaMesa = ({ reserva, onAccion, onAbrir, ocupado = false }) => {
  const r = reserva;
  const acciones = ACCIONES_RAPIDAS[r.estado] || [];
  const apagada = ["cancelada", "completada", "no_asistio"].includes(r.estado);

  return (
    <div
      className="border rounded p-3 mb-2 bg-white"
      style={{
        opacity: apagada ? 0.6 : 1,
        borderLeft: `4px solid ${r.atrasada ? "#fb6340" : r.estado === "llego" ? "#2dce89" : "#e9ecef"}`,
      }}
    >
      <div className="d-flex" style={{ gap: 12 }}>
        <button
          type="button"
          onClick={() => onAbrir(r)}
          className="text-left p-0 border-0 bg-transparent"
          style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
        >
          <div className="d-flex align-items-center flex-wrap" style={{ gap: 8 }}>
            <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#32325d" }}>{r.hora}</span>
            <strong style={{ color: "#32325d", wordBreak: "break-word" }}>{r.cliente.nombre}</strong>
            <BadgeEstadoReservaMesa estado={r.estado} />
            {r.atrasada && (
              <Badge color="warning" pill>
                <AlertTriangle size={12} style={{ verticalAlign: "-2px" }} /> Atrasada
              </Badge>
            )}
            {r.sobrecupo && (
              <Badge color="danger" pill>
                Sobrecupo
              </Badge>
            )}
          </div>

          <div className="d-flex flex-wrap text-muted small mt-1" style={{ gap: 12 }}>
            <span>
              <Users size={14} style={{ verticalAlign: "-2px" }} /> {r.personas}{" "}
              {r.personas === 1 ? "persona" : "personas"}
            </span>
            <span>{r.sector.nombre}</span>
            <span>{ETIQUETA_ORIGEN[r.origen] || r.origen}</span>
            <span>#{r.codigo}</span>
          </div>

          {r.cumpleanos?.es && (
            <div className="small mt-1" style={{ color: "#f5365c" }}>
              <Cake size={14} style={{ verticalAlign: "-2px" }} /> Cumpleaños
              {r.cumpleanos.festejado ? ` de ${r.cumpleanos.festejado}` : ""}
              {r.cumpleanos.detalle ? ` · ${r.cumpleanos.detalle}` : ""}
            </div>
          )}
          {r.comentarios && (
            <div className="small text-muted mt-1" style={{ wordBreak: "break-word" }}>
              <MessageSquare size={14} style={{ verticalAlign: "-2px" }} /> {r.comentarios}
            </div>
          )}
        </button>
      </div>

      <div className="d-flex flex-wrap mt-2" style={{ gap: 6 }}>
        <a href={telLink(r.cliente.telefono)} className="btn btn-sm btn-outline-secondary m-0">
          <Phone size={14} style={{ verticalAlign: "-2px" }} /> Llamar
        </a>
        {acciones.map((a) => (
          <Button
            key={a.hacia}
            size="sm"
            color={a.color}
            className="m-0"
            disabled={ocupado}
            onClick={() => onAccion(r, a)}
          >
            {a.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TarjetaReservaMesa;

import { useEffect, useState } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "reactstrap";
import { getUsoSuscripcion } from "api/suscripciones";

/**
 * Historial de visitas de una suscripción: cada reserva del cliente mientras
 * estuvo suscrito, si descontó del plan y por qué. Así el barbero puede ver
 * "vino el 12 y el 26" o por qué un servicio no se descontó.
 */

const ZONA = "America/Santiago";

const fechaCorta = (d) =>
  new Date(d).toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: ZONA });

const fechaVisita = (d) => {
  const f = new Date(d);
  const dia = f.toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: ZONA });
  const hora = f.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: ZONA });
  return { dia: dia.charAt(0).toUpperCase() + dia.slice(1), hora };
};

const ESTADOS = {
  pendiente: { texto: "Agendada", bg: "#FFF3CD", color: "#856404" },
  confirmada: { texto: "Confirmada", bg: "#E8F1FD", color: "#1D5FB8" },
  completada: { texto: "Asistió", bg: "#E6F9F0", color: "#1A7A4A" },
  no_asistio: { texto: "No asistió", bg: "#FCEBEB", color: "#A32D2D" },
  cancelada: { texto: "Cancelada", bg: "#f0f0f0", color: "#6b7280" },
  reagendada: { texto: "Reagendada", bg: "#f0f0f0", color: "#6b7280" },
};

const Pastilla = ({ estado, futura }) => {
  const e = ESTADOS[estado] || { texto: estado, bg: "#f0f0f0", color: "#525f7f" };
  const texto = futura && ["pendiente", "confirmada"].includes(estado) ? "Agendada" : e.texto;
  return (
    <span style={{ background: e.bg, color: e.color, padding: "2px 9px", borderRadius: 99, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
      {texto}
    </span>
  );
};

const Resumen = ({ uso }) => {
  const { usados, total, restantes, agendados, periodo } = uso;
  const pct = total > 0 ? Math.min((usados / total) * 100, 100) : 0;
  const color = pct >= 100 ? "#E24B4A" : pct >= 60 ? "#fb6340" : "#2dce89";
  return (
    <div style={{ background: "#fafafa", border: "1px solid #e9ecef", borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 6 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>
          Usó {usados} de {total} servicio{total === 1 ? "" : "s"}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: restantes > 0 ? "#1A7A4A" : "#A32D2D" }}>
          {restantes > 0 ? `Le quedan ${restantes}` : "No le quedan servicios"}
        </div>
      </div>
      <div style={{ background: "#e9ecef", borderRadius: 99, height: 6, margin: "8px 0" }}>
        <div style={{ width: `${pct}%`, background: color, borderRadius: 99, height: 6 }} />
      </div>
      <div style={{ fontSize: 12, color: "#8898aa" }}>
        {periodo.esCiclo ? `Ciclo ${periodo.numeroCiclo}: ` : "Período: "}
        {fechaCorta(periodo.desde)} al {fechaCorta(periodo.hasta)}
        {agendados > 0 && ` · ${agendados} ya agendado${agendados === 1 ? "" : "s"} (descuenta${agendados === 1 ? "" : "n"} desde que se reserva)`}
      </div>
    </div>
  );
};

const FilaVisita = ({ r }) => {
  const { dia, hora } = fechaVisita(r.fecha);
  const apagada = !r.cuenta || !r.enPeriodo;
  return (
    <div
      data-testid="visita"
      style={{
        display: "flex", gap: 12, alignItems: "flex-start",
        padding: "10px 0", borderBottom: "1px solid #f3f3f3",
        opacity: apagada ? 0.7 : 1,
      }}
    >
      <div
        title={r.cuenta ? "Descontó del plan" : "No descontó del plan"}
        style={{
          width: 26, height: 26, borderRadius: "50%", flexShrink: 0, marginTop: 2,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700,
          background: r.cuenta ? "#E6F9F0" : "#f0f0f0", color: r.cuenta ? "#1A7A4A" : "#9aa0a6",
        }}
      >
        {r.cuenta ? (r.peso > 1 ? `×${r.peso}` : "✓") : "–"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: "#1a1a2e" }}>
            {dia} · {hora}
          </div>
          <Pastilla estado={r.estado} futura={r.futura} />
        </div>
        <div style={{ fontSize: 12, color: "#525f7f" }}>
          {r.servicio}
          {r.barbero && <span style={{ color: "#8898aa" }}> · con {r.barbero}</span>}
        </div>
        {(r.motivo || (r.cuenta && !r.enPeriodo)) && (
          <div style={{ fontSize: 11, color: "#8898aa", marginTop: 2 }}>
            {r.cuenta && !r.enPeriodo ? "Fue en otro ciclo del plan" : r.motivo}
          </div>
        )}
      </div>
    </div>
  );
};

const ModalUsoSuscripcion = ({ suscripcion, isOpen, toggle, nombrePlan }) => {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !suscripcion?._id) return undefined;
    let vigente = true;
    setDatos(null);
    setError("");
    getUsoSuscripcion(suscripcion._id)
      .then(({ data }) => vigente && setDatos(data))
      .catch(() => vigente && setError("No se pudo cargar el historial. Intenta de nuevo."));
    return () => {
      vigente = false;
    };
  }, [isOpen, suscripcion?._id]);

  const u = suscripcion?.usuario;
  const reservas = datos?.uso?.reservas || [];
  const contadas = reservas.filter((r) => r.cuenta);
  const otras = reservas.filter((r) => !r.cuenta);

  return (
    <Modal isOpen={isOpen} toggle={toggle} scrollable>
      <ModalHeader toggle={toggle}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>
          {u?.nombre} {u?.apellido}
        </div>
        {suscripcion && (
          <div style={{ fontSize: 12, color: "#8898aa", fontWeight: 400 }}>
            {nombrePlan} · {fechaCorta(suscripcion.fechaInicio)} al {fechaCorta(suscripcion.fechaFin)}
          </div>
        )}
      </ModalHeader>
      <ModalBody style={{ paddingTop: 8 }}>
        {error ? (
          <div className="alert alert-warning small mb-0">{error}</div>
        ) : !datos ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <Spinner color="primary" />
          </div>
        ) : (
          <>
            <Resumen uso={datos.uso} />

            <div style={{ fontSize: 11, fontWeight: 700, color: "#8898aa", textTransform: "uppercase", letterSpacing: ".05em" }}>
              Visitas que descontaron del plan ({contadas.length})
            </div>
            {contadas.length === 0 ? (
              <div style={{ fontSize: 13, color: "#8898aa", padding: "10px 0" }}>
                No tiene reservas que descuenten del plan mientras estuvo suscrito.
              </div>
            ) : (
              contadas.map((r) => <FilaVisita key={r._id} r={r} />)
            )}

            {otras.length > 0 && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#8898aa", textTransform: "uppercase", letterSpacing: ".05em", marginTop: 16 }}>
                  Otras reservas en ese período ({otras.length})
                </div>
                {otras.map((r) => <FilaVisita key={r._id} r={r} />)}
              </>
            )}
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <button
          type="button"
          onClick={toggle}
          style={{ background: "transparent", color: "#525f7f", border: "1px solid #e9ecef", borderRadius: 8, padding: "7px 16px", fontSize: 13, cursor: "pointer" }}
        >
          Cerrar
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalUsoSuscripcion;

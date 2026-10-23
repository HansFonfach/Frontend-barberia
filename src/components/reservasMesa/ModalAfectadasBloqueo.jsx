import React, { useEffect, useState } from "react";
import { Button, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { Mail, MessageCircle } from "lucide-react";
import { useEmpresa } from "context/EmpresaContext";
import { postCancelarAfectadasBloqueoMesa } from "api/reservasMesa";
import { capitalizar, fechaLarga, mensajeError, whatsappLink } from "utils/reservasMesa";

/** Mensaje sugerido para avisar a los clientes, según el tipo de bloqueo. */
const mensajeSugerido = (bloqueo) => {
  if (!bloqueo) return "";
  if (bloqueo.tipo === "orden_llegada") {
    return `${bloqueo.motivo ? `${bloqueo.motivo}: ese` : "Ese"} día atenderemos solo por orden de llegada, sin reservas. ¡Igual te esperamos!`;
  }
  return `Lamentablemente ese día no podremos recibir tu reserva${bloqueo.motivo ? ` (${bloqueo.motivo})` : ""}. Disculpa las molestias.`;
};

/**
 * Reservas que ya estaban tomadas cuando se creó un bloqueo. El local decide:
 * mantenerlas (no se hace nada) o cancelar las elegidas avisando al cliente
 * por correo (automático) y por WhatsApp (botón por cliente).
 */
const ModalAfectadasBloqueo = ({ isOpen, toggle, bloqueo, afectadas = [], onCambio }) => {
  const { empresa } = useEmpresa();
  const [elegidas, setElegidas] = useState(() => new Set());
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setElegidas(new Set());
    setMensaje(mensajeSugerido(bloqueo));
    setError("");
    setResultado(null);
  }, [isOpen, bloqueo]);

  const dia = bloqueo ? capitalizar(fechaLarga(bloqueo.fecha)) : "";
  const todas = afectadas.length > 0 && elegidas.size === afectadas.length;

  const alternar = (id) =>
    setElegidas((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const textoWhatsapp = (r) =>
    `Hola ${r.cliente.nombre}, te escribimos de ${empresa?.nombre || "el local"} por tu reserva del ${fechaLarga(
      bloqueo.fecha,
    )} a las ${r.hora}. Tuvimos que cancelarla. ${mensaje}`;

  const cancelar = async () => {
    setEnviando(true);
    setError("");
    try {
      const { data } = await postCancelarAfectadasBloqueoMesa(bloqueo._id, { ids: [...elegidas], mensaje });
      setResultado(data);
      onCambio?.();
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" scrollable>
      <ModalHeader toggle={toggle}>Reservas tomadas · {dia}</ModalHeader>
      <ModalBody>
        {resultado ? (
          <>
            <div className="alert alert-success">
              {resultado.canceladas.length} reserva(s) cancelada(s).
              {resultado.canceladas.some((r) => r.correoEnviado) && " A quienes dejaron correo les llegó el aviso."}
            </div>
            {resultado.canceladas.map((r) => (
              <div key={r._id} className="d-flex flex-wrap justify-content-between align-items-center border-bottom py-2" style={{ gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <strong>{r.cliente.nombre}</strong>
                  <div className="small text-muted">
                    {r.hora} · {r.personas} pers. · {r.cliente.telefono}
                    {r.correoEnviado && (
                      <span className="ml-2 text-success">
                        <Mail size={12} style={{ verticalAlign: "-1px" }} /> correo enviado
                      </span>
                    )}
                  </div>
                </div>
                {r.cliente.telefono && (
                  <a
                    className="btn btn-sm btn-success m-0"
                    href={whatsappLink(r.cliente.telefono, textoWhatsapp(r))}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle size={14} style={{ verticalAlign: "-2px" }} /> Avisar por WhatsApp
                  </a>
                )}
              </div>
            ))}
            {resultado.fallidas.length > 0 && (
              <div className="alert alert-warning mt-3 mb-0">
                No se pudieron cancelar: {resultado.fallidas.map((f) => `${f.nombre} (${f.mensaje})`).join(", ")}
              </div>
            )}
            {resultado.noEncontradas > 0 && (
              <p className="small text-muted mt-2 mb-0">
                {resultado.noEncontradas} ya no estaban dentro del bloqueo (alguien las cambió o canceló antes).
              </p>
            )}
          </>
        ) : afectadas.length === 0 ? (
          <p className="text-muted mb-0">No quedan reservas tomadas dentro de este bloqueo.</p>
        ) : (
          <>
            <p className="mb-3">
              Estas reservas se tomaron antes del bloqueo y <strong>siguen vigentes</strong>. Puedes mantenerlas o
              cancelar las que elijas avisando al cliente.
            </p>
            <div className="custom-control custom-checkbox mb-2">
              <input
                id="af-todas"
                type="checkbox"
                className="custom-control-input"
                checked={todas}
                onChange={() => setElegidas(todas ? new Set() : new Set(afectadas.map((r) => r._id)))}
              />
              <label className="custom-control-label font-weight-bold" htmlFor="af-todas">
                Elegir todas ({afectadas.length})
              </label>
            </div>
            {afectadas.map((r) => (
              <div key={r._id} className="custom-control custom-checkbox border-bottom py-2">
                <input
                  id={`af-${r._id}`}
                  type="checkbox"
                  className="custom-control-input"
                  checked={elegidas.has(r._id)}
                  onChange={() => alternar(r._id)}
                />
                <label className="custom-control-label w-100" htmlFor={`af-${r._id}`}>
                  <strong>
                    {r.hora} · {r.cliente.nombre}
                  </strong>
                  <div className="small text-muted">
                    {r.personas} pers. · {r.sector?.nombre} · {r.cliente.telefono}
                    {!r.cliente.tieneCorreo && " · sin correo (avisar por WhatsApp)"}
                  </div>
                </label>
              </div>
            ))}
            {elegidas.size > 0 && (
              <div className="mt-3">
                <Label for="af-mensaje">Mensaje para el cliente</Label>
                <Input
                  id="af-mensaje"
                  type="textarea"
                  rows="3"
                  maxLength={500}
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                />
                <small className="text-muted">Va en el correo y en el WhatsApp que puedes enviar después.</small>
              </div>
            )}
            {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
          </>
        )}
      </ModalBody>
      <ModalFooter>
        {resultado || afectadas.length === 0 ? (
          <Button color="primary" onClick={toggle}>
            Listo
          </Button>
        ) : (
          <>
            <Button color="secondary" outline onClick={toggle} disabled={enviando}>
              Mantener todas
            </Button>
            <Button color="danger" onClick={cancelar} disabled={enviando || elegidas.size === 0 || !mensaje.trim()}>
              {enviando ? "Cancelando..." : `Cancelar ${elegidas.size || ""} y avisar`}
            </Button>
          </>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default ModalAfectadasBloqueo;

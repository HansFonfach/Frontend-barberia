import React, { useCallback, useEffect, useRef, useState } from "react";
import { Badge, Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "reactstrap";
import Swal from "sweetalert2";
import BadgeEstadoReservaMesa from "./BadgeEstadoReservaMesa";
import ModalCancelarReservaMesa from "./ModalCancelarReservaMesa";
import { getReservaMesa, patchEstadoReservaMesa } from "api/reservasMesa";
import {
  ACCIONES_RAPIDAS,
  ESTADOS_CANCELABLES,
  ESTADOS_EDITABLES,
  ETIQUETA_ORIGEN,
  MOTIVOS_CANCELACION_MESA,
  fechaHora,
  fechaLarga,
  mensajeError,
  telLink,
} from "utils/reservasMesa";

const ETIQUETA_ACCION = {
  creada: "Creada",
  editada: "Editada",
  estado: "Cambio de estado",
  sobrecupo: "Sobrecupo",
};

const ETIQUETA_CAMPO = {
  nombre: "Nombre",
  telefono: "Teléfono",
  email: "Correo",
  fecha: "Fecha",
  hora: "Hora",
  personas: "Personas",
  sector: "Sector",
  cumpleanos: "Cumpleaños",
  comentarios: "Comentarios",
  origen: "Origen",
  estado: "Estado",
  motivo: "Motivo",
};

const Fila = ({ label, children }) => (
  <div className="d-flex border-bottom py-2" style={{ gap: 12 }}>
    <span className="text-muted" style={{ width: 120, flexShrink: 0 }}>
      {label}
    </span>
    <span style={{ wordBreak: "break-word" }}>{children}</span>
  </div>
);

/** Detalle de una reserva: datos, acciones e historial completo. */
const DetalleReservaMesa = ({ reservaId, isOpen, toggle, onCambio, onEditar, puedeCancelar }) => {
  const [reserva, setReserva] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  // toggle en un ref: así un re-render del padre no vuelve a pedir la reserva
  const toggleRef = useRef(toggle);
  toggleRef.current = toggle;

  const cargar = useCallback(async () => {
    if (!reservaId) return;
    setCargando(true);
    try {
      const { data } = await getReservaMesa(reservaId);
      setReserva(data);
    } catch (e) {
      Swal.fire("Error", mensajeError(e), "error");
      toggleRef.current();
    } finally {
      setCargando(false);
    }
  }, [reservaId]);

  useEffect(() => {
    if (isOpen) cargar();
    else setReserva(null);
  }, [isOpen, cargar]);

  const cambiar = async (cuerpo) => {
    setOcupado(true);
    try {
      const { data } = await patchEstadoReservaMesa(reserva._id, cuerpo);
      setReserva(data);
      onCambio?.();
      return true;
    } catch (e) {
      Swal.fire("No se pudo", mensajeError(e), "error");
      return false;
    } finally {
      setOcupado(false);
    }
  };

  const accionRapida = async (a) => {
    let detalle = "";
    if (a.pideMotivo) {
      const r = await Swal.fire({
        title: "¿Por qué se corrige?",
        input: "text",
        inputPlaceholder: "Ej: llegó tarde",
        showCancelButton: true,
        inputValidator: (v) => (!v?.trim() ? "Escribe un motivo" : undefined),
      });
      if (!r.isConfirmed) return;
      detalle = r.value;
    }
    await cambiar({ estado: a.hacia, detalle });
  };

  const motivoCancelacion = (m) => MOTIVOS_CANCELACION_MESA.find((x) => x.value === m)?.label || m;

  return (
    <>
      <Modal isOpen={isOpen} toggle={toggle} size="lg" scrollable>
        <ModalHeader toggle={toggle}>
          Reserva {reserva ? `#${reserva.codigo}` : ""}
        </ModalHeader>
        <ModalBody>
          {cargando || !reserva ? (
            <div className="text-center py-4">
              <Spinner />
            </div>
          ) : (
            <>
              <div className="d-flex flex-wrap align-items-center mb-3" style={{ gap: 8 }}>
                <BadgeEstadoReservaMesa estado={reserva.estado} />
                {reserva.sobrecupo && <Badge color="danger" pill>Sobrecupo</Badge>}
                {reserva.cumpleanos?.es && <Badge color="info" pill>Cumpleaños</Badge>}
              </div>

              <Fila label="Cliente">{reserva.cliente.nombre}</Fila>
              <Fila label="Teléfono">
                <a href={telLink(reserva.cliente.telefono)}>{reserva.cliente.telefono}</a>
              </Fila>
              {reserva.cliente.email && <Fila label="Correo">{reserva.cliente.email}</Fila>}
              <Fila label="Llegada">
                {fechaLarga(reserva.fecha)} · {reserva.hora}
              </Fila>
              <Fila label="Personas">{reserva.personas}</Fila>
              <Fila label="Sector">{reserva.sector.nombre}</Fila>
              <Fila label="Origen">{ETIQUETA_ORIGEN[reserva.origen] || reserva.origen}</Fila>
              {reserva.cumpleanos?.es && (
                <Fila label="Cumpleaños">
                  {reserva.cumpleanos.festejado || "Sí"}
                  {reserva.cumpleanos.detalle ? ` · ${reserva.cumpleanos.detalle}` : ""}
                </Fila>
              )}
              {reserva.comentarios && <Fila label="Comentarios">{reserva.comentarios}</Fila>}
              {reserva.estado === "cancelada" && (
                <Fila label="Cancelación">
                  {motivoCancelacion(reserva.cancelacion?.motivo)} · por{" "}
                  {reserva.cancelacion?.por === "cliente" ? "el cliente" : "el local"}
                  {reserva.cancelacion?.detalle ? ` · ${reserva.cancelacion.detalle}` : ""}
                </Fila>
              )}

              <div className="d-flex flex-wrap mt-3" style={{ gap: 6 }}>
                {(ACCIONES_RAPIDAS[reserva.estado] || []).map((a) => (
                  <Button key={a.hacia} size="sm" color={a.color} className="m-0" disabled={ocupado} onClick={() => accionRapida(a)}>
                    {a.label}
                  </Button>
                ))}
                {ESTADOS_EDITABLES.includes(reserva.estado) && (
                  <Button size="sm" outline color="primary" className="m-0" disabled={ocupado} onClick={() => onEditar(reserva)}>
                    Editar
                  </Button>
                )}
                {ESTADOS_CANCELABLES.includes(reserva.estado) && puedeCancelar && (
                  <Button size="sm" outline color="danger" className="m-0" disabled={ocupado} onClick={() => setCancelando(true)}>
                    Cancelar reserva
                  </Button>
                )}
              </div>

              <h5 className="mt-4 mb-2">Historial</h5>
              <div className="small">
                {[...(reserva.historial || [])].reverse().map((h, i) => (
                  <div key={i} className="border-left pl-3 pb-2 mb-2" style={{ borderLeftWidth: 2 }}>
                    <div>
                      <strong>{ETIQUETA_ACCION[h.accion] || h.accion}</strong>
                      <span className="text-muted"> · {fechaHora(h.fecha)} · {h.nombreUsuario}</span>
                    </div>
                    {h.detalle && <div>{h.detalle}</div>}
                    {h.accion === "editada" && h.cambios && (
                      <ul className="mb-0 pl-3">
                        {Object.entries(h.cambios).map(([campo, [antes, despues]]) => (
                          <li key={campo}>
                            {ETIQUETA_CAMPO[campo] || campo}: <s className="text-muted">{String(antes ?? "—")}</s>{" "}
                            → {String(despues ?? "—")}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={toggle}>
            Cerrar
          </Button>
        </ModalFooter>
      </Modal>

      <ModalCancelarReservaMesa
        isOpen={cancelando}
        toggle={() => setCancelando(false)}
        reserva={reserva}
        onConfirmar={async ({ motivo, detalle, por }) => {
          const ok = await cambiar({ estado: "cancelada", motivo, detalle, por });
          if (ok) setCancelando(false);
        }}
      />
    </>
  );
};

export default DetalleReservaMesa;

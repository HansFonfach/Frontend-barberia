// components/ingresos/ModalDetalleExtras.jsx
//
// Desglose de "Ingreso Extras" de un mes: qué extras se cobraron (agrupados
// por nombre) y en qué reservas. Se abre desde la tarjeta "Ingreso del mes"
// del inicio y desde "Extras" en el Historial de Ingresos.
import React, { useEffect, useState } from "react";
import { Modal, ModalBody } from "reactstrap";
import { getDetalleExtras } from "api/estadisticas";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const pesos = (v) => `$${Number(v || 0).toLocaleString("es-CL")}`;

const fechaCorta = (f) =>
  new Date(f).toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" });

const hora = (f) => new Date(f).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false });

const ModalDetalleExtras = ({ isOpen, toggle, mes, anio }) => {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [vista, setVista] = useState("tipo");

  useEffect(() => {
    if (!isOpen) return;
    let vigente = true;
    setCargando(true);
    setError("");
    getDetalleExtras(mes, anio)
      .then((res) => vigente && setDatos(res.data?.data || null))
      .catch(() => vigente && setError("No se pudo cargar el detalle. Intenta de nuevo."))
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [isOpen, mes, anio]);

  const titulo = datos ? `${MESES[datos.mes]} ${datos.anio}` : mes !== undefined ? `${MESES[mes]} ${anio}` : "este mes";
  const mayor = Math.max(...(datos?.porNombre || []).map((x) => x.total), 1);

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered scrollable size="lg" contentClassName="mde">
      <style>{CSS}</style>
      <div className="mde-cab">
        <div>
          <span className="mde-eyebrow">💰 Ingreso extras</span>
          <h4>Detalle de {titulo}</h4>
        </div>
        <button type="button" className="mde-x" onClick={toggle} aria-label="Cerrar">
          ×
        </button>
      </div>

      <ModalBody className="mde-cuerpo">
        {cargando && <p className="mde-vacio">Cargando…</p>}
        {!cargando && error && <p className="mde-vacio">{error}</p>}

        {!cargando && !error && datos && (
          <>
            <div className="mde-resumen">
              <div>
                <span>Total extras</span>
                <strong>{pesos(datos.total)}</strong>
              </div>
              <div>
                <span>Reservas con extras</span>
                <strong>{datos.reservas}</strong>
              </div>
              <div>
                <span>Tipos de extra</span>
                <strong>{datos.porNombre.length}</strong>
              </div>
            </div>

            {datos.reservas === 0 ? (
              <p className="mde-vacio">No hubo extras cobrados en este período.</p>
            ) : (
              <>
                <div className="mde-tabs" role="tablist">
                  <button type="button" className={vista === "tipo" ? "activo" : ""} onClick={() => setVista("tipo")}>
                    Por tipo de extra
                  </button>
                  <button type="button" className={vista === "reserva" ? "activo" : ""} onClick={() => setVista("reserva")}>
                    Por reserva
                  </button>
                </div>

                {vista === "tipo" ? (
                  <ul className="mde-lista">
                    {datos.porNombre.map((x) => (
                      <li key={x.nombre} className="mde-tipo">
                        <div className="mde-fila">
                          <b>{x.nombre}</b>
                          <strong>{pesos(x.total)}</strong>
                        </div>
                        <div className="mde-barra">
                          <div style={{ width: `${Math.max((x.total / mayor) * 100, 2)}%` }} />
                        </div>
                        <small>
                          {x.veces} {x.veces === 1 ? "vez" : "veces"}
                          {datos.total > 0 && ` · ${Math.round((x.total / datos.total) * 100)}% de los extras`}
                        </small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="mde-lista">
                    {datos.detalle.map((r) => (
                      <li key={r.reservaId} className="mde-reserva">
                        <div className="mde-fila">
                          <div>
                            <b>{r.cliente}</b>
                            <small>
                              {fechaCorta(r.fecha)} · {hora(r.fecha)}
                              {r.servicio && ` · ${r.servicio}`}
                              {r.profesional && ` · ${r.profesional}`}
                            </small>
                          </div>
                          <strong>{pesos(r.total)}</strong>
                        </div>
                        <div className="mde-items">
                          {r.items.map((i, k) => (
                            <span key={k}>
                              {i.nombre}
                              {i.cantidad > 1 ? ` ×${i.cantidad}` : ""} · {pesos(i.subtotal)}
                            </span>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </>
        )}
      </ModalBody>
    </Modal>
  );
};

const CSS = `
.mde{border:0;border-radius:18px;overflow:hidden}
.mde-cab{display:flex;justify-content:space-between;align-items:flex-start;padding:22px 24px 6px}
.mde-eyebrow{font-size:12px;font-weight:700;color:#d97706;text-transform:uppercase;letter-spacing:.06em}
.mde-cab h4{margin:4px 0 0;font-weight:700;color:#1e293b}
.mde-x{border:0;background:#f1f5f9;color:#64748b;width:34px;height:34px;border-radius:50%;font-size:22px;line-height:1;cursor:pointer}
.mde-cuerpo{padding:14px 24px 24px}
.mde-vacio{color:#94a3b8;text-align:center;padding:24px 0;margin:0}
.mde-resumen{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px}
.mde-resumen div{background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:12px 14px;display:flex;flex-direction:column;min-width:0}
.mde-resumen span{font-size:11.5px;color:#92400e;font-weight:600}
.mde-resumen strong{font-size:20px;color:#1e293b;font-weight:700;margin-top:2px}
.mde-tabs{display:inline-flex;background:#f1f5f9;border-radius:10px;padding:3px;margin-bottom:10px}
.mde-tabs button{border:0;background:transparent;padding:7px 14px;border-radius:8px;font-size:13px;font-weight:600;color:#64748b;cursor:pointer}
.mde-tabs button.activo{background:#fff;color:#1e293b;box-shadow:0 1px 3px rgba(15,23,42,.12)}
.mde-lista{list-style:none;margin:0;padding:0}
.mde-lista li{padding:13px 0;border-bottom:1px solid #f1f5f9}
.mde-lista li:last-child{border-bottom:0}
.mde-fila{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
.mde-fila b{font-weight:600;color:#1e293b}
.mde-fila strong{color:#1e293b;font-weight:700;white-space:nowrap}
.mde-fila > div{display:flex;flex-direction:column;min-width:0}
.mde-lista small{color:#94a3b8;font-size:12px}
.mde-barra{height:6px;background:#f1f5f9;border-radius:99px;margin:8px 0 6px;overflow:hidden}
.mde-barra div{height:100%;background:#f59e0b;border-radius:99px}
.mde-items{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.mde-items span{font-size:12px;background:#fffbeb;color:#92400e;border-radius:99px;padding:3px 10px}
@media (max-width:576px){
  .mde-cab{padding:18px 18px 4px}
  .mde-cuerpo{padding:12px 18px 20px}
  .mde-resumen{grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
  .mde-resumen div{padding:10px}
  .mde-resumen strong{font-size:16px}
}
`;

export default ModalDetalleExtras;

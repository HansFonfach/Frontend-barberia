import React from "react";

/**
 * Grilla para elegir hora de llegada + sector. La usan el formulario del
 * panel (con cupos visibles) y la página pública (solo lo disponible).
 *
 * horas: [{ hora, sectores: [{ id, nombre, libre?, disponible, bloqueado?, motivoBloqueo? }] }]
 */
const SelectorHoraSector = ({
  horas = [],
  valor = {},
  onChange,
  mostrarCupos = false,
  colorPrimario = "#5e72e4",
}) => {
  if (!horas.length) return null;

  return (
    <div style={{ maxHeight: 320, overflowY: "auto" }} className="border rounded">
      {horas.map((h) => (
        <div
          key={h.hora}
          className="d-flex align-items-center border-bottom px-2 py-2"
          style={{ gap: 10 }}
        >
          <strong style={{ width: 52, flexShrink: 0 }}>{h.hora}</strong>
          <div className="d-flex flex-wrap" style={{ gap: 6 }}>
            {h.sectores.map((s) => {
              const elegido = valor.hora === h.hora && String(valor.sectorId) === String(s.id);
              const deshabilitado = !s.disponible && !elegido;
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={deshabilitado}
                  onClick={() => onChange({ hora: h.hora, sectorId: s.id })}
                  title={s.bloqueado ? s.motivoBloqueo || "Bloqueado" : undefined}
                  style={{
                    border: `1px solid ${elegido ? colorPrimario : "#dee2e6"}`,
                    background: elegido ? colorPrimario : deshabilitado ? "#f6f9fc" : "#fff",
                    color: elegido ? "#fff" : deshabilitado ? "#adb5bd" : "#32325d",
                    borderRadius: 8,
                    padding: "6px 10px",
                    fontSize: 13,
                    lineHeight: 1.2,
                    cursor: deshabilitado ? "not-allowed" : "pointer",
                    textDecoration: s.bloqueado ? "line-through" : "none",
                  }}
                >
                  {s.nombre}
                  {mostrarCupos && !s.bloqueado && (
                    <span style={{ opacity: 0.8, marginLeft: 6, fontSize: 11 }}>
                      {s.libre}/{s.capacidad} libres
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SelectorHoraSector;

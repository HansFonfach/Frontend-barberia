import React from "react";

/**
 * La giftcard "física": se usa en la vista previa de la página Regalar, en
 * el link que recibe el regalado y en el panel del admin.
 */

export const clp = (n) => `$${Math.round(Number(n) || 0).toLocaleString("es-CL")}`;

export const fechaGiftcard = (d) =>
  d
    ? new Date(d).toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "America/Santiago",
      })
    : "";

const SELLOS = {
  usada: "Usada",
  vencida: "Vencida",
  anulada: "Anulada",
  pendiente: "Por aprobar",
  rechazada: "Rechazada",
};

const TarjetaGiftcard = ({
  nombreNegocio,
  logo,
  color = "#1a1a2e",
  colorOscuro,
  valor,
  detalleValor,
  para,
  de,
  mensaje,
  codigo,
  venceEn,
  estado,
  vistaPrevia = false,
}) => {
  const oscuro = colorOscuro || color;
  const sello = SELLOS[estado];

  return (
    <div
      className="tarjeta-giftcard"
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 460,
        margin: "0 auto",
        borderRadius: 22,
        padding: "22px 22px 18px",
        color: "#fff",
        background: `linear-gradient(135deg, ${color} 0%, ${oscuro} 100%)`,
        boxShadow: "0 18px 40px -18px rgba(0,0,0,.55)",
        overflow: "hidden",
        fontFamily: "inherit",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    >
      {/* brillos decorativos */}
      <div style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", right: -70, top: -90, background: "rgba(255,255,255,.12)" }} />
      <div style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", left: -60, bottom: -80, background: "rgba(255,255,255,.08)" }} />

      <div style={{ position: "relative" }}>
        <div className="d-flex align-items-center justify-content-between" style={{ gap: 10 }}>
          <div className="d-flex align-items-center" style={{ gap: 10, minWidth: 0 }}>
            {logo && (
              <img
                src={logo}
                alt=""
                style={{ width: 38, height: 38, borderRadius: 10, objectFit: "cover", background: "#fff", flexShrink: 0 }}
              />
            )}
            <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {nombreNegocio}
            </div>
          </div>
          {sello ? (
            <div
              style={{
                flexShrink: 0, background: "rgba(0,0,0,.45)", borderRadius: 99, padding: "3px 12px",
                fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase",
              }}
            >
              {sello}
            </div>
          ) : (
            <div style={{ fontSize: 11, letterSpacing: ".28em", fontWeight: 700, opacity: 0.85, flexShrink: 0 }}>GIFTCARD</div>
          )}
        </div>

        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.15, wordBreak: "break-word" }}>
            {valor || (vistaPrevia ? "Elige qué regalar" : "")}
          </div>
          {detalleValor && <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>{detalleValor}</div>}
        </div>

        <div style={{ marginTop: 14, fontSize: 14, lineHeight: 1.5 }}>
          <div>
            <span style={{ opacity: 0.75 }}>Para </span>
            <strong>{para || (vistaPrevia ? "…" : "")}</strong>
          </div>
          {(de || vistaPrevia) && (
            <div>
              <span style={{ opacity: 0.75 }}>De </span>
              <strong>{de || "…"}</strong>
            </div>
          )}
        </div>

        {mensaje && (
          <div style={{ marginTop: 10, fontSize: 14, fontStyle: "italic", opacity: 0.95, wordBreak: "break-word" }}>“{mensaje}”</div>
        )}

        <div
          style={{
            marginTop: 18,
            borderRadius: 12,
            padding: "10px 12px",
            background: "rgba(255,255,255,.16)",
            border: "1px dashed rgba(255,255,255,.45)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 10, letterSpacing: ".2em", opacity: 0.8 }}>CÓDIGO</div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: ".12em", fontFamily: "ui-monospace, Menlo, Consolas, monospace" }}>
            {codigo || "GC-••••-••••"}
          </div>
        </div>
        {venceEn && (
          <div style={{ fontSize: 11, opacity: 0.8, marginTop: 8, textAlign: "center" }}>Válida hasta el {fechaGiftcard(venceEn)}</div>
        )}
      </div>

    </div>
  );
};

export default TarjetaGiftcard;

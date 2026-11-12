import React from "react";
import { Container } from "reactstrap";

/**
 * Franja "Regala un servicio" de la página del negocio. Solo aparece si el
 * negocio activó las giftcards (Servicios → Giftcards → Ajustes).
 */
const GiftcardBanner = ({ theme, nombreNegocio, onRegalar }) => (
  <section style={{ padding: "2.5rem 0", backgroundColor: "#FFFFFF" }}>
    <Container>
      <div
        className="d-flex flex-column flex-md-row align-items-md-center justify-content-between"
        style={{
          gap: 18,
          borderRadius: 22,
          padding: "26px 28px",
          color: "#fff",
          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark || theme.primary} 100%)`,
          boxShadow: "0 18px 40px -22px rgba(0,0,0,.55)",
        }}
      >
        <div className="d-flex align-items-center" style={{ gap: 16 }}>
          <div style={{ fontSize: 42, lineHeight: 1 }}>🎁</div>
          <div>
            <h3 style={{ color: "#fff", fontWeight: 800, margin: 0, fontSize: "1.45rem" }}>Regala {nombreNegocio}</h3>
            <p style={{ margin: "4px 0 0", opacity: 0.9 }}>
              Giftcard de un servicio o del monto que quieras, lista para enviar por correo o WhatsApp.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRegalar}
          className="btn"
          style={{ background: "#fff", color: theme.primary, fontWeight: 700, borderRadius: 12, padding: "10px 22px", whiteSpace: "nowrap" }}
        >
          Regalar una giftcard
        </button>
      </div>
    </Container>
  </section>
);

export default GiftcardBanner;

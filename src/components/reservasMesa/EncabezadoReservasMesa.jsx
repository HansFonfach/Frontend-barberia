import React, { useEffect } from "react";
import { Container } from "reactstrap";
import { useEmpresa } from "context/EmpresaContext";
import { cargarFuentesRestaurante, marcaDe } from "utils/marcasRestaurante";

/**
 * Encabezado de las pantallas de reservas de mesa (reemplaza al de
 * barbería). Con identidad de marca usa su logo, su madera y sus colores;
 * sin ella, un degradado sobrio. Deja el espacio inferior que usan las
 * páginas con "mt--7" para montar su primera tarjeta encima.
 */
const EncabezadoReservasMesa = ({ titulo, subtitulo, children }) => {
  const { empresa } = useEmpresa();
  const marca = marcaDe(empresa);

  useEffect(() => {
    if (marca) cargarFuentesRestaurante();
  }, [marca]);

  const fondo = marca
    ? `linear-gradient(120deg, rgba(17,13,10,0.92) 0%, rgba(17,13,10,0.72) 55%, rgba(17,13,10,0.55) 100%), url(${marca.fondoHero}) center/cover`
    : "linear-gradient(120deg, #1f1a17 0%, #2d241d 100%)";
  const acento = marca?.colores?.acentoClaro || "#e8c591";
  const logo = marca?.logo || empresa?.logo;

  return (
    <div className="header pb-8 pt-5 pt-md-7" style={{ background: fondo }}>
      <Container fluid>
        <div className="d-flex align-items-center flex-wrap" style={{ gap: 18 }}>
          {logo && (
            <img
              src={logo}
              alt={empresa?.nombre || ""}
              style={{
                width: 64,
                height: 56,
                objectFit: "cover",
                borderRadius: 14,
                boxShadow: "0 10px 30px -10px rgba(0,0,0,0.8)",
                border: "1px solid rgba(232,197,145,0.25)",
              }}
            />
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                color: acento,
                fontSize: "0.72rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
              }}
            >
              {empresa?.nombre || "Reservas"}
            </div>
            <h1
              className="text-white mb-0"
              style={{
                fontFamily: marca ? "'Cormorant Garamond', Georgia, serif" : undefined,
                fontSize: marca ? "2.3rem" : "1.9rem",
                fontWeight: 600,
                lineHeight: 1.15,
              }}
            >
              {titulo}
            </h1>
            {subtitulo && (
              <div style={{ color: "rgba(255,255,255,0.72)", fontSize: "0.95rem" }} className="mt-1">
                {subtitulo}
              </div>
            )}
          </div>
          {children && <div className="d-flex flex-wrap" style={{ gap: 8 }}>{children}</div>}
        </div>
      </Container>
    </div>
  );
};

export default EncabezadoReservasMesa;

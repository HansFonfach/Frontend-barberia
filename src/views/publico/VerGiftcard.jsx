import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Container, Spinner } from "reactstrap";
import { useEmpresa } from "context/EmpresaContext";
import { obtenerTemaEmpresa, estiloBotonTema } from "utils/temaEmpresa";
import { getGiftcardPublica } from "api/giftcards";
import TarjetaGiftcard, { clp, fechaGiftcard } from "components/giftcards/TarjetaGiftcard";
import { useSeo } from "utils/seo";

/**
 * Link que recibe el regalado: muestra la giftcard, el saldo y cómo usarla.
 * Se puede imprimir o compartir por WhatsApp.
 */
const VerGiftcard = () => {
  const { slug, codigo } = useParams();
  const { empresa } = useEmpresa();
  const theme = obtenerTemaEmpresa(empresa, slug);
  // El link lleva el código: que Google no lo indexe nunca
  useSeo({ titulo: `Giftcard${empresa?.nombre ? ` · ${empresa.nombre}` : ""}`, noIndexar: true });
  const [gc, setGc] = useState(null);
  const [estado, setEstado] = useState("cargando"); // cargando | listo | noExiste
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    let vigente = true;
    getGiftcardPublica(slug, codigo)
      .then(({ data }) => {
        if (!vigente) return;
        setGc(data);
        setEstado("listo");
      })
      .catch(() => vigente && setEstado("noExiste"));
    return () => {
      vigente = false;
    };
  }, [slug, codigo]);

  const nombreNegocio = empresa?.nombre || "";
  const usable = gc?.estado === "activa";
  const link = typeof window !== "undefined" ? window.location.href : "";

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(gc.codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      /* sin portapapeles */
    }
  };

  const textoWhatsapp = encodeURIComponent(`🎁 Te regalé una giftcard de ${nombreNegocio}: ${link}`);
  const detalle =
    gc?.tipo === "monto" && gc.saldo !== gc.monto && usable
      ? `Saldo disponible: ${clp(gc.saldo)} de ${clp(gc.monto)}`
      : gc?.tipo === "servicio"
        ? "Servicio de regalo"
        : "";

  return (
    <div style={{ minHeight: "100vh", background: theme.softBg || "#f6f7f9" }} className="py-4 py-md-5">
      <style>{`
        @media print {
          .no-imprimir { display: none !important; }
          body { background: #fff !important; }
        }
      `}</style>
      <Container style={{ maxWidth: 560 }}>
        <div className="no-imprimir mb-4">
          <Link to={`/${slug}`} className="text-muted small">← {nombreNegocio || "Volver"}</Link>
        </div>

        {estado === "cargando" && (
          <div className="text-center py-5">
            <Spinner style={{ color: theme.primary }} />
          </div>
        )}

        {estado === "noExiste" && (
          <div className="bg-white rounded shadow-sm p-4 text-center">
            <div style={{ fontSize: 44 }}>🎁</div>
            <h1 className="h4">No encontramos esta giftcard</h1>
            <p className="text-muted mb-0">Revisa que el link esté completo o pregúntale a quien te la regaló.</p>
          </div>
        )}

        {estado === "listo" && gc && (
          <>
            {usable && (
              <h1 className="text-center mb-4" style={{ fontWeight: 800, fontSize: "1.7rem", color: theme.textDark }}>
                {gc.para ? `¡${gc.para}, te hicieron un regalo! 🎉` : "¡Te hicieron un regalo! 🎉"}
              </h1>
            )}

            <TarjetaGiftcard
              nombreNegocio={nombreNegocio}
              logo={empresa?.logo}
              color={theme.primary}
              colorOscuro={theme.primaryDark}
              valor={gc.tipo === "servicio" ? gc.servicioNombre : clp(gc.monto)}
              detalleValor={detalle}
              para={gc.para}
              de={gc.de}
              mensaje={gc.mensaje}
              codigo={gc.codigo}
              venceEn={gc.venceEn}
              estado={gc.estado}
            />

            {usable ? (
              <div className="bg-white rounded shadow-sm p-4 mt-4">
                <h2 className="h6 mb-3" style={{ fontWeight: 700 }}>¿Cómo la uso?</h2>
                <ol className="pl-3 mb-3 text-muted" style={{ fontSize: 14 }}>
                  <li>Toca “Reservar mi hora” y elige día y hora.</li>
                  <li>Al confirmar, el código ya va escrito en “Código promocional” (si no, pégalo).</li>
                  <li>{gc.tipo === "servicio" ? "El servicio queda pagado." : "Se descuenta del saldo de la giftcard."}</li>
                </ol>
                <div className="no-imprimir d-flex flex-column" style={{ gap: 8 }}>
                  <Link
                    to={`/${slug}/reservar?giftcard=${encodeURIComponent(gc.codigo)}`}
                    className="btn btn-block"
                    style={{ ...estiloBotonTema(theme, true), borderRadius: 12, padding: "10px 0" }}
                  >
                    Reservar mi hora
                  </Link>
                  <div className="d-flex" style={{ gap: 8 }}>
                    <button type="button" className="btn btn-outline-secondary flex-fill" onClick={copiar}>
                      {copiado ? "¡Copiado!" : "Copiar código"}
                    </button>
                    <a
                      className="btn btn-outline-success flex-fill"
                      href={`https://wa.me/?text=${textoWhatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Compartir
                    </a>
                    <button type="button" className="btn btn-outline-secondary flex-fill" onClick={() => window.print()}>
                      Imprimir
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded shadow-sm p-4 mt-4 text-center text-muted">
                {gc.estado === "usada" && "Esta giftcard ya fue usada. ¡Esperamos que la hayas disfrutado!"}
                {gc.estado === "vencida" && `Esta giftcard venció el ${fechaGiftcard(gc.venceEn)}.`}
                {gc.estado === "anulada" && "Esta giftcard fue anulada por el local."}
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
};

export default VerGiftcard;

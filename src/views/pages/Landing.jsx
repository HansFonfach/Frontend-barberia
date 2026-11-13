import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "reactstrap";

import { useEmpresa } from "context/EmpresaContext";
import { useLandingData } from "hooks/useLandingData";
import { seoNegocio, useSeo } from "utils/seo";

import LandingGimnasio from "components/landing/LandingGimnasio";
import LandingRestaurante from "components/landing/LandingRestaurante";
import LandingNegocio from "components/landing/LandingNegocio";
import "@fortawesome/fontawesome-free/css/all.min.css";

import {
  obtenerTemaEmpresa,
  TEMAS_LEGACY_POR_SLUG,
} from "utils/temaEmpresa";

const Landing = () => {
  const navigate = useNavigate();
  const { slug } = useParams();

  const { empresa, loading } = useEmpresa();
  const {
    servicios,
    profesionales,
    clases,
    planes,
    loading: loadingLanding,
  } = useLandingData(slug);

  // Título, descripción y datos para Google de la página del negocio
  useSeo(seoNegocio(empresa, slug));

  // Usa los colores que el negocio haya configurado en
  // "Configuración → Colores" (empresa.colores). Si todavía no configuró
  // nada, cae al tema hecho a mano que tenía antes (o al default general).
  const theme = obtenerTemaEmpresa(empresa, slug, {
    temasLegacyPorSlug: TEMAS_LEGACY_POR_SLUG,
  });

  if (loading || loadingLanding) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div
            className="spinner-border mb-3"
            role="status"
            style={{ color: theme.primary }}
          >
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p style={{ color: theme.textMuted }}>Preparando todo para ti...</p>
        </div>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h2 className="mb-3" style={{ color: theme.textDark }}>
            Empresa no encontrada
          </h2>
          <p className="mb-4" style={{ color: theme.textMuted }}>
            Lo sentimos, no pudimos encontrar la empresa que buscas.
          </p>
          <Button
            style={{
              backgroundColor: theme.primary,
              border: "none",
              color: "white",
            }}
            onClick={() => navigate("/")}
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  // 🏋️ Los gimnasios tienen un landing propio (clases, planes, clase de
  // prueba gratis) en vez de reusar el de barbería/salón con parches.
  // 🍽️ Bares y restaurantes: landing propio centrado en reservar mesa
  if (empresa.rubro === "restaurante") {
    return <LandingRestaurante empresa={empresa} slug={slug} />;
  }

  if (empresa.rubro === "gimnasio") {
    return (
      <LandingGimnasio
        empresa={empresa}
        slug={slug}
        clases={clases}
        planes={planes}
        profesionales={profesionales}
      />
    );
  }

  // 💈 Barberías, salones y demás negocios de horas: página nueva con los
  // colores del negocio (estilo oscuro o claro, ver LandingNegocio.jsx)
  return (
    <LandingNegocio
      empresa={empresa}
      slug={slug}
      servicios={servicios}
      profesionales={profesionales}
      theme={theme}
      navigate={navigate}
    />
  );
};

export default Landing;

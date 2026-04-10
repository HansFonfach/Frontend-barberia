// hooks/useTheme.js
import { useEffect } from "react";

export function useTheme(colores = {}, configuracion = {}) {
  useEffect(() => {
    const root = document.documentElement;

    // Colores principales
    if (colores.primario)   root.style.setProperty("--color-primary",    colores.primario);
    if (colores.secundario) root.style.setProperty("--color-secondary",  colores.secundario);
    if (colores.fondo)      root.style.setProperty("--color-background", colores.fondo);
    if (colores.texto)      root.style.setProperty("--color-text",       colores.texto);
    if (colores.textoMuted) root.style.setProperty("--color-muted",      colores.textoMuted);

    // Argon usa clases específicas — las sobreescribes también
    if (colores.primario) {
      root.style.setProperty("--primary", colores.primario);
    }

    // Border radius global
    if (configuracion.borderRadius) {
      root.style.setProperty("--border-radius", configuracion.borderRadius);
    }

    // Fuente
    if (configuracion.fuente && configuracion.fuente !== "default") {
      root.style.setProperty("--font-family-base", configuracion.fuente);
    }
  }, [colores, configuracion]);
}
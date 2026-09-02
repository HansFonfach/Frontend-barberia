// src/components/ErrorBoundary.jsx
//
// Red de seguridad para toda la app: si un componente falla al renderizar
// (por el motivo que sea — un dato inesperado, una versión vieja del
// bundle hablando con un backend que ya cambió, etc.), React por defecto
// desmonta TODA la app y deja la pantalla en blanco, sin ningún mensaje.
// Con este componente, en vez de pantalla en blanco se muestra un aviso
// simple con un botón para recargar — así el usuario sabe que pasó algo y
// qué hacer, en vez de quedar pensando que el sistema "no funciona".
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hayError: false };
  }

  static getDerivedStateFromError() {
    return { hayError: true };
  }

  componentDidCatch(error, info) {
    // Queda en la consola para poder revisarlo si alguien manda captura de
    // pantalla del DevTools.
    console.error("💥 Error atrapado por ErrorBoundary:", error, info);
  }

  handleRecargar = () => {
    // Fuerza traer todo de nuevo (no de caché) por si el problema fue una
    // versión vieja del sitio guardada en el navegador.
    window.location.reload();
  };

  render() {
    if (this.state.hayError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "24px",
            fontFamily: "system-ui, -apple-system, sans-serif",
            background: "#f8faff",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>😕</div>
          <h4 style={{ color: "#1a1a2e", marginBottom: "8px" }}>
            Algo salió mal
          </h4>
          <p style={{ color: "#6c757d", maxWidth: "360px", marginBottom: "20px" }}>
            Ocurrió un error inesperado. Intenta recargar la página — si el
            problema sigue, avísale al negocio.
          </p>
          <button
            onClick={this.handleRecargar}
            style={{
              background: "linear-gradient(135deg, #4361ee, #f72585)",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "12px 24px",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

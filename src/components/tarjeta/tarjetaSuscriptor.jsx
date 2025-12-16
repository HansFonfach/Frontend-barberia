import "./tarjeta-suscriptor.css";

const TarjetaSuscriptor = ({ cliente, suscripcion }) => {
  // Calcular días restantes
  const hoy = new Date();
  const fechaFin = new Date(suscripcion.fechaFin);
  const diasRestantes = Math.ceil((fechaFin - hoy) / (1000 * 60 * 60 * 24));

  // Formatear fechas
  const formatoFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="tarjeta-suscriptor">
      {/* Encabezado con logo y marca */}
      <div className="encabezado">
        <div className="logo-container-tarjeta">
          <div className="logo-tarjeta">💀</div>
        </div>
        <div className="marca-container">
          <h1 className="marca">LA SANTA BARBERÍA</h1>
          <p className="slogan">Estilo & Tradición</p>
        </div>
      </div>

      {/* Badge de estado */}
      <div className="badge-container">
        <span className="badge-estado">MIEMBRO PREMIUM</span>
        <div className="badge-dias">
          <span className="dias-numero">{diasRestantes}</span>
          <span className="dias-texto">días restantes</span>
        </div>
      </div>

      {/* Información del cliente */}
      <div className="info-cliente">
        <div className="avatar-container">
          <div className="avatar-tarjeta">{cliente.nombre.charAt(0).toUpperCase()}</div>
        </div>
        <div className="datos-cliente">
          <h2 className="nombre-cliente">{cliente.nombre}</h2>
          <p className="tipo-suscripcion">Suscripción Mensual</p>
          <div className="calificacion">
            <div className="estrellas">★★★★★</div>
            <span className="calificacion-texto">Cliente 5 estrellas</span>
          </div>
        </div>
      </div>

      {/* Detalles de suscripción */}
      <div className="detalles-suscripcion">
        <div className="detalle-item">
          <span className="detalle-label">Desde</span>
          <span className="detalle-valor">
            {formatoFecha(suscripcion.fechaInicio)}
          </span>
        </div>
        <div className="separador"></div>
        <div className="detalle-item">
          <span className="detalle-label">Válida hasta</span>
          <span className="detalle-valor">
            {formatoFecha(suscripcion.fechaFin)}
          </span>
        </div>
      </div>

      {/* Código de cliente */}
      <div className="codigo-cliente">
        <span className="codigo-label">ID Cliente:</span>
        <span className="codigo-valor">
          {cliente.id ||
            "LSB-" + Math.random().toString(36).substr(2, 8).toUpperCase()}
        </span>
      </div>

      {/* Footer */}
      <div className="footer-tarjeta">
        <div className="terminos">
          <span className="termino-item">Tarjeta exclusiva</span>
          <span className="separador-punto">•</span>
          <span className="termino-item">No transferible</span>
          <span className="separador-punto">•</span>
          <span className="termino-item">Válida con identificación</span>
        </div>
        <div className="contacto">
          <span className="contacto-texto">www.lasantabarberia.cl</span>
        </div>
      </div>
    </div>
  );
};

export default TarjetaSuscriptor;

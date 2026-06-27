import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getDatosSlot } from "api/invitado";
import { postConfirmarSlot } from "api/invitado";

const ConfirmarReserva = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [estado, setEstado] = useState("cargando"); // cargando | disponible | ocupado | confirmada | error
  const [datos, setDatos] = useState(null);
  const [confirmando, setConfirmando] = useState(false);

  useEffect(() => {
    if (!token) {
      setEstado("error");
      return;
    }

    const verificar = async () => {
      try {
        const { data } = await getDatosSlot(token);

        setDatos(data.datos);
        setEstado(data.disponible ? "disponible" : "ocupado");
      } catch {
        setEstado("error");
      }
    };

    verificar();
  }, [token]);

  const confirmar = async () => {
    setConfirmando(true);
    try {
      const { data } = await postConfirmarSlot(token);

      if (data.success) {
        setDatos((prev) => ({ ...prev, ...data.datos }));
        setEstado("confirmada");
      } else {
        setEstado("ocupado");
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      if (err.response?.status === 409) {
        setEstado("ocupado");
      } else {
        setEstado("error");
      }
    } finally {
      setConfirmando(false);
    }
  };

  // ── Pantallas ──────────────────────────────────────

  if (estado === "cargando") {
    return (
      <Wrapper>
        <div className="spinner" />
        <p className="text-muted mt-3">Verificando disponibilidad...</p>
      </Wrapper>
    );
  }

  if (estado === "error") {
    return (
      <Wrapper>
        <Icono>❌</Icono>
        <h2>Enlace inválido o expirado</h2>
        <p className="text-muted">
          Este enlace duró 48 horas. Puedes agendar normalmente desde la app.
        </p>
        <BotonSecundario onClick={() => navigate("/")}>
          Ir al inicio
        </BotonSecundario>
      </Wrapper>
    );
  }

  if (estado === "ocupado") {
    return (
      <Wrapper>
        <Icono>😔</Icono>
        <h2>Ese horario ya no está disponible</h2>
        <p className="text-muted">
          Alguien tomó ese slot antes. Puedes agendar otra hora desde la app.
        </p>
        <BotonPrimario onClick={() => navigate("/reservar")}>
          Agendar manualmente
        </BotonPrimario>
      </Wrapper>
    );
  }

  if (estado === "confirmada") {
    return (
      <Wrapper>
        <Icono>✅</Icono>
        <h2>¡Reserva confirmada!</h2>
        <TarjetaDatos datos={datos} />
        <p className="text-muted mt-3" style={{ fontSize: 13 }}>
          Te llegará un recordatorio antes de tu cita.
        </p>
        <BotonSecundario onClick={() => navigate("/")}>
          Volver al inicio
        </BotonSecundario>
      </Wrapper>
    );
  }

  // estado === "disponible"
  return (
    <Wrapper>
      <Icono>💈</Icono>
      <h2 style={{ marginBottom: 4 }}>Tu hora está disponible</h2>
      <p className="text-muted" style={{ marginBottom: 20 }}>
        Confirmamos el slot para ti. Revisa los datos y aprieta el botón.
      </p>

      <TarjetaDatos datos={datos} />

      <BotonPrimario onClick={confirmar} disabled={confirmando}>
        {confirmando ? "Confirmando..." : "✅ Confirmar reserva"}
      </BotonPrimario>

      <BotonSecundario
        onClick={() => navigate("/reservar")}
        style={{ marginTop: 10 }}
      >
        Elegir otro horario
      </BotonSecundario>
    </Wrapper>
  );
};

// ── Componentes auxiliares ─────────────────────────

const Wrapper = ({ children }) => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      textAlign: "center",
      maxWidth: 420,
      margin: "0 auto",
    }}
  >
    {children}
  </div>
);

const Icono = ({ children }) => (
  <div style={{ fontSize: 52, marginBottom: 12 }}>{children}</div>
);

const TarjetaDatos = ({ datos }) => (
  <div
    style={{
      background: "#f8f9fa",
      borderRadius: 12,
      padding: "16px 20px",
      width: "100%",
      textAlign: "left",
      marginBottom: 20,
    }}
  >
    <Fila label="📅 Fecha" valor={datos?.fecha} />
    <Fila label="🕐 Hora" valor={datos?.hora} />
    <Fila label="✂️ Servicio" valor={datos?.servicio} />
    {datos?.precio && (
      <Fila
        label="💰 Precio"
        valor={`$${Number(datos.precio).toLocaleString("es-CL")}`}
      />
    )}
  </div>
);

const Fila = ({ label, valor }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 0",
      borderBottom: "1px solid #eee",
      fontSize: 14,
    }}
  >
    <span style={{ color: "#666" }}>{label}</span>
    <span style={{ fontWeight: 600, color: "#111" }}>{valor}</span>
  </div>
);

const BotonPrimario = ({ children, ...props }) => (
  <button
    {...props}
    style={{
      width: "100%",
      background: "#111",
      color: "#fff",
      border: "none",
      borderRadius: 10,
      padding: "14px 0",
      fontSize: 15,
      fontWeight: 700,
      cursor: props.disabled ? "not-allowed" : "pointer",
      opacity: props.disabled ? 0.7 : 1,
      marginBottom: 8,
    }}
  >
    {children}
  </button>
);

const BotonSecundario = ({ children, ...props }) => (
  <button
    {...props}
    style={{
      width: "100%",
      background: "transparent",
      color: "#555",
      border: "1.5px solid #ddd",
      borderRadius: 10,
      padding: "12px 0",
      fontSize: 14,
      fontWeight: 500,
      cursor: "pointer",
    }}
  >
    {children}
  </button>
);

export default ConfirmarReserva;

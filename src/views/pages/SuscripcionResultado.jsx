import React, { useEffect, useState, useRef } from "react";
import UserHeader from "components/Headers/UserHeader";
import { useLocation, useNavigate } from "react-router-dom";
import { Spinner } from "reactstrap";
import html2canvas from "html2canvas";
import TarjetaSuscriptor from "../../components/tarjeta/tarjetaSuscriptor";

const BENEFITS = [
  "Acceso completo a todos los cursos",
  "Contenido exclusivo para suscriptores",
  "Soporte prioritario 24/7",
  "Certificados digitales de finalización",
  "Actualizaciones de contenido mensuales",
  "Comunidad privada de miembros",
];

const SuscripcionResultado = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const tarjetaRef = useRef(null); // 🔑 ref para la tarjeta oculta

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [suscripcionInfo, setSuscripcionInfo] = useState({});
  const [clienteNombre, setClienteNombre] = useState("Usuario Suscrito");

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const success = query.get("success");
    const cancelado = query.get("cancelado");
    const suscripcionId = query.get("suscripcionId");
    const fechaInicio = query.get("fechaInicio");
    const fechaFin = query.get("fechaFin");
    const nombre = query.get("nombre");

    if (cancelado) {
      setStatus("cancelled");
      setMessage("El proceso de suscripción fue cancelado por el usuario.");
    } else if (success) {
      setStatus("success");
      setMessage("¡Felicidades! Tu suscripción ha sido activada exitosamente.");
      setSuscripcionInfo({ suscripcionId, fechaInicio, fechaFin });
      setClienteNombre(nombre || "Usuario Suscrito");
      updateUserSubscriptionStatus({ fechaFin });
    } else {
      setStatus("error");
      setMessage("No se pudo procesar el pago. Por favor, intenta nuevamente.");
    }
  }, [location.search]);

  const updateUserSubscriptionStatus = ({ fechaFin }) => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (userData) {
        userData.suscrito = true;
        userData.fechaFinSuscripcion = fechaFin;
        localStorage.setItem("userData", JSON.stringify(userData));
      }

      const sessionUser = JSON.parse(sessionStorage.getItem("user"));
      if (sessionUser) {
        sessionUser.suscrito = true;
        sessionUser.fechaFinSuscripcion = fechaFin;
        sessionStorage.setItem("user", JSON.stringify(sessionUser));
      }
    } catch (error) {
      console.error("Error actualizando estado:", error);
    }
  };

  const formatDate = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString("es-CL", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "";

  const getRemainingDays = (endDate) => {
    if (!endDate) return 0;
    const diff = new Date(endDate) - new Date();
    return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
  };

  const descargarTarjeta = async () => {
    if (!tarjetaRef.current) return;

    const canvas = await html2canvas(tarjetaRef.current, {
      scale: 2,
      backgroundColor: null,
      useCORS: true,
    });

    const link = document.createElement("a");
    link.download = "tarjeta-suscriptor-la-santa-barberia.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const suscripcion = {
    fechaInicio: suscripcionInfo.fechaInicio,
    fechaFin: suscripcionInfo.fechaFin,
  };

  return (
    <>
      <UserHeader />

      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {status === "loading" && (
              <div className="card shadow-lg border-0">
                <div className="card-body text-center p-5">
                  <Spinner color="primary" size="lg" />
                  <h3 className="mt-4 text-primary">
                    Procesando tu suscripción
                  </h3>
                  <p className="text-muted">
                    Estamos confirmando el pago. Esto puede tomar unos segundos...
                  </p>
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="card shadow-lg border-0 overflow-hidden">
                <div className="card-header bg-gradient-success text-white text-center py-4">
                  <h1 className="display-5 fw-bold">¡Suscripción Exitosa!</h1>
                  <p className="lead mb-0">
                    Gracias por unirte a nuestra comunidad premium
                  </p>
                </div>

                <div className="card-body p-5">
                  <h4 className="text-center mb-4">{message}</h4>

                  <div className="text-center mb-4">
                    <p>
                      ID Suscripción:{" "}
                      <strong>{suscripcionInfo.suscripcionId}</strong>
                    </p>
                    <p>
                      Inicio:{" "}
                      <strong>{formatDate(suscripcionInfo.fechaInicio)}</strong>
                    </p>
                    <p>
                      Vencimiento:{" "}
                      <strong>{formatDate(suscripcionInfo.fechaFin)}</strong>
                    </p>
                    <p>
                      Días restantes:{" "}
                      <strong>
                        {getRemainingDays(suscripcionInfo.fechaFin)}
                      </strong>
                    </p>
                  </div>

                  {/* BOTÓN */}
                  <div className="text-center">
                    <button
                      className="btn btn-warning btn-lg px-5"
                      onClick={descargarTarjeta}
                    >
                      Descargar tarjeta de suscriptor
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TARJETA OCULTA (NO VISIBLE) */}
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
        }}
      >
        <div ref={tarjetaRef}>
          <TarjetaSuscriptor
            cliente={{ nombre: clienteNombre }}
            suscripcion={suscripcion}
          />
        </div>
      </div>
    </>
  );
};

export default SuscripcionResultado;

import React, { useEffect, useState, useRef } from "react";
import UserHeader from "components/Headers/UserHeader";
import { useLocation, useNavigate } from "react-router-dom";
import { Spinner } from "reactstrap";
import html2canvas from "html2canvas";
import TarjetaSuscriptor from "../../components/tarjeta/tarjetaSuscriptor";

const SuscripcionResultado = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const tarjetaRef = useRef(null);

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [suscripcionInfo, setSuscripcionInfo] = useState({});
  const [clienteNombre, setClienteNombre] = useState("Usuario Suscrito");

  /* =========================================================
     PROCESAR RESULTADO TRANSBANK
  ========================================================= */
  useEffect(() => {
    const query = new URLSearchParams(location.search);

    const success = query.get("success");
    const cancelado = query.get("cancelado");
    const rechazado = query.get("rechazado");
    const error = query.get("error");

    const suscripcionId = query.get("suscripcionId");
    const fechaInicio = query.get("fechaInicio");
    const fechaFin = query.get("fechaFin");
    const nombre = query.get("nombre");

    if (success) {
      setStatus("success");
      setMessage("¡Tu suscripción fue activada correctamente!");
      setSuscripcionInfo({ suscripcionId, fechaInicio, fechaFin });
      setClienteNombre(nombre || "Usuario Suscrito");
      updateUserSubscriptionStatus({ fechaFin });
      return;
    }

    if (cancelado) {
      setStatus("cancelled");
      setMessage("El proceso de pago fue cancelado por el usuario.");
      return;
    }

    if (rechazado) {
      setStatus("rejected");
      setMessage(
        "El pago fue rechazado por Transbank. Verifica los datos de tu tarjeta o intenta con otro medio de pago."
      );
      return;
    }

    if (error) {
      setStatus("error");
      setMessage(
        "Ocurrió un error al procesar el pago. Si el problema persiste, contáctanos."
      );
      return;
    }

    setStatus("error");
    setMessage("No se pudo determinar el estado del pago.");
  }, [location.search]);

  /* =========================================================
     ACTUALIZAR USUARIO LOCAL
  ========================================================= */
  const updateUserSubscriptionStatus = ({ fechaFin }) => {
    try {
      const updateStorage = (storage, key) => {
        const data = JSON.parse(storage.getItem(key));
        if (!data) return;
        data.suscrito = true;
        data.fechaFinSuscripcion = fechaFin;
        storage.setItem(key, JSON.stringify(data));
      };

      updateStorage(localStorage, "userData");
      updateStorage(sessionStorage, "user");
    } catch (error) {
      console.error("Error actualizando estado local:", error);
    }
  };

  /* =========================================================
     HELPERS
  ========================================================= */
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

  /* =========================================================
     DESCARGAR TARJETA
  ========================================================= */
  const descargarTarjeta = async () => {
    if (!tarjetaRef.current) return;

    const canvas = await html2canvas(tarjetaRef.current, {
      scale: 2,
      backgroundColor: null,
      useCORS: true,
    });

    const link = document.createElement("a");
    link.download = "tarjeta-suscriptor.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const suscripcion = {
    fechaInicio: suscripcionInfo.fechaInicio,
    fechaFin: suscripcionInfo.fechaFin,
  };

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <>
      <UserHeader />

      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">

            {/* LOADING */}
            {status === "loading" && (
              <div className="card shadow border-0 text-center p-5">
                <Spinner color="primary" />
                <h4 className="mt-4">Procesando tu pago…</h4>
                <p className="text-muted">Por favor espera un momento</p>
              </div>
            )}

            {/* SUCCESS */}
            {status === "success" && (
              <div className="card shadow-lg border-0">
                <div className="card-header bg-success text-white text-center py-4">
                  <h2>🎉 Suscripción Exitosa</h2>
                </div>

                <div className="card-body text-center p-5">
                  <p className="lead">{message}</p>

                  <p>
                    <strong>Inicio:</strong>{" "}
                    {formatDate(suscripcionInfo.fechaInicio)}
                  </p>
                  <p>
                    <strong>Vencimiento:</strong>{" "}
                    {formatDate(suscripcionInfo.fechaFin)}
                  </p>
                  <p>
                    <strong>Días restantes:</strong>{" "}
                    {getRemainingDays(suscripcionInfo.fechaFin)}
                  </p>

                  <button
                    className="btn btn-warning btn-lg mt-4"
                    onClick={descargarTarjeta}
                  >
                    Descargar tarjeta de suscriptor
                  </button>
                </div>
              </div>
            )}

            {/* CANCELLED */}
            {status === "cancelled" && (
              <div className="card shadow border-0 text-center p-5">
                <h3>⚠️ Pago cancelado</h3>
                <p>{message}</p>
                <button
                  className="btn btn-primary mt-3"
                  onClick={() => navigate("/suscripcion")}
                >
                  Intentar nuevamente
                </button>
              </div>
            )}

            {/* REJECTED */}
            {status === "rejected" && (
              <div className="card shadow border-0 text-center p-5">
                <h3>❌ Pago rechazado</h3>
                <p>{message}</p>
                <button
                  className="btn btn-danger mt-3"
                  onClick={() => navigate("/suscripcion")}
                >
                  Reintentar pago
                </button>
              </div>
            )}

            {/* ERROR */}
            {status === "error" && (
              <div className="card shadow border-0 text-center p-5">
                <h3>🚫 Error en el pago</h3>
                <p>{message}</p>
                <button
                  className="btn btn-secondary mt-3"
                  onClick={() => navigate("/")}
                >
                  Volver al inicio
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* TARJETA OCULTA */}
      {status === "success" && (
        <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <div ref={tarjetaRef}>
            <TarjetaSuscriptor
              cliente={{ nombre: clienteNombre }}
              suscripcion={suscripcion}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default SuscripcionResultado;

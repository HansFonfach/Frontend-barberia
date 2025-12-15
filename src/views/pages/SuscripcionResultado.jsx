// SuscripcionResultadoProfesional.jsx
import React, { useEffect, useState } from "react";
import UserHeader from "components/Headers/UserHeader";
import { useLocation, useNavigate } from "react-router-dom";
import { Spinner } from "reactstrap";

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

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [suscripcionInfo, setSuscripcionInfo] = useState({});

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const success = query.get("success");
    const cancelado = query.get("cancelado");
    const suscripcionId = query.get("suscripcionId");
    const fechaInicio = query.get("fechaInicio");
    const fechaFin = query.get("fechaFin");

    if (cancelado) {
      setStatus("cancelled");
      setMessage("El proceso de suscripción fue cancelado por el usuario.");
    } else if (success) {
      setStatus("success");
      setMessage("¡Felicidades! Tu suscripción ha sido activada exitosamente.");
      setSuscripcionInfo({ suscripcionId, fechaInicio, fechaFin });
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
    iso ? new Date(iso).toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" }) : "";

  const getRemainingDays = (endDate) => {
    if (!endDate) return 0;
    const diff = new Date(endDate) - new Date();
    return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
  };

  const goToDashboard = () => navigate("/admin/index");
  const goToSubscription = () => navigate("/admin/suscripcion");
  const goToCourses = () => navigate("/admin/cursos");

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
                  <h3 className="mt-4 text-primary">Procesando tu suscripción</h3>
                  <p className="text-muted">Estamos confirmando el pago. Esto puede tomar unos segundos...</p>
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="card shadow-lg border-0 overflow-hidden">
                <div className="card-header bg-gradient-success text-white text-center py-4">
                  <div className="d-flex justify-content-center mb-3">
                    <div className="bg-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: "80px", height: "80px" }}>
                      <i className="ni ni-check-bold text-success" style={{ fontSize: "3rem" }}></i>
                    </div>
                  </div>
                  <h1 className="display-5 fw-bold">¡Suscripción Exitosa!</h1>
                  <p className="lead mb-0">Gracias por unirte a nuestra comunidad premium</p>
                </div>

                <div className="card-body p-5">
                  <h4 className="text-center text-dark mb-4">{message}</h4>
                  <div className="mb-4 text-center">
                    <p className="mb-1">ID Suscripción: <strong>{suscripcionInfo.suscripcionId}</strong></p>
                    <p className="mb-1">Inicio: <strong>{formatDate(suscripcionInfo.fechaInicio)}</strong></p>
                    <p className="mb-1">Vencimiento: <strong>{formatDate(suscripcionInfo.fechaFin)}</strong></p>
                    <p>Días restantes: <strong>{getRemainingDays(suscripcionInfo.fechaFin)}</strong></p>
                  </div>

                  <h5 className="text-center mb-3">Beneficios activos</h5>
                  <ul className="list-group mb-4">
                    {BENEFITS.map((b, i) => (
                      <li key={i} className="list-group-item border-0 ps-0">
                        <i className="ni ni-check-bold text-success me-2"></i> {b}
                      </li>
                    ))}
                  </ul>

                  <div className="d-flex flex-column flex-md-row justify-content-center gap-3">
                    <button className="btn btn-success btn-lg px-5" onClick={goToCourses}>
                      Ir a mis Cursos
                    </button>
                    <button className="btn btn-outline-primary btn-lg px-5" onClick={goToDashboard}>
                      Volver al Panel
                    </button>
                  </div>
                </div>

                <div className="card-footer text-center py-3">
                  <small className="text-muted">
                    Para asistencia, contacta a <a href="mailto:lasantabarberia@soporte.cl">lasantabarberia@soporte.cl</a>
                  </small>
                </div>
              </div>
            )}

            {status === "cancelled" && (
              <div className="card shadow-lg border-0">
                <div className="card-header bg-gradient-warning text-white text-center py-4">
                  <h1 className="display-5 fw-bold">Suscripción Cancelada</h1>
                </div>
                <div className="card-body text-center p-5">
                  <h3 className="text-warning mb-4">{message}</h3>
                  <div className="d-flex flex-column flex-md-row justify-content-center gap-3">
                    <button className="btn btn-warning btn-lg px-5" onClick={goToSubscription}>
                      Reintentar Suscripción
                    </button>
                    <button className="btn btn-outline-primary btn-lg px-5" onClick={goToDashboard}>
                      Volver al Inicio
                    </button>
                  </div>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="card shadow-lg border-0">
                <div className="card-header bg-gradient-danger text-white text-center py-4">
                  <h1 className="display-5 fw-bold">Error en el Pago</h1>
                </div>
                <div className="card-body text-center p-5">
                  <h3 className="text-danger mb-4">{message}</h3>
                  <div className="d-flex flex-column flex-md-row justify-content-center gap-3">
                    <button className="btn btn-danger btn-lg px-5" onClick={goToSubscription}>
                      Intentar Nuevamente
                    </button>
                    <button className="btn btn-outline-primary btn-lg px-5" onClick={goToDashboard}>
                      Volver al Inicio
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SuscripcionResultado;

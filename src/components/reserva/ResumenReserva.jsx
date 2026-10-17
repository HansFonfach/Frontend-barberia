// src/views/admin/pages/components/ResumenReserva.jsx
import React from "react";
import { Card, CardBody, Button, Spinner, Badge } from "reactstrap";
import { Zap, MapPin, Briefcase } from "lucide-react";
import { useEmpresa } from "context/EmpresaContext";
import { construirTema } from "utils/temaEmpresa";

const ResumenReserva = ({
  usuarioEncontrado,
  rut,
  servicioSeleccionado,
  precioFinalCalculado,
  barberoSeleccionado,
  fecha,
  hora,
  reservando,
  cargandoHoras,
  onReservar,
  habilitado,
  mostrarInfo,

  // 🔥 NUEVO
  suscripcion,
  serviciosReserva,
  serviciosRestantes,
  excedente,

  // Código promocional (opcional): objeto de useCodigoDescuento
  codigoDescuento,
}) => {
  const nombreServicio = servicioSeleccionado?.nombre || "—";
  const duracionServicio = servicioSeleccionado?.duracion;
  const { empresa } = useEmpresa();
  const theme = construirTema(empresa?.colores);

  const serviciosLuegoReserva = Math.max(
    0,
    serviciosRestantes - serviciosReserva,
  );

  const obtenerIconoServicio = () => {
    if (!empresa?.tipo) return "🛠";

    switch (empresa.tipo) {
      case "barberia":
        return "✂️";
      case "salon_belleza":
        return "💅";
      default:
        return "🛠";
    }
  };

  const obtenerIconoProfesional = () => {
    if (!empresa?.tipo) return "🛠";

    switch (empresa.tipo) {
      case "barberia":
        return "👨‍💼";
      case "salon_belleza":
        return "💇‍♀️";
      default:
        return "🛠";
    }
  };

  const obtenerIconoCliente = () => {
    if (!empresa?.tipo) return "🛠";

    switch (empresa.tipo) {
      case "barberia":
        return "👤 ";
      case "salon_belleza":
        return "👩🏼";
      default:
        return "🛠";
    }
  };

  return (
    <>
      <Card
        className="shadow-sm mb-3"
        style={{ border: `1px solid ${theme.primary}` }}
      >
        <CardBody>
          <h6
            className="font-weight-bold d-flex align-items-center"
            style={{ color: theme.primary }}
          >
            <Zap size={18} className="me-2" /> Resumen
          </h6>

          <div className="small">
            <div
              className="d-flex justify-content-between border-bottom py-1"
              style={{ flexWrap: "nowrap", gap: 8 }}
            >
              <span style={{ flexShrink: 0 }}>
                {obtenerIconoCliente()}Nombre:
              </span>
              <strong style={{ textAlign: "right", wordBreak: "break-word" }}>
                {usuarioEncontrado
                  ? `${usuarioEncontrado.nombre} ${usuarioEncontrado.apellido}`
                  : rut || "—"}
              </strong>
            </div>

            <div
              className="d-flex justify-content-between border-bottom py-1"
              style={{ flexWrap: "nowrap", gap: 8 }}
            >
              <span style={{ flexShrink: 0 }}>
                {obtenerIconoServicio()} Servicio:
              </span>
              <strong style={{ textAlign: "right", wordBreak: "break-word" }}>
                {duracionServicio
                  ? `${nombreServicio} (${duracionServicio} min)`
                  : nombreServicio}
              </strong>
            </div>

            <div
              className="d-flex justify-content-between border-bottom py-1"
              style={{ flexWrap: "nowrap", gap: 8 }}
            >
              <span style={{ flexShrink: 0 }}>
                {obtenerIconoProfesional()} Profesional:
              </span>
              <strong style={{ textAlign: "right", wordBreak: "break-word" }}>
                {barberoSeleccionado
                  ? `${barberoSeleccionado.nombre} ${barberoSeleccionado.apellido}`
                  : "—"}
              </strong>
            </div>

            <div className="d-flex justify-content-between border-bottom py-1">
              <span>📅 Fecha:</span>
              <strong>{fecha || "—"}</strong>
            </div>

            <div className="d-flex justify-content-between border-bottom py-1">
              <span>⏰ Hora:</span>
              <strong>{hora || "—"}</strong>
            </div>

            <div className="d-flex justify-content-between border-bottom py-1">
              <span>💸 Precio:</span>
              <strong>
                {precioFinalCalculado != null &&
                precioFinalCalculado !== servicioSeleccionado?.precio ? (
                  precioFinalCalculado < servicioSeleccionado.precio ? (
                    <>
                      <span
                        style={{
                          textDecoration: "line-through",
                          color: "#999",
                          marginRight: "8px",
                          fontWeight: 500,
                        }}
                      >
                        ${servicioSeleccionado.precio.toLocaleString("es-CL")}
                      </span>
                      <span>
                        ${precioFinalCalculado.toLocaleString("es-CL")}
                      </span>
                    </>
                  ) : (
                    // Precio especial MAYOR al normal (ej. feriado/hora
                    // extra) — no tiene sentido mostrarlo como "tachado +
                    // rebaja", así que se muestra directo, sin implicar un
                    // descuento que no existe.
                    <>${precioFinalCalculado.toLocaleString("es-CL")}</>
                  )
                ) : (
                  <>
                    $
                    {servicioSeleccionado?.precio?.toLocaleString("es-CL") ||
                      "—"}
                  </>
                )}
              </strong>
            </div>

            {codigoDescuento?.aplicado && (
              <>
                <div className="d-flex justify-content-between border-bottom py-1">
                  <span>🏷️ Código {codigoDescuento.aplicado.codigo}:</span>
                  <strong className="text-success">
                    −${codigoDescuento.aplicado.descuento.toLocaleString("es-CL")}
                  </strong>
                </div>
                <div className="d-flex justify-content-between py-1">
                  <span>💰 Total a pagar:</span>
                  <strong>
                    ${codigoDescuento.aplicado.precioFinal.toLocaleString("es-CL")}
                  </strong>
                </div>
              </>
            )}
          </div>

          {/* 🔥 IMPACTO SUSCRIPCIÓN */}
          {suscripcion && hora && serviciosReserva > 0 && (
            <div
              className={`alert mt-3 ${
                excedente > 0 ? "alert-warning" : "alert-success"
              }`}
            >
              {excedente === 0 ? (
                <>
                  Esta reserva consume <strong>{serviciosReserva}</strong>{" "}
                  servicio{serviciosReserva > 1 ? "s" : ""}. Te quedarán{" "}
                  <strong>{serviciosLuegoReserva}</strong> disponible
                  {serviciosLuegoReserva !== 1 ? "s" : ""}.
                </>
              ) : (
                <>
                  Esta reserva consume <strong>{serviciosReserva}</strong>{" "}
                  servicio{serviciosReserva > 1 ? "s" : ""}. Excedes tu plan en{" "}
                  <strong>{excedente}</strong> servicio
                  {excedente > 1 ? "s" : ""}, que se cobrará a valor normal.
                </>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {codigoDescuento && (
        <div className="mb-2">
          <div className="d-flex align-items-stretch" style={{ gap: 8 }}>
            <input
              type="text"
              className={`form-control ${codigoDescuento.error ? "is-invalid" : ""}`}
              placeholder="Código promocional"
              value={codigoDescuento.codigo}
              maxLength={20}
              style={{ flex: 1, minWidth: 0 }}
              disabled={!!codigoDescuento.aplicado || codigoDescuento.validando}
              onChange={(e) => codigoDescuento.setCodigo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (codigoDescuento.codigo.trim()) codigoDescuento.aplicar();
                }
              }}
            />
            <div className="d-flex" style={{ flexShrink: 0 }}>
              {codigoDescuento.aplicado ||
              (codigoDescuento.error && codigoDescuento.codigo) ? (
                <Button
                  type="button"
                  outline
                  color="secondary"
                  style={{ margin: 0, whiteSpace: "nowrap" }}
                  onClick={codigoDescuento.quitar}
                >
                  Quitar
                </Button>
              ) : (
                <Button
                  type="button"
                  outline
                  color="primary"
                  disabled={
                    !codigoDescuento.codigo.trim() ||
                    codigoDescuento.validando ||
                    !servicioSeleccionado
                  }
                  style={{ margin: 0, whiteSpace: "nowrap" }}
                  onClick={codigoDescuento.aplicar}
                >
                  {codigoDescuento.validando ? <Spinner size="sm" /> : "Aplicar"}
                </Button>
              )}
            </div>
          </div>
          {codigoDescuento.error && (
            <small className="text-danger d-block mt-1">
              {codigoDescuento.error}
            </small>
          )}
          {codigoDescuento.aplicado && (
            <small className="text-success d-block mt-1">
              ✅ Código aplicado
            </small>
          )}
        </div>
      )}

      <div className="d-grid gap-2">
        <Button
          type="button"
          color={excedente > 0 ? "warning" : undefined}
          style={
            excedente > 0
              ? undefined
              : { backgroundColor: theme.primary, borderColor: theme.primary }
          }
          size="lg"
          className="font-weight-bold"
          onClick={onReservar}
          disabled={!habilitado || cargandoHoras}
        >
          {reservando ? (
            <>
              <Spinner size="sm" className="me-2" />
              Procesando...
            </>
          ) : (
            "✅ Confirmar Reserva"
          )}
        </Button>

        {mostrarInfo && empresa && (
          <Card className="mt-1" style={{ border: `1px solid ${theme.primary}` }}>
            <CardBody className="text-center">
              <MapPin size={40} className="mb-2" style={{ color: theme.primary }} />
              <h5 className="font-weight-bold" style={{ color: theme.primary }}>
                {empresa?.nombre || "—"}
              </h5>
              <p className="small text-muted mb-2">
                🕒 {empresa?.horarios || "—"}
                {empresa?.slug === "lasantabarberia" && (
                  <>
                    {" "}
                    <br />⭐ Sábado atención solo suscritos
                  </>
                )}
                <br />
                📍 {empresa?.direccion || "—"}
                <br />
                📞 {empresa?.telefono || "—"}
              </p>
              <Badge
                className="rounded-pill text-white px-3 py-2"
                style={{ backgroundColor: theme.primary }}
              >
                ⭐ 4.8 (156)
              </Badge>
            </CardBody>
          </Card>
        )}
      </div>
    </>
  );
};

export default ResumenReserva;

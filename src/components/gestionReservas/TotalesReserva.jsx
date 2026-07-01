import React from "react";

const TotalesReserva = ({
  totalServicio = 0,
  totalProductos = 0,
  totalExtras = 0,
  abono = null,
  montoPendiente = 0,
}) => {
  const totalGeneral =
    Number(totalServicio) +
    Number(totalProductos) +
    Number(totalExtras);

  const montoAbonado =
    abono?.estado === "pagado" ? Number(abono.monto || 0) : 0;

  return (
    <div className="bg-secondary rounded p-3 mt-4">
      {/* SERVICIO */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="text-muted">
          Servicio
        </span>

        <strong>
          $
          {Number(
            totalServicio,
          ).toLocaleString("es-CL")}
        </strong>
      </div>

      {/* PRODUCTOS */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="text-muted">
          Productos
        </span>

        <strong>
          $
          {Number(
            totalProductos,
          ).toLocaleString("es-CL")}
        </strong>
      </div>

      {/* EXTRAS */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="text-muted">
          Extras
        </span>

        <strong>
          $
          {Number(
            totalExtras,
          ).toLocaleString("es-CL")}
        </strong>
      </div>

      <hr className="my-3" />

      {/* TOTAL */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0 font-weight-bold">
          Total General
        </h5>

        <h3 className="mb-0 text-primary font-weight-bold">
          $
          {Number(
            totalGeneral,
          ).toLocaleString("es-CL")}
        </h3>
      </div>

      {/* ABONO Y PENDIENTE */}
      {montoAbonado > 0 && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-success">
              Abonado
            </span>

            <strong className="text-success">
              $
              {montoAbonado.toLocaleString("es-CL")}
            </strong>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted">
              Pendiente
            </span>

            <strong>
              $
              {Number(
                montoPendiente,
              ).toLocaleString("es-CL")}
            </strong>
          </div>
        </>
      )}
    </div>
  );
};

export default TotalesReserva;
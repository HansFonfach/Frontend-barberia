import React from "react";

const TotalesReserva = ({
  totalServicio = 0,
  totalProductos = 0,
}) => {
  const totalGeneral =
    Number(totalServicio) +
    Number(totalProductos);

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

      <hr className="my-3" />

      {/* TOTAL */}
      <div className="d-flex justify-content-between align-items-center">
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
    </div>
  );
};

export default TotalesReserva;
import React from "react";
import {
  Table,
  Button,
} from "reactstrap";

const TablaProductos = ({
  productos,
  columnas,
  acciones,
  onAccion,
}) => {
  return (
    <div className="table-responsive">
      <Table className="align-items-center table-flush">
        <thead className="thead-light">
          <tr>
            {columnas.map((columna) => (
              <th key={columna.key}>{columna.label}</th>
            ))}

            <th className="text-center">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {productos.map((producto) => (
            <tr key={producto._id}>
              {columnas.map((columna) => (
                <td key={columna.key}>
                  {columna.render
                    ? columna.render(producto[columna.key], producto)
                    : producto[columna.key]}
                </td>
              ))}

              <td className="text-center">
                <div className="d-flex justify-content-center gap-2">
                  {acciones.map((accion) => (
                    <Button
                      key={accion.id}
                      color={accion.color}
                      outline
                      size="sm"
                      className="mr-2"
                      onClick={() => onAccion(accion.id, producto)}
                    >
                      {accion.icon}
                    </Button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TablaProductos;

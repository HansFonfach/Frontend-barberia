import React from "react";
import { Table, Button } from "reactstrap";
import {
  FiUserCheck,
  FiEdit2,
  FiTrash2,
  FiUserPlus,
} from "react-icons/fi";

const TablaUsuarios = ({
  usuarios,
  columns,
  acciones,
  onAccion,
  emptyMessage = "No hay usuarios",
  compact = false,
}) => {
  if (!usuarios?.length) {
    return (
      <div className="text-center py-5">
        <div className="icon icon-shape icon-shape-primary icon-lg rounded-circle mb-4">
          <i className="ni ni-single-02" />
        </div>

        <h4 className="mb-2">No hay usuarios</h4>

        <p className="text-muted mb-0">{emptyMessage}</p>
      </div>
    );
  }

  // =========================
  // MOBILE
  // =========================
  if (compact) {
    return (
      <div>
        {usuarios.map((usuario) => (
          <div
            key={usuario._id}
            className="card shadow-sm border-0 mb-3"
          >
            <div className="card-body py-3">
              {columns.map((col) => (
                <div
                  key={col.key}
                  className="d-flex justify-content-between align-items-start mb-2"
                >
                  <small
                    className="text-muted font-weight-bold mr-2"
                    style={{ minWidth: "90px" }}
                  >
                    {col.label}
                  </small>

                  <div className="text-right flex-grow-1">
                    {col.render
                      ? col.render(usuario[col.key], usuario)
                      : usuario[col.key]}
                  </div>
                </div>
              ))}

              <hr className="my-3" />

              <div className="d-flex justify-content-end flex-wrap">
                {acciones.map((accion) => (
                  <Button
                    key={accion.id}
                    color={accion.color}
                    size="sm"
                    className="btn-icon-only mr-2 mb-2"
                    onClick={() => onAccion(accion.id, usuario)}
                    title={accion.title}
                  >
                    {accion.icon}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // =========================
  // DESKTOP
  // =========================
  return (
    <Table
      responsive
      className="align-items-center table-flush mb-0"
    >
      <thead className="thead-light">
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.label}</th>
          ))}

          <th className="text-center" style={{ width: "140px" }}>
            Acciones
          </th>
        </tr>
      </thead>

      <tbody>
        {usuarios.map((usuario) => (
          <tr key={usuario._id}>
            {columns.map((col) => (
              <td key={col.key}>
                {col.render
                  ? col.render(usuario[col.key], usuario)
                  : usuario[col.key]}
              </td>
            ))}

            <td className="text-center">
              <div className="d-flex justify-content-center flex-wrap">
                {acciones.map((accion) => (
                  <Button
                    key={accion.id}
                    color={accion.color}
                    size="sm"
                    className="btn-icon-only mr-2 mb-1"
                    onClick={() => onAccion(accion.id, usuario)}
                    title={accion.title}
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
  );
};

export const AccionIcons = {
  EDITAR: <FiEdit2 />,
  ELIMINAR: <FiTrash2 />,
  SUSCRIBIR: <FiUserCheck />,
  TRANSFORMAR: <FiUserPlus />,
};

export default TablaUsuarios;
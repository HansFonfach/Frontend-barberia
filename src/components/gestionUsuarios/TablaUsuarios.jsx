import React from 'react';
import { Table,  Button } from 'reactstrap';
import { FiUserCheck, FiEdit2, FiTrash2, FiUserPlus } from 'react-icons/fi';

const TablaUsuarios = ({
  usuarios,
  columns,
  acciones,
  onAccion,
  emptyMessage = "No hay usuarios"
}) => {
  if (usuarios.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="icon icon-shape icon-shape-primary icon-lg rounded-circle mb-4">
          <i className="ni ni-single-02"></i>
        </div>
        <h4 className="display-4 mb-2">No hay usuarios</h4>
        <p className="lead text-muted mb-4">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <Table className="align-items-center table-flush" responsive>
        <thead className="thead-light">
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(usuario => (
            <tr key={usuario._id}>
              {columns.map(col => (
                <td key={col.key}>
                  {col.render ? col.render(usuario[col.key], usuario) : usuario[col.key]}
                </td>
              ))}
              <td className="text-right">
                <div className="d-flex align-items-center">
                  {acciones.map(accion => (
                    <Button
                      key={accion.id}
                      color={accion.color}
                      size="sm"
                      className="btn-icon-only mr-2"
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
    </div>
  );
};

// Iconos predefinidos para reutilizar
export const AccionIcons = {
  EDITAR: <FiEdit2 />,
  ELIMINAR: <FiTrash2 />,
  SUSCRIBIR: <FiUserCheck />,
  TRANSFORMAR: <FiUserPlus />,
};

export default TablaUsuarios;
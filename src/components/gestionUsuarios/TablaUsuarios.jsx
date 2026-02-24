import React from 'react';
import { Table, Button } from 'reactstrap';
import { FiUserCheck, FiEdit2, FiTrash2, FiUserPlus } from 'react-icons/fi';

const TablaUsuarios = ({
  usuarios,
  columns,
  acciones,
  onAccion,
  emptyMessage = "No hay usuarios",
  compact = false,
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

  // Vista móvil: cards en vez de tabla
  if (compact) {
    return (
      <div>
        {usuarios.map((usuario) => (
          <div
            key={usuario._id}
            style={{
              background: '#fff',
              borderRadius: '12px',
              border: '1px solid #e9ecef',
              padding: '12px 14px',
              marginBottom: '10px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
              {/* Contenido de las columnas */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {columns.map((col) => (
                  <div key={col.key}>
                    {col.render
                      ? col.render(usuario[col.key], usuario)
                      : usuario[col.key]}
                  </div>
                ))}
              </div>

              {/* Acciones */}
              <div className="d-flex align-items-center ml-2" style={{ gap: '6px', flexShrink: 0 }}>
                {acciones.map((accion) => (
                  <button
                    key={accion.id}
                    onClick={() => onAccion(accion.id, usuario)}
                    title={accion.title}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                      background:
                        accion.color === 'info'
                          ? '#e3f2fd'
                          : accion.color === 'warning'
                          ? '#fff8e1'
                          : accion.color === 'danger'
                          ? '#ffebee'
                          : '#f5f5f5',
                      color:
                        accion.color === 'info'
                          ? '#0288d1'
                          : accion.color === 'warning'
                          ? '#f57c00'
                          : accion.color === 'danger'
                          ? '#c62828'
                          : '#555',
                    }}
                  >
                    {accion.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Vista desktop: tabla normal
  return (
    <div className="table-responsive">
      <Table className="align-items-center table-flush" responsive>
        <thead className="thead-light">
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            <th>Acciones</th>
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
              <td className="text-right">
                <div className="d-flex align-items-center">
                  {acciones.map((accion) => (
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

export const AccionIcons = {
  EDITAR: <FiEdit2 />,
  ELIMINAR: <FiTrash2 />,
  SUSCRIBIR: <FiUserCheck />,
  TRANSFORMAR: <FiUserPlus />,
};

export default TablaUsuarios;

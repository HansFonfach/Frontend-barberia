import React from 'react';
import { Button } from 'reactstrap';

const Paginacion = ({ paginaActual, totalPaginas, onPaginaChange }) => {
  if (totalPaginas <= 1) return null;

  return (
    <div className="d-flex justify-content-center mt-4">
      <Button
        color="secondary"
        size="sm"
        disabled={paginaActual === 1}
        onClick={() => onPaginaChange(paginaActual - 1)}
      >
        Anterior
      </Button>

      {[...Array(totalPaginas)].map((_, i) => (
        <Button
          key={i}
          size="sm"
          color={paginaActual === i + 1 ? 'primary' : 'light'}
          className="mx-1"
          onClick={() => onPaginaChange(i + 1)}
        >
          {i + 1}
        </Button>
      ))}

      <Button
        color="secondary"
        size="sm"
        disabled={paginaActual === totalPaginas}
        onClick={() => onPaginaChange(paginaActual + 1)}
      >
        Siguiente
      </Button>
    </div>
  );
};

export default Paginacion;
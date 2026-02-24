import React from 'react';
import { Button } from 'reactstrap';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Paginacion = ({ paginaActual, totalPaginas, onPaginaChange, size }) => {
  if (totalPaginas <= 1) return null;

  const esMobile = size === 'sm';

  // En mobile: solo Anterior / X de Y / Siguiente
  if (esMobile) {
    return (
      <div className="d-flex justify-content-center align-items-center mt-3" style={{ gap: '8px' }}>
        <button
          disabled={paginaActual === 1}
          onClick={() => onPaginaChange(paginaActual - 1)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '1px solid #dee2e6',
            background: paginaActual === 1 ? '#f8f9fa' : '#fff',
            color: paginaActual === 1 ? '#adb5bd' : '#495057',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: paginaActual === 1 ? 'not-allowed' : 'pointer',
          }}
        >
          <FiChevronLeft size={16} />
        </button>

        <span style={{ fontSize: '13px', color: '#6c757d', minWidth: '60px', textAlign: 'center' }}>
          {paginaActual} de {totalPaginas}
        </span>

        <button
          disabled={paginaActual === totalPaginas}
          onClick={() => onPaginaChange(paginaActual + 1)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '1px solid #dee2e6',
            background: paginaActual === totalPaginas ? '#f8f9fa' : '#fff',
            color: paginaActual === totalPaginas ? '#adb5bd' : '#495057',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer',
          }}
        >
          <FiChevronRight size={16} />
        </button>
      </div>
    );
  }

  // Desktop: paginación completa con números
  return (
    <div className="d-flex justify-content-center align-items-center mt-4" style={{ gap: '4px' }}>
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

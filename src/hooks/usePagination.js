import { useState, useMemo } from 'react';

export const usePagination = (items, itemsPerPage = 5) => {
  const [paginaActual, setPaginaActual] = useState(1);

  const totalPaginas = Math.ceil(items.length / itemsPerPage);

  const itemsPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPerPage;
    return items.slice(inicio, inicio + itemsPerPage);
  }, [paginaActual, items, itemsPerPage]);

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  const resetPaginacion = () => setPaginaActual(1);

  return {
    paginaActual,
    totalPaginas,
    itemsPaginados,
    cambiarPagina,
    resetPaginacion,
  };
};
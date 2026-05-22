import React from "react";
import {
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";

const PaginacionProductos = ({
  paginaActual,
  totalPaginas,
  onPaginaChange,
}) => {
  return (
    <Pagination className="pagination justify-content-end mb-0">
      <PaginationItem disabled={paginaActual === 1}>
        <PaginationLink
          previous
          onClick={() => onPaginaChange(paginaActual - 1)}
        />
      </PaginationItem>

      {[...Array(totalPaginas)].map((_, index) => (
        <PaginationItem
          key={index}
          active={paginaActual === index + 1}
        >
          <PaginationLink onClick={() => onPaginaChange(index + 1)}>
            {index + 1}
          </PaginationLink>
        </PaginationItem>
      ))}

      <PaginationItem disabled={paginaActual === totalPaginas}>
        <PaginationLink
          next
          onClick={() => onPaginaChange(paginaActual + 1)}
        />
      </PaginationItem>
    </Pagination>
  );
};

export default PaginacionProductos;

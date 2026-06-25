import React from "react";
import { Button } from "reactstrap";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Paginacion = ({
  paginaActual,
  totalPaginas,
  onPaginaChange,
  size,
}) => {
  if (totalPaginas <= 1) return null;

  const esMobile = size === "sm";

  // =========================
  // MOBILE
  // =========================
  if (esMobile) {
    return (
      <div
        className="d-flex justify-content-center align-items-center mt-3"
        style={{ gap: "8px" }}
      >
        <button
          disabled={paginaActual === 1}
          onClick={() => onPaginaChange(paginaActual - 1)}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "1px solid #dee2e6",
            background: paginaActual === 1 ? "#f8f9fa" : "#fff",
            color: paginaActual === 1 ? "#adb5bd" : "#495057",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor:
              paginaActual === 1
                ? "not-allowed"
                : "pointer",
          }}
        >
          <FiChevronLeft size={16} />
        </button>

        <span
          style={{
            fontSize: "13px",
            color: "#6c757d",
            minWidth: "60px",
            textAlign: "center",
          }}
        >
          {paginaActual} de {totalPaginas}
        </span>

        <button
          disabled={paginaActual === totalPaginas}
          onClick={() => onPaginaChange(paginaActual + 1)}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "1px solid #dee2e6",
            background:
              paginaActual === totalPaginas
                ? "#f8f9fa"
                : "#fff",
            color:
              paginaActual === totalPaginas
                ? "#adb5bd"
                : "#495057",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor:
              paginaActual === totalPaginas
                ? "not-allowed"
                : "pointer",
          }}
        >
          <FiChevronRight size={16} />
        </button>
      </div>
    );
  }

  // =========================
  // DESKTOP
  // =========================

  const getPages = () => {
    const pages = [];

    const start = Math.max(
      1,
      paginaActual - 2
    );

    const end = Math.min(
      totalPaginas,
      paginaActual + 2
    );

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center flex-wrap mt-4"
      style={{ gap: "4px" }}
    >
      <Button
        color="secondary"
        size="sm"
        disabled={paginaActual === 1}
        onClick={() =>
          onPaginaChange(paginaActual - 1)
        }
      >
        <FiChevronLeft />
      </Button>

      {paginaActual > 3 && (
        <>
          <Button
            size="sm"
            color="light"
            onClick={() => onPaginaChange(1)}
          >
            1
          </Button>

          {paginaActual > 4 && (
            <span className="px-1 text-muted">
              ...
            </span>
          )}
        </>
      )}

      {getPages().map((page) => (
        <Button
          key={page}
          size="sm"
          color={
            paginaActual === page
              ? "primary"
              : "light"
          }
          onClick={() => onPaginaChange(page)}
        >
          {page}
        </Button>
      ))}

      {paginaActual < totalPaginas - 2 && (
        <>
          {paginaActual < totalPaginas - 3 && (
            <span className="px-1 text-muted">
              ...
            </span>
          )}

          <Button
            size="sm"
            color="light"
            onClick={() =>
              onPaginaChange(totalPaginas)
            }
          >
            {totalPaginas}
          </Button>
        </>
      )}

      <Button
        color="secondary"
        size="sm"
        disabled={
          paginaActual === totalPaginas
        }
        onClick={() =>
          onPaginaChange(paginaActual + 1)
        }
      >
        <FiChevronRight />
      </Button>
    </div>
  );
};

export default Paginacion;
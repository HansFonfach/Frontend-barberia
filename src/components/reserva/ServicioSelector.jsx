// src/views/admin/pages/components/ServicioStep.jsx
import { listarCategoriasPublico } from "api/categoria";
import React, { useState, useEffect } from "react";
import { FormGroup, Label, Row, Col, Button, Spinner } from "reactstrap";

const useCategoriasPublicas = (slug) => {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!slug) {
      setCategorias([]);
      setCargando(false);
      return;
    }

    let activo = true;

    const cargar = async () => {
      if (!activo) return;
      try {
        setCargando(true);
        const res = await listarCategoriasPublico(slug);
        if (!activo) return;

        const nuevas = res?.data || res || [];

        setCategorias((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(nuevas)) return prev;
          return nuevas;
        });
      } catch (error) {
        console.error("❌ Error al cargar categorías:", error);
        if (activo) setCategorias([]);
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, [slug]); // 👈 Si el padre cambia el string del slug, esto se dispara.

  return { categorias, cargandoCategorias: cargando };
};

const ChipsCategoria = ({
  categorias,
  categoriaActiva,
  setCategoriaActiva,
  hayServiciosSinCategoria,
}) => (
  <div className="d-flex flex-wrap gap-2 mb-3">
    <Button
      size="sm"
      color={categoriaActiva === null ? "success" : "outline-success"}
      onClick={() => setCategoriaActiva(null)}
      style={{ borderRadius: "20px", fontSize: "13px" }}
    >
      Todos
    </Button>

    {categorias.map((c) => (
      <Button
        key={c._id}
        size="sm"
        color={categoriaActiva === c._id ? "success" : "outline-success"}
        onClick={() => setCategoriaActiva(c._id)}
        style={{ borderRadius: "20px", fontSize: "13px" }}
      >
        {c.nombre}
      </Button>
    ))}

    {hayServiciosSinCategoria && (
      <Button
        size="sm"
        color={
          categoriaActiva === "SIN_CATEGORIA"
            ? "success"
            : "outline-success"
        }
        onClick={() => setCategoriaActiva("SIN_CATEGORIA")}
        style={{ borderRadius: "20px", fontSize: "13px" }}
      >
        Otros
      </Button>
    )}
  </div>
);

// 🔹 helper: obtiene el id de categoría de un servicio, soportando
// que venga populado ({_id, nombre}) o como id suelto (string)
const getCategoriaId = (s) => {
  if (!s.categoria) return null;
  return s.categoria._id || s.categoria;
};

const filtrarServicios = (servicios, categoriaActiva) => {
  if (categoriaActiva === null) return servicios; // "Todos"

  if (categoriaActiva === "SIN_CATEGORIA") {
    return servicios.filter((s) => !getCategoriaId(s));
  }

  return servicios.filter((s) => getCategoriaId(s) === categoriaActiva);
};

const ServicioSelector = ({
  servicios,
  servicio,
  onSeleccionarServicio,
  slug,
}) => {
  const { categorias, cargandoCategorias } = useCategoriasPublicas(slug);
  const [categoriaActiva, setCategoriaActiva] = useState(null);

  const hayServiciosSinCategoria = servicios.some((s) => !getCategoriaId(s));

  const serviciosFiltrados = filtrarServicios(servicios, categoriaActiva);

  return (
    <FormGroup className="mb-3">
      <Label className="font-weight-bold">Servicio</Label>

      {cargandoCategorias ? (
        <div className="mb-3">
          <Spinner size="sm" />{" "}
          <span className="text-muted">Cargando categorías...</span>
        </div>
      ) : (
        <ChipsCategoria
          categorias={categorias}
          categoriaActiva={categoriaActiva}
          setCategoriaActiva={setCategoriaActiva}
          hayServiciosSinCategoria={hayServiciosSinCategoria}
        />
      )}

      <Row className="g-2">
        {serviciosFiltrados.map((s) => (
          <Col key={s._id} xs="6" sm="4" lg="4" className="mb-2">
            <Button
              block
              color={servicio === s._id ? "success" : "outline-success"}
              onClick={() => onSeleccionarServicio(s._id)}
              style={{
                height: "60px",
                whiteSpace: "normal",
                wordWrap: "break-word",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "8px 4px",
                fontSize: "14px",
              }}
            >
              {s.nombre}
            </Button>
          </Col>
        ))}

        {serviciosFiltrados.length === 0 && (
          <Col xs="12">
            <p className="text-muted text-center mb-0">
              No hay servicios en esta categoría.
            </p>
          </Col>
        )}
      </Row>

      {/* Estilos para mantener consistencia en móvil */}
      <style>
        {`
          @media (max-width: 576px) {
            .btn {
              height: 70px !important;
              font-size: 13px !important;
              padding: 6px 2px !important;
            }
          }
        `}
      </style>
    </FormGroup>
  );
};

// Versión con duración y precio (si los necesitas) — mismo patrón de filtro
export const ServicioSelectorConDetalles = ({
  servicios,
  servicio,
  onSeleccionarServicio,
  slug,
}) => {
  const { categorias, cargandoCategorias } = useCategoriasPublicas(slug);
  const [categoriaActiva, setCategoriaActiva] = useState(null);

  const hayServiciosSinCategoria = servicios.some((s) => !getCategoriaId(s));

  const serviciosFiltrados = filtrarServicios(servicios, categoriaActiva);

  return (
    <FormGroup className="mb-3">
      <Label className="font-weight-bold">Servicio</Label>

      {cargandoCategorias ? (
        <div className="mb-3">
          <Spinner size="sm" />{" "}
          <span className="text-muted">Cargando categorías...</span>
        </div>
      ) : (
        <ChipsCategoria
          categorias={categorias}
          categoriaActiva={categoriaActiva}
          setCategoriaActiva={setCategoriaActiva}
          hayServiciosSinCategoria={hayServiciosSinCategoria}
        />
      )}

      <Row className="g-2">
        {serviciosFiltrados.map((s) => (
          <Col key={s._id} xs="6" sm="4" lg="4" className="mb-2">
            <Button
              block
              color={servicio === s._id ? "success" : "outline-success"}
              onClick={() => onSeleccionarServicio(s._id)}
              style={{
                height: "80px",
                whiteSpace: "normal",
                wordWrap: "break-word",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "8px 4px",
                lineHeight: 1.3,
              }}
            >
              <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                {s.nombre}
              </span>
              {(s.duracionMin || s.precio) && (
                <span
                  style={{ fontSize: "11px", opacity: 0.9, marginTop: "2px" }}
                >
                  {s.duracionMin && `⏱️ ${s.duracionMin}min`}
                  {s.duracionMin && s.precio && " • "}
                  {s.precio && `$${s.precio}`}
                </span>
              )}
            </Button>
          </Col>
        ))}

        {serviciosFiltrados.length === 0 && (
          <Col xs="12">
            <p className="text-muted text-center mb-0">
              No hay servicios en esta categoría.
            </p>
          </Col>
        )}
      </Row>

      <style>
        {`
          @media (max-width: 576px) {
            .btn {
              height: 90px !important;
              font-size: 12px !important;
            }
          }
        `}
      </style>
    </FormGroup>
  );
};

export default ServicioSelector;

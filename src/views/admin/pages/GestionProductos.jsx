import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";
import Swal from "sweetalert2";
import {
  FiPackage,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiSearch,
} from "react-icons/fi";

import UserHeader from "components/Headers/UserHeader";
import ModalProducto from "components/gestionProductos/ModalProducto";
import { useProducto } from "context/ProductoContext";

/* ─── estilos inline para no depender de clases externas ─── */
const S = {
  page: {
    padding: "1.5rem 0",
  },
  card: {
    background: "var(--white)",
    borderRadius: 16,
    border: "1px solid #e9ecef",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  cardHeader: {
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid #f0f0f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    background: "#fff",
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    background: "#EEEDFE",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  title: {
    fontSize: 17,
    fontWeight: 600,
    color: "#1a1a2e",
    margin: 0,
  },
  subtitle: {
    fontSize: 12,
    color: "#8898aa",
    margin: 0,
  },
  searchWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: 10,
    color: "#8898aa",
    pointerEvents: "none",
  },
  searchInput: {
    paddingLeft: 32,
    paddingRight: 12,
    paddingTop: 7,
    paddingBottom: 7,
    border: "1px solid #e9ecef",
    borderRadius: 8,
    fontSize: 13,
    width: 200,
    outline: "none",
    background: "#fafafa",
    color: "#1a1a2e",
  },
  btnPrimary: {
    background: "#534AB7",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    whiteSpace: "nowrap",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
    gap: 10,
    padding: "1rem 1.5rem",
    borderBottom: "1px solid #f0f0f0",
    background: "#fafafa",
  },
  statCard: {
    background: "#fff",
    border: "1px solid #e9ecef",
    borderRadius: 10,
    padding: "10px 14px",
  },
  statLabel: {
    fontSize: 11,
    color: "#8898aa",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  statValue: {
    fontSize: 22,
    fontWeight: 600,
    color: "#1a1a2e",
    lineHeight: 1,
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  },
  th: {
    padding: "10px 16px",
    textAlign: "left",
    fontSize: 11,
    fontWeight: 600,
    color: "#8898aa",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    background: "#fafafa",
    borderBottom: "1px solid #f0f0f0",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "13px 16px",
    borderBottom: "1px solid #f5f5f5",
    color: "#1a1a2e",
    verticalAlign: "middle",
  },
  productIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: "#EEEDFE",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  productName: {
    fontWeight: 600,
    fontSize: 13,
    color: "#1a1a2e",
    marginBottom: 1,
  },
  productCat: {
    fontSize: 11,
    color: "#8898aa",
  },
  price: {
    fontWeight: 600,
    color: "#1a1a2e",
  },
  actionsCell: {
    display: "flex",
    gap: 4,
    justifyContent: "flex-end",
  },
  btnIcon: {
    width: 30,
    height: 30,
    borderRadius: 7,
    border: "1px solid #e9ecef",
    background: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#8898aa",
    transition: "all 0.15s",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.75rem 1.5rem",
    flexWrap: "wrap",
    gap: 8,
    borderTop: "1px solid #f0f0f0",
  },
  footerText: {
    fontSize: 12,
    color: "#8898aa",
  },
  pagination: {
    display: "flex",
    gap: 4,
  },
  pageBtn: {
    width: 28,
    height: 28,
    borderRadius: 7,
    border: "1px solid #e9ecef",
    background: "transparent",
    cursor: "pointer",
    fontSize: 12,
    color: "#8898aa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pageBtnActive: {
    background: "#534AB7",
    color: "#fff",
    border: "1px solid #534AB7",
  },
  emptyState: {
    textAlign: "center",
    padding: "3rem 1rem",
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "#EEEDFE",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1rem",
  },
};

/* ─── Badge de stock ─── */
const StockBadge = ({ stock }) => {
  if (stock === null)
    return (
      <span
        style={{
          background: "#E6F1FB",
          color: "#185FA5",
          padding: "3px 10px",
          borderRadius: 99,
          fontSize: 11,
          fontWeight: 500,
        }}
      >
        Sin control
      </span>
    );
  if (stock === 0)
    return (
      <span
        style={{
          background: "#FCEBEB",
          color: "#A32D2D",
          padding: "3px 10px",
          borderRadius: 99,
          fontSize: 11,
          fontWeight: 500,
        }}
      >
        Sin stock
      </span>
    );
  return <span style={{ fontWeight: 600 }}>{stock}</span>;
};

/* ─── Badge de estado ─── */
const EstadoBadge = ({ activo }) => (
  <span
    style={{
      background: activo ? "#ffffff" : "#F1EFE8",
      color: activo ? "#1130e4" : "#1b9ae4",
      padding: "3px 10px",
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 500,
    }}
  >
    {activo ? "Activo" : "Inactivo"}
  </span>
);

/* ─── Botón de acción ─── */
const BtnIcon = ({ children, onClick, danger }) => {
  const [hover, setHover] = useState(false);
  return (
    <button
      style={{
        ...S.btnIcon,
        ...(hover
          ? danger
            ? {
                borderColor: "#E24B4A",
                color: "#E24B4A",
                background: "#fff5f5",
              }
            : { borderColor: "#c5c5c5", color: "#444", background: "#f5f5f5" }
          : {}),
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

/* ─── Componente principal ─── */
const GestionProductos = () => {
  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState(false);
  const [productoEdit, setProductoEdit] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);

  const { productos, listarProductos, eliminarProducto } = useProducto();

  const ITEMS_POR_PAGINA = 8;

  useEffect(() => {
    listarProductos();
  }, [listarProductos]);

  const toggleModal = () => setModal((m) => !m);

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const totalPaginas = Math.ceil(productosFiltrados.length / ITEMS_POR_PAGINA);
  const indexInicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const productosPaginados = productosFiltrados.slice(
    indexInicio,
    indexInicio + ITEMS_POR_PAGINA,
  );

  /* stats */
  const stats = {
    total: productosFiltrados.length,
    activos: productosFiltrados.filter((p) => p.activo).length,
    sinStock: productosFiltrados.filter((p) => p.stock === 0).length,
    categorias: new Set(
      productosFiltrados.map((p) => p.categoria).filter(Boolean),
    ).size,
  };

  const handleCrear = () => {
    setProductoEdit(null);
    toggleModal();
  };

  const handleEditar = (producto) => {
    setProductoEdit(producto);
    toggleModal();
  };

  const handleEliminar = async (producto) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar producto?",
      text: producto.nombre,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#E24B4A",
    });
    if (!confirm.isConfirmed) return;
    await eliminarProducto({ id: producto._id });
  

    Swal.fire({
      icon: "success",
      title: "Producto eliminado",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleGuardar = () => {
    Swal.fire({
      icon: "success",
      title: productoEdit ? "Producto actualizado" : "Producto creado",
      timer: 1500,
      showConfirmButton: false,
    });
    toggleModal();
    listarProductos();
  };

  return (
    <>
      <UserHeader />

      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col xl="11" style={S.page}>
            <div style={S.card}>
              {/* ── Header ── */}
              <div style={S.cardHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={S.iconWrap}>
                    <FiPackage size={20} color="#534AB7" />
                  </div>
                  <div>
                    <p style={S.title}>Gestión de Productos</p>
                    <p style={S.subtitle}>Administra tu catálogo de ventas</p>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={S.searchWrap}>
                    <FiSearch size={14} style={S.searchIcon} />
                    <input
                      style={S.searchInput}
                      placeholder="Buscar producto..."
                      value={busqueda}
                      onChange={(e) => {
                        setBusqueda(e.target.value);
                        setPaginaActual(1);
                      }}
                    />
                  </div>
                  <button style={S.btnPrimary} onClick={handleCrear}>
                    <FiPlus size={14} /> Nuevo producto
                  </button>
                </div>
              </div>

              {/* ── Stats ── */}
              <div style={S.statsGrid}>
                {[
                  { label: "Total", value: stats.total },
                  { label: "Activos", value: stats.activos },
                  { label: "Sin stock", value: stats.sinStock },
                  { label: "Categorías", value: stats.categorias },
                ].map((s) => (
                  <div key={s.label} style={S.statCard}>
                    <div style={S.statLabel}>{s.label}</div>
                    <div style={S.statValue}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* ── Tabla o empty state ── */}
              {productosFiltrados.length === 0 ? (
                <div style={S.emptyState}>
                  <div style={S.emptyIcon}>
                    <FiPackage size={26} color="#534AB7" />
                  </div>
                  <p
                    style={{
                      fontWeight: 600,
                      color: "#1a1a2e",
                      marginBottom: 4,
                    }}
                  >
                    No hay productos registrados
                  </p>
                  <p
                    style={{ fontSize: 13, color: "#8898aa", marginBottom: 16 }}
                  >
                    Crea tu primer producto para comenzar.
                  </p>
                  <button style={S.btnPrimary} onClick={handleCrear}>
                    <FiPlus size={14} /> Crear producto
                  </button>
                </div>
              ) : (
                <>
                  <div style={S.tableWrap}>
                    <table style={S.table}>
                      <thead>
                        <tr>
                          <th style={S.th}>Producto</th>
                          <th style={S.th}>Precio</th>
                          <th style={S.th}>Stock</th>
                          <th style={S.th}>Estado</th>
                          <th style={{ ...S.th, textAlign: "right" }}>
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {productosPaginados.map((producto) => (
                          <tr key={producto._id}>
                            <td style={S.td}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                }}
                              >
                                <div style={S.productIcon}>
                                  <FiPackage size={16} color="#534AB7" />
                                </div>
                                <div>
                                  <div style={S.productName}>
                                    {producto.nombre}
                                  </div>
                                  <div style={S.productCat}>
                                    {producto.categoria || "Sin categoría"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={S.td}>
                              <span style={S.price}>
                                ${producto.precio?.toLocaleString("es-CL")}
                              </span>
                            </td>
                            <td style={S.td}>
                              <StockBadge stock={producto.stock} />
                            </td>
                            <td style={S.td}>
                              <EstadoBadge activo={producto.activo} />
                            </td>
                            <td style={{ ...S.td, textAlign: "right" }}>
                              <div style={S.actionsCell}>
                                <BtnIcon onClick={() => handleEditar(producto)}>
                                  <FiEye size={14} />
                                </BtnIcon>
                                <BtnIcon onClick={() => handleEditar(producto)}>
                                  <FiEdit size={14} />
                                </BtnIcon>
                                <BtnIcon
                                  danger
                                  onClick={() => handleEliminar(producto)}
                                >
                                  <FiTrash2 size={14} />
                                </BtnIcon>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* ── Footer / paginación ── */}
                  <div style={S.footer}>
                    <span style={S.footerText}>
                      Mostrando{" "}
                      {Math.min(
                        indexInicio + ITEMS_POR_PAGINA,
                        productosFiltrados.length,
                      )}{" "}
                      de {productosFiltrados.length} productos
                    </span>
                    <div style={S.pagination}>
                      {Array.from(
                        { length: totalPaginas },
                        (_, i) => i + 1,
                      ).map((n) => (
                        <button
                          key={n}
                          style={{
                            ...S.pageBtn,
                            ...(n === paginaActual ? S.pageBtnActive : {}),
                          }}
                          onClick={() => setPaginaActual(n)}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </Col>
        </Row>
      </Container>

      <ModalProducto
        isOpen={modal}
        toggle={toggleModal}
        producto={productoEdit}
        onSave={handleGuardar}
      />
    </>
  );
};

export default GestionProductos;

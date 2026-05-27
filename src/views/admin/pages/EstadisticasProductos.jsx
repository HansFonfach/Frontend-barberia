import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";
import UserHeader from "components/Headers/UserHeader";
import { useProducto } from "context/ProductoContext";
import {
  FiPackage,
  FiTrendingUp,
  FiAlertTriangle,
  FiDollarSign,
} from "react-icons/fi";
import { useEstadisticas } from "context/EstadisticasContext";

const fmt = (n) => Number(n || 0).toLocaleString("es-CL");
const fmtFecha = (d) =>
  new Date(d).toLocaleDateString("es-CL", { day: "2-digit", month: "short" });

const StatCard = ({ label, value, sub, icon: Icon, accent }) => (
  <div
    style={{
      background: "#fff",
      border: "0.5px solid #e8e8e8",
      borderRadius: 12,
      padding: "1.25rem 1.5rem",
      display: "flex",
      alignItems: "flex-start",
      gap: 14,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: accent + "18",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon size={18} color={accent} />
    </div>
    <div>
      <div
        style={{
          fontSize: 11,
          color: "#aaa",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: "#1a1a1a",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>{sub}</div>
      )}
    </div>
  </div>
);

const SectionTitle = ({ children }) => (
  <div
    style={{
      fontSize: 11,
      fontWeight: 500,
      color: "#aaa",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      marginBottom: 12,
    }}
  >
    {children}
  </div>
);

const thS = {
  padding: "9px 14px",
  fontSize: 11,
  fontWeight: 500,
  color: "#aaa",
  letterSpacing: "0.04em",
  background: "#fafafa",
  borderBottom: "0.5px solid #efefef",
  textAlign: "left",
  whiteSpace: "nowrap",
};
const tdS = {
  padding: "12px 14px",
  fontSize: 13,
  borderBottom: "0.5px solid #f5f5f5",
  color: "#1a1a1a",
  verticalAlign: "middle",
};

const EstadisticasProductos = () => {
  const { verEstadisticasProductos } = useEstadisticas();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await verEstadisticasProductos();
        console.log("estadisticas:", res);
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const card = {
    background: "#fff",
    border: "0.5px solid #e8e8e8",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  };

  const {
    totalMes = 0,
    ventasRecientes = [],
    masVendidos = [],
    stockBajo = [],
  } = data || {};

  return (
    <>
      <UserHeader />

      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col xl="11">
            {/* ── cabecera — DENTRO del container para que quede sobre las cards ── */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: "#fff",
                  margin: 0,
                }}
              >
                Estadísticas de productos
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.7)",
                  margin: 0,
                }}
              >
                Ventas del mes actual
              </p>
            </div>

            {/* stat cards */}
            {loading ? (
              <div
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  padding: "3rem",
                  textAlign: "center",
                  color: "#aaa",
                  fontSize: 13,
                }}
              >
                Cargando estadísticas...
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 12,
                    marginBottom: "1.5rem",
                  }}
                >
                  <StatCard
                    label="Total vendido"
                    value={`$${fmt(totalMes)}`}
                    sub="este mes"
                    icon={FiDollarSign}
                    accent="#534AB7"
                  />
                  <StatCard
                    label="Ventas"
                    value={ventasRecientes.length}
                    sub="transacciones"
                    icon={FiPackage}
                    accent="#185FA5"
                  />
                  <StatCard
                    label="Productos distintos"
                    value={masVendidos.length}
                    sub="vendidos este mes"
                    icon={FiTrendingUp}
                    accent="#3B6D11"
                  />
                  <StatCard
                    label="Stock bajo"
                    value={stockBajo.length}
                    sub={
                      stockBajo.length > 0
                        ? "productos por reponer"
                        : "todo en orden"
                    }
                    icon={FiAlertTriangle}
                    accent={stockBajo.length > 0 ? "#A32D2D" : "#3B6D11"}
                  />
                </div>

                <Row>
                  <Col lg="8" className="mb-4">
                    <SectionTitle>Ventas recientes</SectionTitle>
                    <div style={{ ...card, marginBottom: "1.5rem" }}>
                      {ventasRecientes.length === 0 ? (
                        <div
                          style={{
                            padding: "2.5rem",
                            textAlign: "center",
                            color: "#aaa",
                            fontSize: 13,
                          }}
                        >
                          Sin ventas este mes
                        </div>
                      ) : (
                        <div style={{ overflowX: "auto" }}>
                          <table
                            style={{
                              width: "100%",
                              borderCollapse: "collapse",
                              fontSize: 13,
                            }}
                          >
                            <thead>
                              <tr>
                                <th style={thS}>Fecha</th>
                                <th style={thS}>Cliente</th>
                                <th style={thS}>Producto</th>
                                <th style={thS}>Cant.</th>
                                <th style={{ ...thS, textAlign: "right" }}>
                                  Total
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {ventasRecientes.map((v, i) => (
                                <tr
                                  key={i}
                                  onMouseEnter={(e) =>
                                    Array.from(e.currentTarget.cells).forEach(
                                      (c) => (c.style.background = "#fafafa"),
                                    )
                                  }
                                  onMouseLeave={(e) =>
                                    Array.from(e.currentTarget.cells).forEach(
                                      (c) => (c.style.background = ""),
                                    )
                                  }
                                >
                                  <td style={tdS}>{fmtFecha(v.fecha)}</td>
                                  <td style={tdS}>{v.cliente}</td>
                                  <td style={tdS}>
                                    <span style={{ fontWeight: 500 }}>
                                      {v.producto}
                                    </span>
                                  </td>
                                  <td style={tdS}>{v.cantidad}</td>
                                  <td
                                    style={{
                                      ...tdS,
                                      textAlign: "right",
                                      fontWeight: 600,
                                    }}
                                  >
                                    ${fmt(v.subtotal)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    <SectionTitle>Más vendidos</SectionTitle>
                    <div style={card}>
                      {masVendidos.length === 0 ? (
                        <div
                          style={{
                            padding: "2.5rem",
                            textAlign: "center",
                            color: "#aaa",
                            fontSize: 13,
                          }}
                        >
                          Sin datos este mes
                        </div>
                      ) : (
                        masVendidos.map((p, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 14,
                              padding: "12px 16px",
                              borderBottom:
                                i < masVendidos.length - 1
                                  ? "0.5px solid #f5f5f5"
                                  : "none",
                            }}
                          >
                            <div
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 8,
                                background: "#f5f5f5",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#aaa",
                                flexShrink: 0,
                              }}
                            >
                              {i + 1}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500, fontSize: 13 }}>
                                {p.nombre}
                              </div>
                              <div style={{ fontSize: 12, color: "#aaa" }}>
                                {p.unidades} unidades
                              </div>
                            </div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>
                              ${fmt(p.total)}
                            </div>
                            <div
                              style={{
                                width: 60,
                                background: "#f0f0f0",
                                borderRadius: 99,
                                height: 4,
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  borderRadius: 99,
                                  background: "#534AB7",
                                  width: `${Math.round((p.unidades / masVendidos[0].unidades) * 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Col>

                  <Col lg="4" className="mb-4">
                    <SectionTitle>Alertas de stock</SectionTitle>
                    <div style={card}>
                      {stockBajo.length === 0 ? (
                        <div style={{ padding: "2rem", textAlign: "center" }}>
                          <div
                            style={{
                              fontSize: 13,
                              color: "#3B6D11",
                              fontWeight: 500,
                            }}
                          >
                            ✓ Todo en orden
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#aaa",
                              marginTop: 4,
                            }}
                          >
                            Ningún producto bajo en stock
                          </div>
                        </div>
                      ) : (
                        stockBajo.map((p, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "12px 16px",
                              borderBottom:
                                i < stockBajo.length - 1
                                  ? "0.5px solid #f5f5f5"
                                  : "none",
                            }}
                          >
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 500 }}>
                                {p.nombre}
                              </div>
                              <div style={{ fontSize: 11, color: "#aaa" }}>
                                quedan {p.stock} unidades
                              </div>
                            </div>
                            <span
                              style={{
                                background:
                                  p.stock <= 1 ? "#FCEBEB" : "#FFF3CD",
                                color: p.stock <= 1 ? "#A32D2D" : "#856404",
                                fontSize: 11,
                                fontWeight: 500,
                                padding: "2px 8px",
                                borderRadius: 99,
                              }}
                            >
                              {p.stock <= 1 ? "Crítico" : "Bajo"}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </Col>
                </Row>
              </>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default EstadisticasProductos;

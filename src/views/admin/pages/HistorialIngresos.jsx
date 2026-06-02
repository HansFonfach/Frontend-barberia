import React, { useState } from "react";
import { Container, Row, Col, Card, CardBody } from "reactstrap";
import { DollarSign, TrendingUp, ShoppingBag, Sparkles, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import UserHeader from "components/Headers/UserHeader";
import { useEstadisticas } from "context/EstadisticasContext";

const MESES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

const HistorialIngresos = () => {
  const { verHistorialDeIngresos } = useEstadisticas();

  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [buscado, setBuscado] = useState(false);

  const formatMoney = (v) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency", currency: "CLP", minimumFractionDigits: 0,
    }).format(v || 0);

  const irMesAnterior = () => {
    if (mes === 0) { setMes(11); setAnio((a) => a - 1); }
    else setMes((m) => m - 1);
  };

  const irMesSiguiente = () => {
    const esActual = mes === hoy.getMonth() && anio === hoy.getFullYear();
    if (esActual) return;
    if (mes === 11) { setMes(0); setAnio((a) => a + 1); }
    else setMes((m) => m + 1);
  };

  const consultar = async () => {
    setLoading(true);
    setBuscado(false);
    try {
      const res = await verHistorialDeIngresos(mes, anio);
      setData(res);
      setBuscado(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const esMesActual = mes === hoy.getMonth() && anio === hoy.getFullYear();
  const esMesFuturo =
    anio > hoy.getFullYear() ||
    (anio === hoy.getFullYear() && mes > hoy.getMonth());

  const detalles = data?.detalle || {};

  const items = [
    {
      label: "Servicios",
      value: detalles.ingresoReservas,
      icon: <Calendar size={18} />,
      color: "#4f46e5",
      bg: "#eef2ff",
    },
    {
      label: "Suscripciones",
      value: detalles.ingresoSuscripciones,
      icon: <TrendingUp size={18} />,
      color: "#0891b2",
      bg: "#ecfeff",
    },
    {
      label: "Productos",
      value: detalles.ingresoProductos,
      icon: <ShoppingBag size={18} />,
      color: "#059669",
      bg: "#ecfdf5",
    },
    {
      label: "Extras",
      value: detalles.ingresoExtras,
      icon: <Sparkles size={18} />,
      color: "#d97706",
      bg: "#fffbeb",
    },
  ];

  return (
    <>
      <UserHeader />
      <Container fluid className="mt--7 pb-5 px-3 px-md-4" style={{ background: "#f7f9fc", minHeight: "100vh" }}>

        {/* Título */}
        <Row className="mb-4">
          <Col xs="12">
            <div className="d-flex align-items-center mb-1">
              <DollarSign size={22} className="mr-2" style={{ color: "#4f46e5" }} />
              <h3 className="mb-0" style={{ fontWeight: 700 }}>Historial de Ingresos</h3>
            </div>
            <p className="text-muted  text-white mb-0" style={{ fontSize: "0.9rem" }}>
              Consulta los ingresos de cualquier mes
            </p>
          </Col>
        </Row>

        {/* Selector de mes */}
        <Row className="mb-4">
          <Col xs="12" md="6" lg="5">
            <Card className="border-0 shadow-sm" style={{ borderRadius: 16 }}>
              <CardBody className="p-3 p-md-4">
                <p className="text-muted mb-2" style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  Período
                </p>

                {/* Navegación mes */}
                <div className="d-flex align-items-center justify-content-between mb-3"
                  style={{ background: "#f1f5f9", borderRadius: 12, padding: "10px 14px" }}>
                  <button
                    onClick={irMesAnterior}
                    style={{ border: "none", background: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 8, color: "#64748b" }}
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <span style={{ fontWeight: 700, fontSize: "1rem", color: "#1e293b" }}>
                    {MESES[mes]} {anio}
                  </span>

                  <button
                    onClick={irMesSiguiente}
                    disabled={esMesActual}
                    style={{
                      border: "none", background: "none", cursor: esMesActual ? "not-allowed" : "pointer",
                      padding: "4px 8px", borderRadius: 8,
                      color: esMesActual ? "#cbd5e1" : "#64748b"
                    }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                <button
                  onClick={consultar}
                  disabled={loading || esMesFuturo}
                  style={{
                    width: "100%", border: "none", borderRadius: 10, padding: "10px",
                    background: esMesFuturo ? "#e2e8f0" : "linear-gradient(135deg, #4f46e5, #7c3aed)",
                    color: esMesFuturo ? "#94a3b8" : "white",
                    fontWeight: 600, fontSize: "0.9rem", cursor: esMesFuturo ? "not-allowed" : "pointer",
                    transition: "opacity 0.2s",
                  }}
                >
                  {loading ? "Consultando..." : esMesFuturo ? "Mes no disponible" : `Ver ${MESES[mes]}`}
                </button>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Resultados */}
        {buscado && data && (
          <>
            {/* Total */}
            <Row className="mb-3">
              <Col xs="12">
                <div style={{
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  borderRadius: 16, padding: "20px 28px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  flexWrap: "wrap", gap: 12,
                  boxShadow: "0 8px 24px rgba(79,70,229,0.25)"
                }}>
                  <div>
                    <p style={{ color: "rgba(255,255,255,0.75)", margin: 0, fontSize: "0.85rem", fontWeight: 500 }}>
                      Ingreso total — {MESES[mes]} {anio}
                    </p>
                    <h2 style={{ color: "white", margin: 0, fontWeight: 800, fontSize: "clamp(1.5rem, 5vw, 2rem)" }}>
                      {formatMoney(data.ingresoTotal)}
                    </h2>
                  </div>
                  <DollarSign size={40} style={{ color: "rgba(255,255,255,0.2)" }} />
                </div>
              </Col>
            </Row>

            {/* Desglose */}
            <Row className="mb-3">
              {items.map((item, i) => (
                <Col key={i} xs="6" lg="3" className="mb-3">
                  <Card className="border-0 shadow-sm h-100" style={{ borderRadius: 14 }}>
                    <CardBody className="p-3" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: item.bg, display: "flex", alignItems: "center",
                        justifyContent: "center", color: item.color
                      }}>
                        {item.icon}
                      </div>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                        {item.label}
                      </p>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: "1.1rem", color: "#1e293b" }}>
                        {formatMoney(item.value)}
                      </p>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Posible ingreso — solo mes actual */}
            {esMesActual && detalles.posibleIngreso != null && (
              <Row>
                <Col xs="12" md="6">
                  <Card className="border-0 shadow-sm" style={{ borderRadius: 14, borderLeft: "4px solid #0891b2" }}>
                    <CardBody className="p-3 d-flex justify-content-between align-items-center">
                      <div>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>
                          Posible ingreso (reservas pendientes)
                        </p>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: "1.1rem", color: "#0891b2" }}>
                          {formatMoney(detalles.posibleIngreso)}
                        </p>
                      </div>
                      <TrendingUp size={28} style={{ color: "#bae6fd" }} />
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            )}
          </>
        )}

        {/* Estado vacío */}
        {!buscado && !loading && (
          <Row>
            <Col xs="12">
              <div style={{
                textAlign: "center", padding: "48px 24px",
                background: "white", borderRadius: 16,
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
              }}>
                <DollarSign size={40} style={{ color: "#e2e8f0", marginBottom: 12 }} />
                <p style={{ color: "#94a3b8", margin: 0 }}>
                  Selecciona un mes y presiona consultar
                </p>
              </div>
            </Col>
          </Row>
        )}

      </Container>
    </>
  );
};

export default HistorialIngresos;
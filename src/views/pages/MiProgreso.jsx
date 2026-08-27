import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody, Badge, Spinner } from "reactstrap";
import { Flame, Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import UserHeader from "components/Headers/UserHeader.js";
import { useProgresoCliente } from "context/ProgresoClienteContext";
import BitacoraCorporal from "components/gimnasio/BitacoraCorporal";

/**
 * "Mi progreso": lo que el cliente ve de sí mismo dentro de su gimnasio.
 *
 * Todo lo de racha/resumen/hitos viene calculado desde sus asistencias
 * reales — nada se inventa ni se "gamifica" con números falsos: si no ha
 * ido a clases, no hay racha ni hitos que mostrar.
 *
 * La bitácora de peso/medidas (BitacoraCorporal) es compartida con
 * "Mi entrenamiento" — es el mismo dato corporal sin importar si el
 * cliente asiste a clases o entrena por su cuenta.
 */

const HITOS_ICONOS = {
  10: "🥉",
  25: "🥈",
  50: "🥇",
  100: "🏆",
  200: "⭐",
  365: "🔥",
  500: "👑",
};

const colorVariacion = (v) =>
  v === null || v === undefined ? "secondary" : v > 0 ? "success" : v < 0 ? "danger" : "secondary";

const IconoVariacion = ({ v }) => {
  if (v === null || v === undefined || v === 0) return <Minus size={14} />;
  return v > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />;
};

const MiProgreso = () => {
  const { miProgreso } = useProgresoCliente();

  const [progreso, setProgreso] = useState(null);
  const [cargandoProgreso, setCargandoProgreso] = useState(true);

  const cargarProgreso = async () => {
    setCargandoProgreso(true);
    const data = await miProgreso();
    setProgreso(data);
    setCargandoProgreso(false);
  };

  useEffect(() => {
    cargarProgreso();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <UserHeader />
      <Container className="mt--7 mb-5" fluid>
        <Row className="justify-content-center">
          <Col xl="10" lg="11">
            <Card className="border-0 shadow-sm mb-5" style={{ borderRadius: 16 }}>
              <CardBody className="text-center py-5">
                <div className="bg-success rounded-circle d-inline-flex p-3 mb-3 shadow-sm">
                  <Flame size={28} className="text-white" />
                </div>
                <h1 className="font-weight-bold display-4">Mi progreso</h1>
                <p className="text-muted lead mb-0">
                  Tu constancia y tu bitácora personal, basadas en tus datos reales
                </p>
              </CardBody>
            </Card>

            {cargandoProgreso ? (
              <div className="text-center py-5">
                <Spinner color="success" />
              </div>
            ) : (
              <>
                {/* ===== RACHA + RESUMEN MENSUAL ===== */}
                <Row className="mb-4">
                  <Col md="6" className="mb-4 mb-md-0">
                    <Card className="border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
                      <CardBody className="p-4 text-center">
                        <Flame size={32} className="text-warning mb-2" />
                        {progreso.rachaSemanas > 0 ? (
                          <>
                            <h2 className="font-weight-bold mb-0">
                              {progreso.rachaSemanas} semana
                              {progreso.rachaSemanas !== 1 ? "s" : ""} seguida
                              {progreso.rachaSemanas !== 1 ? "s" : ""}
                            </h2>
                            <p className="text-muted small mb-0">
                              entrenando al menos 1 vez por semana
                            </p>
                          </>
                        ) : (
                          <>
                            <h2 className="font-weight-bold mb-0 text-muted">
                              Sin racha activa
                            </h2>
                            <p className="text-muted small mb-0">
                              agenda una clase esta semana para empezar una
                            </p>
                          </>
                        )}
                      </CardBody>
                    </Card>
                  </Col>

                  <Col md="6">
                    <Card className="border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
                      <CardBody className="p-4 text-center">
                        <p className="text-muted small mb-1">Clases este mes</p>
                        <h2 className="font-weight-bold mb-1">{progreso.esteMes}</h2>
                        <Badge color={colorVariacion(progreso.variacionMes)} pill>
                          <IconoVariacion v={progreso.variacionMes} />{" "}
                          {progreso.variacionMes === null
                            ? "Sin mes anterior para comparar"
                            : `${progreso.variacionMes > 0 ? "+" : ""}${progreso.variacionMes}% vs. mes anterior (${progreso.mesAnterior})`}
                        </Badge>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>

                {/* ===== HITOS ===== */}
                <Card className="border-0 shadow-sm mb-5" style={{ borderRadius: 16 }}>
                  <CardBody className="p-4">
                    <div className="d-flex align-items-center mb-3">
                      <Trophy size={20} className="text-warning mr-2" />
                      <h4 className="mb-0">Hitos</h4>
                    </div>

                    {progreso.totalHistorico === 0 ? (
                      <p className="text-muted small mb-0">
                        Todavía no tienes clases registradas. Cuando empieces a
                        entrenar, tus hitos van a ir apareciendo acá.
                      </p>
                    ) : (
                      <>
                        <div className="d-flex flex-wrap" style={{ gap: 12 }}>
                          {progreso.hitos.map((h) => (
                            <div
                              key={h.valor}
                              className="text-center"
                              style={{
                                minWidth: 84,
                                padding: "10px 6px",
                                borderRadius: 12,
                                border: h.alcanzado
                                  ? "2px solid #2dce89"
                                  : "2px solid #e9ecef",
                                background: h.alcanzado ? "#E6F9F0" : "#fafafa",
                                opacity: h.alcanzado ? 1 : 0.6,
                              }}
                            >
                              <div style={{ fontSize: 22 }}>
                                {HITOS_ICONOS[h.valor] || "🎯"}
                              </div>
                              <strong style={{ fontSize: 13 }}>
                                {h.valor} clases
                              </strong>
                            </div>
                          ))}
                        </div>

                        <p className="text-muted small mt-3 mb-0">
                          Llevas <strong>{progreso.totalHistorico}</strong> clases
                          en total.{" "}
                          {progreso.proximoHito
                            ? `Te faltan ${progreso.faltanParaProximoHito} para llegar a ${progreso.proximoHito}.`
                            : "¡Ya alcanzaste todos los hitos disponibles!"}
                        </p>
                      </>
                    )}
                  </CardBody>
                </Card>

                {/* ===== BITÁCORA (compartida con Mi entrenamiento) ===== */}
                <BitacoraCorporal />
              </>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default MiProgreso;

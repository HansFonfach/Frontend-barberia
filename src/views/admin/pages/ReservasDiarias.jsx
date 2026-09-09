import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Container,
  Row,
  Col,
  Input,
} from "reactstrap";

import UserHeader from "components/Headers/UserHeader";

import { useReserva } from "context/ReservaContext";
import { useEmpresa } from "context/EmpresaContext";
import { useHorario } from "context/HorarioContext";

import ReservaCardMobile from "../../../components/gestionReservas/ReservaCardMobile";
import ReservaTableDesktop from "../../../components/gestionReservas/ReservaTableDesktop";
import ReservaDetalleModal from "../../../components/gestionReservas/ReservaDetalleModal";
import ReagendarModal from "../../../components/gestionReservas/ReagendarModal";
import ReservasSemana from "../../../components/gestionReservas/ReservasSemana";

// ─── Helpers de semana (lunes a domingo) ──────────────────────────────────
const aYYYYMMDD = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// Devuelve el lunes (yyyy-mm-dd) de la semana a la que pertenece fechaStr.
const lunesDeSemana = (fechaStr) => {
  const d = new Date(fechaStr + "T00:00:00");
  const dia = d.getDay(); // 0=domingo...6=sábado
  const diff = dia === 0 ? -6 : 1 - dia;
  d.setDate(d.getDate() + diff);
  return aYYYYMMDD(d);
};

// Array de 7 fechas (yyyy-mm-dd) desde el lunes dado.
const diasDeSemanaDesde = (lunesStr) => {
  const base = new Date(lunesStr + "T00:00:00");
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    return aYYYYMMDD(d);
  });
};

const formatoRangoSemana = (dias) => {
  if (!dias?.length) return "";
  const inicio = new Date(dias[0] + "T00:00:00");
  const fin = new Date(dias[dias.length - 1] + "T00:00:00");
  const mismoMes = inicio.getMonth() === fin.getMonth();

  // Si es el mismo mes: "Semana del 8 al 14 de septiembre".
  // Si cruza de mes: "Semana del 29 de sept. al 5 de octubre".
  const inicioTxt = mismoMes
    ? inicio.toLocaleDateString("es-CL", { day: "numeric" })
    : inicio.toLocaleDateString("es-CL", { day: "numeric", month: "short" });
  const finTxt = fin.toLocaleDateString("es-CL", { day: "numeric", month: "long" });

  return `Semana del ${inicioTxt} al ${finTxt}`;
};

const GestionReservas = () => {
  const {
    reservas,
    getReservasPorFechaBarbero,
    loading,
    cancelarReserva,
    marcarReservaNoAsistida,
    reagendarReserva,
  } = useReserva();

  const { empresa } = useEmpresa();
  const { getHorasDisponiblesBarbero } = useHorario();

  const [modal, setModal] = useState(false);
  const [modalReagendar, setModalReagendar] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

  const [filtroFecha, setFiltroFecha] = useState(
    new Date().toISOString().split("T")[0],
  );

  // "dia" = comportamiento de siempre (fecha puntual). "semana" = calendario
  // semanal completo, con navegación semana a semana.
  const [modoVista, setModoVista] = useState("dia");
  const [semanaInicio, setSemanaInicio] = useState(() =>
    lunesDeSemana(new Date().toISOString().split("T")[0]),
  );
  const diasSemana = diasDeSemanaDesde(semanaInicio);

  const [vistaMobile, setVistaMobile] = useState(false);

  const [nuevaFecha, setNuevaFecha] = useState("");
  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);
  const [loadingHoras, setLoadingHoras] = useState(false);
  const [extrasSeleccionados, setExtrasSeleccionados] = useState([]);

  useEffect(() => {
    if (modoVista === "dia") {
      getReservasPorFechaBarbero(filtroFecha);
    } else {
      const domingo = diasSemana[diasSemana.length - 1];
      getReservasPorFechaBarbero(semanaInicio, domingo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modoVista, filtroFecha, semanaInicio]);

  const irSemanaAnterior = () => {
    const d = new Date(semanaInicio + "T00:00:00");
    d.setDate(d.getDate() - 7);
    setSemanaInicio(aYYYYMMDD(d));
  };

  const irSemanaSiguiente = () => {
    const d = new Date(semanaInicio + "T00:00:00");
    d.setDate(d.getDate() + 7);
    setSemanaInicio(aYYYYMMDD(d));
  };

  const irSemanaActual = () => {
    setSemanaInicio(lunesDeSemana(new Date().toISOString().split("T")[0]));
  };

  useEffect(() => {
    const checkMobile = () => setVistaMobile(window.innerWidth < 768);

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleVerReserva = (reserva) => {
    setReservaSeleccionada(reserva);
    setModal(true);
  };

  // GestionReservas.jsx - agrega este handler
  const handleAbrirReagendar = () => {
    setNuevaFecha("");
    setHorasDisponibles([]);
    setHoraSeleccionada(null);
    setModalReagendar(true);
  };

  return (
    <>
      <UserHeader />

      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col xl="10" lg="12">
            <Card className="bg-secondary shadow">
              <CardHeader className="bg-white border-0">
                <Row className="align-items-center">
                  <Col md="5" className="mb-2 mb-md-0">
                    <h3 className="mb-0">Gestión de Reservas</h3>
                  </Col>

                  <Col md="3" className="mb-2 mb-md-0">
                    {/* Selector Día / Semana */}
                    <div
                      style={{
                        display: "inline-flex",
                        background: "#f4f6fb",
                        borderRadius: 10,
                        padding: 3,
                        gap: 2,
                      }}
                    >
                      {[
                        { key: "dia", label: "Día" },
                        { key: "semana", label: "Semana" },
                      ].map((op) => (
                        <button
                          key={op.key}
                          type="button"
                          onClick={() => setModoVista(op.key)}
                          style={{
                            border: "none",
                            borderRadius: 8,
                            padding: "6px 16px",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            background: modoVista === op.key ? "#fff" : "transparent",
                            color: modoVista === op.key ? "#4361ee" : "#8898aa",
                            boxShadow:
                              modoVista === op.key
                                ? "0 1px 3px rgba(0,0,0,0.12)"
                                : "none",
                            transition: "all 0.15s",
                          }}
                        >
                          {op.label}
                        </button>
                      ))}
                    </div>
                  </Col>

                  <Col md="4">
                    {modoVista === "dia" ? (
                      <Input
                        type="date"
                        value={filtroFecha}
                        onChange={(e) => setFiltroFecha(e.target.value)}
                      />
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          type="button"
                          onClick={irSemanaAnterior}
                          aria-label="Semana anterior"
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 8,
                            border: "1px solid #e9ecef",
                            background: "#fff",
                            color: "#4361ee",
                            cursor: "pointer",
                          }}
                        >
                          ‹
                        </button>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#1a1a2e",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatoRangoSemana(diasSemana)}
                        </span>
                        <button
                          type="button"
                          onClick={irSemanaSiguiente}
                          aria-label="Semana siguiente"
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 8,
                            border: "1px solid #e9ecef",
                            background: "#fff",
                            color: "#4361ee",
                            cursor: "pointer",
                          }}
                        >
                          ›
                        </button>
                        <button
                          type="button"
                          onClick={irSemanaActual}
                          style={{
                            borderRadius: 8,
                            border: "1px solid #D9D5F5",
                            background: "transparent",
                            color: "#4361ee",
                            fontSize: 12,
                            fontWeight: 600,
                            padding: "5px 12px",
                            cursor: "pointer",
                          }}
                        >
                          Hoy
                        </button>
                      </div>
                    )}
                  </Col>
                </Row>
              </CardHeader>

              <CardBody>
                {modoVista === "semana" ? (
                  <ReservasSemana
                    reservas={reservas}
                    diasSemana={diasSemana}
                    loading={loading}
                    onVer={handleVerReserva}
                    isMobile={vistaMobile}
                  />
                ) : vistaMobile ? (
                  <ReservaCardMobile
                    reservas={reservas}
                    empresa={empresa}
                    onVer={handleVerReserva}
                    isLoading={loading}
                  />
                ) : (
                  <ReservaTableDesktop
                    reservas={reservas}
                    empresa={empresa}
                    onVer={handleVerReserva}
                    isLoading={loading}
                  />
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <ReservaDetalleModal
        modal={modal}
        setModal={setModal}
        reservaSeleccionada={reservaSeleccionada}
        setReservaSeleccionada={setReservaSeleccionada}
        vistaMobile={vistaMobile}
        cancelarReserva={cancelarReserva}
        marcarReservaNoAsistida={marcarReservaNoAsistida}
        setModalReagendar={setModalReagendar}
        extrasSeleccionados={extrasSeleccionados}
        setExtrasSeleccionados={setExtrasSeleccionados}
      />

      <ReagendarModal
        modal={modalReagendar}
        setModal={setModalReagendar}
        reservaSeleccionada={reservaSeleccionada}
        nuevaFecha={nuevaFecha}
        setNuevaFecha={setNuevaFecha}
        horasDisponibles={horasDisponibles}
        setHorasDisponibles={setHorasDisponibles}
        horaSeleccionada={horaSeleccionada}
        setHoraSeleccionada={setHoraSeleccionada}
        loadingHoras={loadingHoras}
        setLoadingHoras={setLoadingHoras}
        getHorasDisponiblesBarbero={getHorasDisponiblesBarbero}
        reagendarReserva={reagendarReserva}
      />
    </>
  );
};

export default GestionReservas;

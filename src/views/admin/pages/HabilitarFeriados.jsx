import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Container, Spinner } from "reactstrap";
import { CalendarCheck, CalendarX } from "lucide-react";

import UserHeader from "components/Headers/UserHeader";
import { useAuth } from "context/AuthContext";
import { useHorario } from "context/HorarioContext";

const formatearFecha = (fechaStr) => {
  const [anio, mes, dia] = fechaStr.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  return fecha.toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

const HabilitarFeriados = () => {
  const { user } = useAuth();
  const barbero = user?.id || user?._id;

  const { obtenerFeriadosConEstado, toggleTrabajoFeriado } = useHorario();

  const [feriados, setFeriados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardandoId, setGuardandoId] = useState(null);

  useEffect(() => {
    if (!barbero) return;

    const cargar = async () => {
      setCargando(true);
      const data = await obtenerFeriadosConEstado(barbero);
      setFeriados(data);
      setCargando(false);
    };

    cargar();
  }, [barbero]);

  const onToggle = async (feriado) => {
    try {
      setGuardandoId(feriado.id);
      const res = await toggleTrabajoFeriado(barbero, feriado.fecha);

      setFeriados((prev) =>
        prev.map((f) =>
          f.id === feriado.id ? { ...f, trabaja: res.trabaja } : f,
        ),
      );
    } catch (error) {
      console.error("❌ Error al cambiar el feriado:", error);
    } finally {
      setGuardandoId(null);
    }
  };

  return (
    <>
      <UserHeader />
      <Container className="mt--7 mb-5" style={{ maxWidth: "800px" }}>
        <Card className="shadow">
          <CardHeader
            style={{
              background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
              borderRadius: "12px 12px 0 0",
              padding: "20px 24px",
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <CalendarCheck size={22} color="white" />
              <h5 className="mb-0 text-white fw-bold">Feriados</h5>
            </div>
          </CardHeader>

          <CardBody style={{ padding: "24px" }}>
            <p
              style={{
                color: "#64748b",
                fontSize: "0.88rem",
                marginBottom: "20px",
              }}
            >
              Activa los feriados que quieras trabajar. Se abrirá tu horario
              habitual de ese día. Si necesitas cerrar horas puntuales, hazlo
              desde Gestión de Horarios.
            </p>

            {cargando ? (
              <div className="text-center p-5">
                <Spinner color="primary" />
                <p className="text-muted mt-2">Cargando feriados...</p>
              </div>
            ) : feriados.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#94a3b8",
                  background: "#f8fafc",
                  borderRadius: "10px",
                }}
              >
                <CalendarX
                  size={32}
                  style={{ opacity: 0.4, marginBottom: "8px" }}
                />
                <p className="mb-0">No hay feriados próximos</p>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {feriados.map((f) => {
                  const activo = f.trabaja;
                  const guardando = guardandoId === f.id;

                  return (
                    <div
                      key={f.id}
                      style={{
                        background: activo ? "#f0fdf4" : "#f8fafc",
                        border: `1.5px solid ${activo ? "#22c55e" : "#e2e8f0"}`,
                        borderLeft: `4px solid ${activo ? "#22c55e" : "#cbd5e1"}`,
                        borderRadius: "10px",
                        padding: "14px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            color: "#1e293b",
                            marginBottom: "2px",
                          }}
                        >
                          {f.nombre}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                          {formatearFecha(f.fecha)}
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-2 flex-shrink-0">
                        <span
                          style={{
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            color: activo ? "#15803d" : "#94a3b8",
                          }}
                        >
                          {activo ? "Trabajo" : "Cerrado"}
                        </span>
                        <div
                          onClick={() => !guardando && onToggle(f)}
                          style={{
                            width: "44px",
                            height: "24px",
                            borderRadius: "999px",
                            background: activo ? "#22c55e" : "#cbd5e1",
                            cursor: guardando ? "wait" : "pointer",
                            position: "relative",
                            transition: "background 0.2s",
                          }}
                        >
                          <div
                            style={{
                              width: "18px",
                              height: "18px",
                              borderRadius: "50%",
                              background: "#fff",
                              position: "absolute",
                              top: "3px",
                              left: activo ? "23px" : "3px",
                              transition: "left 0.2s",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </Container>
    </>
  );
};

export default HabilitarFeriados;
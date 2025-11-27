// src/views/admin/pages/GestionHorariosBase.jsx
import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Row,
  Col,
  Input,
  Label,
  Spinner,
} from "reactstrap";
import { Save } from "lucide-react";
import UserHeader from "components/Headers/UserHeader";
import Swal from "sweetalert2";
import { useUsuario } from "context/usuariosContext";
import { useHorario } from "context/HorarioContext";

const diasSemana = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

// 🔹 Bloques de 1 hora entre 08:00 y 19:00
const generarBloques = () => {
  const bloques = [];
  for (let hora = 8; hora <= 19; hora++) {
    const horaStr = hora.toString().padStart(2, "0");
    bloques.push(`${horaStr}:00`);
  }
  return bloques;
};

const GestionHorariosBase = () => {
  const [barberoSeleccionado, setBarberoSeleccionado] = useState("");
  const [bloques] = useState(generarBloques());
  const [horarios, setHorarios] = useState(() =>
    diasSemana.reduce((acc, dia) => {
      acc[dia] = [];
      return acc;
    }, {})
  );
  const [cargando, setCargando] = useState(false);

  const { barberos } = useUsuario();
  const { crearHorarioBarbero, obtenerHorarioBarbero } = useHorario();

  // 🔹 Normaliza las horas para mantener formato "HH:mm"
  const normalizarHora = (hora) => {
    if (!hora) return "";
    const [h, m] = hora.split(":");
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
  };

  // 🔹 Alterna selección de un bloque horario
  const toggleBloque = (dia, bloque) => {
    const horaNormalizada = normalizarHora(bloque);
    setHorarios((prev) => {
      const diaBloques = prev[dia] || [];
      const nuevo = diaBloques.includes(horaNormalizada)
        ? diaBloques.filter((b) => b !== horaNormalizada)
        : [...diaBloques, horaNormalizada];
      return { ...prev, [dia]: nuevo };
    });
  };

  // 🔹 Guarda horarios base
  const guardarHorario = async () => {
    if (!barberoSeleccionado) {
      Swal.fire("Atención", "Debes seleccionar un barbero", "warning");
      return;
    }

    const diasConBloques = Object.entries(horarios).filter(
      ([, bloques]) => bloques.length > 0
    );

    if (diasConBloques.length === 0) {
      Swal.fire("Atención", "Selecciona al menos un bloque horario", "warning");
      return;
    }

    try {
      setCargando(true);

      for (const [dia, bloquesDia] of diasConBloques) {
        // Lunes → 1, ..., Domingo → 0
        let diaNumero = diasSemana.indexOf(dia) + 1;
        if (diaNumero === 7) diaNumero = 0;

        const bloquesFormateados = bloquesDia.map((horaInicio) => {
          return {
            horaInicio: normalizarHora(horaInicio),
            horaFin: normalizarHora(horaInicio), // misma hora seleccionada
          };
        });

        await crearHorarioBarbero(
          barberoSeleccionado,
          diaNumero,
          bloquesFormateados
        );
      }

      Swal.fire(
        "Éxito",
        "Horarios base creados exitosamente para el barbero",
        "success"
      );

      // Reinicia los horarios seleccionados
      setHorarios(
        diasSemana.reduce((acc, dia) => {
          acc[dia] = [];
          return acc;
        }, {})
      );
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Error al crear los horarios",
        "error"
      );
    } finally {
      setCargando(false);
    }
  };

  // 🔹 Carga horarios existentes del barbero
  useEffect(() => {
    const cargarHorarios = async () => {
      if (!barberoSeleccionado) return;
      try {
        const data = await obtenerHorarioBarbero(barberoSeleccionado);

        const nuevosHorarios = diasSemana.reduce((acc, dia) => {
          acc[dia] = [];
          return acc;
        }, {});

        data.forEach((h) => {
          const diaNombre = diasSemana[h.dia === 0 ? 6 : h.dia - 1]; // domingo al final
          h.bloques.forEach((b) => {
            nuevosHorarios[diaNombre].push(normalizarHora(b.horaInicio));
          });
        });

        setHorarios(nuevosHorarios);
      } catch (error) {
        console.error("Error al cargar horarios", error);
      }
    };

    cargarHorarios();
  }, [barberoSeleccionado]);

  return (
    <>
      <UserHeader title="Gestión de Horarios Base" />
      <Container className="mt-4" fluid>
        <Row>
          <Col xl="12">
            <Card className="shadow border-0">
              <CardHeader className="bg-dark text-white d-flex justify-content-between align-items-center">
                <h4 className="mb-0 text-white">Definir Horarios Base</h4>
              </CardHeader>
              <CardBody>
                <Row className="align-items-end mb-4">
                  <Col md="4">
                    <Label>Barbero</Label>
                    <Input
                      type="select"
                      value={barberoSeleccionado}
                      onChange={(e) => setBarberoSeleccionado(e.target.value)}
                    >
                      <option value="">Seleccione un barbero</option>
                      {barberos.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.nombre} {b.apellido}
                        </option>
                      ))}
                    </Input>
                  </Col>
                  <Col md="3">
                    <Button
                      color="success"
                      onClick={guardarHorario}
                      disabled={cargando}
                      className="mt-2"
                    >
                      {cargando ? (
                        <Spinner size="sm" />
                      ) : (
                        <Save className="me-2" />
                      )}
                      Guardar Horarios
                    </Button>
                  </Col>
                </Row>

                {/* AGENDA VISUAL */}
                <div
                  className="table-responsive border rounded"
                  style={{ overflowX: "auto" }}
                >
                  <table className="table table-bordered text-center align-middle">
                    <thead
                      style={{ backgroundColor: "#f8f9fa", color: "#212529" }}
                    >
                      <tr>
                        <th style={{ width: "80px" }}>Hora</th>
                        {diasSemana.map((dia) => (
                          <th key={dia} style={{ fontWeight: "bold" }}>
                            {dia}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bloques.map((bloque) => (
                        <tr key={bloque}>
                          <td
                            className="fw-bold"
                            style={{
                              backgroundColor: "#f1f3f5",
                              color: "#000",
                            }}
                          >
                            {normalizarHora(bloque)}
                          </td>
                          {diasSemana.map((dia) => {
                            const seleccionado = horarios[dia]?.includes(
                              normalizarHora(bloque)
                            );
                            return (
                              <td
                                key={dia + bloque}
                                onClick={() => toggleBloque(dia, bloque)}
                                style={{
                                  cursor: "pointer",
                                  backgroundColor: seleccionado
                                    ? "#ffc107"
                                    : "#ffffff",
                                  color: seleccionado ? "#000" : "#6c757d",
                                  transition: "0.2s",
                                }}
                              >
                                {seleccionado ? "✔️" : ""}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default GestionHorariosBase;

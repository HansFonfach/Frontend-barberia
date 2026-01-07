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
import { Save, Clock } from "lucide-react";
import UserHeader from "components/Headers/UserHeader";
import Swal from "sweetalert2";
import { useUsuario } from "context/usuariosContext";
import { useHorario } from "context/HorarioContext";

/* =========================
   MOCKS
========================= */

const barberosMock = [
  { _id: "1", nombre: "Juan", apellido: "Pérez" },
  { _id: "2", nombre: "Pedro", apellido: "González" },
];

const diasSemana = [
  { nombre: "Lunes", valor: 1 },
  { nombre: "Martes", valor: 2 },
  { nombre: "Miércoles", valor: 3 },
  { nombre: "Jueves", valor: 4 },
  { nombre: "Viernes", valor: 5 },
  { nombre: "Sábado", valor: 6 },
  { nombre: "Domingo", valor: 0 },
];

/* =========================
   STATE BASE
========================= */

const horarioInicial = diasSemana.reduce((acc, dia) => {
  acc[dia.valor] = {
    activo: false,
    horaInicio: "09:00",
    horaFin: "19:00",
    colacionInicio: "14:00",
    colacionFin: "15:00",
    duracionBloque: 60,
  };
  return acc;
}, {});

const GestionHorariosBase = () => {
  const [barberoSeleccionado, setBarberoSeleccionado] = useState("");
  const [horarios, setHorarios] = useState(horarioInicial);
  const [cargando, setCargando] = useState(false);
  const { barberos } = useUsuario();
  const { crearHorarioBarbero } = useHorario();
  /* =========================
     HANDLERS
  ========================= */

  const handleChange = (dia, campo, valor) => {
    setHorarios((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [campo]: valor,
      },
    }));
  };

  const guardarHorario = async () => {
    if (!barberoSeleccionado) {
      Swal.fire("Atención", "Debes seleccionar un barbero", "warning");
      return;
    }

    try {
      setCargando(true);

      for (const [diaSemana, config] of Object.entries(horarios)) {
        if (!config.activo) continue;

        await crearHorarioBarbero({
          barbero: barberoSeleccionado,
          diaSemana: Number(diaSemana),
          horaInicio: config.horaInicio,
          horaFin: config.horaFin,
          colacionInicio: config.colacionInicio || null,
          colacionFin: config.colacionFin || null,
          duracionBloque: Number(config.duracionBloque),
        });
      }

      Swal.fire("Éxito", "Horarios guardados correctamente", "success");
    } catch (error) {
      Swal.fire("Error", "Error al guardar horarios", "error");
    } finally {
      setCargando(false);
    }
  };

  /* =========================
     MOCK CARGA HORARIOS
  ========================= */

  useEffect(() => {
    if (!barberoSeleccionado) return;

    // Simula respuesta del back
    const horariosMockBack = [
      {
        diaSemana: 1,
        horaInicio: "09:00",
        horaFin: "18:00",
        colacionInicio: "14:00",
        colacionFin: "15:00",
        duracionBloque: 30,
      },
      {
        diaSemana: 5,
        horaInicio: "10:00",
        horaFin: "20:00",
        duracionBloque: 45,
      },
    ];

    const nuevos = { ...horarioInicial };

    horariosMockBack.forEach((h) => {
      nuevos[h.diaSemana] = {
        activo: true,
        horaInicio: h.horaInicio,
        horaFin: h.horaFin,
        colacionInicio: h.colacionInicio || "",
        colacionFin: h.colacionFin || "",
        duracionBloque: h.duracionBloque || 30,
      };
    });

    setHorarios(nuevos);
  }, [barberoSeleccionado]);

  /* =========================
     RENDER
  ========================= */

  return (
    <>
      <UserHeader title="Gestión de Horarios Base" />
      <Container className="mt-4" fluid>
        <Card className="shadow border-0">
          <CardHeader className="bg-primary text-white">
            <h4 className="mb-0 text-white">Horarios base por día</h4>
          </CardHeader>

          <CardBody>
            {/* BARBERO */}
            <Row className="mb-4">
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
            </Row>

            {/* HORARIOS */}
            {diasSemana.map((dia) => {
              const data = horarios[dia.valor];

              return (
                <Card key={dia.valor} className="mb-3 border">
                  <CardBody>
                    <Row className="align-items-end">
                      <Col md="2">
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={data.activo}
                            onChange={(e) =>
                              handleChange(
                                dia.valor,
                                "activo",
                                e.target.checked
                              )
                            }
                          />{" "}
                          <strong>{dia.nombre}</strong>
                        </Label>
                      </Col>

                      <Col md="2">
                        <Label>Inicio</Label>
                        <Input
                          type="time"
                          disabled={!data.activo}
                          value={data.horaInicio}
                          onChange={(e) =>
                            handleChange(
                              dia.valor,
                              "horaInicio",
                              e.target.value
                            )
                          }
                        />
                      </Col>

                      <Col md="2">
                        <Label>Fin</Label>
                        <Input
                          type="time"
                          disabled={!data.activo}
                          value={data.horaFin}
                          onChange={(e) =>
                            handleChange(dia.valor, "horaFin", e.target.value)
                          }
                        />
                      </Col>

                      <Col md="2">
                        <Label>Colación inicio</Label>
                        <Input
                          type="time"
                          disabled={!data.activo}
                          value={data.colacionInicio}
                          onChange={(e) =>
                            handleChange(
                              dia.valor,
                              "colacionInicio",
                              e.target.value
                            )
                          }
                        />
                      </Col>

                      <Col md="2">
                        <Label>Colación fin</Label>
                        <Input
                          type="time"
                          disabled={!data.activo}
                          value={data.colacionFin}
                          onChange={(e) =>
                            handleChange(
                              dia.valor,
                              "colacionFin",
                              e.target.value
                            )
                          }
                        />
                      </Col>

                      <Col md="2">
                        <Label>
                          <Clock size={14} className="me-1" />
                          Bloque (min)
                        </Label>
                        <Input
                          type="number"
                          min="5"
                          step="5"
                          disabled={!data.activo}
                          value={data.duracionBloque}
                          onChange={(e) =>
                            handleChange(
                              dia.valor,
                              "duracionBloque",
                              e.target.value
                            )
                          }
                        />
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              );
            })}

            <Button
              color="success"
              onClick={guardarHorario}
              disabled={cargando}
            >
              {cargando ? <Spinner size="sm" /> : <Save className="me-2" />}
              Guardar Horarios
            </Button>
          </CardBody>
        </Card>
      </Container>
    </>
  );
};

export default GestionHorariosBase;

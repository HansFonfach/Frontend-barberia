// src/views/admin/pages/AsignarServiciosBarbero.jsx
import React, { useContext, useEffect, useState } from "react";
import {
  Container,
  Card,
  CardBody,
  Table,
  Button,
  Input,
  Row,
  Col,
  FormGroup,
  Label,
  Badge,
} from "reactstrap";
import Swal from "sweetalert2";
import UserHeader from "components/Headers/UserHeader";
import { useUsuario } from "context/usuariosContext";
import ServiciosContext from "context/ServiciosContext";

const AsignarServiciosBarbero = () => {
  const [barberoId, setBarberoId] = useState("");
  const [serviciosAsignados, setServiciosAsignados] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  const { asignarServiciosAlBarbero, barberos } = useUsuario();
  const { servicios, cargarServiciosBarbero } = useContext(ServiciosContext);

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ────────────────────────────────
  // Toggle servicio (activar / desactivar)
  // ────────────────────────────────
  const toggleServicio = (servicioId) => {
    setServiciosAsignados((prev) => {
      const existente = prev.find((s) => s.servicioId === servicioId);

      // Si existe → toggle activo
      if (existente) {
        return prev.map((s) =>
          s.servicioId === servicioId
            ? { ...s, activo: !s.activo }
            : s
        );
      }

      // Si no existe → lo agregamos activo
      return [
        ...prev,
        {
          servicioId,
          duracion: 60,
          activo: true,
        },
      ];
    });
  };

  // ────────────────────────────────
  // Actualizar duración
  // ────────────────────────────────
  const updateCampo = (servicioId, valor) => {
    setServiciosAsignados((prev) =>
      prev.map((s) =>
        s.servicioId === servicioId
          ? { ...s, duracion: Number(valor) }
          : s
      )
    );
  };

  // ────────────────────────────────
  // Guardar asignación (create + update)
  // ────────────────────────────────
  const guardar = async () => {
    if (!barberoId) {
      return Swal.fire("Atención", "Selecciona un barbero", "warning");
    }

    try {
      await asignarServiciosAlBarbero(barberoId, serviciosAsignados);
      Swal.fire("¡Éxito!", "Servicios guardados correctamente", "success");
    } catch (error) {
      Swal.fire("Error", "No se pudieron guardar los servicios", "error");
    }
  };

  const barberoSeleccionado = barberos.find((b) => b._id === barberoId);
  const serviciosActivosCount = serviciosAsignados.filter(
    (s) => s.activo
  ).length;

  // ────────────────────────────────
  // Cargar servicios del barbero
  // ────────────────────────────────
  useEffect(() => {
    if (!barberoId) {
      setServiciosAsignados([]);
      return;
    }

    let isMounted = true;

    const cargar = async () => {
      try {
        const data = await cargarServiciosBarbero(barberoId);

        if (!Array.isArray(data)) return;

        const normalizados = data.map((s) => ({
          servicioId: s.servicioId || s.servicio?._id,
          duracion: Number(s.duracion) || 30,
          activo: s.activo !== false,
        }));

        if (isMounted) {
          setServiciosAsignados(normalizados);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) setServiciosAsignados([]);
      }
    };

    cargar();

    return () => {
      isMounted = false;
    };
  }, [barberoId, cargarServiciosBarbero]);

  return (
    <>
      <UserHeader />

      <Container className="mt--6 pb-6" fluid>
        <Row className="justify-content-center">
          <Col xl="10" lg="12" md="12">
            <Card className="shadow border-0">
              <CardBody className={isMobile ? "p-3" : "px-lg-5 py-lg-5"}>
                {/* HEADER */}
                <div className="mb-4">
                  <h2 className={isMobile ? "h4 mb-2" : "mb-1"}>
                    Asignar Servicios a Barbero
                  </h2>
                  <p className="text-muted mb-3">
                    Activa, edita o desactiva servicios sin borrarlos
                  </p>
                  
                  <Row className="align-items-center mb-3">
                    <Col xs={barberoSeleccionado ? 8 : 12}>
                      {/* SELECT BARBERO */}
                      <FormGroup>
                        <Label className="font-weight-bold">
                          Seleccionar Barbero
                        </Label>
                        <Input
                          type="select"
                          value={barberoId}
                          onChange={(e) => setBarberoId(e.target.value)}
                          className={isMobile ? "form-control-sm" : ""}
                        >
                          <option value="">-- Elige un barbero --</option>
                          {barberos.map((b) => (
                            <option key={b._id} value={b._id}>
                              {b.nombre} {b.apellido}
                            </option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>
                    
                    {barberoSeleccionado && (
                      <Col xs={4} className="text-right">
                        <Badge color="info" className="px-3 py-2" pill>
                          {serviciosActivosCount} activo(s)
                        </Badge>
                      </Col>
                    )}
                  </Row>
                </div>

                {/* TABLE / MOBILE CARDS */}
                {barberoId && (
                  <>
                    {isMobile ? (
                      // VISTA MOBILE - CARDS
                      <div className="mt-4">
                        {servicios.map((s) => {
                          const asignado = serviciosAsignados.find(
                            (x) => x.servicioId === s._id
                          );

                          return (
                            <Card 
                              key={s._id} 
                              className={`mb-3 ${asignado?.activo ? 'border-primary' : ''}`}
                            >
                              <CardBody className="p-3">
                                <Row className="align-items-center mb-2">
                                  <Col xs={10}>
                                    <h6 className="font-weight-bold mb-0">
                                      {s.nombre}
                                    </h6>
                                  </Col>
                                  <Col xs={2} className="text-right">
                                    <FormGroup check className="m-0">
                                      <Input
                                        type="checkbox"
                                        checked={!!asignado?.activo}
                                        onChange={() => toggleServicio(s._id)}
                                        className="m-0"
                                      />
                                    </FormGroup>
                                  </Col>
                                </Row>
                                
                                <Row className="align-items-center">
                                  <Col xs={8}>
                                    <Label className="mb-0 text-muted small">
                                      Duración (minutos)
                                    </Label>
                                  </Col>
                                  <Col xs={4}>
                                    <Input
                                      type="number"
                                      disabled={!asignado?.activo}
                                      value={asignado?.duracion || ""}
                                      onChange={(e) =>
                                        updateCampo(s._id, e.target.value)
                                      }
                                      bsSize="sm"
                                      className="text-right"
                                    />
                                  </Col>
                                </Row>
                              </CardBody>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      // VISTA DESKTOP - TABLE
                      <div className="table-responsive">
                        <Table hover className="align-middle">
                          <thead className="thead-dark">
                            <tr>
                              <th width="50" className="text-center text-white">
                                ✓
                              </th>
                              <th className="text-white">Servicio</th>
                              <th width="200" className="text-white">
                                Duración (min)
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {servicios.map((s) => {
                              const asignado = serviciosAsignados.find(
                                (x) => x.servicioId === s._id
                              );

                              return (
                                <tr
                                  key={s._id}
                                  className={asignado?.activo ? "table-active" : ""}
                                >
                                  <td className="text-center">
                                    <Input
                                      type="checkbox"
                                      checked={!!asignado?.activo}
                                      onChange={() => toggleServicio(s._id)}
                                    />
                                  </td>
                                  <td className="font-weight-bold">{s.nombre}</td>
                                  <td>
                                    <Input
                                      type="number"
                                      disabled={!asignado?.activo}
                                      value={asignado?.duracion || ""}
                                      onChange={(e) =>
                                        updateCampo(s._id, e.target.value)
                                      }
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </div>
                    )}
                  </>
                )}

                {/* FOOTER */}
                {barberoId && (
                  <div className="mt-4 d-flex justify-content-end">
                    <Button
                      color="primary"
                      size={isMobile ? "md" : "lg"}
                      onClick={guardar}
                      disabled={!serviciosAsignados.length}
                      block={isMobile}
                    >
                      Guardar Cambios
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default AsignarServiciosBarbero;
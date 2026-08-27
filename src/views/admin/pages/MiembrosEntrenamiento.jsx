import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody, Badge, Spinner, Table } from "reactstrap";
import { Users, Crown } from "lucide-react";
import UserHeader from "components/Headers/UserHeader.js";
import { useEntrenamientoPersonal } from "context/EntrenamientoPersonalContext";

/**
 * "Miembros": quién está registrado en el módulo de entrenamiento personal
 * (dueño + amigos invitados) y qué tan activo ha sido cada uno — SOLO
 * ADMIN (la ruta ya lo exige en el backend). A propósito es una lista
 * simple, no el panel de gestión de clientes completo (ese trae de vuelta
 * reservas/suscripciones/membresías, que no aplican a este módulo).
 */

const formatFecha = (fecha) =>
  fecha
    ? new Date(fecha).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

const MiembrosEntrenamiento = () => {
  const { miembrosEntrenamiento } = useEntrenamientoPersonal();
  const [miembros, setMiembros] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    miembrosEntrenamiento().then((data) => {
      setMiembros(data);
      setCargando(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <UserHeader />
      <Container className="mt--7 mb-5" fluid>
        <Row className="justify-content-center">
          <Col xl="10" lg="11">
            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
              <CardBody className="text-center py-5">
                <div className="bg-warning rounded-circle d-inline-flex p-3 mb-3 shadow-sm">
                  <Users size={28} className="text-white" />
                </div>
                <h1 className="font-weight-bold display-4">Miembros</h1>
                <p className="text-muted lead mb-0">
                  Quién está registrado y qué tan activo ha sido cada uno
                </p>
              </CardBody>
            </Card>

            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
              <CardBody className="p-4">
                {cargando ? (
                  <div className="text-center py-4">
                    <Spinner color="warning" />
                  </div>
                ) : miembros.length === 0 ? (
                  <p className="text-muted small mb-0">Todavía no hay nadie registrado.</p>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <Table className="align-items-center table-flush" responsive>
                      <thead className="thead-light">
                        <tr>
                          <th>Nombre</th>
                          <th>Email</th>
                          <th>Registrado</th>
                          <th>Entrenamientos</th>
                          <th>Último registro</th>
                        </tr>
                      </thead>
                      <tbody>
                        {miembros.map((m) => (
                          <tr key={m._id}>
                            <td className="font-weight-bold">
                              {m.nombre} {m.apellido}
                              {m.esAdmin && (
                                <Badge color="warning" pill className="ml-2">
                                  <Crown size={11} /> Admin
                                </Badge>
                              )}
                            </td>
                            <td className="small text-muted">{m.email}</td>
                            <td className="small text-muted">{formatFecha(m.fechaRegistro)}</td>
                            <td>
                              <Badge color="light" pill className="border">
                                {m.totalEntrenamientos}
                              </Badge>
                            </td>
                            <td className="small text-muted">{formatFecha(m.ultimoEntrenamiento)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
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

export default MiembrosEntrenamiento;

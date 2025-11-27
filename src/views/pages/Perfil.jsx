import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  Container,
  Row,
  Col,
} from "reactstrap";
import UserHeader from "components/Headers/UserHeader.js";
import { useAuth } from "context/AuthContext";

// 🔹 Función para generar color aleatorio suave (para el fondo del avatar)
const generarColor = (nombre) => {
  const colores = [
    "#FFB84C",
    "#AEE2FF",
    "#B9FBC0",
    "#FFD6A5",
    "#FFADAD",
    "#CDB4DB",
    "#9BF6FF",
    "#FDFFB6",
  ];
  if (!nombre) return "#CCCCCC";
  const index =
    nombre.charCodeAt(0) % colores.length;
  return colores[index];
};

// 🔹 Genera iniciales del usuario (ej: “Hans Fonfach” → “HF”)
const getIniciales = (nombre = "", apellido = "") => {
  return (
    (nombre?.charAt(0)?.toUpperCase() || "") +
    (apellido?.charAt(0)?.toUpperCase() || "")
  );
};

const Perfil = () => {
  const { user } = useAuth();
  const iniciales = getIniciales(user?.nombre, user?.apellido);
  const colorFondo = generarColor(user?.nombre);

  return (
    <>
      <UserHeader title="Mi Perfil" />
      <Container className="mt--7" fluid>
        <Row>
          {/* TARJETA DE PERFIL */}
          <Col className="order-xl-2 mb-5 mb-xl-0" xl="4">
            <Card className="card-profile shadow text-center p-4">
              <div
                className="mx-auto d-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{
                  backgroundColor: colorFondo,
                  width: "120px",
                  height: "120px",
                  fontSize: "42px",
                  color: "#fff",
                  fontWeight: "700",
                }}
              >
                {iniciales || "U"}
              </div>

              <h3 className="mb-0 text-dark">
                {user?.nombre} {user?.apellido}
              </h3>
              <h5 className="text-muted mb-2">{user?.email}</h5>

              <span
                className={`badge ${
                  user?.suscrito ? "bg-success" : "bg-secondary"
                } text-white mb-3`}
              >
                {user?.suscrito ? "Usuario Suscrito" : "Usuario No Suscrito"}
              </span>

              <p className="text-muted px-3">
                Bienvenido a tu perfil personal 👋  
                Aquí podrás consultar y editar tus datos personales.  
                Pronto podrás subir una foto de perfil y más.
              </p>

              <Button color="primary" size="sm" className="mt-2">
                Editar información
              </Button>
            </Card>
          </Col>

          {/* TARJETA DE DATOS */}
          <Col className="order-xl-1" xl="8">
            <Card className="bg-secondary shadow">
              <CardHeader className="bg-white border-0">
                <Row className="align-items-center">
                  <Col xs="8">
                    <h3 className="mb-0">Datos del usuario</h3>
                  </Col>
                </Row>
              </CardHeader>

              <CardBody>
                <Form>
                  <h6 className="heading-small text-muted mb-4">
                    Información personal
                  </h6>
                  <div className="pl-lg-4">
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label">
                            Nombre
                          </label>
                          <Input
                            className="form-control-alternative"
                            type="text"
                            value={user?.nombre || ""}
                            disabled
                          />
                        </FormGroup>
                      </Col>

                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label">
                            Apellido
                          </label>
                          <Input
                            className="form-control-alternative"
                            type="text"
                            value={user?.apellido || ""}
                            disabled
                          />
                        </FormGroup>
                      </Col>
                    </Row>

                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label">
                            Correo electrónico
                          </label>
                          <Input
                            className="form-control-alternative"
                            type="email"
                            value={user?.email || ""}
                            disabled
                          />
                        </FormGroup>
                      </Col>

                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label">
                            Teléfono
                          </label>
                          <Input
                            className="form-control-alternative"
                            type="text"
                            value={user?.telefono || "No registrado"}
                            disabled
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </div>

                  <hr className="my-4" />

                  <div className="text-center">
                    <Button color="info" className="px-4">
                      Guardar cambios
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Perfil;

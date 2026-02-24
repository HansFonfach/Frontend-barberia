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
  Badge,
} from "reactstrap";
import UserHeader from "components/Headers/UserHeader.js";
import { useAuth } from "context/AuthContext";
import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import html2canvas from "html2canvas";
import TarjetaSuscriptor from "components/tarjeta/tarjetaSuscriptor";

/* =========================================================
   HELPERS
========================================================= */

// 🔹 Color suave para avatar
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
  const index = nombre.charCodeAt(0) % colores.length;
  return colores[index];
};

// 🔹 Iniciales (Hans Fonfach → HF)
const getIniciales = (nombre = "", apellido = "") =>
  (nombre?.charAt(0)?.toUpperCase() || "") +
  (apellido?.charAt(0)?.toUpperCase() || "");

/* =========================================================
   COMPONENTE
========================================================= */

const Perfil = () => {
  const { user, actualizarPerfil } = useAuth();
  const tarjetaRef = useRef(null);

  const iniciales = getIniciales(user?.nombre, user?.apellido);
  const colorFondo = generarColor(user?.nombre);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
  });

  /* =========================
     CARGAR DATOS
  ========================= */
  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || "",
        apellido: user.apellido || "",
        telefono: user.telefono || "",
      });
    }
  }, [user]);

  /* =========================
     HANDLERS
  ========================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await actualizarPerfil(formData);
      Swal.fire("Listo", "Perfil actualizado correctamente", "success");
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Error",
        "error"
      );
    }
  };

  /* =========================
     DESCARGAR TARJETA
  ========================= */
  const descargarTarjeta = async () => {
    if (!tarjetaRef.current) return;

    const canvas = await html2canvas(tarjetaRef.current, {
      scale: 2,
      backgroundColor: null,
      useCORS: true,
    });

    const link = document.createElement("a");
    link.download = "tarjeta-suscriptor.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  console.log(user);
  /* =========================
     RENDER
  ========================= */
  return (
    <>
      <UserHeader title="Mi Perfil" />

      <Container className="mt--7" fluid>
        <Row>
          {/* =========================
              TARJETA PERFIL
          ========================= */}
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

              {user?.suscrito && (
                <div className="mt-3">
                  <Badge color="success" className="px-3 py-2 text-dark">
                    ⭐ Suscripción activa
                  </Badge>

                  <div className="mt-3">
                    <Button color="warning" onClick={descargarTarjeta}>
                      📥 Descargar tarjeta de suscriptor
                    </Button>
                  </div>
                </div>
              )}

              <p className="text-muted px-3 mt-4">
                Bienvenido a tu perfil personal 👋 Aquí podrás consultar y
                editar tus datos personales.
              </p>
            </Card>
          </Col>

          {/* =========================
              TARJETA DATOS
          ========================= */}
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
                          <label className="form-control-label">Nombre</label>
                          <Input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                          />
                        </FormGroup>
                      </Col>

                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label">
                            Apellido
                          </label>
                          <Input
                            type="text"
                            name="apellido"
                            value={formData.apellido}
                            onChange={handleChange}
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
                            type="text"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </div>

                  <hr className="my-4" />

                  <div className="text-center">
                    <Button color="info" onClick={handleSubmit}>
                      Guardar cambios
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* =========================
          TARJETA OCULTA
      ========================= */}
      {user?.suscrito && (
        <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <div ref={tarjetaRef}>
            <TarjetaSuscriptor
              cliente={{
                nombre: `${user.nombre} ${user.apellido}`,
              }}
              suscripcion={{
                fechaInicio: user.fechaInicioSuscripcion,
                fechaFin: user.fechaFinSuscripcion,
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Perfil;
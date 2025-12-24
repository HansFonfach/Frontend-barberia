import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Button,
  Spinner,
} from "reactstrap";
import UserHeader from "components/Headers/UserHeader";
import {
  FaCoffee,
  FaBeer,
  FaGlassWhiskey,
  FaPercent,
  FaGift,
  FaStar,
} from "react-icons/fa";
import { useCanje } from "context/CanjeContext";
import Swal from "sweetalert2";

const iconMap = {
  cafe: <FaCoffee size={32} />,
  bebida: <FaGlassWhiskey size={32} />,
  cerveza: <FaBeer size={32} />,
  descuento: <FaPercent size={32} />,
  regalo: <FaGift size={32} />,
  premium: <FaStar size={32} />,
};

const CatalogoCanjes = () => {
  const {
    listarCanjes,
    canjear,
    canjes,
    loading,
    loadingCanje,
  } = useCanje();

  const [canjeSeleccionado, setCanjeSeleccionado] = useState(null);

  /* =========================
     CARGA INICIAL
  ========================= */
  useEffect(() => {
    listarCanjes();
  }, [listarCanjes]);

  /* =========================
     CANJEAR
  ========================= */
  const handleCanjear = async () => {
    if (!canjeSeleccionado) return;

    const result = await Swal.fire({
      title: "¿Confirmar canje?",
      text: `Se descontarán ${canjeSeleccionado.puntos} puntos`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, canjear",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await canjear(canjeSeleccionado._id);

      await Swal.fire({
        icon: "success",
        title: "Canje realizado 🎉",
        text: "Tu recompensa fue canjeada con éxito",
        timer: 2000,
        showConfirmButton: false,
      });

      setCanjeSeleccionado(null);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          "No se pudo realizar el canje",
      });
    }
  };

  /* =========================
     LOADING GLOBAL (solo carga inicial)
  ========================= */
  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center mt-5">
        <Spinner color="primary" />
      </Container>
    );
  }

  return (
    <>
      <UserHeader />

      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col lg="10">
            <Card className="shadow border-0">
              <CardHeader className="bg-transparent text-center">
                <h2 className="font-weight-bold mb-2">
                  Catálogo de Canjes 🎁
                </h2>
                <p className="text-muted">
                  Canjea tus puntos por beneficios exclusivos
                </p>
              </CardHeader>

              <CardBody>
                <Row>
                  {/* LISTADO */}
                  <Col lg={canjeSeleccionado ? "8" : "12"}>
                    <Row>
                      {canjes.length === 0 && (
                        <Col className="text-center text-muted mt-4">
                          No hay canjes disponibles
                        </Col>
                      )}

                      {canjes.map((item) => (
                        <Col key={item._id} xs="12" sm="6" md="4" lg="3">
                          <Card
                            className="shadow-sm mb-4"
                            style={{ cursor: "pointer" }}
                            onClick={() => setCanjeSeleccionado(item)}
                          >
                            <div className="d-flex justify-content-center mt-4">
                              {iconMap[item.tipo] || <FaGift size={32} />}
                            </div>

                            <CardBody className="text-center">
                              <h5 className="font-weight-bold">
                                {item.nombre}
                              </h5>

                              <p className="text-muted small">
                                {item.descripcion}
                              </p>

                              <Badge color="primary" pill className="mr-1">
                                {item.puntos} pts
                              </Badge>

                              <Badge
                                color={
                                  item.stock > 0 ? "success" : "danger"
                                }
                                pill
                              >
                                Stock: {item.stock}
                              </Badge>
                            </CardBody>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Col>

                  {/* DETALLE */}
                  {canjeSeleccionado && (
                    <Col lg="4">
                      <Card
                        className="shadow border-0 sticky-top"
                        style={{ top: "90px" }}
                      >
                        <CardBody>
                          <h3 className="font-weight-bold">
                            {canjeSeleccionado.nombre}
                          </h3>

                          <Badge color="primary" pill className="mb-2">
                            {canjeSeleccionado.puntos} puntos
                          </Badge>

                          <Badge
                            color={
                              canjeSeleccionado.stock > 0
                                ? "success"
                                : "danger"
                            }
                            pill
                            className="mb-3 ml-2"
                          >
                            Stock: {canjeSeleccionado.stock}
                          </Badge>

                          <p className="text-muted">
                            {canjeSeleccionado.descripcion}
                          </p>

                          <Button
                            color="primary"
                            block
                            disabled={
                              loadingCanje ||
                              canjeSeleccionado.stock <= 0
                            }
                            onClick={handleCanjear}
                          >
                            {loadingCanje ? (
                              <Spinner size="sm" />
                            ) : (
                              "Canjear recompensa"
                            )}
                          </Button>

                          <Button
                            color="secondary"
                            outline
                            block
                            className="mt-2"
                            onClick={() => setCanjeSeleccionado(null)}
                          >
                            Volver
                          </Button>
                        </CardBody>
                      </Card>
                    </Col>
                  )}
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default CatalogoCanjes;

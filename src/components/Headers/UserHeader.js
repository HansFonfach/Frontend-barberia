import { useEmpresa } from "context/EmpresaContext";
import { Container, Row, Col } from "reactstrap";

const UserHeader = () => {
  const { empresa, loading } = useEmpresa();

  if (loading || !empresa) return null;

  // 🔥 Imagen dinámica según el rubro real de la empresa.
  // Ojo: algunas empresas (las creadas antes de que existiera `rubro`, como
  // Lumica) solo tienen cargado `empresa.tipo`, y las más nuevas solo tienen
  // `empresa.rubro` — por eso se chequean los dos, no solo uno.
  const esDe = (valores) =>
    valores.includes(empresa.rubro) || valores.includes(empresa.tipo);

  let backgroundImg;

  if (esDe(["gimnasio"])) {
    backgroundImg = require("../../assets/img/theme/entrenamiento.jpg");
  } else if (esDe(["salon_belleza", "spa", "centro_estetica"])) {
    backgroundImg = require("../../assets/img/theme/lifting-pestanas.png");
  } else {
    // Barbería, peluquería y el resto: imagen por defecto
    backgroundImg = require("../../assets/img/theme/profile-cover.jpg");
  }

  return (
    <>
      <div
        className="header pb-8 pt-5 pt-lg-8 d-flex align-items-center"
        style={{
          minHeight: "600px",
          backgroundImage: `url(${backgroundImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <span className="mask bg-gradient-default opacity-4" />

        <Container className="d-flex align-items-center" fluid>
          <Row>
            <Col lg="7" md="10">
              <h1 className="display-2 text-white">¡BIENVENIDO!</h1>
              <p className="text-white mt-0 mb-5">
                Gestiona tus reservas, suscríbete a nuestros servicios y
                aprovecha al máximo tu experiencia con {empresa.nombre}.
              </p>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default UserHeader;

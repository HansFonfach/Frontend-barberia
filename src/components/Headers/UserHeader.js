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
  const esTeamHans = empresa.slug === "team-hans";

  if (esTeamHans) {
    // Excepción puntual para Team Hans, igual que otras excepciones por
    // slug ya usadas en routes.js — no afecta al resto de barberías.
    backgroundImg = require("../../assets/img/theme/gym.jpeg");
  } else if (esDe(["gimnasio"])) {
    backgroundImg = require("../../assets/img/theme/entrenamiento.jpg");
  } else if (esDe(["salon_belleza", "spa", "centro_estetica"])) {
    backgroundImg = require("../../assets/img/theme/lifting-pestanas.png");
  } else {
    // Barbería, peluquería y el resto: imagen por defecto
    backgroundImg = require("../../assets/img/theme/profile-cover.jpg");
  }

  // Team Hans pidió que la foto se vea completa, sin recortarse ni dejar
  // bordes negros — en vez de un alto fijo (600px) que casi nunca calza con
  // la proporción real de la imagen, en pantallas ≥768px el header adopta
  // el mismo "aspect-ratio" que la foto (753x451), así "cover" la cubre
  // entera sin recortar nada y sin espacios vacíos. En celular se deja el
  // comportamiento anterior (que ya estaba bien) con "contain" + alto fijo.
  const headerStyle = esTeamHans
    ? { backgroundImage: `url(${backgroundImg})` }
    : {
        minHeight: "600px",
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };

  return (
    <>
      {esTeamHans && (
        <style>{`
          .th-hero {
            min-height: 600px;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            background-color: #000;
          }
          @media (min-width: 768px) {
            .th-hero {
              min-height: 0;
              aspect-ratio: 753 / 451;
              background-size: cover;
            }
          }
        `}</style>
      )}
      <div
        className={`header pb-8 pt-5 pt-lg-8 d-flex align-items-center${
          esTeamHans ? " th-hero" : ""
        }`}
        style={headerStyle}
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

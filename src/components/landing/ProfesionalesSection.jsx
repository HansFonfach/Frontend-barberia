import { Container, Row, Col, Badge, Button } from "reactstrap";
import barberoDefault from "assets/img/barberos/ale.jpg";
import "./profesionalesSection.css";
import { useParams } from "react-router-dom";

const ProfesionalesSection = ({ profesionales }) => {
  const { slug } = useParams();
  if (!profesionales?.length) return null;

  const prof = profesionales[0];
  const fotoPerfil = prof.perfilProfesional?.fotoPerfil?.url || barberoDefault;
  const especialidades = prof.perfilProfesional?.especialidades || [];
  const aniosExp = prof.perfilProfesional?.aniosExperiencia;

  const getInitials = (nombre, apellido) => {
    const primera = nombre?.[0] || "";
    const segunda = apellido?.[0] || "";
    return (primera + segunda).toUpperCase();
  };

  const tieneFoto = prof.perfilProfesional?.fotoPerfil?.url;

  const isLumica = slug === "lumicabeauty"; // 👈

  return (
    <>
      <section className="py-7">
        <Container>
          <Row className="align-items-center g-5 mt-4 justify-content-center">
            <Col lg="4" className="text-center">
              <div className="barber-circle-container">
                <div className="barber-circle">
                  {tieneFoto ? (
                    <img
                      src={fotoPerfil}
                      alt={prof.nombre}
                      className="barber-img"
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#4654d1",
                        color: "#ffffff",
                        fontSize: "3rem",
                        fontWeight: 700,
                        borderRadius: "50%",
                      }}
                    >
                      {getInitials(prof.nombre, prof.apellido)}
                    </div>
                  )}
                </div>
              </div>
            </Col>

            <Col lg="6">
              <div className="barber-info-content">
                <h2 className="barber-name mb-3">
                  {prof.nombre} <span>{prof.apellido}</span>
                </h2>

                <div className="barber-stats mb-4">
                  {aniosExp && (
                    <div className="stat-item">
                      <span className="stat-value">{aniosExp}+</span>
                      <span className="stat-label">Años exp.</span>
                    </div>
                  )}
                  {isLumica && ( // 👈
                    <div className="stat-item">
                      <span className="stat-value">+2.000</span>
                      <span className="stat-label">
                        Lifting de pestañas realizados
                      </span>
                    </div>
                  )}
                </div>

                <p className="barber-description mb-4">{prof.descripcion}</p>

                <div className="specialties mb-4">
                  {especialidades.map((esp, i) => (
                    <span key={i} className="specialty-tag">
                      {esp}
                    </span>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default ProfesionalesSection;

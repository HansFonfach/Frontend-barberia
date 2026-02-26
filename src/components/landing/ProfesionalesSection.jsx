import React from "react";
import { Container, Row, Col, Badge, Button } from "reactstrap";
import SectionTitle from "./SectionTitle";
import barberoDefault from "assets/img/barberos/ale.jpg";
import "./profesionalesSection.css";


const ProfesionalesSection = ({ profesionales }) => {
  if (!profesionales?.length) return null;

  const prof = profesionales[0];

  return (
    <>
      <section className="py-7 ">
        <Container>
          <SectionTitle
            badge="Tus Profesionales"
            title="Conoce a tu Profesional"
            subtitle="Arte, precisión y estilo personalizado"
          />

          <Row className="align-items-center g-5 mt-4 justify-content-center">
            {/* Imagen circular del barbero */}
            <Col lg="4" className="text-center">
              <div className="barber-circle-container">
                <div className="barber-circle">
                  <img
                    src={prof.avatar || barberoDefault}
                    alt={prof.nombre}
                    className="barber-img"
                  />
                </div>
              </div>
            </Col>

            {/* Info */}
            <Col lg="6">
              <div className="barber-info-content">
              

                <h2 className="barber-name text- mb-3">
                  {prof.nombre} <span>{prof.apellido}</span>
                </h2>

                <div className="barber-stats mb-4">
                  <div className="stat-item">
                    <span className="stat-value">20+</span>
                    <span className="stat-label">Años exp.</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">100+</span>
                    <span className="stat-label">Clientes</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">+100</span>
                    <span className="stat-label">Reservas al mes</span>
                  </div>
                </div>

                <p className="barber-description mb-4">
                  Especialista en cortes clásicos y contemporáneos, degradados
                  perfectos y diseño profesional de barba. Cada servicio es una
                  experiencia personalizada donde el detalle y la precisión
                  marcan la diferencia.
                </p>

                <div className="specialties mb-4">
                  <span className="specialty-tag">Degradados</span>
                  <span className="specialty-tag">Barba</span>
                  <span className="specialty-tag">Cortes clásicos</span>
                  <span className="specialty-tag">Diseño</span>
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

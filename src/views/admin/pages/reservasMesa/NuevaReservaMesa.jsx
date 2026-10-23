import React, { useRef } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Col, Container, Row, Spinner } from "reactstrap";
import EncabezadoReservasMesa from "components/reservasMesa/EncabezadoReservasMesa";
import FormReservaMesa from "components/reservasMesa/FormReservaMesa";
import { useConfiguracionReservasMesa } from "hooks/useReservasMesa";
import { hoyChile } from "utils/reservasMesa";

/** Registrar una reserva que llegó por teléfono, WhatsApp o en el local. */
const NuevaReservaMesa = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const config = useConfiguracionReservasMesa();
  const ultimaFecha = useRef(null);

  const irAHoy = () =>
    navigate(`/${slug}/admin/reservas-mesa-hoy${ultimaFecha.current ? `?fecha=${ultimaFecha.current}` : ""}`);

  return (
    <>
      <EncabezadoReservasMesa
        titulo="Nueva reserva"
        subtitulo="Para reservas que llegan por teléfono, WhatsApp o en el local"
      />
      <Container className="mt--7 mb-5" fluid>
        <Row className="justify-content-center">
          <Col xl="8" lg="10">
            {config.cargando ? (
              <div className="text-center py-5">
                <Spinner className="text-white" />
              </div>
            ) : config.faltantes?.length > 0 ? (
              <div className="alert alert-warning">
                Antes de registrar reservas falta configurar: {config.faltantes.join(", ")}.{" "}
                {config.esAdmin && (
                  <Link to={`/${slug}/admin/reservas-mesa-sectores`} className="alert-link">
                    Ir a los ajustes
                  </Link>
                )}
              </div>
            ) : (
              <FormReservaMesa
                enPagina
                fechaInicial={params.get("fecha") || hoyChile()}
                toggle={irAHoy}
                onGuardada={(r) => {
                  ultimaFecha.current = r?.fecha || null;
                }}
              />
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default NuevaReservaMesa;

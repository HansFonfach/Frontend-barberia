import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button, Card, CardBody, Container, Spinner } from "reactstrap";
import { getBajaPromociones, postBajaPromociones } from "api/reservasMesa";

/** Link "Dejar de recibir promociones" de los correos de reservas de mesa. */
const BajaPromociones = () => {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [info, setInfo] = useState(null);
  const [estado, setEstado] = useState("cargando"); // cargando | listo | invalido | hecho
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let vigente = true;
    if (!token) {
      setEstado("invalido");
      return undefined;
    }
    getBajaPromociones(token)
      .then(({ data }) => {
        if (!vigente) return;
        setInfo(data);
        setEstado(data.suscrito ? "listo" : "hecho");
      })
      .catch(() => vigente && setEstado("invalido"));
    return () => {
      vigente = false;
    };
  }, [token]);

  const confirmar = async () => {
    setEnviando(true);
    setError("");
    try {
      await postBajaPromociones(token);
      setEstado("hecho");
    } catch (e) {
      setError(e?.response?.data?.message || "No se pudo completar. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  const local = info?.empresa?.nombre || "el local";

  return (
    <div style={{ minHeight: "100vh", background: "#f6f7f9" }} className="d-flex align-items-center py-5">
      <Container style={{ maxWidth: 480 }}>
        <Card className="shadow border-0">
          <CardBody className="p-4 text-center">
            {estado === "cargando" && <Spinner />}

            {estado === "invalido" && (
              <>
                <h2 className="h4">El link no es válido</h2>
                <p className="text-muted mb-0">Puede que esté incompleto. Ábrelo de nuevo desde el correo.</p>
              </>
            )}

            {estado === "listo" && (
              <>
                <h2 className="h4">¿Dejar de recibir promociones?</h2>
                <p className="text-muted">
                  No te enviaremos más promociones de <strong>{local}</strong>
                  {info?.email ? ` a ${info.email}` : ""}. Tus reservas y sus avisos siguen funcionando igual.
                </p>
                {error && <div className="alert alert-danger">{error}</div>}
                <Button color="dark" block disabled={enviando} onClick={confirmar}>
                  {enviando ? "Un momento..." : "Sí, no quiero recibir más"}
                </Button>
              </>
            )}

            {estado === "hecho" && (
              <>
                <div style={{ fontSize: 44 }}>✅</div>
                <h2 className="h4">Listo</h2>
                <p className="text-muted mb-0">Ya no recibirás promociones de {local}.</p>
              </>
            )}

            {info?.empresa?.slug && estado !== "cargando" && (
              <Link to={`/${info.empresa.slug}`} className="d-inline-block mt-4 small">
                Ir a {local}
              </Link>
            )}
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default BajaPromociones;

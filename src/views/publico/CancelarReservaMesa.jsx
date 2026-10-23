import React, { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Button, Card, CardBody, Container, Spinner } from "reactstrap";
import { useEmpresa } from "context/EmpresaContext";
import { construirTema } from "utils/temaEmpresa";
import { marcaDe } from "utils/marcasRestaurante";
import { getCancelacionReservaMesa, postCancelarReservaMesa } from "api/reservasMesa";
import { capitalizar, fechaLarga, telLink } from "utils/reservasMesa";

/** Página del link "cancelar mi reserva" que llega por correo. */
const CancelarReservaMesa = () => {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const { empresa } = useEmpresa();
  const marca = marcaDe(empresa);
  const base = construirTema(empresa?.colores);
  const theme = marca
    ? { ...base, primary: "#9a6a2c", softBg: marca.colores.fondo, textMuted: marca.colores.textoSuave }
    : base;

  const [info, setInfo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [cancelando, setCancelando] = useState(false);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("El link no es válido.");
      setCargando(false);
      return;
    }
    getCancelacionReservaMesa(token)
      .then(({ data }) => setInfo(data))
      .catch((e) => setError(e?.response?.data?.message || "El link no es válido o ya no está vigente."))
      .finally(() => setCargando(false));
  }, [token]);

  const cancelar = async () => {
    setCancelando(true);
    try {
      await postCancelarReservaMesa(token);
      setListo(true);
    } catch (e) {
      setError(e?.response?.data?.message || "No se pudo cancelar. Llámanos, por favor.");
    } finally {
      setCancelando(false);
    }
  };

  const r = info?.reserva;
  const telefono = info?.empresa?.telefono;

  return (
    <div style={{ minHeight: "100vh", background: theme.softBg || "#f6f9fc" }} className="py-5">
      <Container style={{ maxWidth: 520 }}>
        <Card className="shadow border-0">
          <CardBody className="p-4 text-center">
            {marca && (
              <img
                src={marca.logo}
                alt={empresa?.nombre}
                style={{ width: 80, height: 70, objectFit: "cover", borderRadius: 14, marginBottom: 12 }}
              />
            )}
            <h1 className="h3 mb-3">{info?.empresa?.nombre || empresa?.nombre || "Tu reserva"}</h1>

            {cargando ? (
              <Spinner style={{ color: theme.primary }} />
            ) : listo ? (
              <>
                <div style={{ fontSize: 44 }}>👋</div>
                <p className="mb-1">Tu reserva quedó cancelada.</p>
                <p className="text-muted small">Gracias por avisar: liberaste el lugar para otra persona.</p>
              </>
            ) : error && !r ? (
              <p className="text-muted">{error}</p>
            ) : r ? (
              <>
                <div className="border rounded p-3 text-left mb-3">
                  <div>
                    <strong>{r.nombre}</strong> · código {r.codigo}
                  </div>
                  <div>{capitalizar(fechaLarga(r.fecha))} · {r.hora}</div>
                  <div>
                    {r.personas} personas · {r.sector}
                  </div>
                </div>
                {r.estado === "cancelada" ? (
                  <p className="text-muted">Esta reserva ya estaba cancelada.</p>
                ) : info.puedeCancelar ? (
                  <>
                    {error && <div className="alert alert-warning">{error}</div>}
                    <Button
                      color="danger"
                      block
                      disabled={cancelando}
                      onClick={cancelar}
                    >
                      {cancelando ? "Cancelando..." : "Cancelar mi reserva"}
                    </Button>
                  </>
                ) : (
                  <p className="text-muted">{info.motivo}</p>
                )}
                {telefono && (
                  <p className="small mt-3 mb-0">
                    ¿Dudas? Llámanos al <a href={telLink(telefono)}>{telefono}</a>
                  </p>
                )}
              </>
            ) : null}
          </CardBody>
        </Card>
        <div className="text-center mt-3">
          <Link to={`/${slug}`} style={{ color: theme.textMuted }}>
            Volver
          </Link>
        </div>
      </Container>
    </div>
  );
};

export default CancelarReservaMesa;

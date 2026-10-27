import React, { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Button, Card, CardBody, Container, Spinner } from "reactstrap";
import { getAsistenciaMesa, postAsistenciaMesa } from "api/reservasMesa";
import { capitalizar, fechaLarga, telLink } from "utils/reservasMesa";

const COLOR = "#9a6a2c";

/**
 * Botones "Confirmar asistencia" / "No podré ir" del WhatsApp de reservas de
 * mesa. Confirmar se registra al abrir; cancelar pide un toque más (libera la mesa).
 */
const AsistenciaMesa = () => {
  const { accion } = useParams(); // "confirmar" | "cancelar"
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [datos, setDatos] = useState(null);
  const [estado, setEstado] = useState("cargando"); // cargando | listo | invalido | error
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const confirmado = useRef(false);

  const responder = async (que) => {
    setEnviando(true);
    setMensaje("");
    try {
      const { data } = await postAsistenciaMesa(token, que);
      setDatos(data);
    } catch (e) {
      const d = e?.response?.data;
      if (d?.reserva) setDatos(d);
      setMensaje(d?.message || "No pudimos registrar tu respuesta. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  useEffect(() => {
    let vigente = true;
    if (!token) {
      setEstado("invalido");
      return undefined;
    }
    getAsistenciaMesa(token)
      .then(({ data }) => {
        if (!vigente) return;
        setDatos(data);
        setEstado("listo");
        // "Confirmar asistencia": basta con abrir el link
        if (accion === "confirmar" && !data.respuesta && data.vigente && !confirmado.current) {
          confirmado.current = true;
          responder("confirmar");
        }
      })
      .catch(() => vigente && setEstado("invalido"));
    return () => {
      vigente = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, accion]);

  const r = datos?.reserva;
  const local = datos?.empresa?.nombre || "el local";
  const resumen = r && (
    <div className="border rounded p-3 text-left my-3 small">
      <div>
        <strong>{capitalizar(fechaLarga(r.fecha))}</strong> a las <strong>{r.hora}</strong>
      </div>
      <div>
        {r.personas} persona{r.personas === 1 ? "" : "s"} · {r.sector} · a nombre de {r.nombre}
      </div>
      {datos.empresa?.direccion && <div className="text-muted">{datos.empresa.direccion}</div>}
    </div>
  );

  let contenido;
  if (estado === "cargando" || (enviando && !datos?.respuesta)) {
    contenido = <Spinner style={{ color: COLOR }} />;
  } else if (estado === "invalido") {
    contenido = (
      <>
        <h2 className="h4">El link no es válido</h2>
        <p className="text-muted mb-0">Puede que la reserva ya no exista. Si tienes dudas, contacta al local.</p>
      </>
    );
  } else if (datos?.respuesta === "confirma") {
    contenido = (
      <>
        <div style={{ fontSize: 44 }}>🙌</div>
        <h2 className="h4">¡Gracias por confirmar!</h2>
        <p className="text-muted mb-0">Te esperamos en {local}.</p>
        {resumen}
      </>
    );
  } else if (datos?.respuesta === "cancela") {
    contenido = (
      <>
        <div style={{ fontSize: 44 }}>👌</div>
        <h2 className="h4">Gracias por avisar</h2>
        <p className="text-muted mb-0">Cancelamos tu reserva y liberamos la mesa. ¡Te esperamos otro día!</p>
        {resumen}
      </>
    );
  } else if (!datos?.vigente) {
    contenido = (
      <>
        <h2 className="h4">Esta reserva ya no se puede modificar</h2>
        {resumen}
        {datos?.empresa?.telefono && (
          <a href={telLink(datos.empresa.telefono)} className="small">
            Llamar a {local}
          </a>
        )}
      </>
    );
  } else {
    // Link "No podré ir" (o confirmar que falló): se pide confirmar el toque
    contenido = (
      <>
        <h2 className="h4">{accion === "cancelar" ? "¿No podrás venir?" : "Tu reserva"}</h2>
        {resumen}
        {mensaje && <div className="alert alert-warning small">{mensaje}</div>}
        {accion === "cancelar" ? (
          <>
            <Button block color="danger" disabled={enviando} onClick={() => responder("cancelar")}>
              Sí, cancelar mi reserva
            </Button>
            <Button block outline className="mt-2" disabled={enviando} onClick={() => responder("confirmar")} style={{ borderColor: COLOR, color: COLOR }}>
              Me equivoqué, sí voy
            </Button>
          </>
        ) : (
          <Button block disabled={enviando} onClick={() => responder("confirmar")} style={{ background: COLOR, borderColor: COLOR, color: "#fff" }}>
            Confirmar asistencia
          </Button>
        )}
      </>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f6f7f9" }} className="d-flex align-items-center py-5">
      <Container style={{ maxWidth: 460 }}>
        <Card className="shadow border-0">
          <CardBody className="p-4 text-center">
            {datos?.empresa?.nombre && (
              <div className="small text-uppercase mb-3" style={{ letterSpacing: ".14em", color: COLOR, fontWeight: 700 }}>
                {datos.empresa.nombre}
              </div>
            )}
            {contenido}
            {datos?.empresa?.slug && estado === "listo" && (
              <Link to={`/${datos.empresa.slug}`} className="d-inline-block mt-3 small">
                Ir a {local}
              </Link>
            )}
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default AsistenciaMesa;

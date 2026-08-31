import React, { useEffect, useRef, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Input,
  FormGroup,
  Label,
  Badge,
  Spinner,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import {
  UtensilsCrossed,
  Droplets,
  Pill,
  Camera,
  Trash2,
  Plus,
  Check,
  X,
} from "lucide-react";
import UserHeader from "components/Headers/UserHeader.js";
import { useDiarioAlimenticio } from "context/DiarioAlimenticioContext";

/**
 * "Diario alimenticio": bitácora del día a día (comidas con foto opcional,
 * agua, suplementos tomados o no) — pensada sobre todo para tener algo
 * ordenado que mostrar en un control con nutricionista. Separada de "Plan
 * alimenticio" (que muestra la meta calórica calculada + ideas de comida):
 * esa es la recomendación, esta es el registro real de lo que se hizo.
 */

const TIPOS_COMIDA = [
  { value: "desayuno", label: "Desayuno" },
  { value: "almuerzo", label: "Almuerzo" },
  { value: "once", label: "Once" },
  { value: "cena", label: "Cena" },
  { value: "colacion", label: "Colación" },
  { value: "otro", label: "Otro" },
];

const fechaLegible = (fecha) =>
  new Date(fecha).toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const agruparPorDia = (comidas) => {
  const grupos = {};
  comidas.forEach((c) => {
    const dia = new Date(c.fecha).toLocaleDateString("es-CL", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
    });
    if (!grupos[dia]) grupos[dia] = [];
    grupos[dia].push(c);
  });
  return grupos;
};

/* =======================================================
   🍽️ Comidas
======================================================= */
const SeccionComidas = () => {
  const { crearComida, misComidas, eliminarComida } = useDiarioAlimenticio();
  const [comidas, setComidas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [tipoComida, setTipoComida] = useState("desayuno");
  const [descripcion, setDescripcion] = useState("");
  const [foto, setFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [error, setError] = useState(null);
  const inputFotoRef = useRef(null);

  const cargar = () => {
    setCargando(true);
    misComidas().then((data) => {
      setComidas(data);
      setCargando(false);
    });
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const elegirFoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFoto(file);
    setPreviewFoto(URL.createObjectURL(file));
  };

  const quitarFoto = () => {
    setFoto(null);
    setPreviewFoto(null);
    if (inputFotoRef.current) inputFotoRef.current.value = "";
  };

  const registrarComida = async () => {
    setGuardando(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("tipoComida", tipoComida);
      formData.append("descripcion", descripcion);
      if (foto) formData.append("foto", foto);

      await crearComida(formData);

      setDescripcion("");
      quitarFoto();
      cargar();
    } catch (e) {
      console.error("Error registrando comida:", e);
      setError("No se pudo guardar la comida. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  const borrarComida = async (id) => {
    setComidas((prev) => prev.filter((c) => c._id !== id));
    try {
      await eliminarComida(id);
    } catch (e) {
      console.error("Error eliminando comida:", e);
      cargar();
    }
  };

  const grupos = agruparPorDia(comidas);

  return (
    <>
      <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
        <CardBody className="p-4">
          <h5 className="mb-3">Registrar comida</h5>

          <Row>
            <Col md="4">
              <FormGroup>
                <Label className="small text-muted">Tipo</Label>
                <Input
                  type="select"
                  value={tipoComida}
                  onChange={(e) => setTipoComida(e.target.value)}
                >
                  {TIPOS_COMIDA.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </Col>
            <Col md="8">
              <FormGroup>
                <Label className="small text-muted">Descripción (opcional)</Label>
                <Input
                  type="text"
                  placeholder="Ej: Pollo con arroz y ensalada"
                  value={descripcion}
                  maxLength={300}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </FormGroup>
            </Col>
          </Row>

          <FormGroup className="mb-3">
            <Label className="small text-muted d-block">Foto (opcional)</Label>
            {previewFoto ? (
              <div className="d-flex align-items-center" style={{ gap: 12 }}>
                <img
                  src={previewFoto}
                  alt="Vista previa"
                  style={{
                    width: 72,
                    height: 72,
                    objectFit: "cover",
                    borderRadius: 12,
                  }}
                />
                <Button color="link" className="text-danger p-0" onClick={quitarFoto}>
                  <X size={16} className="mr-1" /> Quitar
                </Button>
              </div>
            ) : (
              <Button
                color="light"
                className="border"
                onClick={() => inputFotoRef.current?.click()}
              >
                <Camera size={16} className="mr-1" /> Agregar foto
              </Button>
            )}
            <input
              ref={inputFotoRef}
              type="file"
              accept="image/*"
              hidden
              onChange={elegirFoto}
            />
          </FormGroup>

          {error && <p className="text-danger small">{error}</p>}

          <Button color="success" disabled={guardando} onClick={registrarComida}>
            {guardando ? (
              <Spinner size="sm" className="mr-1" />
            ) : (
              <Plus size={16} className="mr-1" />
            )}
            {guardando ? "Guardando..." : "Registrar"}
          </Button>
        </CardBody>
      </Card>

      {cargando ? (
        <div className="text-center py-5">
          <Spinner color="success" />
        </div>
      ) : comidas.length === 0 ? (
        <div className="text-center py-5">
          <UtensilsCrossed size={40} className="text-muted mb-3" />
          <p className="text-muted mb-0">Todavía no registras comidas.</p>
        </div>
      ) : (
        Object.entries(grupos).map(([dia, items]) => (
          <div key={dia} className="mb-4">
            <h6 className="text-muted text-uppercase small mb-2">{dia}</h6>
            {items.map((c) => (
              <Card key={c._id} className="border-0 shadow-sm mb-2" style={{ borderRadius: 12 }}>
                <CardBody className="p-3 d-flex align-items-center">
                  {c.fotoUrl && (
                    <img
                      src={c.fotoUrl}
                      alt={c.tipoComida}
                      style={{
                        width: 56,
                        height: 56,
                        objectFit: "cover",
                        borderRadius: 10,
                        marginRight: 12,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                    <div className="d-flex align-items-center flex-wrap" style={{ gap: 8 }}>
                      <Badge color="success">
                        {TIPOS_COMIDA.find((t) => t.value === c.tipoComida)?.label ||
                          c.tipoComida}
                      </Badge>
                      <span className="text-muted small">{fechaLegible(c.fecha)}</span>
                    </div>
                    {c.descripcion && (
                      <p
                        className="mb-0 mt-1 small"
                        style={{ wordBreak: "break-word" }}
                      >
                        {c.descripcion}
                      </p>
                    )}
                  </div>
                  <Trash2
                    size={18}
                    className="text-danger flex-shrink-0 ml-2"
                    style={{ cursor: "pointer" }}
                    onClick={() => borrarComida(c._id)}
                  />
                </CardBody>
              </Card>
            ))}
          </div>
        ))
      )}
    </>
  );
};

/* =======================================================
   💧 Agua
======================================================= */
const CANTIDADES_RAPIDAS = [250, 500, 1000];

const SeccionAgua = () => {
  const { crearAgua, aguaHoy, eliminarAgua } = useDiarioAlimenticio();
  const [datos, setDatos] = useState({ registros: [], totalMililitros: 0 });
  const [cargando, setCargando] = useState(true);
  const [agregando, setAgregando] = useState(false);
  const [personalizado, setPersonalizado] = useState("");

  const cargar = () => {
    setCargando(true);
    aguaHoy().then((data) => {
      setDatos(data);
      setCargando(false);
    });
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const agregarAgua = async (ml) => {
    if (!ml || ml <= 0) return;
    setAgregando(true);
    try {
      await crearAgua(ml);
      setPersonalizado("");
      cargar();
    } catch (e) {
      console.error("Error registrando agua:", e);
    } finally {
      setAgregando(false);
    }
  };

  const borrarAgua = async (id) => {
    setDatos((prev) => ({
      registros: prev.registros.filter((r) => r._id !== id),
      totalMililitros:
        prev.totalMililitros -
        (prev.registros.find((r) => r._id === id)?.mililitros || 0),
    }));
    try {
      await eliminarAgua(id);
    } catch (e) {
      console.error("Error eliminando agua:", e);
      cargar();
    }
  };

  return (
    <Card className="border-0 shadow-sm" style={{ borderRadius: 16 }}>
      <CardBody className="p-4">
        <div className="text-center mb-4">
          <Droplets size={32} className="text-info mb-2" />
          <h2 className="font-weight-bold mb-0">
            {cargando ? "..." : `${datos.totalMililitros} ml`}
          </h2>
          <p className="text-muted small mb-0">Agua registrada hoy</p>
        </div>

        <div className="d-flex justify-content-center flex-wrap mb-3" style={{ gap: 10 }}>
          {CANTIDADES_RAPIDAS.map((ml) => (
            <Button
              key={ml}
              color="info"
              outline
              disabled={agregando}
              onClick={() => agregarAgua(ml)}
            >
              + {ml} ml
            </Button>
          ))}
        </div>

        <div className="d-flex justify-content-center align-items-center" style={{ gap: 8 }}>
          <Input
            type="number"
            placeholder="Cantidad (ml)"
            value={personalizado}
            style={{ maxWidth: 160 }}
            onChange={(e) => setPersonalizado(e.target.value)}
          />
          <Button
            color="info"
            disabled={agregando || !personalizado}
            onClick={() => agregarAgua(Number(personalizado))}
          >
            <Plus size={16} />
          </Button>
        </div>

        {!cargando && datos.registros.length > 0 && (
          <div className="mt-4">
            <h6 className="text-muted text-uppercase small mb-2">Registros de hoy</h6>
            {datos.registros.map((r) => (
              <div
                key={r._id}
                className="d-flex align-items-center justify-content-between border-bottom py-2"
              >
                <span className="small">
                  {r.mililitros} ml —{" "}
                  <span className="text-muted">
                    {new Date(r.fecha).toLocaleTimeString("es-CL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </span>
                <Trash2
                  size={16}
                  className="text-danger flex-shrink-0"
                  style={{ cursor: "pointer" }}
                  onClick={() => borrarAgua(r._id)}
                />
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

/* =======================================================
   💊 Suplementos
======================================================= */
const SeccionSuplementos = () => {
  const {
    crearSuplemento,
    misSuplementos,
    eliminarSuplemento,
    toggleTomaSuplemento,
  } = useDiarioAlimenticio();
  const [suplementos, setSuplementos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cargar = () => {
    setCargando(true);
    misSuplementos().then((data) => {
      setSuplementos(data);
      setCargando(false);
    });
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const agregarSuplemento = async () => {
    if (!nombreNuevo.trim()) return;
    setGuardando(true);
    try {
      await crearSuplemento(nombreNuevo.trim());
      setNombreNuevo("");
      cargar();
    } catch (e) {
      console.error("Error creando suplemento:", e);
    } finally {
      setGuardando(false);
    }
  };

  const alternarToma = async (id) => {
    setSuplementos((prev) =>
      prev.map((s) => (s._id === id ? { ...s, tomadoHoy: !s.tomadoHoy } : s)),
    );
    try {
      await toggleTomaSuplemento(id);
    } catch (e) {
      console.error("Error actualizando toma:", e);
      cargar();
    }
  };

  const borrarSuplemento = async (id) => {
    setSuplementos((prev) => prev.filter((s) => s._id !== id));
    try {
      await eliminarSuplemento(id);
    } catch (e) {
      console.error("Error eliminando suplemento:", e);
      cargar();
    }
  };

  return (
    <Card className="border-0 shadow-sm" style={{ borderRadius: 16 }}>
      <CardBody className="p-4">
        <h5 className="mb-3">Suplementos</h5>

        <div className="d-flex mb-4" style={{ gap: 8 }}>
          <Input
            type="text"
            placeholder="Ej: Creatina, Proteína..."
            value={nombreNuevo}
            maxLength={60}
            onChange={(e) => setNombreNuevo(e.target.value)}
          />
          <Button color="success" disabled={guardando} onClick={agregarSuplemento}>
            <Plus size={16} />
          </Button>
        </div>

        {cargando ? (
          <div className="text-center py-4">
            <Spinner color="success" size="sm" />
          </div>
        ) : suplementos.length === 0 ? (
          <div className="text-center py-4">
            <Pill size={36} className="text-muted mb-2" />
            <p className="text-muted mb-0">Todavía no agregas suplementos a seguir.</p>
          </div>
        ) : (
          suplementos.map((s) => (
            <div
              key={s._id}
              className="d-flex align-items-center justify-content-between border-bottom py-2"
            >
              <div className="d-flex align-items-center" style={{ gap: 10, minWidth: 0 }}>
                <Button
                  color={s.tomadoHoy ? "success" : "light"}
                  className="border rounded-circle d-flex align-items-center justify-content-center p-0"
                  style={{ width: 32, height: 32, flexShrink: 0 }}
                  onClick={() => alternarToma(s._id)}
                  title={s.tomadoHoy ? "Tomado hoy" : "Marcar como tomado hoy"}
                >
                  {s.tomadoHoy && <Check size={16} className="text-white" />}
                </Button>
                <span style={{ wordBreak: "break-word" }}>{s.nombre}</span>
              </div>
              <Trash2
                size={16}
                className="text-danger flex-shrink-0 ml-2"
                style={{ cursor: "pointer" }}
                onClick={() => borrarSuplemento(s._id)}
              />
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );
};

/* =======================================================
   Página
======================================================= */
const DiarioAlimenticio = () => {
  const [tabActiva, setTabActiva] = useState("comidas");

  return (
    <>
      <UserHeader />
      <Container className="mt--7 mb-5" fluid>
        <Row className="justify-content-center">
          <Col xl="8" lg="10">
            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
              <CardBody className="text-center py-5">
                <div className="bg-danger rounded-circle d-inline-flex p-3 mb-3 shadow-sm">
                  <UtensilsCrossed size={28} className="text-white" />
                </div>
                <h1 className="font-weight-bold display-4">Diario alimenticio</h1>
                <p className="text-muted lead mb-0">
                  Comidas, agua y suplementos del día a día — útil para tus controles
                  con nutricionista
                </p>
              </CardBody>
            </Card>

            <Nav tabs className="border-0 mb-4 justify-content-center flex-wrap">
              <NavItem>
                <NavLink
                  active={tabActiva === "comidas"}
                  onClick={() => setTabActiva("comidas")}
                  className="cursor-pointer rounded-lg font-weight-bold px-3 py-2 mr-2"
                  style={{ cursor: "pointer" }}
                >
                  <UtensilsCrossed size={16} className="mr-1" /> Comidas
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  active={tabActiva === "agua"}
                  onClick={() => setTabActiva("agua")}
                  className="cursor-pointer rounded-lg font-weight-bold px-3 py-2 mr-2"
                  style={{ cursor: "pointer" }}
                >
                  <Droplets size={16} className="mr-1" /> Agua
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  active={tabActiva === "suplementos"}
                  onClick={() => setTabActiva("suplementos")}
                  className="cursor-pointer rounded-lg font-weight-bold px-3 py-2"
                  style={{ cursor: "pointer" }}
                >
                  <Pill size={16} className="mr-1" /> Suplementos
                </NavLink>
              </NavItem>
            </Nav>

            <TabContent activeTab={tabActiva}>
              <TabPane tabId="comidas">
                <SeccionComidas />
              </TabPane>
              <TabPane tabId="agua">
                <SeccionAgua />
              </TabPane>
              <TabPane tabId="suplementos">
                <SeccionSuplementos />
              </TabPane>
            </TabContent>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default DiarioAlimenticio;

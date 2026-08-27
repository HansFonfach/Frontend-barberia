import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Badge,
  Spinner,
  FormGroup,
  Label,
  Input,
  Button,
} from "reactstrap";
import { ClipboardList, Plus, Trash2, Share2, Users, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";
import UserHeader from "components/Headers/UserHeader.js";
import { useEntrenamientoPersonal } from "context/EntrenamientoPersonalContext";

/**
 * "Mi rutina": cada quien arma sus propias rutinas (ej: "Rutina de
 * pecho" con sus ejercicios/series/reps/peso) y decide, rutina por
 * rutina, si la comparte con el resto de la empresa (dueño + amigos
 * invitados). Compartir es todo-o-nada por rutina, sin permisos por
 * persona, a propósito simple. Separado de "Mi entrenamiento" (el
 * registro del día a día) para no llenar una sola página con todo.
 */

const ICONOS_GRUPO = {
  pecho: "💪",
  espalda: "🏋️",
  piernas: "🦵",
  hombros: "🤸",
  brazos: "💪",
  core: "🔥",
  cardio: "🏃",
  otro: "✨",
};

const GRUPOS = [
  { key: "pecho", label: "Pecho" },
  { key: "espalda", label: "Espalda" },
  { key: "piernas", label: "Piernas" },
  { key: "hombros", label: "Hombros" },
  { key: "brazos", label: "Brazos" },
  { key: "core", label: "Core" },
  { key: "cardio", label: "Cardio" },
  { key: "otro", label: "Otro" },
];

const FILA_EJERCICIO_VACIA = { nombre: "", series: "", repeticiones: "", pesoKg: "" };

/* =======================================================
   Formulario para crear una rutina nueva
======================================================= */
const CrearRutinaForm = ({ catalogo, onCreada }) => {
  const { crearRutina } = useEntrenamientoPersonal();
  const [nombre, setNombre] = useState("");
  const [grupoMuscular, setGrupoMuscular] = useState("");
  const [notas, setNotas] = useState("");
  const [compartida, setCompartida] = useState(false);
  const [ejercicios, setEjercicios] = useState([{ ...FILA_EJERCICIO_VACIA }]);
  const [guardando, setGuardando] = useState(false);

  const agregarFila = () => setEjercicios((f) => [...f, { ...FILA_EJERCICIO_VACIA }]);
  const quitarFila = (idx) => setEjercicios((f) => f.filter((_, i) => i !== idx));
  const cambiarFila = (idx, campo, valor) =>
    setEjercicios((f) => f.map((fila, i) => (i === idx ? { ...fila, [campo]: valor } : fila)));

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      return Swal.fire("Falta info", "Ponle un nombre a la rutina", "warning");
    }
    if (!grupoMuscular) {
      return Swal.fire("Falta info", "Elige a qué grupo corresponde", "warning");
    }
    setGuardando(true);
    try {
      const ejerciciosLimpios = ejercicios
        .filter((e) => e.nombre.trim())
        .map((e) => ({
          nombre: e.nombre.trim(),
          series: e.series === "" ? null : Number(e.series),
          repeticiones: e.repeticiones === "" ? null : Number(e.repeticiones),
          pesoKg: e.pesoKg === "" ? null : Number(e.pesoKg),
        }));

      await crearRutina({ nombre: nombre.trim(), grupoMuscular, ejercicios: ejerciciosLimpios, notas, compartida });

      setNombre("");
      setGrupoMuscular("");
      setNotas("");
      setCompartida(false);
      setEjercicios([{ ...FILA_EJERCICIO_VACIA }]);
      onCreada && onCreada();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "No se pudo guardar la rutina", "error");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <datalist id="catalogo-ejercicios-rutina">
        {(catalogo || []).map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>

      <Row>
        <Col md="7">
          <FormGroup>
            <Label className="small font-weight-bold">Nombre de la rutina</Label>
            <Input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Rutina de pecho"
            />
          </FormGroup>
        </Col>
        <Col md="5">
          <FormGroup>
            <Label className="small font-weight-bold">Grupo</Label>
            <Input type="select" value={grupoMuscular} onChange={(e) => setGrupoMuscular(e.target.value)}>
              <option value="">Selecciona...</option>
              {GRUPOS.map((g) => (
                <option key={g.key} value={g.key}>
                  {ICONOS_GRUPO[g.key]} {g.label}
                </option>
              ))}
            </Input>
          </FormGroup>
        </Col>
      </Row>

      <Label className="small font-weight-bold">Ejercicios</Label>
      {ejercicios.map((fila, idx) => (
        <Row key={idx} className="align-items-end mb-2">
          <Col xs="12" sm="5">
            <Input
              type="text"
              list="catalogo-ejercicios-rutina"
              placeholder="Ej: Prensa de piernas"
              value={fila.nombre}
              onChange={(e) => cambiarFila(idx, "nombre", e.target.value)}
            />
          </Col>
          <Col xs="4" sm="2">
            <Input
              type="number"
              min="0"
              placeholder="Series"
              value={fila.series}
              onChange={(e) => cambiarFila(idx, "series", e.target.value)}
            />
          </Col>
          <Col xs="4" sm="2">
            <Input
              type="number"
              min="0"
              placeholder="Reps"
              value={fila.repeticiones}
              onChange={(e) => cambiarFila(idx, "repeticiones", e.target.value)}
            />
          </Col>
          <Col xs="3" sm="2">
            <Input
              type="number"
              min="0"
              step="0.5"
              placeholder="Kg"
              value={fila.pesoKg}
              onChange={(e) => cambiarFila(idx, "pesoKg", e.target.value)}
            />
          </Col>
          <Col xs="1">
            {ejercicios.length > 1 && (
              <Button size="sm" color="link" className="text-danger p-0" onClick={() => quitarFila(idx)}>
                <Trash2 size={14} />
              </Button>
            )}
          </Col>
        </Row>
      ))}
      <Button size="sm" color="link" className="p-0 mb-3" onClick={agregarFila}>
        <Plus size={14} /> Agregar ejercicio
      </Button>

      <FormGroup>
        <Label className="small font-weight-bold">Notas (opcional)</Label>
        <Input
          type="text"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Ej: descanso 60 seg entre series"
        />
      </FormGroup>

      <FormGroup check className="mb-3">
        <Label check className="small">
          <Input type="checkbox" checked={compartida} onChange={(e) => setCompartida(e.target.checked)} />{" "}
          Compartir esta rutina con el resto de la empresa
        </Label>
      </FormGroup>

      <Button block color="success" disabled={guardando} onClick={handleGuardar} className="font-weight-bold">
        {guardando ? "Guardando..." : "Guardar rutina"}
      </Button>
    </>
  );
};

/* =======================================================
   Tarjeta de una rutina propia (con acciones)
======================================================= */
const RutinaPropiaCard = ({ rutina, onCambio }) => {
  const { actualizarRutina, eliminarRutina } = useEntrenamientoPersonal();
  const [cambiando, setCambiando] = useState(false);

  const toggleCompartir = async () => {
    setCambiando(true);
    try {
      await actualizarRutina(rutina._id, { compartida: !rutina.compartida });
      onCambio && onCambio();
    } catch (error) {
      Swal.fire("Error", "No se pudo actualizar la rutina", "error");
    } finally {
      setCambiando(false);
    }
  };

  const handleEliminar = async () => {
    const confirmacion = await Swal.fire({
      title: "¿Eliminar esta rutina?",
      text: rutina.nombre,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#f5365c",
    });
    if (!confirmacion.isConfirmed) return;
    try {
      await eliminarRutina(rutina._id);
      onCambio && onCambio();
    } catch (error) {
      Swal.fire("Error", "No se pudo eliminar la rutina", "error");
    }
  };

  return (
    <Card className="border shadow-none mb-3" style={{ borderRadius: 12 }}>
      <CardBody className="p-3">
        <div className="d-flex justify-content-between align-items-start flex-wrap" style={{ gap: 8 }}>
          <div>
            <span style={{ fontSize: 18 }}>{ICONOS_GRUPO[rutina.grupoMuscular]}</span>{" "}
            <strong>{rutina.nombre}</strong>
            {rutina.compartida && (
              <Badge color="success" pill className="ml-2">
                <Share2 size={11} /> Compartida
              </Badge>
            )}
          </div>
          <div className="d-flex" style={{ gap: 8 }}>
            <Button size="sm" color={rutina.compartida ? "secondary" : "success"} outline disabled={cambiando} onClick={toggleCompartir}>
              {rutina.compartida ? (
                <>
                  <EyeOff size={13} /> Dejar de compartir
                </>
              ) : (
                <>
                  <Eye size={13} /> Compartir
                </>
              )}
            </Button>
            <Button size="sm" color="link" className="text-danger p-0" onClick={handleEliminar}>
              <Trash2 size={16} />
            </Button>
          </div>
        </div>

        {rutina.ejercicios?.length > 0 && (
          <ul className="small text-muted mt-2 mb-0 pl-3">
            {rutina.ejercicios.map((e, i) => (
              <li key={i}>
                {e.nombre}
                {e.series != null ? ` — ${e.series}x${e.repeticiones ?? "?"}` : ""}
                {e.pesoKg != null ? ` @ ${e.pesoKg}kg` : ""}
              </li>
            ))}
          </ul>
        )}
        {rutina.notas && <p className="small text-muted mt-2 mb-0">📝 {rutina.notas}</p>}
      </CardBody>
    </Card>
  );
};

/* =======================================================
   Tarjeta de una rutina compartida por otro (solo lectura)
======================================================= */
const RutinaCompartidaCard = ({ rutina }) => (
  <Card className="border shadow-none mb-3" style={{ borderRadius: 12 }}>
    <CardBody className="p-3">
      <div>
        <span style={{ fontSize: 18 }}>{ICONOS_GRUPO[rutina.grupoMuscular]}</span> <strong>{rutina.nombre}</strong>
        <Badge color="light" pill className="ml-2 border">
          <Users size={11} /> {rutina.autorNombre}
        </Badge>
      </div>
      {rutina.ejercicios?.length > 0 && (
        <ul className="small text-muted mt-2 mb-0 pl-3">
          {rutina.ejercicios.map((e, i) => (
            <li key={i}>
              {e.nombre}
              {e.series != null ? ` — ${e.series}x${e.repeticiones ?? "?"}` : ""}
              {e.pesoKg != null ? ` @ ${e.pesoKg}kg` : ""}
            </li>
          ))}
        </ul>
      )}
      {rutina.notas && <p className="small text-muted mt-2 mb-0">📝 {rutina.notas}</p>}
    </CardBody>
  </Card>
);

const MiRutina = () => {
  const { misRutinas, rutinasCompartidas, catalogoEjercicios } = useEntrenamientoPersonal();

  const [propias, setPropias] = useState([]);
  const [compartidas, setCompartidas] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarTodo = async () => {
    setCargando(true);
    const [p, c] = await Promise.all([misRutinas(), rutinasCompartidas()]);
    setPropias(p);
    setCompartidas(c);
    setCargando(false);
  };

  useEffect(() => {
    cargarTodo();
    catalogoEjercicios().then(setCatalogo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <UserHeader />
      <Container className="mt--7 mb-5" fluid>
        <Row className="justify-content-center">
          <Col xl="10" lg="11">
            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
              <CardBody className="text-center py-5">
                <div className="bg-info rounded-circle d-inline-flex p-3 mb-3 shadow-sm">
                  <ClipboardList size={28} className="text-white" />
                </div>
                <h1 className="font-weight-bold display-4">Mi rutina</h1>
                <p className="text-muted lead mb-0">
                  Arma tus rutinas por grupo muscular y compártelas si quieres
                </p>
              </CardBody>
            </Card>

            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
              <CardBody className="p-4">
                <h4 className="mb-3">Nueva rutina</h4>
                <CrearRutinaForm catalogo={catalogo} onCreada={cargarTodo} />
              </CardBody>
            </Card>

            {cargando ? (
              <div className="text-center py-5">
                <Spinner color="info" />
              </div>
            ) : (
              <>
                <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
                  <CardBody className="p-4">
                    <h4 className="mb-3">Mis rutinas</h4>
                    {propias.length === 0 ? (
                      <p className="text-muted small mb-0">Todavía no tienes rutinas guardadas.</p>
                    ) : (
                      propias.map((r) => <RutinaPropiaCard key={r._id} rutina={r} onCambio={cargarTodo} />)
                    )}
                  </CardBody>
                </Card>

                <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
                  <CardBody className="p-4">
                    <div className="d-flex align-items-center mb-3">
                      <Users size={20} className="text-info mr-2" />
                      <h4 className="mb-0">Rutinas compartidas por otros</h4>
                    </div>
                    {compartidas.length === 0 ? (
                      <p className="text-muted small mb-0">
                        Todavía nadie ha compartido una rutina en tu empresa.
                      </p>
                    ) : (
                      compartidas.map((r) => <RutinaCompartidaCard key={r._id} rutina={r} />)
                    )}
                  </CardBody>
                </Card>
              </>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default MiRutina;

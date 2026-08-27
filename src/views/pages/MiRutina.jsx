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
import {
  ClipboardList,
  Plus,
  Trash2,
  Share2,
  Users,
  Eye,
  EyeOff,
  Sparkles,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import UserHeader from "components/Headers/UserHeader.js";
import { useEntrenamientoPersonal } from "context/EntrenamientoPersonalContext";
import PerfilEntrenamientoForm from "components/gimnasio/PerfilEntrenamientoForm";
import { useRutValidator } from "hooks/useRutValidador";

/**
 * "Mi rutina": arriba, una rutina sugerida según tu objetivo (splits reales,
 * no generados al vuelo) que puedes usar como base para el formulario de
 * abajo y editar a gusto. Después, cada quien arma sus propias rutinas (ej:
 * "Rutina de pecho" con sus ejercicios/series/reps/peso) y decide, rutina
 * por rutina, si la comparte con el resto de la empresa (dueño + amigos
 * invitados) y/o con 1+ personas puntuales (buscadas por RUT dentro de la
 * empresa). En ambos casos es solo lectura para quien la recibe — si le
 * sirve, la usa como base para armar su propia rutina editable, en vez de
 * editar la misma rutina entre dos personas (evita pisarse cambios y
 * dueños ambiguos). Separado de "Mi entrenamiento" (el registro del día a
 * día) para no llenar una sola página con todo.
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
   Compartir con alguien en particular: busca por RUT dentro de la
   empresa y arma una lista de destinatarios (controlada por el padre).
   Solo lectura para quien la recibe — ver comentario arriba y en
   rutina.model.js.
======================================================= */
const CompartirConPersona = ({ destinatarios, onCambio }) => {
  const { buscarMiembroPorRut } = useEntrenamientoPersonal();
  const { rut, handleRutChange, error: errorRut, clearRut, cleanRut } = useRutValidator("");
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState("");

  const handleAgregar = async () => {
    if (!cleanRut) return;
    setBuscando(true);
    setErrorBusqueda("");
    try {
      const persona = await buscarMiembroPorRut(cleanRut);
      if (destinatarios.some((d) => d._id === persona._id)) {
        setErrorBusqueda("Ya la agregaste a la lista");
      } else {
        onCambio([...destinatarios, persona]);
        clearRut();
      }
    } catch (error) {
      const esNoEncontrado = error?.response?.status === 404;
      setErrorBusqueda(
        esNoEncontrado
          ? "No se encontró a nadie con ese RUT en tu empresa"
          : error.response?.data?.message || "Error al buscar",
      );
    } finally {
      setBuscando(false);
    }
  };

  const quitar = (id) => onCambio(destinatarios.filter((d) => d._id !== id));

  return (
    <FormGroup>
      <Label className="small font-weight-bold">Compartir con alguien en particular (opcional)</Label>
      {destinatarios.length > 0 && (
        <div className="d-flex flex-wrap mb-2" style={{ gap: 6 }}>
          {destinatarios.map((d) => (
            <Badge
              key={d._id}
              color="info"
              pill
              className="d-flex align-items-center"
              style={{ gap: 4, paddingRight: 6 }}
            >
              <UserRound size={11} /> {d.nombre} {d.apellido}
              <button
                type="button"
                onClick={() => quitar(d._id)}
                className="btn btn-link p-0 text-white"
                style={{ lineHeight: 0 }}
                aria-label={`Quitar a ${d.nombre}`}
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <div className="d-flex align-items-start" style={{ gap: 8 }}>
        <Input
          type="text"
          value={rut}
          onChange={handleRutChange}
          placeholder="RUT de la persona (ej: 12.345.678-9)"
          disabled={buscando}
        />
        <Button
          size="sm"
          color="info"
          outline
          disabled={buscando || !cleanRut}
          onClick={handleAgregar}
          style={{ whiteSpace: "nowrap" }}
        >
          {buscando ? <Spinner size="sm" /> : <><UserPlus size={14} /> Agregar</>}
        </Button>
      </div>
      {errorRut && rut && <small className="text-warning d-block mt-1">{errorRut}</small>}
      {errorBusqueda && !errorRut && <small className="text-danger d-block mt-1">{errorBusqueda}</small>}
    </FormGroup>
  );
};

/* =======================================================
   Formulario para crear una rutina nueva
======================================================= */
const CrearRutinaForm = ({ catalogo, onCreada, plantilla }) => {
  const { crearRutina } = useEntrenamientoPersonal();
  const [nombre, setNombre] = useState("");
  const [grupoMuscular, setGrupoMuscular] = useState("");
  const [notas, setNotas] = useState("");
  const [compartida, setCompartida] = useState(false);
  const [compartidaConUsuarios, setCompartidaConUsuarios] = useState([]);
  const [ejercicios, setEjercicios] = useState([{ ...FILA_EJERCICIO_VACIA }]);
  const [guardando, setGuardando] = useState(false);

  // Cuando el padre pasa una plantilla sugerida (botón "Usar como base"),
  // prellena el formulario — el usuario sigue pudiendo editar todo antes
  // de guardar. _seq cambia en cada click, incluso si eligen la misma
  // plantilla dos veces seguidas, para que el efecto se dispare de nuevo.
  useEffect(() => {
    if (!plantilla) return;
    setNombre(plantilla.nombre || "");
    setGrupoMuscular(plantilla.grupoMuscular || "");
    setNotas(plantilla.notas || "");
    setCompartida(false);
    setCompartidaConUsuarios([]);
    setEjercicios(
      (plantilla.ejercicios || []).map((e) => ({
        nombre: e.nombre || "",
        series: e.series != null ? String(e.series) : "",
        repeticiones: e.repeticiones != null ? String(e.repeticiones) : "",
        pesoKg: "",
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plantilla?._seq]);

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

      await crearRutina({
        nombre: nombre.trim(),
        grupoMuscular,
        ejercicios: ejerciciosLimpios,
        notas,
        compartida,
        compartidaConUsuarios: compartidaConUsuarios.map((d) => d._id),
      });

      setNombre("");
      setGrupoMuscular("");
      setNotas("");
      setCompartida(false);
      setCompartidaConUsuarios([]);
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

      <CompartirConPersona destinatarios={compartidaConUsuarios} onCambio={setCompartidaConUsuarios} />

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
  const [editandoDestinatarios, setEditandoDestinatarios] = useState(false);
  const destinatarios = rutina.compartidaConUsuarios || [];

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

  const guardarDestinatarios = async (nuevaLista) => {
    setCambiando(true);
    try {
      await actualizarRutina(rutina._id, { compartidaConUsuarios: nuevaLista.map((d) => d._id) });
      onCambio && onCambio();
    } catch (error) {
      Swal.fire("Error", "No se pudo actualizar con quién la compartes", "error");
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
            {destinatarios.length > 0 && (
              <Badge color="info" pill className="ml-2">
                <UserRound size={11} /> Con {destinatarios.length}{" "}
                {destinatarios.length === 1 ? "persona" : "personas"}
              </Badge>
            )}
          </div>
          <div className="d-flex flex-wrap" style={{ gap: 8 }}>
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
            <Button
              size="sm"
              color="info"
              outline
              disabled={cambiando}
              onClick={() => setEditandoDestinatarios((v) => !v)}
            >
              <UserPlus size={13} /> {editandoDestinatarios ? "Ocultar" : "Compartir con alguien"}
            </Button>
            <Button size="sm" color="link" className="text-danger p-0" onClick={handleEliminar}>
              <Trash2 size={16} />
            </Button>
          </div>
        </div>

        {editandoDestinatarios && (
          <div className="mt-3 pt-3" style={{ borderTop: "1px solid #eee" }}>
            <CompartirConPersona destinatarios={destinatarios} onCambio={guardarDestinatarios} />
          </div>
        )}

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
const RutinaCompartidaCard = ({ rutina, onUsarComoBase }) => (
  <Card className="border shadow-none mb-3" style={{ borderRadius: 12 }}>
    <CardBody className="p-3">
      <div className="d-flex justify-content-between align-items-start flex-wrap" style={{ gap: 8 }}>
        <div>
          <span style={{ fontSize: 18 }}>{ICONOS_GRUPO[rutina.grupoMuscular]}</span> <strong>{rutina.nombre}</strong>
          {rutina.origen === "directa" ? (
            <Badge color="info" pill className="ml-2">
              <UserRound size={11} /> {rutina.autorNombre} la compartió contigo
            </Badge>
          ) : (
            <Badge color="light" pill className="ml-2 border">
              <Users size={11} /> {rutina.autorNombre}
            </Badge>
          )}
        </div>
        <Button size="sm" color="warning" outline onClick={() => onUsarComoBase(rutina)}>
          Usar como base
        </Button>
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
      <p className="text-muted mt-2 mb-0" style={{ fontSize: 11 }}>
        Solo lectura — si te sirve, "Usar como base" la copia para que la edites como propia, sin tocar la de{" "}
        {rutina.autorNombre}.
      </p>
    </CardBody>
  </Card>
);

/* =======================================================
   Rutina sugerida según el objetivo del perfil — plantillas fijas, cada
   "día" se puede usar como base para el formulario de crear rutina.
======================================================= */
const RutinaSugerida = ({ refrescarClave, onUsarComoBase }) => {
  const { rutinaSugerida } = useEntrenamientoPersonal();
  const [sugerida, setSugerida] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    rutinaSugerida().then((data) => {
      setSugerida(data);
      setCargando(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refrescarClave]);

  return (
    <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
      <CardBody className="p-4">
        <div className="d-flex align-items-center mb-2">
          <Sparkles size={20} className="text-warning mr-2" />
          <h4 className="mb-0">Rutina sugerida según tu objetivo</h4>
        </div>

        {cargando ? (
          <div className="text-center py-3">
            <Spinner color="warning" size="sm" />
          </div>
        ) : !sugerida?.disponible ? (
          <p className="text-muted small mb-0">{sugerida?.mensaje || "Define tu objetivo arriba para ver una sugerencia."}</p>
        ) : (
          <>
            <p className="text-muted small mb-3">{sugerida.notaGeneral}</p>
            {sugerida.dias.map((dia, idx) => (
              <div key={idx} className="border rounded p-3 mb-2" style={{ borderRadius: 12 }}>
                <div className="d-flex justify-content-between align-items-start flex-wrap" style={{ gap: 8 }}>
                  <div>
                    <span style={{ fontSize: 18 }}>{ICONOS_GRUPO[dia.grupoMuscular] || "🏋️"}</span>{" "}
                    <strong>{dia.nombre}</strong>
                  </div>
                  <Button size="sm" color="warning" outline onClick={() => onUsarComoBase(dia)}>
                    Usar como base
                  </Button>
                </div>
                <ul className="small text-muted mt-2 mb-0 pl-3">
                  {dia.ejercicios.map((e, i) => (
                    <li key={i}>
                      {e.nombre} — {e.series}x{e.repeticiones}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="text-muted small mt-2 mb-0">{sugerida.disclaimer}</p>
          </>
        )}
      </CardBody>
    </Card>
  );
};

const MiRutina = () => {
  const { misRutinas, rutinasCompartidas, catalogoEjercicios } = useEntrenamientoPersonal();

  const [propias, setPropias] = useState([]);
  const [compartidas, setCompartidas] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescarClave, setRefrescarClave] = useState(0);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(null);
  const [contadorPlantilla, setContadorPlantilla] = useState(0);

  // Usado tanto por "Rutina sugerida" como por "Rutinas compartidas por
  // otros" — un solo contador compartido para que _seq nunca se repita
  // entre las dos fuentes (si no, el useEffect de CrearRutinaForm podría
  // no dispararse de nuevo al pasar de una a otra).
  const usarComoBase = (datos) => {
    const siguiente = contadorPlantilla + 1;
    setContadorPlantilla(siguiente);
    setPlantillaSeleccionada({ ...datos, _seq: siguiente });
  };

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

            <PerfilEntrenamientoForm onGuardado={() => setRefrescarClave((c) => c + 1)} />
            <RutinaSugerida refrescarClave={refrescarClave} onUsarComoBase={usarComoBase} />

            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
              <CardBody className="p-4">
                <h4 className="mb-3">Nueva rutina</h4>
                <CrearRutinaForm catalogo={catalogo} onCreada={cargarTodo} plantilla={plantillaSeleccionada} />
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
                      compartidas.map((r) => (
                        <RutinaCompartidaCard key={r._id} rutina={r} onUsarComoBase={usarComoBase} />
                      ))
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

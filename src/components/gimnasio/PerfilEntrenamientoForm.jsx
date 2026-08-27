import React, { useEffect, useState } from "react";
import { Card, CardBody, FormGroup, Label, Input, Button, Badge } from "reactstrap";
import { Target, Pencil, Save } from "lucide-react";
import Swal from "sweetalert2";
import { useEntrenamientoPersonal } from "context/EntrenamientoPersonalContext";

/**
 * Perfil de entrenamiento: objetivo (bajar grasa / subir masa / mantenerme
 * / mejorar resistencia), sexo biológico y fecha de nacimiento — 100%
 * opcional, lo completa el propio cliente. Se usa solo para calcular
 * calorías/macros reales (Plan alimenticio) y para sugerir una rutina
 * (Mi rutina) — nunca para mostrar un "estado" o etiqueta de la persona.
 *
 * Autocontenido (mismo patrón que BitacoraCorporal.jsx): se usa tal cual
 * en más de una página, cada una con su propio "onGuardado" para refrescar
 * lo que dependa del perfil.
 */

const OBJETIVOS = [
  { key: "bajar_grasa", label: "Bajar grasa", icono: "🔥" },
  { key: "subir_masa", label: "Subir masa muscular", icono: "💪" },
  { key: "mantenimiento", label: "Mantenerme", icono: "⚖️" },
  { key: "resistencia", label: "Mejorar resistencia", icono: "🏃" },
];
const NOMBRE_OBJETIVO = Object.fromEntries(OBJETIVOS.map((o) => [o.key, `${o.icono} ${o.label}`]));

const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return null;
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const aunNoCumple =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
  if (aunNoCumple) edad -= 1;
  return edad;
};

const PerfilEntrenamientoForm = ({ onGuardado }) => {
  const { perfilEntrenamiento, actualizarPerfilEntrenamiento } = useEntrenamientoPersonal();

  const [perfil, setPerfil] = useState(null);
  const [form, setForm] = useState({ objetivo: "", sexoBiologico: "", fechaNacimiento: "" });
  const [editando, setEditando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    setCargando(true);
    const data = await perfilEntrenamiento();
    setPerfil(data);
    setForm({
      objetivo: data.objetivo || "",
      sexoBiologico: data.sexoBiologico || "",
      fechaNacimiento: data.fechaNacimiento ? String(data.fechaNacimiento).slice(0, 10) : "",
    });
    if (!data.objetivo) setEditando(true); // si nunca lo llenó, abre el form directo
    setCargando(false);
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await actualizarPerfilEntrenamiento({
        objetivo: form.objetivo || null,
        sexoBiologico: form.sexoBiologico || null,
        fechaNacimiento: form.fechaNacimiento || null,
      });
      setEditando(false);
      await cargar();
      onGuardado && onGuardado();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "No se pudo guardar tu perfil", "error");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return null;

  return (
    <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
      <CardBody className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap" style={{ gap: 8 }}>
          <div className="d-flex align-items-center">
            <Target size={20} className="text-primary mr-2" />
            <h4 className="mb-0">Tu objetivo</h4>
          </div>
          {!editando && (
            <Button size="sm" color="link" className="p-0" onClick={() => setEditando(true)}>
              <Pencil size={14} /> Editar
            </Button>
          )}
        </div>

        {!editando ? (
          <div>
            <p className="mb-1">
              {perfil?.objetivo ? (
                <Badge color="primary" pill style={{ fontSize: 13 }}>
                  {NOMBRE_OBJETIVO[perfil.objetivo]}
                </Badge>
              ) : (
                <span className="text-muted small">Todavía no definiste un objetivo.</span>
              )}
            </p>
            <p className="text-muted small mb-0">
              {perfil?.sexoBiologico ? (perfil.sexoBiologico === "masculino" ? "Sexo: masculino" : "Sexo: femenino") : "Sexo biológico: sin definir"}
              {perfil?.fechaNacimiento ? ` · ${calcularEdad(perfil.fechaNacimiento)} años` : ""}
            </p>
          </div>
        ) : (
          <>
            <p className="text-muted small mb-3">
              El objetivo se usa para sugerirte una rutina y calcular tus calorías/macros. El
              sexo biológico y la fecha de nacimiento solo se usan para esa fórmula de calorías
              (Mifflin-St Jeor) — todo es opcional, puedes dejarlo en blanco.
            </p>

            <FormGroup>
              <Label className="small font-weight-bold">Objetivo</Label>
              <Input
                type="select"
                value={form.objetivo}
                onChange={(e) => setForm((f) => ({ ...f, objetivo: e.target.value }))}
              >
                <option value="">Sin definir</option>
                {OBJETIVOS.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.icono} {o.label}
                  </option>
                ))}
              </Input>
            </FormGroup>

            <FormGroup>
              <Label className="small font-weight-bold">Sexo biológico (para el cálculo de calorías)</Label>
              <Input
                type="select"
                value={form.sexoBiologico}
                onChange={(e) => setForm((f) => ({ ...f, sexoBiologico: e.target.value }))}
              >
                <option value="">Prefiero no decirlo</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
              </Input>
            </FormGroup>

            <FormGroup>
              <Label className="small font-weight-bold">Fecha de nacimiento (para el cálculo de calorías)</Label>
              <Input
                type="date"
                value={form.fechaNacimiento}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setForm((f) => ({ ...f, fechaNacimiento: e.target.value }))}
              />
            </FormGroup>

            <div className="d-flex" style={{ gap: 8 }}>
              <Button color="success" disabled={guardando} onClick={handleGuardar} className="font-weight-bold">
                <Save size={14} /> {guardando ? "Guardando..." : "Guardar"}
              </Button>
              {perfil?.objetivo && (
                <Button color="link" className="text-muted" disabled={guardando} onClick={() => setEditando(false)}>
                  Cancelar
                </Button>
              )}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default PerfilEntrenamientoForm;

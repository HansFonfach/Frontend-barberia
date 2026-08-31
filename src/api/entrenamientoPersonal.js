import { axiosPrivate } from "./axiosPrivate";

// Módulo de uso personal (modulos.entrenamientoPersonal): registro libre de
// entrenamiento (gimnasio o deporte) + sugerencia del día + racha/hitos.
// Simétrico para todos los clientes de la empresa (dueño y amigos que se
// registren) — cada quien solo ve/edita sus propios registros.

// data = { fecha?, tipoActividad (pecho|espalda|piernas|hombros|brazos|core|
//   cardio|futbol|otro), duracionMinutos?, notas?,
//   ejercicios?: [{ nombre, pesoKg?, series?, repeticiones? }] }
export const postRegistroEntrenamiento = (data) =>
  axiosPrivate.post("/entrenamiento-personal/registro", data);

// data = { duracionMinutos?, notas?, ejercicios? } — cada campo es
// independiente. Pensado sobre todo para ir agregando ejercicios a un
// registro ya creado (registrar "ejercicio por ejercicio" mientras se
// entrena, en vez de todo junto al final).
export const putRegistroEntrenamiento = (id, data) =>
  axiosPrivate.put(`/entrenamiento-personal/registro/${id}`, data);

export const getMisRegistrosEntrenamiento = (dias = 60) =>
  axiosPrivate.get("/entrenamiento-personal/mis-registros", { params: { dias } });

export const deleteRegistroEntrenamiento = (id) =>
  axiosPrivate.delete(`/entrenamiento-personal/registro/${id}`);

export const getMiProgresoEntrenamiento = () =>
  axiosPrivate.get("/entrenamiento-personal/mi-progreso");

// Catálogo de nombres de ejercicios/máquinas ya usados por la empresa
// (dueño + amigos) — para autocompletar al registrar, sin depender de
// ninguna API externa de "máquinas de gimnasio".
export const getCatalogoEjerciciosEntrenamiento = () =>
  axiosPrivate.get("/entrenamiento-personal/catalogo-ejercicios");

// ── Rutinas: cada quien arma las suyas y decide, rutina por rutina, si
// las comparte con el resto de la empresa. ──

// data = { nombre, grupoMuscular, ejercicios?: [{ nombre, series?,
//   repeticiones?, pesoKg? }], notas?, compartida? }
export const postRutina = (data) => axiosPrivate.post("/entrenamiento-personal/rutina", data);

export const getMisRutinas = () => axiosPrivate.get("/entrenamiento-personal/mis-rutinas");

export const getRutinasCompartidas = () =>
  axiosPrivate.get("/entrenamiento-personal/rutinas-compartidas");

export const putRutina = (id, data) =>
  axiosPrivate.put(`/entrenamiento-personal/rutina/${id}`, data);

export const deleteRutina = (id) =>
  axiosPrivate.delete(`/entrenamiento-personal/rutina/${id}`);

// ── Perfil de entrenamiento (objetivo, sexo biológico, fecha de
// nacimiento) — 100% opcional, se usa solo para la calculadora de
// calorías/macros y la rutina sugerida. ──

export const getPerfilEntrenamiento = () => axiosPrivate.get("/entrenamiento-personal/perfil");

// data = { objetivo?, sexoBiologico?, fechaNacimiento? } — cada campo es
// independiente, mandar null/"" en uno lo borra sin tocar los demás.
export const putPerfilEntrenamiento = (data) => axiosPrivate.put("/entrenamiento-personal/perfil", data);

// Calorías/macros calculados con fórmula real (Mifflin-St Jeor) a partir
// del perfil + la última bitácora + la frecuencia real de entrenamiento.
export const getRecomendacionNutricional = () =>
  axiosPrivate.get("/entrenamiento-personal/recomendacion-nutricional");

// Plantilla de rutina sugerida según el objetivo del perfil.
export const getRutinaSugerida = () => axiosPrivate.get("/entrenamiento-personal/rutina-sugerida");

// Miembros de la empresa (dueño + amigos) con su actividad — SOLO ADMIN.
export const getMiembrosEntrenamiento = () => axiosPrivate.get("/entrenamiento-personal/miembros");

// Busca a alguien de tu empresa por RUT, para compartir una rutina
// directamente con esa persona (devuelve solo _id/nombre/apellido).
export const buscarMiembroPorRut = (rut) =>
  axiosPrivate.get(`/entrenamiento-personal/buscar-miembro/${encodeURIComponent(rut)}`);

// Historial filtrado por un solo grupo (ej: "pecho") + progresión de peso
// por ejercicio dentro de ese grupo — a diferencia de "mis-registros" que
// trae todo mezclado. dias es opcional (por defecto 365 en el backend).
export const getHistorialPorGrupo = (grupo, dias) =>
  axiosPrivate.get(`/entrenamiento-personal/historial/${grupo}`, {
    params: dias ? { dias } : {},
  });

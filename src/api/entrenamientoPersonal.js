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

import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Badge,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  FormGroup,
  Label,
  Input,
  Button,
} from "reactstrap";
import { Line } from "react-chartjs-2";
import { Plus, Trash2, ScrollText } from "lucide-react";
import Swal from "sweetalert2";
import { useProgresoCliente } from "context/ProgresoClienteContext";

/**
 * Bitácora de peso/medidas corporales — compartida entre "Mi progreso"
 * (clases de gimnasio) y "Mi entrenamiento" (uso personal), porque el
 * registro corporal es el mismo dato para ambos, no depende de si el
 * cliente asiste a clases o entrena por su cuenta.
 *
 * A propósito NO hay ningún texto que interprete esos números (nada de
 * "vas bien", "deberías bajar de peso", IMC, etc.) — eso requeriría a un
 * profesional de la salud detrás, y esto es solo un registro personal.
 */

const formatFecha = (fecha) =>
  new Date(fecha).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const CAMPOS_MEDIDAS = [
  { key: "cinturaCm", label: "Cintura (cm)" },
  { key: "caderaCm", label: "Cadera (cm)" },
  { key: "pechoCm", label: "Pecho (cm)" },
  { key: "brazoCm", label: "Brazo (cm)" },
  { key: "piernaCm", label: "Pierna (cm)" },
];

const FORM_VACIO = {
  pesoKg: "",
  alturaCm: "",
  grasaCorporalPorcentaje: "",
  cinturaCm: "",
  caderaCm: "",
  pechoCm: "",
  brazoCm: "",
  piernaCm: "",
  notas: "",
};

/** Modal para agregar un registro a la bitácora. */
const RegistrarMedicionModal = ({ isOpen, toggle, onGuardado }) => {
  const { crearMedicionCorporal } = useProgresoCliente();
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (isOpen) setForm(FORM_VACIO);
  }, [isOpen]);

  const handleChange = (campo) => (e) =>
    setForm((f) => ({ ...f, [campo]: e.target.value }));

  const handleGuardar = async () => {
    const numero = (v) => (v === "" || v === null ? null : Number(v));

    const tieneAlgo =
      numero(form.pesoKg) != null ||
      numero(form.alturaCm) != null ||
      numero(form.grasaCorporalPorcentaje) != null ||
      CAMPOS_MEDIDAS.some((c) => numero(form[c.key]) != null);

    if (!tieneAlgo) {
      return Swal.fire("Falta info", "Ingresa al menos un dato (peso, medidas, etc.)", "warning");
    }

    setGuardando(true);
    try {
      await crearMedicionCorporal({
        pesoKg: numero(form.pesoKg),
        alturaCm: numero(form.alturaCm),
        grasaCorporalPorcentaje: numero(form.grasaCorporalPorcentaje),
        medidas: {
          cinturaCm: numero(form.cinturaCm),
          caderaCm: numero(form.caderaCm),
          pechoCm: numero(form.pechoCm),
          brazoCm: numero(form.brazoCm),
          piernaCm: numero(form.piernaCm),
        },
        notas: form.notas || "",
      });
      toggle();
      onGuardado && onGuardado();
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo guardar el registro",
        "error",
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Nuevo registro</ModalHeader>
      <ModalBody>
        <p className="text-muted small mb-4">
          Es tu bitácora personal — anota lo que quieras, ningún dato es
          obligatorio. Solo lo guardamos y te mostramos tu propia tendencia
          en el tiempo.
        </p>

        <Row>
          <Col xs="6">
            <FormGroup>
              <Label className="small font-weight-bold">Peso (kg)</Label>
              <Input
                type="number"
                step="0.1"
                value={form.pesoKg}
                onChange={handleChange("pesoKg")}
                placeholder="Ej: 78.5"
              />
            </FormGroup>
          </Col>
          <Col xs="6">
            <FormGroup>
              <Label className="small font-weight-bold">Altura (cm)</Label>
              <Input
                type="number"
                value={form.alturaCm}
                onChange={handleChange("alturaCm")}
                placeholder="Ej: 172"
              />
            </FormGroup>
          </Col>
          <Col xs="6">
            <FormGroup>
              <Label className="small font-weight-bold">% grasa corporal</Label>
              <Input
                type="number"
                step="0.1"
                value={form.grasaCorporalPorcentaje}
                onChange={handleChange("grasaCorporalPorcentaje")}
                placeholder="Si lo mediste"
              />
            </FormGroup>
          </Col>
          {CAMPOS_MEDIDAS.map((c) => (
            <Col xs="6" key={c.key}>
              <FormGroup>
                <Label className="small font-weight-bold">{c.label}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form[c.key]}
                  onChange={handleChange(c.key)}
                />
              </FormGroup>
            </Col>
          ))}
        </Row>

        <FormGroup>
          <Label className="small font-weight-bold">Notas (opcional)</Label>
          <Input
            type="textarea"
            rows={2}
            value={form.notas}
            onChange={handleChange("notas")}
            placeholder="Cualquier cosa que quieras recordar de este registro"
          />
        </FormGroup>

        <Button
          block
          color="success"
          disabled={guardando}
          onClick={handleGuardar}
          className="font-weight-bold mt-2"
        >
          {guardando ? "Guardando..." : "Guardar registro"}
        </Button>
      </ModalBody>
    </Modal>
  );
};

const opcionesChartPeso = {
  maintainAspectRatio: false,
  legend: { display: false },
  scales: {
    yAxes: [{ ticks: { beginAtZero: false } }],
  },
};

/**
 * Card completa de la bitácora: botón para agregar, gráfico de peso y
 * tabla de registros. Se basta a sí misma — solo necesita estar dentro
 * del ProgresoClienteProvider (ya está montado globalmente en index.js).
 */
const BitacoraCorporal = () => {
  const { misMedicionesCorporales, eliminarMedicionCorporal } = useProgresoCliente();

  const [mediciones, setMediciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);

  const cargarMediciones = async () => {
    setCargando(true);
    const data = await misMedicionesCorporales();
    setMediciones(data);
    setCargando(false);
  };

  useEffect(() => {
    cargarMediciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEliminar = async (medicion) => {
    const confirmacion = await Swal.fire({
      title: "¿Eliminar este registro?",
      text: formatFecha(medicion.fecha),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#f5365c",
    });
    if (!confirmacion.isConfirmed) return;

    try {
      await eliminarMedicionCorporal(medicion._id);
      cargarMediciones();
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo eliminar el registro",
        "error",
      );
    }
  };

  const medicionesConPeso = mediciones.filter((m) => m.pesoKg != null);
  const chartPeso = {
    labels: medicionesConPeso.map((m) => formatFecha(m.fecha)),
    datasets: [
      {
        label: "Peso (kg)",
        data: medicionesConPeso.map((m) => m.pesoKg),
        borderColor: "#2dce89",
        backgroundColor: "rgba(45,206,137,0.1)",
        fill: true,
        tension: 0.3,
        pointBackgroundColor: "#2dce89",
      },
    ],
  };

  return (
    <>
      <Card className="border-0 shadow-sm mb-5" style={{ borderRadius: 16 }}>
        <CardBody className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="d-flex align-items-center">
              <ScrollText size={20} className="text-info mr-2" />
              <h4 className="mb-0">Mi bitácora</h4>
            </div>
            <Button size="sm" color="success" onClick={() => setModalAbierto(true)}>
              <Plus size={14} /> Agregar registro
            </Button>
          </div>
          <p className="text-muted small mb-4">
            Un registro personal de peso y medidas, si quieres llevarlo. Solo
            mostramos tu propia tendencia — nada acá es un consejo médico ni
            nutricional.
          </p>

          {cargando ? (
            <div className="text-center py-4">
              <Spinner color="info" size="sm" />
            </div>
          ) : mediciones.length === 0 ? (
            <p className="text-muted small mb-0">
              Todavía no tienes registros. Agrega el primero cuando quieras.
            </p>
          ) : (
            <>
              {medicionesConPeso.length >= 2 && (
                <div style={{ height: 220 }} className="mb-4">
                  <Line data={chartPeso} options={opcionesChartPeso} />
                </div>
              )}

              <div style={{ overflowX: "auto" }}>
                <table className="table table-sm">
                  <thead>
                    <tr className="text-muted small">
                      <th>Fecha</th>
                      <th>Peso</th>
                      <th>Cintura</th>
                      <th>% grasa</th>
                      <th>Notas</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...mediciones].reverse().map((m) => (
                      <tr key={m._id}>
                        <td className="small">{formatFecha(m.fecha)}</td>
                        <td className="small">
                          {m.pesoKg != null ? `${m.pesoKg} kg` : "—"}
                        </td>
                        <td className="small">
                          {m.medidas?.cinturaCm != null
                            ? `${m.medidas.cinturaCm} cm`
                            : "—"}
                        </td>
                        <td className="small">
                          {m.grasaCorporalPorcentaje != null
                            ? `${m.grasaCorporalPorcentaje}%`
                            : "—"}
                        </td>
                        <td className="small text-muted">
                          {m.notas || "—"}
                          {m.registradoPorRol === "admin" && (
                            <Badge color="secondary" pill className="ml-2">
                              Control del gimnasio
                            </Badge>
                          )}
                        </td>
                        <td>
                          {m.registradoPorRol === "cliente" && (
                            <Button
                              size="sm"
                              color="link"
                              className="text-danger p-0"
                              onClick={() => handleEliminar(m)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      <RegistrarMedicionModal
        isOpen={modalAbierto}
        toggle={() => setModalAbierto(false)}
        onGuardado={cargarMediciones}
      />
    </>
  );
};

export default BitacoraCorporal;

// src/components/servicios/ModalPromocionServicio.jsx
import React, { useEffect, useState } from "react";
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  Button, FormGroup, Label, Input, CustomInput,
} from "reactstrap";
import { Tag, Info } from "lucide-react";

const formatearCLP = (valor) =>
  Math.round(valor).toLocaleString("es-CL");

const ModalPromocionServicio = ({ isOpen, toggle, servicio, onGuardar }) => {
  const [activo, setActivo] = useState(false);
  const [porcentaje, setPorcentaje] = useState(0);
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Cargar valores actuales del servicio cada vez que se abre
  useEffect(() => {
    if (servicio && isOpen) {
      const d = servicio.descuento || {};
      setActivo(d.activo || false);
      setPorcentaje(d.porcentaje || 0);
      setDescripcion(d.descripcion || "");
      setFechaInicio(d.fechaInicio ? d.fechaInicio.substring(0, 10) : "");
      setFechaFin(d.fechaFin ? d.fechaFin.substring(0, 10) : "");
    }
  }, [servicio, isOpen]);

  const precioBase = Number(servicio?.precio || 0);
  const precioEstimado =
    porcentaje > 0
      ? precioBase - Math.round((precioBase * porcentaje) / 100)
      : precioBase;

  const fechasInvalidas =
    fechaInicio && fechaFin && new Date(fechaInicio) > new Date(fechaFin);

  const handleGuardar = async () => {
    if (fechasInvalidas) return;

    setGuardando(true);
    try {
      await onGuardar({
        activo,
        porcentaje: Number(porcentaje) || 0,
        descripcion: descripcion.trim(),
        fechaInicio: fechaInicio || null,
        fechaFin: fechaFin || null,
      });
      toggle();
    } finally {
      setGuardando(false);
    }
  };

  if (!servicio) return null;

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle} className="border-0 pb-0">
        <div className="d-flex align-items-center" style={{ gap: "8px" }}>
          <Tag size={18} className="text-danger" />
          <span>Promoción — <strong>{servicio.nombre}</strong></span>
        </div>
        <p className="text-muted small mb-0 mt-1 font-weight-normal">
          Precio base: ${formatearCLP(precioBase)}
        </p>
      </ModalHeader>

      <ModalBody>
        <FormGroup className="d-flex align-items-center justify-content-between">
          <Label className="mb-0" style={{ fontWeight: 500 }}>
            Activar descuento
          </Label>
          <CustomInput
            type="switch"
            id="switch-activo-descuento"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
          />
        </FormGroup>

        <FormGroup>
          <Label style={{ fontSize: "0.85rem", fontWeight: 500 }}>
            Porcentaje de descuento
          </Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={porcentaje}
            disabled={!activo}
            onChange={(e) => setPorcentaje(e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label style={{ fontSize: "0.85rem", fontWeight: 500 }}>
            Descripción (opcional)
          </Label>
          <Input
            type="text"
            placeholder="Descuento invierno"
            value={descripcion}
            disabled={!activo}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </FormGroup>

        <div className="d-flex" style={{ gap: "10px" }}>
          <FormGroup className="flex-fill">
            <Label style={{ fontSize: "0.85rem", fontWeight: 500 }}>
              Desde
            </Label>
            <Input
              type="date"
              value={fechaInicio}
              disabled={!activo}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </FormGroup>
          <FormGroup className="flex-fill">
            <Label style={{ fontSize: "0.85rem", fontWeight: 500 }}>
              Hasta
            </Label>
            <Input
              type="date"
              value={fechaFin}
              disabled={!activo}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </FormGroup>
        </div>

        {fechasInvalidas && (
          <small className="text-danger d-block mb-2">
            La fecha de inicio no puede ser posterior a la fecha de fin.
          </small>
        )}

        {activo && porcentaje > 0 && !fechasInvalidas && (
          <div
            className="d-flex align-items-center mt-2"
            style={{ gap: "6px", fontSize: "0.85rem" }}
          >
            <Info size={14} className="text-muted" />
            Precio final estimado:{" "}
            <strong className="text-success">
              ${formatearCLP(precioEstimado)}
            </strong>
          </div>
        )}
      </ModalBody>

      <ModalFooter className="border-0 pt-0">
        <Button color="secondary" outline onClick={toggle}>
          Cancelar
        </Button>
        <Button
          color="primary"
          onClick={handleGuardar}
          disabled={guardando || fechasInvalidas}
        >
          {guardando ? "Guardando..." : "Guardar promoción"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalPromocionServicio;
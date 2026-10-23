import React, { useEffect, useState } from "react";
import { Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { MOTIVOS_CANCELACION_MESA } from "utils/reservasMesa";

const ModalCancelarReservaMesa = ({ isOpen, toggle, reserva, onConfirmar }) => {
  const [motivo, setMotivo] = useState("");
  const [detalle, setDetalle] = useState("");
  const [por, setPor] = useState("cliente");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMotivo("");
      setDetalle("");
      setPor("cliente");
    }
  }, [isOpen]);

  const confirmar = async () => {
    setEnviando(true);
    try {
      await onConfirmar({ motivo, detalle, por });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={() => !enviando && toggle()} centered>
      <ModalHeader toggle={() => !enviando && toggle()}>
        Cancelar reserva {reserva ? `#${reserva.codigo}` : ""}
      </ModalHeader>
      <ModalBody>
        {reserva && (
          <p className="mb-3">
            {reserva.cliente.nombre} · {reserva.hora} · {reserva.personas} pers. · {reserva.sector.nombre}
          </p>
        )}
        <FormGroup>
          <Label>Motivo</Label>
          <Input type="select" value={motivo} onChange={(e) => setMotivo(e.target.value)}>
            <option value="">Elige un motivo</option>
            {MOTIVOS_CANCELACION_MESA.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </Input>
        </FormGroup>
        <FormGroup>
          <Label>¿Quién cancela?</Label>
          <Input type="select" value={por} onChange={(e) => setPor(e.target.value)}>
            <option value="cliente">El cliente</option>
            <option value="local">El local</option>
          </Input>
        </FormGroup>
        <FormGroup>
          <Label>Detalle (opcional)</Label>
          <Input
            type="textarea"
            rows="2"
            maxLength={300}
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
          />
        </FormGroup>
        {reserva?.cliente?.email && (
          <small className="text-muted">Se le avisará por correo a {reserva.cliente.email}.</small>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" outline disabled={enviando} onClick={toggle}>
          Volver
        </Button>
        <Button color="danger" disabled={!motivo || enviando} onClick={confirmar}>
          {enviando ? "Cancelando..." : "Cancelar reserva"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalCancelarReservaMesa;

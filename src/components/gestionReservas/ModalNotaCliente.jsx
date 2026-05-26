import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input } from "reactstrap";

const ModalNotaCliente = ({ isOpen, toggle, cliente, onGuardar }) => {
  const [nota, setNota] = useState("");

  useEffect(() => {
    if (isOpen) {
      setNota(cliente?.notasProfesional || "");
    }
  }, [isOpen, cliente]);

  const handleGuardar = () => {
    onGuardar(cliente._id, nota);
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="md">
      <ModalHeader toggle={toggle}>
        Nota — {cliente?.nombre} {cliente?.apellido}
      </ModalHeader>

      <ModalBody>
        <small className="text-muted d-block mb-2">
          Esta nota es solo visible para el profesional.
        </small>
        <Input
          type="textarea"
          rows="4"
          placeholder="Ej: usar molde C, piel sensible al látex..."
          value={nota}
          onChange={(e) => setNota(e.target.value)}
        />
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Cancelar
        </Button>
        <Button color="primary" onClick={handleGuardar}>
          Guardar nota
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalNotaCliente;
import { useState } from "react";
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  Button, FormGroup, Label, Input, Spinner,
} from "reactstrap";
import Swal from "sweetalert2";
import { useVentaDirecta } from "context/VentaDirectaContext";

const ModalAnularVenta = ({ isOpen, toggle, venta, onAnulada }) => {
  const { anularVenta, loading } = useVentaDirecta();
  const [motivo, setMotivo] = useState("");

  const handleAnular = async () => {
    try {
      await anularVenta(venta._id, motivo);
      Swal.fire({
        icon: "success",
        title: "Venta anulada",
        text: "El stock fue restaurado correctamente.",
        timer: 1500,
        showConfirmButton: false,
      });
      setMotivo("");
      onAnulada?.();
      toggle();
    } catch (error) {
      Swal.fire("Error", error?.response?.data?.message || "No se pudo anular la venta.", "error");
    }
  };

  const handleClose = () => {
    setMotivo("");
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose}>
      <ModalHeader toggle={handleClose}>Anular venta</ModalHeader>
      <ModalBody>
        <p className="text-muted mb-3">
          ¿Seguro que quieres anular esta venta? El stock de los productos será restaurado.
        </p>
        <FormGroup>
          <Label className="form-control-label">Motivo de anulación (opcional)</Label>
          <Input
            type="textarea" rows={3} value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ej: error de registro, cliente devolvió el producto..."
          />
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>Cancelar</Button>
        <Button color="danger" onClick={handleAnular} disabled={loading}>
          {loading ? <Spinner size="sm" /> : "Sí, anular"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalAnularVenta;
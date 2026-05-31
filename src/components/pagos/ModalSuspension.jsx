// components/EmpresaSuspendida/BannerSuspension.jsx
import { Modal, ModalHeader, ModalBody, Button } from "reactstrap";

const BannerSuspension = ({ isOpen }) => {
  return (
    <Modal isOpen={isOpen} centered backdrop="static" keyboard={false}>
      <ModalHeader className="border-0 pb-0">🔒 Cuenta suspendida</ModalHeader>
      <ModalBody className="text-center px-4 pb-4">
        <div className="mb-3" style={{ fontSize: "48px" }}>
          😔
        </div>
        <h5 className="font-weight-bold mb-2">
          Tu acceso está temporalmente suspendido
        </h5>
        <p className="text-muted mb-4">
          No te preocupes, <strong>todos tus datos están seguros</strong>. Para
          reactivar tu cuenta solo realiza tu pago y nos avisas.
        </p>

        <div
          className="rounded p-3 mb-4 text-left"
          style={{ background: "#f8f9fa", fontSize: "14px" }}
        >
          <p className="mb-1">
            <strong>📲 Escríbenos por WhatsApp</strong>
          </p>
          <a
            href="https://wa.me/56975297584?text=Hola, quiero reactivar mi cuenta"
            target="_blank"
            rel="noreferrer"
            className="text-success font-weight-bold"
          >
            +569 75297584
          </a>
        </div>
        <Button
          color="success"
          className="rounded-pill px-5"
          href="https://wa.me/56975297584?text=Hola, quiero reactivar mi cuenta"
          target="_blank"
        >
          Contactar ahora
        </Button>
      </ModalBody>
    </Modal>
  );
};

export default BannerSuspension;

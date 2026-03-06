import React, { useContext } from "react";
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  Button, Badge, Input,
} from "reactstrap";
import { Anchor, Plus, X, Lock, Unlock } from "lucide-react";
import ServiciosContext from "context/ServiciosContext";

/**
 * ModalBloquesAncla
 * Props:
 *  - isOpen: bool
 *  - toggle: fn
 *  - diaNombre: string (ej: "Lunes")
 *  - horasAncla: [{ hora, serviciosPermitidos: [] }]
 *  - nuevaAncla: string (HH:mm)
 *  - onChangeNuevaAncla: fn(valor)
 *  - onAgregarAncla: fn()
 *  - onEliminarAncla: fn(hora)
 *  - onToggleServicio: fn(hora, servicioId)
 */
const ModalBloquesAncla = ({
  isOpen,
  toggle,
  diaNombre,
  horasAncla = [],
  nuevaAncla = "",
  onChangeNuevaAncla,
  onAgregarAncla,
  onEliminarAncla,
  onToggleServicio,
}) => {
  const { servicios } = useContext(ServiciosContext);

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered scrollable>
      <ModalHeader toggle={toggle} className="bg-white border-0 pb-0">
        <div className="d-flex align-items-center" style={{ gap: "8px" }}>
          <Anchor size={18} className="text-primary" />
          <span>Bloques de atención — <strong>{diaNombre}</strong></span>
        </div>
        <p className="text-muted small mb-0 mt-1 font-weight-normal">
          Define los tramos del día y qué servicios se pueden agendar en cada uno.
          Si no seleccionas ningún servicio, el bloque está disponible para todos.
        </p>
      </ModalHeader>

      <ModalBody>
        {/* Lista de bloques */}
        {horasAncla.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <Anchor size={32} className="mb-2 opacity-5" />
            <p className="mb-0">No hay bloques configurados.</p>
            <small>Agrega el primero con el formulario de abajo.</small>
          </div>
        ) : (
          horasAncla.map((ancla) => {
            const tieneRestriccion = ancla.serviciosPermitidos.length > 0;
            return (
              <div
                key={ancla.hora}
                className="mb-3 p-3 rounded"
                style={{ border: "1px solid #dee2e6", background: "#fafbff" }}
              >
                {/* Cabecera del bloque */}
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center" style={{ gap: "8px" }}>
                    <Badge color="primary" style={{ fontSize: "0.9rem", padding: "6px 14px" }}>
                      🕐 {ancla.hora}
                    </Badge>
                    {tieneRestriccion ? (
                      <Badge color="warning" className="d-flex align-items-center" style={{ gap: "4px" }}>
                        <Lock size={10} /> Solo servicios seleccionados
                      </Badge>
                    ) : (
                      <Badge color="success" className="d-flex align-items-center" style={{ gap: "4px" }}>
                        <Unlock size={10} /> Disponible para todos
                      </Badge>
                    )}
                  </div>
                  <X
                    size={16}
                    className="text-danger"
                    style={{ cursor: "pointer" }}
                    onClick={() => onEliminarAncla(ancla.hora)}
                  />
                </div>

                {/* Instrucción */}
                <small className="text-muted d-block mb-2">
                  {tieneRestriccion
                    ? "Solo los servicios en verde pueden agendarse aquí. Haz clic para cambiar."
                    : "Todos los servicios pueden agendarse aquí. Haz clic en uno para restringir este bloque."}
                </small>

                {/* Servicios como pills */}
                <div className="d-flex flex-wrap" style={{ gap: "6px" }}>
                  {servicios.map((s) => {
                    const permitido = ancla.serviciosPermitidos.includes(s._id);
                    return (
                      <span
                        key={s._id}
                        onClick={() => onToggleServicio(ancla.hora, s._id)}
                        style={{
                          cursor: "pointer",
                          fontSize: "0.8rem",
                          padding: "6px 14px",
                          borderRadius: "20px",
                          border: permitido ? "2px solid #2dce89" : "1px solid #dee2e6",
                          background: permitido ? "#e6faf3" : "#f8f9fa",
                          color: permitido ? "#1a7a50" : "#6c757d",
                          fontWeight: permitido ? "600" : "400",
                          transition: "all 0.15s ease",
                          userSelect: "none",
                        }}
                      >
                        {permitido ? "✓ " : ""}{s.nombre}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

        {/* Agregar nuevo bloque */}
        <div
          className="d-flex align-items-center mt-3 pt-3"
          style={{ gap: "8px", borderTop: "1px dashed #c5cff5" }}
        >
          <Input
            type="time"
            style={{ maxWidth: "140px" }}
            value={nuevaAncla}
            onChange={(e) => onChangeNuevaAncla(e.target.value)}
          />
          <Button color="primary" outline onClick={onAgregarAncla}>
            <Plus size={14} className="mr-1" />
            Agregar bloque
          </Button>
        </div>
      </ModalBody>

      <ModalFooter className="border-0 pt-0">
        <Button color="primary" onClick={toggle}>
          Listo
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalBloquesAncla;

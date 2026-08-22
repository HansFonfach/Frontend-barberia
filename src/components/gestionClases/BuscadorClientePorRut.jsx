import React, { useEffect, useState } from "react";
import { FormGroup, Input, Button, Spinner } from "reactstrap";
import { useRutValidator } from "hooks/useRutValidador";
import { useUsuario } from "context/usuariosContext";

/**
 * Busca un cliente escribiendo su RUT (mismo patrón que "Agendar cliente"
 * en barbería: hooks/useRutValidador + getUserByRut), en vez de hacerlo
 * elegir de una lista larga de clientes.
 *
 * Props:
 * - clienteSeleccionado: usuario ya elegido (o null)
 * - onSeleccionar(usuario): se llama cuando la búsqueda encuentra un cliente
 * - onLimpiarSeleccion(): se llama al tocar "Cambiar" para volver a buscar
 * - soloClientes: si true (default), rechaza RUTs que correspondan a
 *   profesionales/admin en vez de clientes
 */
const BuscadorClientePorRut = ({
  clienteSeleccionado,
  onSeleccionar,
  onLimpiarSeleccion,
  soloClientes = true,
}) => {
  const { rut, handleRutChange, error: errorRut, clearRut, cleanRut } =
    useRutValidator("");
  const { getUserByRut } = useUsuario();

  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState("");

  useEffect(() => {
    if (!cleanRut || cleanRut.length < 3) {
      setErrorBusqueda("");
      setBuscando(false);
      return;
    }

    let isMounted = true;
    let timeoutId;

    const buscar = async () => {
      setBuscando(true);
      setErrorBusqueda("");
      try {
        const usuario = await getUserByRut(cleanRut);
        if (!isMounted) return;

        if (usuario && usuario._id) {
          if (soloClientes && usuario.rol && usuario.rol !== "cliente") {
            setErrorBusqueda(
              "Ese RUT corresponde a un profesional/admin, no a un cliente",
            );
            return;
          }
          onSeleccionar(usuario);
        } else {
          setErrorBusqueda("No se encontró ningún cliente con ese RUT");
        }
      } catch (err) {
        if (!isMounted) return;
        const esNoEncontrado =
          err?.response?.status === 404 ||
          /no encontrado|not found/i.test(err?.message || "");
        setErrorBusqueda(
          esNoEncontrado
            ? "No se encontró ningún cliente con ese RUT"
            : err.message || "Error al buscar el cliente",
        );
      } finally {
        if (isMounted) setBuscando(false);
      }
    };

    timeoutId = setTimeout(buscar, 600);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleanRut]);

  const handleLimpiar = () => {
    clearRut();
    setErrorBusqueda("");
    onLimpiarSeleccion && onLimpiarSeleccion();
  };

  if (clienteSeleccionado) {
    return (
      <FormGroup>
        <label>Cliente</label>
        <div
          className="d-flex align-items-center justify-content-between p-2 rounded"
          style={{ border: "1px solid #2dce89", background: "#f0fdf6" }}
        >
          <div>
            <strong>
              {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}
            </strong>
            <div className="text-muted small">
              {[
                clienteSeleccionado.rut ? `RUT ${clienteSeleccionado.rut}` : null,
                clienteSeleccionado.telefono || clienteSeleccionado.email,
              ]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
          <Button size="sm" color="link" className="text-muted" onClick={handleLimpiar}>
            Cambiar
          </Button>
        </div>
      </FormGroup>
    );
  }

  return (
    <FormGroup>
      <label>Buscar cliente por RUT</label>
      <div className="position-relative">
        <Input
          type="text"
          value={rut}
          onChange={handleRutChange}
          placeholder="Ej: 12.345.678-9"
          disabled={buscando}
          autoFocus
        />
        {buscando && (
          <div
            className="position-absolute"
            style={{ right: 12, top: "50%", transform: "translateY(-50%)" }}
          >
            <Spinner size="sm" color="primary" />
          </div>
        )}
      </div>
      {errorRut && rut && (
        <small className="text-warning d-block mt-1">{errorRut}</small>
      )}
      {errorBusqueda && !errorRut && (
        <small className="text-danger d-block mt-1">{errorBusqueda}</small>
      )}
      {!rut && (
        <small className="text-muted d-block mt-1">
          Escribe el RUT y el cliente aparece automáticamente si está registrado.
        </small>
      )}
    </FormGroup>
  );
};

export default BuscadorClientePorRut;

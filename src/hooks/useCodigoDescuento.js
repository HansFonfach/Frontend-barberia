// src/hooks/useCodigoDescuento.js
//
// Manejo del campo "Código promocional" al reservar (cliente, invitado y
// profesional). Valida el código contra el backend para mostrar el precio con
// descuento; la reserva igual lo vuelve a validar al crearse, así que lo que
// se ve acá es informativo y nunca es la fuente de verdad.
import { useState, useEffect, useCallback, useRef } from "react";
import { validarCodigoDescuentoRequest } from "api/codigosDescuento";

export const useCodigoDescuento = ({
  slug,
  servicio,
  barbero,
  fecha,
  hora,
  clienteId,
}) => {
  const [codigo, setCodigoTexto] = useState("");
  const [aplicado, setAplicado] = useState(null);
  const [validando, setValidando] = useState(false);
  const [error, setError] = useState("");

  const aplicadoRef = useRef(null);
  aplicadoRef.current = aplicado;

  const validar = useCallback(
    async (texto) => {
      const limpio = String(texto || "").trim();
      if (!limpio) {
        setAplicado(null);
        setError("");
        return;
      }
      if (!slug || !servicio) {
        setAplicado(null);
        setError("Primero elige un servicio");
        return;
      }

      setValidando(true);
      setError("");
      try {
        const { data } = await validarCodigoDescuentoRequest(slug, {
          codigo: limpio,
          servicioId: servicio,
          barberoId: barbero || undefined,
          fecha: fecha || undefined,
          hora: hora || undefined,
          clienteId: clienteId || undefined,
        });

        if (data?.valido) {
          setAplicado(data);
          setCodigoTexto(data.codigo);
        } else {
          setAplicado(null);
          setError(data?.message || "El código no es válido");
        }
      } catch (err) {
        setAplicado(null);
        setError(err.response?.data?.message || "No se pudo validar el código");
      } finally {
        setValidando(false);
      }
    },
    [slug, servicio, barbero, fecha, hora, clienteId],
  );

  // Si ya había un código aplicado y el cliente cambia servicio, profesional,
  // día u hora, se vuelve a calcular (puede dejar de aplicar o cambiar el precio).
  useEffect(() => {
    if (aplicadoRef.current?.codigo) {
      validar(aplicadoRef.current.codigo);
    }
  }, [validar]);

  // Escribir en el campo invalida lo aplicado antes
  const setCodigo = useCallback((texto) => {
    setCodigoTexto(String(texto || "").toUpperCase().replace(/\s+/g, ""));
    setAplicado(null);
    setError("");
  }, []);

  const quitar = useCallback(() => {
    setCodigoTexto("");
    setAplicado(null);
    setError("");
  }, []);

  const aplicar = useCallback(() => validar(codigo), [validar, codigo]);

  return {
    codigo,
    setCodigo,
    aplicado,
    validando,
    error,
    aplicar,
    quitar,
    // Lo que se manda al crear la reserva: aunque el cliente no haya apretado
    // "Aplicar", si dejó algo escrito el backend lo valida y, si no sirve,
    // avisa el motivo en vez de reservar a precio completo sin que se note.
    codigoParaEnviar: codigo.trim(),
  };
};

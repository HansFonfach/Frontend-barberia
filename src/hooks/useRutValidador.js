// src/hooks/useRutValidador.js
import { useState } from "react";
import rutUtils from "rut.js";

export const useRutValidator = (initialValue = "") => {
  const [rut, setRut] = useState(initialValue);
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [cleanRut, setCleanRut] = useState("");

  const handleRutChange = (e) => {
    const value = e.target.value;
    
    // Formatear el RUT con rut.js (agrega puntos y guión automáticamente)
    const formatted = rutUtils.format(value);
    setRut(formatted);

    // Resetear estados
    setError("");
    setIsValid(false);
    setCleanRut("");

    if (value === "") {
      return;
    }

    // Validar RUT chileno
    if (rutUtils.validate(formatted)) {
      setError("");
      setIsValid(true);
      // Extraer RUT limpio: quitar puntos y guión, convertir a mayúsculas
      const clean = formatted.replace(/[\.\-]/g, '').toUpperCase();
      setCleanRut(clean);
    } else {
      // Permitir pasaporte (solo letras y números, mínimo 3 caracteres)
      const pasaporteRegex = /^[A-Za-z0-9]{3,}$/;
      if (pasaporteRegex.test(value)) {
        setError("");
        setIsValid(true);
        // Pasaporte en mayúsculas
        setCleanRut(value.toUpperCase());
      } else {
        setError("RUT o pasaporte inválido");
        setIsValid(false);
        setCleanRut("");
      }
    }
  };

  const clearRut = () => {
    setRut("");
    setError("");
    setIsValid(false);
    setCleanRut("");
  };

  return {
    rut,
    setRut,
    error,
    handleRutChange,
    isValid,
    clearRut,
    cleanRut
  };
};
import { useState } from "react";
import rutUtils from "rut.js";

export const useRutValidator = (initialValue = "") => {
  const [rut, setRut] = useState(initialValue);
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);

  const handleRutChange = (e) => {
    const value = e.target.value;
    const formatted = rutUtils.format(value);
    setRut(formatted);

    if (value === "") {
      setError("");
      setIsValid(false);
      return;
    }

    // Validar RUT chileno
    if (rutUtils.validate(formatted)) {
      setError("");
      setIsValid(true);
    } else {
      // Permitir pasaporte (solo letras y números, mínimo 3 caracteres)
      const pasaporteRegex = /^[A-Za-z0-9]{3,}$/;
      if (pasaporteRegex.test(value)) {
        setError("");
        setIsValid(true);
      } else {
        setError("RUT o pasaporte inválido");
        setIsValid(false);
      }
    }
  };

  const clearRut = () => {
    setRut("");
    setError("");
    setIsValid(false);
  };

  return {
    rut,
    setRut,
    error,
    handleRutChange,
    isValid,
    clearRut
  };
};
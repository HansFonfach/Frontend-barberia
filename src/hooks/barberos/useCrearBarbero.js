import { useUsuario } from "context/usuariosContext";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useRutValidator } from "hooks/useRutValidador";

const initialForm = {
  rut: "",
  nombre: "",
  apellido: "",
  telefono: "",
  email: "",
  descripcion: "",
  password: "",
  confirmaPassword: "",
};

export const useCrearBarbero = () => {
  const [modalCrear, setModalCrear] = useState(false);
  const [formCrear, setFormCrear] = useState(initialForm);
  const { crearBarbero } = useUsuario();

  const {
    rut,
    error: rutError,
    handleRutChange,
    isValid: rutValido,
    clearRut,
  } = useRutValidator();

  const toggleCrear = () => {
    setModalCrear((prev) => {
      if (prev) {
        setFormCrear(initialForm);
        clearRut();
      }
      return !prev;
    });
  };

  const handleCrearChange = (e) => {
    const { name, value } = e.target;
    setFormCrear((prev) => ({ ...prev, [name]: value }));
  };

  // Guardar RUT FORMATEADO
  useEffect(() => {
    if (rut) {
      setFormCrear((prev) => ({ ...prev, rut }));
    }
  }, [rut]);

  const handleCrearBarbero = async () => {
    const {
      rut,
      nombre,
      apellido,
      telefono,
      email,
      password,
      confirmaPassword,
    } = formCrear;

    if (!rut || !nombre || !apellido || !telefono || !email || !password)
      return Swal.fire("Error", "Completa todos los campos", "error");

    if (!rutValido)
      return Swal.fire("Error", "RUT o pasaporte inválido", "error");

    if (password !== confirmaPassword)
      return Swal.fire("Error", "Las contraseñas no coinciden", "error");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return Swal.fire("Error", "Email inválido", "error");

    try {
      await crearBarbero(formCrear);

      Swal.fire("Listo", "Barbero creado", "success");

      setFormCrear(initialForm);
      clearRut();
      setModalCrear(false);
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Error al crear barbero",
        "error"
      );
    }
  };

  return {
    modalCrear,
    formCrear,
    toggleCrear,
    handleCrearChange,
    handleCrearBarbero,
    rut,
    rutError,
    handleRutChange,
  };
};

import { useUsuario } from "context/usuariosContext";
import { useState } from "react";
import Swal from "sweetalert2";
import { useRutValidator } from "hooks/useRutValidador";

// Mismo patrón que useCrearBarbero (hooks/barberos/useCrearBarbero.js), pero
// sin foto/perfil profesional/especialidades: un cliente no los usa.
const initialForm = {
  rut: "",
  nombre: "",
  apellido: "",
  telefono: "",
  email: "",
  password: "",
  confirmaPassword: "",
};

export const useCrearCliente = () => {
  const [modalCrear, setModalCrear] = useState(false);
  const [formCrear, setFormCrear] = useState(initialForm);
  const { crearCliente } = useUsuario();

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

  const handleCrearCliente = async () => {
    const formConRut = { ...formCrear, rut };
    const { nombre, apellido, telefono, email, password, confirmaPassword } =
      formConRut;

    if (!rut || !nombre || !apellido || !telefono || !email || !password)
      return Swal.fire("Error", "Completa todos los campos", "error");
    if (!rutValido)
      return Swal.fire("Error", "RUT o pasaporte inválido", "error");
    if (password !== confirmaPassword)
      return Swal.fire("Error", "Las contraseñas no coinciden", "error");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return Swal.fire("Error", "Email inválido", "error");

    try {
      await crearCliente(formConRut);

      Swal.fire("Listo", "Cliente creado", "success");
      setFormCrear(initialForm);
      clearRut();
      setModalCrear(false);
      return true;
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Error al crear",
        "error",
      );
      return false;
    }
  };

  return {
    modalCrear,
    formCrear,
    toggleCrear,
    handleCrearChange,
    handleCrearCliente,
    rut,
    rutError,
    handleRutChange,
  };
};

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
  aniosExperiencia: "",
  especialidades: [],
  password: "",
  confirmaPassword: "",
};

export const useCrearBarbero = () => {
  const [modalCrear, setModalCrear] = useState(false);
  const [formCrear, setFormCrear] = useState(initialForm);
  const { crearBarbero } = useUsuario();
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);

  const { rut, error: rutError, handleRutChange, isValid: rutValido, clearRut } = useRutValidator();

  const toggleCrear = () => {
    setModalCrear((prev) => {
      if (prev) {
        setFormCrear(initialForm);
        setFotoFile(null);
        setFotoPreview(null);
        clearRut();
      }
      return !prev;
    });
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const handleCrearChange = (e) => {
    const { name, value } = e.target;
    setFormCrear((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (rut) setFormCrear((prev) => ({ ...prev, rut }));
  }, [rut]);

  const handleCrearBarbero = async () => {
    const { rut, nombre, apellido, telefono, email, password, confirmaPassword } = formCrear;

    if (!rut || !nombre || !apellido || !telefono || !email || !password)
      return Swal.fire("Error", "Completa todos los campos", "error");
    if (!rutValido)
      return Swal.fire("Error", "RUT o pasaporte inválido", "error");
    if (password !== confirmaPassword)
      return Swal.fire("Error", "Las contraseñas no coinciden", "error");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return Swal.fire("Error", "Email inválido", "error");

    try {
      const formData = new FormData();
      Object.entries(formCrear).forEach(([key, value]) => {
        if (key === "especialidades") {
          value.forEach((esp) => formData.append("especialidades[]", esp));
        } else {
          formData.append(key, value);
        }
      });
      if (fotoFile) formData.append("fotoPerfil", fotoFile);

      await crearBarbero(formData);

      Swal.fire("Listo", "Profesional creado", "success");
      setFormCrear(initialForm);
      setFotoFile(null);
      setFotoPreview(null);
      clearRut();
      setModalCrear(false);
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Error al crear", "error");
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
    fotoPreview,
    handleFotoChange,
  };
};
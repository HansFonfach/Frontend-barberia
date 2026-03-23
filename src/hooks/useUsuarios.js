import { useState, useEffect, useMemo } from "react";
import { useUsuario } from "context/usuariosContext"; // usa el context corregido
import { useAuth } from "context/AuthContext";
import Swal from "sweetalert2";

export const useUsuarios = (rolFiltro) => {
  const {
    usuarios: usuariosContext,
    cargando,
    getAllUsers, // <-- ahora sí viene del context
    updateUser,
    subscribeUser,
    unsubscribeUser,
    cambiarEstadoUsuario,
  } = useUsuario();

  const { user, isAuthenticated } = useAuth();

  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState(false); // para editar
  const [modalGestion, setModalGestion] = useState(false); // para gestionar acciones
  const [usuarioEdit, setUsuarioEdit] = useState(null);

  // Actualiza usuariosFiltrados cuando cambie el contexto de usuarios
  useEffect(() => {
    const filtered = (usuariosContext || []).filter((u) => {
      if (rolFiltro === "cliente") {
        return u.rol === "cliente" || u.rol === "invitado"; // ← incluir invitados
      }
      return u.rol === rolFiltro;
    });
    setUsuariosFiltrados(filtered);
  }, [usuariosContext, rolFiltro]);

  // Cargar usuarios al montar (si autenticado)
  useEffect(() => {
    if (isAuthenticated && user) {
      getAllUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]); // ✅ sin getAllUsers

  // Buscar (memoizado)
  const usuariosBuscados = useMemo(() => {
    return usuariosFiltrados.filter(
      (u) =>
        u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.apellido?.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.rut?.includes(busqueda) ||
        u.email?.toLowerCase().includes(busqueda.toLowerCase()),
    );
  }, [busqueda, usuariosFiltrados]);

  const toggleModal = () => setModal(!modal);
  const toggleModalGestion = () => setModalGestion(!modalGestion);

  const handleEditar = (usuario) => {
    setUsuarioEdit(usuario);
    setModal(true);
  };

  const handleGuardar = async (fotoFile) => {
    if (!usuarioEdit?.nombre || !usuarioEdit?.apellido || !usuarioEdit?.email) {
      throw new Error("Completa todos los campos requeridos");
    }

    const formData = new FormData();
    formData.append("nombre", usuarioEdit.nombre);
    formData.append("apellido", usuarioEdit.apellido || "");
    formData.append("email", usuarioEdit.email);
    formData.append("telefono", usuarioEdit.telefono || "");
    formData.append("descripcion", usuarioEdit.descripcion || "");
    formData.append(
      "aniosExperiencia",
      usuarioEdit.perfilProfesional?.aniosExperiencia || 0,
    );
    formData.append(
      "especialidades",
      JSON.stringify(usuarioEdit.perfilProfesional?.especialidades || []),
    );

    if (fotoFile) {
      formData.append("fotoPerfil", fotoFile);
    }

    await updateUser(usuarioEdit._id, formData);
    setModal(false);
    await getAllUsers();
  };

  const handleCambiarEstado = async (usuarioId, estado) => {
    try {
      if (!usuarioId) {
        throw new Error("No se ha encontrado al usuario");
      }

      await cambiarEstadoUsuario(usuarioId, estado);

      // siempre refrescamos
      await getAllUsers();
    } catch (error) {
      console.error(error);
      Swal.fire(
        "Error",
        "No se pudo actualizar el estado del usuario",
        "error",
      );
    }
  };

  const handleSuscribir = async (usuarioId, accion) => {
    const usuario = usuariosFiltrados.find((u) => u._id === usuarioId);
    if (!usuario) return null;

    try {
      let resultado = null;

      if (accion === "suscribir") {
        // subscribeUser arroja error si ya tiene suscripción (backend)
        resultado = await subscribeUser(usuarioId);
      } else if (accion === "cancelar") {
        await unsubscribeUser(usuarioId);
        resultado = null;
      }

      // recarga completa desde backend para evitar inconsistencias
      await getAllUsers();

      return resultado;
    } catch (error) {
      // devolvemos el error para que el caller lo muestre con Swal (o lo manejamos aquí)
      throw error;
    }
  };

  return {
    usuarios: usuariosBuscados,
    busqueda,
    modal,
    modalGestion,
    usuarioEdit,
    cargando,

    // setters
    setBusqueda,
    setUsuarioEdit,
    setModal,

    // acciones
    handleEditar,
    handleGuardar,
    handleSuscribir,
    handleCambiarEstado,
    toggleModal,
    toggleModalGestion,
    getAllUsers, // <-- exporto esto para que el componente lo llame
  };
};

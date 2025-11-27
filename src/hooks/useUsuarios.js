import { useState, useEffect, useMemo } from 'react';
import { useUsuario } from 'context/usuariosContext';
import { useAuth } from 'context/AuthContext';

export const useUsuarios = (rolFiltro) => {
  const { usuarios, cargando, getAllUsers, updateUser, subscribeUser, unsubscribeUser } = useUsuario();
  const { user, isAuthenticated } = useAuth();
  
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(false);
  const [usuarioEdit, setUsuarioEdit] = useState(null);

  // Filtrar por rol
  useEffect(() => {
    const filtered = usuarios.filter(u => u.rol === rolFiltro);
    setUsuariosFiltrados(filtered);
  }, [usuarios, rolFiltro]);

  // Cargar usuarios si es necesario
  useEffect(() => {
    if (isAuthenticated && user && usuarios.length === 0 && !cargando) {
      getAllUsers();
    }
  }, [isAuthenticated, user, usuarios.length, cargando, getAllUsers]);

  // Buscar
  const usuariosBuscados = useMemo(() => {
    return usuariosFiltrados.filter(u =>
      u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.apellido?.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.rut?.includes(busqueda) ||
      u.email?.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [busqueda, usuariosFiltrados]);

  const toggleModal = () => setModal(!modal);

  const handleEditar = (usuario) => {
    setUsuarioEdit(usuario);
    setModal(true);
  };

  const handleGuardar = async () => {
    if (!usuarioEdit?.nombre || !usuarioEdit?.apellido || !usuarioEdit?.email) {
      throw new Error('Completa todos los campos requeridos');
    }
    await updateUser(usuarioEdit._id, usuarioEdit);
    setModal(false);
  };

  const handleSuscribir = async (usuarioId) => {
    const usuario = usuariosFiltrados.find(u => u._id === usuarioId);
    if (!usuario) return;

    try {
      let resultado;
      if (!usuario.suscrito) {
        resultado = await subscribeUser(usuarioId);
      } else {
        resultado = await unsubscribeUser(usuarioId);
      }
      
      // 🔥 ACTUALIZAR ESTADO LOCAL después de la acción
      setUsuariosFiltrados(prev => 
        prev.map(u => 
          u._id === usuarioId 
            ? { ...u, suscrito: !usuario.suscrito } 
            : u
        )
      );
      
      return { suscrito: !usuario.suscrito };
    } catch (error) {
      throw new Error(error.message || 'No se pudo cambiar la suscripción');
    }
  };

  const handleTransformarRol = async (usuarioId, nuevoRol) => {
    await updateUser(usuarioId, { rol: nuevoRol });
    
    // 🔥 ACTUALIZAR ESTADO LOCAL - remover de la lista actual
    setUsuariosFiltrados(prev => prev.filter(u => u._id !== usuarioId));
  };

  return {
    // Estado
    usuarios: usuariosBuscados,
    busqueda,
    modal,
    usuarioEdit,
    cargando,
    
    // Setters
    setBusqueda,
    setUsuarioEdit,
    setModal,
    
    // Acciones
    handleEditar,
    handleGuardar,
    handleSuscribir,
    handleTransformarRol,
    toggleModal,
  };
};
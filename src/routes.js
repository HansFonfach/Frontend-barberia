// src/routes/routes.js

import Principal from "views/pages/Principal";
import ReservarHora from "views/pages/ReservarHora";
import Suscripcion from "views/pages/Suscripcion";
import Administrar from "views/pages/AdministrarReservas";
import Perfil from "views/pages/Perfil";
import AdminDashboard from "views/admin/pages/PrincipalBarbero";
import Login from "views/pages/Login";
import Register from "views/pages/Register";
import ReservarHoraBarbero from "views/admin/pages/ReservarHoraBarbero";
import CrearBarberoCompleto from "views/admin/pages/GestionBarberos";
import WizardBarberoSemana from "views/admin/pages/WizardBarberos";
import GestionServicios from "views/admin/pages/GestionServicios";
import GestionHorariosBarbero from "views/admin/pages/GestionHorarios";
import GestionClientes from "views/admin/pages/GestionClientes";
import ReservasDiarias from "views/admin/pages/ReservasDiarias";
import ForgotPassword from "views/publico/ForgotPassword";
import Estadisticas from "views/admin/pages/Estadisticas";
import BarberosPage from "views/pages/PresentarBarberos";
import CentroAyuda from "views/pages/CentroAyuda";
import Politicas from "views/pages/Politicas";
import CambiarContrasena from "views/pages/CambiarContraseña";
import ReiniciarContraseña from "views/publico/ReiniciarContraseña";
import PresentarServicios from "views/pages/PresentarServicios";
import Contacto from "views/pages/Contacto";
import SuscripcionResultado from "views/pages/SuscripcionResultado";
import CatalogoCanjes from "views/pages/CatalogoCanjes";
import GestionCanjes from "views/admin/pages/GestionCanjes";
import AsignarServiciosBarberos from "views/admin/pages/AsignarServiciosBarberos";
import Landing from "views/pages/Landing";
import ReservarHoraInvitado from "views/invitados/pages/ReservaInvitado";
import CancelarInvitado from "views/invitados/pages/CancelarInvitado";
import VerificarCuenta from "views/publico/VerificarCuenta";
import ConfiguracionEmpresa from "views/admin/ConfiguracionEmpresa";
import GestionVacaciones from "views/admin/pages/GestionVacaciones";
import RegistrarNegocio from "views/publico/RegistrarNegocio";
import ConfirmacionResultado from "views/publico/ConfirmacionResultado";
import GestionProductos from "views/admin/pages/GestionProductos";
import EstadisticasProductos from "views/admin/pages/EstadisticasProductos";
import HistorialIngresos from "views/admin/pages/HistorialIngresos";
import VentasDirectas from "views/admin/pages/VentasDirectas";
import GestionSuscripciones from "views/admin/pages/GestionSuscripciones";
import GestionCategorias from "views/admin/pages/GestionCategorias";

/* =========================
   🔓 RUTAS PÚBLICAS
========================= */
export const publicRoutes = [
  { path: "/login", component: <Login />, layout: "/auth", invisible: true },
  {
    path: "/register",
    component: <Register />,
    layout: "/auth",
    invisible: true,
  },
  {
    path: "/recuperar-contrasena",
    component: <ForgotPassword />,
    layout: "/auth",
    invisible: true,
  },
  {
    path: "/reiniciar-contrasena/:token",
    component: <ReiniciarContraseña />,
    layout: "/auth",
    invisible: true,
  },
  { path: "/inicio", component: <Landing />, invisible: true },
  { path: "/reservar", component: <ReservarHoraInvitado />, invisible: true },
  {
    path: "/cancelar-reserva-invitado",
    component: <CancelarInvitado />,
    invisible: true,
  },
  {
    path: "/verificar-cuenta",
    component: <VerificarCuenta />,
    invisible: true,
  },
  {
    path: "/registro-negocio",
    component: <RegistrarNegocio />,
    invisible: true,
  },
  {
    path: "/confirmar-reserva",
    component: <ConfirmacionResultado />,
    invisible: true,
  },
];

/* =========================
   👤 CLIENTE
========================= */
export const clienteRoutes = [
  {
    path: "/index",
    name: "Inicio",
    icon: "ni ni-shop text-primary",
    component: <Principal />,
    layout: "/admin",
  },
  {
    path: "/reservar-hora",
    name: "Reservar hora",
    icon: "ni ni-calendar-grid-58 text-success",
    component: <ReservarHora />,
    layout: "/admin",
  },
  {
    path: "/administrar-reservas",
    name: "Mis reservas",
    icon: "ni ni-folder-17 text-info",
    component: <Administrar />,
    layout: "/admin",
  },
  {
    path: "/suscripcion",
    name: "Suscripción",
    icon: "ni ni-credit-card text-warning",
    component: <Suscripcion />,
    layout: "/admin",
    excludeSlugs: ["lumicabeauty"],
  },
  {
    path: "/profesionales",
    name: "Profesionales",
    icon: "ni ni-single-02 text-primary",
    component: <BarberosPage />,
    layout: "/admin",
  },
  {
    path: "/servicios",
    name: "Servicios",
    icon: "fas fa-cut text-danger",
    component: <PresentarServicios />,
    layout: "/admin",
  },

  {
    path: "/catalogo-canjes",
    name: "Canjear puntos",
    icon: "ni ni-trophy text-yellow",
    component: <CatalogoCanjes />,
    layout: "/admin",
  },
  {
    path: "/centro-ayuda",
    name: "Centro de ayuda",
    icon: "ni ni-support-16 text-purple",
    component: <CentroAyuda />,
    layout: "/admin",
  },
  {
    path: "/politicas",
    name: "Políticas",
    icon: "ni ni-book-bookmark text-info",
    component: <Politicas />,
    layout: "/admin",
  },
  {
    path: "/contacto",
    name: "Contacto",
    icon: "ni ni-email-83 text-info",
    component: <Contacto />,
    layout: "/admin",
  },

  // ocultas
  { path: "/perfil", component: <Perfil />, layout: "/admin", invisible: true },
  {
    path: "/cambiar-contrasena",
    component: <CambiarContrasena />,
    layout: "/admin",
    invisible: true,
  },
  {
    path: "/suscripcion/resultado",
    component: <SuscripcionResultado />,
    layout: "/admin",
    invisible: true,
  },
];

/* =========================
   ✂️ BARBERO / ADMIN
========================= */
export const barberoRoutes = [
  /* ── Principal ── */
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "ni ni-tv-2 text-primary",
    component: <AdminDashboard />,
    layout: "/admin",
    section: "principal",
  },

  /* ── Reservas ── */
  {
    path: "/reservar-hora-cliente",
    name: "Agendar cliente",
    icon: "ni ni-calendar-grid-58 text-success",
    component: <ReservarHoraBarbero />,
    layout: "/admin",
    section: "reservas",
  },
  {
    path: "/reservas",
    name: "Reservas del día",
    icon: "fas fa-calendar-day text-success",
    component: <ReservasDiarias />,
    layout: "/admin",
    section: "reservas",
  },

  /* ── Gestión ── */
  {
    path: "/gestion-clientes",
    name: "Clientes",
    icon: "fas fa-users text-warning",
    component: <GestionClientes />,
    layout: "/admin",
    section: "gestion",
  },
  {
    path: "/gestion-profesionales",
    name: "Profesionales",
    icon: "fas fa-user-tie text-primary",
    component: <CrearBarberoCompleto />,
    layout: "/admin",
    section: "gestion",
  },

  {
    path: "/suscripciones",
    name: "Suscripciones",
    icon: "ni ni-credit-card text-warning",
    component: <GestionSuscripciones />,
    layout: "/admin",
    excludeSlugs: ["lumicabeauty", "DerikBarberVip", "danails-studio"],
    section: "gestion",
  },

  {
    path: "/gestion-canjes",
    name: "Canjes",
    icon: "ni ni-shop text-warning",
    component: <GestionCanjes />,
    layout: "/admin",
    section: "gestion",
  },
  {
    path: "/gestion-categorias",
    name: "Categorias",
    icon: "ni ni-shop text-yellow",
    component: <GestionCategorias />,
    layout: "/admin",
    section: "gestion",
  },
  {
    // submenu: Servicios
    path: "/servicios-menu",
    name: "Servicios",
    icon: "fas fa-scissors text-danger",
    layout: "/admin",
    section: "gestion",
    children: [
      {
        path: "/gestion-servicios",
        name: "Catálogo",
        icon: "fas fa-list text-danger",
        component: <GestionServicios />,
        layout: "/admin",
      },
      {
        path: "/asignar-servicios",
        name: "Asignar servicios",
        icon: "ni ni-settings text-info",
        component: <AsignarServiciosBarberos />,
        layout: "/admin",
      },
    ],
  },
  {
    // submenu: Horarios
    path: "/horarios-menu",
    name: "Horarios",
    icon: "fas fa-clock text-danger",
    layout: "/admin",
    section: "gestion",
    children: [
      {
        path: "/asignar-horas",
        name: "Asignar horarios",
        icon: "fas fa-user-clock text-primary",
        component: <WizardBarberoSemana />,
        layout: "/admin",
      },
      {
        path: "/gestion-horarios",
        name: "Administrar horarios",
        icon: "fas fa-clock text-danger",
        component: <GestionHorariosBarbero />,
        layout: "/admin",
      },
      {
        path: "/gestion-vacaciones",
        name: "Vacaciones",
        icon: "fas fa-umbrella-beach text-success",
        component: <GestionVacaciones />,
        layout: "/admin",
      },
    ],
  },

  {
    // submenu: Productos
    path: "/productos-menu",
    name: "Productos",
    icon: "ni ni-box-2 text-primary",
    layout: "/admin",
    section: "gestion",
    children: [
      {
        path: "/gestion-productos",
        name: "Catálogo",
        icon: "ni ni-bullet-list-67 text-primary",
        component: <GestionProductos />,
        layout: "/admin",
      },
      {
        path: "/ventas-directas",
        name: "Ventas directas",
        icon: "ni ni-bag-17 text-success",
        component: <VentasDirectas />,
        layout: "/admin",
      },
      {
        path: "/estadisticas-productos",
        name: "Estadísticas",
        icon: "ni ni-chart-bar-32 text-primary",
        component: <EstadisticasProductos />,
        layout: "/admin",
      },
    ],
  },

  /* ── Otros ── */
  {
    // submenu: Empresa
    path: "/empresa-menu",
    name: "Empresa",
    icon: "ni ni-building text-purple",
    layout: "/admin",
    section: "otros",
    soloAdmin: true,
    children: [
      {
        path: "/configuracion-empresa",
        name: "Configuración",
        icon: "ni ni-settings text-purple",
        component: <ConfiguracionEmpresa />,
        layout: "/admin",
      },
      {
        path: "/estadisticas",
        name: "Estadísticas",
        icon: "fas fa-chart-line text-info",
        component: <Estadisticas />,
        layout: "/admin",
      },
      {
        path: "/HistorialIngresos",
        name: "Historial Ingresos",
        icon: "fas fa-chart-line text-success",
        component: <HistorialIngresos />,
        layout: "/admin",
      },
    ],
  },
];

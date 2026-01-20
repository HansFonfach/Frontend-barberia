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
import ForgotPassword from "views/pages/ForgotPassword";
import Estadisticas from "views/admin/pages/Estadisticas";
import BarberosPage from "views/pages/PresentarBarberos";
import CentroAyuda from "views/pages/CentroAyuda";
import Politicas from "views/pages/Politicas";
import CambiarContrasena from "views/pages/CambiarContraseña";
import ReiniciarContraseña from "views/pages/ReiniciarContraseña";
import PresentarServicios from "views/pages/PresentarServicios";
import Contacto from "views/pages/Contacto";
import SuscripcionResultado from "views/pages/SuscripcionResultado";
import CatalogoCanjes from "views/pages/CatalogoCanjes";
import GestionCanjes from "views/admin/pages/GestionCanjes";
import AsignarServiciosBarberos from "views/admin/pages/AsignarServiciosBarberos";
import Landing from "views/pages/Landing";

/* =========================
   🔓 RUTAS PÚBLICAS
========================= */
export const publicRoutes = [
  {
    path: "/login",
    component: <Login />,
    layout: "/auth",
    invisible: true,
  },
  {
    path: "/register",
    component: <Register />,
    layout: "/auth",
    invisible: true,
  },
  {
    path: "/forgot-password",
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
   {
    path: "/inicio",
    component: <Landing/>,
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
    component: <Principal />,
    icon: "ni ni-shop text-primary",
    layout: "/admin",
  },
  {
    path: "/reservar-hora",
    name: "Reservar hora",
    component: <ReservarHora />,
    icon: "ni ni-calendar-grid-58 text-success",
    layout: "/admin",
  },
  {
    path: "/administrar-reservas",
    name: "Mis reservas",
    component: <Administrar />,
    icon: "ni ni-folder-17 text-info",
    layout: "/admin",
  },
  {
    path: "/suscripcion",
    name: "Suscripción",
    component: <Suscripcion />,
    icon: "ni ni-credit-card text-warning",
    layout: "/admin",
  },
  {
    path: "/barberos",
    name: "Barberos",
    component: <BarberosPage />,
    icon: "ni ni-single-02 text-primary",
    layout: "/admin",
  },
  {
    path: "/servicios",
    name: "Servicios",
    component: <PresentarServicios />,
    icon: "fas fa-cut text-danger",
    layout: "/admin",
  },
  {
    path: "/catalogo-canjes",
    name: "Canjear puntos",
    component: <CatalogoCanjes />,
    icon: "ni ni-trophy text-yellow",
    layout: "/admin",
  },
  {
    path: "/centro-ayuda",
    name: "Centro de ayuda",
    component: <CentroAyuda />,
    icon: "ni ni-support-16 text-purple",
    layout: "/admin",
  },
  {
    path: "/politicas",
    name: "Políticas",
    component: <Politicas />,
    icon: "ni ni-book-bookmark text-info",
    layout: "/admin",
  },
  {
    path: "/contacto",
    name: "Contacto",
    component: <Contacto />,
    icon: "ni ni-email-83 text-info",
    layout: "/admin",
  },

  // ocultas
  {
    path: "/perfil",
    component: <Perfil />,
    layout: "/admin",
    invisible: true,
  },
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
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "ni ni-tv-2 text-primary",
    component: <AdminDashboard />,
    layout: "/admin",
    section: "principal",
  },

  /* Reservas */
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

  /* Gestión */
  {
    path: "/gestion-clientes",
    name: "Clientes",
    icon: "fas fa-users text-warning",
    component: <GestionClientes />,
    layout: "/admin",
    section: "gestion",
  },
  {
    path: "/gestion-barberos",
    name: "Barberos",
    icon: "fas fa-user-tie text-primary",
    component: <CrearBarberoCompleto />,
    layout: "/admin",
    section: "gestion",
  },
  {
    path: "/gestion-servicios",
    name: "Servicios",
    icon: "fas fa-scissors text-danger",
    component: <GestionServicios />,
    layout: "/admin",
    section: "gestion",
  },
  {
    path: "/asignar-servicios",
    name: "Asignar servicios",
    icon: "ni ni-settings text-info",
    component: <AsignarServiciosBarberos />,
    layout: "/admin",
    section: "gestion",
  },
  {
    path: "/gestion-horarios",
    name: "Administrar Horarios",
    icon: "fas fa-clock text-danger",
    component: <GestionHorariosBarbero />,
    layout: "/admin",
    section: "gestion",
  },
  {
    path: "/asignar-horas",
    name: "Asignar horarios",
    icon: "fas fa-user-clock text-primary",
    component: <WizardBarberoSemana />,
    layout: "/admin",
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

  /* Otros */
  {
    path: "/estadisticas",
    name: "Estadísticas",
    icon: "fas fa-chart-line text-info",
    component: <Estadisticas />,
    layout: "/admin",
    section: "otros",
  },
];

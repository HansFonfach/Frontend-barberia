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
import { FaCut } from "react-icons/fa";
import SuscripcionResultado from "views/pages/SuscripcionResultado";

// Rutas públicas (login/register)
export const publicRoutes = [
  {
    path: "/login",
    name: "Login",
    component: <Login />,
    layout: "/auth",
    invisible: true,
  },
  {
    path: "/register",
    name: "Register",
    component: <Register />,
    layout: "/auth",
    invisible: true,
  },
  {
    path: "/forgot-password",
    name: "Forgot Password",
    component: <ForgotPassword />,
    layout: "/auth",
    invisible: true,
  },
  {
    path: "/reiniciar-contrasena/:token",
    name: "Reiniciar contraseña",
    component: <ReiniciarContraseña />,
    layout: "/auth",
    invisible: true,
  },
];

export const clienteRoutes = [
  {
    path: "/suscripcion/resultado",
    name: "ResultadoSuscripcion",
    component: <SuscripcionResultado />,
    invisible: true,
    layout: "/admin",
  },
  {
    path: "/index",
    name: "Inicio",
    component: <Principal />,
    icon: "ni ni-shop text-yellow", // 🏠 Inicio
    layout: "/admin",
  },
  {
    path: "/reservar-hora",
    name: "Reservar Hora",
    component: <ReservarHora />,
    icon: "ni ni-calendar-grid-58 text-orange", // 🗓️ Agendar
    layout: "/admin",
  },

  {
    path: "/administrar-reservas",
    name: "Administrar Reservas",
    component: <Administrar />,
    icon: "ni ni-folder-17 text-info", // 📁 Mis reservas
    layout: "/admin",
  },
  {
    path: "/suscripcion",
    name: "Suscribirse",
    component: <Suscripcion />,
    icon: "ni ni-credit-card text-success", // 💳 Suscripción
    layout: "/admin",
  },

  {
    path: "/barberos",
    name: "Conocer barberos",
    component: <BarberosPage />,
    icon: "ni ni-single-02 text-primary", // 🧔‍♂️ Perfil de barberos
    layout: "/admin",
  },
  {
    path: "/servicios",
    name: "Conocer servicios",
    component: <PresentarServicios />,
    icon: <FaCut size={20} className="text-ligth mr-3" />,
    // 🧔‍♂️ Perfil de barberos
    layout: "/admin",
  },
  {
    path: "/centro-ayuda",
    name: "Centro de ayuda",
    component: <CentroAyuda />,
    icon: "ni ni-support-16 text-purple", // 💬 Ayuda / FAQ
    layout: "/admin",
  },
  {
    path: "/politicas",
    name: "Políticas",
    component: <Politicas />,
    icon: "ni ni-notification-70 text-warning", // 📘 Políticas / reglas
    layout: "/admin",
  },
  {
    path: "/perfil",
    name: "Perfil",
    component: <Perfil />,
    invisible: true,
    layout: "/admin",
  },
  {
    path: "/cambiar-contrasena",
    name: "Cambiar contraseña",
    component: <CambiarContrasena />,
    invisible: true,
    layout: "/admin",
  },
  {
    path: "/contacto",
    name: "Contacto",
    component: <Contacto />,
    icon: "ni ni-email-83 text-info", // icono acorde a contacto
    layout: "/admin",
  },
];
export const barberoRoutes = [
  // Dashboard
  {
    path: "/dashboard",
    name: "Inicio",
    icon: "ni ni-tv-2 text-primary",
    layout: "/admin",
    component: <AdminDashboard />,
    section: "principal",
  },
  // Reservas
  {
    path: "/reservar-hora-cliente",
    name: "Agendar cliente",
    icon: "ni ni-calendar-grid-58 text-success",
    layout: "/admin",
    component: <ReservarHoraBarbero />,
    section: "reservas",
  },
  {
    path: "/reservas",
    name: "Ver reservas",
    icon: "fas fa-calendar-day text-success",
    layout: "/admin",
    component: <ReservasDiarias />,
    section: "reservas",
  },
  // Gestión
  {
    path: "/gestion-clientes",
    name: "Gestionar clientes",
    icon: "fas fa-users text-warning",
    layout: "/admin",
    component: <GestionClientes />,
    section: "gestion",
  },
  {
    path: "/gestion-barberos",
    name: "Gestionar Barberos",
    icon: "fas fa-user-tie text-primary",
    layout: "/admin",
    component: <CrearBarberoCompleto />,
    section: "gestion",
  },
  {
    path: "/gestion-servicios",
    name: "Gestionar servicios",
    icon: "fas fa-briefcase text-info",
    layout: "/admin",
    component: <GestionServicios />,
    section: "gestion",
  },
  {
    path: "/gestion-horarios",
    name: "Gestionar horarios",
    icon: "fas fa-clock text-danger",
    layout: "/admin",
    component: <GestionHorariosBarbero />,
    section: "gestion",
  },
  {
    path: "/asignar-horas",
    name: "Asignar horarios Barberos",
    icon: "fas fa-user-clock text-primary", // 👤⏰ Horarios por barbero
    layout: "/admin",
    component: <WizardBarberoSemana />,
  },
  // Estadísticas
  {
    path: "/estadisticas",
    name: "Estadísticas",
    icon: "fas fa-chart-line text-info",
    layout: "/admin",
    component: <Estadisticas />,
    section: "otros",
  },
];

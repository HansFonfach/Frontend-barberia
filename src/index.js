import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";

// Estilos
import "assets/plugins/nucleo/css/nucleo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/scss/argon-dashboard-react.scss";

// Layouts
import AdminLayout from "layouts/Admin";
import AuthLayout from "layouts/Auth";
import ProtectedRoute from "protectedRoute";

// Context global
import { AuthProvider } from "context/AuthContext";
import { EmpresaProvider } from "context/EmpresaContext";

// Providers solo para admin
import { UsuarioProvider } from "context/usuariosContext";
import { ServiciosProvider } from "context/ServiciosContext";
import { HorarioProvider } from "context/HorarioContext";
import { ReservaProvider } from "context/ReservaContext";
import { EstadisticasProvider } from "context/EstadisticasContext";
import { NotificacionProvider } from "context/NotificacionesContext";
import { LookProvider } from "context/LookContext";
import { CanjeProvider } from "context/CanjeContext";

// Pages
import Principal from "views/publico/principal";
import Landing from "views/pages/Landing";
import ReservarHoraInvitado from "views/invitados/pages/ReservaInvitado";

// Wrapper por empresa (slug)
const EmpresaWrapper = ({ children }) => {
  const { slug } = useParams();
  return <EmpresaProvider slug={slug}>{children}</EmpresaProvider>;
};

// Solo envuelve Providers que necesitan token (admin)
const AdminProviders = ({ children }) => (
  <UsuarioProvider>
    <ServiciosProvider>
      <HorarioProvider>
        <ReservaProvider>
          <EstadisticasProvider>
            <NotificacionProvider>
              <LookProvider>
                <CanjeProvider>{children}</CanjeProvider>
              </LookProvider>
            </NotificacionProvider>
          </EstadisticasProvider>
        </ReservaProvider>
      </HorarioProvider>
    </ServiciosProvider>
  </UsuarioProvider>
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* =========================
          HOME GLOBAL (AgendaFonfach)
          www.agendafonfach.cl/
      ========================= */}
          <Route path="/" element={<Principal />} />

          {/* =========================
          LANDING POR EMPRESA
          www.agendafonfach.cl/lasantabarberia
      ========================= */}
          <Route
            path="/:slug"
            element={
              <EmpresaWrapper>
                <Landing />
              </EmpresaWrapper>
            }
          />

          {/* =========================
          AUTH POR EMPRESA
      ========================= */}
          <Route
            path="/:slug/*"
            element={
              <EmpresaWrapper>
                <AuthLayout />
              </EmpresaWrapper>
            }
          />

          {/* =========================
          RESERVA INVITADO
      ========================= */}
          <Route
            path="/:slug/reservar"
            element={
              <EmpresaWrapper>
                <ReservarHoraInvitado />
              </EmpresaWrapper>
            }
          />

          {/* =========================
          ADMIN PROTEGIDO
      ========================= */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/:slug/admin/*"
              element={
                <EmpresaWrapper>
                  <AdminProviders>
                    <AdminLayout />
                  </AdminProviders>
                </EmpresaWrapper>
              }
            />
          </Route>

          {/* =========================
          FALLBACK
      ========================= */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

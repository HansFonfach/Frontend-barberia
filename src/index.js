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
import CancelarInvitado from "views/invitados/pages/CancelarInvitado";
import VerificarCuenta from "views/publico/VerificarCuenta";
import RegistrarNegocio from "views/publico/RegistrarNegocio";
import ConfirmacionResultado from "views/publico/ConfirmacionResultado";

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
          <Route path="/" element={<Principal />} />
          <Route path="/registro-negocio" element={<RegistrarNegocio />} />

          {/* ✅ Rutas específicas PRIMERO */}
          <Route
            path="/:slug"
            element={
              <EmpresaWrapper>
                <Landing />
              </EmpresaWrapper>
            }
          />
          <Route
            path="/:slug/reservar"
            element={
              <EmpresaWrapper>
                <ReservarHoraInvitado />
              </EmpresaWrapper>
            }
          />
          <Route
            path="/:slug/confirmar-reserva"
            element={
              <EmpresaWrapper>
                <ConfirmacionResultado />
              </EmpresaWrapper>
            }
          />
          <Route
            path="/:slug/cancelar-reserva-invitado"
            element={
              <EmpresaWrapper>
                <CancelarInvitado />
              </EmpresaWrapper>
            }
          />
          <Route
            path="/:slug/verificar-cuenta"
            element={
              <EmpresaWrapper>
                <VerificarCuenta />
              </EmpresaWrapper>
            }
          />

          {/* ✅ Admin protegido */}
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

          {/* ✅ /:slug/* AL FINAL */}
          <Route
            path="/:slug/*"
            element={
              <EmpresaWrapper>
                <AuthLayout />
              </EmpresaWrapper>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

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
import { EstadisticasGimnasioProvider } from "context/EstadisticasGimnasioContext";
import { NotificacionProvider } from "context/NotificacionesContext";
import { LookProvider } from "context/LookContext";
import { CanjeProvider } from "context/CanjeContext";
import { ClasesProvider } from "context/ClasesContext";
import { PlanesMembresiaProvider } from "context/PlanesMembresiaContext";
import { PlanesSuscripcionProvider } from "context/PlanesSuscripcionContext";
import { ProgresoClienteProvider } from "context/ProgresoClienteContext";
import { EntrenamientoPersonalProvider } from "context/EntrenamientoPersonalContext";
import { DiarioAlimenticioProvider } from "context/DiarioAlimenticioContext";

// Pages
import Principal from "views/publico/principal";
import Landing from "views/pages/Landing";
import ReservarHoraInvitado from "views/invitados/pages/ReservaInvitado";
import CancelarInvitado from "views/invitados/pages/CancelarInvitado";
import ClasePruebaInvitado from "views/invitados/pages/ClasePruebaInvitado";
import ContratarPlanInvitado from "views/invitados/pages/ContratarPlanInvitado";
import VerificarCuenta from "views/publico/VerificarCuenta";
import RegistrarNegocio from "views/publico/RegistrarNegocio";
import ConfirmacionResultado from "views/publico/ConfirmacionResultado";
import { ProductoProvider } from "context/ProductoContext";
import { VentaDirectaProvider } from "context/VentaDirectaContext";
import ConfirmarReserva from "views/publico/ConfirmarReserva";
import SuperAdminLogin from "views/superadmin/SuperAdminLogin";
import SuperAdminDashboard from "views/superadmin/SuperAdminDashboard";

// Red de seguridad ante errores de render (evita la pantalla en blanco) y
// detección de versión vieja del sitio en el navegador del usuario.
import ErrorBoundary from "components/ErrorBoundary";
import { iniciarVersionWatcher } from "utils/versionWatcher";

// Wrapper por empresa (slug)
const EmpresaWrapper = ({ children }) => {
  const { slug } = useParams();
  return <EmpresaProvider slug={slug}>{children}</EmpresaProvider>;
};

// Solo envuelve Providers que necesitan token (admin)
const AdminProviders = ({ children }) => (
  <VentaDirectaProvider>
    <ProductoProvider>
      <UsuarioProvider>
        <ServiciosProvider>
          <HorarioProvider>
            <ReservaProvider>
              <EstadisticasProvider>
                <EstadisticasGimnasioProvider>
                  <NotificacionProvider>
                    <LookProvider>
                      <CanjeProvider>
                        <ClasesProvider>
                          <PlanesMembresiaProvider>
                            <PlanesSuscripcionProvider>
                              <ProgresoClienteProvider>
                                <EntrenamientoPersonalProvider>
                                  <DiarioAlimenticioProvider>
                                    {children}
                                  </DiarioAlimenticioProvider>
                                </EntrenamientoPersonalProvider>
                              </ProgresoClienteProvider>
                            </PlanesSuscripcionProvider>
                          </PlanesMembresiaProvider>
                        </ClasesProvider>
                      </CanjeProvider>
                    </LookProvider>
                  </NotificacionProvider>
                </EstadisticasGimnasioProvider>
              </EstadisticasProvider>
            </ReservaProvider>
          </HorarioProvider>
        </ServiciosProvider>
      </UsuarioProvider>
    </ProductoProvider>
  </VentaDirectaProvider>
);

// Empieza a chequear si el navegador quedó con una versión vieja del sitio
// (típico en celulares que cachean agresivo) y recarga sola si corresponde.
iniciarVersionWatcher();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Principal />} />
          <Route path="/registro-negocio" element={<RegistrarNegocio />} />

          <Route
            path="/confirmar-reserva"
            element={<ConfirmacionResultado />}
          />
          <Route path="/cancelar-reserva" element={<ConfirmacionResultado />} />

          {/* Panel de super-admin (gestión de todas las empresas, solo
              Hans) — rutas top-level, fuera del esquema /:slug. React
              Router prioriza siempre un segmento literal ("superadmin")
              por sobre uno dinámico (":slug"), así que esto nunca choca
              con el landing de una empresa aunque alguna llegara a
              registrarse con el slug "superadmin". */}
          <Route path="/superadmin/login" element={<SuperAdminLogin />} />
          <Route path="/superadmin" element={<SuperAdminDashboard />} />

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

          <Route
            path="/:slug/agendar-directo"
            element={
              <EmpresaWrapper>
                <ConfirmarReserva />
              </EmpresaWrapper>
            }
          />

          {/* Clases grupales (gimnasios): agendar sin login (clase de prueba
              o, si el RUT tiene membresía activa, descontando su cupo) y
              contratar un plan sin crear cuenta. Antes esta página existía
              en el código pero nunca estaba conectada a ninguna ruta. */}
          <Route
            path="/:slug/clase-de-prueba"
            element={
              <EmpresaWrapper>
                <ClasePruebaInvitado />
              </EmpresaWrapper>
            }
          />
          <Route
            path="/:slug/contratar-plan"
            element={
              <EmpresaWrapper>
                <ContratarPlanInvitado />
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
    </ErrorBoundary>
  </React.StrictMode>,
);

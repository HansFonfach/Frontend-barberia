import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "assets/plugins/nucleo/css/nucleo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/scss/argon-dashboard-react.scss";

import AdminLayout from "layouts/Admin.js";
import AuthLayout from "layouts/Auth.js";
import ProtectedRoute from "protectedRoute";

import { AuthProvider, useAuth } from "context/AuthContext";
import { ReservaProvider } from "context/ReservaContext";
import { ServiciosProvider } from "context/ServiciosContext";
import { UsuarioProvider } from "context/usuariosContext";
import { HorarioProvider } from "context/HorarioContext";
import { EstadisticasProvider } from "context/EstadisticasContext";
import { NotificacionProvider } from "context/NotificacionesContext";
import { LookProvider } from "context/LookContext";
import { CanjeProvider } from "context/CanjeContext";

import Landing from "views/pages/Landing";

const RootRedirect = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Landing />;
  }

  return (
    <Navigate
      to={user?.rol === "barbero" ? "/admin/dashboard" : "/admin/index"}
      replace
    />
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UsuarioProvider>
          <ServiciosProvider>
            <HorarioProvider>
              <ReservaProvider>
                <EstadisticasProvider>
                  <NotificacionProvider>
                    <LookProvider>
                      <CanjeProvider>
                        <Routes>
                          {/* Landing pública */}
                          <Route path="/" element={<RootRedirect />} />

                          {/* Auth */}
                          <Route path="/auth/*" element={<AuthLayout />} />

                          {/* Protegido */}
                          <Route element={<ProtectedRoute />}>
                            <Route
                              path="/admin/*"
                              element={<AdminLayout />}
                            />
                          </Route>

                          {/* Fallback */}
                          <Route
                            path="*"
                            element={<Navigate to="/" replace />}
                          />
                        </Routes>
                      </CanjeProvider>
                    </LookProvider>
                  </NotificacionProvider>
                </EstadisticasProvider>
              </ReservaProvider>
            </HorarioProvider>
          </ServiciosProvider>
        </UsuarioProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// src/views/pages/CambiarContrasena.jsx
import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Progress,
} from "reactstrap";
import UserHeader from "components/Headers/UserHeader";
import { useAuth } from "context/AuthContext"; // si tienes este hook (opcional)
import Swal from "sweetalert2";

const passwordStrength = (pwd) => {
  let score = 0;
  if (!pwd) return 0;
  if (pwd.length >= 8) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
  return score; // 0..4
};

const strengthLabel = (score) => {
  switch (score) {
    case 0:
    case 1:
      return { color: "danger", text: "Débil" };
    case 2:
      return { color: "warning", text: "Regular" };
    case 3:
      return { color: "info", text: "Bueno" };
    case 4:
      return { color: "success", text: "Excelente" };
    default:
      return { color: "secondary", text: "" };
  }
};
const auth = (() => {
  try {
    return useAuth();
  } catch {
    return null;
  }
})();

const CambiarContrasena = () => {
  // si usas token en localStorage (fallback)
  const token =
    (auth && auth.user && auth.user.token) ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    null;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, updatePassword, signOut } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones cliente
    if (!currentPassword || !newPassword || !confirmPassword) {
      return Swal.fire("Error", "Completa todos los campos.", "error");
    }
    if (newPassword.length < 8) {
      return Swal.fire(
        "Error",
        "La nueva contraseña debe tener al menos 8 caracteres.",
        "error"
      );
    }
    if (newPassword !== confirmPassword) {
      return Swal.fire("Error", "Las contraseñas no coinciden.", "error");
    }
    // opcional: no permitir misma contraseña
    if (currentPassword === newPassword) {
      return Swal.fire(
        "Error",
        "La nueva contraseña debe ser diferente a la actual.",
        "error"
      );
    }

    // Preparar petición al backend
    setLoading(true);
    try {
      await updatePassword(user._id, currentPassword, newPassword);

      Swal.fire("Exitoso", "Contraseña actualizada.", "success");
      // Limpiar campos
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      signOut();
    } catch (err) {
      console.error("Error cambiar contraseña:", err);
      Swal.fire("Error", err.message || "Ocurrió un error", "error");
    } finally {
      setLoading(false);
    }
  };

  const strength = passwordStrength(newPassword);
  const strengthInfo = strengthLabel(strength);
  const progressPercent = (strength / 4) * 100;

  return (
    <>
      <UserHeader />

      <Container fluid className="pt-6 mt--4 mb-5">
        <Row className="justify-content-center">
          <Col lg="6">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <h3 className="mb-0">Cambiar Contraseña</h3>
                <p className="text-sm text-muted mb-0 mt-1">
                  Aquí puedes actualizar tu contraseña de forma segura.
                </p>
              </CardHeader>

              <CardBody>
                <Form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Label for="currentPassword">Contraseña actual</Label>
                    <div className="d-flex">
                      <Input
                        id="currentPassword"
                        type={showCurrent ? "text" : "password"}
                        placeholder="Ingresa tu contraseña actual"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        autoComplete="current-password"
                      />
                      <Button
                        color="secondary"
                        outline
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="ml-2"
                      >
                        {showCurrent ? "Ocultar" : "Mostrar"}
                      </Button>
                    </div>
                  </FormGroup>

                  <FormGroup>
                    <Label for="newPassword">Nueva contraseña</Label>
                    <div className="d-flex">
                      <Input
                        id="newPassword"
                        type={showNew ? "text" : "password"}
                        placeholder="Ingresa la nueva contraseña"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                      <Button
                        color="secondary"
                        outline
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="ml-2"
                      >
                        {showNew ? "Ocultar" : "Mostrar"}
                      </Button>
                    </div>

                    <div className="mt-2">
                      <Progress
                        value={progressPercent}
                        color={strengthInfo.color}
                        style={{ height: "8px", borderRadius: "6px" }}
                      />
                      <small className="text-muted">
                        Fuerza: <strong>{strengthInfo.text}</strong>{" "}
                        {newPassword && (
                          <span>
                            · longitud: {newPassword.length} caracteres
                          </span>
                        )}
                      </small>
                    </div>
                  </FormGroup>

                  <FormGroup>
                    <Label for="confirmPassword">
                      Confirmar nueva contraseña
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Repite la nueva contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                  </FormGroup>

                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <small className="text-muted">
                      Asegúrate de que tu contraseña tenga al menos 8
                      caracteres, incluya números y letras.
                    </small>

                    <div>
                      <Button color="primary" type="submit" disabled={loading}>
                        {loading ? "Guardando..." : "Cambiar contraseña"}
                      </Button>
                    </div>
                  </div>
                </Form>
              </CardBody>
            </Card>

            {/* small helper note */}
            <div className="text-center text-muted small mt-3">
              Si olvidaste tu contraseña, usa "Recuperar contraseña" en la
              pantalla de inicio de sesión para recibir un enlace por correo.
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default CambiarContrasena;

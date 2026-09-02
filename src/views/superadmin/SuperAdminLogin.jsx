import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardBody, Form, FormGroup, Input, Button, Alert } from "reactstrap";
import { loginSuperAdminRequest } from "api/superAdmin";

// Login del panel de super-admin: totalmente aparte del login de cada
// negocio (no usa AuthContext ni EmpresaContext, no depende de ningún
// slug). Solo Hans tiene estas credenciales — ver SUPERADMIN_EMAIL /
// SUPERADMIN_PASSWORD_HASH en el .env del backend.
const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const res = await loginSuperAdminRequest(email, password);
      localStorage.setItem("superadminToken", res.data.token);
      navigate("/superadmin");
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo iniciar sesión");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#172b4d",
      }}
    >
      <Card style={{ width: 380, maxWidth: "90vw" }} className="shadow">
        <CardBody className="p-4">
          <h4 className="text-center mb-1">Panel de administración</h4>
          <p className="text-center text-muted small mb-4">Solo para gestión interna</p>

          {error && <Alert color="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <label className="small font-weight-bold">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </FormGroup>
            <FormGroup>
              <label className="small font-weight-bold">Contraseña</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </FormGroup>
            <Button color="primary" block type="submit" disabled={cargando}>
              {cargando ? "Ingresando..." : "Ingresar"}
            </Button>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
};

export default SuperAdminLogin;

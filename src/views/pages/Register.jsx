/*! 
=========================================================
* Argon Dashboard React - v1.2.4
=========================================================
* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2024 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)
* Coded by Creative Tim
=========================================================
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/
// reactstrap components
import { useAuth } from "context/AuthContext";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRutValidator } from "../../hooks/useRutValidador";

import {
  Button,
  Card,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Row,
  Col,
  CardHeader,
} from "reactstrap";
import Swal from "sweetalert2";
import { FaPhone } from "react-icons/fa";
import logo from "assets/img/brand/lasanta.png"; // ✅ ruta más segura dentro de src/assets

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { rut, handleRutChange, error } = useRutValidator();
  const [passwordMatch, setPasswordMatch] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { slug } = useParams();

  const [form, setForm] = useState({
    rut: "",
    nombre: "",
    apellido: "",
    telefono: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1️⃣ Validaciones frontend primero
    if (error) {
      Swal.fire({
        icon: "error",
        title: "RUT inválido",
        text: "Por favor ingresa un RUT o pasaporte válido.",
      });
      return;
    }

    if (form.password !== form.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Las contraseñas no coinciden.",
      });
      return;
    }

    try {
      // 2️⃣ Registrar
      await register({ ...form, rut, slug });

      // 3️⃣ Éxito
      Swal.fire({
        title: "Registro exitoso 🎉",
        text: "¡Tu cuenta fue creada correctamente!",
        icon: "success",
        confirmButtonText: "Aceptar",
      });

      navigate(`/${slug}/admin/index`);
    } catch (err) {
      // 4️⃣ Error REAL del backend
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Error al registrar. Intenta nuevamente.";

      Swal.fire({
        icon: "error",
        title: "No se pudo registrar",
        text: message,
      });
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    if (e.target.name === "password" || e.target.name === "confirmPassword") {
      setPasswordMatch(
        e.target.name === "confirmPassword"
          ? e.target.value === form.password
          : (form.confirmPassword = e.target.value),
      );
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <>
      <Col lg="6" md="8">
        <Card className="bg-secondary shadow border-0">
          <CardHeader className="bg-transparent pb-1 text-center">
            <img
              src={logo}
              alt="Logo"
              style={{
                width: "150px",
                height: "auto",
                transition: "transform 0.3s ease",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
              draggable="false"
            />
          </CardHeader>
          <CardBody className="px-lg-5 py-lg-5">
            <div className="text-center text-muted mb-4">
              <small>REGISTRATE</small>
            </div>
            <Form role="form" onSubmit={handleSubmit}>
              <FormGroup>
                <InputGroup className="input-group-alternative mb-3">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-hat-3" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Ingrese rut sin puntos ni guión"
                    type="text"
                    name="rut"
                    value={rut}
                    maxLength={12}
                    onChange={handleRutChange}
                    className={error ? "is-invalid" : ""}
                  />
                  {error && (
                    <div className="invalid-feedback d-block">{error}</div>
                  )}
                </InputGroup>
              </FormGroup>
              <FormGroup>
                <InputGroup className="input-group-alternative mb-3">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-hat-3" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Nombre"
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                  />
                </InputGroup>
              </FormGroup>
              <FormGroup>
                <InputGroup className="input-group-alternative mb-3">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-hat-3" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Apellido"
                    type="text"
                    name="apellido"
                    value={form.apellido}
                    onChange={handleChange}
                  />
                </InputGroup>
              </FormGroup>
              <InputGroup className="input-group-alternative mb-3">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <FaPhone />
                  </InputGroupText>
                </InputGroupAddon>

                <InputGroupAddon addonType="prepend">
                  <InputGroupText>+569</InputGroupText>
                </InputGroupAddon>

                <Input
                  placeholder="75345678"
                  type="number"
                  name="telefono"
                  value={form.telefono}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, ""); // solo números
                    if (value.length > 8) value = value.slice(0, 8);
                    setForm({ ...form, telefono: value });
                  }}
                  minLength={8}
                  maxLength={8}
                />
              </InputGroup>

              <FormGroup>
                <InputGroup className="input-group-alternative mb-3">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-email-83" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Email"
                    type="email"
                    autoComplete="new-email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                  />
                </InputGroup>
              </FormGroup>

              {/* Campo de Contraseña con ojito */}
              <FormGroup>
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-lock-circle-open" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Contraseña"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                  />
                  <InputGroupAddon addonType="append">
                    <Button
                      type="button"
                      color="link"
                      className="text-dark"
                      onClick={togglePasswordVisibility}
                      style={{
                        border: "none",
                        background: "transparent",
                        padding: "0.75rem 1rem",
                      }}
                    >
                      <i
                        className={`ni ${
                          showPassword ? "ni-fat-remove" : "ni-bulb-61"
                        }`}
                      />
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
              </FormGroup>

              {/* Campo de Confirmar Contraseña con ojito */}
              <FormGroup>
                <InputGroup className="input-group-alternative mb-3">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-lock-circle-open" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Confirmar contraseña"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className={
                      passwordMatch === null
                        ? ""
                        : passwordMatch
                          ? "is-valid"
                          : "is-invalid"
                    }
                  />
                  <InputGroupAddon addonType="append">
                    <Button
                      type="button"
                      color="link"
                      className="text-dark"
                      onClick={toggleConfirmPasswordVisibility}
                      style={{
                        border: "none",
                        background: "transparent",
                        padding: "0.75rem 1rem",
                      }}
                    >
                      <i
                        className={`ni ${
                          showConfirmPassword ? "ni-fat-remove" : "ni-bulb-61"
                        }`}
                      />
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
                {passwordMatch === false && (
                  <div className="invalid-feedback d-block">
                    Las contraseñas no coinciden
                  </div>
                )}
                {passwordMatch === true && (
                  <div className="valid-feedback d-block">
                    Las contraseñas coinciden ✅
                  </div>
                )}
              </FormGroup>

              <div className="text-center">
                <Button className="mt-4" color="primary" type="submit">
                  Crear cuenta
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
      </Col>
    </>
  );
};

export default Register;

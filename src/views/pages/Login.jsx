import { useEffect, useState } from "react";
import { useAuth } from "context/AuthContext";
import { useParams } from "react-router-dom";

import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Row,
  Col,
} from "reactstrap";
import { useNavigate } from "react-router-dom";

import logo from "assets/img/brand/lasanta.png";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { useEmpresa } from "context/EmpresaContext";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const { signIn, isAuthenticated } = useAuth();
  const { slug } = useParams();
  const { empresa } = useEmpresa();

  const navigate = useNavigate();

  // Determinar si es Lumica
  const isLumica = slug === "lumicabeauty";

  // Colores para Lumica
  const lumicaTheme = {
    primary: "#FF5DA1",
    primaryLight: "#FFE4F0",
    primaryDark: "#E64D8F",
    textLight: "#FFFFFF",
    textDark: "#2D3748",
    textMuted: "#718096",
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate(`/${slug}/admin`);
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await signIn({
        ...form,
        slug,
      });
    } catch (error) {
      Swal.fire({
        title: "Error de login",
        text:
          error.response?.data?.message || error.message || "Error desconocido",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <Col lg="5" md="7">
        {/* Card condicional - mantiene bg-secondary para no-lumica */}
        <Card
          className={isLumica ? "shadow border-0" : "bg-secondary shadow border-0"}
          style={{
            backgroundColor: isLumica ? "#FFFFFF" : undefined,
          }}
        >
          <CardHeader
            className={isLumica ? "text-center" : "bg-transparent pb-1 text-center"}
            style={{
              backgroundColor: isLumica ? "#FFFFFF" : undefined,
              borderBottom: isLumica
                ? `1px solid ${lumicaTheme.primaryLight}`
                : "none",
              paddingTop: isLumica ? "2rem" : undefined,
            }}
          >
            <img
              src={empresa?.logo || logo}
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
            <div className="text-center mb-4">
              <small
                className={isLumica ? "" : "text-muted"}
                style={{ color: isLumica ? lumicaTheme.textMuted : undefined }}
              >
                INICIA SESIÓN CON TUS CREDENCIALES
              </small>
            </div>
            <Form role="form" onSubmit={handleSubmit}>
              <FormGroup className="mb-3">
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-email-83" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Email"
                    type="email"
                    name="email"
                    autoComplete="new-email"
                    value={form.email}
                    onChange={handleChange}
                  />
                </InputGroup>
              </FormGroup>
              <FormGroup>
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-lock-circle-open" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Password"
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={handleChange}
                  />
                </InputGroup>
              </FormGroup>
              <div className="custom-control custom-control-alternative custom-checkbox">
                <input
                  className="custom-control-input"
                  id="customCheckLogin"
                  type="checkbox"
                />
                <label
                  className="custom-control-label"
                  htmlFor="customCheckLogin"
                >
                  <span
                    className={isLumica ? "" : "text-muted"}
                    style={{ color: isLumica ? lumicaTheme.textMuted : undefined }}
                  >
                    Recordarme
                  </span>
                </label>
              </div>
              <div className="text-center">
                <Button
                  className="my-4"
                  color={isLumica ? undefined : "primary"}
                  style={{
                    backgroundColor: isLumica ? lumicaTheme.primary : undefined,
                    borderColor: isLumica ? lumicaTheme.primary : undefined,
                    color: "#FFFFFF",
                  }}
                  type="submit"
                >
                  Iniciar Sesión
                </Button>
                <Button
                  className="btn-neutral btn-icon"
                  color="default"
                  onClick={(e) => e.preventDefault()}
                >
                  <span className="btn-inner--icon">
                    <img
                      alt="..."
                      src={
                        require("../../assets/img/icons/common/google.svg")
                          .default
                      }
                    />
                  </span>
                  <span className="btn-inner--text">Google</span>
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
        <Row className="mt-3">
          <Col xs="6">
            <Link
              to={`/${slug}/recuperar-contrasena`}
              className={isLumica ? "" : "text-white"}
              style={{ color: isLumica ? lumicaTheme.primary : undefined }}
            >
              Olvidé mi contraseña
            </Link>
          </Col>

          <Col className="text-right" xs="6">
            <Link
              to={`/${slug}/register`}
              className={isLumica ? "" : "text-white"}
              style={{ color: isLumica ? lumicaTheme.primary : undefined }}
            >
              Registrarme
            </Link>
          </Col>
        </Row>
      </Col>
    </>
  );
};

export default Login;
import { useEffect, useState } from "react";
import { useAuth } from "context/AuthContext";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getLogoUrl } from "utils/getLogoUrl";
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
import Swal from "sweetalert2";
import { useEmpresa } from "context/EmpresaContext";

const themes = {
  lumicabeauty: {
    primary: "#FF5DA1",
    primaryLight: "#FFE4F0",
    primaryDark: "#E64D8F",
    textDark: "#2D3748",
    textMuted: "#718096",
    variant: "light",
  },

  "danails-studio": {
    primary: "#F2A7C3",
    primaryLight: "#FEF0F5",
    primaryDark: "#D4819F",

    secondary: "#D4AF37",

    softBg: "#FFF8FB",

    heroBg: "linear-gradient(135deg, #FFFFFF 0%, #FEF0F5 50%, #FFF8FB 100%)",

    textDark: "#3A2E32",
    textMuted: "#B09AA0",

    variant: "light",
  },
  default: {
    primary: "#5e72e4",
    primaryLight: "#eaecfe",
    primaryDark: "#324cdd",
    textDark: "#ffffff",
    textMuted: "#8898aa",
    variant: "dark",
  },
};

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const { signIn, isAuthenticated } = useAuth();
  const { slug } = useParams();
  const { empresa } = useEmpresa();

  const navigate = useNavigate();

  const theme = themes[slug] || themes.default;
  const isLightTheme = theme.variant === "light";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(`/${slug}/admin`);
    }
  }, [isAuthenticated, navigate, slug]);

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

  const logoUrl = getLogoUrl(empresa);

  return (
    <Col lg="5" md="7">
      <Card
        className="shadow border-0"
        style={{
          background: theme.softBg,
          borderRadius: "24px",
          overflow: "hidden",
        }}
      >
        <CardHeader
          className="text-center"
          style={{
            background: "#FFFFFF",
            borderBottom: `1px solid ${theme.primaryLight}`,
            paddingTop: "2rem",
          }}
        >
          <img
            src={
              logoUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                empresa?.nombre || "Negocio",
              )}&background=${theme.primary.replace(
                "#",
                "",
              )}&color=fff&size=150&bold=true&rounded=true`
            }
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
              className={isLightTheme ? "" : "text-muted"}
              style={{
                color: isLightTheme ? theme.textMuted : undefined,
              }}
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
                  className={isLightTheme ? "" : "text-muted"}
                  style={{
                    color: isLightTheme ? theme.textMuted : undefined,
                  }}
                >
                  Recordarme
                </span>
              </label>
            </div>

            <div className="text-center">
              <Button
                className="my-4"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
                  border: "none",
                  color: "#fff",
                  fontWeight: 600,
                  minWidth: "220px",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px rgba(242,167,195,.35)",
                }}
                type="submit"
              >
                Iniciar Sesión
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>

      <Row className="mt-3">
        <Col xs="6">
          <Link
            to={`/${slug}/recuperar-contrasena`}
            className={isLightTheme ? "" : "text-white"}
            style={{
              color: isLightTheme ? theme.primaryDark : undefined,
              fontWeight: 600,
            }}
          >
            Olvidé mi contraseña
          </Link>
        </Col>

        <Col className="text-right" xs="6">
          <Link
            to={`/${slug}/register`}
            className={isLightTheme ? "" : "text-white"}
            style={{
              color: isLightTheme ? theme.primaryDark : undefined,
              fontWeight: 600,
            }}
          >
            Registrarme
          </Link>
        </Col>
      </Row>
    </Col>
  );
};

export default Login;

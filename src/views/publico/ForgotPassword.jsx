import { useState } from "react";
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
import { useNavigate, Link, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import logo from "assets/img/brand/lasanta.png";
import { useAuth } from "context/AuthContext";
import { useEmpresa } from "context/EmpresaContext";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const { slug } = useParams();
  const { empresa } = useEmpresa();

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "Correo requerido",
        text: "Debes ingresar un correo para recuperar tu contraseña.",
      });
    }

    try {
      await forgotPassword({ email, slug });

      Swal.fire({
        icon: "success",
        title: "Correo enviado",
        text: "Te hemos enviado un enlace para restablecer tu contraseña.",
        confirmButtonText: "Aceptar",
      }).then(() => navigate(`${slug}/login`));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "No pudimos enviar el correo, intenta nuevamente.",
      });
    }
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
                RECUPERA TU CONTRASEÑA
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
                    placeholder="Ingresa tu email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </InputGroup>
              </FormGroup>

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
                  Enviar enlace de recuperación
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>

        <Row className="mt-3">
          <Col xs="12" className="text-center">
            <Link
              to={`/${slug}/login`}
              className={isLumica ? "" : "text-white"}
              style={{ color: isLumica ? lumicaTheme.primary : undefined }}
            >
              Volver al inicio de sesión
            </Link>
          </Col>
        </Row>
      </Col>
    </>
  );
};

export default ForgotPassword;
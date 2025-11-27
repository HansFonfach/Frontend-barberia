import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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

import logo from "assets/img/logo4.png";
import axios from "axios";

const ResetPassword = () => {
  const { token } = useParams(); // 👈 obtenemos el token desde la URL
  const navigate = useNavigate();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return Swal.fire({
        title: "Error",
        text: "Las contraseñas no coinciden.",
        icon: "error",
      });
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/change-password/${token}`,
        { password: form.password }
      );

      Swal.fire({
        title: "Contraseña actualizada",
        text: res.data.message || "Tu contraseña fue actualizada con éxito.",
        icon: "success",
      });

      navigate("/auth/login");
    } catch (error) {
      Swal.fire({
        title: "Error",
        text:
          error.response?.data?.message ||
          "Hubo un problema al actualizar la contraseña.",
        icon: "error",
      });
    }
  };

  return (
    <Col lg="5" md="7">
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
            <small>REINICIAR CONTRASEÑA</small>
          </div>

          <Form role="form" onSubmit={handleSubmit}>
            {/* Nueva contraseña */}
            <FormGroup className="mb-3">
              <InputGroup className="input-group-alternative">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="ni ni-lock-circle-open" />
                  </InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder="Nueva contraseña"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                />
              </InputGroup>
            </FormGroup>

            {/* Confirmación */}
            <FormGroup className="mb-4">
              <InputGroup className="input-group-alternative">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="ni ni-lock-circle-open" />
                  </InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder="Confirmar contraseña"
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
              </InputGroup>
            </FormGroup>

            <div className="text-center">
              <Button className="my-4" color="primary" type="submit">
                Cambiar contraseña
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>

      <Row className="mt-3">
        <Col xs="6">
          <a
            className="text-light"
            href="#pablo"
            onClick={(e) => e.preventDefault()}
          >
            <Link to="/auth/login" className="text-white">
              {" "}
              Volver
            </Link>
          </a>
        </Col>
      </Row>
    </Col>
  );
};

export default ResetPassword;

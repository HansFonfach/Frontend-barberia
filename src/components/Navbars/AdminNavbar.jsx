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
import { useAuth } from "context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
// reactstrap components
import {
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Form,
  FormGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  InputGroup,
  Navbar,
  Nav,
  Container,
  Media,
} from "reactstrap";

const AdminNavbar = (props) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate(); // Hook para redirigir al usuario;

  const handleLogout = async () => {
    const slug = user?.empresa?.slug;

    await signOut();

    if (slug) {
      navigate(`/${slug}/login`);
    } else {
      navigate("/"); // fallback de seguridad
    }
  };

  const generarColor = (nombre) => {
    const colores = [
      "#FFB84C",
      "#AEE2FF",
      "#B9FBC0",
      "#FFD6A5",
      "#FFADAD",
      "#CDB4DB",
      "#9BF6FF",
      "#FDFFB6",
    ];
    if (!nombre) return "#CCCCCC";
    const index = nombre.charCodeAt(0) % colores.length;
    return colores[index];
  };

  // 🔹 Genera iniciales del usuario (ej: "Hans Fonfach" → "HF")
  const getIniciales = (nombre = "", apellido = "") => {
    return (
      (nombre?.charAt(0)?.toUpperCase() || "") +
      (apellido?.charAt(0)?.toUpperCase() || "")
    );
  };

  const iniciales = getIniciales(user?.nombre, user?.apellido);
  const colorFondo = generarColor(user?.nombre);

  return (
    <>
      <Navbar className="navbar-top navbar-dark" expand="md" id="navbar-main">
        <Container fluid>
          <Link
            className="h4 mb-0 text-white text-uppercase d-none d-lg-inline-block"
            to="/"
          >
            {props.brandText}
          </Link>
          <Form className="navbar-search navbar-search-dark form-inline mr-3 d-none d-md-flex ml-lg-auto">
            <FormGroup className="mb-0">
              <InputGroup className="input-group-alternative">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="fas fa-search" />
                  </InputGroupText>
                </InputGroupAddon>
                <Input placeholder="Search" type="text" />
              </InputGroup>
            </FormGroup>
          </Form>
          <Nav className="align-items-center d-none d-md-flex" navbar>
            <UncontrolledDropdown nav>
              <DropdownToggle className="pr-0" nav>
                <Media className="align-items-center">
                  <span className="avatar avatar-sm rounded-circle mr-2">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle"
                      style={{
                        backgroundColor: colorFondo,
                        width: "36px",
                        height: "36px",
                        fontSize: "14px",
                        color: "#fff",
                        fontWeight: "bold",
                      }}
                    >
                      {iniciales || "U"}
                    </div>
                  </span>
                  <Media className="ml-2 d-none d-lg-block">
                    <span className="mb-0 text-sm font-weight-bold">
                      {user?.nombre} {user?.apellido}
                    </span>
                  </Media>
                </Media>
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-arrow" right>
                <DropdownItem className="noti-title" header tag="div">
                  <h6 className="text-overflow m-0">Bienvenido</h6>
                </DropdownItem>
                <DropdownItem to="/admin/perfil" tag={Link}>
                  <i className="ni ni-single-02" />
                  <span>Mi perfil</span>
                </DropdownItem>
                <DropdownItem to="/admin/cambiar-contrasena" tag={Link}>
                  <i className="ni ni-settings-gear-65" />
                  <span>Cambiar contraseña</span>
                </DropdownItem>

                <DropdownItem divider />
                <DropdownItem href="" onClick={handleLogout}>
                  <i className="ni ni-user-run" />
                  <span>Cerrar sesión</span>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
        </Container>
      </Navbar>
    </>
  );
};

export default AdminNavbar;

import {
  useLocation,
  NavLink as NavLinkRRD,
  Link,
  useNavigate,
} from "react-router-dom";
import { useState } from "react";
import { PropTypes } from "prop-types";
import {
  Collapse,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Form,
  Input,
  InputGroup,
  InputGroupText,
  Nav,
  NavItem,
  NavLink,
  Navbar,
  NavbarBrand,
  Container,
  Row,
  Col,
  Media,
} from "reactstrap";
import { useAuth } from "context/AuthContext";

const Sidebar = ({ routes, logo, usuario }) => {
  const [collapseOpen, setCollapseOpen] = useState(false);
  const location = useLocation(); // ✅ Esto reemplaza la prop 'location'

  const { user, signOut } = useAuth();
  const navigate = useNavigate(); // Hook para redirigir al usuario;

  const handleLogout = async () => {
    await signOut(); // Llama a la función de logout
    navigate("/auth/login"); // Redirige al login
  };

  const toggleCollapse = () => setCollapseOpen((prev) => !prev);
  const closeCollapse = () => setCollapseOpen(false);

  const activeRoute = (routeName) =>
    location.pathname.indexOf(routeName) > -1 ? "active" : "";

  const createLinks = (routes) =>
    routes
      .filter((r) => !r.invisible)
      .map((r, idx) => (
        <NavItem key={idx}>
          <NavLink
            to={r.layout + r.path}
            tag={NavLinkRRD}
            onClick={closeCollapse}
            className={activeRoute(r.layout + r.path)}
          >
            {r.icon && typeof r.icon !== "string" ? (
              r.icon
            ) : (
              <i className={r.icon} />
            )}
            {r.name}
          </NavLink>
        </NavItem>
      ));

  let navbarBrandProps;
  if (logo && logo.innerLink) {
    navbarBrandProps = { to: logo.innerLink, tag: Link };
  } else if (logo && logo.outterLink) {
    navbarBrandProps = { href: logo.outterLink, target: "_blank" };
  }

  return (
    <Navbar
      className="navbar-vertical fixed-left navbar-light bg-white"
      expand="md"
      id="sidenav-main"
    >
      <Container fluid>
        {/* Toggler */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleCollapse}
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* Brand */}
        {logo && (
          <NavbarBrand className="pt-0" {...navbarBrandProps}>
            <img
              alt={logo.imgAlt}
              className="navbar-brand-img"
              src={logo.imgSrc}
            />
          </NavbarBrand>
        )}

        {/* User menu (mobile) */}
        <Nav className="align-items-center d-md-none">
          <UncontrolledDropdown nav>
            <DropdownToggle nav className="nav-link-icon">
              <i className="ni ni-bell-55" />
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-arrow" right>
              <DropdownItem>Notificación 1</DropdownItem>
              <DropdownItem>Notificación 2</DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>

          <UncontrolledDropdown nav>
            <DropdownToggle nav>
              <Media className="align-items-center">
                <span className="avatar avatar-sm rounded-circle">
                  <img
                    alt="avatar"
                    src={require("../../assets/img/theme/team-1-800x800.jpg")}
                  />
                </span>
              </Media>
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-arrow" right>
              <DropdownItem className="noti-title" header tag="div">
                <h6 className="text-overflow m-0">
                  Bienvenido {usuario?.nombre}
                </h6>
              </DropdownItem>
              <DropdownItem to="/admin/perfil" tag={Link}>
                <i className="ni ni-single-02" />
                <span>Perfil</span>
              </DropdownItem>
              <DropdownItem to="/admin/cambiar-contrasena" tag={Link}>
                <i className="ni ni-single-02" />
                <span>Cambiar contraseña</span>
              </DropdownItem>
              <DropdownItem href="" onClick={handleLogout}>
                <i className="ni ni-user-run" />
                <span>Cerrar Sesion</span>
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Nav>

        {/* Collapse */}
        <Collapse navbar isOpen={collapseOpen}>
          {/* Collapse header (mobile) */}
          <div className="navbar-collapse-header d-md-none">
            <Row>
              {logo && (
                <Col xs="6" className="collapse-brand">
                  {logo.innerLink ? (
                    <Link to={logo.innerLink}>
                      <img alt={logo.imgAlt} src={logo.imgSrc} />
                    </Link>
                  ) : (
                    <a href={logo.outterLink}>
                      <img alt={logo.imgAlt} src={logo.imgSrc} />
                    </a>
                  )}
                </Col>
              )}
              <Col xs="6" className="collapse-close">
                <button
                  className="navbar-toggler"
                  type="button"
                  onClick={toggleCollapse}
                >
                  <span />
                  <span />
                </button>
              </Col>
            </Row>
          </div>

          {/* Search form (mobile) */}
          <Form className="mt-4 mb-3 d-md-none">
            <InputGroup className="input-group-rounded input-group-merge">
              <Input placeholder="Buscar" type="search" />
              <InputGroupText>
                <i className="fa fa-search" />
              </InputGroupText>
            </InputGroup>
          </Form>

          {/* Quick Access label */}
          <div className="text-muted px-3 mt-4 mb-2 text-uppercase">
            Acceso rápido
          </div>
          <hr className="my-2" />

          {/* Navigation links */}
          <Nav navbar>{createLinks(routes)}</Nav>
        </Collapse>
      </Container>
    </Navbar>
  );
};

Sidebar.defaultProps = { routes: [{}] };

Sidebar.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.object),
  logo: PropTypes.shape({
    innerLink: PropTypes.string,
    outterLink: PropTypes.string,
    imgSrc: PropTypes.string.isRequired,
    imgAlt: PropTypes.string.isRequired,
  }),
  location: PropTypes.object,
  usuario: PropTypes.object,
};

export default Sidebar;

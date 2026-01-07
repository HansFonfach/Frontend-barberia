import {
  useLocation,
  NavLink as NavLinkRRD,
  Link,
  useNavigate,
} from "react-router-dom";
import { useState } from "react";
import PropTypes from "prop-types";
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
  Container,
  Row,
  Col,
  Media,
} from "reactstrap";
import { useAuth } from "context/AuthContext";

/* =======================
   CONFIG SECCIONES
======================= */
const sectionTitles = {
  principal: "Principal",
  reservas: "Reservas",
  gestion: "Gestión",
  otros: "Otros",
};

const Sidebar = ({ routes, logo, usuario }) => {
  const [collapseOpen, setCollapseOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const toggleCollapse = () => setCollapseOpen(!collapseOpen);
  const closeCollapse = () => setCollapseOpen(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/auth/login");
  };

  const activeRoute = (route) =>
    location.pathname.indexOf(route) > -1 ? "active" : "";

  /* =======================
     LINKS AGRUPADOS
  ======================= */
  const renderGroupedLinks = (routes) => {
    const grouped = routes
      .filter((r) => !r.invisible)
      .reduce((acc, route) => {
        const section = route.section || "otros";
        if (!acc[section]) acc[section] = [];
        acc[section].push(route);
        return acc;
      }, {});

    return Object.keys(grouped).map((sectionKey) => (
      <div key={sectionKey} className="sidebar-section">
        <div className="sidebar-section-title">
          {sectionTitles[sectionKey] || sectionKey}
        </div>

        <Nav navbar>
          {grouped[sectionKey].map((r, idx) => (
            <NavItem key={idx}>
              <NavLink
                to={r.layout + r.path}
                tag={NavLinkRRD}
                onClick={closeCollapse}
                className={`sidebar-link ${activeRoute(
                  r.layout + r.path
                )}`}
              >
                {r.icon && typeof r.icon !== "string" ? (
                  r.icon
                ) : (
                  <i className={`${r.icon} sidebar-icon`} />
                )}
                <span>{r.name}</span>
              </NavLink>
            </NavItem>
          ))}
        </Nav>
      </div>
    ));
  };

  return (
    <>
      {/* =======================
           CSS EMBEBIDO
      ======================= */}
      <style>{`
        .sidebar-link {
          padding: 0.65rem 1.25rem;
          margin: 3px 12px;
          border-radius: 0.45rem;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.95rem;
          color: #525f7f !important;
          transition: all 0.2s ease;
        }

        .sidebar-link:hover {
          background: rgba(0,0,0,0.04);
          transform: translateX(2px);
        }

        .sidebar-link.active {
          background: rgba(0,0,0,0.08);
          font-weight: 600;
          color: #000 !important;
        }

        .sidebar-icon {
          font-size: 0.95rem;
          min-width: 18px;
          text-align: center;
        }

        .sidebar-section {
          margin-bottom: 1rem;
        }

        .sidebar-section-title {
          padding: 0.75rem 1.25rem 0.35rem;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #8898aa;
          text-transform: uppercase;
        }

        .logo-sidebar-custom {
          max-width: 180px;
          margin: 1rem auto;
          display: block;
        }
      `}</style>

      {/* =======================
           SIDEBAR
      ======================= */}
      <Navbar
        className="navbar-vertical fixed-left navbar-light bg-white"
        expand="md"
        id="sidenav-main"
      >
        <Container fluid>
          {/* TOGGLER */}
          <button
            className="navbar-toggler"
            type="button"
            onClick={toggleCollapse}
          >
            <span className="navbar-toggler-icon" />
          </button>

          {/* LOGO */}
          <Link to={logo?.innerLink || "/admin"}>
            <img
              src={logo.imgSrc}
              alt={logo.imgAlt}
              className="logo-sidebar-custom"
            />
          </Link>

          {/* USUARIO MOBILE */}
          <Nav className="align-items-center d-md-none">
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
              <DropdownMenu right>
                <DropdownItem header>
                  Bienvenido {usuario?.nombre}
                </DropdownItem>
                <DropdownItem to="/admin/perfil" tag={Link}>
                  Perfil
                </DropdownItem>
                <DropdownItem to="/admin/cambiar-contrasena" tag={Link}>
                  Cambiar contraseña
                </DropdownItem>
                <DropdownItem onClick={handleLogout}>
                  Cerrar sesión
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>

          {/* COLLAPSE */}
          <Collapse navbar isOpen={collapseOpen}>
            {/* SEARCH MOBILE */}
            <Form className="mt-4 mb-3 d-md-none">
              <InputGroup className="input-group-rounded input-group-merge">
                <Input placeholder="Buscar" type="search" />
                <InputGroupText>
                  <i className="fa fa-search" />
                </InputGroupText>
              </InputGroup>
            </Form>

            {/* LINKS */}
            {renderGroupedLinks(routes)}
          </Collapse>
        </Container>
      </Navbar>
    </>
  );
};

Sidebar.propTypes = {
  routes: PropTypes.array,
  logo: PropTypes.object,
  usuario: PropTypes.object,
};

export default Sidebar;

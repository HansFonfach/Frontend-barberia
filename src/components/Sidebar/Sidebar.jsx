import {
  useLocation,
  NavLink as NavLinkRRD,
  Link,
  useNavigate,
} from "react-router-dom";
import { useParams } from "react-router-dom";
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
  const { signOut, user } = useAuth();
  const { slug } = useParams();

  const toggleCollapse = () => setCollapseOpen(!collapseOpen);
  const closeCollapse = () => setCollapseOpen(false);
  const [submenuAbierto, setSubmenuAbierto] = useState(null);
  const toggleSubmenu = (name) =>
    setSubmenuAbierto(submenuAbierto === name ? null : name);

  const handleLogout = async () => {
    const slug = user?.empresa?.slug;

    await signOut();

    if (slug) {
      navigate(`/${slug}/login`);
    } else {
      navigate("/"); // fallback de seguridad
    }
  };

  // Antes era location.pathname.indexOf(route) > -1 ("contiene"), lo que
  // marcaba como activas dos rutas cuando una era prefijo de la otra
  // (ej: /gestion-feriados y /gestion-feriados-equipo). Cada link ya
  // recibe su ruta final completa, así que comparar por igualdad exacta
  // es correcto y evita ese falso positivo.
  const activeRoute = (route) =>
    location.pathname === route ? "active" : "";

  /* =======================
     LINKS AGRUPADOS
     Las rutas llegan ya filtradas desde AdminLayout
     (permisos + excludeSlugs + invisible). Acá solo se pintan.
  ======================= */
  const renderGroupedLinks = (routes) => {
    const grouped = routes.reduce((acc, route) => {
      const section = route.section || "otros";
      if (!acc[section]) acc[section] = [];
      acc[section].push(route);
      return acc;
    }, {});

    const sectionKeys = Object.keys(grouped);

    return sectionKeys.map((sectionKey, sectionIdx) => (
      <div
        key={sectionKey}
        className={`sidebar-section${sectionIdx > 0 ? " sidebar-section-divider" : ""}`}
      >
        <div className="sidebar-section-title">
          {sectionTitles[sectionKey] || sectionKey}
        </div>

        <Nav navbar>
          {grouped[sectionKey].map((r, idx) =>
            r.children ? (
              // ── con submenu ──
              <NavItem key={idx}>
                <div
                  className="sidebar-link"
                  style={{ cursor: "pointer" }}
                  onClick={() => toggleSubmenu(r.name)}
                >
                  <span className="sidebar-icon-wrap">
                    {r.icon && typeof r.icon !== "string" ? (
                      r.icon
                    ) : (
                      <i className={`${r.icon} sidebar-icon`} />
                    )}
                  </span>
                  <span style={{ flex: 1 }}>{r.name}</span>
                  <i
                    className={`fas fa-chevron-${submenuAbierto === r.name ? "up" : "down"}`}
                    style={{ fontSize: 10, color: "#aaa" }}
                  />
                </div>

                {submenuAbierto === r.name && (
                  <Nav navbar style={{ paddingLeft: 16 }}>
                    {r.children.map((child, cidx) => (
                      <NavItem key={cidx}>
                        <NavLink
                          to={`/${slug}${child.layout}${child.path}`}
                          tag={NavLinkRRD}
                          onClick={closeCollapse}
                          className={`sidebar-link ${activeRoute(`/${slug}${child.layout}${child.path}`)}`}
                          style={{ fontSize: "0.88rem" }}
                        >
                          {child.icon && (
                            <i className={`${child.icon} sidebar-icon`} />
                          )}
                          <span>{child.name}</span>
                        </NavLink>
                      </NavItem>
                    ))}
                  </Nav>
                )}
              </NavItem>
            ) : (
              // ── sin submenu ──
              <NavItem key={idx}>
                <NavLink
                  to={`/${slug}${r.layout}${r.path}`}
                  tag={NavLinkRRD}
                  onClick={closeCollapse}
                  className={`sidebar-link ${activeRoute(`/${slug}${r.layout}${r.path}`)}`}
                >
                  <span className="sidebar-icon-wrap">
                    {r.icon && typeof r.icon !== "string" ? (
                      r.icon
                    ) : (
                      <i className={`${r.icon} sidebar-icon`} />
                    )}
                  </span>
                  <span>{r.name}</span>
                </NavLink>
              </NavItem>
            ),
          )}
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

        .sidebar-submenu-link {
  padding-left: 2rem;
  font-size: 0.88rem;
}
        .sidebar-icon {
          font-size: 0.95rem;
          min-width: 18px;
          text-align: center;
        }

        .sidebar-icon-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          flex-shrink: 0;
        }

        .sidebar-icon-wrap svg {
          width: 16px;
          height: 16px;
        }

        .sidebar-section {
          margin-bottom: 0.5rem;
        }

        .sidebar-section-divider {
          border-top: 1px solid #eef1f5;
          margin-top: 0.5rem;
          padding-top: 0.35rem;
        }

        .sidebar-section-title {
          padding: 0.6rem 1.25rem 0.4rem;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #8898aa;
          text-transform: uppercase;
        }

        .logo-sidebar-custom {
          max-width: 128px;
          margin: 0.85rem auto 0.75rem;
          display: block;
        }

        .logo-row-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0.9rem 1.25rem 0.6rem;
          text-decoration: none !important;
        }

        .logo-mark {
          width: 26px;
          height: 26px;
          border-radius: 7px;
          flex-shrink: 0;
          background: linear-gradient(135deg, #4361ee, #3a0ca3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 12px;
          font-weight: 800;
        }

        .logo-word {
          font-size: 13.5px;
          font-weight: 800;
          color: #1a1a2e;
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
          <Link
            to={`/${slug}${logo?.innerLink || "/admin"}`}
            className="logo-row-link"
          >
            <div className="logo-mark">A</div>
            <div className="logo-word">AgendaFonfach</div>
          </Link>

          {/* USUARIO MOBILE */}
          <Nav className="align-items-center d-md-none">
            <UncontrolledDropdown nav>
              <DropdownToggle nav>
                <Media className="align-items-center">
                  <span className="avatar avatar-sm rounded-circle d-flex align-items-center justify-content-center bg-primary text-white fw-bold">
                    {usuario?.nombre && usuario?.apellido
                      ? `${usuario.nombre[0]}${usuario.apellido[0]}`.toUpperCase()
                      : user?.nombre
                        ? user.nombre.substring(0, 2).toUpperCase()
                        : "U"}
                  </span>
                </Media>
              </DropdownToggle>

              <DropdownMenu right>
                <DropdownItem header className="text-dark fw-bold">
                  Bienvenido {usuario?.nombre || user?.nombre}
                </DropdownItem>

                <DropdownItem to={`/${slug}/admin/perfil`} tag={Link}>
                  Perfil
                </DropdownItem>

                <DropdownItem
                  to={`/${slug}/admin/cambiar-contrasena`}
                  tag={Link}
                >
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
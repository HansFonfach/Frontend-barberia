import React, { useState, useEffect } from "react";
import {
  Container, Row, Col, Card, CardBody, Button, Input, FormGroup, Label, Badge
} from "reactstrap";
import UserHeader from "components/Headers/UserHeader.js";
import { useEmpresa } from "context/EmpresaContext";
import Swal from "sweetalert2";
import {
  Building2, Globe, Phone, Mail, MapPin, Instagram, Facebook,
  Youtube, Palette, CreditCard, Calendar, Bell, Save, CheckCircle,
  ChevronRight, DollarSign, Percent, Settings
} from "lucide-react";

// ─── Tab Button ───────────────────────────────────────────────────────────────
const TabBtn = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "10px 18px", borderRadius: 10, border: "none", cursor: "pointer",
      background: active ? "#5e72e4" : "transparent",
      color: active ? "#fff" : "#525f7f",
      fontWeight: active ? 600 : 400,
      fontSize: "0.88rem", transition: "all 0.2s ease",
      whiteSpace: "nowrap",
    }}
  >
    {icon}
    {label}
  </button>
);

// ─── Field ────────────────────────────────────────────────────────────────────
const Field = ({ label, children, hint }) => (
  <FormGroup className="mb-3">
    <Label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#525f7f", textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {label}
    </Label>
    {children}
    {hint && <small className="text-muted d-block mt-1">{hint}</small>}
  </FormGroup>
);

// ─── SectionTitle ─────────────────────────────────────────────────────────────
const SectionTitle = ({ icon, title }) => (
  <div className="d-flex align-items-center mb-4" style={{ gap: 10 }}>
    <div style={{ background: "#f0f2ff", borderRadius: 10, padding: "8px 10px", color: "#5e72e4" }}>
      {icon}
    </div>
    <h5 className="mb-0 font-weight-bold" style={{ color: "#172b4d" }}>{title}</h5>
  </div>
);

// ─── ColorPicker ──────────────────────────────────────────────────────────────
const ColorField = ({ label, value, onChange }) => (
  <FormGroup className="mb-3">
    <Label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#525f7f", textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {label}
    </Label>
    <div className="d-flex align-items-center" style={{ gap: 10 }}>
      <input
        type="color"
        value={value || "#5e72e4"}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: 40, height: 38, borderRadius: 8, border: "1px solid #e9ecef", cursor: "pointer", padding: 2 }}
      />
      <Input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#5e72e4"
        style={{ borderRadius: 8, fontSize: "0.9rem" }}
      />
    </div>
  </FormGroup>
);

// ─── Toggle ───────────────────────────────────────────────────────────────────
const Toggle = ({ label, hint, checked, onChange }) => (
  <div className="d-flex align-items-center justify-content-between p-3 mb-3"
    style={{ background: "#f8f9fa", borderRadius: 12, border: "1px solid #e9ecef" }}>
    <div>
      <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#172b4d" }}>{label}</div>
      {hint && <small className="text-muted">{hint}</small>}
    </div>
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 46, height: 26, borderRadius: 13,
        background: checked ? "#2dce89" : "#dee2e6",
        cursor: "pointer", position: "relative", transition: "background 0.2s ease",
        flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", top: 3,
        left: checked ? 23 : 3,
        width: 20, height: 20, borderRadius: "50%",
        background: "#fff", transition: "left 0.2s ease",
        boxShadow: "0 1px 4px rgba(0,0,0,.2)",
      }} />
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ConfiguracionEmpresa = () => {
  const { empresa, actualizarEmpresa, guardando } = useEmpresa();
  const [tab, setTab] = useState("general");
  const [form, setForm] = useState(null);

  // Inicializar form con datos de empresa
  useEffect(() => {
    if (!empresa) return;
    setForm({
      nombre: empresa.nombre || "",
      descripcion: empresa.descripcion || "",
      direccion: empresa.direccion || "",
      telefono: empresa.telefono || "",
      correo: empresa.correo || "",
      sitioWeb: empresa.sitioWeb || "",
      redes: {
        instagram: empresa.redes?.instagram || "",
        facebook: empresa.redes?.facebook || "",
        tiktok: empresa.redes?.tiktok || "",
        youtube: empresa.redes?.youtube || "",
      },
      colores: {
        primario: empresa.colores?.primario || "#5e72e4",
        secundario: empresa.colores?.secundario || "#2dce89",
        fondo: empresa.colores?.fondo || "#FFFFFF",
        texto: empresa.colores?.texto || "#172b4d",
        textoMuted: empresa.colores?.textoMuted || "#8898aa",
        heroBg: empresa.colores?.heroBg || "",
      },
      configuracion: {
        mostrarLogo: empresa.configuracion?.mostrarLogo ?? true,
        mostrarEstadisticas: empresa.configuracion?.mostrarEstadisticas ?? true,
        tipoHero: empresa.configuracion?.tipoHero || "centrado",
      },
      pagos: {
        requiereAbono: empresa.pagos?.requiereAbono ?? false,
        tipoAbono: empresa.pagos?.tipoAbono || "fijo",
        montoAbonoFijo: empresa.pagos?.montoAbonoFijo || 0,
        porcentajeAbono: empresa.pagos?.porcentajeAbono || 0,
        transferencia: {
          banco: empresa.pagos?.transferencia?.banco || "",
          tipoCuenta: empresa.pagos?.transferencia?.tipoCuenta || "",
          numeroCuenta: empresa.pagos?.transferencia?.numeroCuenta || "",
          titular: empresa.pagos?.transferencia?.titular || "",
          rut: empresa.pagos?.transferencia?.rut || "",
          correo: empresa.pagos?.transferencia?.correo || "",
        },
      },
      diasMostradosCalendario: empresa.diasMostradosCalendario || 15,
      envioNotificacionReserva: empresa.envioNotificacionReserva ?? false,
    });
  }, [empresa]);

  const set = (path, value) => {
    setForm((prev) => {
      const keys = path.split(".");
      const next = { ...prev };
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleGuardar = async () => {
    try {
      await actualizarEmpresa(form);
      Swal.fire({
        title: "✅ Guardado",
        text: "Los cambios fueron guardados correctamente.",
        icon: "success",
        confirmButtonColor: "#5e72e4",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire("Error", error?.response?.data?.message || "No se pudo guardar", "error");
    }
  };

  const tabs = [
    { key: "general", label: "General", icon: <Building2 size={15} /> },
    { key: "redes", label: "Redes sociales", icon: <Globe size={15} /> },
    { key: "apariencia", label: "Apariencia", icon: <Palette size={15} /> },
    { key: "pagos", label: "Pagos", icon: <CreditCard size={15} /> },
    { key: "reservas", label: "Reservas", icon: <Calendar size={15} /> },
  ];

  if (!form) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
      <div className="spinner-border text-primary" />
    </div>
  );

  return (
    <>
      <UserHeader />
      <Container className="mt--7 mb-5" fluid>
        <Row className="justify-content-center">
          <Col lg="10">

            {/* Header */}
            <Card className="shadow-lg border-0 mb-4 overflow-hidden">
              <div style={{ background: "linear-gradient(135deg, #5e72e4 0%, #825ee4 100%)", padding: "28px 32px" }}>
                <div className="d-flex align-items-center justify-content-between flex-wrap" style={{ gap: 12 }}>
                  <div className="d-flex align-items-center" style={{ gap: 14 }}>
                    <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 12, padding: 10 }}>
                      <Settings size={26} color="#fff" />
                    </div>
                    <div>
                      <h2 className="text-white font-weight-bold mb-0">Configuración de empresa</h2>
                      <p className="mb-0" style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.9rem" }}>
                        {empresa?.nombre} · Edita tus datos sin esperar
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleGuardar}
                    disabled={guardando}
                    style={{
                      background: "#fff", color: "#5e72e4", border: "none",
                      borderRadius: 10, fontWeight: 700, padding: "10px 24px",
                      display: "flex", alignItems: "center", gap: 8,
                    }}
                  >
                    {guardando ? (
                      <><span className="spinner-border spinner-border-sm" /> Guardando...</>
                    ) : (
                      <><Save size={16} /> Guardar cambios</>
                    )}
                  </Button>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ padding: "12px 20px", borderBottom: "1px solid #e9ecef", overflowX: "auto" }}>
                <div className="d-flex" style={{ gap: 4 }}>
                  {tabs.map((t) => (
                    <TabBtn key={t.key} active={tab === t.key} onClick={() => setTab(t.key)} icon={t.icon} label={t.label} />
                  ))}
                </div>
              </div>
            </Card>

            {/* Content */}
            <Card className="shadow border-0">
              <CardBody className="p-4 p-lg-5">

                {/* ── GENERAL ── */}
                {tab === "general" && (
                  <>
                    <SectionTitle icon={<Building2 size={18} />} title="Información general" />
                    <Row>
                      <Col md={6}>
                        <Field label="Nombre de la empresa">
                          <Input value={form.nombre} onChange={(e) => set("nombre", e.target.value)}
                            style={{ borderRadius: 8 }} />
                        </Field>
                      </Col>
                      <Col md={6}>
                        <Field label="Correo de contacto">
                          <div className="input-group">
                            <span className="input-group-text" style={{ borderRadius: "8px 0 0 8px", background: "#f8f9fa" }}>
                              <Mail size={15} color="#8898aa" />
                            </span>
                            <Input value={form.correo} onChange={(e) => set("correo", e.target.value)}
                              style={{ borderRadius: "0 8px 8px 0" }} />
                          </div>
                        </Field>
                      </Col>
                      <Col md={6}>
                        <Field label="Teléfono">
                          <div className="input-group">
                            <span className="input-group-text" style={{ borderRadius: "8px 0 0 8px", background: "#f8f9fa" }}>
                              <Phone size={15} color="#8898aa" />
                            </span>
                            <Input value={form.telefono} onChange={(e) => set("telefono", e.target.value)}
                              style={{ borderRadius: "0 8px 8px 0" }} />
                          </div>
                        </Field>
                      </Col>
                      <Col md={6}>
                        <Field label="Dirección">
                          <div className="input-group">
                            <span className="input-group-text" style={{ borderRadius: "8px 0 0 8px", background: "#f8f9fa" }}>
                              <MapPin size={15} color="#8898aa" />
                            </span>
                            <Input value={form.direccion} onChange={(e) => set("direccion", e.target.value)}
                              style={{ borderRadius: "0 8px 8px 0" }} />
                          </div>
                        </Field>
                      </Col>
                      <Col md={12}>
                        <Field label="Descripción" hint="Se muestra en tu página pública">
                          <Input type="textarea" rows={3} value={form.descripcion}
                            onChange={(e) => set("descripcion", e.target.value)}
                            style={{ borderRadius: 8, resize: "vertical" }} />
                        </Field>
                      </Col>
                    </Row>
                  </>
                )}

                {/* ── REDES ── */}
                {tab === "redes" && (
                  <>
                    <SectionTitle icon={<Globe size={18} />} title="Redes sociales" />
                    {[
                      { key: "instagram", label: "Instagram", icon: <Instagram size={15} />, placeholder: "@tuempresa" },
                      { key: "facebook", label: "Facebook", icon: <Facebook size={15} />, placeholder: "facebook.com/tuempresa" },
                      { key: "tiktok", label: "TikTok", icon: <span style={{ fontSize: 13 }}>TT</span>, placeholder: "@tuempresa" },
                      { key: "youtube", label: "YouTube", icon: <Youtube size={15} />, placeholder: "youtube.com/tucanal" },
                    ].map(({ key, label, icon, placeholder }) => (
                      <Field key={key} label={label}>
                        <div className="input-group">
                          <span className="input-group-text" style={{ borderRadius: "8px 0 0 8px", background: "#f8f9fa", color: "#8898aa" }}>
                            {icon}
                          </span>
                          <Input
                            placeholder={placeholder}
                            value={form.redes[key]}
                            onChange={(e) => set(`redes.${key}`, e.target.value)}
                            style={{ borderRadius: "0 8px 8px 0" }}
                          />
                        </div>
                      </Field>
                    ))}
                  </>
                )}

                {/* ── APARIENCIA ── */}
                {tab === "apariencia" && (
                  <>
                    <SectionTitle icon={<Palette size={18} />} title="Colores y apariencia" />
                    <Row>
                      <Col md={6}>
                        <ColorField label="Color primario" value={form.colores.primario} onChange={(v) => set("colores.primario", v)} />
                      </Col>
                      <Col md={6}>
                        <ColorField label="Color secundario" value={form.colores.secundario} onChange={(v) => set("colores.secundario", v)} />
                      </Col>
                      <Col md={6}>
                        <ColorField label="Color de fondo" value={form.colores.fondo} onChange={(v) => set("colores.fondo", v)} />
                      </Col>
                      <Col md={6}>
                        <ColorField label="Color de texto" value={form.colores.texto} onChange={(v) => set("colores.texto", v)} />
                      </Col>
                      <Col md={12}>
                        <Field label="Fondo del hero" hint="Puede ser un color o un gradiente CSS, ej: linear-gradient(135deg, #f5f5f5, #fff)">
                          <Input value={form.colores.heroBg} onChange={(e) => set("colores.heroBg", e.target.value)}
                            placeholder="linear-gradient(135deg, #f5f5f5, #fff)"
                            style={{ borderRadius: 8 }} />
                        </Field>
                      </Col>
                    </Row>

                    <hr className="my-4" />
                    <SectionTitle icon={<Settings size={18} />} title="Layout del hero" />
                    <div className="d-flex" style={{ gap: 12, flexWrap: "wrap" }}>
                      {["centrado", "split", "minimal"].map((tipo) => (
                        <div
                          key={tipo}
                          onClick={() => set("configuracion.tipoHero", tipo)}
                          style={{
                            padding: "12px 24px", borderRadius: 10, cursor: "pointer",
                            border: form.configuracion.tipoHero === tipo ? "2px solid #5e72e4" : "2px solid #e9ecef",
                            background: form.configuracion.tipoHero === tipo ? "#f0f2ff" : "#fff",
                            color: form.configuracion.tipoHero === tipo ? "#5e72e4" : "#525f7f",
                            fontWeight: form.configuracion.tipoHero === tipo ? 700 : 400,
                            textTransform: "capitalize", fontSize: "0.9rem",
                            transition: "all 0.2s ease",
                          }}
                        >
                          {form.configuracion.tipoHero === tipo && <CheckCircle size={14} className="me-2" />}
                          {tipo}
                        </div>
                      ))}
                    </div>

                    <hr className="my-4" />
                    <Toggle
                      label="Mostrar logo"
                      hint="Muestra el logo en la página pública"
                      checked={form.configuracion.mostrarLogo}
                      onChange={(v) => set("configuracion.mostrarLogo", v)}
                    />
                    <Toggle
                      label="Mostrar estadísticas"
                      hint="Muestra contadores de reservas y clientes"
                      checked={form.configuracion.mostrarEstadisticas}
                      onChange={(v) => set("configuracion.mostrarEstadisticas", v)}
                    />
                  </>
                )}

                {/* ── PAGOS ── */}
                {tab === "pagos" && (
                  <>
                    <SectionTitle icon={<CreditCard size={18} />} title="Configuración de abono" />
                    <Toggle
                      label="Requerir abono al reservar"
                      hint="El cliente debe pagar un abono para confirmar la reserva"
                      checked={form.pagos.requiereAbono}
                      onChange={(v) => set("pagos.requiereAbono", v)}
                    />

                    {form.pagos.requiereAbono && (
                      <>
                        {/* Tipo abono */}
                        <Field label="Tipo de abono">
                          <div className="d-flex" style={{ gap: 10 }}>
                            {[
                              { value: "fijo", label: "Monto fijo", icon: <DollarSign size={14} /> },
                              { value: "porcentaje", label: "Porcentaje", icon: <Percent size={14} /> },
                            ].map(({ value, label, icon }) => (
                              <div
                                key={value}
                                onClick={() => set("pagos.tipoAbono", value)}
                                style={{
                                  flex: 1, padding: "12px 16px", borderRadius: 10,
                                  border: form.pagos.tipoAbono === value ? "2px solid #5e72e4" : "2px solid #e9ecef",
                                  background: form.pagos.tipoAbono === value ? "#f0f2ff" : "#fff",
                                  cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                                  color: form.pagos.tipoAbono === value ? "#5e72e4" : "#525f7f",
                                  fontWeight: form.pagos.tipoAbono === value ? 700 : 400,
                                  transition: "all 0.2s ease",
                                }}
                              >
                                {icon} {label}
                              </div>
                            ))}
                          </div>
                        </Field>

                        {form.pagos.tipoAbono === "fijo" ? (
                          <Field label="Monto fijo (CLP)">
                            <div className="input-group">
                              <span className="input-group-text" style={{ borderRadius: "8px 0 0 8px", background: "#f8f9fa" }}>$</span>
                              <Input type="number" value={form.pagos.montoAbonoFijo}
                                onChange={(e) => set("pagos.montoAbonoFijo", Number(e.target.value))}
                                style={{ borderRadius: "0 8px 8px 0" }} />
                            </div>
                          </Field>
                        ) : (
                          <Field label="Porcentaje del servicio">
                            <div className="input-group">
                              <Input type="number" min={1} max={100} value={form.pagos.porcentajeAbono}
                                onChange={(e) => set("pagos.porcentajeAbono", Number(e.target.value))}
                                style={{ borderRadius: "8px 0 0 8px" }} />
                              <span className="input-group-text" style={{ borderRadius: "0 8px 8px 0", background: "#f8f9fa" }}>%</span>
                            </div>
                          </Field>
                        )}

                        <hr className="my-4" />
                        <SectionTitle icon={<CreditCard size={18} />} title="Datos de transferencia" />
                        <Row>
                          {[
                            { key: "banco", label: "Banco", placeholder: "BancoEstado" },
                            { key: "tipoCuenta", label: "Tipo de cuenta", placeholder: "Cuenta RUT" },
                            { key: "numeroCuenta", label: "N° de cuenta", placeholder: "12345678" },
                            { key: "titular", label: "Titular", placeholder: "Nombre completo" },
                            { key: "rut", label: "RUT titular", placeholder: "12.345.678-9" },
                            { key: "correo", label: "Correo de pago", placeholder: "pagos@empresa.cl" },
                          ].map(({ key, label, placeholder }) => (
                            <Col md={6} key={key}>
                              <Field label={label}>
                                <Input placeholder={placeholder}
                                  value={form.pagos.transferencia[key]}
                                  onChange={(e) => set(`pagos.transferencia.${key}`, e.target.value)}
                                  style={{ borderRadius: 8 }} />
                              </Field>
                            </Col>
                          ))}
                        </Row>
                      </>
                    )}
                  </>
                )}

                {/* ── RESERVAS ── */}
                {tab === "reservas" && (
                  <>
                    <SectionTitle icon={<Calendar size={18} />} title="Configuración de reservas" />

                    <Field label="Días mostrados en el calendario"
                      hint="Cuántos días hacia adelante puede reservar un cliente">
                      <div className="d-flex align-items-center" style={{ gap: 12 }}>
                        <Input
                          type="range" min={7} max={60} step={1}
                          value={form.diasMostradosCalendario}
                          onChange={(e) => set("diasMostradosCalendario", Number(e.target.value))}
                          style={{ flex: 1 }}
                        />
                        <Badge color="primary" style={{ fontSize: "1rem", padding: "8px 16px", borderRadius: 8 }}>
                          {form.diasMostradosCalendario} días
                        </Badge>
                      </div>
                    </Field>

                    <hr className="my-4" />

                    <SectionTitle icon={<Bell size={18} />} title="Notificaciones" />
                    <Toggle
                      label="Notificar al profesional por nueva reserva"
                      hint="Envía un email al profesional cada vez que se agenda una hora"
                      checked={form.envioNotificacionReserva}
                      onChange={(v) => set("envioNotificacionReserva", v)}
                    />
                  </>
                )}

                {/* Botón guardar abajo */}
                <div className="d-flex justify-content-end mt-4">
                  <Button
                    onClick={handleGuardar}
                    disabled={guardando}
                    style={{
                      background: "linear-gradient(135deg, #5e72e4, #825ee4)",
                      border: "none", borderRadius: 10, fontWeight: 700,
                      padding: "12px 32px", color: "#fff",
                      display: "flex", alignItems: "center", gap: 8,
                    }}
                  >
                    {guardando ? (
                      <><span className="spinner-border spinner-border-sm" /> Guardando...</>
                    ) : (
                      <><Save size={16} /> Guardar cambios</>
                    )}
                  </Button>
                </div>

              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ConfiguracionEmpresa;

import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Input,
  FormGroup,
  Label,
  Badge,
} from "reactstrap";
import UserHeader from "components/Headers/UserHeader.js";
import { useEmpresa } from "context/EmpresaContext";
import Swal from "sweetalert2";
import axios from "axios";
import {
  Building2,
  Globe,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Youtube,
  Palette,
  CreditCard,
  Calendar,
  Bell,
  Save,
  CheckCircle,
  DollarSign,
  Percent,
  Settings,
  User,
  Camera,
  X,
  Clock,
  MessageSquare,
  ShieldCheck,
  Repeat,
  Upload,
  Eye,
} from "lucide-react";

// ─── Utilidad: oscurecer/aclarar color hex ────────────────────────────────────
function adjustColor(hex, amount) {
  if (!hex || !hex.startsWith("#")) return hex;
  let usePound = false;
  let col = hex;
  if (col[0] === "#") { col = col.slice(1); usePound = true; }
  const num = parseInt(col, 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00ff) + amount;
  let b = (num & 0x0000ff) + amount;
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return (usePound ? "#" : "") + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

// Convierte hex a rgba con opacidad
function hexToRgba(hex, alpha = 1) {
  if (!hex || !hex.startsWith("#")) return hex;
  const col = hex.replace("#", "");
  const r = parseInt(col.substring(0, 2), 16);
  const g = parseInt(col.substring(2, 4), 16);
  const b = parseInt(col.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ─── Hook: aplica colores al :root en tiempo real ─────────────────────────────
function useThemeLive(colores, configuracion) {
  useEffect(() => {
    if (!colores) return;
    const root = document.documentElement;

    const primario   = colores.primario   || "#5e72e4";
    const secundario = colores.secundario || "#2dce89";
    const fondo      = colores.fondo      || "#ffffff";
    const texto      = colores.texto      || "#172b4d";
    const muted      = colores.textoMuted || "#8898aa";

    root.style.setProperty("--color-primary",       primario);
    root.style.setProperty("--color-primary-dark",  adjustColor(primario, -30));
    root.style.setProperty("--color-primary-light", hexToRgba(primario, 0.1));
    root.style.setProperty("--color-secondary",     secundario);
    root.style.setProperty("--color-background",    fondo);
    root.style.setProperty("--color-text",          texto);
    root.style.setProperty("--color-muted",         muted);

    // Argon específico
    root.style.setProperty("--primary", primario);

    if (configuracion?.borderRadius) {
      root.style.setProperty("--border-radius", configuracion.borderRadius);
    }
    if (configuracion?.fuente && configuracion.fuente !== "default") {
      root.style.setProperty("--font-family-base", configuracion.fuente);
    }
  }, [colores, configuracion]);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TabBtn = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "10px 18px",
      borderRadius: 10,
      border: "none",
      cursor: "pointer",
      background: active ? "var(--color-primary)" : "transparent",
      color: active ? "#fff" : "#525f7f",
      fontWeight: active ? 600 : 400,
      fontSize: "0.88rem",
      transition: "all 0.2s ease",
      whiteSpace: "nowrap",
    }}
  >
    {icon}
    {label}
  </button>
);

const Field = ({ label, children, hint }) => (
  <FormGroup className="mb-3">
    <Label
      style={{
        fontSize: "0.82rem",
        fontWeight: 600,
        color: "#525f7f",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {label}
    </Label>
    {children}
    {hint && <small className="text-muted d-block mt-1">{hint}</small>}
  </FormGroup>
);

const SectionTitle = ({ icon, title }) => (
  <div className="d-flex align-items-center mb-4" style={{ gap: 10 }}>
    <div
      style={{
        background: "var(--color-primary-light)",
        borderRadius: 10,
        padding: "8px 10px",
        color: "var(--color-primary)",
      }}
    >
      {icon}
    </div>
    <h5 className="mb-0 font-weight-bold" style={{ color: "var(--color-text)" }}>
      {title}
    </h5>
  </div>
);

const ColorField = ({ label, value, onChange }) => (
  <FormGroup className="mb-3">
    <Label
      style={{
        fontSize: "0.82rem",
        fontWeight: 600,
        color: "#525f7f",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {label}
    </Label>
    <div className="d-flex align-items-center" style={{ gap: 10 }}>
      <input
        type="color"
        value={value || "#5e72e4"}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: 40,
          height: 38,
          borderRadius: 8,
          border: "1px solid #e9ecef",
          cursor: "pointer",
          padding: 2,
        }}
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

const Toggle = ({ label, hint, checked, onChange }) => (
  <div
    className="d-flex align-items-center justify-content-between p-3 mb-3"
    style={{
      background: "#f8f9fa",
      borderRadius: 12,
      border: "1px solid #e9ecef",
    }}
  >
    <div>
      <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-text)" }}>
        {label}
      </div>
      {hint && <small className="text-muted">{hint}</small>}
    </div>
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 46,
        height: 26,
        borderRadius: 13,
        background: checked ? "var(--color-primary)" : "#dee2e6",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.2s ease",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 23 : 3,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s ease",
          boxShadow: "0 1px 4px rgba(0,0,0,.2)",
        }}
      />
    </div>
  </div>
);

// ─── Vista previa de colores + elementos UI ───────────────────────────────────
const ColorPreview = ({ colores }) => (
  <div
    className="mb-4 p-4"
    style={{
      background: "#f8f9fa",
      borderRadius: 14,
      border: "1px solid #e9ecef",
    }}
  >
    <div className="d-flex align-items-center mb-3" style={{ gap: 8 }}>
      <Eye size={14} color="#525f7f" />
      <small style={{ fontWeight: 700, color: "#525f7f", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Vista previa en tiempo real
      </small>
    </div>

    {/* Paleta de colores */}
    <div className="d-flex align-items-center mb-4" style={{ gap: 10, flexWrap: "wrap" }}>
      {[
        { color: colores.primario,   title: "Primario" },
        { color: colores.secundario, title: "Secundario" },
        { color: colores.fondo,      title: "Fondo" },
        { color: colores.texto,      title: "Texto" },
        { color: colores.textoMuted, title: "Muted" },
      ].map(({ color, title }) => (
        <div key={title} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: color,
              border: "2px solid rgba(0,0,0,0.08)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          />
          <small style={{ fontSize: "0.65rem", color: "#8898aa", fontWeight: 600 }}>{title}</small>
          <small style={{ fontSize: "0.6rem", color: "#adb5bd" }}>{color}</small>
        </div>
      ))}
      {colores.heroBg && (
        <div style={{ flex: 1, minWidth: 120, display: "flex", flexDirection: "column", alignItems: "stretch", gap: 4 }}>
          <div style={{ height: 40, borderRadius: 10, background: colores.heroBg, border: "2px solid rgba(0,0,0,0.08)" }} />
          <small style={{ fontSize: "0.65rem", color: "#8898aa", textAlign: "center", fontWeight: 600 }}>Hero BG</small>
        </div>
      )}
    </div>

    {/* Preview de elementos UI */}
    <div
      style={{
        background: colores.fondo || "#fff",
        borderRadius: 12,
        padding: 16,
        border: "1px solid #e9ecef",
      }}
    >
      <p style={{ fontSize: "0.75rem", color: "#8898aa", fontWeight: 600, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Elementos con tus colores
      </p>
      <div className="d-flex align-items-center flex-wrap" style={{ gap: 10 }}>
        {/* Botón primario */}
        <button
          style={{
            background: `linear-gradient(135deg, ${colores.primario}, ${adjustColor(colores.primario || "#5e72e4", -30)})`,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 18px",
            fontWeight: 600,
            fontSize: "0.85rem",
            cursor: "default",
            boxShadow: `0 4px 12px ${hexToRgba(colores.primario || "#5e72e4", 0.35)}`,
          }}
        >
          Botón principal
        </button>

        {/* Botón secundario */}
        <button
          style={{
            background: colores.secundario || "#2dce89",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 18px",
            fontWeight: 600,
            fontSize: "0.85rem",
            cursor: "default",
          }}
        >
          Secundario
        </button>

        {/* Botón outline */}
        <button
          style={{
            background: "transparent",
            color: colores.primario || "#5e72e4",
            border: `2px solid ${colores.primario || "#5e72e4"}`,
            borderRadius: 8,
            padding: "6px 16px",
            fontWeight: 600,
            fontSize: "0.85rem",
            cursor: "default",
          }}
        >
          Outline
        </button>

        {/* Badge */}
        <span
          style={{
            background: hexToRgba(colores.primario || "#5e72e4", 0.12),
            color: colores.primario || "#5e72e4",
            borderRadius: 20,
            padding: "4px 12px",
            fontSize: "0.75rem",
            fontWeight: 700,
          }}
        >
          Badge
        </span>

        {/* Link */}
        <span style={{ color: colores.primario || "#5e72e4", fontSize: "0.85rem", fontWeight: 600, cursor: "default", textDecoration: "underline" }}>
          Enlace
        </span>
      </div>

      {/* Mini card preview */}
      <div
        style={{
          marginTop: 12,
          background: "#fff",
          borderRadius: 10,
          padding: "12px 16px",
          border: `1px solid ${hexToRgba(colores.primario || "#5e72e4", 0.2)}`,
          borderLeft: `4px solid ${colores.primario || "#5e72e4"}`,
        }}
      >
        <p style={{ margin: 0, fontWeight: 700, fontSize: "0.85rem", color: colores.texto || "#172b4d" }}>
          Tarjeta de ejemplo
        </p>
        <p style={{ margin: 0, fontSize: "0.78rem", color: colores.textoMuted || "#8898aa" }}>
          Así se verá el texto secundario en tu dashboard
        </p>
      </div>
    </div>
  </div>
);

// ─── Logo Uploader ─────────────────────────────────────────────────────────────
const LogoUploader = ({ logoUrl, onUpload, uploading }) => {
  const inputRef = useRef();
  return (
    <div className="mb-4">
      <Label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#525f7f", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>
        Logo de la empresa
      </Label>
      <div className="d-flex align-items-center" style={{ gap: 16 }}>
        <div
          style={{
            width: 90, height: 90, borderRadius: 14,
            border: "2px dashed #dee2e6", background: "#f8f9fa",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", position: "relative", flexShrink: 0,
          }}
        >
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} />
          ) : (
            <Camera size={28} color="#dee2e6" />
          )}
        </div>
        <div>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => onUpload(e.target.files[0])} />
          <Button
            onClick={() => inputRef.current.click()}
            disabled={uploading}
            style={{
              background: "var(--color-primary)", color: "#fff", border: "none",
              borderRadius: 9, fontWeight: 600, padding: "9px 20px",
              display: "flex", alignItems: "center", gap: 8, fontSize: "0.88rem", marginBottom: 8,
            }}
          >
            {uploading ? <><span className="spinner-border spinner-border-sm" /> Subiendo...</> : <><Upload size={14} /> {logoUrl ? "Cambiar logo" : "Subir logo"}</>}
          </Button>
          <small className="text-muted d-block">JPG, PNG o SVG · Máx. 2MB</small>
        </div>
      </div>
    </div>
  );
};

// ─── Foto Perfil ───────────────────────────────────────────────────────────────
const FotoPerfilUploader = ({ fotoUrl, onUpload, uploading }) => {
  const inputRef = useRef();
  return (
    <div className="mb-4">
      <Label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#525f7f", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>
        Foto de perfil del profesional
      </Label>
      <div className="d-flex align-items-center" style={{ gap: 16 }}>
        <div
          style={{
            width: 90, height: 90, borderRadius: "50%",
            border: "2px dashed #dee2e6", background: "#f8f9fa",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", flexShrink: 0,
          }}
        >
          {fotoUrl ? (
            <img src={fotoUrl} alt="Perfil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <User size={28} color="#dee2e6" />
          )}
        </div>
        <div>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => onUpload(e.target.files[0])} />
          <Button
            onClick={() => inputRef.current.click()}
            disabled={uploading}
            style={{
              background: "var(--color-primary)", color: "#fff", border: "none",
              borderRadius: 9, fontWeight: 600, padding: "9px 20px",
              display: "flex", alignItems: "center", gap: 8, fontSize: "0.88rem", marginBottom: 8,
            }}
          >
            {uploading ? <><span className="spinner-border spinner-border-sm" /> Subiendo...</> : <><Upload size={14} /> {fotoUrl ? "Cambiar foto" : "Subir foto"}</>}
          </Button>
          <small className="text-muted d-block">JPG o PNG · Máx. 2MB</small>
        </div>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const ConfiguracionEmpresa = () => {
  const { empresa, actualizarEmpresa, guardando } = useEmpresa();
  const [tab, setTab] = useState("general");
  const [form, setForm] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);

  // ── Aplica los colores al :root en tiempo real mientras edita ──
  useThemeLive(form?.colores, form?.configuracion);

  useEffect(() => {
    if (!empresa) return;
    setForm({
      nombre: empresa.nombre || "",
      descripcion: empresa.descripcion || "",
      direccion: empresa.direccion || "",
      telefono: empresa.telefono || "",
      correo: empresa.correo || "",
      profesional: empresa.profesional || "",
      mensajeBienvenida: empresa.mensajeBienvenida || "",
      redes: {
        instagram: empresa.redes?.instagram || "",
        facebook: empresa.redes?.facebook || "",
        tiktok: empresa.redes?.tiktok || "",
        youtube: empresa.redes?.youtube || "",
      },
      colores: {
        primario:    empresa.colores?.primario    || "#5e72e4",
        secundario:  empresa.colores?.secundario  || "#2dce89",
        fondo:       empresa.colores?.fondo       || "#FFFFFF",
        texto:       empresa.colores?.texto       || "#172b4d",
        textoMuted:  empresa.colores?.textoMuted  || "#8898aa",
        heroBg:      empresa.colores?.heroBg      || "",
        heroEsClaro: empresa.colores?.heroEsClaro ?? false,
        // Nuevos opcionales:
        acento:       empresa.colores?.acento       || "#fb6340",
        sidebar:      empresa.colores?.sidebar       || null,
        tarjeta:      empresa.colores?.tarjeta       || "#ffffff",
        bordeTarjeta: empresa.colores?.bordeTarjeta  || "#e9ecef",
      },
      configuracion: {
        mostrarLogo:         empresa.configuracion?.mostrarLogo         ?? true,
        mostrarEstadisticas: empresa.configuracion?.mostrarEstadisticas ?? true,
        tipoHero:            empresa.configuracion?.tipoHero            || "centrado",
        fuente:              empresa.configuracion?.fuente              || "default",
        borderRadius:        empresa.configuracion?.borderRadius        || "24px",
        usaHorasAncla:       empresa.configuracion?.usaHorasAncla      ?? false,
        modoOscuro:          empresa.configuracion?.modoOscuro          ?? false,
      },
      pagos: {
        requiereAbono:   empresa.pagos?.requiereAbono   ?? false,
        tipoAbono:       empresa.pagos?.tipoAbono       || "fijo",
        montoAbonoFijo:  empresa.pagos?.montoAbonoFijo  || 0,
        porcentajeAbono: empresa.pagos?.porcentajeAbono || 0,
        transferencia: {
          banco:        empresa.pagos?.transferencia?.banco        || "",
          tipoCuenta:   empresa.pagos?.transferencia?.tipoCuenta   || "",
          numeroCuenta: empresa.pagos?.transferencia?.numeroCuenta || "",
          titular:      empresa.pagos?.transferencia?.titular      || "",
          rut:          empresa.pagos?.transferencia?.rut          || "",
          correo:       empresa.pagos?.transferencia?.correo       || "",
        },
      },
      diasMostradosCalendario: empresa.diasMostradosCalendario || 15,
      anticipacionMinima:      empresa.anticipacionMinima      ?? 30,
      anticipacionMaxima:      empresa.anticipacionMaxima      ?? 15,
      envioNotificacionReserva: empresa.envioNotificacionReserva ?? false,
      politicaCancelacion: {
        permiteCancelacion: empresa.politicaCancelacion?.permiteCancelacion ?? true,
        horasLimite:        empresa.politicaCancelacion?.horasLimite        ?? 24,
        mensajePolitica:    empresa.politicaCancelacion?.mensajePolitica    || "",
      },
      perfilProfesional: {
        aniosExperiencia: empresa.perfilProfesional?.aniosExperiencia ?? "",
        especialidades:   empresa.perfilProfesional?.especialidades   || [],
        fotoPerfil: {
          url:      empresa.perfilProfesional?.fotoPerfil?.url      || null,
          publicId: empresa.perfilProfesional?.fotoPerfil?.publicId || null,
        },
      },
      recordatoriosRetencionActivo: empresa.recordatoriosRetencionActivo ?? false,
      permiteSuscripcion:           empresa.permiteSuscripcion            ?? false,
      logo: {
        url:      empresa.logo?.url      || null,
        publicId: empresa.logo?.publicId || null,
      },
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

  // ── Especialidades ──
  const [especialidadInput, setEspecialidadInput] = useState("");
  const addEspecialidad = () => {
    const val = especialidadInput.trim();
    if (!val) return;
    const lista = form.perfilProfesional.especialidades || [];
    if (!lista.includes(val)) set("perfilProfesional.especialidades", [...lista, val]);
    setEspecialidadInput("");
  };
  const removeEspecialidad = (item) => {
    set("perfilProfesional.especialidades", form.perfilProfesional.especialidades.filter((e) => e !== item));
  };

  // ── Resetear colores a defaults ──
  const resetColores = () => {
    set("colores", {
      primario:    "#5e72e4",
      secundario:  "#2dce89",
      fondo:       "#FFFFFF",
      texto:       "#172b4d",
      textoMuted:  "#8898aa",
      heroBg:      "",
      heroEsClaro: false,
      acento:       "#fb6340",
      sidebar:      null,
      tarjeta:      "#ffffff",
      bordeTarjeta: "#e9ecef",
    });
  };

  // ── Upload logo ──
  const handleUploadLogo = async (file) => {
    if (!file) return;
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("logo", file);
      const res = await axios.post(`/api/empresas/${empresa._id}/logo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set("logo.url", res.data.url);
      set("logo.publicId", res.data.publicId);
      Swal.fire({ title: "Logo actualizado", icon: "success", timer: 1800, showConfirmButton: false });
    } catch (err) {
      Swal.fire("Error", "No se pudo subir el logo", "error");
    } finally {
      setUploadingLogo(false);
    }
  };

  // ── Upload foto perfil ──
  const handleUploadFotoPerfil = async (file) => {
    if (!file) return;
    setUploadingFoto(true);
    try {
      const formData = new FormData();
      formData.append("fotoPerfil", file);
      const res = await axios.post(`/api/empresas/${empresa._id}/foto-perfil`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set("perfilProfesional.fotoPerfil.url", res.data.url);
      set("perfilProfesional.fotoPerfil.publicId", res.data.publicId);
      Swal.fire({ title: "Foto actualizada", icon: "success", timer: 1800, showConfirmButton: false });
    } catch (err) {
      Swal.fire("Error", "No se pudo subir la foto de perfil", "error");
    } finally {
      setUploadingFoto(false);
    }
  };

  const handleGuardar = async () => {
    try {
      await actualizarEmpresa(form);
      Swal.fire({
        title: "✅ Guardado",
        text: "Los cambios fueron guardados correctamente.",
        icon: "success",
        confirmButtonColor: "var(--color-primary)",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire("Error", error?.response?.data?.message || "No se pudo guardar", "error");
    }
  };

  const tabs = [
    { key: "general",    label: "General",        icon: <Building2 size={15} /> },
    { key: "redes",      label: "Redes sociales",  icon: <Globe size={15} /> },
    { key: "apariencia", label: "Apariencia",      icon: <Palette size={15} /> },
    { key: "pagos",      label: "Pagos",            icon: <CreditCard size={15} /> },
    { key: "reservas",   label: "Reservas",         icon: <Calendar size={15} /> },
    { key: "notif",      label: "Notificaciones",   icon: <Bell size={15} /> },
  ];

  if (!form)
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <div className="spinner-border" style={{ color: "var(--color-primary)" }} />
      </div>
    );

  const SaveButton = ({ sm = false }) => (
    <Button
      onClick={handleGuardar}
      disabled={guardando}
      style={{
        background: sm
          ? "#fff"
          : "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
        color: sm ? "var(--color-primary)" : "#fff",
        border: "none",
        borderRadius: 10,
        fontWeight: 700,
        padding: sm ? "10px 24px" : "12px 32px",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {guardando ? <><span className="spinner-border spinner-border-sm" /> Guardando...</> : <><Save size={16} /> Guardar cambios</>}
    </Button>
  );

  return (
    <>
      <UserHeader />
      <Container className="mt--7 mb-5" fluid>
        <Row className="justify-content-center">
          <Col lg="10">
            {/* ── Header card ── */}
            <Card className="shadow-lg border-0 mb-4 overflow-hidden">
              <div
                style={{
                  background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
                  padding: "28px 32px",
                }}
              >
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
                  <SaveButton sm />
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

            {/* ── Content card ── */}
            <Card className="shadow border-0">
              <CardBody className="p-4 p-lg-5">

                {/* ════ GENERAL ════ */}
                {tab === "general" && (
                  <>
                    <SectionTitle icon={<Building2 size={18} />} title="Información general" />
                    <LogoUploader logoUrl={form.logo?.url} onUpload={handleUploadLogo} uploading={uploadingLogo} />
                    <Row>
                      <Col md={6}>
                        <Field label="Nombre de la empresa">
                          <Input value={form.nombre} onChange={(e) => set("nombre", e.target.value)} style={{ borderRadius: 8 }} />
                        </Field>
                      </Col>
                      <Col md={6}>
                        <Field label="Correo de contacto">
                          <div className="input-group">
                            <span className="input-group-text" style={{ borderRadius: "8px 0 0 8px", background: "#f8f9fa" }}>
                              <Mail size={15} color="#8898aa" />
                            </span>
                            <Input value={form.correo} onChange={(e) => set("correo", e.target.value)} style={{ borderRadius: "0 8px 8px 0" }} />
                          </div>
                        </Field>
                      </Col>
                      <Col md={6}>
                        <Field label="Teléfono">
                          <div className="input-group">
                            <span className="input-group-text" style={{ borderRadius: "8px 0 0 8px", background: "#f8f9fa" }}>
                              <Phone size={15} color="#8898aa" />
                            </span>
                            <Input value={form.telefono} onChange={(e) => set("telefono", e.target.value)} style={{ borderRadius: "0 8px 8px 0" }} />
                          </div>
                        </Field>
                      </Col>
                      <Col md={12}>
                        <Field label="Dirección">
                          <div className="input-group">
                            <span className="input-group-text" style={{ borderRadius: "8px 0 0 8px", background: "#f8f9fa" }}>
                              <MapPin size={15} color="#8898aa" />
                            </span>
                            <Input value={form.direccion} onChange={(e) => set("direccion", e.target.value)} style={{ borderRadius: "0 8px 8px 0" }} />
                          </div>
                        </Field>
                      </Col>
                      <Col md={12}>
                        <Field label="Descripción" hint="Se muestra en tu página pública">
                          <Input type="textarea" rows={3} value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} style={{ borderRadius: 8, resize: "vertical" }} />
                        </Field>
                      </Col>
                      <Col md={12}>
                        <Field label="Mensaje de bienvenida" hint="Texto personalizado en la parte superior de tu página pública">
                          <Input type="textarea" rows={2} value={form.mensajeBienvenida} onChange={(e) => set("mensajeBienvenida", e.target.value)} style={{ borderRadius: 8, resize: "vertical" }} placeholder="¡Bienvenido! Reserva tu hora en segundos..." />
                        </Field>
                      </Col>
                    </Row>
                  </>
                )}

                {/* ════ REDES ════ */}
                {tab === "redes" && (
                  <>
                    <SectionTitle icon={<Globe size={18} />} title="Redes sociales" />
                    {[
                      { key: "instagram", label: "Instagram", icon: <Instagram size={15} />, placeholder: "@tuempresa" },
                      { key: "facebook",  label: "Facebook",  icon: <Facebook  size={15} />, placeholder: "facebook.com/tuempresa" },
                      { key: "tiktok",    label: "TikTok",    icon: <span style={{ fontSize: 13, fontWeight: 700 }}>TT</span>, placeholder: "@tuempresa" },
                      { key: "youtube",   label: "YouTube",   icon: <Youtube   size={15} />, placeholder: "youtube.com/tucanal" },
                    ].map(({ key, label, icon, placeholder }) => (
                      <Field key={key} label={label}>
                        <div className="input-group">
                          <span className="input-group-text" style={{ borderRadius: "8px 0 0 8px", background: "#f8f9fa", color: "#8898aa" }}>
                            {icon}
                          </span>
                          <Input placeholder={placeholder} value={form.redes[key]} onChange={(e) => set(`redes.${key}`, e.target.value)} style={{ borderRadius: "0 8px 8px 0" }} />
                        </div>
                      </Field>
                    ))}
                  </>
                )}

                {/* ════ APARIENCIA ════ */}
                {tab === "apariencia" && (
                  <>
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <SectionTitle icon={<Palette size={18} />} title="Colores y apariencia" />
                      <button
                        onClick={resetColores}
                        style={{
                          background: "none",
                          border: "1px solid #dee2e6",
                          borderRadius: 8,
                          padding: "6px 14px",
                          fontSize: "0.8rem",
                          color: "#8898aa",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        Resetear colores
                      </button>
                    </div>

                    {/* Vista previa en tiempo real */}
                    <ColorPreview colores={form.colores} />

                    {/* ── Colores principales ── */}
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
                      <Col md={6}>
                        <ColorField label="Texto secundario (muted)" value={form.colores.textoMuted} onChange={(v) => set("colores.textoMuted", v)} />
                      </Col>
                      <Col md={6}>
                        <ColorField label="Color de acento" value={form.colores.acento} onChange={(v) => set("colores.acento", v)} />
                      </Col>
                    </Row>

                    {/* ── Colores avanzados ── */}
                    <div
                      className="mb-4 p-3"
                      style={{ background: "#f8f9fa", borderRadius: 12, border: "1px solid #e9ecef" }}
                    >
                      <small style={{ fontWeight: 700, color: "#525f7f", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 12 }}>
                        Colores avanzados
                      </small>
                      <Row>
                        <Col md={6}>
                          <ColorField label="Fondo de tarjetas" value={form.colores.tarjeta} onChange={(v) => set("colores.tarjeta", v)} />
                        </Col>
                        <Col md={6}>
                          <ColorField label="Borde de tarjetas" value={form.colores.bordeTarjeta} onChange={(v) => set("colores.bordeTarjeta", v)} />
                        </Col>
                        <Col md={6}>
                          <ColorField label="Color del sidebar" value={form.colores.sidebar || form.colores.primario} onChange={(v) => set("colores.sidebar", v)} />
                          <small className="text-muted d-block" style={{ marginTop: -8, marginBottom: 12 }}>
                            Por defecto usa el color primario
                          </small>
                        </Col>
                        <Col md={12}>
                          <Field label="Fondo del hero" hint="Color, gradiente CSS o imagen. Ej: linear-gradient(135deg, #f5f5f5, #fff)">
                            <Input
                              value={form.colores.heroBg}
                              onChange={(e) => set("colores.heroBg", e.target.value)}
                              placeholder="linear-gradient(135deg, #f5f5f5, #fff)"
                              style={{ borderRadius: 8 }}
                            />
                          </Field>
                        </Col>
                      </Row>
                    </div>

                    <Toggle
                      label="Hero con fondo claro"
                      hint="Actívalo si el fondo del hero es claro para que el texto cambie a oscuro automáticamente"
                      checked={form.colores.heroEsClaro}
                      onChange={(v) => set("colores.heroEsClaro", v)}
                    />

                    <hr className="my-4" />
                    <SectionTitle icon={<Settings size={18} />} title="Layout del hero" />
                    <div className="d-flex mb-4" style={{ gap: 12, flexWrap: "wrap" }}>
                      {["centrado", "split", "minimal"].map((tipo) => (
                        <div
                          key={tipo}
                          onClick={() => set("configuracion.tipoHero", tipo)}
                          style={{
                            padding: "12px 24px",
                            borderRadius: 10,
                            cursor: "pointer",
                            border: form.configuracion.tipoHero === tipo ? "2px solid var(--color-primary)" : "2px solid #e9ecef",
                            background: form.configuracion.tipoHero === tipo ? "var(--color-primary-light)" : "#fff",
                            color: form.configuracion.tipoHero === tipo ? "var(--color-primary)" : "#525f7f",
                            fontWeight: form.configuracion.tipoHero === tipo ? 700 : 400,
                            textTransform: "capitalize",
                            fontSize: "0.9rem",
                            transition: "all 0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          {form.configuracion.tipoHero === tipo && <CheckCircle size={14} />}
                          {tipo}
                        </div>
                      ))}
                    </div>

                    <hr className="my-4" />
                    <SectionTitle icon={<Settings size={18} />} title="Opciones visuales" />
                    <Row className="mb-2">
                      <Col md={6}>
                        <Field label="Border radius de tarjetas" hint="Ej: 8px, 16px, 24px">
                          <Input
                            value={form.configuracion.borderRadius}
                            onChange={(e) => set("configuracion.borderRadius", e.target.value)}
                            placeholder="24px"
                            style={{ borderRadius: 8 }}
                          />
                        </Field>
                      </Col>
                      <Col md={6}>
                        <Field label="Tipografía" hint="Fuente principal del sitio">
                          <Input
                            type="select"
                            value={form.configuracion.fuente}
                            onChange={(e) => set("configuracion.fuente", e.target.value)}
                            style={{ borderRadius: 8 }}
                          >
                            <option value="default">Por defecto</option>
                            <option value="Inter, sans-serif">Inter</option>
                            <option value="Poppins, sans-serif">Poppins</option>
                            <option value="Raleway, sans-serif">Raleway</option>
                            <option value="Nunito, sans-serif">Nunito</option>
                          </Input>
                        </Field>
                      </Col>
                    </Row>

                    <Toggle label="Mostrar logo"          hint="Muestra el logo en la página pública"             checked={form.configuracion.mostrarLogo}         onChange={(v) => set("configuracion.mostrarLogo", v)} />
                    <Toggle label="Mostrar estadísticas"  hint="Muestra contadores de reservas y clientes"        checked={form.configuracion.mostrarEstadisticas}  onChange={(v) => set("configuracion.mostrarEstadisticas", v)} />
                    <Toggle label="Usar horas ancla"      hint="Las horas disponibles se anclan a bloques fijos"  checked={form.configuracion.usaHorasAncla}        onChange={(v) => set("configuracion.usaHorasAncla", v)} />
                    <Toggle label="Modo oscuro"           hint="Activa el tema oscuro en el dashboard"            checked={form.configuracion.modoOscuro}           onChange={(v) => set("configuracion.modoOscuro", v)} />
                  </>
                )}

                {/* ════ PAGOS ════ */}
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
                        <Field label="Tipo de abono">
                          <div className="d-flex" style={{ gap: 10 }}>
                            {[
                              { value: "fijo",       label: "Monto fijo",  icon: <DollarSign size={14} /> },
                              { value: "porcentaje", label: "Porcentaje",  icon: <Percent    size={14} /> },
                            ].map(({ value, label, icon }) => (
                              <div
                                key={value}
                                onClick={() => set("pagos.tipoAbono", value)}
                                style={{
                                  flex: 1, padding: "12px 16px", borderRadius: 10,
                                  border: form.pagos.tipoAbono === value ? "2px solid var(--color-primary)" : "2px solid #e9ecef",
                                  background: form.pagos.tipoAbono === value ? "var(--color-primary-light)" : "#fff",
                                  cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                                  color: form.pagos.tipoAbono === value ? "var(--color-primary)" : "#525f7f",
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
                              <Input type="number" value={form.pagos.montoAbonoFijo} onChange={(e) => set("pagos.montoAbonoFijo", Number(e.target.value))} style={{ borderRadius: "0 8px 8px 0" }} />
                            </div>
                          </Field>
                        ) : (
                          <Field label="Porcentaje del servicio">
                            <div className="input-group">
                              <Input type="number" min={1} max={100} value={form.pagos.porcentajeAbono} onChange={(e) => set("pagos.porcentajeAbono", Number(e.target.value))} style={{ borderRadius: "8px 0 0 8px" }} />
                              <span className="input-group-text" style={{ borderRadius: "0 8px 8px 0", background: "#f8f9fa" }}>%</span>
                            </div>
                          </Field>
                        )}

                        <hr className="my-4" />
                        <SectionTitle icon={<CreditCard size={18} />} title="Datos de transferencia" />
                        <Row>
                          {[
                            { key: "banco",        label: "Banco",           placeholder: "BancoEstado" },
                            { key: "tipoCuenta",   label: "Tipo de cuenta",  placeholder: "Cuenta RUT" },
                            { key: "numeroCuenta", label: "N° de cuenta",    placeholder: "12345678" },
                            { key: "titular",      label: "Titular",         placeholder: "Nombre completo" },
                            { key: "rut",          label: "RUT titular",     placeholder: "12.345.678-9" },
                            { key: "correo",       label: "Correo de pago",  placeholder: "pagos@empresa.cl" },
                          ].map(({ key, label, placeholder }) => (
                            <Col md={6} key={key}>
                              <Field label={label}>
                                <Input placeholder={placeholder} value={form.pagos.transferencia[key]} onChange={(e) => set(`pagos.transferencia.${key}`, e.target.value)} style={{ borderRadius: 8 }} />
                              </Field>
                            </Col>
                          ))}
                        </Row>
                      </>
                    )}
                  </>
                )}

                {/* ════ RESERVAS ════ */}
                {tab === "reservas" && (
                  <>
                    <SectionTitle icon={<Calendar size={18} />} title="Configuración de reservas" />
                    <Field label="Días mostrados en el calendario" hint="Cuántos días hacia adelante puede reservar un cliente">
                      <div className="d-flex align-items-center" style={{ gap: 12 }}>
                        <Input
                          type="range" min={7} max={60} step={1}
                          value={form.diasMostradosCalendario}
                          onChange={(e) => set("diasMostradosCalendario", Number(e.target.value))}
                          style={{ flex: 1 }}
                        />
                        <Badge style={{ fontSize: "1rem", padding: "8px 16px", borderRadius: 8, backgroundColor: "var(--color-primary)", color: "#fff" }}>
                          {form.diasMostradosCalendario} días
                        </Badge>
                      </div>
                    </Field>
                    <Row>
                      <Col md={6}>
                        <Field label="Anticipación mínima (minutos)" hint="Mínimo de minutos antes de la hora para poder reservar">
                          <div className="input-group">
                            <span className="input-group-text" style={{ borderRadius: "8px 0 0 8px", background: "#f8f9fa" }}><Clock size={14} color="#8898aa" /></span>
                            <Input type="number" min={0} value={form.anticipacionMinima} onChange={(e) => set("anticipacionMinima", Number(e.target.value))} style={{ borderRadius: "0 8px 8px 0" }} />
                          </div>
                        </Field>
                      </Col>
                      <Col md={6}>
                        <Field label="Anticipación máxima (días)" hint="Máximo de días hacia adelante que se puede reservar">
                          <div className="input-group">
                            <span className="input-group-text" style={{ borderRadius: "8px 0 0 8px", background: "#f8f9fa" }}><Calendar size={14} color="#8898aa" /></span>
                            <Input type="number" min={1} value={form.anticipacionMaxima} onChange={(e) => set("anticipacionMaxima", Number(e.target.value))} style={{ borderRadius: "0 8px 8px 0" }} />
                          </div>
                        </Field>
                      </Col>
                    </Row>
                    <hr className="my-4" />
                    <SectionTitle icon={<ShieldCheck size={18} />} title="Política de cancelación" />
                    <Toggle
                      label="Permitir cancelación de reservas"
                      hint="Los clientes pueden cancelar sus reservas desde su confirmación"
                      checked={form.politicaCancelacion.permiteCancelacion}
                      onChange={(v) => set("politicaCancelacion.permiteCancelacion", v)}
                    />
                    {form.politicaCancelacion.permiteCancelacion && (
                      <Row>
                        <Col md={6}>
                          <Field label="Límite de cancelación (horas)" hint="El cliente puede cancelar hasta X horas antes de la reserva">
                            <div className="input-group">
                              <span className="input-group-text" style={{ borderRadius: "8px 0 0 8px", background: "#f8f9fa" }}><Clock size={14} color="#8898aa" /></span>
                              <Input type="number" min={0} value={form.politicaCancelacion.horasLimite} onChange={(e) => set("politicaCancelacion.horasLimite", Number(e.target.value))} style={{ borderRadius: "0 8px 8px 0" }} />
                            </div>
                          </Field>
                        </Col>
                        <Col md={12}>
                          <Field label="Mensaje de política" hint="Se muestra al cliente al intentar cancelar">
                            <Input type="textarea" rows={2} value={form.politicaCancelacion.mensajePolitica} onChange={(e) => set("politicaCancelacion.mensajePolitica", e.target.value)} style={{ borderRadius: 8, resize: "vertical" }} placeholder="Puedes cancelar tu reserva hasta 24 horas antes..." />
                          </Field>
                        </Col>
                      </Row>
                    )}
                  </>
                )}

                {/* ════ NOTIFICACIONES ════ */}
                {tab === "notif" && (
                  <>
                    <SectionTitle icon={<Bell size={18} />} title="Notificaciones y comunicación" />
                    <Toggle label="Notificar al profesional por nueva reserva" hint="Envía un email al profesional cada vez que se agenda una hora" checked={form.envioNotificacionReserva} onChange={(v) => set("envioNotificacionReserva", v)} />
                    <hr className="my-4" />
                    <SectionTitle icon={<Repeat size={18} />} title="Retención de clientes" />
                    <Toggle label="Activar recordatorios de retención" hint="Envía recordatorios automáticos a clientes inactivos para que vuelvan a reservar" checked={form.recordatoriosRetencionActivo} onChange={(v) => set("recordatoriosRetencionActivo", v)} />
                    <hr className="my-4" />
                    <SectionTitle icon={<MessageSquare size={18} />} title="Suscripción" />
                    <Toggle label="Permitir suscripción de clientes" hint="Los clientes podrán suscribirse para recibir novedades y promociones" checked={form.permiteSuscripcion} onChange={(v) => set("permiteSuscripcion", v)} />
                  </>
                )}

                {/* Botón guardar inferior */}
                <div className="d-flex justify-content-end mt-4">
                  <SaveButton />
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
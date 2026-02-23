import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import axiosInstance from "api/axiosPrivate"; // o como tengas configurado axios
import Swal from "sweetalert2";
import { Container, Card, CardBody, Spinner } from "reactstrap";
import logo from "assets/img/brand/lasanta.png";
import { verifyClaim } from "api/auth";

const VerificarCuenta = () => {
  const [searchParams] = useSearchParams();
  const { slug } = useParams();
  const navigate = useNavigate();
  const { verifySession } = useAuth();
  const [estado, setEstado] = useState("verificando"); // verificando | error

  useEffect(() => {
    const verificar = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setEstado("error");
        return;
      }

      try {
        const res = await verifyClaim(token); // en vez de axiosInstance.get(...)

        // ✅ Guardamos el token y logueamos
        if (res.data?.token) {
          localStorage.setItem("token", res.data.token);
          sessionStorage.setItem("token", res.data.token);
        }

        await verifySession();

        await Swal.fire({
          title: "¡Cuenta activada! 🎉",
          text: "Tu cuenta fue activada correctamente. Tu historial de reservas fue conservado.",
          icon: "success",
          confirmButtonText: "Ir a mi cuenta",
        });

        navigate(`/${slug}/admin/index`);
      } catch (err) {
        setEstado("error");
        Swal.fire({
          icon: "error",
          title: "Enlace inválido",
          text: err.response?.data?.message || "El enlace expiró o ya fue usado.",
        });
      }
    };

    verificar();
  }, []);

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <Card className="shadow border-0 text-center p-4" style={{ maxWidth: 400, width: "100%" }}>
        <CardBody>
          <img src={logo} alt="Logo" style={{ width: 120, marginBottom: 24 }} />
          {estado === "verificando" ? (
            <>
              <Spinner color="success" className="mb-3" />
              <h5>Verificando tu cuenta...</h5>
              <p className="text-muted">Espera un momento</p>
            </>
          ) : (
            <>
              <h5 className="text-danger">Enlace inválido o expirado</h5>
              <p className="text-muted">Intenta registrarte nuevamente.</p>
            </>
          )}
        </CardBody>
      </Card>
    </Container>
  );
};

export default VerificarCuenta;
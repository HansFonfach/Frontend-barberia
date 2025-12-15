import { axiosPrivate } from "./axiosPrivate";
import { axiosWebPay } from "./axiosWebPay";

export const iniciarPagoSuscripcion = async () => {
  const res = await axiosPrivate.post("/pagos/suscripcion/iniciar");
  return res.data;
};

export const confirmarPagoSuscripcion = async (tokenWs) => {
  console.log("🔐 Enviando token al backend:", tokenWs);

  try {
    const res = await axiosWebPay.post("/pagos/suscripcion/confirmar", {
      token_ws: tokenWs,
    });

    console.log("✅ Respuesta backend:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Error en confirmarPagoSuscripcion:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

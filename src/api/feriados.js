import { axiosPrivate } from "./axiosPrivate";
import { axiosPublic } from "./axiosPublic";

export const verificarFeriado = async (fecha) => {
  const res = await axiosPublic.get(`/feriados/verificar?fecha=${fecha}`);
  return res.data;
};

// ── Panel "Feriados" del equipo (admin) ──────────────────────────────────

export const getFeriadosEmpresa = async () => {
  const res = await axiosPrivate.get(`/feriados/empresa`);
  return res.data;
};

export const getDetalleFeriadoEmpresa = async (feriadoId) => {
  const res = await axiosPrivate.get(`/feriados/empresa/${feriadoId}/detalle`);
  return res.data;
};

export const patchToggleFeriadoEmpresa = async (feriadoId, habilitado) => {
  const res = await axiosPrivate.patch(`/feriados/empresa/toggle`, {
    feriadoId,
    habilitado,
  });
  return res.data;
};

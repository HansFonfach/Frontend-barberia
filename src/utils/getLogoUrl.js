// utils/getLogoUrl.js
export const getLogoUrl = (empresa) => {
  if (!empresa?.logo) return null;

  if (typeof empresa.logo === "string") {
    return empresa.logo;
  }

  return empresa.logo.url;
};
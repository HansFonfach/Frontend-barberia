// scripts/generar-sitemap.js
//
// Corre solo antes de cada build ("prebuild" en package.json): baja el
// sitemap del back (con todos los negocios) y lo deja en public/sitemap.xml,
// para que quede en agendafonfach.cl/sitemap.xml.
// Nunca hace fallar el build: si el back no responde, deja un sitemap básico.
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const API_ENV = process.env.REACT_APP_API_URL || "";
const API = API_ENV && !/localhost|127\.0\.0\.1/.test(API_ENV)
  ? API_ENV.replace(/\/+$/, "")
  : "https://backend-barberia-yq3k.onrender.com";
const DESTINO = path.join(__dirname, "..", "public", "sitemap.xml");
const SITIO = "https://www.agendafonfach.cl";
const BASICO = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITIO}/</loc><priority>1.0</priority></url>
  <url><loc>${SITIO}/negocios</loc><priority>0.8</priority></url>
</urlset>
`;

const bajar = (url) =>
  new Promise((resolve, reject) => {
    const cliente = url.startsWith("https") ? https : http;
    const req = cliente.get(url, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      let cuerpo = "";
      res.setEncoding("utf8");
      res.on("data", (c) => (cuerpo += c));
      res.on("end", () => resolve(cuerpo));
    });
    // Render gratis puede tardar en despertar
    req.setTimeout(45000, () => req.destroy(new Error("tiempo de espera agotado")));
    req.on("error", reject);
  });

bajar(`${API}/seo/sitemap.xml`)
  .then((xml) => {
    if (!xml.includes("<urlset")) throw new Error("respuesta sin <urlset>");
    fs.writeFileSync(DESTINO, xml);
    console.log(`sitemap.xml generado (${(xml.match(/<url>/g) || []).length} páginas)`);
  })
  .catch((e) => {
    if (!fs.existsSync(DESTINO)) fs.writeFileSync(DESTINO, BASICO);
    console.warn(`sitemap.xml: no se pudo bajar del back (${e.message}); se usa el que había o uno básico`);
  });

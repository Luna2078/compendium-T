// Servidor estático mínimo para a pasta out/ (Next output: export). Resolve /rota -> rota.html.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "out");
const PORT = 3000;
const TIPOS = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".txt": "text/plain; charset=utf-8",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif",
  ".svg": "image/svg+xml", ".ico": "image/x-icon", ".webp": "image/webp",
  ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf",
};

function resolver(urlPath) {
  let p = decodeURIComponent(urlPath.split("?")[0]);
  if (p.endsWith("/")) p = p + "index.html";
  const candidatos = [p];
  if (!path.extname(p)) { candidatos.push(p + ".html", path.join(p, "index.html")); }
  for (const c of candidatos) {
    const full = path.join(ROOT, c);
    if (full.startsWith(ROOT) && fs.existsSync(full) && fs.statSync(full).isFile()) return full;
  }
  return null;
}

http.createServer((req, res) => {
  let alvo = resolver(req.url === "/" ? "/index.html" : req.url);
  if (!alvo) {
    const f404 = path.join(ROOT, "404.html");
    if (fs.existsSync(f404)) { res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" }); fs.createReadStream(f404).pipe(res); return; }
    res.writeHead(404); res.end("Not found"); return;
  }
  res.writeHead(200, { "Content-Type": TIPOS[path.extname(alvo)] ?? "application/octet-stream" });
  fs.createReadStream(alvo).pipe(res);
}).listen(PORT, () => console.log(`Servindo out/ em http://localhost:${PORT}`));

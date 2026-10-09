// Optional static server with the COOP/COEP headers SQLite needs. Node only, nothing to install.
//   node serve.mjs [port]      (run from this folder; default port 8090)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.argv[2] ?? process.env.PORT ?? 8090);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.wasm': 'application/wasm',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.svg': 'image/svg+xml',
};

async function pick(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  const file = join(root, clean);
  if (!file.startsWith(root)) return null;
  try {
    if ((await stat(file)).isFile()) return file;
  } catch {}
  // Single-page app: unknown routes get index.html.
  return extname(clean) ? null : join(root, 'index.html');
}

createServer(async (request, response) => {
  const file = await pick(request.url ?? '/');
  const headers = {
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Resource-Policy': 'same-origin',
  };
  if (!file) {
    response.writeHead(404, headers).end('Not found');
    return;
  }
  response.writeHead(200, {
    ...headers,
    'Content-Type': types[extname(file)] ?? 'application/octet-stream',
  });
  response.end(await readFile(file));
}).listen(port, () => console.log(`LIFT web on http://localhost:${port}`));

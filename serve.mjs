import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const CONTENT_PATH = path.join(__dirname, 'framework-berlin/website/admin/content.json');
const DATA_PATH    = path.join(__dirname, 'framework-berlin/website/admin/data.json');
const UPLOADS_DIR  = path.join(__dirname, 'framework-berlin/website/public/uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const mime = {
  '.html': 'text/html',  '.css':  'text/css',    '.js':   'application/javascript',
  '.mjs':  'application/javascript',              '.json': 'application/json',
  '.png':  'image/png',  '.jpg':  'image/jpeg',  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',  '.svg':  'image/svg+xml', '.ico': 'image/x-icon',
  '.woff': 'font/woff',  '.woff2':'font/woff2',  '.ttf':  'font/ttf',
};

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' };

function readBody(req) {
  return new Promise(resolve => {
    let b = '';
    req.on('data', c => b += c);
    req.on('end', () => resolve(b));
  });
}

http.createServer(async (req, res) => {
  let urlPath = req.url.split('?')[0];

  /* ── /admin shortcut ───────────────────────────────────── */
  if (urlPath === '/admin' || urlPath === '/admin/') {
    res.writeHead(302, { Location: '/framework-berlin/website/admin/index.html' });
    res.end(); return;
  }

  /* ── CORS preflight ────────────────────────────────────── */
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { ...CORS, 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' });
    res.end(); return;
  }

  /* ── GET /admin/api/content ────────────────────────────── */
  if (urlPath === '/admin/api/content' && req.method === 'GET') {
    try {
      const data = fs.readFileSync(CONTENT_PATH, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json', ...CORS });
      res.end(data);
    } catch {
      res.writeHead(200, { 'Content-Type': 'application/json', ...CORS });
      res.end('{}');
    }
    return;
  }

  /* ── POST /admin/api/content ───────────────────────────── */
  if (urlPath === '/admin/api/content' && req.method === 'POST') {
    const body = await readBody(req);
    try {
      JSON.parse(body);
      fs.writeFileSync(CONTENT_PATH, body, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json', ...CORS });
      res.end('{"ok":true}');
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json', ...CORS });
      res.end('{"error":"invalid json"}');
    }
    return;
  }

  /* ── GET /admin/api/data ──────────────────────────────── */
  if (urlPath === '/admin/api/data' && req.method === 'GET') {
    try {
      const data = fs.readFileSync(DATA_PATH, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json', ...CORS });
      res.end(data);
    } catch {
      res.writeHead(200, { 'Content-Type': 'application/json', ...CORS });
      res.end('{}');
    }
    return;
  }

  /* ── POST /admin/api/data ─────────────────────────────── */
  if (urlPath === '/admin/api/data' && req.method === 'POST') {
    const body = await readBody(req);
    try {
      JSON.parse(body);
      fs.writeFileSync(DATA_PATH, body, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json', ...CORS });
      res.end('{"ok":true}');
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json', ...CORS });
      res.end('{"error":"invalid json"}');
    }
    return;
  }

  /* ── POST /admin/api/upload ────────────────────────────── */
  if (urlPath === '/admin/api/upload' && req.method === 'POST') {
    const body = await readBody(req);
    try {
      const { filename, data } = JSON.parse(body);
      const safeName = Date.now() + '-' + filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const savePath = path.join(UPLOADS_DIR, safeName);
      const buf = Buffer.from(data.replace(/^data:[^;]+;base64,/, ''), 'base64');
      fs.writeFileSync(savePath, buf);
      const url = `/framework-berlin/website/public/uploads/${safeName}`;
      res.writeHead(200, { 'Content-Type': 'application/json', ...CORS });
      res.end(JSON.stringify({ url }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json', ...CORS });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  /* ── Static files ──────────────────────────────────────── */
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(__dirname, urlPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mime[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });

}).listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

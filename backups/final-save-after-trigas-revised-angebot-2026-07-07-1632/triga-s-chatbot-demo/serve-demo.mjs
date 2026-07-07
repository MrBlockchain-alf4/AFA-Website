/**
 * TRIGA-S Demo Server — port 5500
 * Serves triga-s-chatbot-demo/ with CORS headers so the widget
 * can be injected into https://triga-s.de via Chrome Console.
 *
 * Start:  node triga-s-chatbot-demo/serve-demo.mjs
 * Access: http://localhost:5500/
 *         http://localhost:5500/triga-s-chatbot.js
 *         http://localhost:5500/assets/triga-s-logo.png
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 5500;

const mime = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.mjs':  'application/javascript',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.json': 'application/json',
};

http.createServer((req, res) => {
  // CORS — needed for injection into triga-s.de (https origin)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(__dirname, urlPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mime[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: ' + urlPath);
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });

}).listen(PORT, () => {
  console.log('');
  console.log('  TRIGA-S Demo Server running');
  console.log('  ─────────────────────────────────────────────');
  console.log(`  Demo page : http://localhost:${PORT}/`);
  console.log(`  Widget JS : http://localhost:${PORT}/triga-s-chatbot.js`);
  console.log(`  Logo      : http://localhost:${PORT}/assets/triga-s-logo.png`);
  console.log('');
});

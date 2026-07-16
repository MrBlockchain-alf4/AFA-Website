/**
 * TRIGA-S Demo Server — port 5500
 * Serves triga-s-chatbot-demo/ with CORS headers so the widget
 * can be injected into https://triga-s.de via Chrome Console.
 *
 * Also runs a local WebSocket relay on ws://localhost:5500/bridge
 * for the BotCore ↔ triga-s.de live demo connection.
 *
 * Start:  node triga-s-chatbot-demo/serve-demo.mjs
 * Access: http://localhost:5500/
 *         http://localhost:5500/triga-s-chatbot.js
 *         http://localhost:5500/assets/triga-s-logo.png
 *         ws://localhost:5500/bridge
 */
import http   from 'http';
import fs     from 'fs';
import path   from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT      = 5500;

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

// ── WebSocket relay (localhost only, no external network) ─────────────────────
const WS_MAGIC  = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const wsClients = new Set();
const WS_ALLOWED = new Set(['send', 'thinking', 'reply']);

function wsHandshake(req, socket) {
  const key = req.headers['sec-websocket-key'];
  if (!key) { socket.destroy(); return false; }
  const accept = crypto.createHash('sha1').update(key + WS_MAGIC).digest('base64');
  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\n' +
    'Upgrade: websocket\r\n' +
    'Connection: Upgrade\r\n' +
    `Sec-WebSocket-Accept: ${accept}\r\n\r\n`
  );
  return true;
}

function wsSend(socket, text) {
  if (socket.destroyed) return;
  const payload = Buffer.from(text, 'utf8');
  const header  = Buffer.alloc(payload.length < 126 ? 2 : 4);
  header[0] = 0x81; // FIN=1, opcode=text(0x1)
  if (payload.length < 126) {
    header[1] = payload.length;
  } else {
    header[1] = 126;
    header.writeUInt16BE(payload.length, 2);
  }
  try { socket.write(Buffer.concat([header, payload])); } catch (_) {}
}

function wsParseText(buf) {
  if (buf.length < 2) return null;
  const opcode = buf[0] & 0x0f;
  if (opcode === 0x8) return '__close__'; // close frame
  if (opcode !== 0x1) return null;        // text frames only
  const masked     = (buf[1] & 0x80) !== 0;
  let   payloadLen =  buf[1] & 0x7f;
  let   offset     = 2;
  if (payloadLen === 126) { payloadLen = buf.readUInt16BE(2); offset = 4; }
  else if (payloadLen === 127) return null; // reject oversized frames
  const maskKey = masked ? buf.slice(offset, offset + 4) : null;
  if (masked) offset += 4;
  if (buf.length < offset + payloadLen) return null; // incomplete frame
  const payload = Buffer.from(buf.slice(offset, offset + payloadLen));
  if (masked && maskKey) {
    for (let i = 0; i < payload.length; i++) payload[i] ^= maskKey[i % 4];
  }
  return payload.toString('utf8');
}
// ─────────────────────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  // CORS — needed for injection into triga-s.de (https origin)
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';

  const filePath    = path.join(__dirname, urlPath);
  const ext         = path.extname(filePath).toLowerCase();
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
});

// WebSocket upgrade handler — relay any allowed event to all other connected clients
server.on('upgrade', (req, socket) => {
  if (req.url !== '/bridge') { socket.destroy(); return; }
  if (!wsHandshake(req, socket)) return;
  wsClients.add(socket);

  let buf = Buffer.alloc(0);
  socket.on('data', chunk => {
    buf = Buffer.concat([buf, chunk]);
    const text = wsParseText(buf);
    if (text === null) return; // incomplete frame — wait for more data
    buf = Buffer.alloc(0);
    if (text === '__close__') { socket.destroy(); return; }
    const msg = text.trim();
    if (!WS_ALLOWED.has(msg)) return;
    // Relay to every other connected client
    for (const other of wsClients) {
      if (other !== socket) wsSend(other, msg);
    }
  });

  socket.on('close', () => wsClients.delete(socket));
  socket.on('error', () => { wsClients.delete(socket); socket.destroy(); });
});

server.listen(PORT, () => {
  console.log('');
  console.log('  TRIGA-S Demo Server running');
  console.log('  ─────────────────────────────────────────────');
  console.log(`  Demo page : http://localhost:${PORT}/`);
  console.log(`  Widget JS : http://localhost:${PORT}/triga-s-chatbot.js`);
  console.log(`  Logo      : http://localhost:${PORT}/assets/triga-s-logo.png`);
  console.log(`  WS Bridge : ws://localhost:${PORT}/bridge`);
  console.log('');
});

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');
const port = process.env.PORT || 3000;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function getMimeType(filePath) {
  return mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Erro ao ler o arquivo.');
      return;
    }

    res.writeHead(200, { 'Content-Type': getMimeType(filePath) });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  if (!fs.existsSync(distDir)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Pasta dist não encontrada. Execute "npm run build" primeiro.');
    return;
  }

  let requestPath = decodeURI(req.url.split('?')[0]);
  if (requestPath === '/' || requestPath === '') {
    requestPath = '/index.html';
  }

  const filePath = path.join(distDir, requestPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    sendFile(res, filePath);
    return;
  }

  const fallbackPath = path.join(distDir, 'index.html');
  if (fs.existsSync(fallbackPath)) {
    sendFile(res, fallbackPath);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Arquivo não encontrado.');
});

server.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

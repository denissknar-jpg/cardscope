const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const port = process.env.PORT || 3000;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(payload, null, 2));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/offers') {
    const offers = readJson(path.join(rootDir, 'data', 'card-comparison.json'));
    return sendJson(res, 200, offers);
  }

  if (url.pathname === '/api/cards') {
    const cards = readJson(path.join(rootDir, 'data', 'card-comparison.json'));
    return sendJson(res, 200, cards);
  }

  if (url.pathname === '/api/categories') {
    const categories = readJson(path.join(rootDir, 'data', 'categories.json'));
    return sendJson(res, 200, categories);
  }

  if (url.pathname === '/api/partners') {
    const partners = readJson(path.join(rootDir, 'data', 'sample-partners.json'));
    return sendJson(res, 200, partners);
  }

  const safePath = url.pathname === '/' ? '/index.html' : url.pathname;
  const filePath = path.join(rootDir, safePath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const contentType = filePath.endsWith('.css')
      ? 'text/css; charset=utf-8'
      : filePath.endsWith('.js')
        ? 'application/javascript; charset=utf-8'
        : 'text/html; charset=utf-8';

    const raw = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    return res.end(raw);
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});

const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});

// 🔥 prevent crashes
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err.message);

  if (!res.headersSent) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
  }
  res.end('Bad gateway');
});

const server = http.createServer((req, res) => {
  try {
    if (req.url.startsWith('/api')) {
      proxy.web(req, res, { target: 'http://localhost:8082' });
    } else {
      proxy.web(req, res, { target: 'http://localhost:3000' });
    }
  } catch (err) {
    console.error('Server error:', err);
    res.end('Internal server error');
  }
});

// 🔥 WebSocket support (Next.js HMR)
server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head, { target: 'http://localhost:3000' });
});

server.listen(8080, () => {
  console.log('Proxy running on http://localhost:8080');
});
const http = require('http');
const httpProxy = require('http-proxy');
const chalk = require('chalk');

const proxy = httpProxy.createProxyServer({});

// Prevent proxy crashes
proxy.on('error', (err, req, res) => {
  console.error(chalk.red('Proxy Error:'), err.message);
  if (!res.headersSent) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
  }
  res.end('Bad Gateway - Backend or Frontend is down');
});

const server = http.createServer((req, res) => {
  console.log(chalk.cyan(`→ ${req.method} ${req.url}`));

  try {
    if (req.url.startsWith('/api')) {
      console.log(chalk.yellow('   Proxying to Backend (8082)'));
      proxy.web(req, res, { target: 'http://localhost:8082' });
    } else {
      console.log(chalk.green('   Proxying to Frontend (3000)'));
      proxy.web(req, res, { target: 'http://localhost:3000' });
    }
  } catch (err) {
    console.error(chalk.red('Server Error:'), err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

// WebSocket support (for Next.js HMR / hot reload)
server.on('upgrade', (req, socket, head) => {
  console.log(chalk.magenta('   WebSocket Upgrade → Frontend'));
  proxy.ws(req, socket, head, { target: 'http://localhost:3000' });
});

server.listen(8080, () => {
  console.log('\n' + '='.repeat(60));
  console.log(chalk.bold.green('🚀 Smart Attendance Proxy Server Started'));
  console.log(chalk.gray('   Listening on: ') + chalk.cyan('http://localhost:8080'));
  console.log('='.repeat(60));

  console.log('\n' + chalk.bold('📋 Commands to run in separate terminals:'));

  console.log(chalk.yellow('\n1. Backend (Spring Boot):'));
  console.log(chalk.gray('   cd backend'));
  console.log(chalk.gray('   ./mvnw spring-boot:run') + chalk.dim('   # or mvn spring-boot:run'));

  console.log(chalk.cyan('\n2. Frontend (Next.js / Expo):'));
  console.log(chalk.gray('   cd frontend'));
  console.log(chalk.gray('   npm run dev'));

  console.log(chalk.magenta('\n3. Proxy (this server):'));
  console.log(chalk.gray('   node proxy/proxy.js'));

  console.log('\n' + chalk.bold.green('✅ All set! Open http://localhost:8080'));
  console.log(chalk.gray('   Backend → /api/*'));
  console.log(chalk.gray('   Frontend → /*'));
});
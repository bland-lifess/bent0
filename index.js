import express from 'express';
import { createBareServer } from '@tomphttp/bare-server-node';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer();
const bare = createBareServer('/bare/');

// Serve Ultraviolet scripts
app.use('/uv/', express.static(uvPath));

// Serve static files (our HTML/CSS/JS)
app.use(express.static(join(__dirname, 'public')));

// Handle bare server
server.on('request', (req, res) => {
  if (bare.shouldRoute(req)) {
    bare.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

server.on('upgrade', (req, socket, head) => {
  if (bare.shouldRoute(req)) {
    bare.routeUpgrade(req, socket, head);
  } else {
    socket.end();
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Ultraviolet proxy running on port ${PORT}`);
  console.log(`🌐 Access at: http://localhost:${PORT}`);
});

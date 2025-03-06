const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const chokidar = require('chokidar');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 8080;
const wsPort = 8765;

// Enable CORS
app.use(cors());

// Serve static files from the current directory
app.use(express.static('./', {
    setHeaders: (res, path) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    }
}));

// Handle theme preference storage
app.post('/theme', express.json(), (req, res) => {
    if (req.body.type === 'theme') {
        fs.writeFileSync('theme.json', JSON.stringify(req.body));
        res.status(200).send();
    } else {
        res.status(400).send();
    }
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ port: wsPort });

// Store connected clients
const clients = new Set();

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('WebSocket connection established');
    clients.add(ws);

    // Handle client messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'theme') {
                // Broadcast theme change to all clients
                broadcast(message);
            } else if (data.type === 'ping') {
                ws.send(JSON.stringify({ type: 'pong' }));
            }
        } catch (error) {
            console.error('Invalid JSON received:', error);
        }
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log('WebSocket connection closed');
        clients.delete(ws);
    });

    // Handle errors
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clients.delete(ws);
    });
});

// Broadcast message to all connected clients
function broadcast(message) {
    const deadClients = new Set();
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        } else {
            deadClients.add(client);
        }
    });
    deadClients.forEach(client => clients.delete(client));
}

// File watching setup
const watcher = chokidar.watch('.', {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true
});

// Handle file changes
watcher.on('change', (filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('.css') || filePath.endsWith('.js')) {
        console.log(`File changed: ${filePath}`);
        broadcast(JSON.stringify({
            type: 'reload',
            file: path.basename(filePath)
        }));
    }
});

// Get local IP address
function getLocalIP() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return '127.0.0.1';
}

// Start the server
server.listen(port, () => {
    const localIP = getLocalIP();
    console.log(`\nServer started at:`);
    console.log(`Local: http://localhost:${port}`);
    console.log(`Network: http://${localIP}:${port}`);
    console.log('\nAvailable pages:');
    console.log(`- Status List: http://${localIP}:${port}/status_list.html`);
    console.log(`- Dashboard: http://${localIP}:${port}/index.html`);
    console.log('\nPress Ctrl+C to stop the server');
});

// Handle server shutdown
process.on('SIGINT', () => {
    console.log('\nServer stopped');
    watcher.close();
    wss.close();
    server.close(() => {
        process.exit(0);
    });
}); 
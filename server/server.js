const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { handleSocketConnection } = require('./socket/socketHandlers');
const lobbyRoutes = require('./routes/lobbyRoutes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", // autoriser depuis n'importe où (pour tests réseau local)
        methods: ["GET", "POST"]
    }
});

const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Bonjour depuis le serveur Node.js 🚀' });
});
app.use('/lobby', lobbyRoutes);

// Socket.io
io.on('connection', (socket) => {
    handleSocketConnection(socket, io);
});

// IMPORTANT: un seul listen, et en 0.0.0.0
server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Serveur lancé et accessible : http://0.0.0.0:${PORT}`);
});

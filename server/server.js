const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { handleSocketConnection } = require('./socket/socketHandlers');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const io = new Server(server, {
    cors: {
        origin: CLIENT_ORIGIN,
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Gombloc 🚀' });
});

// Socket.io
io.on('connection', (socket) => {
    handleSocketConnection(socket, io);
});

server.listen(PORT, HOST, () => {
    console.log(`✅ Serveur lancé et accessible : http://${HOST}:${PORT}`);
});

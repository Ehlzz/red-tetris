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
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Bonjour depuis le serveur Node.js 🚀' });
});

io.on('connection', (socket) => {
    handleSocketConnection(socket, io);
});

server.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});

app.use('/lobby', lobbyRoutes);
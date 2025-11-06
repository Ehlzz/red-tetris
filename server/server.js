const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

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

const blocks = {
  I: [
    [1, 1, 1, 1]
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1]
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1]
  ],
  O: [
    [1, 1],
    [1, 1]
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0]
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1]
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1]
  ],
};

app.get('/', (req, res) => {
  res.json({ message: 'Bonjour depuis le serveur Node.js 🚀' });
});

io.on('connection', (socket) => {
  console.log('🔌 Utilisateur connecté:', socket.id);

  socket.on('requestTetromino', () => {
    console.log('📦 Demande de tétrimino reçue de:', socket.id);
    
    const blockTypes = Object.keys(blocks);
    const randomType = blockTypes[Math.floor(Math.random() * blockTypes.length)];
    const block = blocks[randomType];
    
    console.log(`🎲 Envoi du tétrimino ${randomType}:`, block);
    
    socket.emit('tetromino', { 
      type: randomType, 
      shape: block 
    });
  });

  socket.on('disconnect', () => {
    console.log('❌ Utilisateur déconnecté:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});

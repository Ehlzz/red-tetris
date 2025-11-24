const rooms = {};
const roomTimers = {};

function createLobby(socket) {
    console.log('CREATE LOBBY CALLED')
    const roomId = `room-${Math.random().toString(36).substr(2, 9)}`;
    rooms[roomId] = {
        players: [],
        chief: socket.id,
        roomId: roomId
    };
    socket.join(roomId);
    socket.emit('lobbyCreated', { room: rooms[roomId] });
    console.log(`🛠️ Lobby créé: ${roomId} par ${socket.id}`);
    startRoomTimer(roomId);
    return roomId;
}


function joinLobby(socket, io, args) {
    console.log('joinLobby called');
    console.log(args, socket.id);
    const room = rooms[args.roomId];
    
    if (room) {
        if (room.players.length >= 4) {
            socket.emit('error', { message: 'Lobby plein.', room: args.roomId });
            return;
        }
        const playerIndex = room.players.findIndex(p => p.name === args.playerName);
        if (playerIndex !== -1) {
            socket.emit('error', { message: 'Nom de joueur déjà pris dans ce lobby.', name: true, room: args.roomId });
            return;
        }
        socket.join(args.roomId);
        room.players.push({name: args.playerName, id: socket.id, isReady: false});
        console.log('added player to room', room.players);
        clearRoomTimer(args.roomId);
        if (room.players.length === 1) {
            room.chief = socket.id;
            console.log(`👑 Chef du lobby ${args.roomId}: ${room.chief}`);
        }
        room.players.forEach(player => {
            io.to(player.id).emit('lobbyJoined', { roomId: args.roomId, room: room });
        });
        console.log(`🔑 ${socket.id} (${args.playerName}) a rejoint le lobby: ${args.roomId}`);
    } else {
        socket.emit('error', { message: 'Lobby introuvable.' });
    }
}

function toggleReadyLobby(socket, io, roomId) {
    const room = rooms[roomId];
    if (room) {
        const player = room.players.find(p => p.id === socket.id);
        if (player) {
            player.isReady = !player.isReady;
            console.log(`✅ ${socket.id} (${player.name}) a changé son statut prêt à ${player.isReady} dans le lobby: ${roomId}`);
            room.players.forEach(p => {
                io.to(p.id).emit('refreshRoom', { room: room });
            });
        }
    }
}

function startRoomTimer(roomId) {
    clearRoomTimer(roomId);
    
    roomTimers[roomId] = setTimeout(() => {
        const room = rooms[roomId];
        if (room && room.players.length === 0) {
            delete rooms[roomId];
            delete roomTimers[roomId];
            console.log(`🗑️ Lobby supprimé: ${roomId} (vide depuis 30s)`);
        }
    }, 30000);
}

function clearRoomTimer(roomId) {
    if (roomTimers[roomId]) {
        clearTimeout(roomTimers[roomId]);
        delete roomTimers[roomId];
        console.log(`⏹️ Timer annulé pour le lobby: ${roomId}`);
    }
}

function removePlayerFromLobby(socket) {
    Object.keys(rooms).forEach(roomId => {
        const room = rooms[roomId];
        const playerIndex = room.players.findIndex(p => p.id === socket.id);
        if (playerIndex !== -1) {
            room.players.splice(playerIndex, 1);
            socket.leave(roomId);
            console.log(`🚪 ${socket.id} a quitté le lobby: ${roomId}`);
            if (room.players.length === 0) {
                console.log('🗑️ Lobby vide, démarrage du timer de suppression:', roomId);
                startRoomTimer(roomId);
                return;
            } else if (room.chief === socket.id) {
                room.chief = room.players[0].id;
                console.log(`👑 Nouveau chef du lobby ${roomId}: ${room.chief}`)
            };
            room.players.forEach(player => {
                socket.to(player.id).emit('playerLeft', { room });
            });
        }
    });
}

function getRoomById(roomId) {
    return rooms[roomId];
}

module.exports = { rooms, createLobby, joinLobby, removePlayerFromLobby, getRoomById, toggleReadyLobby};
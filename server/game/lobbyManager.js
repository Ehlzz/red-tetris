const rooms = {};
const roomTimers = {};
const playersRoom = {};

function createLobby(socket) {
    const roomId = `room-${Math.random().toString(36).substr(2, 9)}`;
    rooms[roomId] = {
        players: [],
        chief: socket.id,
        roomId: roomId
    };
    socket.join(roomId);
    socket.emit('lobbyCreated', { room: rooms[roomId] });
    // console.log(`🛠️ Lobby créé: ${roomId} par ${socket.id}`);
    startRoomTimer(roomId);
    return roomId;
}


function joinLobby(socket, io, args) {
    const room = rooms[args.roomId];
    
    if (room) {
        if (room.gameStarted) {
            socket.emit('error', { errorType: 'lobbyInGame'});
            return;
        }
        if (room.players.length >= 4) {
            socket.emit('error', { errorType: 'lobbyFull'});
            return;
        }
        if (args.playerName.length < 1 || args.playerName.length > 12) {
            socket.emit('error', { errorType: 'nameLength', room: args.roomId });
            return;
        }
        const checkPlayerIndex = room.players.findIndex(p => p.name === args.playerName && p.id === socket.id);
        if (checkPlayerIndex !== -1) {
            return;
        };
        
        const checkNameIndex = room.players.findIndex(p => p.name === args.playerName);
        if (checkNameIndex !== -1) {
            socket.emit('error', { errorType: 'name', room: args.roomId });
            return;
        }
        socket.join(args.roomId);
        playersRoom[socket.id] = args.roomId;
        room.players.push({name: args.playerName, id: socket.id, isReady: false});
        clearRoomTimer(args.roomId);
        if (room.players.length === 1) {
            room.chief = socket.id;
            // // console.log(`👑 Chef du lobby ${args.roomId}: ${room.chief}`);
        }
        room.players.forEach(player => {
            io.to(player.id).emit('lobbyJoined', { roomId: args.roomId, room: room });
        });
        // console.log(`🔑 ${socket.id} (${args.playerName}) a rejoint le lobby: ${args.roomId}`);
    } else {
        socket.emit('error', { errorType: 'lobbyNotFound' });
    }
}

function toggleReadyLobby(socket, io) {
    const room = socket.data.room;
    if (room) {
        const player = room.players.find(p => p.id === socket.id);
        if (player) {
            player.isReady = !player.isReady;
            // // console.log(`✅ ${socket.id} (${player.name}) a changé son statut prêt à ${player.isReady} dans le lobby: ${roomId}`);
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
            // console.log(`🗑️ Lobby supprimé: ${roomId} (vide depuis 30s)`);
        }
    }, 30000);
}

function clearRoomTimer(roomId) {
    if (roomTimers[roomId]) {
        clearTimeout(roomTimers[roomId]);
        delete roomTimers[roomId];
        // console.log(`⏹️ Timer annulé pour le lobby: ${roomId}`);
    }
}

function removePlayerFromLobby(socket) {
    const room = getRoomById(getPlayerRoom(socket.id));
    if (!room) return;
    const playerIndex = room.players.findIndex(p => p.id === socket.id);
    if (playerIndex !== -1) {
        const roomId = room.roomId;
        room.players.splice(playerIndex, 1);
        socket.leave(roomId);
        delete playersRoom[socket.id];
        // console.log(`🚪 ${socket.id} a quitté le lobby: ${roomId}`);
        if (room.players.length === 0) {
            // console.log('🗑️ Lobby vide, démarrage du timer de suppression:', roomId);

            startRoomTimer(roomId);
            return;
        } else if (room.chief === socket.id) {
            room.chief = room.players[0].id;
        };
        room.players.forEach(player => {
            socket.to(player.id).emit('playerLeft', { room });
        });
        socket.data.room = null;
    }
}

function getRoomById(roomId) {
    return rooms[roomId];
}

function getPlayerRoom(socketId) {
    return playersRoom[socketId];
}

module.exports = { rooms, createLobby, joinLobby, removePlayerFromLobby, getRoomById, toggleReadyLobby, getPlayerRoom};
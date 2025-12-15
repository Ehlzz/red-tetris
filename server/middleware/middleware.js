const { getPlayer } = require('../game/playerManager');
const { getRoomById, getPlayerRoom } = require('../game/lobbyManager');

function requestIsInGame(socket, next) {
    const player = getPlayer(socket.id);
    console.log(player == null, 'dans requestIsInGame');

    if (!player) {
        return next(new Error("Player not initialized."));
    }
    console.log(player);
    socket.data.player = player;
    console.log(socket.data.player);
    next();
}


function requestIsInLobby(socket, next) {
    const room = getRoomById(getPlayerRoom(socket.id));
    console.log(room == null, 'dans requestIsInLobby');
    if (!room) {
        return next(new Error("Player not in a lobby."));
    }
    const player = getPlayer(socket.id);
    if (player) {
        socket.data.player = player;
    }
    socket.data.room = room;
    next();
}

function requestCreateLobby(socket, next) {
    const roomId = getPlayerRoom(socket.id);
    console.log(roomId == null, 'dans requestCreateLobby');

    if (roomId) {
        return next(new Error("Player is already in a game."));
    }
    next();
}

function socketMiddleware(socket) {
    socket.use((packet, next) => {
        const event = packet[0];
        console.log(`🔔 Événement reçu: ${event} de ${socket.id}`);

        if (['moveBlock', 'rotateBlock', 'dropBlock', 'stopGame', 'gameOver'].includes(event)) {
            return requestIsInGame(socket, next);
        }

        if (['toggleReady', 'startMultiplayerGame'].includes(event)) {
            return requestIsInLobby(socket, next);
        }

        if (event === 'createLobby') {
            return requestCreateLobby(socket, next);
        }

        console.log('Aucun middleware applicable pour cet événement. : ' + event);
        next();
    });
}

module.exports = { socketMiddleware };
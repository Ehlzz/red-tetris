const { initPlayer, getPlayer } = require('../game/playerManager');
const { moveBlock, rotateBlock, dropBlock } = require('../game/gameLogic');
const { createLobby, joinLobby, removePlayerFromLobby, toggleReadyLobby, getRoomById } = require('../game/lobbyManager');
const { handleStartGame, handleStartMultiplayerGame, handleGameOver } = require('../game/gameManager')

function handleSocketConnection(socket, io) {
    console.log('🔌 Utilisateur connecté:', socket.id);

    socket.on('startGame', () => {
        handleStartGame(socket)
    });

    socket.on('startMultiplayerGame', (roomId) => {
        handleStartMultiplayerGame(io, roomId)
    });

    socket.on('moveBlock', (direction) => {
        const player = getPlayer(socket.id);
        moveBlock(socket, player, direction);
    });

    socket.on('rotateBlock', () => {
        const player = getPlayer(socket.id);
        rotateBlock(socket, player);
    });

    socket.on('dropBlock', () => {
        const player = getPlayer(socket.id);
        dropBlock(socket, player);
    });

    socket.on('createLobby', () => {
        createLobby(socket);
    });

    socket.on('joinLobby', ({ args }) => {
        joinLobby(socket, io, args);
    });

    socket.on('leaveLobby', () => {
        removePlayerFromLobby(socket);
    });

    socket.on('disconnect', () => {
        console.log('❌ Utilisateur déconnecté:', socket.id);
        removePlayerFromLobby(socket);
    });

    socket.on('toggleReady', (args) => {
        toggleReadyLobby(socket, io, args.roomId);
    });

    socket.on('gameOver', (data) => {
        handleGameOver(socket, io, data)
    });
}

module.exports = { handleSocketConnection };
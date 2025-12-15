const { initPlayer, getPlayer } = require('../game/playerManager');
const { moveBlock, rotateBlock, dropBlock } = require('../game/gameLogic');
const { createLobby, joinLobby, removePlayerFromLobby, toggleReadyLobby, getRoomById } = require('../game/lobbyManager');
const { handleStartGame, handleStartMultiplayerGame, handleGameOver, handleResetGame, handleStopGame } = require('../game/gameManager')
const { socketMiddleware } = require('../middleware/middleware');

function handleSocketConnection(socket, io) {

    socketMiddleware(socket);
    // Solo Handlers

    socket.on('startGame', () => handleStartGame(socket));
    
    // Game handlers

    socket.on('moveBlock', (direction) => moveBlock(socket, socket.data.player || getPlayer(socket.id), direction));
    
    socket.on('rotateBlock', () => rotateBlock(socket));
    
    socket.on('dropBlock', () => dropBlock(socket));
    
    socket.on('gameOver', (data) => handleGameOver(socket, io, data));
    
    socket.on('resetGame', () => handleResetGame(socket));
    
    socket.on('stopGame', () => handleStopGame(socket));
    
    // Lobby/Multiplayers handlers
    
    socket.on('createLobby', () => createLobby(socket));
    
    socket.on('joinLobby', ({ args }) => joinLobby(socket, io, args));
    
    socket.on('leaveLobby', () => removePlayerFromLobby(socket));
    
    socket.on('disconnect', () => removePlayerFromLobby(socket));
    
    socket.on('toggleReady', (args) => toggleReadyLobby(socket, io, args.roomId));
    
    socket.on('startMultiplayerGame', (roomId) => handleStartMultiplayerGame(io, roomId));
}

module.exports = { handleSocketConnection };
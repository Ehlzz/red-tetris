const { initPlayer, getPlayer } = require('../game/playerManager');
const { moveBlock, rotateBlock, dropBlock } = require('../game/gameLogic');
const { createLobby, joinLobby, removePlayerFromLobby, toggleReadyLobby, getRoomById } = require('../game/lobbyManager');
const { handleStartGame, handleStartMultiplayerGame, handleGameOver, handleResetGame, handleStopGame } = require('../game/gameManager')

function handleSocketConnection(socket, io) {
    socket.on('startGame', () => handleStartGame(socket));

    socket.on('startMultiplayerGame', (roomId) => handleStartMultiplayerGame(io, roomId));

    socket.on('moveBlock', (direction) => moveBlock(socket, direction));

    socket.on('rotateBlock', () => rotateBlock(socket));
    
    socket.on('dropBlock', () => dropBlock(socket));

    socket.on('createLobby', () => createLobby(socket));

    socket.on('joinLobby', ({ args }) => joinLobby(socket, io, args));

    socket.on('leaveLobby', () => removePlayerFromLobby(socket));

    socket.on('disconnect', () => removePlayerFromLobby(socket));

    socket.on('toggleReady', (args) => toggleReadyLobby(socket, io, args.roomId));
    
    socket.on('gameOver', (data) => handleGameOver(socket, io, data));

    socket.on('requestGame', () => initPlayer(socket.id));

    socket.on('resetGame', () => handleResetGame(socket));

    socket.on('stopGame', () => handleStopGame(socket));
}

module.exports = { handleSocketConnection };
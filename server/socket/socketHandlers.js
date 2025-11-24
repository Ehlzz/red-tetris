const { initPlayer, getPlayer } = require('../game/playerManager');
const { moveBlock, rotateBlock, dropBlock } = require('../game/gameLogic');
const { createLobby, joinLobby, removePlayerFromLobby, toggleReadyLobby } = require('../game/lobbyManager');

function handleSocketConnection(socket, io) {
    console.log('🔌 Utilisateur connecté:', socket.id);

    socket.on('startGame', () => {
        console.log('▶️ Jeu démarré pour:', socket.id);

        const player = initPlayer(socket.id);
        socket.emit('receiveGame', player);

        let loop;
        function startLoop() {
            clearInterval(loop);
            const p = getPlayer(socket.id);
            if (!p) return;
            
            loop = setInterval(() => {
                const currentPlayer = getPlayer(socket.id);
                if (!currentPlayer || currentPlayer.isGameOver) {
                    clearInterval(loop);
                    return;
                }
                moveBlock(socket, currentPlayer, { x: 0, y: 1 });
            }, p.speed);
        }

        startLoop();
        player.updateSpeed = () => startLoop();
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

    socket.on('disconnect', () => {
        console.log('❌ Utilisateur déconnecté:', socket.id);
        removePlayerFromLobby(socket);
    });

    socket.on('toggleReady', (args) => {
        toggleReadyLobby(socket, io, args.roomId);
    });
}

module.exports = { handleSocketConnection };
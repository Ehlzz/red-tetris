const { initPlayer, getPlayer } = require('../game/playerManager');
const { moveBlock, rotateBlock, dropBlock } = require('../game/gameLogic');
const { createLobby, joinLobby, removePlayerFromLobby, toggleReadyLobby, getRoomById } = require('../game/lobbyManager');

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

    socket.on('startMultiplayerGame', (roomId) => {
        const room = getRoomById(roomId);
        room.players.forEach(player => {
            io.to(player.id).emit('startMultiplayerGame', {name: player.name, room: room});
        });
        
        let countdown = 3;
        const interval = setInterval(() => {
            io.to(roomId).emit('countdown', countdown);

            if (countdown === 0) {
                clearInterval(interval);
                // Lancer la partie pour tous les joueurs du lobby
                room.players.forEach(playerData => {
                    const player = initPlayer(playerData.id);
                    io.to(playerData.id).emit('receiveGame', player);
                    
                    // Démarrer la boucle de jeu
                    let loop;
                    function startLoop() {
                        clearInterval(loop);
                        const p = getPlayer(playerData.id);
                        if (!p) return;
                        
                        loop = setInterval(() => {
                            const currentPlayer = getPlayer(playerData.id);
                            if (!currentPlayer || currentPlayer.isGameOver) {
                                clearInterval(loop);
                                return;
                            }
                            const socketInstance = io.sockets.sockets.get(playerData.id);
                            if (socketInstance) {
                                moveBlock(socketInstance, currentPlayer, { x: 0, y: 1 });
                            }
                        }, p.speed);
                    }
                    
                    startLoop();
                    player.updateSpeed = () => startLoop();
                });
            }
            countdown--;
        }, 1000);
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

    socket.on('gameOver', () => {
        const player = getPlayer(socket.id);
        if (player) {
            player.isGameOver = true;
            console.log('💀 Game Over pour:', socket.id);
        }
    });
}

module.exports = { handleSocketConnection };
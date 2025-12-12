const { initPlayer, getPlayer } = require('./playerManager');
const { getRoomById } = require('./lobbyManager');
const { moveBlock } = require('./gameLogic');

function handleStartGame(socket) {
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
}

function handleStartMultiplayerGame(io, roomId) {
    const room = getRoomById(roomId);

    room.players.forEach(player => {
        io.to(player.id).emit('startMultiplayerGame', {name: player.name, room: room});
    });

    room.gameStarted = true;

    let countdown = 3;

    const interval = setInterval(() => {
        io.to(roomId).emit('countdown', countdown);

        if (countdown === 0) {
            clearInterval(interval);
            room.players.forEach(playerData => {
                const player = initPlayer(playerData.id);
                io.to(playerData.id).emit('receiveGame', player);
                
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
}

function handleGameOver(socket, io, data) {
    const player = getPlayer(socket.id);
    if (player) {
        player.isGameOver = true;
        console.log('💀 Game Over pour:', socket.id);
        
        if (data && data.roomId) {
            const room = getRoomById(data.roomId);
            if (room) {
                room.players.forEach(p => {
                    if (p.id === socket.id) {
                        p.isGameOver = true;
                    }
                const playersAlive = room.players.filter(p => !p.isGameOver);
                console.log(`👥 Joueurs encore vivants: ${playersAlive.length}`);
                
                if (playersAlive.length <= 1) {
                    console.log('🏆 Fin de la partie multijoueur!');
                    room.gameStarted = false;
                    room.players.forEach(p => {
                        io.to(p.id).emit('multiplayerGameEnd', {
                            winner: playersAlive.length === 1 ? playersAlive[0] : null,
                            room: room
                        });
                        p.isGameOver = false;
                    });
                } else {
                    room.players.forEach(p => {
                        io.to(p.id).emit('refreshRoom', { room: room });
                    });
                }
                });
            }
        }
    }
}

module.exports = { handleStartGame, handleStartMultiplayerGame, handleGameOver };

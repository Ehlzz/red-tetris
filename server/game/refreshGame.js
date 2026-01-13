const { getDynamicGrid } = require('../utils/gridUtils');
const { getPlayerRoom, getRoomById } = require('./lobbyManager');

function refreshGame(socket, player) {
    if (!player) return;
    const room = socket.data.room || getRoomById(getPlayerRoom(socket.id));
    if (!socket.data.room && room) socket.data.room = room;

    if (room) {
        if (room.players.length === 1) {
            room.players.forEach(p => {
                socket.emit('multiplayerGameEnd', {
                    winner: player,
                    room: room
                });
                p.isGameOver = false;
            });
            room.gameStarted = false;
        }
        room.players.forEach(p => {
            if (p.id === socket.id) {
                if (player.isGameOver) {
                    p.isGameOver = true;
                }
                p.grid = getDynamicGrid(player);
                p.nextBlock = player.nextBlock;
                p.score = player.score;
                p.level = player.level;
                p.totalColumnsCleared = player.totalColumnsCleared;
            }
        });
        socket.emit('refreshGame', {
            ...player,
            grid: getDynamicGrid(player),
            room: room
        });
    } else {
        socket.emit('refreshGame', {
            ...player,
            grid: getDynamicGrid(player),
        });
    }
}

module.exports = { refreshGame };

const { getRandomBlock } = require('../utils/blockUtils');
const { getPlayerRoom, getRoomById } = require('./lobbyManager');

const players = {};

function initPlayer(socketId) {
    players[socketId] = {
        grid: Array.from({ length: 22 }, () => Array(10).fill(null)),
        currentBlock: getRandomBlock(),
        nextBlock: getRandomBlock(),
        position: { x: 4, y: 0 },
        score: 0,
        speed: 1000,
        level: 1,
        isGameOver: false,
        totalColumnsCleared: 0,
        columnsCleared: 0,
        indestructibleLines: 0
    };

    const room = getRoomById(getPlayerRoom(socketId));
    if (room) {
        const playerInRoom = room.players.find(p => p.id === socketId);
        if (playerInRoom) {
            playerInRoom.grid = players[socketId].grid;
            playerInRoom.score = players[socketId].score;
            playerInRoom.level = players[socketId].level;
            playerInRoom.blocksFixed = 0;
            playerInRoom.totalColumnsCleared = players[socketId].totalColumnsCleared;
            playerInRoom.currentBlock = { ...room.blocksQueue[playerInRoom.blocksFixed] };
            playerInRoom.nextBlock = { ...room.blocksQueue[playerInRoom.blocksFixed + 1] };
            players[socketId].currentBlock = { ...playerInRoom.currentBlock };
            players[socketId].nextBlock = { ...playerInRoom.nextBlock };
            // playerInRoom.nextBlock = players[socketId].nextBlock;
        }
    }

    return players[socketId];
}

function getPlayer(socketId) {
    return players[socketId];
}

function deletePlayer(socketId) {
    delete players[socketId];
}

module.exports = { players, initPlayer, getPlayer, deletePlayer };
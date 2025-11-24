const { getRandomBlock } = require('../utils/blockUtils');

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
        columnsCleared: 0
    };

    return players[socketId];
}

function getPlayer(socketId) {
    return players[socketId];
}

function deletePlayer(socketId) {
    delete players[socketId];
}

module.exports = { players, initPlayer, getPlayer, deletePlayer };
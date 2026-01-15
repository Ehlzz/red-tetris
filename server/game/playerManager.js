const { getRandomBlock } = require('../utils/blockUtils');
const { getPlayerRoom, getRoomById } = require('./lobbyManager');

class Player {
    constructor(id) {
        this.id = id;
        this.grid = Array.from({ length: 22 }, () => Array(10).fill(null));
        this.currentBlock = getRandomBlock();
        this.nextBlock = getRandomBlock();
        this.position = { x: 4, y: 0 };
        this.score = 0;
        this.speed = 1000;
        this.level = 1;
        this.isGameOver = false;
        this.totalColumnsCleared = 0;
        this.columnsCleared = 0;
        this.indestructibleLines = 0;
        this.updateSpeed = () => {};
    }

    syncWithRoom(room) {
        if (!room) return;
        const playerInRoom = room.players.find(p => p.id === this.id);
        if (!playerInRoom) return;

        playerInRoom.grid = this.grid;
        playerInRoom.score = this.score;
        playerInRoom.level = this.level;
        playerInRoom.blocksFixed = 0;
        playerInRoom.totalColumnsCleared = this.totalColumnsCleared;
        playerInRoom.currentBlock = { ...room.blocksQueue[playerInRoom.blocksFixed] };
        playerInRoom.nextBlock = { ...room.blocksQueue[playerInRoom.blocksFixed + 1] };
        this.currentBlock = { ...playerInRoom.currentBlock };
        this.nextBlock = { ...playerInRoom.nextBlock };
    }

    toJSON() {
        const { id, grid, currentBlock, nextBlock, position, score, speed, level, isGameOver, totalColumnsCleared, columnsCleared, indestructibleLines } = this;
        return { id, grid, currentBlock, nextBlock, position, score, speed, level, isGameOver, totalColumnsCleared, columnsCleared, indestructibleLines };
    }
}

const players = {};

function initPlayer(socketId) {
    const player = new Player(socketId);
    players[socketId] = player;

    const room = getRoomById(getPlayerRoom(socketId));
    if (room) {
        player.syncWithRoom(room);
    }

    return player;
}

function getPlayer(socketId) {
    return players[socketId];
}

function deletePlayer(socketId) {
    delete players[socketId];
}

module.exports = { Player, players, initPlayer, getPlayer, deletePlayer };
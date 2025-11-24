const { getRandomBlock } = require('../utils/blockUtils');
const { isCollision } = require('./collisionManager');
const { getPlayerRoom, getRoomById } = require('./lobbyManager');
const { getPlayer } = require('./playerManager');

function fixBlock(player) {
    if (!player) return;

    player.currentBlock.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                const gridY = player.position.y + y;
                const gridX = player.position.x + x;
                if (gridY >= 0 && gridY < 22 && gridX >= 0 && gridX < 10) {
                    player.grid[gridY][gridX] = player.currentBlock.color;
                }
            }
        });
    });
}

function checkLines(player, socket) {
    if (!player) return;

    let newGrid = player.grid.filter(row => !row.every(cell => cell !== null));
    const linesCleared = player.grid.length - newGrid.length;
    player.columnsCleared += linesCleared;		
    for (let i = 0; i < linesCleared; i++) {
        newGrid.unshift(Array(10).fill(null));
    }
    const room = getRoomById(getPlayerRoom(socket.id));
    let playerInRoom = null;
    if (room) 
        playerInRoom = room.players.find(p => p.id === socket.id);
    player.grid = newGrid;
    player.score += linesCleared * 100;
    player.totalColumnsCleared += linesCleared;
    if (playerInRoom) {
        playerInRoom.score = player.score;
        playerInRoom.totalColumnsCleared = player.totalColumnsCleared;
    }
    while (player.columnsCleared >= 7) {
        player.columnsCleared = Math.min(0, player.columnsCleared - 7);
        player.speed = Math.max(100, Math.floor(player.speed * 0.77));
        player.level += 1;
        player.updateSpeed();
    }
    playerInRoom.level = player.level;
}

function setHoverBlock(player) {
    if (!player) return;
    
    let hoverY = player.position.y;
    while (!isCollision(player, { x: 0, y: hoverY - player.position.y + 1 })) {
        hoverY++;
    }

    const grid = player.grid.map(row => row.map(cell => (cell === 'hover' ? null : cell)));
    player.grid = grid;
    
    for (let y = 0; y < player.currentBlock.shape.length; y++) {
        for (let x = 0; x < player.currentBlock.shape[y].length; x++) {
            if (player.currentBlock.shape[y][x]) {
                const gridY = hoverY + y;
                const gridX = player.position.x + x;
                if (gridY >= 0 && gridY < 22 && gridX >= 0 && gridX < 10) {
                    player.grid[gridY][gridX] = 'hover';
                }
            }
        }
    }
}

module.exports = { fixBlock, checkLines, setHoverBlock };
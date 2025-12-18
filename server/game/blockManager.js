const { getRandomBlock } = require('../utils/blockUtils');
const { isCollision } = require('./collisionManager');
const { getPlayerRoom, getRoomById } = require('./lobbyManager');
const { getPlayer } = require('./playerManager');
const { refreshGame } = require('./gameLogic');

function fixBlock(player, socket) {
    if (!player) return;

    const fixedPositions = [];

    player.currentBlock.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                const gridY = player.position.y + y;
                const gridX = player.position.x + x;
                if (gridY >= 0 && gridY < 22 && gridX >= 0 && gridX < 10) {
                    player.grid[gridY][gridX] = player.currentBlock.color;
                    fixedPositions.push({ x: gridX + 1, y: gridY - 1 });
                }

                if (gridY < 2) {
                    player.isGameOver = true;
                    const room = socket.data.room || getRoomById(getPlayerRoom(socket.id));
                    if (socket) {
                        socket.emit('gameOver', { score: player.score });
                        return;
                    }
                    if (room) {
                        refreshGame(socket, player);
                    }
                }
            }
        });
    });
    if (socket && fixedPositions.length > 0) {
        socket.emit('blockFixed', { positions: fixedPositions });
    }
}

function checkLines(player, socket) {
    if (!player) return;

    let newGrid = player.grid.filter(row => !row.every(cell => cell !== null));
    const linesCleared = player.grid.length - newGrid.length;
    player.columnsCleared += linesCleared;		
    for (let i = 0; i < linesCleared; i++) {
        newGrid.unshift(Array(10).fill(null));
    }
    player.grid = newGrid;
    player.score += linesCleared * 100;
    player.totalColumnsCleared += linesCleared;
    while (player.columnsCleared >= 7) {
        player.columnsCleared = Math.min(0, player.columnsCleared - 7);
        player.speed = Math.max(100, Math.floor(player.speed * 0.77));
        player.level += 1;
        player.updateSpeed();
    }
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
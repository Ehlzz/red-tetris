const { getRandomBlock } = require('../utils/blockUtils');
const { getDynamicGrid } = require('../utils/gridUtils');
const { isCollision } = require('./collisionManager');
const { fixBlock, checkLines, setHoverBlock } = require('./blockManager');

function refreshGame(socket, player) {
    if (!player) return;

    socket.emit('refreshGame', {
        ...player,
        grid: getDynamicGrid(player)
    });
}

function moveBlock(socket, player, direction) {
    if (!player || player.isGameOver) return false;
    
    if (isCollision(player, direction)) {
        if (!player.isGameOver && direction.y === 1) {
            fixBlock(player);
            checkLines(player);
            player.currentBlock = player.nextBlock;
            player.nextBlock = getRandomBlock();
            player.position = { x: 4, y: 0 };
            refreshGame(socket, player);
        }
        if (direction.y === 1 && isCollision(player, { x: 0, y: 0 })) {
            player.isGameOver = true;
            console.log('💀 Game Over pour:', socket.id);
        }
        return false;
    }
    
    player.position.x += direction.x;
    player.position.y += direction.y;

    setHoverBlock(player);
    refreshGame(socket, player);

    return true;
}

function rotateBlock(socket, player) {
    if (!player || player.isGameOver) return;
    
    const { shape } = player.currentBlock;
    const rotatedShape = shape[0].map((_, index) =>
        shape.map(row => row[index]).reverse()
    );

    player.currentBlock.shape = rotatedShape;
    setHoverBlock(player);
    refreshGame(socket, player);
}

function dropBlock(socket, player) {
    if (!player || player.isGameOver) return;

    while (moveBlock(socket, player, { x: 0, y: 1 }));
    refreshGame(socket, player);
}

module.exports = { refreshGame, moveBlock, rotateBlock, dropBlock };
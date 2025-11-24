function isCollision(player, direction) {
    if (!player) return false;

    for (let y = 0; y < player.currentBlock.shape.length; y++) {
        for (let x = 0; x < player.currentBlock.shape[y].length; x++) {
            if (player.currentBlock.shape[y][x]) {
                const newX = player.position.x + x + direction.x;
                const newY = player.position.y + y + direction.y;
                
                if (newX < 0 || newX >= 10 || newY >= 22) {
                    return true;
                }

                if (newY >= 0 && player.grid[newY][newX] && player.grid[newY][newX] !== 'hover') {
                    return true;
                }
            }
        }
    }
    return false;
}

module.exports = { isCollision };
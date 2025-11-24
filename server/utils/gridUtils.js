function getDynamicGrid(player) {
    const { grid, currentBlock, position } = player;
    const displayGrid = grid.map(row => row.slice());

    currentBlock.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                const gridY = position.y + y;
                const gridX = position.x + x;
                if (gridY >= 0 && gridY < 22 && gridX >= 0 && gridX < 10) {
                    displayGrid[gridY][gridX] = currentBlock.color;
                }
            }
        });
    });

    return displayGrid;
}

module.exports = { getDynamicGrid };
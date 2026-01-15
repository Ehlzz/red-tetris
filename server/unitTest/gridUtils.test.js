import { describe, it, expect, beforeEach } from 'vitest';

const { getDynamicGrid } = await import('../utils/gridUtils.js');

describe('gridUtils', () => {
    let mockPlayer;

    beforeEach(() => {
        mockPlayer = {
            grid: Array(22).fill(null).map(() => Array(10).fill(null)),
            currentBlock: {
                shape: [
                    [0, 1, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                color: 'purple'
            },
            position: { x: 3, y: 10 }
        };
    });

    describe('getDynamicGrid', () => {
        it('should return grid with current block overlay', () => {
            const dynamicGrid = getDynamicGrid(mockPlayer);

            expect(dynamicGrid).toHaveLength(22);
            expect(dynamicGrid[0]).toHaveLength(10);
        });

        it('should place block at correct position', () => {
            const dynamicGrid = getDynamicGrid(mockPlayer);

            expect(dynamicGrid[10][4]).toBe('purple');
            expect(dynamicGrid[11][3]).toBe('purple');
            expect(dynamicGrid[11][4]).toBe('purple');
            expect(dynamicGrid[11][5]).toBe('purple');
        });

        it('should not modify original grid', () => {
            const originalGrid = mockPlayer.grid.map(row => [...row]);
            
            getDynamicGrid(mockPlayer);

            expect(mockPlayer.grid).toEqual(originalGrid);
        });

        it('should preserve existing blocks in grid', () => {
            mockPlayer.grid[20][5] = 'red';
            
            const dynamicGrid = getDynamicGrid(mockPlayer);

            expect(dynamicGrid[20][5]).toBe('red');
        });

        it('should handle block at top of grid', () => {
            mockPlayer.position.y = 0;

            const dynamicGrid = getDynamicGrid(mockPlayer);

            expect(dynamicGrid[0][4]).toBe('purple');
        });

        it('should handle block at left edge', () => {
            mockPlayer.position.x = 0;

            const dynamicGrid = getDynamicGrid(mockPlayer);

            expect(dynamicGrid[10][1]).toBe('purple');
            expect(dynamicGrid[11][0]).toBe('purple');
        });

        it('should handle block at right edge', () => {
            mockPlayer.position.x = 7;

            const dynamicGrid = getDynamicGrid(mockPlayer);

            expect(dynamicGrid[10][8]).toBe('purple');
            expect(dynamicGrid[11][9]).toBe('purple');
        });

        it('should not place blocks outside grid boundaries', () => {
            mockPlayer.position.x = 9;
            mockPlayer.position.y = 21;

            const dynamicGrid = getDynamicGrid(mockPlayer);

            dynamicGrid.forEach(row => {
                expect(row).toHaveLength(10);
            });
        });

        it('should handle I block', () => {
            mockPlayer.currentBlock = {
                shape: [
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ],
                color: 'cyan'
            };
            mockPlayer.position = { x: 3, y: 10 };

            const dynamicGrid = getDynamicGrid(mockPlayer);

            expect(dynamicGrid[11][3]).toBe('cyan');
            expect(dynamicGrid[11][4]).toBe('cyan');
            expect(dynamicGrid[11][5]).toBe('cyan');
            expect(dynamicGrid[11][6]).toBe('cyan');
        });

        it('should handle O block', () => {
            mockPlayer.currentBlock = {
                shape: [
                    [1, 1],
                    [1, 1]
                ],
                color: 'yellow'
            };
            mockPlayer.position = { x: 4, y: 10 };

            const dynamicGrid = getDynamicGrid(mockPlayer);

            expect(dynamicGrid[10][4]).toBe('yellow');
            expect(dynamicGrid[10][5]).toBe('yellow');
            expect(dynamicGrid[11][4]).toBe('yellow');
            expect(dynamicGrid[11][5]).toBe('yellow');
        });

        it('should overlay block on top of existing blocks', () => {
            mockPlayer.grid[11][4] = 'red';
            mockPlayer.position = { x: 3, y: 10 };

            const dynamicGrid = getDynamicGrid(mockPlayer);

            expect(dynamicGrid[11][4]).toBe('purple');
        });

        it('should handle empty cells in block shape', () => {
            mockPlayer.currentBlock = {
                shape: [
                    [0, 1, 1],
                    [1, 1, 0],
                    [0, 0, 0]
                ],
                color: 'green'
            };
            mockPlayer.position = { x: 3, y: 10 };

            const dynamicGrid = getDynamicGrid(mockPlayer);

            expect(dynamicGrid[10][3]).toBeNull();
            expect(dynamicGrid[10][4]).toBe('green');
            expect(dynamicGrid[10][5]).toBe('green');
            expect(dynamicGrid[11][3]).toBe('green');
            expect(dynamicGrid[11][4]).toBe('green');
            expect(dynamicGrid[11][5]).toBeNull();
        });

        it('should handle block with negative position attempt', () => {
            mockPlayer.position = { x: -1, y: 10 };

            const dynamicGrid = getDynamicGrid(mockPlayer);

            dynamicGrid.forEach(row => {
                expect(row).toHaveLength(10);
            });
        });
    });
});

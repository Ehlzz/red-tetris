import { describe, it, expect, beforeEach, vi } from 'vitest';

const { fixBlock, checkLines, setHoverBlock } = await import('../game/blockManager.js');
const { isCollision } = await import('../game/collisionManager.js');

vi.mock('../game/collisionManager.js', () => ({
    isCollision: vi.fn()
}));

vi.mock('../utils/blockUtils.js', () => ({
    getRandomBlock: vi.fn()
}));

vi.mock('../game/lobbyManager.js', () => ({
    getPlayerRoom: vi.fn(),
    getRoomById: vi.fn()
}));

vi.mock('../game/playerManager.js', () => ({
    getPlayer: vi.fn()
}));

describe('blockManager', () => {
    let mockPlayer;
    let mockSocket;

    beforeEach(() => {
        vi.clearAllMocks();
        
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
            position: { x: 3, y: 19 },
            score: 0,
            speed: 1000,
            level: 1,
            columnsCleared: 0,
            totalColumnsCleared: 0,
            isGameOver: false,
            updateSpeed: vi.fn()
        };

        mockSocket = {
            id: 'socket123',
            emit: vi.fn(),
            data: { room: null }
        };
    });

    describe('fixBlock', () => {
        it('should fix block positions on the grid', () => {
            fixBlock(mockPlayer, mockSocket);
            
            expect(mockPlayer.grid[19][4]).toBe('purple');
            expect(mockPlayer.grid[20][3]).toBe('purple');
            expect(mockPlayer.grid[20][4]).toBe('purple');
            expect(mockPlayer.grid[20][5]).toBe('purple');
        });

        it('should handle null player', () => {
            expect(() => fixBlock(null, mockSocket)).not.toThrow();
        });

        it('should set game over when block fixed at top', () => {
            mockPlayer.position.y = 0;
            
            fixBlock(mockPlayer, mockSocket);
            
            expect(mockPlayer.isGameOver).toBe(true);
            expect(mockSocket.emit).toHaveBeenCalledWith('gameOver', { score: 0 });
        });

        it('should not fix positions outside grid boundaries', () => {
            mockPlayer.position.x = -2;
            
            fixBlock(mockPlayer, mockSocket);
            
            const hasNegativeX = mockPlayer.grid.some(row => 
                row.slice(0, 0).some(cell => cell === 'purple')
            );
            expect(hasNegativeX).toBe(false);
        });

        it('should handle block at grid edge', () => {
            mockPlayer.position.x = 8;
            mockPlayer.position.y = 19;
            
            fixBlock(mockPlayer, mockSocket);
            
            expect(mockPlayer.grid[19][9]).toBe('purple');
            expect(mockPlayer.grid[20][8]).toBe('purple');
            expect(mockPlayer.grid[20][9]).toBe('purple');
        });
    });

    describe('checkLines', () => {
        it('should clear a single completed line', () => {
            mockPlayer.grid[21] = Array(10).fill('red');
            
            checkLines(mockPlayer, mockSocket);
            
            expect(mockPlayer.grid[21].every(cell => cell === null)).toBe(true);
            expect(mockPlayer.score).toBe(100);
            expect(mockPlayer.columnsCleared).toBe(1);
            expect(mockPlayer.totalColumnsCleared).toBe(1);
        });

        it('should clear multiple completed lines', () => {
            mockPlayer.grid[20] = Array(10).fill('red');
            mockPlayer.grid[21] = Array(10).fill('blue');
            
            checkLines(mockPlayer, mockSocket);
            
            expect(mockPlayer.grid[20].every(cell => cell === null)).toBe(true);
            expect(mockPlayer.grid[21].every(cell => cell === null)).toBe(true);
            expect(mockPlayer.score).toBe(200);
            expect(mockPlayer.columnsCleared).toBe(2);
            expect(mockPlayer.totalColumnsCleared).toBe(2);
        });

        it('should not clear incomplete lines', () => {
            mockPlayer.grid[21] = Array(10).fill('red');
            mockPlayer.grid[21][5] = null;
            
            checkLines(mockPlayer, mockSocket);
            
            expect(mockPlayer.score).toBe(0);
            expect(mockPlayer.columnsCleared).toBe(0);
        });

        it('should level up after clearing 7 lines', () => {
            for (let i = 15; i < 22; i++) {
                mockPlayer.grid[i] = Array(10).fill('red');
            }
            
            checkLines(mockPlayer, mockSocket);
            
            expect(mockPlayer.level).toBe(2);
            expect(mockPlayer.speed).toBe(Math.max(100, Math.floor(1000 * 0.77)));
            expect(mockPlayer.updateSpeed).toHaveBeenCalled();
        });

        it('should handle multiple level ups', () => {
            mockPlayer.columnsCleared = 13;
            
            checkLines(mockPlayer, mockSocket);
            
            expect(mockPlayer.level).toBe(2);
        });

        it('should handle null player', () => {
            expect(() => checkLines(null, mockSocket)).not.toThrow();
        });

        it('should add empty rows at top after clearing', () => {
            mockPlayer.grid[21] = Array(10).fill('red');
            const initialLength = mockPlayer.grid.length;
            
            checkLines(mockPlayer, mockSocket);
            
            expect(mockPlayer.grid.length).toBe(initialLength);
            expect(mockPlayer.grid[0].every(cell => cell === null)).toBe(true);
        });

        it('should maintain minimum speed of 100', () => {
            mockPlayer.speed = 150;
            for (let i = 15; i < 22; i++) {
                mockPlayer.grid[i] = Array(10).fill('red');
            }
            
            checkLines(mockPlayer, mockSocket);
            
            expect(mockPlayer.speed).toBeGreaterThanOrEqual(100);
        });
    });

    describe('setHoverBlock', () => {
        beforeEach(() => {
            isCollision.mockImplementation((player, direction) => {
                const newY = player.position.y + direction.y;
                return newY >= 21;
            });
        });

        it('should set hover block at bottom position', () => {
            mockPlayer.position.y = 10;
            
            setHoverBlock(mockPlayer);
            
            let hoverFound = false;
            for (let y = 0; y < mockPlayer.grid.length; y++) {
                for (let x = 0; x < mockPlayer.grid[y].length; x++) {
                    if (mockPlayer.grid[y][x] === 'hover') {
                        hoverFound = true;
                        expect(y).toBeGreaterThanOrEqual(mockPlayer.position.y);
                    }
                }
            }
            expect(hoverFound).toBe(true);
        });

        it('should clear previous hover blocks', () => {
            mockPlayer.grid[15][4] = 'hover';
            mockPlayer.position.y = 10;
            
            setHoverBlock(mockPlayer);
            
            expect(mockPlayer.grid[15][4]).not.toBe('hover');
        });

        it('should handle null player', () => {
            expect(() => setHoverBlock(null)).not.toThrow();
        });

        it('should not place hover outside grid boundaries', () => {
            mockPlayer.position.x = 8;
            mockPlayer.position.y = 10;
            
            setHoverBlock(mockPlayer);
            
            mockPlayer.grid.forEach((row, y) => {
                row.forEach((cell, x) => {
                    if (cell === 'hover') {
                        expect(x).toBeGreaterThanOrEqual(0);
                        expect(x).toBeLessThan(10);
                        expect(y).toBeGreaterThanOrEqual(0);
                        expect(y).toBeLessThan(22);
                    }
                });
            });
        });

        it('should preserve existing blocks when setting hover', () => {
            mockPlayer.grid[20][5] = 'red';
            mockPlayer.position.y = 10;
            
            setHoverBlock(mockPlayer);
            
            expect(mockPlayer.grid[20][5]).toBe('red');
        });

        it('should handle block at grid edge', () => {
            mockPlayer.position.x = 0;
            mockPlayer.position.y = 10;
            isCollision.mockImplementation((player, direction) => {
                return player.position.y + direction.y >= 20;
            });
            
            setHoverBlock(mockPlayer);
            
            const hoverCells = [];
            mockPlayer.grid.forEach((row, y) => {
                row.forEach((cell, x) => {
                    if (cell === 'hover') hoverCells.push({ x, y });
                });
            });
            
            expect(hoverCells.length).toBeGreaterThan(0);
        });
    });
});

import { describe, it, expect, beforeEach } from 'vitest';

const { isCollision } = await import('../game/collisionManager.js');

describe('collisionManager', () => {
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

    describe('isCollision', () => {
        it('should return false when no collision', () => {
            const result = isCollision(mockPlayer, { x: 0, y: 0 });
            expect(result).toBe(false);
        });

        it('should return true when collision with left wall', () => {
            mockPlayer.position.x = 0;
            const result = isCollision(mockPlayer, { x: -1, y: 0 });
            expect(result).toBe(true);
        });

        it('should return true when collision with right wall', () => {
            mockPlayer.position.x = 8;
            const result = isCollision(mockPlayer, { x: 1, y: 0 });
            expect(result).toBe(true);
        });

        it('should return true when collision with bottom', () => {
            mockPlayer.position.y = 20;
            const result = isCollision(mockPlayer, { x: 0, y: 1 });
            expect(result).toBe(true);
        });

        it('should return true when collision with fixed blocks', () => {
            mockPlayer.grid[12][3] = 'red';
            const result = isCollision(mockPlayer, { x: 0, y: 1 });
            expect(result).toBe(true);
        });

        it('should ignore hover blocks', () => {
            mockPlayer.grid[12][3] = 'hover';
            const result = isCollision(mockPlayer, { x: 0, y: 1 });
            expect(result).toBe(false);
        });

        it('should return false for null player', () => {
            const result = isCollision(null, { x: 0, y: 0 });
            expect(result).toBe(false);
        });

        it('should handle block at top of grid', () => {
            mockPlayer.position.y = 0;
            const result = isCollision(mockPlayer, { x: 0, y: -1 });
            expect(result).toBe(false);
        });

        it('should detect collision with block at edge', () => {
            mockPlayer.position.x = 9;
            const result = isCollision(mockPlayer, { x: 0, y: 0 });
            expect(result).toBe(true);
        });

        it('should handle movement in both x and y directions', () => {
            mockPlayer.position.x = 0;
            mockPlayer.position.y = 20;
            const result = isCollision(mockPlayer, { x: -1, y: 1 });
            expect(result).toBe(true);
        });
    });
});

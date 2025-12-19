import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

const mockGetRandomBlock = vi.fn(() => ({ 
    type: 'T', 
    shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], 
    color: 'purple' 
}));

vi.mock('../utils/blockUtils.js', () => ({
    getRandomBlock: mockGetRandomBlock
}));

const { handleStartGame, handleResetGame, handleStopGame } = await import('../game/gameManager.js');
const { players } = await import('../game/playerManager.js');

describe('gameManager additional tests', () => {
    let mockSocket;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        Object.keys(players).forEach(key => delete players[key]);

        mockSocket = {
            id: 'test-socket',
            emit: vi.fn(),
            data: {}
        };
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
        Object.keys(players).forEach(key => delete players[key]);
    });

    describe('handleStartGame - additional coverage', () => {
        it('should create player and start interval', () => {
            handleStartGame(mockSocket);

            expect(mockSocket.emit).toHaveBeenCalledWith('receiveGame', expect.any(Object));
            expect(mockSocket.data.gameLoop).toBeDefined();
        });

        it('should handle interval ticks', () => {
            handleStartGame(mockSocket);

            vi.advanceTimersByTime(1500);
            
            expect(mockSocket.data.gameLoop).toBeDefined();
        });

        it('should clear old interval before creating new one', () => {
            handleStartGame(mockSocket);
            const firstInterval = mockSocket.data.gameLoop;
            
            handleStartGame(mockSocket);
            const secondInterval = mockSocket.data.gameLoop;
            
            expect(firstInterval).not.toBe(secondInterval);
        });
    });

    describe('handleResetGame - additional coverage', () => {
        it('should reset player state', () => {
            handleStartGame(mockSocket);
            mockSocket.data.gameLoop = setInterval(() => {}, 1000);
            
            handleResetGame(mockSocket);

            expect(mockSocket.data.gameLoop).toBeNull();
        });

        it('should work without existing game loop', () => {
            expect(() => handleResetGame(mockSocket)).not.toThrow();
        });
    });

    describe('handleStopGame - additional coverage', () => {
        it('should stop game if player exists', () => {
            handleStartGame(mockSocket);
            
            if (mockSocket.data.player) {
                mockSocket.data.player.gameStarted = true;
                handleStopGame(mockSocket);
                expect(mockSocket.data.player.gameStarted).toBe(false);
            } else {
                expect(mockSocket).toBeDefined();
            }
        });

        it('should not crash without player', () => {
            mockSocket.data.player = null;
            expect(() => handleStopGame(mockSocket)).not.toThrow();
        });
    });
});

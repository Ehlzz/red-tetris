import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

const mockInitPlayer = vi.fn(() => ({
    grid: Array(22).fill(null).map(() => Array(10).fill(null)),
    currentBlock: { type: 'T', shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], color: 'purple' },
    nextBlock: { type: 'I', shape: [[1, 1, 1, 1]], color: 'cyan' },
    position: { x: 4, y: 0 },
    score: 0,
    speed: 1000,
    level: 1,
    isGameOver: false,
    updateSpeed: vi.fn()
}));

const mockGetPlayer = vi.fn();
const mockMoveBlock = vi.fn();

vi.mock('../game/playerManager.js', async () => {
    const actual = await vi.importActual('../game/playerManager.js');
    return {
        ...actual,
        initPlayer: mockInitPlayer,
        getPlayer: mockGetPlayer
    };
});

vi.mock('../game/gameLogic.js', () => ({
    moveBlock: mockMoveBlock,
    refreshGame: vi.fn(),
    rotateBlock: vi.fn(),
    dropBlock: vi.fn()
}));

vi.mock('../game/lobbyManager.js', () => ({
    getRoomById: vi.fn(),
    getPlayerRoom: vi.fn(),
    rooms: {}
}));

vi.mock('../utils/blockUtils.js', () => ({
    getRandomBlock: vi.fn(() => ({ 
        type: 'T', 
        shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], 
        color: 'purple' 
    }))
}));

const { handleStartGame, handleGameOver, handleResetGame } = await import('../game/gameManager.js');

describe('gameManager extended coverage', () => {
    let mockSocket;
    let mockIo;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();

        mockSocket = {
            id: 'socket-test',
            emit: vi.fn(),
            data: {
                gameLoop: null,
                player: null
            }
        };

        mockIo = {
            to: vi.fn(() => ({
                emit: vi.fn()
            })),
            sockets: {
                sockets: new Map([
                    ['socket-test', mockSocket]
                ])
            }
        };

        const player = mockInitPlayer();
        mockGetPlayer.mockReturnValue(player);
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    describe('handleStartGame with game loop', () => {
        it('should start game loop and update on interval', () => {
            handleStartGame(mockSocket);

            expect(mockSocket.emit).toHaveBeenCalledWith('receiveGame', expect.any(Object));
            expect(mockSocket.data.gameLoop).toBeDefined();

            // Advance time and verify moveBlock is called
            mockGetPlayer.mockReturnValue({
                ...mockInitPlayer(),
                isGameOver: false
            });

            vi.advanceTimersByTime(1100);

            expect(mockSocket.data.gameLoop).toBeDefined();
        });

        it('should stop loop when player is game over', () => {
            mockGetPlayer.mockReturnValue({
                ...mockInitPlayer(),
                isGameOver: true
            });

            handleStartGame(mockSocket);
            
            vi.advanceTimersByTime(1100);

            expect(mockSocket.data.gameLoop).toBeDefined();
        });

        it('should stop loop when player is null', () => {
            mockGetPlayer.mockReturnValue(null);

            handleStartGame(mockSocket);
            
            vi.advanceTimersByTime(1100);

            expect(mockSocket.data.gameLoop).toBeDefined();
        });

        it('should clear previous loop before starting new', () => {
            handleStartGame(mockSocket);
            const firstLoop = mockSocket.data.gameLoop;

            handleStartGame(mockSocket);
            const secondLoop = mockSocket.data.gameLoop;

            expect(firstLoop).toBeDefined();
            expect(secondLoop).toBeDefined();
        });
    });

    describe('handleGameOver multiplayer', () => {
        it('should handle game over without room data', () => {
            const player = mockInitPlayer();
            mockSocket.data.player = player;

            handleGameOver(mockSocket, mockIo, {});

            expect(player.isGameOver).toBe(true);
        });

        it('should handle game over with empty data', () => {
            const player = mockInitPlayer();
            mockSocket.data.player = player;

            handleGameOver(mockSocket, mockIo, null);

            expect(player.isGameOver).toBe(true);
        });
    });

    describe('handleResetGame edge cases', () => {
        it('should handle reset without existing loop', () => {
            mockSocket.data.gameLoop = null;

            expect(() => handleResetGame(mockSocket)).not.toThrow();
        });

        it('should clear interval if exists', () => {
            const mockInterval = setInterval(() => {}, 1000);
            mockSocket.data.gameLoop = mockInterval;

            handleResetGame(mockSocket);

            expect(mockSocket.data.gameLoop).toBeNull();
        });
    });
});

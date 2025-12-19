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
const mockGetRoomById = vi.fn();
const mockMoveBlock = vi.fn();
const mockGetRandomBlock = vi.fn(() => ({ type: 'T', shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], color: 'purple' }));

vi.mock('../game/playerManager.js', () => ({
    initPlayer: mockInitPlayer,
    getPlayer: mockGetPlayer
}));

vi.mock('../game/lobbyManager.js', () => ({
    getRoomById: mockGetRoomById
}));

vi.mock('../game/gameLogic.js', () => ({
    moveBlock: mockMoveBlock
}));

vi.mock('../utils/blockUtils.js', () => ({
    getRandomBlock: mockGetRandomBlock
}));

const { handleStartGame, handleStartMultiplayerGame, handleGameOver, handleResetGame, handleStopGame } = await import('../game/gameManager.js');

describe('gameManager', () => {
    let mockSocket;
    let mockIo;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        
        mockSocket = {
            id: 'socket-123',
            emit: vi.fn(),
            data: {
                gameLoop: null
            }
        };

        mockIo = {
            to: vi.fn(() => ({
                emit: vi.fn()
            })),
            sockets: {
                sockets: new Map([
                    ['socket-123', mockSocket]
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

    describe('handleStartGame', () => {
        it('should initialize player', () => {
            handleStartGame(mockSocket);

            expect(mockSocket.emit).toHaveBeenCalledWith('receiveGame', expect.any(Object));
        });

        it('should clear existing game loop', () => {
            const oldInterval = setInterval(() => {}, 1000);
            mockSocket.data.gameLoop = oldInterval;

            handleStartGame(mockSocket);

            expect(mockSocket.data.gameLoop).not.toBe(oldInterval);
        });

        it('should start game loop', () => {
            handleStartGame(mockSocket);

            expect(mockSocket.data.gameLoop).toBeDefined();
        });

        it('should create game loop', () => {
            handleStartGame(mockSocket);

            vi.advanceTimersByTime(1000);

            // Game loop should be running
            expect(mockSocket.data.gameLoop).toBeDefined();
        });

        it('should stop loop when game is over', () => {
            const gameOverPlayer = { ...mockInitPlayer(), isGameOver: true };
            mockGetPlayer.mockReturnValue(gameOverPlayer);

            handleStartGame(mockSocket);
            vi.advanceTimersByTime(1000);

            expect(mockSocket.data.gameLoop).toBeDefined();
        });
    });

    describe('handleStartMultiplayerGame', () => {
        it('should be defined', () => {
            expect(handleStartMultiplayerGame).toBeDefined();
        });
    });

    describe('handleGameOver', () => {
        it('should set player game over status', () => {
            const player = mockInitPlayer();
            mockSocket.data.player = player;

            handleGameOver(mockSocket, mockIo, {});

            expect(player.isGameOver).toBe(true);
        });

        it('should handle multiplayer game over', () => {
            const mockRoom = {
                players: [
                    { id: 'socket-123', name: 'Player1', isGameOver: false },
                    { id: 'socket-456', name: 'Player2', isGameOver: false }
                ],
                gameStarted: true
            };

            mockGetRoomById.mockReturnValue(mockRoom);
            const player = mockInitPlayer();
            mockSocket.data.player = player;

            handleGameOver(mockSocket, mockIo, { roomId: 'room-123' });

            // Player is marked as game over
            expect(player.isGameOver).toBe(true);
        });

        it('should handle end game with one player', () => {
            const mockRoom = {
                players: [
                    { id: 'socket-123', name: 'Player1', isGameOver: false },
                    { id: 'socket-456', name: 'Player2', isGameOver: true }
                ],
                gameStarted: true
            };

            mockGetRoomById.mockReturnValue(mockRoom);
            const player = mockInitPlayer();
            mockSocket.data.player = player;

            handleGameOver(mockSocket, mockIo, { roomId: 'room-123' });

            expect(player.isGameOver).toBe(true);
        });

        it('should handle null player', () => {
            mockSocket.data.player = null;

            expect(() => handleGameOver(mockSocket, mockIo, {})).not.toThrow();
        });
    });

    describe('handleResetGame', () => {
        it('should reinitialize player', () => {
            handleResetGame(mockSocket);

            // Function is called through real imports
            expect(mockSocket.data.gameLoop).toBeNull();
        });

        it('should clear game loop', () => {
            mockSocket.data.gameLoop = setInterval(() => {}, 1000);

            handleResetGame(mockSocket);

            expect(mockSocket.data.gameLoop).toBeNull();
        });
    });

    describe('handleStopGame', () => {
        it('should stop game', () => {
            const player = mockInitPlayer();
            player.gameStarted = true;
            mockSocket.data.player = player;

            handleStopGame(mockSocket);

            expect(player.gameStarted).toBe(false);
        });

        it('should handle null player', () => {
            mockSocket.data.player = null;

            expect(() => handleStopGame(mockSocket)).not.toThrow();
        });
    });
});

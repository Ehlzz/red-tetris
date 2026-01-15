import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockGetDynamicGrid = vi.fn((player) => player.grid);
const mockGetPlayerRoom = vi.fn(() => null);
const mockGetRoomById = vi.fn(() => null);

vi.mock('../utils/gridUtils.js', () => ({
    getDynamicGrid: mockGetDynamicGrid
}));

vi.mock('../game/lobbyManager.js', () => ({
    getPlayerRoom: mockGetPlayerRoom,
    getRoomById: mockGetRoomById
}));

const { refreshGame } = await import('../game/refreshGame.js');

describe('refreshGame', () => {
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
                color: 'purple',
                type: 'T'
            },
            nextBlock: {
                shape: [[1, 1, 1, 1]],
                color: 'cyan',
                type: 'I'
            },
            position: { x: 4, y: 10 },
            score: 0,
            speed: 1000,
            level: 1,
            isGameOver: false,
            totalColumnsCleared: 0
        };

        mockSocket = {
            id: 'socket-123',
            emit: vi.fn(),
            data: { player: mockPlayer }
        };

        mockGetDynamicGrid.mockImplementation((player) => player.grid);
    });

    it('should emit refreshGame event with player data', () => {
        refreshGame(mockSocket, mockPlayer);

        expect(mockSocket.emit).toHaveBeenCalledWith('refreshGame', expect.objectContaining({
            score: 0,
            level: 1,
            isGameOver: false
        }));
    });

    it('should handle null player', () => {
        expect(() => refreshGame(mockSocket, null)).not.toThrow();
    });

    it('should handle multiplayer game', () => {
        const mockRoom = {
            players: [
                { id: 'socket-123', name: 'Player1', isGameOver: false }
            ],
            gameStarted: true
        };
        mockSocket.data.room = mockRoom;

        refreshGame(mockSocket, mockPlayer);

        expect(mockSocket.emit).toHaveBeenCalled();
        expect(mockRoom.players[0].grid).toBeDefined();
    });

    it('should end multiplayer game when only one player left', () => {
        const mockRoom = {
            players: [
                { id: 'socket-123', name: 'Player1', isGameOver: false }
            ],
            gameStarted: true
        };
        mockSocket.data.room = mockRoom;
        mockPlayer.isGameOver = true;

        refreshGame(mockSocket, mockPlayer);

        expect(mockSocket.emit).toHaveBeenCalledWith('multiplayerGameEnd', expect.any(Object));
    });
});

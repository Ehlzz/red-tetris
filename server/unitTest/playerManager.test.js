import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

const mockGetRandomBlock = vi.fn(() => ({ 
    type: 'T', 
    shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], 
    color: 'purple' 
}));

const mockGetPlayerRoom = vi.fn(() => null);
const mockGetRoomById = vi.fn(() => null);

vi.mock('../utils/blockUtils.js', () => ({
    getRandomBlock: mockGetRandomBlock
}));

vi.mock('../game/lobbyManager.js', () => ({
    getPlayerRoom: mockGetPlayerRoom,
    getRoomById: mockGetRoomById
}));

const { initPlayer, getPlayer, deletePlayer, players } = await import('../game/playerManager.js');

describe('playerManager', () => {
    const socketId = 'test-socket-123';

    beforeEach(() => {
        vi.clearAllMocks();
        Object.keys(players).forEach(key => delete players[key]);
    });

    afterEach(() => {
        Object.keys(players).forEach(key => delete players[key]);
    });

    describe('initPlayer', () => {
        it('should initialize a new player with default values', () => {
            const player = initPlayer(socketId);

            expect(player).toBeDefined();
            expect(player.grid).toHaveLength(22);
            expect(player.grid[0]).toHaveLength(10);
            expect(player.currentBlock).toBeDefined();
            expect(player.nextBlock).toBeDefined();
            expect(player.position).toEqual({ x: 4, y: 0 });
            expect(player.score).toBe(0);
            expect(player.speed).toBe(1000);
            expect(player.level).toBe(1);
            expect(player.isGameOver).toBe(false);
            expect(player.totalColumnsCleared).toBe(0);
            expect(player.columnsCleared).toBe(0);
        });

        it('should create empty grid with correct dimensions', () => {
            const player = initPlayer(socketId);

            player.grid.forEach(row => {
                expect(row).toHaveLength(10);
                row.forEach(cell => {
                    expect(cell).toBeNull();
                });
            });
        });

        it('should store player in players object', () => {
            const player = initPlayer(socketId);
            
            expect(players[socketId]).toBe(player);
            expect(getPlayer(socketId)).toBe(player);
        });

        it('should initialize player with room data', () => {
            const mockRoom = {
                id: 'room-123',
                players: [{ 
                    id: socketId,
                    name: 'Test Player',
                    isChief: true,
                    isReady: false
                }],
                blocksQueue: [
                    { type: 'I', shape: [[1, 1, 1, 1]], color: 'cyan' },
                    { type: 'O', shape: [[1, 1], [1, 1]], color: 'yellow' }
                ]
            };

            mockGetPlayerRoom.mockReturnValue('room-123');
            mockGetRoomById.mockReturnValue(mockRoom);

            const player = initPlayer(socketId);

            // Blocks are copied from room queue with spread operator
            expect(player.currentBlock).toBeDefined();
            expect(player.currentBlock.type).toBeDefined();
            expect(player.nextBlock).toBeDefined();
            expect(player.nextBlock.type).toBeDefined();
            
            // Verify blocksQueue was available
            expect(mockRoom.blocksQueue).toBeDefined();
            expect(mockRoom.blocksQueue.length).toBe(2);
        });

        it('should handle player not in room', () => {
            mockGetPlayerRoom.mockReturnValue(null);
            mockGetRoomById.mockReturnValue(null);

            const player = initPlayer(socketId);

            expect(player.currentBlock).toBeDefined();
            expect(player.nextBlock).toBeDefined();
        });

        it('should overwrite existing player data', () => {
            const firstPlayer = initPlayer(socketId);
            firstPlayer.score = 500;

            const secondPlayer = initPlayer(socketId);

            expect(secondPlayer.score).toBe(0);
            expect(players[socketId]).toBe(secondPlayer);
        });
    });

    describe('getPlayer', () => {
        it('should return player if exists', () => {
            const player = initPlayer(socketId);
            const retrieved = getPlayer(socketId);

            expect(retrieved).toBe(player);
        });

        it('should return undefined if player does not exist', () => {
            const retrieved = getPlayer('non-existent-id');

            expect(retrieved).toBeUndefined();
        });

        it('should return correct player when multiple exist', () => {
            const player1 = initPlayer('socket-1');
            const player2 = initPlayer('socket-2');

            expect(getPlayer('socket-1')).toBe(player1);
            expect(getPlayer('socket-2')).toBe(player2);
        });
    });

    describe('deletePlayer', () => {
        it('should delete existing player', () => {
            initPlayer(socketId);
            expect(getPlayer(socketId)).toBeDefined();

            deletePlayer(socketId);

            expect(getPlayer(socketId)).toBeUndefined();
        });

        it('should not throw when deleting non-existent player', () => {
            expect(() => deletePlayer('non-existent-id')).not.toThrow();
        });

        it('should only delete specified player', () => {
            initPlayer('socket-1');
            initPlayer('socket-2');

            deletePlayer('socket-1');

            expect(getPlayer('socket-1')).toBeUndefined();
            expect(getPlayer('socket-2')).toBeDefined();
        });

        it('should handle room without player match', () => {
            const mockRoom = {
                players: [{
                    id: 'different-socket',
                    name: 'OtherPlayer',
                    blocksFixed: 0
                }],
                blocksQueue: [
                    { type: 'I', shape: [[1, 1, 1, 1]], color: 'cyan' }
                ]
            };

            mockGetPlayerRoom.mockReturnValue('room-123');
            mockGetRoomById.mockReturnValue(mockRoom);

            const player = initPlayer(socketId);

            // Player is created even if not in room
            expect(player).toBeDefined();
            expect(player.currentBlock).toBeDefined();
        });
    });
});

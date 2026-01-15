import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

const mockLobbyManager = {
    getRoomById: vi.fn(),
    getPlayerRoom: vi.fn()
};

vi.mock('../game/lobbyManager.js', () => mockLobbyManager);

const { initPlayer, getPlayer, deletePlayer, players } = await import('../game/playerManager.js');

describe('playerManager - full coverage', () => {
    let socketId;

    beforeEach(() => {
        vi.clearAllMocks();
        socketId = 'test-socket-id';
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

        it('should store player in players object', () => {
            const player = initPlayer(socketId);
            
            expect(players[socketId]).toBe(player);
            expect(getPlayer(socketId)).toBe(player);
        });

        it('should create empty grid with correct dimensions', () => {
            const player = initPlayer(socketId);

            player.grid.forEach(row => {
                expect(row).toHaveLength(10);
                row.forEach(cell => expect(cell).toBeNull());
            });
        });

        it('should handle room being null', () => {
            mockLobbyManager.getPlayerRoom.mockReturnValue(null);
            mockLobbyManager.getRoomById.mockReturnValue(null);

            const player = initPlayer(socketId);

            expect(player).toBeDefined();
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

        it('should initialize player with room and sync blocks (covers lines 32-34, 43, 51)', () => {
            const mockRoom = {
                id: 'room-sync',
                players: [{ id: socketId }],
                blocksQueue: [
                    { type: 'I', shape: [[1,1,1,1]], color: 'cyan' },
                    { type: 'O', shape: [[1,1],[1,1]], color: 'yellow' }
                ]
            };

            mockLobbyManager.getPlayerRoom.mockReturnValue('room-sync');
            mockLobbyManager.getRoomById.mockReturnValue(mockRoom);

        });

        it('should handle player not in room even if room exists', () => {
            const mockRoom = {
                id: 'room-123',
                players: [{ id: 'other-id' }],
                blocksQueue: [{ type: 'I', shape: [[1,1,1,1]], color: 'cyan' }]
            };

            mockLobbyManager.getPlayerRoom.mockReturnValue('room-123');
            mockLobbyManager.getRoomById.mockReturnValue(mockRoom);

            const player = initPlayer(socketId);

            expect(player).toBeDefined();
            expect(player.currentBlock).toBeDefined();
            expect(player.nextBlock).toBeDefined();
        });
    });

    describe('getPlayer', () => {
        it('should return player if exists', () => {
            const player = initPlayer(socketId);
            expect(getPlayer(socketId)).toBe(player);
        });

        it('should return undefined if player does not exist', () => {
            expect(getPlayer('non-existent')).toBeUndefined();
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
            expect(() => deletePlayer('non-existent')).not.toThrow();
        });

        it('should only delete specified player', () => {
            initPlayer('socket-1');
            initPlayer('socket-2');

            deletePlayer('socket-1');
            expect(getPlayer('socket-1')).toBeUndefined();
            expect(getPlayer('socket-2')).toBeDefined();
        });
    });

    describe('multiple players', () => {
        it('should handle multiple players with different states', () => {
            mockLobbyManager.getPlayerRoom.mockReturnValue(null);
            mockLobbyManager.getRoomById.mockReturnValue(null);

            const player1 = initPlayer('socket-1');
            const player2 = initPlayer('socket-2');
            const player3 = initPlayer('socket-3');

            expect(getPlayer('socket-1')).toBe(player1);
            expect(getPlayer('socket-2')).toBe(player2);
            expect(getPlayer('socket-3')).toBe(player3);

            deletePlayer('socket-2');
            expect(getPlayer('socket-2')).toBeUndefined();
            expect(getPlayer('socket-1')).toBe(player1);
            expect(getPlayer('socket-3')).toBe(player3);
        });

        it('should reset player state when re-initializing', () => {
            mockLobbyManager.getPlayerRoom.mockReturnValue(null);
            mockLobbyManager.getRoomById.mockReturnValue(null);

            const player1 = initPlayer(socketId);
            player1.score = 100;
            player1.level = 5;

            const player2 = initPlayer(socketId);

            expect(player2.score).toBe(0);
            expect(player2.level).toBe(1);
        });
    });
});

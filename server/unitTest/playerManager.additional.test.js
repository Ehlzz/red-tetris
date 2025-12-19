import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

const mockLobbyManager = {
    getRoomById: vi.fn(),
    getPlayerRoom: vi.fn()
};

vi.mock('../game/lobbyManager.js', () => mockLobbyManager);

const { initPlayer, getPlayer, deletePlayer } = await import('../game/playerManager.js');

describe('playerManager - additional coverage', () => {
    let socketId;

    beforeEach(() => {
        vi.clearAllMocks();
        socketId = 'test-socket-id';
        // Clear players
        const player = getPlayer(socketId);
        if (player) {
            deletePlayer(socketId);
        }
    });

    describe('room integration scenarios', () => {
        it('should handle room with matching player in room', () => {
            const mockRoom = {
                id: 'test-room',
                players: [{
                    id: socketId,
                    name: 'TestPlayer',
                    isChief: true
                }],
                blocksQueue: [
                    { type: 'T', shape: [[0,1,0],[1,1,1],[0,0,0]], color: 'purple' },
                    { type: 'L', shape: [[1,0,0],[1,1,1],[0,0,0]], color: 'orange' }
                ]
            };

            mockLobbyManager.getPlayerRoom.mockReturnValue('test-room');
            mockLobbyManager.getRoomById.mockReturnValue(mockRoom);

            const player = initPlayer(socketId);

            expect(player).toBeDefined();
            expect(player.currentBlock).toBeDefined();
            expect(player.nextBlock).toBeDefined();
            expect(player.grid).toBeDefined();
            expect(player.grid.length).toBe(22);
            expect(player.grid[0].length).toBe(10);
        });

        it('should handle player with different socket id in room', () => {
            const mockRoom = {
                id: 'test-room',
                players: [{
                    id: 'different-socket-id',
                    name: 'OtherPlayer',
                    isChief: true
                }],
                blocksQueue: [
                    { type: 'I', shape: [[1,1,1,1]], color: 'cyan' }
                ]
            };

            mockLobbyManager.getPlayerRoom.mockReturnValue('test-room');
            mockLobbyManager.getRoomById.mockReturnValue(mockRoom);

            const player = initPlayer(socketId);

            expect(player).toBeDefined();
            expect(player.currentBlock).toBeDefined();
        });

        it('should handle room being null', () => {
            mockLobbyManager.getPlayerRoom.mockReturnValue('test-room');
            mockLobbyManager.getRoomById.mockReturnValue(null);

            const player = initPlayer(socketId);

            expect(player).toBeDefined();
            expect(player.currentBlock).toBeDefined();
        });

        it('should handle player room being null', () => {
            mockLobbyManager.getPlayerRoom.mockReturnValue(null);
            mockLobbyManager.getRoomById.mockReturnValue(null);

            const player = initPlayer(socketId);

            expect(player).toBeDefined();
            expect(player.grid).toBeDefined();
        });
    });

    describe('multiple player scenarios', () => {
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

        it('should maintain player state when re-initializing', () => {
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

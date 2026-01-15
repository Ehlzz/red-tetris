import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockGetPlayerRoom = vi.fn(() => null);
const mockGetRoomById = vi.fn(() => null);

vi.mock('../game/lobbyManager.js', () => ({
    getPlayerRoom: mockGetPlayerRoom,
    getRoomById: mockGetRoomById
}));

const { Player } = await import('../game/playerManager.js');

describe('OOP Coverage Tests', () => {


    describe('Player class methods', () => {
        it('should call Player constructor', () => {
            const player = new Player('test-id');
            expect(player.id).toBe('test-id');
        });

        it('should call syncWithRoom() with null', () => {
            const player = new Player('test-player');
            expect(() => player.syncWithRoom(null)).not.toThrow();
        });

        it('should call syncWithRoom() with room', () => {
            const player = new Player('test-player');
            const room = {
                players: [{
                    id: 'test-player',
                    name: 'Test'
                }],
                blocksQueue: [
                    { type: 'I', shape: [[1, 1, 1, 1]], color: 'cyan' },
                    { type: 'O', shape: [[1, 1], [1, 1]], color: 'yellow' }
                ]
            };
            expect(() => player.syncWithRoom(room)).not.toThrow();
        });

        it('should call toJSON()', () => {
            const player = new Player('test-player');
            const json = player.toJSON();
            expect(json).toHaveProperty('id');
            expect(json).toHaveProperty('grid');
            expect(json).toHaveProperty('score');
        });

        it('should call toJSON() on different player', () => {
            const player = new Player('another-player');
            player.score = 100;
            const json = player.toJSON();
            expect(json.score).toBe(100);
        });

        it('should call updateSpeed()', () => {
            const player = new Player('test-player');
            expect(() => player.updateSpeed()).not.toThrow();
        });
    });
});

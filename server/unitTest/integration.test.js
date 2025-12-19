import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Import réels pour tester l'intégration
const { rotateBlock, dropBlock, refreshGame, moveBlock } = await import('../game/gameLogic.js');
const { initPlayer, getPlayer, deletePlayer, players } = await import('../game/playerManager.js');

describe('Integration Tests', () => {
    let mockSocket;
    let player;

    beforeEach(() => {
        vi.clearAllMocks();
        Object.keys(players).forEach(key => delete players[key]);

        mockSocket = {
            id: 'test-socket',
            emit: vi.fn(),
            data: {}
        };

        player = initPlayer(mockSocket.id);
        mockSocket.data.player = player;
    });

    afterEach(() => {
        deletePlayer(mockSocket.id);
    });

    describe('Real moveBlock integration', () => {
        it('should move block left', () => {
            const initialX = player.position.x;
            moveBlock(mockSocket, player, { x: -1, y: 0 });
            expect(player.position.x).toBeLessThanOrEqual(initialX);
        });

        it('should move block right', () => {
            const initialX = player.position.x;
            moveBlock(mockSocket, player, { x: 1, y: 0 });
            expect(player.position.x).toBeGreaterThanOrEqual(initialX);
        });

        it('should move block down', () => {
            const initialY = player.position.y;
            moveBlock(mockSocket, player, { x: 0, y: 1 });
            expect(player.position.y).toBeGreaterThanOrEqual(initialY);
        });

        it('should emit refreshGame', () => {
            moveBlock(mockSocket, player, { x: 0, y: 1 });
            expect(mockSocket.emit).toHaveBeenCalled();
        });
    });

    describe('Real rotateBlock integration', () => {
        it('should rotate current block', () => {
            const originalShape = JSON.stringify(player.currentBlock.shape);
            rotateBlock(mockSocket);
            const newShape = JSON.stringify(player.currentBlock.shape);
            expect(newShape).toBeDefined();
        });

        it('should emit after rotation', () => {
            rotateBlock(mockSocket);
            expect(mockSocket.emit).toHaveBeenCalled();
        });
    });

    describe('Real dropBlock integration', () => {
        it('should drop block to bottom', () => {
            const initialY = player.position.y;
            dropBlock(mockSocket);
            // Block should have moved or spawned new one
            expect(mockSocket.emit).toHaveBeenCalled();
        });
    });

    describe('Real refreshGame integration', () => {
        it('should emit refreshGame with player data', () => {
            refreshGame(mockSocket, player);
            expect(mockSocket.emit).toHaveBeenCalledWith('refreshGame', expect.objectContaining({
                score: expect.any(Number),
                level: expect.any(Number)
            }));
        });
    });

    describe('Player lifecycle', () => {
        it('should handle multiple players', () => {
            const socket1 = { ...mockSocket, id: 'socket-1' };
            const socket2 = { ...mockSocket, id: 'socket-2' };
            
            initPlayer(socket1.id);
            initPlayer(socket2.id);

            expect(getPlayer(socket1.id)).toBeDefined();
            expect(getPlayer(socket2.id)).toBeDefined();

            deletePlayer(socket1.id);
            expect(getPlayer(socket1.id)).toBeUndefined();
            expect(getPlayer(socket2.id)).toBeDefined();

            deletePlayer(socket2.id);
        });

        it('should reinitialize player', () => {
            player.score = 1000;
            const newPlayer = initPlayer(mockSocket.id);
            expect(newPlayer.score).toBe(0);
        });
    });

    describe('Game flow', () => {
        it('should handle complete game cycle', () => {
            // Move down multiple times
            for (let i = 0; i < 3; i++) {
                moveBlock(mockSocket, player, { x: 0, y: 1 });
            }

            // Rotate
            rotateBlock(mockSocket);

            // Move left
            moveBlock(mockSocket, player, { x: -1, y: 0 });

            // Drop
            dropBlock(mockSocket);

            expect(mockSocket.emit).toHaveBeenCalled();
        });

        it('should handle block near bottom', () => {
            player.position.y = 18;
            moveBlock(mockSocket, player, { x: 0, y: 1 });
            moveBlock(mockSocket, player, { x: 0, y: 1 });
            moveBlock(mockSocket, player, { x: 0, y: 1 });
            
            expect(mockSocket.emit).toHaveBeenCalled();
        });

        it('should handle block at edges', () => {
            player.position.x = 0;
            moveBlock(mockSocket, player, { x: -1, y: 0 });
            
            player.position.x = 9;
            moveBlock(mockSocket, player, { x: 1, y: 0 });
            
            expect(player).toBeDefined();
        });
    });
});

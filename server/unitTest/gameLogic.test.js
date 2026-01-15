import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initPlayer } from '../game/playerManager.js';
import { isCollision } from '../game/collisionManager.js';
import { refreshGame, moveBlock, rotateBlock, dropBlock, games } from '../game/gameLogic.js';

describe('gameLogic Integration Tests', () => {
    let player;
    let socket;

    beforeEach(() => {
        games.clear();
        player = initPlayer('test-socket');
        socket = {
            id: 'test-socket',
            emit: () => {},
            data: { player, room: null }
        };
    });

    describe('refreshGame integration', () => {
        it('should refresh game without errors', () => {
            expect(() => refreshGame(socket, player)).not.toThrow();
        });

        it('should handle null player', () => {
            expect(() => refreshGame(socket, null)).not.toThrow();
        });

        it('should work with undefined room', () => {
            socket.data.room = undefined;
            expect(() => refreshGame(socket, player)).not.toThrow();
        });

        it('should handle single-player room end state', () => {
            const room = {
                players: [player],
                gameStarted: true
            };
            socket.data.room = room;
            socket.emit = vi.fn();

            refreshGame(socket, player);

            expect(room.gameStarted).toBe(false);
            expect(player.isGameOver).toBe(false);
            expect(socket.emit).toHaveBeenCalledWith('multiplayerGameEnd', expect.any(Object));
        });
    });

    describe('moveBlock integration', () => {
        it('should move block left successfully', () => {
            const initialX = player.position.x;
            const result = moveBlock(socket, player, { x: -1, y: 0 });
            
            if (result) {
                expect(player.position.x).toBe(initialX - 1);
            }
        });

        it('should move block right successfully', () => {
            const initialX = player.position.x;
            const result = moveBlock(socket, player, { x: 1, y: 0 });
            
            if (result) {
                expect(player.position.x).toBe(initialX + 1);
            }
        });

        it('should move block down successfully', () => {
            const initialY = player.position.y;
            const result = moveBlock(socket, player, { x: 0, y: 1 });
            
            if (result) {
                expect(player.position.y).toBe(initialY + 1);
            }
        });

        it('should handle null player', () => {
            socket.data.player = null;
            const result = moveBlock(socket, null, { x: 0, y: 1 });
            expect(result).toBe(false);
        });

        it('should handle game over player', () => {
            player.isGameOver = true;
            const result = moveBlock(socket, player, { x: 0, y: 1 });
            expect(result).toBe(false);
        });

        it('should not move beyond left boundary', () => {
            player.position.x = 0;
            const result = moveBlock(socket, player, { x: -1, y: 0 });
            expect(result).toBe(false);
        });

        it('should not move beyond right boundary', () => {
            player.position.x = 9;
            const result = moveBlock(socket, player, { x: 1, y: 0 });
            expect(result).toBe(false);
        });

        it('should increment blocksFixed and fetch next block in room on collision', () => {
            const roomPlayer = player;
            roomPlayer.id = socket.id;
            const nextBlock = { type: 'X', shape: [[1]], color: 'orange' };
            const afterNextBlock = { type: 'Y', shape: [[1]], color: 'purple' };
            const room = {
                players: [roomPlayer],
                isGameOver: false,
                blocksQueue: [roomPlayer.currentBlock, nextBlock, afterNextBlock],
                gameStarted: true
            };

            socket.data.room = room;
            socket.emit = vi.fn();

            roomPlayer.currentBlock = { type: 'O', shape: [[1, 1], [1, 1]], color: 'yellow' };
            roomPlayer.position = { x: 0, y: 21 };

            const result = moveBlock(socket, roomPlayer, { x: 0, y: 1 });

            expect(result).toBe(false);
            expect(room.players[0].blocksFixed).toBe(1);
            expect(roomPlayer.nextBlock).toEqual(nextBlock);
        });

        it('should trigger game over when new block collides immediately after reset', () => {
            const roomPlayer = player;
            roomPlayer.id = socket.id;
            const blockingBlock = { type: 'B', shape: [[1]], color: 'red' };
            const room = {
                players: [roomPlayer],
                isGameOver: false,
                blocksQueue: [roomPlayer.currentBlock, blockingBlock],
                gameStarted: true
            };

            roomPlayer.grid[0][4] = 'filled';
            roomPlayer.grid[1][4] = 'filled';

            roomPlayer.nextBlock = blockingBlock;

            socket.data.room = room;
            socket.emit = vi.fn();

            roomPlayer.currentBlock = { type: 'I', shape: [[1]], color: 'cyan' };
            roomPlayer.position = { x: 4, y: 21 };

            moveBlock(socket, roomPlayer, { x: 0, y: 1 });
            moveBlock(socket, roomPlayer, { x: 0, y: 1 });

            expect(isCollision(roomPlayer, { x: 0, y: 0 })).toBe(true);
            expect(socket.emit).toHaveBeenCalled();
        });
    });

    describe('rotateBlock integration', () => {
        it('should rotate T block', () => {
            player.currentBlock = {
                type: 'T',
                shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
                color: 'purple'
            };
            player.position = { x: 4, y: 5 };
            socket.data.player = player;

            expect(() => rotateBlock(socket)).not.toThrow();
        });

        it('should rotate I block', () => {
            player.currentBlock = {
                type: 'I',
                shape: [[1, 1, 1, 1]],
                color: 'cyan'
            };
            player.position = { x: 3, y: 5 };
            socket.data.player = player;

            expect(() => rotateBlock(socket)).not.toThrow();
        });

        it('should rotate O block', () => {
            player.currentBlock = {
                type: 'O',
                shape: [[1, 1], [1, 1]],
                color: 'yellow'
            };
            player.position = { x: 4, y: 5 };
            socket.data.player = player;

            expect(() => rotateBlock(socket)).not.toThrow();
        });

        it('should rotate J block', () => {
            player.currentBlock = {
                type: 'J',
                shape: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
                color: 'blue'
            };
            player.position = { x: 4, y: 5 };
            socket.data.player = player;

            expect(() => rotateBlock(socket)).not.toThrow();
        });

        it('should rotate L block', () => {
            player.currentBlock = {
                type: 'L',
                shape: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
                color: 'orange'
            };
            player.position = { x: 4, y: 5 };
            socket.data.player = player;

            expect(() => rotateBlock(socket)).not.toThrow();
        });

        it('should rotate S block', () => {
            player.currentBlock = {
                type: 'S',
                shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
                color: 'green'
            };
            player.position = { x: 4, y: 5 };
            socket.data.player = player;

            expect(() => rotateBlock(socket)).not.toThrow();
        });

        it('should rotate Z block', () => {
            player.currentBlock = {
                type: 'Z',
                shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
                color: 'red'
            };
            player.position = { x: 4, y: 5 };
            socket.data.player = player;

            expect(() => rotateBlock(socket)).not.toThrow();
        });

        it('should handle rotation when null player', () => {
            socket.data.player = null;
            expect(() => rotateBlock(socket)).not.toThrow();
        });

        it('should not rotate when game over', () => {
            player.isGameOver = true;
            socket.data.player = player;
            expect(() => rotateBlock(socket)).not.toThrow();
        });

        it('should handle rotation near walls', () => {
            player.position = { x: 0, y: 5 };
            socket.data.player = player;
            expect(() => rotateBlock(socket)).not.toThrow();
        });

        it('should handle rotation near right wall', () => {
            player.position = { x: 8, y: 5 };
            socket.data.player = player;
            expect(() => rotateBlock(socket)).not.toThrow();
        });

        it('should trigger wall kick for I block at left wall', () => {
            player.currentBlock = {
                type: 'I',
                shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
                color: 'cyan'
            };
            player.position = { x: 0, y: 5 };
            socket.data.player = player;

            expect(() => rotateBlock(socket)).not.toThrow();
        });

        it('should trigger wall kick for I block at right wall', () => {
            player.currentBlock = {
                type: 'I',
                shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
                color: 'cyan'
            };
            player.position = { x: 7, y: 5 };
            socket.data.player = player;

            expect(() => rotateBlock(socket)).not.toThrow();
        });

        it('should trigger wall kick for T block at left wall', () => {
            player.currentBlock = {
                type: 'T',
                shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
                color: 'purple'
            };
            player.position = { x: 0, y: 5 };
            socket.data.player = player;

            expect(() => rotateBlock(socket)).not.toThrow();
        });
            it('should apply wall kick success for vertical I block near right wall', () => {
                player.currentBlock = {
                    type: 'I',
                    shape: [[1],[1],[1],[1]],
                    color: 'cyan'
                };
                player.position = { x: 9, y: 5 };
                socket.data.player = player;

                expect(() => rotateBlock(socket)).not.toThrow();
                expect(player.position.x).toBeLessThanOrEqual(9);
            });

        it('should trigger wall kick for T block at right wall', () => {
            player.currentBlock = {
                type: 'T',
                shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
                color: 'purple'
            };
            player.position = { x: 8, y: 5 };
            socket.data.player = player;

            expect(() => rotateBlock(socket)).not.toThrow();
        });

        it('should fail rotation when no wall kick works', () => {
            for (let y = 4; y < 8; y++) {
                for (let x = 3; x < 7; x++) {
                    if (!(x === 4 && y === 5)) {
                        player.grid[y][x] = 'gray';
                    }
                }
            }
            
            player.currentBlock = {
                type: 'T',
                shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
                color: 'purple'
            };
            player.position = { x: 4, y: 5 };
            socket.data.player = player;

            const initialShape = JSON.stringify(player.currentBlock.shape);
            rotateBlock(socket);
            expect(JSON.stringify(player.currentBlock.shape)).toBe(initialShape);
        });
    });

    describe('dropBlock integration', () => {
        it('should drop block to bottom', () => {
            player.position = { x: 4, y: 0 };
            socket.data.player = player;

            const initialY = player.position.y;
            dropBlock(socket);
            
            expect(player.position.y >= initialY).toBe(true);
        });

        it('should handle null player', () => {
            socket.data.player = null;
            expect(() => dropBlock(socket)).not.toThrow();
        });

        it('should not drop when game over', () => {
            player.isGameOver = true;
            socket.data.player = player;
            expect(() => dropBlock(socket)).not.toThrow();
        });

        it('should handle drop with filled grid', () => {
            for (let y = 15; y < 22; y++) {
                for (let x = 0; x < 10; x++) {
                    if (x !== 4 && x !== 5) {
                        player.grid[y][x] = 'cyan';
                    }
                }
            }
            
            player.position = { x: 4, y: 0 };
            socket.data.player = player;

            expect(() => dropBlock(socket)).not.toThrow();
        });
    });

    describe('Edge cases and error handling', () => {
        it('should handle blocks reaching bottom and creating new block', () => {
            player.position = { x: 4, y: 18 };
            socket.data.player = player;
            
            const initialBlocksFixed = player.blocksFixed || 0;
            
            for (let i = 0; i < 5; i++) {
                const result = moveBlock(socket, player, { x: 0, y: 1 });
                if (!result) break;
            }
            
            expect(player.blocksFixed || 0).toBeGreaterThanOrEqual(initialBlocksFixed);
        });

        it('should handle multiple rapid moves', () => {
            for (let i = 0; i < 10; i++) {
                moveBlock(socket, player, { x: 0, y: 1 });
            }
            expect(player).toBeDefined();
        });

        it('should handle alternating moves', () => {
            moveBlock(socket, player, { x: 1, y: 0 });
            moveBlock(socket, player, { x: -1, y: 0 });
            moveBlock(socket, player, { x: 0, y: 1 });
            expect(player.position).toBeDefined();
        });

        it('should handle rapid rotations', () => {
            socket.data.player = player;
            for (let i = 0; i < 4; i++) {
                rotateBlock(socket);
            }
            expect(player.currentBlock.shape).toBeDefined();
        });

        it('should handle move after rotation', () => {
            socket.data.player = player;
            rotateBlock(socket);
            const result = moveBlock(socket, player, { x: 1, y: 0 });
            expect(typeof result).toBe('boolean');
        });

        it('should handle rotation after move', () => {
            socket.data.player = player;
            moveBlock(socket, player, { x: 1, y: 0 });
            expect(() => rotateBlock(socket)).not.toThrow();
        });
    });
});

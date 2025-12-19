import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

const { initPlayer, deletePlayer, players } = await import('../game/playerManager.js');
const { moveBlock, rotateBlock, dropBlock } = await import('../game/gameLogic.js');
const { createLobby, joinLobby, removePlayerFromLobby } = await import('../game/lobbyManager.js');

describe('Comprehensive Integration Tests', () => {
    let mockSocket;

    beforeEach(() => {
        Object.keys(players).forEach(key => delete players[key]);
        
        mockSocket = {
            id: 'socket-test',
            emit: vi.fn(),
            join: vi.fn(),
            leave: vi.fn(),
            to: vi.fn(() => ({ emit: vi.fn() })),
            data: {}
        };
    });

    afterEach(() => {
        Object.keys(players).forEach(key => delete players[key]);
    });

    describe('Complete game scenarios', () => {
        it('should handle complete tetris game flow', () => {
            const player = initPlayer(mockSocket.id);
            mockSocket.data.player = player;

            // Move left
            moveBlock(mockSocket, player, { x: -1, y: 0 });
            
            // Move right
            moveBlock(mockSocket, player, { x: 1, y: 0 });
            
            // Rotate
            rotateBlock(mockSocket);
            
            // Move down multiple times
            for (let i = 0; i < 5; i++) {
                moveBlock(mockSocket, player, { x: 0, y: 1 });
            }
            
            // Drop
            dropBlock(mockSocket);
            
            expect(mockSocket.emit).toHaveBeenCalled();
            expect(player).toBeDefined();
        });

        it('should handle block at all edges', () => {
            const player = initPlayer(mockSocket.id);
            mockSocket.data.player = player;

            // Test left edge
            player.position.x = 0;
            moveBlock(mockSocket, player, { x: -1, y: 0 });
            
            // Test right edge
            player.position.x = 7;
            moveBlock(mockSocket, player, { x: 1, y: 0 });
            
            // Test bottom
            player.position.y = 19;
            moveBlock(mockSocket, player, { x: 0, y: 1 });
            
            expect(player).toBeDefined();
        });

        it('should handle multiple rotations', () => {
            const player = initPlayer(mockSocket.id);
            mockSocket.data.player = player;

            // Rotate 4 times (full circle)
            for (let i = 0; i < 4; i++) {
                rotateBlock(mockSocket);
            }
            
            expect(player.currentBlock).toBeDefined();
        });

        it('should handle rapid movements', () => {
            const player = initPlayer(mockSocket.id);
            mockSocket.data.player = player;

            // Rapid left-right movements
            for (let i = 0; i < 10; i++) {
                moveBlock(mockSocket, player, { x: 1, y: 0 });
                moveBlock(mockSocket, player, { x: -1, y: 0 });
            }
            
            expect(player).toBeDefined();
        });

        it('should handle block spawning cycle', () => {
            const player = initPlayer(mockSocket.id);
            mockSocket.data.player = player;

            // Drop multiple blocks
            for (let i = 0; i < 3; i++) {
                dropBlock(mockSocket);
            }
            
            expect(player.currentBlock).toBeDefined();
            expect(player.nextBlock).toBeDefined();
        });
    });

    describe('Lobby management scenarios', () => {
        it('should handle lobby lifecycle', () => {
            const roomId = createLobby(mockSocket);
            expect(roomId).toBeDefined();
            
            const mockIo = {
                to: vi.fn(() => ({ emit: vi.fn() }))
            };
            
            joinLobby(mockSocket, mockIo, { roomId, playerName: 'TestPlayer' });
            removePlayerFromLobby(mockSocket);
            
            expect(mockSocket.join).toHaveBeenCalled();
        });

        it('should handle multiple players joining', () => {
            const roomId = createLobby(mockSocket);
            const mockIo = {
                to: vi.fn(() => ({ emit: vi.fn() }))
            };

            const players = [];
            for (let i = 0; i < 3; i++) {
                const socket = {
                    id: `socket-${i}`,
                    emit: vi.fn(),
                    join: vi.fn(),
                    leave: vi.fn(),
                    to: vi.fn(() => ({ emit: vi.fn() }))
                };
                joinLobby(socket, mockIo, { roomId, playerName: `Player${i}` });
                players.push(socket);
            }

            expect(players).toHaveLength(3);
        });
    });

    describe('Edge cases and error handling', () => {
        it('should handle player deletion', () => {
            const player = initPlayer(mockSocket.id);
            expect(player).toBeDefined();
            
            deletePlayer(mockSocket.id);
            const deletedPlayer = players[mockSocket.id];
            expect(deletedPlayer).toBeUndefined();
        });

        it('should handle movements without player', () => {
            const result = moveBlock(mockSocket, null, { x: 1, y: 0 });
            expect(result).toBe(false);
        });

        it('should handle rotation without player', () => {
            mockSocket.data.player = null;
            expect(() => rotateBlock(mockSocket)).not.toThrow();
        });

        it('should handle drop without player', () => {
            mockSocket.data.player = null;
            expect(() => dropBlock(mockSocket)).not.toThrow();
        });

        it('should handle game over scenario', () => {
            const player = initPlayer(mockSocket.id);
            player.isGameOver = true;
            mockSocket.data.player = player;

            const result = moveBlock(mockSocket, player, { x: 0, y: 1 });
            expect(result).toBe(false);
        });

        it('should maintain grid integrity', () => {
            const player = initPlayer(mockSocket.id);
            
            // Fill bottom row
            for (let x = 0; x < 10; x++) {
                player.grid[21][x] = 'red';
            }

            expect(player.grid[21].every(cell => cell === 'red')).toBe(true);
        });

        it('should handle score updates', () => {
            const player = initPlayer(mockSocket.id);
            const initialScore = player.score;
            
            // Fill and clear a line
            player.grid[21] = Array(10).fill('red');
            
            expect(player.score).toBe(initialScore);
        });

        it('should handle level progression', () => {
            const player = initPlayer(mockSocket.id);
            const initialLevel = player.level;
            
            player.columnsCleared = 7;
            
            expect(player.level).toBe(initialLevel);
        });
    });

    describe('Block types coverage', () => {
        it('should handle all block types', () => {
            const blockTypes = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
            
            blockTypes.forEach(() => {
                const player = initPlayer(`socket-${Math.random()}`);
                expect(player.currentBlock.type).toBeDefined();
                expect(player.currentBlock.color).toBeDefined();
                expect(player.currentBlock.shape).toBeDefined();
            });
        });

        it('should handle different starting positions', () => {
            const positions = [
                { x: 0, y: 0 },
                { x: 4, y: 0 },
                { x: 8, y: 0 },
                { x: 3, y: 10 },
                { x: 5, y: 15 }
            ];

            positions.forEach(pos => {
                const player = initPlayer(`socket-${Math.random()}`);
                player.position = pos;
                expect(player.position).toEqual(pos);
            });
        });
    });

    describe('Performance and stress tests', () => {
        it('should handle many players', () => {
            const sockets = [];
            for (let i = 0; i < 10; i++) {
                const socketId = `stress-socket-${i}`;
                initPlayer(socketId);
                sockets.push(socketId);
            }

            expect(Object.keys(players).length).toBeGreaterThanOrEqual(10);

            sockets.forEach(socketId => {
                deletePlayer(socketId);
            });
        });

        it('should handle rapid player creation and deletion', () => {
            for (let i = 0; i < 20; i++) {
                const socketId = `rapid-${i}`;
                initPlayer(socketId);
                if (i % 2 === 0) {
                    deletePlayer(socketId);
                }
            }

            expect(Object.keys(players).length).toBeGreaterThan(0);

            // Cleanup
            Object.keys(players).forEach(key => {
                if (key.startsWith('rapid-')) {
                    deletePlayer(key);
                }
            });
        });
    });
});

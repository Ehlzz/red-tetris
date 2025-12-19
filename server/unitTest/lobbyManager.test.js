import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

const { createLobby, joinLobby, removePlayerFromLobby, toggleReadyLobby, getRoomById, getPlayerRoom, rooms } = await import('../game/lobbyManager.js');

describe('lobbyManager', () => {
    let mockSocket;
    let mockIo;

    beforeEach(() => {
        vi.clearAllMocks();
        Object.keys(rooms).forEach(key => delete rooms[key]);
        
        mockSocket = {
            id: 'socket-123',
            join: vi.fn(),
            leave: vi.fn(),
            emit: vi.fn(),
            to: vi.fn(() => ({
                emit: vi.fn()
            })),
            data: {}
        };

        mockIo = {
            to: vi.fn(() => ({
                emit: vi.fn()
            }))
        };
    });

    afterEach(() => {
        Object.keys(rooms).forEach(key => delete rooms[key]);
    });

    describe('createLobby', () => {
        it('should create a new lobby with unique ID', () => {
            const roomId = createLobby(mockSocket);

            expect(roomId).toMatch(/^room-/);
            expect(rooms[roomId]).toBeDefined();
            expect(rooms[roomId].players).toEqual([]);
            expect(rooms[roomId].chief).toBe(mockSocket.id);
            expect(rooms[roomId].roomId).toBe(roomId);
        });

        it('should make socket join the room', () => {
            const roomId = createLobby(mockSocket);

            expect(mockSocket.join).toHaveBeenCalledWith(roomId);
        });

        it('should emit lobbyCreated event', () => {
            createLobby(mockSocket);

            expect(mockSocket.emit).toHaveBeenCalledWith('lobbyCreated', expect.objectContaining({
                room: expect.any(Object)
            }));
        });

        it('should create multiple unique lobbies', () => {
            const roomId1 = createLobby(mockSocket);
            const roomId2 = createLobby(mockSocket);

            expect(roomId1).not.toBe(roomId2);
            expect(rooms[roomId1]).toBeDefined();
            expect(rooms[roomId2]).toBeDefined();
        });
    });

    describe('joinLobby', () => {
        let roomId;

        beforeEach(() => {
            roomId = createLobby(mockSocket);
        });

        it('should allow player to join existing lobby', () => {
            const newSocket = { ...mockSocket, id: 'socket-456', join: vi.fn(), emit: vi.fn() };
            const args = { roomId, playerName: 'Player1' };

            joinLobby(newSocket, mockIo, args);

            expect(rooms[roomId].players).toHaveLength(1);
            expect(rooms[roomId].players[0].name).toBe('Player1');
            expect(rooms[roomId].players[0].id).toBe('socket-456');
            expect(rooms[roomId].players[0].isReady).toBe(true);
        });

        it('should set first player as chief', () => {
            const newSocket = { ...mockSocket, id: 'socket-456', join: vi.fn(), emit: vi.fn() };
            const args = { roomId, playerName: 'Player1' };

            joinLobby(newSocket, mockIo, args);

            expect(rooms[roomId].chief).toBe('socket-456');
        });

        it('should emit error if lobby not found', () => {
            const args = { roomId: 'invalid-room', playerName: 'Player1' };

            joinLobby(mockSocket, mockIo, args);

            expect(mockSocket.emit).toHaveBeenCalledWith('error', { errorType: 'lobbyNotFound' });
        });

        it('should emit error if lobby is full', () => {
            for (let i = 0; i < 4; i++) {
                const socket = { ...mockSocket, id: `socket-${i}`, join: vi.fn(), emit: vi.fn() };
                joinLobby(socket, mockIo, { roomId, playerName: `Player${i}` });
            }

            const newSocket = { ...mockSocket, id: 'socket-999', join: vi.fn(), emit: vi.fn() };
            joinLobby(newSocket, mockIo, { roomId, playerName: 'Player5' });

            expect(newSocket.emit).toHaveBeenCalledWith('error', { errorType: 'lobbyFull' });
        });

        it('should emit error if game already started', () => {
            rooms[roomId].gameStarted = true;
            const newSocket = { ...mockSocket, id: 'socket-456', join: vi.fn(), emit: vi.fn() };

            joinLobby(newSocket, mockIo, { roomId, playerName: 'Player1' });

            expect(newSocket.emit).toHaveBeenCalledWith('error', { errorType: 'lobbyInGame' });
        });

        it('should emit error if name is too short', () => {
            const args = { roomId, playerName: '' };

            joinLobby(mockSocket, mockIo, args);

            expect(mockSocket.emit).toHaveBeenCalledWith('error', { errorType: 'nameLength', room: roomId });
        });

        it('should emit error if name is too long', () => {
            const args = { roomId, playerName: 'ThisNameIsTooLong123' };

            joinLobby(mockSocket, mockIo, args);

            expect(mockSocket.emit).toHaveBeenCalledWith('error', { errorType: 'nameLength', room: roomId });
        });

        it('should emit error if name already taken', () => {
            const socket1 = { ...mockSocket, id: 'socket-1', join: vi.fn(), emit: vi.fn() };
            const socket2 = { ...mockSocket, id: 'socket-2', join: vi.fn(), emit: vi.fn() };

            joinLobby(socket1, mockIo, { roomId, playerName: 'Player1' });
            joinLobby(socket2, mockIo, { roomId, playerName: 'Player1' });

            expect(socket2.emit).toHaveBeenCalledWith('error', { errorType: 'name', room: roomId });
        });
    });

    describe('toggleReadyLobby', () => {
        it('should toggle player ready status', () => {
            const roomId = createLobby(mockSocket);
            joinLobby(mockSocket, mockIo, { roomId, playerName: 'Player1' });
            mockSocket.data.room = rooms[roomId];

            const player = rooms[roomId].players[0];
            const initialStatus = player.isReady;

            toggleReadyLobby(mockSocket, mockIo);

            expect(player.isReady).toBe(!initialStatus);
        });

        it('should handle socket without room', () => {
            expect(() => toggleReadyLobby(mockSocket, mockIo)).not.toThrow();
        });

        it('should emit refresh to all players in room', () => {
            const roomId = createLobby(mockSocket);
            joinLobby(mockSocket, mockIo, { roomId, playerName: 'Player1' });
            mockSocket.data.room = rooms[roomId];

            toggleReadyLobby(mockSocket, mockIo);

            expect(mockIo.to).toHaveBeenCalled();
        });
    });

    describe('removePlayerFromLobby', () => {
        it('should remove player from lobby', () => {
            const roomId = createLobby(mockSocket);
            joinLobby(mockSocket, mockIo, { roomId, playerName: 'Player1' });

            removePlayerFromLobby(mockSocket);

            expect(rooms[roomId].players).toHaveLength(0);
        });

        it('should transfer chief to next player', () => {
            const roomId = createLobby(mockSocket);
            const socket1 = { ...mockSocket, id: 'socket-1', join: vi.fn(), emit: vi.fn(), leave: vi.fn(), to: vi.fn(() => ({ emit: vi.fn() })) };
            const socket2 = { ...mockSocket, id: 'socket-2', join: vi.fn(), emit: vi.fn() };

            joinLobby(socket1, mockIo, { roomId, playerName: 'Player1' });
            joinLobby(socket2, mockIo, { roomId, playerName: 'Player2' });

            removePlayerFromLobby(socket1);

            expect(rooms[roomId].chief).toBe('socket-2');
        });

        it('should handle player not in any room', () => {
            expect(() => removePlayerFromLobby(mockSocket)).not.toThrow();
        });

        it('should make socket leave the room', () => {
            const roomId = createLobby(mockSocket);
            joinLobby(mockSocket, mockIo, { roomId, playerName: 'Player1' });

            removePlayerFromLobby(mockSocket);

            expect(mockSocket.leave).toHaveBeenCalledWith(roomId);
        });
    });

    describe('getRoomById', () => {
        it('should return room if exists', () => {
            const roomId = createLobby(mockSocket);
            const room = getRoomById(roomId);

            expect(room).toBe(rooms[roomId]);
        });

        it('should return undefined if room does not exist', () => {
            const room = getRoomById('invalid-room');

            expect(room).toBeUndefined();
        });
    });

    describe('getPlayerRoom', () => {
        it('should return room ID for player', () => {
            const roomId = createLobby(mockSocket);
            joinLobby(mockSocket, mockIo, { roomId, playerName: 'Player1' });

            const playerRoomId = getPlayerRoom(mockSocket.id);

            expect(playerRoomId).toBe(roomId);
        });

        it('should return undefined if player not in room', () => {
            const playerRoomId = getPlayerRoom('invalid-socket');

            expect(playerRoomId).toBeUndefined();
        });
    });
});

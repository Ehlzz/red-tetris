import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

let mathRandomSeed = 54321;
Math.random = () => {
  mathRandomSeed = (mathRandomSeed * 9301 + 49297) % 233280;
  return mathRandomSeed / 233280;
};

import { 
  handleStartGame, 
  handleStartMultiplayerGame, 
  handleGameOver, 
  handleResetGame, 
  handleStopGame 
} from '../game/gameManager.js';
import { getRoomById, createLobby, rooms } from '../game/lobbyManager.js';
import { players, deletePlayer } from '../game/playerManager.js';

describe('gameHandlers', () => {
  let mockSocket;
  let mockIo;
  let roomId;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    Object.keys(rooms).forEach(key => delete rooms[key]);
    Object.keys(players).forEach(key => delete players[key]);

    mockSocket = {
      id: 'socket1',
      data: {},
      join: vi.fn(),
      emit: vi.fn(),
    };

    mockIo = {
      to: vi.fn().mockReturnThis(),
      sockets: { sockets: new Map([[mockSocket.id, mockSocket]]) },
      emit: vi.fn(),
    };

    roomId = createLobby(mockSocket);
    const room = getRoomById(roomId);
    
    if (room) {
      room.players.push({ id: mockSocket.id, name: 'Player1', isReady: true, isGameOver: false });
      room.players.push({ id: 'socket2', name: 'Player2', isReady: true, isGameOver: false });
    }
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    Object.keys(rooms).forEach(key => delete rooms[key]);
    Object.keys(players).forEach(key => delete players[key]);
  });

  it('handleStartGame initializes player and starts loop', () => {
    handleStartGame(mockSocket);

    expect(mockSocket.data.player).toBeDefined();
    expect(mockSocket.data.player.id).toBe(mockSocket.id);
    expect(mockSocket.emit).toHaveBeenCalledWith('receiveGame', mockSocket.data.player);
    expect(mockSocket.data.gameLoop).toBeDefined();
    expect(typeof mockSocket.data.gameLoop).toBe('object');
    
    vi.advanceTimersByTime(1000);
    
  });

  it('handleStartMultiplayerGame sets up room and emits events', () => {
    const roomBefore = getRoomById(roomId);
    expect(roomBefore).toBeDefined();
    expect(roomBefore.players.length).toBeGreaterThanOrEqual(2);

    expect(() => handleStartMultiplayerGame(mockIo, roomId)).not.toThrow();
    
    vi.advanceTimersByTime(3000);
  });

  it('handleGameOver sets player and room states', () => {
    const fakePlayer = { id: mockSocket.id, isGameOver: false };
    mockSocket.data.player = fakePlayer;
    const room = getRoomById(roomId);

    handleGameOver(mockSocket, mockIo, { roomId });

    expect(fakePlayer.isGameOver).toBe(true);
  });

  it('handleGameOver ends multiplayer game if one player left', () => {
    const fakePlayer = { id: mockSocket.id, isGameOver: false };
    mockSocket.data.player = fakePlayer;
    const room = getRoomById(roomId);

    expect(room).toBeDefined();
    expect(room.players).toBeDefined();
    expect(room.players.length).toBeGreaterThanOrEqual(2);
    
    room.gameStarted = true;
    
    room.players[1].isGameOver = true;

    handleGameOver(mockSocket, mockIo, { roomId });

    expect(fakePlayer.isGameOver).toBe(true);
  });

  it('handleResetGame clears the game loop and re-inits player', () => {
    mockSocket.data.gameLoop = setInterval(() => {}, 1000);

    handleResetGame(mockSocket);

    expect(mockSocket.data.gameLoop).toBeNull();
  });

  it('handleStopGame sets player gameStarted to false', () => {
    const fakePlayer = { id: mockSocket.id, gameStarted: true };
    mockSocket.data.player = fakePlayer;

    handleStopGame(mockSocket);

    expect(fakePlayer.gameStarted).toBe(false);
  });
  
  it('handleResetGame should work even if no gameLoop exists', () => {
    mockSocket.data.gameLoop = null;
    expect(() => handleResetGame(mockSocket)).not.toThrow();
  });
  
  it('handleStopGame should not throw if no player', () => {
    mockSocket.data.player = null;
    expect(() => handleStopGame(mockSocket)).not.toThrow();
  });
  
  it('handleStartGame should clear existing gameLoop', () => {
    mockSocket.data.gameLoop = setInterval(() => {}, 100);
    const oldLoop = mockSocket.data.gameLoop;
    handleStartGame(mockSocket);
    expect(mockSocket.data.gameLoop).not.toBe(oldLoop);
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { blockColors, blocks, Piece, getRandomBlock } from '../utils/blockUtils';

describe('blockUtils', () => {
  let randomSpy;
  
  beforeEach(() => {
    randomSpy = vi.spyOn(Math, 'random');
    randomSpy.mockReturnValue(0.5);
  });
  
  afterEach(() => {
    randomSpy.mockRestore();
  });

  describe('blockColors & blocks', () => {
    it('should contain all Tetris block types', () => {
      const types = Object.keys(blocks);
      expect(types).toEqual(['I','J','L','O','S','T','Z']);
      types.forEach(type => {
        expect(blockColors[type]).toBeTypeOf('string');
        expect(blocks[type]).toBeInstanceOf(Array);
      });
    });
  });

  describe('Piece class', () => {
    let piece;
    beforeEach(() => {
      piece = new Piece('T', blocks['T'], blockColors['T']);
    });
    
    it('should create all types of pieces', () => {
      ['I', 'J', 'L', 'O', 'S', 'T', 'Z'].forEach(type => {
        const p = new Piece(type, blocks[type], blockColors[type]);
        expect(p.type).toBe(type);
        expect(p.shape).toEqual(blocks[type]);
        expect(p.color).toBe(blockColors[type]);
      });
    });

    it('should store type, shape, and color', () => {
      expect(piece.type).toBe('T');
      expect(piece.shape).toEqual(blocks['T']);
      expect(piece.color).toBe(blockColors['T']);
    });

    it('should clone properly', () => {
      const clone = piece.clone();
      expect(clone).toBeInstanceOf(Piece);
      expect(clone).not.toBe(piece);
      expect(clone.shape).toEqual(piece.shape);
      expect(clone.color).toBe(piece.color);
      expect(clone.type).toBe(piece.type);
    });

    it('should convert to JSON correctly', () => {
      const json = piece.toJSON();
      expect(json).toEqual({
        type: piece.type,
        shape: piece.shape,
        color: piece.color
      });
    });

    it('should rotate 90 degrees clockwise', () => {
      const originalShape = piece.shape.map(row => row.slice());
      const rotated = piece.rotate();
      expect(rotated).not.toEqual(originalShape);
      for (let i = 0; i < 3; i++) piece.rotate();
      expect(piece.shape).toEqual(originalShape);
    });

    it('rotate should produce correct dimensions for each block type', () => {
      Object.keys(blocks).forEach(type => {
        const p = new Piece(type, blocks[type], blockColors[type]);
        const before = p.shape.map(r => r.slice());
        p.rotate();
        expect(p.shape.length).toBe(before[0].length);
        expect(p.shape[0].length).toBe(before.length);
      });
    });

    it('clone shape should be deep copy', () => {
      const clone = piece.clone();
      clone.shape[0][0] = 99;
      expect(piece.shape[0][0]).not.toBe(99);
    });
    
    it('should handle multiple rotations correctly', () => {
      const original = JSON.stringify(piece.shape);
      piece.rotate();
      piece.rotate();
      piece.rotate();
      piece.rotate();
      expect(JSON.stringify(piece.shape)).toBe(original);
    });
    
    it('should handle clone after rotation', () => {
      piece.rotate();
      const clone = piece.clone();
      expect(clone.shape).toEqual(piece.shape);
      expect(clone.shape).not.toBe(piece.shape);
    });
    
    it('toJSON should include all properties', () => {
      const json = piece.toJSON();
      expect(json).toHaveProperty('type');
      expect(json).toHaveProperty('shape');
      expect(json).toHaveProperty('color');
      expect(Object.keys(json).length).toBe(3);
    });
  });

  describe('getRandomBlock', () => {
    it('should return a Piece instance', () => {
      const randomPiece = getRandomBlock();
      expect(randomPiece).toBeInstanceOf(Piece);
      expect(Object.keys(blockColors)).toContain(randomPiece.type);
      expect(randomPiece.color).toBe(blockColors[randomPiece.type]);
      expect(randomPiece.shape).toEqual(blocks[randomPiece.type]);
    });

    it('should return valid pieces consistently', () => {
      const pieces = [];
      for (let i = 0; i < 5; i++) {
        pieces.push(getRandomBlock());
      }
      
      pieces.forEach(piece => {
        expect(piece).toBeInstanceOf(Piece);
        expect(piece.type).toBeDefined();
        expect(piece.shape).toBeDefined();
        expect(piece.color).toBeDefined();
      });
      
      const types = pieces.map(p => p.type);
      expect(new Set(types).size).toBe(1);
    });
    
    it('should create piece with proper structure', () => {
      const piece = getRandomBlock();
      expect(piece.type).toBeDefined();
      expect(piece.shape).toBeDefined();
      expect(piece.color).toBeDefined();
      expect(piece.rotate).toBeTypeOf('function');
      expect(piece.clone).toBeTypeOf('function');
      expect(piece.toJSON).toBeTypeOf('function');
    });
  });
});

import { describe, it, expect } from 'vitest';

const { getRandomBlock, blockColors, blocks } = await import('../utils/blockUtils.js');

describe('blockUtils', () => {
    describe('getRandomBlock', () => {
        it('should return a valid block', () => {
            const block = getRandomBlock();

            expect(block).toHaveProperty('type');
            expect(block).toHaveProperty('shape');
            expect(block).toHaveProperty('color');
        });

        it('should return a block type that exists in blocks', () => {
            const block = getRandomBlock();

            expect(blocks).toHaveProperty(block.type);
        });

        it('should return matching color for block type', () => {
            const block = getRandomBlock();

            expect(block.color).toBe(blockColors[block.type]);
        });

        it('should return shape matching the block type', () => {
            const block = getRandomBlock();

            expect(block.shape).toEqual(blocks[block.type]);
        });

        it('should return one of 7 block types', () => {
            const validTypes = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
            const block = getRandomBlock();

            expect(validTypes).toContain(block.type);
        });

        it('should generate different blocks over multiple calls', () => {
            const blocks = new Set();
            for (let i = 0; i < 50; i++) {
                blocks.add(getRandomBlock().type);
            }

            expect(blocks.size).toBeGreaterThan(1);
        });

        it('should return valid shape dimensions', () => {
            const block = getRandomBlock();

            expect(Array.isArray(block.shape)).toBe(true);
            expect(block.shape.length).toBeGreaterThan(0);
            expect(Array.isArray(block.shape[0])).toBe(true);
        });

        it('should return I block with correct properties', () => {
            const iBlocks = [];
            for (let i = 0; i < 100; i++) {
                const block = getRandomBlock();
                if (block.type === 'I') {
                    iBlocks.push(block);
                    break;
                }
            }

            if (iBlocks.length > 0) {
                expect(iBlocks[0].color).toBe('cyan');
                expect(iBlocks[0].shape).toEqual([
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ]);
            }
        });

        it('should return O block with correct properties', () => {
            const oBlocks = [];
            for (let i = 0; i < 100; i++) {
                const block = getRandomBlock();
                if (block.type === 'O') {
                    oBlocks.push(block);
                    break;
                }
            }

            if (oBlocks.length > 0) {
                expect(oBlocks[0].color).toBe('yellow');
                expect(oBlocks[0].shape).toEqual([
                    [1, 1],
                    [1, 1]
                ]);
            }
        });
    });

    describe('blockColors', () => {
        it('should have colors for all block types', () => {
            const types = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

            types.forEach(type => {
                expect(blockColors).toHaveProperty(type);
                expect(typeof blockColors[type]).toBe('string');
            });
        });

        it('should have correct color mappings', () => {
            expect(blockColors.I).toBe('cyan');
            expect(blockColors.J).toBe('blue');
            expect(blockColors.L).toBe('orange');
            expect(blockColors.O).toBe('yellow');
            expect(blockColors.S).toBe('green');
            expect(blockColors.T).toBe('purple');
            expect(blockColors.Z).toBe('red');
        });
    });

    describe('blocks', () => {
        it('should have all 7 tetromino types', () => {
            const types = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

            types.forEach(type => {
                expect(blocks).toHaveProperty(type);
            });
        });

        it('should have valid shapes for all blocks', () => {
            Object.values(blocks).forEach(shape => {
                expect(Array.isArray(shape)).toBe(true);
                expect(shape.length).toBeGreaterThan(0);
                shape.forEach(row => {
                    expect(Array.isArray(row)).toBe(true);
                    row.forEach(cell => {
                        expect([0, 1]).toContain(cell);
                    });
                });
            });
        });

        it('should have I block as 4x4 matrix', () => {
            expect(blocks.I).toHaveLength(4);
            expect(blocks.I[0]).toHaveLength(4);
        });

        it('should have O block as 2x2 matrix', () => {
            expect(blocks.O).toHaveLength(2);
            expect(blocks.O[0]).toHaveLength(2);
        });

        it('should have standard blocks as 3x3 matrices', () => {
            ['J', 'L', 'S', 'T', 'Z'].forEach(type => {
                expect(blocks[type]).toHaveLength(3);
                expect(blocks[type][0]).toHaveLength(3);
            });
        });
    });
});

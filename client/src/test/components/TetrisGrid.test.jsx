import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TetrisGrid from '../../components/tetrisGrid/TetrisGrid';

describe('TetrisGrid Component', () => {
    const mockGrid = Array(22).fill(null).map(() => Array(10).fill(''));

    it('should render grid correctly', () => {
        render(
            <TetrisGrid 
                displayGrid={mockGrid}
                isShaking={false}
                particles={[]}
                isGameOver={false}
            />
        );
        
        const grid = document.querySelector('.grid');
        expect(grid).toBeInTheDocument();
    });

    it('should apply shake class when shaking', () => {
        render(
            <TetrisGrid 
                displayGrid={mockGrid}
                isShaking={true}
                particles={[]}
                isGameOver={false}
            />
        );
        
        const grid = document.querySelector('.grid');
        expect(grid).toHaveClass('shake');
    });

    it('should not apply shake class when not shaking', () => {
        render(
            <TetrisGrid 
                displayGrid={mockGrid}
                isShaking={false}
                particles={[]}
                isGameOver={false}
            />
        );
        
        const grid = document.querySelector('.grid');
        expect(grid).not.toHaveClass('shake');
    });

    it('should show game over overlay when game is over', () => {
        render(
            <TetrisGrid 
                displayGrid={mockGrid}
                isShaking={false}
                particles={[]}
                isGameOver={true}
            />
        );
        
        const overlay = document.querySelector('.game-over-overlay');
        expect(overlay).toHaveClass('visible');
    });

    it('should hide game over overlay when game is not over', () => {
        render(
            <TetrisGrid 
                displayGrid={mockGrid}
                isShaking={false}
                particles={[]}
                isGameOver={false}
            />
        );
        
        const overlay = document.querySelector('.game-over-overlay');
        expect(overlay).not.toHaveClass('visible');
    });

    it('should render game over text and icon', () => {
        render(
            <TetrisGrid 
                displayGrid={mockGrid}
                isShaking={false}
                particles={[]}
                isGameOver={true}
            />
        );
        
        expect(screen.getByText('Game Over')).toBeInTheDocument();
        expect(screen.getByText('💀')).toBeInTheDocument();
    });

    it('should render correct number of rows (excluding first 2)', () => {
        render(
            <TetrisGrid 
                displayGrid={mockGrid}
                isShaking={false}
                particles={[]}
                isGameOver={false}
            />
        );
        
        const rows = document.querySelectorAll('.grid > .row');
        expect(rows).toHaveLength(20); // 22 - 2
    });

    it('should render filled cells correctly', () => {
        const gridWithColors = Array(22).fill(null).map((_, i) => 
            Array(10).fill(i < 2 ? '' : 'cyan')
        );

        render(
            <TetrisGrid 
                displayGrid={gridWithColors}
                isShaking={false}
                particles={[]}
                isGameOver={false}
            />
        );
        
        const cells = document.querySelectorAll('.cell.cyan');
        expect(cells.length).toBeGreaterThan(0);
    });

    it('should render ParticlesContainer', () => {
        const mockParticles = [
            { id: 1, x: 100, y: 200, color: 'red' },
            { id: 2, x: 150, y: 250, color: 'blue' }
        ];

        render(
            <TetrisGrid 
                displayGrid={mockGrid}
                isShaking={false}
                particles={mockParticles}
                isGameOver={false}
            />
        );
        
        // ParticlesContainer should be rendered
        expect(document.querySelector('.grid-container')).toBeInTheDocument();
    });

    it('should handle empty grid', () => {
        const emptyGrid = Array(22).fill(null).map(() => Array(10).fill(''));

        render(
            <TetrisGrid 
                displayGrid={emptyGrid}
                isShaking={false}
                particles={[]}
                isGameOver={false}
            />
        );
        
        const grid = document.querySelector('.grid');
        expect(grid).toBeInTheDocument();
    });
});

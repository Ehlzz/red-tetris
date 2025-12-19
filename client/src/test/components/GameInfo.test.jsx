import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GameInfo from '../../components/gameInfo/GameInfo';

describe('GameInfo Component', () => {
    const mockNextBlock = {
        type: 'I',
        shape: [
            [1, 1, 1, 1]
        ],
        color: 'cyan'
    };

    it('should render score correctly', () => {
        render(
            <GameInfo 
                nextBlock={mockNextBlock}
                score={1000}
                playerLevel={5}
                totalLinesCleared={10}
            />
        );
        
        expect(screen.getByText('Score : 1000')).toBeInTheDocument();
    });

    it('should render level correctly', () => {
        render(
            <GameInfo 
                nextBlock={mockNextBlock}
                score={500}
                playerLevel={3}
                totalLinesCleared={7}
            />
        );
        
        expect(screen.getByText('Level : 3')).toBeInTheDocument();
    });

    it('should render lines cleared correctly', () => {
        render(
            <GameInfo 
                nextBlock={mockNextBlock}
                score={0}
                playerLevel={1}
                totalLinesCleared={15}
            />
        );
        
        expect(screen.getByText('Line : 15')).toBeInTheDocument();
    });

    it('should render next block shape', () => {
        render(
            <GameInfo 
                nextBlock={mockNextBlock}
                score={0}
                playerLevel={1}
                totalLinesCleared={0}
            />
        );
        
        const nextBlockDiv = document.querySelector('.next-block');
        expect(nextBlockDiv).toBeInTheDocument();
        
        const rows = nextBlockDiv.querySelectorAll('.row');
        expect(rows).toHaveLength(1);
    });

    it('should render complex block shape', () => {
        const complexBlock = {
            type: 'T',
            shape: [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            color: 'purple'
        };

        render(
            <GameInfo 
                nextBlock={complexBlock}
                score={250}
                playerLevel={2}
                totalLinesCleared={5}
            />
        );
        
        const nextBlockDiv = document.querySelector('.next-block');
        const rows = nextBlockDiv.querySelectorAll('.row');
        expect(rows).toHaveLength(3);
    });

    it('should handle zero values', () => {
        render(
            <GameInfo 
                nextBlock={mockNextBlock}
                score={0}
                playerLevel={0}
                totalLinesCleared={0}
            />
        );
        
        expect(screen.getByText('Score : 0')).toBeInTheDocument();
        expect(screen.getByText('Level : 0')).toBeInTheDocument();
        expect(screen.getByText('Line : 0')).toBeInTheDocument();
    });

    it('should handle null nextBlock gracefully', () => {
        render(
            <GameInfo 
                nextBlock={null}
                score={100}
                playerLevel={1}
                totalLinesCleared={2}
            />
        );
        
        expect(screen.getByText('Score : 100')).toBeInTheDocument();
    });

    it('should render all info sections', () => {
        render(
            <GameInfo 
                nextBlock={mockNextBlock}
                score={500}
                playerLevel={3}
                totalLinesCleared={8}
            />
        );
        
        expect(document.querySelector('.info')).toBeInTheDocument();
        expect(document.querySelector('.scd-info')).toBeInTheDocument();
        expect(document.querySelector('.score-board')).toBeInTheDocument();
        expect(document.querySelector('.info-game')).toBeInTheDocument();
    });
});

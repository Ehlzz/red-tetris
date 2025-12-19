import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import GameOverSolo from '../../components/gameOverSolo/gameOverSolo';

const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('GameOverSolo Component', () => {
    const mockRestart = vi.fn();

    it('should render game over title', () => {
        renderWithRouter(
            <GameOverSolo 
                score={5000}
                totalLinesCleared={25}
                playerLevel={5}
                onRestart={mockRestart}
            />
        );
        
        expect(screen.getByText('Game Over!')).toBeInTheDocument();
    });

    it('should display final score', () => {
        renderWithRouter(
            <GameOverSolo 
                score={3500}
                totalLinesCleared={18}
                playerLevel={3}
                onRestart={mockRestart}
            />
        );
        
        expect(screen.getByText('Final Score: 3500')).toBeInTheDocument();
    });

    it('should display total lines cleared', () => {
        renderWithRouter(
            <GameOverSolo 
                score={2000}
                totalLinesCleared={12}
                playerLevel={2}
                onRestart={mockRestart}
            />
        );
        
        expect(screen.getByText('Total Lines Cleared: 12')).toBeInTheDocument();
    });

    it('should display player level', () => {
        renderWithRouter(
            <GameOverSolo 
                score={1500}
                totalLinesCleared={8}
                playerLevel={4}
                onRestart={mockRestart}
            />
        );
        
        expect(screen.getByText('Level: 4')).toBeInTheDocument();
    });

    it('should render back to home link', () => {
        renderWithRouter(
            <GameOverSolo 
                score={1000}
                totalLinesCleared={5}
                playerLevel={1}
                onRestart={mockRestart}
            />
        );
        
        const homeLink = screen.getByText('Back to Home');
        expect(homeLink).toBeInTheDocument();
        expect(homeLink).toHaveAttribute('href', '/');
    });

    it('should render play again button', () => {
        renderWithRouter(
            <GameOverSolo 
                score={1000}
                totalLinesCleared={5}
                playerLevel={1}
                onRestart={mockRestart}
            />
        );
        
        expect(screen.getByText('Play again')).toBeInTheDocument();
    });

    it('should call onRestart when play again button is clicked', async () => {
        const user = userEvent.setup();
        
        renderWithRouter(
            <GameOverSolo 
                score={1000}
                totalLinesCleared={5}
                playerLevel={1}
                onRestart={mockRestart}
            />
        );
        
        const playAgainBtn = screen.getByText('Play again');
        await user.click(playAgainBtn);
        
        expect(mockRestart).toHaveBeenCalledTimes(1);
    });

    it('should render background overlay', () => {
        const { container } = renderWithRouter(
            <GameOverSolo 
                score={1000}
                totalLinesCleared={5}
                playerLevel={1}
                onRestart={mockRestart}
            />
        );
        
        expect(container.querySelector('.background-overlay')).toBeInTheDocument();
    });

    it('should handle zero values', () => {
        renderWithRouter(
            <GameOverSolo 
                score={0}
                totalLinesCleared={0}
                playerLevel={0}
                onRestart={mockRestart}
            />
        );
        
        expect(screen.getByText('Final Score: 0')).toBeInTheDocument();
        expect(screen.getByText('Total Lines Cleared: 0')).toBeInTheDocument();
        expect(screen.getByText('Level: 0')).toBeInTheDocument();
    });
});

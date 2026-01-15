import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import GameOverMulti from '../../components/gameOverMulti/gameOverMulti';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('GameOverMulti Component', () => {
    const mockRoom = {
        id: 'room-123',
        name: 'TestRoom',
        players: [
            { id: 'p1', name: 'Player1', score: 5000, level: 5, totalColumnsCleared: 25 },
            { id: 'p2', name: 'Player2', score: 3000, level: 3, totalColumnsCleared: 15 },
            { id: 'p3', name: 'Player3', score: 1000, level: 2, totalColumnsCleared: 5 }
        ]
    };

    it('should render game over title', () => {
        renderWithRouter(
            <GameOverMulti 
                score={3000}
                totalLinesCleared={15}
                playerLevel={3}
                roomName="TestRoom"
                playerName="Player2"
                room={mockRoom}
            />
        );
        
        expect(screen.getByText('Game Over!')).toBeInTheDocument();
    });

    it('should display correct player rank', () => {
        renderWithRouter(
            <GameOverMulti 
                score={3000}
                totalLinesCleared={15}
                playerLevel={3}
                roomName="TestRoom"
                playerName="Player2"
                room={mockRoom}
            />
        );
        
        expect(screen.getByText('Your Rank: #2')).toBeInTheDocument();
    });

    it('should display winner with trophy emoji', () => {
        renderWithRouter(
            <GameOverMulti 
                score={5000}
                totalLinesCleared={25}
                playerLevel={5}
                roomName="TestRoom"
                playerName="Player1"
                room={mockRoom}
            />
        );
        
        expect(screen.getByText('🏆')).toBeInTheDocument();
    });

    it('should display all players in leaderboard', () => {
        renderWithRouter(
            <GameOverMulti 
                score={3000}
                totalLinesCleared={15}
                playerLevel={3}
                roomName="TestRoom"
                playerName="Player2"
                room={mockRoom}
            />
        );
        
        expect(screen.getByText('Player1')).toBeInTheDocument();
        expect(screen.getByText('Player2')).toBeInTheDocument();
        expect(screen.getByText('Player3')).toBeInTheDocument();
    });

    it('should display player scores', () => {
        renderWithRouter(
            <GameOverMulti 
                score={3000}
                totalLinesCleared={15}
                playerLevel={3}
                roomName="TestRoom"
                playerName="Player2"
                room={mockRoom}
            />
        );
        
        expect(screen.getByText('5000 pts')).toBeInTheDocument();
        expect(screen.getByText('3000 pts')).toBeInTheDocument();
        expect(screen.getByText('1000 pts')).toBeInTheDocument();
    });

    it('should sort players by score descending', () => {
        const { container } = renderWithRouter(
            <GameOverMulti 
                score={3000}
                totalLinesCleared={15}
                playerLevel={3}
                roomName="TestRoom"
                playerName="Player2"
                room={mockRoom}
            />
        );
        
        const items = container.querySelectorAll('.leaderboard-item');
        expect(items[0]).toHaveTextContent('Player1');
        expect(items[1]).toHaveTextContent('Player2');
        expect(items[2]).toHaveTextContent('Player3');
    });

    it('should highlight current player', () => {
        const { container } = renderWithRouter(
            <GameOverMulti 
                score={3000}
                totalLinesCleared={15}
                playerLevel={3}
                roomName="TestRoom"
                playerName="Player2"
                room={mockRoom}
            />
        );
        
        const items = container.querySelectorAll('.leaderboard-item');
        expect(items[1]).toHaveClass('current-player');
    });

    it('should handle room without players', () => {
        const emptyRoom = { id: 'room-456', name: 'EmptyRoom', players: [] };
        
        renderWithRouter(
            <GameOverMulti 
                score={0}
                totalLinesCleared={0}
                playerLevel={1}
                roomName="EmptyRoom"
                playerName="Player1"
                room={emptyRoom}
            />
        );
        
        expect(screen.getByText('Your Rank: #0')).toBeInTheDocument();
    });

    it('should handle null room', () => {
        renderWithRouter(
            <GameOverMulti 
                score={100}
                totalLinesCleared={2}
                playerLevel={1}
                roomName="TestRoom"
                playerName="Player1"
                room={null}
            />
        );
        
        expect(screen.getByText('Game Over!')).toBeInTheDocument();
    });

    it('should navigate back to lobby when back button is clicked', async () => {
        const user = userEvent.setup();
        
        renderWithRouter(
            <GameOverMulti 
                score={3000}
                totalLinesCleared={15}
                playerLevel={3}
                roomName="TestRoom"
                playerName="Player2"
                room={mockRoom}
            />
        );
        
        const backButton = screen.getByText('Back to Home');
        await user.click(backButton);
        
        expect(mockNavigate).toHaveBeenCalledWith(
            '/lobby/TestRoom/Player2',
            { state: { room: mockRoom } }
        );
    });

    it('should display player levels', () => {
        renderWithRouter(
            <GameOverMulti 
                score={3000}
                totalLinesCleared={15}
                playerLevel={3}
                roomName="TestRoom"
                playerName="Player2"
                room={mockRoom}
            />
        );
        
        expect(screen.getByText('Level 5')).toBeInTheDocument();
        expect(screen.getByText('Level 3')).toBeInTheDocument();
        expect(screen.getByText('Level 2')).toBeInTheDocument();
    });

    it('should display lines cleared', () => {
        renderWithRouter(
            <GameOverMulti 
                score={3000}
                totalLinesCleared={15}
                playerLevel={3}
                roomName="TestRoom"
                playerName="Player2"
                room={mockRoom}
            />
        );
        
        expect(screen.getByText('25 lines')).toBeInTheDocument();
        expect(screen.getByText('15 lines')).toBeInTheDocument();
        expect(screen.getByText('5 lines')).toBeInTheDocument();
    });
});

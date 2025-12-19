import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LevelUpAnimation from '../../components/levelUpAnimation/LevelUpAnimation';

describe('LevelUpAnimation Component', () => {
    it('should not render when show is false', () => {
        const { container } = render(
            <LevelUpAnimation show={false} level={5} />
        );
        
        const animation = container.querySelector('.level-up-animation');
        expect(animation).not.toBeInTheDocument();
    });

    it('should render when show is true', () => {
        render(<LevelUpAnimation show={true} level={3} />);
        
        expect(screen.getByText('LEVEL UP!')).toBeInTheDocument();
    });

    it('should display correct level number', () => {
        render(<LevelUpAnimation show={true} level={7} />);
        
        expect(screen.getByText('Level 7')).toBeInTheDocument();
    });

    it('should render sparkles emojis', () => {
        render(<LevelUpAnimation show={true} level={2} />);
        
        const sparkles = screen.getAllByText('🔥');
        expect(sparkles).toHaveLength(3);
    });

    it('should handle level 1', () => {
        render(<LevelUpAnimation show={true} level={1} />);
        
        expect(screen.getByText('Level 1')).toBeInTheDocument();
    });

    it('should handle high level numbers', () => {
        render(<LevelUpAnimation show={true} level={99} />);
        
        expect(screen.getByText('Level 99')).toBeInTheDocument();
    });

    it('should render all required elements', () => {
        const { container } = render(<LevelUpAnimation show={true} level={5} />);
        
        expect(container.querySelector('.level-up-animation')).toBeInTheDocument();
        expect(container.querySelector('.level-up-content')).toBeInTheDocument();
        expect(container.querySelector('.level-up-sparkles')).toBeInTheDocument();
    });
});

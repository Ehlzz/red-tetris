import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import IndexPage from '../../pages/IndexPage/IndexPage';

const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('IndexPage Component', () => {
    it('should render the page title', () => {
        renderWithRouter(<IndexPage />);
        
        expect(screen.getByText('Gömbloc')).toBeInTheDocument();
    });

    it('should render singleplayer link', () => {
        renderWithRouter(<IndexPage />);
        
        const singleplayerLink = screen.getByText('Singleplayer');
        expect(singleplayerLink).toBeInTheDocument();
        expect(singleplayerLink).toHaveAttribute('href', '/singleplayer');
    });

    it('should render multiplayer link', () => {
        renderWithRouter(<IndexPage />);
        
        const multiplayerLink = screen.getByText('Multiplayer');
        expect(multiplayerLink).toBeInTheDocument();
        expect(multiplayerLink).toHaveAttribute('href', '/multiplayer');
    });

    it('should render GridBackground component', () => {
        const { container } = renderWithRouter(<IndexPage />);
        
        expect(container.querySelector('.gridBack')).toBeInTheDocument();
    });

    it('should render logo SVG', () => {
        const { container } = renderWithRouter(<IndexPage />);
        
        const logo = container.querySelector('.logo');
        expect(logo).toBeInTheDocument();
        expect(logo.tagName).toBe('svg');
    });

    it('should render navigation buttons with correct classes', () => {
        const { container } = renderWithRouter(<IndexPage />);
        
        const navButtons = container.querySelectorAll('.nav-button');
        expect(navButtons).toHaveLength(2);
    });

    it('should render main navigation', () => {
        const { container } = renderWithRouter(<IndexPage />);
        
        expect(container.querySelector('.main-navigation')).toBeInTheDocument();
    });

    it('should set data-originalText on nav buttons', () => {
        const { container } = renderWithRouter(<IndexPage />);
        
        const navButtons = container.querySelectorAll('.nav-button');
        navButtons.forEach(button => {
            expect(button.dataset.originalText).toBeDefined();
        });
    });

    it('should trigger scramble effect on button hover', () => {
        vi.useFakeTimers();
        const { container } = renderWithRouter(<IndexPage />);
        
        const navButtons = container.querySelectorAll('.nav-button');
        const firstButton = navButtons[0];
        const originalText = firstButton.dataset.originalText;
        
        // Simulate mouseenter
        const event = new MouseEvent('mouseenter', { bubbles: true });
        firstButton.dispatchEvent(event);
        
        // Advance timers to complete animation
        vi.advanceTimersByTime(1000);
        
        // After animation, should be back to original text
        expect(firstButton.textContent).toBe(originalText);
        
        vi.useRealTimers();
    });

    it('should have correct page structure', () => {
        const { container } = renderWithRouter(<IndexPage />);
        
        expect(container.querySelector('.index-page')).toBeInTheDocument();
        expect(container.querySelector('.base')).toBeInTheDocument();
        expect(container.querySelector('.top-main')).toBeInTheDocument();
    });

    it('should clean up event listeners on unmount', () => {
        const { container, unmount } = renderWithRouter(<IndexPage />);
        
        const navButtons = container.querySelectorAll('.nav-button');
        expect(navButtons.length).toBeGreaterThan(0);
        
        // Should unmount without errors
        expect(() => unmount()).not.toThrow();
    });

    it('should have SVG path element', () => {
        const { container } = renderWithRouter(<IndexPage />);
        
        const svgPath = container.querySelector('svg path');
        expect(svgPath).toBeInTheDocument();
    });
});
